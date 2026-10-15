/**
 * Staff & User Management Endpoints for cool-tech-crm-api
 * 
 * - Full staff lifecycle: GET /, POST /, PUT /:id, PATCH /:id/status
 * - Strict authentication via authMiddleware (Firebase ID Token)
 * - Strict RBAC: Only SUPER_ADMIN and ADMIN roles are authorized to manage staff
 * - Privilege escalation prevention: ADMIN cannot create, edit, or grant SUPER_ADMIN
 * - Referential integrity: reports_to must exist in users table
 * - Unique constraint enforcement: email and firebase_uid must be unique
 * - Self-lockout prevention: cannot deactivate the primary Super Admin account
 * - Parameterized SQL (zero raw string concatenation)
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  CrmRole,
} from './types.ts';
import { authMiddleware } from './auth.ts';

const VALID_CRM_ROLES: ReadonlySet<CrmRole> = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'EMPLOYEE',
]);

const usersApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// All staff management routes require authenticated staff context
usersApp.use('*', authMiddleware);

/**
 * Enforces that only SUPER_ADMIN and ADMIN users can manage staff.
 */
function requireAdminAuthority(user: CrmUserProfile): { allowed: boolean; code?: string; message?: string } {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return { allowed: true };
  }
  return {
    allowed: false,
    code: 'FORBIDDEN',
    message: 'Only administrators and super administrators are permitted to manage staff profiles.',
  };
}

// ============================================================================
// 1. GET /api/users - List staff members with search, filters & pagination
// ============================================================================
usersApp.get('/', async (c) => {
  const caller = c.get('user');
  const authCheck = requireAdminAuthority(caller);
  if (!authCheck.allowed) {
    return c.json({ success: false, code: authCheck.code, message: authCheck.message }, 403);
  }

  const url = new URL(c.req.url);
  const q = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const roleParam = (url.searchParams.get('role') || '').trim().toUpperCase();
  const departmentParam = (url.searchParams.get('department') || '').trim();
  const statusParam = (url.searchParams.get('status') || '').trim().toLowerCase();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25));
  const offset = (page - 1) * limit;

  const whereClauses: string[] = [];
  const bindParams: unknown[] = [];

  if (roleParam && roleParam !== 'ALL') {
    whereClauses.push('u.role = ?');
    bindParams.push(roleParam);
  }

  if (departmentParam && departmentParam !== 'All') {
    whereClauses.push('LOWER(u.department) = LOWER(?)');
    bindParams.push(departmentParam);
  }

  if (statusParam === 'active' || statusParam === '1') {
    whereClauses.push('u.is_active = 1');
  } else if (statusParam === 'inactive' || statusParam === '0') {
    whereClauses.push('u.is_active = 0');
  }

  if (q) {
    whereClauses.push(
      '(u.full_name LIKE ? OR u.email LIKE ? OR u.position LIKE ? OR u.department LIKE ?)'
    );
    const pattern = `%${q}%`;
    bindParams.push(pattern, pattern, pattern, pattern);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    // 1. Total count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereSql}`;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...bindParams)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;

    // 2. Paginated records
    const listQuery = `
      SELECT u.id, u.firebase_uid, u.email, u.full_name, u.role, u.position, u.department, u.team_id, u.reports_to, u.is_active, u.created_at, u.updated_at
      FROM users u
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const listParams = [...bindParams, limit, offset];
    const { results } = await c.env.DB.prepare(listQuery)
      .bind(...listParams)
      .all<CrmUserProfile>();

    return c.json({
      success: true,
      users: results || [],
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
// 2. GET /api/users/:id - Fetch single staff member by ID
// ============================================================================
usersApp.get('/:id', async (c) => {
  const caller = c.get('user');
  const authCheck = requireAdminAuthority(caller);
  if (!authCheck.allowed) {
    return c.json({ success: false, code: authCheck.code, message: authCheck.message }, 403);
  }

  const idParam = c.req.param('id');
  try {
    const user = await c.env.DB.prepare(
      'SELECT id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1'
    )
      .bind(idParam)
      .first<CrmUserProfile>();

    if (!user) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' }, 404);
    }

    return c.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve staff member';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 3. POST /api/users - Create new staff profile in D1
// ============================================================================
usersApp.post('/', async (c) => {
  const caller = c.get('user');
  const authCheck = requireAdminAuthority(caller);
  if (!authCheck.allowed) {
    return c.json({ success: false, code: authCheck.code, message: authCheck.message }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const firebaseUid = typeof body.firebase_uid === 'string' ? body.firebase_uid.trim() : '';
  const rawRole = typeof body.role === 'string' ? body.role.trim().toUpperCase() : '';
  const position = typeof body.position === 'string' ? body.position.trim() : null;
  const department = typeof body.department === 'string' ? body.department.trim() : null;
  const teamId = typeof body.team_id === 'string' ? body.team_id.trim() : null;
  const reportsTo = typeof body.reports_to === 'string' && body.reports_to.trim() ? body.reports_to.trim() : null;
  const isActive = body.is_active === 0 || body.is_active === false ? 0 : 1;

  // Validation
  if (!fullName) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'full_name is required.' }, 400);
  }
  if (!email || !email.includes('@')) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'A valid email address is required.' }, 400);
  }
  if (!firebaseUid) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'firebase_uid is required.' }, 400);
  }
  if (!rawRole || !VALID_CRM_ROLES.has(rawRole as CrmRole)) {
    return c.json(
      {
        success: false,
        code: 'INVALID_ROLE',
        message: `Invalid role: "${body.role}". Allowed roles: SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE.`,
      },
      400
    );
  }

  // Privilege escalation check
  if (rawRole === 'SUPER_ADMIN' && caller.role !== 'SUPER_ADMIN') {
    return c.json(
      {
        success: false,
        code: 'FORBIDDEN',
        message: 'Administrators cannot create or grant Super Admin privileges.',
      },
      403
    );
  }

  // Check for unique email and firebase_uid
  try {
    const existing = await c.env.DB.prepare(
      'SELECT id, email, firebase_uid FROM users WHERE email = ? OR firebase_uid = ? LIMIT 1'
    )
      .bind(email, firebaseUid)
      .first<{ id: string; email: string; firebase_uid: string }>();

    if (existing) {
      if (existing.email.toLowerCase() === email) {
        return c.json(
          {
            success: false,
            code: 'EMAIL_ALREADY_EXISTS',
            message: `A staff profile with email "${email}" already exists in the CRM database.`,
            existingId: existing.id,
          },
          409
        );
      }
      if (existing.firebase_uid === firebaseUid) {
        return c.json(
          {
            success: false,
            code: 'UID_ALREADY_EXISTS',
            message: 'A staff profile with this Firebase UID already exists in the CRM database.',
            existingId: existing.id,
          },
          409
        );
      }
    }

    // Referential integrity check for reports_to
    if (reportsTo) {
      const managerExists = await c.env.DB.prepare('SELECT id FROM users WHERE id = ? LIMIT 1')
        .bind(reportsTo)
        .first<{ id: string }>();

      if (!managerExists) {
        return c.json(
          {
            success: false,
            code: 'INVALID_MANAGER',
            message: `Reporting manager with id "${reportsTo}" does not exist in the CRM database.`,
          },
          400
        );
      }
    }

    // Generate or format ID
    const customId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null;
    const id = customId || `usr_${crypto.randomUUID().replace(/-/g, '')}`;

    const insertSql = `
      INSERT INTO users (
        id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
      )
    `;

    await c.env.DB.prepare(insertSql)
      .bind(
        id,
        firebaseUid,
        email,
        fullName,
        rawRole,
        position,
        department,
        teamId,
        reportsTo,
        isActive
      )
      .run();

    const createdUser: CrmUserProfile = {
      id,
      firebase_uid: firebaseUid,
      email,
      full_name: fullName,
      role: rawRole as CrmRole,
      position: position || undefined,
      department: department || undefined,
      team_id: teamId || undefined,
      reports_to: reportsTo || undefined,
      is_active: isActive,
    };

    return c.json({ success: true, user: createdUser }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database insertion failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 4. PUT /api/users/:id - Update existing staff profile
// ============================================================================
usersApp.put('/:id', async (c) => {
  const caller = c.get('user');
  const authCheck = requireAdminAuthority(caller);
  if (!authCheck.allowed) {
    return c.json({ success: false, code: authCheck.code, message: authCheck.message }, 403);
  }

  const idParam = c.req.param('id');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
      .bind(idParam)
      .first<CrmUserProfile>();

    if (!existing) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' }, 404);
    }

    // Privilege check: ADMIN cannot edit a SUPER_ADMIN
    if (existing.role === 'SUPER_ADMIN' && caller.role !== 'SUPER_ADMIN') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Only Super Admins are permitted to modify Super Admin profiles.',
        },
        403
      );
    }

    // Resolve target role
    let targetRole = existing.role;
    if (typeof body.role === 'string' && body.role.trim()) {
      const normalizedRole = body.role.trim().toUpperCase() as CrmRole;
      if (!VALID_CRM_ROLES.has(normalizedRole)) {
        return c.json(
          { success: false, code: 'INVALID_ROLE', message: `Invalid role: "${body.role}".` },
          400
        );
      }
      if (normalizedRole === 'SUPER_ADMIN' && caller.role !== 'SUPER_ADMIN') {
        return c.json(
          {
            success: false,
            code: 'FORBIDDEN',
            message: 'Administrators cannot grant Super Admin privileges.',
          },
          403
        );
      }
      targetRole = normalizedRole;
    }

    const fullName = typeof body.full_name === 'string' && body.full_name.trim()
      ? body.full_name.trim()
      : existing.full_name;

    const position = body.position !== undefined
      ? (typeof body.position === 'string' ? body.position.trim() : null)
      : existing.position;

    const department = body.department !== undefined
      ? (typeof body.department === 'string' ? body.department.trim() : null)
      : existing.department;

    const teamId = body.team_id !== undefined
      ? (typeof body.team_id === 'string' ? body.team_id.trim() : null)
      : existing.team_id;

    let reportsTo: string | null | undefined = existing.reports_to;
    if (body.reports_to !== undefined) {
      const candidateReportsTo = typeof body.reports_to === 'string' && body.reports_to.trim()
        ? body.reports_to.trim()
        : null;

      if (candidateReportsTo) {
        if (candidateReportsTo === idParam) {
          return c.json(
            { success: false, code: 'INVALID_INPUT', message: 'A staff member cannot report to themselves.' },
            400
          );
        }
        const managerExists = await c.env.DB.prepare('SELECT id FROM users WHERE id = ? LIMIT 1')
          .bind(candidateReportsTo)
          .first<{ id: string }>();

        if (!managerExists) {
          return c.json(
            { success: false, code: 'INVALID_MANAGER', message: `Reporting manager with id "${candidateReportsTo}" not found.` },
            400
          );
        }
      }
      reportsTo = candidateReportsTo;
    }

    const isActive = body.is_active !== undefined
      ? (body.is_active === 0 || body.is_active === false ? 0 : 1)
      : (existing.is_active === 1 || existing.is_active === true ? 1 : 0);

    // Self-lockout check
    if (existing.role === 'SUPER_ADMIN' && isActive === 0) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'Cannot deactivate a Super Admin account.' },
        400
      );
    }

    const updateSql = `
      UPDATE users SET
        full_name = ?,
        role = ?,
        position = ?,
        department = ?,
        team_id = ?,
        reports_to = ?,
        is_active = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `;

    await c.env.DB.prepare(updateSql)
      .bind(
        fullName,
        targetRole,
        position,
        department,
        teamId,
        reportsTo,
        isActive,
        idParam
      )
      .run();

    const updatedUser: CrmUserProfile = {
      ...existing,
      full_name: fullName,
      role: targetRole,
      position: position || undefined,
      department: department || undefined,
      team_id: teamId || undefined,
      reports_to: reportsTo || undefined,
      is_active: isActive,
    };

    return c.json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database update failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 5. PATCH /api/users/:id/status - Activate or deactivate staff member
// ============================================================================
usersApp.patch('/:id/status', async (c) => {
  const caller = c.get('user');
  const authCheck = requireAdminAuthority(caller);
  if (!authCheck.allowed) {
    return c.json({ success: false, code: authCheck.code, message: authCheck.message }, 403);
  }

  const idParam = c.req.param('id');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  if (body.is_active === undefined) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'is_active field is required.' }, 400);
  }

  const nextStatus = body.is_active === 1 || body.is_active === true ? 1 : 0;

  try {
    const target = await c.env.DB.prepare('SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1')
      .bind(idParam)
      .first<{ id: string; role: CrmRole; is_active: number }>();

    if (!target) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' }, 404);
    }

    // Privilege check: ADMIN cannot deactivate a SUPER_ADMIN
    if (target.role === 'SUPER_ADMIN' && caller.role !== 'SUPER_ADMIN') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Only Super Admins are permitted to change Super Admin status.',
        },
        403
      );
    }

    // Self-lockout check: Cannot deactivate self if caller is Super Admin
    if (target.role === 'SUPER_ADMIN' && nextStatus === 0 && target.id === caller.id) {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'You cannot deactivate your own Super Admin account.',
        },
        400
      );
    }

    await c.env.DB.prepare('UPDATE users SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(nextStatus, idParam)
      .run();

    return c.json({
      success: true,
      id: idParam,
      is_active: nextStatus,
      message: `Staff account has been ${nextStatus === 1 ? 'activated' : 'deactivated'}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update account status';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

export { usersApp };
