/**
 * Staff & User Management Endpoints for cool-tech-crm-api
 * 
 * - Full staff lifecycle: GET /, GET /:id, POST /, PUT /:id, PATCH /:id/status, DELETE /:id
 * - Strict authentication via authMiddleware (Firebase ID Token)
 * - Server-side RBAC & Dynamic Permissions enforcement
 * - Privilege escalation prevention: ADMIN cannot create, edit, or grant SUPER_ADMIN
 * - Last-Super-Admin protection: cannot delete, demote, or deactivate the last active Super Admin
 * - Email modification with uniqueness checking
 * - Referential integrity: reports_to must exist in users table
 * - Unique constraint enforcement: email and firebase_uid must be unique
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
import { requirePermission, hasPermission, resolveUserPermissions } from './permissions.ts';

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
 * Inspects available columns in the users table to maintain 100% backward compatibility
 * between baseline and extended schema migrations.
 */
let cachedTableColumns: Set<string> | null = null;
async function getTableColumns(db: D1Database): Promise<Set<string>> {
  if (cachedTableColumns) return cachedTableColumns;
  try {
    const info = await db.prepare('PRAGMA table_info(users)').bind().all<{ name: string }>();
    if (info.results && info.results.length > 0) {
      cachedTableColumns = new Set(info.results.map((r) => r.name.toLowerCase()));
      return cachedTableColumns;
    }
  } catch {}
  return new Set([
    'id', 'firebase_uid', 'email', 'full_name', 'role', 'position',
    'department', 'team_id', 'reports_to', 'is_active', 'created_at', 'updated_at'
  ]);
}

// Reset column cache for testing
export function resetTableColumnsCache(): void {
  cachedTableColumns = null;
}

// ============================================================================
// 1. GET /api/users - List staff members with search, filters & pagination
// ============================================================================
usersApp.get('/', async (c) => {
  const caller = c.get('user');

  const url = new URL(c.req.url);
  const scopeParam = (url.searchParams.get('scope') || '').trim().toLowerCase();

  // Allow assignable scope for employee self-retrieval; require users permission otherwise
  if (scopeParam !== 'assignable' && !hasPermission(caller, 'users', 'canView')) {
    return c.json(
      { success: false, code: 'FORBIDDEN', message: 'Permission denied: canView access to "users" module is not permitted for your account.' },
      403
    );
  }

  const q = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const roleParam = (url.searchParams.get('role') || '').trim().toUpperCase();
  const departmentParam = (url.searchParams.get('department') || '').trim();
  const statusParam = (url.searchParams.get('status') || '').trim().toLowerCase();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25));
  const offset = (page - 1) * limit;

  const whereClauses: string[] = [];
  const bindParams: unknown[] = [];

  // Hierarchy Scope Restrictions:
  if (caller.role === 'EMPLOYEE') {
    if (scopeParam !== 'assignable') {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'Employees are not authorized to view the staff directory.' },
        403
      );
    }
    whereClauses.push('u.id = ?');
    bindParams.push(caller.id);
  } else if (caller.role === 'MANAGER') {
    // Managers can only list themselves and their direct reportees (or same team)
    whereClauses.push('(u.reports_to = ? OR u.id = ? OR (u.team_id IS NOT NULL AND u.team_id = ?))');
    bindParams.push(caller.id, caller.id, caller.team_id || '');
  }
  // SUPER_ADMIN and ADMIN have organisation-wide directory access

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
    const cols = await getTableColumns(c.env.DB);
    const hasExtended = cols.has('phone');

    const selectColumns = hasExtended
      ? 'u.id, u.firebase_uid, u.email, u.full_name, u.role, u.position, u.department, u.team_id, u.reports_to, u.is_active, u.phone, u.username, u.avatar_image, u.dob, u.designation, u.business_opportunity, u.store, u.sales_visit_permission, u.permissions, u.created_at, u.updated_at'
      : 'u.id, u.firebase_uid, u.email, u.full_name, u.role, u.position, u.department, u.team_id, u.reports_to, u.is_active, u.created_at, u.updated_at';

    const listQuery = `
      SELECT ${selectColumns}
      FROM users u
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const listParams = [...bindParams, limit, offset];
    const { results } = await c.env.DB.prepare(listQuery)
      .bind(...listParams)
      .all<CrmUserProfile>();

    const usersWithPerms = (results || []).map((u) => ({
      ...u,
      resolvedPermissions: resolveUserPermissions(u),
    }));

    return c.json({
      success: true,
      users: usersWithPerms,
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
usersApp.get('/:id', requirePermission('users', 'canView'), async (c) => {
  const caller = c.get('user');
  const idParam = c.req.param('id');

  try {
    const cols = await getTableColumns(c.env.DB);
    const hasExtended = cols.has('phone');

    const selectColumns = hasExtended
      ? 'id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active, phone, username, avatar_image, dob, designation, business_opportunity, store, sales_visit_permission, permissions, created_at, updated_at'
      : 'id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active, created_at, updated_at';

    const user = await c.env.DB.prepare(`SELECT ${selectColumns} FROM users WHERE id = ? LIMIT 1`)
      .bind(idParam)
      .first<CrmUserProfile>();

    if (!user) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' }, 404);
    }

    // Role-based visibility check
    if (caller.role === 'EMPLOYEE' && user.id !== caller.id) {
      return c.json({ success: false, code: 'FORBIDDEN', message: 'Employees can only view their own profile.' }, 403);
    }
    if (caller.role === 'MANAGER' && user.id !== caller.id && user.reports_to !== caller.id && (!caller.team_id || user.team_id !== caller.team_id)) {
      return c.json({ success: false, code: 'FORBIDDEN', message: 'Managers can only view staff within their reporting scope.' }, 403);
    }

    return c.json({
      success: true,
      user: {
        ...user,
        resolvedPermissions: resolveUserPermissions(user),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve staff member';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 3. POST /api/users - Create new staff profile in D1
// ============================================================================
usersApp.post('/', requirePermission('users', 'canCreate'), async (c) => {
  const caller = c.get('user');

  // Employees cannot create staff accounts
  if (caller.role === 'EMPLOYEE') {
    return c.json(
      { success: false, code: 'FORBIDDEN', message: 'Employees are not permitted to create staff accounts.' },
      403
    );
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
  let teamId = typeof body.team_id === 'string' ? body.team_id.trim() : null;
  let reportsTo = typeof body.reports_to === 'string' && body.reports_to.trim() ? body.reports_to.trim() : null;
  const isActive = body.is_active === 0 || body.is_active === false ? 0 : 1;

  // Optional profile fields
  const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
  const username = typeof body.username === 'string' ? body.username.trim() : null;
  const avatarImage = typeof body.avatar_image === 'string' ? body.avatar_image.trim() : null;
  const dob = typeof body.dob === 'string' ? body.dob.trim() : null;
  const designation = typeof body.designation === 'string' ? body.designation.trim() : null;
  const businessOpportunity = typeof body.business_opportunity === 'string' ? body.business_opportunity.trim() : null;
  const store = typeof body.store === 'string' ? body.store.trim() : null;
  const salesVisitPermission = body.sales_visit_permission === 1 || body.sales_visit_permission === true ? 1 : 0;
  const permissions = body.permissions ? (typeof body.permissions === 'string' ? body.permissions : JSON.stringify(body.permissions)) : null;

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

  // 1. Manager Role Rules:
  // Managers can only create Employees, and reports_to MUST default to the Manager's D1 user ID
  if (caller.role === 'MANAGER') {
    if (rawRole !== 'EMPLOYEE') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Managers can only create Employee accounts.',
        },
        403
      );
    }
    reportsTo = caller.id;
    if (!teamId && caller.team_id) {
      teamId = caller.team_id;
    }
  }

  // 2. Admin Role Rules:
  // Admins can create Managers and Employees, but CANNOT create Super Admin or Admin accounts
  if (caller.role === 'ADMIN') {
    if (rawRole === 'SUPER_ADMIN') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Administrators cannot create or grant Super Admin privileges.',
        },
        403
      );
    }
    if (rawRole === 'ADMIN') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Administrators cannot create other Administrator accounts.',
        },
        403
      );
    }
  }

  // 3. Super Admin Role Rules:
  // Super Admins can create Admins, Managers, and Employees. Super Admin accounts cannot be created via standard registration.
  if (caller.role === 'SUPER_ADMIN') {
    if (rawRole === 'SUPER_ADMIN') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Super Admin accounts cannot be created via standard registration.',
        },
        403
      );
    }
  }

  // Check for unique email and firebase_uid
  try {
    const existing = await c.env.DB.prepare(
      'SELECT id, email, firebase_uid FROM users WHERE LOWER(email) = LOWER(?) OR firebase_uid = ? LIMIT 1'
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

    const cols = await getTableColumns(c.env.DB);
    const hasExtended = cols.has('phone');

    if (hasExtended) {
      const insertSql = `
        INSERT INTO users (
          id, firebase_uid, email, full_name, role, position, department, team_id,
          reports_to, is_active, phone, username, avatar_image, dob, designation,
          business_opportunity, store, sales_visit_permission, permissions, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
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
          isActive,
          phone,
          username,
          avatarImage,
          dob,
          designation,
          businessOpportunity,
          store,
          salesVisitPermission,
          permissions
        )
        .run();
    } else {
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
    }

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
      phone: phone || undefined,
      username: username || undefined,
      avatar_image: avatarImage || undefined,
      dob: dob || undefined,
      designation: designation || undefined,
      business_opportunity: businessOpportunity || undefined,
      store: store || undefined,
      sales_visit_permission: salesVisitPermission,
      permissions: permissions || undefined,
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
usersApp.put('/:id', requirePermission('users', 'canEdit'), async (c) => {
  const caller = c.get('user');

  if (caller.role === 'EMPLOYEE') {
    return c.json(
      { success: false, code: 'FORBIDDEN', message: 'Employees are not permitted to modify staff profiles.' },
      403
    );
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

    // Manager Scope Check: Can only manage direct reportees
    if (caller.role === 'MANAGER') {
      if (existing.reports_to !== caller.id) {
        return c.json(
          { success: false, code: 'FORBIDDEN', message: 'Managers can only manage employees who report to them.' },
          403
        );
      }
    }

    // Admin Scope Check: ADMIN cannot edit a SUPER_ADMIN
    if (caller.role === 'ADMIN' && existing.role === 'SUPER_ADMIN') {
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
      if (caller.role === 'MANAGER' && normalizedRole !== 'EMPLOYEE') {
        return c.json(
          {
            success: false,
            code: 'FORBIDDEN',
            message: 'Managers cannot promote employees to managerial or administrative roles.',
          },
          403
        );
      }
      if (caller.role === 'ADMIN' && (normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'ADMIN')) {
        return c.json(
          {
            success: false,
            code: 'FORBIDDEN',
            message: 'Administrators cannot grant Admin or Super Admin privileges.',
          },
          403
        );
      }
      targetRole = normalizedRole;
    }

    // Last-Super-Admin Demotion Protection
    if (existing.role === 'SUPER_ADMIN' && targetRole !== 'SUPER_ADMIN') {
      const otherSuperAdmins = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE role = \'SUPER_ADMIN\' AND is_active = 1 AND id != ?'
      )
        .bind(idParam)
        .first<{ count: number }>();

      if (!otherSuperAdmins || otherSuperAdmins.count === 0) {
        return c.json(
          {
            success: false,
            code: 'FORBIDDEN',
            message: 'Cannot demote the last active Super Admin account.',
          },
          400
        );
      }
    }

    // Email update & uniqueness verification
    let targetEmail = existing.email;
    if (typeof body.email === 'string' && body.email.trim()) {
      const candidateEmail = body.email.trim().toLowerCase();
      if (!candidateEmail.includes('@')) {
        return c.json(
          { success: false, code: 'INVALID_INPUT', message: 'A valid email address is required.' },
          400
        );
      }
      if (candidateEmail !== existing.email.toLowerCase()) {
        const emailExists = await c.env.DB.prepare(
          'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ? LIMIT 1'
        )
          .bind(candidateEmail, idParam)
          .first<{ id: string }>();

        if (emailExists) {
          return c.json(
            {
              success: false,
              code: 'EMAIL_ALREADY_EXISTS',
              message: `A staff profile with email "${candidateEmail}" already exists in the CRM database.`,
            },
            409
          );
        }
        targetEmail = candidateEmail;
      }
    }

    // Firebase UID update
    let targetFirebaseUid = existing.firebase_uid;
    if (typeof body.firebase_uid === 'string' && body.firebase_uid.trim()) {
      const candidateUid = body.firebase_uid.trim();
      if (candidateUid !== existing.firebase_uid) {
        const uidExists = await c.env.DB.prepare(
          'SELECT id FROM users WHERE firebase_uid = ? AND id != ? LIMIT 1'
        )
          .bind(candidateUid, idParam)
          .first<{ id: string }>();

        if (uidExists) {
          return c.json(
            {
              success: false,
              code: 'UID_ALREADY_EXISTS',
              message: 'This Firebase UID is already associated with another staff profile.',
            },
            409
          );
        }
        targetFirebaseUid = candidateUid;
      }
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
    if (caller.role === 'MANAGER') {
      reportsTo = caller.id;
    } else if (body.reports_to !== undefined) {
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

    // Last-Super-Admin Deactivation Protection
    if (existing.role === 'SUPER_ADMIN' && isActive === 0) {
      const otherSuperAdmins = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE role = \'SUPER_ADMIN\' AND is_active = 1 AND id != ?'
      )
        .bind(idParam)
        .first<{ count: number }>();

      if (!otherSuperAdmins || otherSuperAdmins.count === 0) {
        return c.json(
          { success: false, code: 'FORBIDDEN', message: 'Cannot deactivate the last active Super Admin account.' },
          400
        );
      }
    }

    // Extended profile fields
    const phone = body.phone !== undefined ? (typeof body.phone === 'string' ? body.phone.trim() : null) : existing.phone;
    const username = body.username !== undefined ? (typeof body.username === 'string' ? body.username.trim() : null) : existing.username;
    const avatarImage = body.avatar_image !== undefined ? (typeof body.avatar_image === 'string' ? body.avatar_image.trim() : null) : existing.avatar_image;
    const dob = body.dob !== undefined ? (typeof body.dob === 'string' ? body.dob.trim() : null) : existing.dob;
    const designation = body.designation !== undefined ? (typeof body.designation === 'string' ? body.designation.trim() : null) : existing.designation;
    const businessOpportunity = body.business_opportunity !== undefined ? (typeof body.business_opportunity === 'string' ? body.business_opportunity.trim() : null) : existing.business_opportunity;
    const store = body.store !== undefined ? (typeof body.store === 'string' ? body.store.trim() : null) : existing.store;
    const salesVisitPermission = body.sales_visit_permission !== undefined ? (body.sales_visit_permission === 1 || body.sales_visit_permission === true ? 1 : 0) : existing.sales_visit_permission;
    const permissions = body.permissions !== undefined ? (typeof body.permissions === 'string' ? body.permissions : JSON.stringify(body.permissions)) : existing.permissions;

    const cols = await getTableColumns(c.env.DB);
    const hasExtended = cols.has('phone');

    if (hasExtended) {
      const updateSql = `
        UPDATE users SET
          email = ?,
          firebase_uid = ?,
          full_name = ?,
          role = ?,
          position = ?,
          department = ?,
          team_id = ?,
          reports_to = ?,
          is_active = ?,
          phone = ?,
          username = ?,
          avatar_image = ?,
          dob = ?,
          designation = ?,
          business_opportunity = ?,
          store = ?,
          sales_visit_permission = ?,
          permissions = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `;

      await c.env.DB.prepare(updateSql)
        .bind(
          targetEmail,
          targetFirebaseUid,
          fullName,
          targetRole,
          position,
          department,
          teamId,
          reportsTo,
          isActive,
          phone,
          username,
          avatarImage,
          dob,
          designation,
          businessOpportunity,
          store,
          salesVisitPermission,
          permissions,
          idParam
        )
        .run();
    } else {
      const updateSql = `
        UPDATE users SET
          email = ?,
          firebase_uid = ?,
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
          targetEmail,
          targetFirebaseUid,
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
    }

    const updatedUser: CrmUserProfile = {
      ...existing,
      email: targetEmail,
      firebase_uid: targetFirebaseUid,
      full_name: fullName,
      role: targetRole,
      position: position || undefined,
      department: department || undefined,
      team_id: teamId || undefined,
      reports_to: reportsTo || undefined,
      is_active: isActive,
      phone: phone || undefined,
      username: username || undefined,
      avatar_image: avatarImage || undefined,
      dob: dob || undefined,
      designation: designation || undefined,
      business_opportunity: businessOpportunity || undefined,
      store: store || undefined,
      sales_visit_permission: salesVisitPermission,
      permissions: permissions || undefined,
    };

    return c.json({
      success: true,
      user: {
        ...updatedUser,
        resolvedPermissions: resolveUserPermissions(updatedUser),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database update failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 5. PATCH /api/users/:id/status - Activate or deactivate staff member
// ============================================================================
usersApp.patch('/:id/status', requirePermission('users', 'canEdit'), async (c) => {
  const caller = c.get('user');

  if (caller.role === 'EMPLOYEE') {
    return c.json(
      { success: false, code: 'FORBIDDEN', message: 'Employees are not permitted to change staff account status.' },
      403
    );
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
    const target = await c.env.DB.prepare('SELECT id, role, reports_to, is_active FROM users WHERE id = ? LIMIT 1')
      .bind(idParam)
      .first<{ id: string; role: CrmRole; reports_to: string; is_active: number }>();

    if (!target) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' }, 404);
    }

    // Manager Scope Check: Can only deactivate direct reportees
    if (caller.role === 'MANAGER') {
      if (target.reports_to !== caller.id) {
        return c.json(
          { success: false, code: 'FORBIDDEN', message: 'Managers can only change status for employees who report to them.' },
          403
        );
      }
    }

    // Admin Scope Check: ADMIN cannot deactivate a SUPER_ADMIN
    if (caller.role === 'ADMIN' && target.role === 'SUPER_ADMIN') {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: 'Only Super Admins are permitted to change Super Admin status.',
        },
        403
      );
    }

    // Last-Super-Admin Protection: Check count of other active Super Admins
    if (target.role === 'SUPER_ADMIN' && nextStatus === 0) {
      if (target.id === caller.id) {
        return c.json(
          {
            success: false,
            code: 'FORBIDDEN',
            message: 'You cannot deactivate your own Super Admin account.',
          },
          400
        );
      }

      const otherSuperAdmins = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE role = \'SUPER_ADMIN\' AND is_active = 1 AND id != ?'
      )
        .bind(idParam)
        .first<{ count: number }>();

      if (!otherSuperAdmins || otherSuperAdmins.count === 0) {
        return c.json(
          {
            success: false,
            code: 'FORBIDDEN',
            message: 'Cannot deactivate the last active Super Admin account.',
          },
          400
        );
      }
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

// ============================================================================
// 6. DELETE /api/users/:id - Delete staff member
// ============================================================================
usersApp.delete('/:id', requirePermission('users', 'canDelete'), async (c) => {
  const caller = c.get('user');

  if (caller.role === 'EMPLOYEE' || caller.role === 'MANAGER') {
    return c.json(
      { success: false, code: 'FORBIDDEN', message: 'You do not have permission to delete staff profiles.' },
      403
    );
  }

  const idParam = c.req.param('id');

  try {
    const target = await c.env.DB.prepare('SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1')
      .bind(idParam)
      .first<{ id: string; role: CrmRole; is_active: number }>();

    if (!target) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Staff member not found.' }, 404);
    }

    if (caller.role === 'ADMIN' && target.role === 'SUPER_ADMIN') {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'Administrators cannot delete a Super Admin account.' },
        403
      );
    }

    if (target.role === 'SUPER_ADMIN') {
      const otherSuperAdmins = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE role = \'SUPER_ADMIN\' AND is_active = 1 AND id != ?'
      )
        .bind(idParam)
        .first<{ count: number }>();

      if (!otherSuperAdmins || otherSuperAdmins.count === 0) {
        return c.json(
          { success: false, code: 'FORBIDDEN', message: 'Cannot delete the last active Super Admin account.' },
          400
        );
      }
    }

    // Reassign reports_to references to NULL so child records don't fail foreign key checks
    await c.env.DB.prepare('UPDATE users SET reports_to = NULL WHERE reports_to = ?')
      .bind(idParam)
      .run();

    await c.env.DB.prepare('DELETE FROM users WHERE id = ?')
      .bind(idParam)
      .run();

    return c.json({
      success: true,
      id: idParam,
      message: 'Staff member profile deleted successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database delete failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

export { usersApp };
