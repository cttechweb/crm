/**
 * Lead Management Endpoints for cool-tech-crm-api
 * 
 * - Full CRUD: GET /, POST /, GET /:id, PUT /:id, PATCH /:id/status, DELETE /:id
 * - Strict authentication via authMiddleware (Firebase ID Token)
 * - Server-side Role-Based Access Control (RBAC):
 *     - SUPER_ADMIN / ADMIN: Company-wide access, full CRUD & soft-delete
 *     - MANAGER: Team/reporting-scope access, create/edit, no deletion
 *     - EMPLOYEE: Own-records only (owner_id / created_by_id), no deletion
 * - Input validation & parameterized SQL (zero raw string concatenation)
 * - Soft deletion only (is_deleted = 1, deleted_at, deleted_by_id)
 * - Full Activity Log & Notes support (lead_activity_logs, lead_notes)
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  LeadRow,
  LeadNoteRow,
  LeadActivityLogRow,
} from './types.ts';
import { authMiddleware } from './auth.ts';

const VALID_RATINGS: ReadonlySet<string> = new Set(['Hot', 'Warm', 'Cold', 'HOT', 'WARM', 'COLD']);
const VALID_STATUSES: ReadonlySet<string> = new Set([
  'New',
  'Pending',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Converted',
  'Won',
  'Lost',
  'Disqualified',
]);

const leadsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// All lead routes require authenticated staff context
leadsApp.use('*', authMiddleware);

/**
 * Checks whether the authenticated manager has authority over the given owner_id.
 */
async function isOwnerInManagerScope(
  manager: CrmUserProfile,
  ownerId: string,
  db: D1Database
): Promise<boolean> {
  if (manager.id === ownerId) return true;

  try {
    const query = await db
      .prepare(
        'SELECT id FROM users WHERE id = ? AND (reports_to = ? OR (team_id IS NOT NULL AND team_id = ?)) LIMIT 1'
      )
      .bind(ownerId, manager.id, manager.team_id || '')
      .all<{ id: string }>();

    return Boolean(query.results && query.results.length > 0);
  } catch {
    return false;
  }
}

/**
 * Evaluates record-level access permission for a specific lead
 */
async function canAccessLead(
  user: CrmUserProfile,
  lead: LeadRow,
  db: D1Database
): Promise<boolean> {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'EMPLOYEE') {
    return lead.owner_id === user.id || lead.created_by_id === user.id;
  }

  if (user.role === 'MANAGER') {
    if (lead.owner_id === user.id || lead.created_by_id === user.id || !lead.owner_id) {
      return true;
    }
    return isOwnerInManagerScope(user, lead.owner_id, db);
  }

  return false;
}

// ============================================================================
// 1. GET /api/leads - List leads with search, filters & pagination
// ============================================================================
leadsApp.get('/', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);

  const q = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const statusParam = (url.searchParams.get('status') || '').trim();
  const ratingParam = (url.searchParams.get('rating') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25));
  const offset = (page - 1) * limit;

  const whereClauses: string[] = ['l.is_deleted = 0'];
  const bindParams: unknown[] = [];

  // Enforce server-side RBAC scoping
  if (user.role === 'EMPLOYEE') {
    whereClauses.push('(l.owner_id = ? OR l.created_by_id = ?)');
    bindParams.push(user.id, user.id);
  } else if (user.role === 'MANAGER') {
    whereClauses.push(
      '(l.owner_id = ? OR l.created_by_id = ? OR l.owner_id IS NULL OR l.owner_id IN (SELECT id FROM users WHERE reports_to = ? OR (team_id IS NOT NULL AND team_id = ?)))'
    );
    bindParams.push(user.id, user.id, user.id, user.team_id || '');
  }

  // Status Filter
  if (statusParam && statusParam !== 'All') {
    whereClauses.push('LOWER(l.status) = LOWER(?)');
    bindParams.push(statusParam);
  }

  // Rating Filter
  if (ratingParam && ratingParam !== 'All') {
    whereClauses.push('LOWER(l.rating) = LOWER(?)');
    bindParams.push(ratingParam);
  }

  // Free-text Search
  if (q) {
    whereClauses.push(
      '(l.contact_name LIKE ? OR l.contact_company LIKE ? OR l.contact_phone LIKE ? OR l.contact_email LIKE ? OR l.lead_specification LIKE ?)'
    );
    const pattern = `%${q}%`;
    bindParams.push(pattern, pattern, pattern, pattern, pattern);
  }

  const whereSql = whereClauses.join(' AND ');

  try {
    // 1. Get total count
    const countQuery = `SELECT COUNT(*) as total FROM leads l WHERE ${whereSql}`;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...bindParams)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // 2. Fetch paginated records
    const listQuery = `
      SELECT l.*
      FROM leads l
      WHERE ${whereSql}
      ORDER BY l.sl_no DESC
      LIMIT ? OFFSET ?
    `;

    const listParams = [...bindParams, limit, offset];
    const { results } = await c.env.DB.prepare(listQuery)
      .bind(...listParams)
      .all<LeadRow>();

    return c.json({
      success: true,
      leads: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 2. GET /api/leads/:id - Fetch single lead by ID with notes & activity logs
// ============================================================================
leadsApp.get('/:id', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  try {
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ? AND is_deleted = 0 LIMIT 1')
      .bind(idParam)
      .first<LeadRow>();

    if (!lead) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Lead not found.' }, 404);
    }

    const hasAccess = await canAccessLead(user, lead, c.env.DB);
    if (!hasAccess) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'You do not have access to this lead record.' },
        403
      );
    }

    // Fetch notes and activity logs in parallel
    const [notesRes, activityRes] = await Promise.all([
      c.env.DB.prepare('SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC')
        .bind(idParam)
        .all<LeadNoteRow>(),
      c.env.DB.prepare('SELECT * FROM lead_activity_logs WHERE lead_id = ? ORDER BY created_at DESC')
        .bind(idParam)
        .all<LeadActivityLogRow>(),
    ]);

    return c.json({
      success: true,
      lead,
      notes: notesRes.results || [],
      activityLogs: activityRes.results || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve lead';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 3. POST /api/leads - Create new lead
// ============================================================================
leadsApp.post('/', async (c) => {
  const user = c.get('user');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  // Required Field Validation
  const contactName = typeof body.contact_name === 'string' ? body.contact_name.trim() : '';
  const contactPhone = typeof body.contact_phone === 'string' ? body.contact_phone.trim() : '';
  const contactCompany = typeof body.contact_company === 'string' ? body.contact_company.trim() : '';
  const leadSpecification = typeof body.lead_specification === 'string' ? body.lead_specification.trim() : '';

  if (!contactName) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'contact_name is required.' }, 400);
  }
  if (!contactPhone) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'contact_phone is required.' }, 400);
  }
  if (!contactCompany) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'contact_company is required.' }, 400);
  }
  if (!leadSpecification) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'lead_specification is required.' }, 400);
  }

  const rating = typeof body.rating === 'string' && body.rating.trim() ? body.rating.trim() : 'Cold';
  const status = typeof body.status === 'string' && body.status.trim() ? body.status.trim() : 'Pending';
  const value = typeof body.value === 'number' ? body.value : Number(body.value) || 0;
  const leadDate = typeof body.lead_date === 'string' && body.lead_date.trim()
    ? body.lead_date.trim()
    : new Date().toISOString().split('T')[0];

  // Server-authoritative ownership enforcement
  const createdById = user.id;
  const createdByName = user.full_name;
  let ownerId: string = user.id;
  let ownerName: string = user.full_name;

  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    if (typeof body.owner_id === 'string' && body.owner_id.trim()) {
      ownerId = body.owner_id.trim();
      ownerName = typeof body.owner_name === 'string' && body.owner_name.trim() ? body.owner_name.trim() : ownerId;
    }
  } else if (user.role === 'MANAGER') {
    if (typeof body.owner_id === 'string' && body.owner_id.trim() && body.owner_id.trim() !== user.id) {
      const targetOwnerId = body.owner_id.trim();
      const inScope = await isOwnerInManagerScope(user, targetOwnerId, c.env.DB);
      if (!inScope) {
        return c.json(
          { success: false, code: 'FORBIDDEN', message: 'Managers cannot assign leads to users outside their reporting scope.' },
          403
        );
      }
      ownerId = targetOwnerId;
      ownerName = typeof body.owner_name === 'string' && body.owner_name.trim() ? body.owner_name.trim() : ownerId;
    }
  }

  // Generate ID and sequential sl_no
  const id = typeof body.id === 'string' && body.id.trim()
    ? body.id.trim()
    : `lead_${crypto.randomUUID().replace(/-/g, '')}`;

  try {
    const slResult = await c.env.DB.prepare('SELECT COALESCE(MAX(sl_no), 0) + 1 AS next_sl FROM leads').first<{
      next_sl: number;
    }>();
    const slNo = slResult?.next_sl ?? 1;

    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : typeof body.tags === 'string' ? body.tags : null;
    const comments = typeof body.comments === 'string' ? body.comments.trim() : null;

    const insertSql = `
      INSERT INTO leads (
        id, sl_no, lead_date, assigned_date, lead_specification,
        contact_name, contact_phone, contact_email, contact_company, contact_whatsapp,
        contact_salutation, contact_designation, contact_personal_mobile, contact_nationality,
        contact_telephone, contact_website, rating, status, value,
        source, source_name, campaign, business_opportunity, location,
        tags, comments, last_activity, last_activity_date,
        owner_id, owner_name, owner_avatar, created_by_id, created_by_name,
        assigned_employee, assigned_manager, department, is_deleted
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, 0
      )
    `;

    await c.env.DB.prepare(insertSql)
      .bind(
        id,
        slNo,
        leadDate,
        body.assigned_date || leadDate,
        leadSpecification,
        contactName,
        contactPhone,
        body.contact_email || null,
        contactCompany,
        body.contact_whatsapp || null,
        body.contact_salutation || 'Mr.',
        body.contact_designation || null,
        body.contact_personal_mobile || null,
        body.contact_nationality || null,
        body.contact_telephone || null,
        body.contact_website || null,
        rating,
        status,
        value,
        body.source || 'Direct Outreach',
        body.source_name || null,
        body.campaign || null,
        body.business_opportunity || null,
        body.location || 'Dubai, UAE',
        tags,
        comments,
        'Lead Created',
        leadDate,
        ownerId,
        ownerName,
        body.owner_avatar || null,
        createdById,
        createdByName,
        body.assigned_employee || ownerName,
        body.assigned_manager || null,
        body.department || 'Sales & HVAC Services'
      )
      .run();

    // Insert Initial Activity Log
    const logId = `log_${crypto.randomUUID().replace(/-/g, '')}`;
    await c.env.DB.prepare(
      `INSERT INTO lead_activity_logs (id, lead_id, user_id, user_name, action, note, new_status, new_rating)
       VALUES (?, ?, ?, ?, 'Created', ?, ?, ?)`
    )
      .bind(logId, id, user.id, user.full_name, 'New lead created in CRM', status, rating)
      .run();

    // Fetch newly created record
    const created = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first<LeadRow>();

    return c.json({ success: true, lead: created }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database insertion failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 4. PATCH /api/leads/:id/status - Dedicated status & rating update endpoint
// Tailored for ChangeLeadStatusModal.tsx (handles status, rating, comments, addNote)
// ============================================================================
leadsApp.patch('/:id/status', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  const newStatus = typeof body.status === 'string' ? body.status.trim() : undefined;
  const newRating = typeof body.rating === 'string' ? body.rating.trim() : undefined;
  const comments = typeof body.comments === 'string' ? body.comments.trim() : '';
  const addNote = Boolean(body.addNote);

  if (!newStatus && !newRating && !comments) {
    return c.json(
      { success: false, code: 'INVALID_INPUT', message: 'At least one field (status, rating, or comments) must be provided.' },
      400
    );
  }

  try {
    const existing = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ? AND is_deleted = 0 LIMIT 1')
      .bind(idParam)
      .first<LeadRow>();

    if (!existing) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Lead not found.' }, 404);
    }

    const hasAccess = await canAccessLead(user, existing, c.env.DB);
    if (!hasAccess) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'You do not have permission to update this lead.' },
        403
      );
    }

    const finalStatus = newStatus || existing.status;
    const finalRating = newRating || existing.rating;
    const today = new Date().toISOString().split('T')[0];
    const lastActivityText = `Status updated to ${finalStatus}${newRating ? ` (${finalRating})` : ''}`;

    // Update lead record
    await c.env.DB.prepare(`
      UPDATE leads 
      SET status = ?, rating = ?, comments = ?, last_activity = ?, last_activity_date = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
      .bind(finalStatus, finalRating, comments || existing.comments, lastActivityText, today, idParam)
      .run();

    // Create Audit Activity Log
    const logId = `log_${crypto.randomUUID().replace(/-/g, '')}`;
    await c.env.DB.prepare(`
      INSERT INTO lead_activity_logs (
        id, lead_id, user_id, user_name, action, note, old_status, new_status, old_rating, new_rating
      ) VALUES (?, ?, ?, ?, 'Status/Rating Changed', ?, ?, ?, ?, ?)
    `)
      .bind(
        logId,
        idParam,
        user.id,
        user.full_name,
        comments || lastActivityText,
        existing.status,
        finalStatus,
        existing.rating,
        finalRating
      )
      .run();

    // If addNote is checked and comments has text, insert into lead_notes
    if (addNote && comments) {
      const noteId = `note_${crypto.randomUUID().replace(/-/g, '')}`;
      await c.env.DB.prepare(`
        INSERT INTO lead_notes (id, lead_id, author_id, author_name, author_avatar, content)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
        .bind(noteId, idParam, user.id, user.full_name, null, comments)
        .run();
    }

    const updated = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(idParam).first<LeadRow>();

    return c.json({
      success: true,
      message: 'Lead status and rating updated successfully.',
      lead: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update lead status';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 5. PUT /api/leads/:id - Full lead update
// ============================================================================
leadsApp.put('/:id', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ? AND is_deleted = 0 LIMIT 1')
      .bind(idParam)
      .first<LeadRow>();

    if (!existing) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Lead record not found.' }, 404);
    }

    const hasAccess = await canAccessLead(user, existing, c.env.DB);
    if (!hasAccess) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'You do not have permission to modify this lead.' },
        403
      );
    }

    // Disallow Employees from modifying owner_id
    if (user.role === 'EMPLOYEE' && body.owner_id !== undefined && body.owner_id !== existing.owner_id) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'Employees cannot reassign lead ownership.' },
        403
      );
    }

    // Dynamic parameterized update
    const updatableFields = [
      'lead_date', 'assigned_date', 'lead_specification',
      'contact_name', 'contact_phone', 'contact_email', 'contact_company', 'contact_whatsapp',
      'contact_salutation', 'contact_designation', 'contact_personal_mobile', 'contact_nationality',
      'contact_telephone', 'contact_website', 'rating', 'status', 'value',
      'source', 'source_name', 'campaign', 'business_opportunity', 'location',
      'tags', 'comments', 'last_activity', 'last_activity_date',
      'owner_id', 'owner_name', 'owner_avatar', 'assigned_employee', 'assigned_manager', 'department'
    ];

    const updateClauses: string[] = ["updated_at = datetime('now')"];
    const updateParams: unknown[] = [];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateClauses.push(`${field} = ?`);
        let val = body[field];
        if (field === 'tags' && Array.isArray(val)) {
          val = JSON.stringify(val);
        }
        updateParams.push(val);
      }
    }

    const updateSql = `UPDATE leads SET ${updateClauses.join(', ')} WHERE id = ?`;
    updateParams.push(idParam);

    await c.env.DB.prepare(updateSql).bind(...updateParams).run();

    const updated = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(idParam).first<LeadRow>();

    return c.json({ success: true, lead: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update lead';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 6. DELETE /api/leads/:id - Soft-delete lead (Admins only)
// ============================================================================
leadsApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  // Deletion is strictly reserved for Super Admins and Admins
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return c.json(
      { success: false, code: 'INSUFFICIENT_PERMISSIONS', message: 'Only administrators are authorized to delete leads.' },
      403
    );
  }

  try {
    const existing = await c.env.DB.prepare('SELECT id, is_deleted FROM leads WHERE id = ? LIMIT 1')
      .bind(idParam)
      .first<{ id: string; is_deleted: number }>();

    if (!existing || existing.is_deleted === 1) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Lead not found.' }, 404);
    }

    // Soft deletion
    await c.env.DB.prepare(
      "UPDATE leads SET is_deleted = 1, deleted_at = datetime('now'), deleted_by_id = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(user.id, idParam)
      .run();

    return c.json({ success: true, message: 'Lead deactivated successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to deactivate lead';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

export default leadsApp;
export { leadsApp };
