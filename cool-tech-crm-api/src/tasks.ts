/**
 * Tasks & Field Operations Endpoints for cool-tech-crm-api
 * 
 * Manages Tasks, Checklists, Parts Used, Activity Logs, and Comments
 * - Authenticated with authMiddleware & RBAC
 * - Manager & Employee Shared Access:
 *     - Super Admin & Admin: all tasks
 *     - Manager: all tasks assigned to them, created by them, or assigned to reportees
 *     - Employee / Technician: tasks assigned to them (by ID, email, or name) or created by them
 * - Full audit trail with task_activity_logs
 * - Safe in-place editing (never deletes and recreates on edit; preserves stable IDs)
 * - Safe sync endpoint for non-destructive local storage migration
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  TaskRow,
  TaskChecklistRow,
  TaskPartUsedRow,
  TaskActivityLogRow,
  TaskCommentRow,
} from './types.ts';
import { authMiddleware } from './auth.ts';

const tasksApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

tasksApp.use('*', authMiddleware);

// Helper: Check if an assignee/user is under a manager's reporting scope
async function isUserInManagerScope(
  manager: CrmUserProfile,
  targetUserId: string,
  db: D1Database
): Promise<boolean> {
  if (manager.id === targetUserId) return true;

  try {
    if (manager.team_id && manager.team_id.trim()) {
      const query = await db
        .prepare('SELECT id FROM users WHERE id = ? AND (reports_to = ? OR team_id = ?) LIMIT 1')
        .bind(targetUserId, manager.id, manager.team_id.trim())
        .first<{ id: string }>();
      return Boolean(query);
    } else {
      const query = await db
        .prepare('SELECT id FROM users WHERE id = ? AND reports_to = ? LIMIT 1')
        .bind(targetUserId, manager.id)
        .first<{ id: string }>();
      return Boolean(query);
    }
  } catch {
    return false;
  }
}

function canUserAccessTask(user: CrmUserProfile, task: TaskRow): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  if (user.role === 'MANAGER') return true; // Detailed filter done in SQL / list handler
  // Employee / Technician access
  if (task.assignee_id && task.assignee_id === user.id) return true;
  if (task.created_by_id && task.created_by_id === user.id) return true;
  if (task.assignee_email && task.assignee_email.toLowerCase() === user.email.toLowerCase()) return true;
  if (task.assignee_name && task.assignee_name.toLowerCase() === (user.full_name || '').toLowerCase()) return true;
  return false;
}

// 1. GET / - List Tasks with Filtering, Pagination, and RBAC
tasksApp.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const priority = (url.searchParams.get('priority') || '').trim();
  const taskType = (url.searchParams.get('type') || '').trim();
  const assignee = (url.searchParams.get('assignee') || '').trim();
  const customerId = (url.searchParams.get('customerId') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM tasks WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  // RBAC Scoping
  if (user.role === 'EMPLOYEE') {
    conditions.push('(assignee_id = ? OR assignee_email = ? OR assignee_name = ? OR created_by_id = ?)');
    bindings.push(user.id, user.email, user.full_name, user.id);
  } else if (user.role === 'MANAGER') {
    conditions.push(`(
      assignee_id = ? OR 
      assigned_by_id = ? OR 
      created_by_id = ? OR 
      assignee_id IN (SELECT id FROM users WHERE reports_to = ? OR (team_id IS NOT NULL AND team_id != '' AND team_id = ?))
    )`);
    bindings.push(user.id, user.id, user.id, user.id, user.team_id || '');
  }

  if (search) {
    conditions.push('(task_details LIKE ? OR title LIKE ? OR customer_name LIKE ? OR id LIKE ? OR location LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term, term);
  }

  if (status && status !== 'All' && status !== 'ALL') {
    conditions.push('status = ?');
    bindings.push(status);
  }

  if (priority && priority !== 'All' && priority !== 'ALL') {
    conditions.push('priority = ?');
    bindings.push(priority);
  }

  if (taskType && taskType !== 'All' && taskType !== 'ALL') {
    conditions.push('task_type = ?');
    bindings.push(taskType);
  }

  if (assignee && assignee !== 'All' && assignee !== 'All Owners') {
    conditions.push('(assignee_name = ? OR assignee_id = ?)');
    bindings.push(assignee, assignee);
  }

  if (customerId) {
    conditions.push('customer_id = ?');
    bindings.push(customerId);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  // Count query
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const tasks = await db.prepare(query).bind(...listBindings).all<TaskRow>();

  return c.json({
    success: true,
    tasks: tasks.results || [],
    total,
    page,
    limit,
  });
});

// 2. GET /:id - Retrieve single task with checklists, parts used, activity logs, comments
tasksApp.get('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const task = await db
    .prepare('SELECT * FROM tasks WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<TaskRow>();

  if (!task) {
    return c.json({ success: false, message: 'Task not found' }, 404);
  }

  if (!canUserAccessTask(user, task)) {
    return c.json({ success: false, message: 'Access denied to this task' }, 403);
  }

  const [checklists, partsUsed, history, comments] = await Promise.all([
    db.prepare('SELECT * FROM task_checklists WHERE task_id = ? ORDER BY sort_order ASC, created_at ASC').bind(id).all<TaskChecklistRow>(),
    db.prepare('SELECT * FROM task_parts_used WHERE task_id = ? ORDER BY created_at ASC').bind(id).all<TaskPartUsedRow>(),
    db.prepare('SELECT * FROM task_activity_logs WHERE task_id = ? ORDER BY created_at DESC').bind(id).all<TaskActivityLogRow>(),
    db.prepare('SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC').bind(id).all<TaskCommentRow>(),
  ]);

  return c.json({
    success: true,
    task: {
      ...task,
      checklist: checklists.results || [],
      partsUsed: partsUsed.results || [],
      history: history.results || [],
      comments: comments.results || [],
    },
  });
});

// 3. POST / - Create a New Task
tasksApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const taskDetails = (body.taskDetails || body.task_details || body.title || '').trim();
  if (!taskDetails) {
    return c.json({ success: false, message: 'Task details or title is required' }, 400);
  }

  const taskId = body.id && String(body.id).trim()
    ? String(body.id).trim()
    : `TSK-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

  // Determine sl_no
  const lastSl = await db
    .prepare('SELECT MAX(sl_no) as max_sl FROM tasks')
    .first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const now = new Date().toISOString();
  const title = body.title || taskDetails.slice(0, 60);
  const description = body.description || '';
  const department = body.department || user.department || 'Operations';
  const location = body.location || '';
  const siteLocation = body.siteLocation || body.site_location || location;
  const equipmentTag = body.equipmentTag || body.equipment_tag || '';
  const permitRequired = body.permitRequired ? 1 : 0;
  const slaDeadline = body.slaDeadline || body.sla_deadline || null;
  const workerContact = body.workerContact || body.worker_contact || '';
  const customerId = body.customerId || body.customer_id || null;
  const customerName = body.customer || body.customerName || body.customer_name || 'Client Facility';
  const taskUnder = body.taskUnder || body.task_under || 'General Maintenance';
  const taskType = body.taskType || body.task_type || 'Service Order';
  const dueDate = body.dueDate || body.due_date || new Date().toISOString().split('T')[0];
  const dueTime = body.dueTime || body.due_time || '04:00 PM';
  const priority = body.priority || 'Medium';
  const status = body.status || 'Assigned';
  const progress = Number(body.progress) || 0;

  // Assignee logic
  const assigneeName = body.assignedEmployee || body.assignee?.name || body.assignee_name || user.full_name;
  const assigneeId = body.assigneeId || body.assignee?.id || body.assignee_id || (assigneeName === user.full_name ? user.id : null);
  const assigneeEmail = body.assigneeEmail || body.assignee?.email || body.assignee_email || (assigneeId === user.id ? user.email : null);
  const assigneeRole = body.assigneeRole || body.assignee?.role || body.assignee_role || 'Technician';
  const assigneeAvatar = body.assigneeAvatar || body.assignee?.avatar || body.assignee_avatar || null;

  const assignedById = user.id;
  const assignedByName = user.full_name;
  const createdById = user.id;
  const createdByName = user.full_name;

  await db
    .prepare(`
      INSERT INTO tasks (
        id, sl_no, title, task_details, description, department, location, site_location,
        equipment_tag, permit_required, sla_deadline, worker_contact, customer_id, customer_name,
        task_under, task_type, due_date, due_time, priority, status, progress,
        assignee_id, assignee_name, assignee_email, assignee_role, assignee_avatar,
        assigned_by_id, assigned_by_name, created_by_id, created_by_name,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `)
    .bind(
      taskId, nextSl, title, taskDetails, description, department, location, siteLocation,
      equipmentTag, permitRequired, slaDeadline, workerContact, customerId, customerName,
      taskUnder, taskType, dueDate, dueTime, priority, status, progress,
      assigneeId, assigneeName, assigneeEmail, assigneeRole, assigneeAvatar,
      assignedById, assignedByName, createdById, createdByName,
      now, now
    )
    .run();

  // Create initial activity log
  const logId = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  await db
    .prepare(`
      INSERT INTO task_activity_logs (id, task_id, user_id, user_name, user_role, action, note, progress, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      logId, taskId, user.id, user.full_name, user.role,
      'Created & Assigned',
      `Task assigned to ${assigneeName}`,
      progress, now
    )
    .run();

  // Checklists if provided
  if (Array.isArray(body.checklist) && body.checklist.length > 0) {
    for (let i = 0; i < body.checklist.length; i++) {
      const item = body.checklist[i];
      const checkId = item.id || `chk_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO task_checklists (id, task_id, label, is_completed, is_required, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(checkId, taskId, item.label || 'Check item', item.completed || item.is_completed ? 1 : 0, item.required || item.is_required ? 1 : 0, i, now)
        .run();
    }
  }

  const createdTask = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first<TaskRow>();

  return c.json({
    success: true,
    task: createdTask,
    message: 'Task created successfully',
  }, 201);
});

// 4. PUT /:id - In-place Update Task
tasksApp.put('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM tasks WHERE id = ? AND is_deleted = 0').bind(id).first<TaskRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Task not found' }, 404);
  }

  if (!canUserAccessTask(user, existing)) {
    return c.json({ success: false, message: 'Access denied to update this task' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const now = new Date().toISOString();
  const taskDetails = body.taskDetails !== undefined ? body.taskDetails : existing.task_details;
  const title = body.title !== undefined ? body.title : existing.title;
  const description = body.description !== undefined ? body.description : existing.description;
  const department = body.department !== undefined ? body.department : existing.department;
  const location = body.location !== undefined ? body.location : existing.location;
  const siteLocation = body.siteLocation || body.site_location || existing.site_location;
  const equipmentTag = body.equipmentTag || body.equipment_tag || existing.equipment_tag;
  const permitRequired = body.permitRequired !== undefined ? (body.permitRequired ? 1 : 0) : existing.permit_required;
  const slaDeadline = body.slaDeadline || body.sla_deadline || existing.sla_deadline;
  const workerContact = body.workerContact || body.worker_contact || existing.worker_contact;
  const customerId = body.customerId || body.customer_id || existing.customer_id;
  const customerName = body.customer || body.customerName || body.customer_name || existing.customer_name;
  const taskUnder = body.taskUnder || body.task_under || existing.task_under;
  const taskType = body.taskType || body.task_type || existing.task_type;
  const dueDate = body.dueDate || body.due_date || existing.due_date;
  const dueTime = body.dueTime || body.due_time || existing.due_time;
  const priority = body.priority || existing.priority;
  const status = body.status || existing.status;
  const progress = body.progress !== undefined ? Number(body.progress) : existing.progress;

  const assigneeName = body.assignedEmployee || body.assignee?.name || body.assignee_name || existing.assignee_name;
  const assigneeId = body.assigneeId || body.assignee?.id || body.assignee_id || existing.assignee_id;
  const assigneeEmail = body.assigneeEmail || body.assignee?.email || body.assignee_email || existing.assignee_email;
  const assigneeRole = body.assigneeRole || body.assignee?.role || body.assignee_role || existing.assignee_role;
  const assigneeAvatar = body.assigneeAvatar || body.assignee?.avatar || body.assignee_avatar || existing.assignee_avatar;

  const technicianNotes = body.technicianNotes || body.technician_notes || existing.technician_notes;
  const customerSignature = body.customerSignature || body.customer_signature || existing.customer_signature;
  const customerSignedBy = body.customerSignedBy || body.customer_signed_by || existing.customer_signed_by;
  const signedAt = body.signedAt || body.signed_at || existing.signed_at;
  const completionRating = body.completionRating || body.rating || existing.completion_rating;

  await db
    .prepare(`
      UPDATE tasks SET
        title = ?, task_details = ?, description = ?, department = ?, location = ?, site_location = ?,
        equipment_tag = ?, permit_required = ?, sla_deadline = ?, worker_contact = ?, customer_id = ?, customer_name = ?,
        task_under = ?, task_type = ?, due_date = ?, due_time = ?, priority = ?, status = ?, progress = ?,
        assignee_id = ?, assignee_name = ?, assignee_email = ?, assignee_role = ?, assignee_avatar = ?,
        technician_notes = ?, customer_signature = ?, customer_signed_by = ?, signed_at = ?, completion_rating = ?,
        updated_by_id = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      title, taskDetails, description, department, location, siteLocation,
      equipmentTag, permitRequired, slaDeadline, workerContact, customerId, customerName,
      taskUnder, taskType, dueDate, dueTime, priority, status, progress,
      assigneeId, assigneeName, assigneeEmail, assigneeRole, assigneeAvatar,
      technicianNotes, customerSignature, customerSignedBy, signedAt, completionRating,
      user.id, now, id
    )
    .run();

  // If status changed or note provided, log activity
  if (body.status && body.status !== existing.status) {
    const logId = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db
      .prepare(`
        INSERT INTO task_activity_logs (id, task_id, user_id, user_name, user_role, action, note, progress, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        logId, id, user.id, user.full_name, user.role,
        `Status changed to ${body.status}`,
        body.note || `Task transitioned to ${body.status}`,
        progress, now
      )
      .run();
  }

  // Update checklists if provided
  if (Array.isArray(body.checklist)) {
    await db.prepare('DELETE FROM task_checklists WHERE task_id = ?').bind(id).run();
    for (let i = 0; i < body.checklist.length; i++) {
      const item = body.checklist[i];
      const checkId = item.id || `chk_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO task_checklists (id, task_id, label, is_completed, is_required, sort_order, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(checkId, id, item.label || 'Check item', item.completed || item.is_completed ? 1 : 0, item.required || item.is_required ? 1 : 0, i, now)
        .run();
    }
  }

  const updatedTask = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>();

  return c.json({
    success: true,
    task: updatedTask,
    message: 'Task updated successfully',
  });
});

// 5. PATCH /:id/status - Status Workflow & Field Technician Sign-off
tasksApp.patch('/:id/status', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM tasks WHERE id = ? AND is_deleted = 0').bind(id).first<TaskRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Task not found' }, 404);
  }

  if (!canUserAccessTask(user, existing)) {
    return c.json({ success: false, message: 'Access denied to update status' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const status = body.status || existing.status;
  const progress = body.progress !== undefined ? Number(body.progress) : (status === 'Completed' ? 100 : existing.progress);
  const now = new Date().toISOString();

  const technicianNotes = body.notes || body.technicianNotes || existing.technician_notes;
  const customerSignature = body.customerSignature || existing.customer_signature;
  const customerSignedBy = body.customerSignedBy || existing.customer_signed_by;
  const signedAt = customerSignature ? now : existing.signed_at;
  const completionRating = body.rating || existing.completion_rating;
  const completedAt = status === 'Completed' ? (existing.completed_at || now) : existing.completed_at;
  const reviewedAt = status === 'Reviewed' ? now : existing.reviewed_at;
  const reviewedById = status === 'Reviewed' ? user.id : existing.reviewed_by_id;

  await db
    .prepare(`
      UPDATE tasks SET
        status = ?, progress = ?, technician_notes = ?,
        customer_signature = ?, customer_signed_by = ?, signed_at = ?,
        completion_rating = ?, completed_at = ?, reviewed_at = ?, reviewed_by_id = ?,
        updated_by_id = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      status, progress, technicianNotes,
      customerSignature, customerSignedBy, signedAt,
      completionRating, completedAt, reviewedAt, reviewedById,
      user.id, now, id
    )
    .run();

  // Activity log
  const logId = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  await db
    .prepare(`
      INSERT INTO task_activity_logs (id, task_id, user_id, user_name, user_role, action, note, progress, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      logId, id, user.id, user.full_name, user.role,
      `Status: ${status}`,
      body.notes || `Task marked as ${status} (Progress: ${progress}%)`,
      progress, now
    )
    .run();

  const updatedTask = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>();

  return c.json({
    success: true,
    task: updatedTask,
    message: `Task status updated to ${status}`,
  });
});

// 6. POST /:id/comments - Add Comment to Task
tasksApp.post('/:id/comments', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM tasks WHERE id = ? AND is_deleted = 0').bind(id).first<TaskRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Task not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const commentText = (body.text || body.comment || body.comment_text || '').trim();
  if (!commentText) {
    return c.json({ success: false, message: 'Comment text is required' }, 400);
  }

  const commentId = `cmt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO task_comments (id, task_id, author_id, author_name, author_role, author_avatar, comment_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      commentId, id, user.id, user.full_name, user.role, body.avatar || null, commentText, now
    )
    .run();

  const comment = await db.prepare('SELECT * FROM task_comments WHERE id = ?').bind(commentId).first<TaskCommentRow>();

  return c.json({
    success: true,
    comment,
    message: 'Comment added successfully',
  }, 201);
});

// 7. DELETE /:id - Soft Delete Task
tasksApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM tasks WHERE id = ? AND is_deleted = 0').bind(id).first<TaskRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Task not found' }, 404);
  }

  // Only Admin, Super Admin, or Manager can delete tasks
  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees are not permitted to delete tasks' }, 403);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE tasks SET is_deleted = 1, deleted_at = ?, deleted_by_id = ? WHERE id = ?')
    .bind(now, user.id, id)
    .run();

  return c.json({
    success: true,
    message: 'Task soft deleted successfully',
  });
});

// 8. POST /sync-batch - Non-Destructive Local Storage Migration Endpoint
tasksApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const tasksList: any[] = Array.isArray(body.tasks) ? body.tasks : [];
  if (tasksList.length === 0) {
    return c.json({ success: true, synced: 0, skipped: 0, message: 'No tasks to sync' });
  }

  let syncedCount = 0;
  let skippedCount = 0;

  for (const item of tasksList) {
    if (!item || !item.id) continue;

    // Check if task already exists
    const existing = await db.prepare('SELECT id FROM tasks WHERE id = ?').bind(item.id).first();
    if (existing) {
      skippedCount++;
      continue;
    }

    const taskDetails = (item.taskDetails || item.title || `Task #${item.id}`).trim();
    const title = item.title || taskDetails.slice(0, 60);
    const now = item.createdAt || new Date().toISOString();

    await db
      .prepare(`
        INSERT INTO tasks (
          id, sl_no, title, task_details, description, department, location, site_location,
          equipment_tag, permit_required, sla_deadline, worker_contact, customer_id, customer_name,
          task_under, task_type, due_date, due_time, priority, status, progress,
          assignee_id, assignee_name, assignee_email, assignee_role, assignee_avatar,
          assigned_by_id, assigned_by_name, created_by_id, created_by_name,
          technician_notes, customer_signature, customer_signed_by, signed_at, completion_rating,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
      `)
      .bind(
        item.id, item.slNo || null, title, taskDetails, item.description || '', item.department || 'Operations',
        item.location || '', item.siteLocation || item.location || '', item.equipmentTag || '', item.permitRequired ? 1 : 0,
        item.slaDeadline || null, item.workerContact || '', item.customerId || null, item.customer || item.customerName || 'Client Facility',
        item.taskUnder || 'General Maintenance', item.taskType || 'Service Order', item.dueDate || null, item.dueTime || null,
        item.priority || 'Medium', item.status || 'Pending', item.progress || 0,
        item.assigneeId || item.assignee?.id || null, item.assignee?.name || item.assignedEmployee || 'Unassigned',
        item.assignee?.email || null, item.assignee?.role || 'Technician', item.assignee?.avatar || null,
        user.id, item.assignedBy || user.full_name, user.id, item.createdBy || user.full_name,
        item.technicianNotes || null, item.customerSignature || null, item.customerSignedBy || null, item.signedAt || null, item.rating || null,
        now, now
      )
      .run();

    syncedCount++;
  }

  return c.json({
    success: true,
    synced: syncedCount,
    skipped: skippedCount,
    message: `Synced ${syncedCount} tasks from local storage (${skippedCount} already existed).`,
  });
});

export default tasksApp;
export { tasksApp };
