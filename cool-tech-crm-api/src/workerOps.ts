/**
 * Field Worker Operations Endpoints for cool-tech-crm-api
 * 
 * Manages:
 * - Worker Attendance & Shift Clock-In/Clock-Out
 * - Worker Timesheets & Job Hours
 * - Worker Material Requests & Approvals
 * 
 * Protected with authMiddleware & RBAC
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  WorkerAttendanceRow,
  WorkerTimesheetRow,
  MaterialRequestRow,
} from './types.ts';
import { authMiddleware } from './auth.ts';

const workerOpsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

workerOpsApp.use('*', authMiddleware);

// ============================================================================
// 1. WORKER ATTENDANCE ENDPOINTS
// ============================================================================

// GET /attendance - Get today's attendance for current worker or specified date
workerOpsApp.get('/attendance', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const dateParam = (url.searchParams.get('date') || '').trim();
  const workerIdParam = (url.searchParams.get('workerId') || '').trim();
  const targetDate = dateParam || new Date().toISOString().split('T')[0];

  // RBAC: employees can only check their own attendance; managers/admins can query any
  const targetWorkerId = (user.role === 'EMPLOYEE' || !workerIdParam) ? user.id : workerIdParam;

  const attendance = await db
    .prepare('SELECT * FROM worker_attendance WHERE worker_id = ? AND date = ? ORDER BY created_at DESC LIMIT 1')
    .bind(targetWorkerId, targetDate)
    .first<WorkerAttendanceRow>();

  if (!attendance) {
    // Return empty state
    return c.json({
      success: true,
      attendance: {
        isClockedIn: false,
        clockInTime: null,
        clockOutTime: null,
        activeDurationSeconds: 0,
        currentLocation: 'Field Office',
        todayDate: targetDate,
        breakDurationMinutes: 0,
      },
    });
  }

  return c.json({
    success: true,
    attendance: {
      id: attendance.id,
      workerId: attendance.worker_id,
      workerName: attendance.worker_name,
      isClockedIn: Boolean(attendance.is_clocked_in),
      clockInTime: attendance.clock_in_time,
      clockOutTime: attendance.clock_out_time,
      activeDurationSeconds: attendance.active_duration_seconds,
      breakDurationMinutes: attendance.break_duration_minutes,
      currentLocation: attendance.current_location,
      todayDate: attendance.date,
    },
  });
});

// POST /attendance/clock-in - Clock in
workerOpsApp.post('/attendance/clock-in', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any = {};
  try {
    body = await c.req.json();
  } catch {}

  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const location = body.location || body.currentLocation || 'Downtown Dubai Depot & Field Unit';

  // Check if record exists for today
  const existing = await db
    .prepare('SELECT * FROM worker_attendance WHERE worker_id = ? AND date = ?')
    .bind(user.id, todayDate)
    .first<WorkerAttendanceRow>();

  const recordId = existing ? existing.id : `att_${Date.now()}`;
  const nowIso = now.toISOString();

  if (existing) {
    await db
      .prepare(`
        UPDATE worker_attendance SET
          is_clocked_in = 1,
          clock_in_time = COALESCE(clock_in_time, ?),
          clock_out_time = NULL,
          current_location = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(timeStr, location, nowIso, existing.id)
      .run();
  } else {
    await db
      .prepare(`
        INSERT INTO worker_attendance (
          id, worker_id, worker_name, date, clock_in_time, active_duration_seconds,
          break_duration_minutes, current_location, is_clocked_in, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, 1, ?, ?)
      `)
      .bind(recordId, user.id, user.full_name, todayDate, timeStr, location, nowIso, nowIso)
      .run();
  }

  const updated = await db.prepare('SELECT * FROM worker_attendance WHERE id = ?').bind(recordId).first<WorkerAttendanceRow>();

  return c.json({
    success: true,
    message: 'Clocked in successfully',
    attendance: {
      id: updated?.id,
      isClockedIn: true,
      clockInTime: updated?.clock_in_time,
      currentLocation: updated?.current_location,
      todayDate,
      activeDurationSeconds: updated?.active_duration_seconds || 0,
      breakDurationMinutes: updated?.break_duration_minutes || 0,
    },
  });
});

// POST /attendance/clock-out - Clock out
workerOpsApp.post('/attendance/clock-out', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const existing = await db
    .prepare('SELECT * FROM worker_attendance WHERE worker_id = ? AND date = ?')
    .bind(user.id, todayDate)
    .first<WorkerAttendanceRow>();

  if (!existing) {
    return c.json({ success: false, message: 'No active attendance record found for today' }, 404);
  }

  await db
    .prepare(`
      UPDATE worker_attendance SET
        is_clocked_in = 0,
        clock_out_time = ?,
        updated_at = ?
      WHERE id = ?
    `)
    .bind(timeStr, now.toISOString(), existing.id)
    .run();

  const updated = await db.prepare('SELECT * FROM worker_attendance WHERE id = ?').bind(existing.id).first<WorkerAttendanceRow>();

  return c.json({
    success: true,
    message: 'Clocked out successfully',
    attendance: {
      id: updated?.id,
      isClockedIn: false,
      clockInTime: updated?.clock_in_time,
      clockOutTime: updated?.clock_out_time,
      currentLocation: updated?.current_location,
      todayDate,
      activeDurationSeconds: updated?.active_duration_seconds || 0,
      breakDurationMinutes: updated?.break_duration_minutes || 0,
    },
  });
});

// ============================================================================
// 2. WORKER TIMESHEETS ENDPOINTS
// ============================================================================

// GET /timesheets - List timesheet entries
workerOpsApp.get('/timesheets', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const workerIdParam = (url.searchParams.get('workerId') || '').trim();
  const statusParam = (url.searchParams.get('status') || '').trim();
  const dateParam = (url.searchParams.get('date') || '').trim();

  let query = 'SELECT * FROM worker_timesheets WHERE 1=1';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (user.role === 'EMPLOYEE') {
    conditions.push('worker_id = ?');
    bindings.push(user.id);
  } else if (workerIdParam) {
    conditions.push('worker_id = ?');
    bindings.push(workerIdParam);
  }

  if (statusParam && statusParam !== 'All') {
    conditions.push('status = ?');
    bindings.push(statusParam);
  }

  if (dateParam) {
    conditions.push('date = ?');
    bindings.push(dateParam);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date DESC, created_at DESC LIMIT 100';

  const rows = await db.prepare(query).bind(...bindings).all<WorkerTimesheetRow>();

  return c.json({
    success: true,
    timesheets: (rows.results || []).map((row) => ({
      id: row.id,
      workerId: row.worker_id,
      workerName: row.worker_name,
      taskId: row.task_id,
      taskNumber: row.task_number || '',
      taskTitle: row.task_title || '',
      clientName: row.client_name || '',
      date: row.date,
      regularHours: row.regular_hours,
      overtimeHours: row.overtime_hours,
      workSummary: row.work_summary || '',
      status: row.status,
      approvedById: row.approved_by_id,
      createdAt: row.created_at,
    })),
  });
});

// POST /timesheets - Add timesheet entry
workerOpsApp.post('/timesheets', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON' }, 400);
  }

  const id = body.id || `ts_${Date.now()}`;
  const date = body.date || new Date().toISOString().split('T')[0];
  const regularHours = Number(body.regularHours) || 0;
  const overtimeHours = Number(body.overtimeHours) || 0;
  const workSummary = body.workSummary || body.work_summary || '';
  const taskNumber = body.taskNumber || body.task_number || '';
  const taskTitle = body.taskTitle || body.task_title || '';
  const clientName = body.clientName || body.client_name || '';
  const taskId = body.taskId || body.task_id || null;
  const status = body.status || 'Submitted';
  const now = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO worker_timesheets (
        id, worker_id, worker_name, task_id, task_number, task_title, client_name,
        date, regular_hours, overtime_hours, work_summary, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id, user.id, user.full_name, taskId, taskNumber, taskTitle, clientName,
      date, regularHours, overtimeHours, workSummary, status, now, now
    )
    .run();

  const created = await db.prepare('SELECT * FROM worker_timesheets WHERE id = ?').bind(id).first<WorkerTimesheetRow>();

  return c.json({
    success: true,
    timesheet: created,
    message: 'Timesheet entry added successfully',
  }, 201);
});

// PATCH /timesheets/:id/status - Approve/Reject Timesheet (Managers/Admins)
workerOpsApp.patch('/timesheets/:id/status', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Only managers or admins can approve timesheets' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON' }, 400);
  }

  const status = body.status;
  if (!['Approved', 'Rejected', 'Pending Review'].includes(status)) {
    return c.json({ success: false, message: 'Invalid status' }, 400);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE worker_timesheets SET status = ?, approved_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(status, user.id, now, id)
    .run();

  return c.json({
    success: true,
    message: `Timesheet ${status} successfully`,
  });
});

// ============================================================================
// 3. MATERIAL REQUESTS ENDPOINTS
// ============================================================================

// GET /material-requests - List material requests
workerOpsApp.get('/material-requests', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const statusParam = (url.searchParams.get('status') || '').trim();

  let query = 'SELECT * FROM material_requests WHERE 1=1';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (user.role === 'EMPLOYEE') {
    conditions.push('worker_id = ?');
    bindings.push(user.id);
  }

  if (statusParam && statusParam !== 'All') {
    conditions.push('status = ?');
    bindings.push(statusParam);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC LIMIT 100';

  const rows = await db.prepare(query).bind(...bindings).all<MaterialRequestRow>();

  return c.json({
    success: true,
    requests: (rows.results || []).map((row) => ({
      id: row.id,
      requestNumber: row.request_number,
      workerId: row.worker_id,
      workerName: row.worker_name,
      taskId: row.task_id,
      taskNumber: row.task_number,
      itemCode: row.item_code,
      itemName: row.item_name,
      category: row.category || 'Spare Parts',
      quantity: row.quantity,
      unit: row.unit,
      urgency: row.urgency,
      status: row.status,
      notes: row.notes,
      approvedById: row.approved_by_id,
      requestedAt: row.created_at,
    })),
  });
});

// POST /material-requests - Create material request
workerOpsApp.post('/material-requests', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON' }, 400);
  }

  const id = body.id || `req_${Date.now()}`;
  const requestNumber = body.requestNumber || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const itemCode = (body.itemCode || body.item_code || 'GEN-PART').trim();
  const itemName = (body.itemName || body.item_name || 'General HVAC Part').trim();
  const category = body.category || 'General';
  const quantity = Number(body.quantity) || 1;
  const unit = body.unit || 'Pcs';
  const urgency = body.urgency || 'Standard';
  const status = body.status || 'Pending Approval';
  const notes = body.notes || '';
  const taskId = body.taskId || body.task_id || null;
  const taskNumber = body.taskNumber || body.task_number || null;
  const now = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO material_requests (
        id, request_number, worker_id, worker_name, task_id, task_number,
        item_code, item_name, category, quantity, unit, urgency, status, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id, requestNumber, user.id, user.full_name, taskId, taskNumber,
      itemCode, itemName, category, quantity, unit, urgency, status, notes,
      now, now
    )
    .run();

  const created = await db.prepare('SELECT * FROM material_requests WHERE id = ?').bind(id).first<MaterialRequestRow>();

  return c.json({
    success: true,
    request: created,
    message: 'Material request submitted successfully',
  }, 201);
});

// PATCH /material-requests/:id/status - Approve/Reject Material Request
workerOpsApp.patch('/material-requests/:id/status', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Only managers or admins can update material request status' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON' }, 400);
  }

  const status = body.status;
  if (!['Approved', 'Rejected', 'Dispatched', 'Collected', 'Pending Approval'].includes(status)) {
    return c.json({ success: false, message: 'Invalid status' }, 400);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE material_requests SET status = ?, approved_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(status, user.id, now, id)
    .run();

  return c.json({
    success: true,
    message: `Material request ${status} successfully`,
  });
});

export default workerOpsApp;
export { workerOpsApp };
