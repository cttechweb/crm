/**
 * Customer Management Endpoints for cool-tech-crm-api
 * 
 * - Full CRUD: GET /, POST /, GET /:id, PUT /:id, DELETE /:id
 * - Strict authentication via authMiddleware (Firebase ID Token)
 * - Server-side Role-Based Access Control (RBAC):
 *     - SUPER_ADMIN / ADMIN: Company-wide access, full CRUD & soft-delete
 *     - MANAGER: Team/reporting-scope access, create/edit, no deletion
 *     - EMPLOYEE: Own-records only (owner_id / created_by_id), no deletion
 * - Input validation & parameterized SQL (zero raw string concatenation)
 * - Soft deletion only (is_deleted = 1, deleted_at, deleted_by_id)
 * - Child contacts support (customer_contacts)
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  CustomerRow,
  CustomerContactRow,
  CustomerStatus,
  CustomerType,
} from './types.ts';
import { authMiddleware } from './auth.ts';

const VALID_STATUSES: ReadonlySet<CustomerStatus> = new Set(['Active', 'Inactive', 'Prospect']);
const VALID_TYPES: ReadonlySet<CustomerType> = new Set(['Customer', 'Prospect']);

const customersApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// All customer routes require authenticated staff context
customersApp.use('*', authMiddleware);

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
 * Evaluates record-level access permission for a specific customer
 */
async function canAccessCustomer(
  user: CrmUserProfile,
  customer: CustomerRow,
  db: D1Database
): Promise<boolean> {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }

  if (user.role === 'EMPLOYEE') {
    return customer.owner_id === user.id || customer.created_by_id === user.id;
  }

  if (user.role === 'MANAGER') {
    if (customer.owner_id === user.id || customer.created_by_id === user.id || !customer.owner_id) {
      return true;
    }
    return isOwnerInManagerScope(user, customer.owner_id, db);
  }

  return false;
}

// ============================================================================
// 1. GET /api/customers - List customers with search, filters & pagination
// ============================================================================
customersApp.get('/', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);

  const q = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const statusParam = (url.searchParams.get('status') || '').trim();
  const typeParam = (url.searchParams.get('type') || '').trim();
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));
  const offset = (page - 1) * limit;

  // Validate status filter if provided
  if (statusParam && statusParam !== 'All' && !VALID_STATUSES.has(statusParam as CustomerStatus)) {
    return c.json(
      { success: false, code: 'INVALID_INPUT', message: `Invalid status parameter: "${statusParam}"` },
      400
    );
  }

  // Validate type filter if provided
  if (typeParam && typeParam !== 'All' && !VALID_TYPES.has(typeParam as CustomerType)) {
    return c.json(
      { success: false, code: 'INVALID_INPUT', message: `Invalid type parameter: "${typeParam}"` },
      400
    );
  }

  const whereClauses: string[] = ['c.is_deleted = 0'];
  const bindParams: unknown[] = [];

  // Enforce server-side RBAC scoping
  if (user.role === 'EMPLOYEE') {
    whereClauses.push('(c.owner_id = ? OR c.created_by_id = ?)');
    bindParams.push(user.id, user.id);
  } else if (user.role === 'MANAGER') {
    whereClauses.push(
      '(c.owner_id = ? OR c.created_by_id = ? OR c.owner_id IS NULL OR c.owner_id IN (SELECT id FROM users WHERE reports_to = ? OR (team_id IS NOT NULL AND team_id = ?)))'
    );
    bindParams.push(user.id, user.id, user.id, user.team_id || '');
  }
  // SUPER_ADMIN and ADMIN have no owner/creator restrictions

  // Status Filter
  if (statusParam && statusParam !== 'All') {
    whereClauses.push('c.status = ?');
    bindParams.push(statusParam);
  }

  // Type Filter
  if (typeParam && typeParam !== 'All') {
    whereClauses.push('c.type = ?');
    bindParams.push(typeParam);
  }

  // Free-text Search
  if (q) {
    whereClauses.push(
      '(c.customer_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.contact_person LIKE ? OR c.company_group LIKE ?)'
    );
    const searchPattern = `%${q}%`;
    bindParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const whereSql = whereClauses.join(' AND ');

  try {
    // 1. Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM customers c WHERE ${whereSql}`;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...bindParams)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // 2. Fetch paginated records
    const selectQuery = `SELECT c.* FROM customers c WHERE ${whereSql} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    const { results } = await c.env.DB.prepare(selectQuery)
      .bind(...bindParams, limit, offset)
      .all<CustomerRow>();

    return c.json({
      success: true,
      customers: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 2. POST /api/customers - Create new customer
// ============================================================================
customersApp.post('/', async (c) => {
  const user = c.get('user');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  // Required Field Validation
  const customerName = typeof body.customer_name === 'string' ? body.customer_name.trim() : '';
  const contactPerson = typeof body.contact_person === 'string' ? body.contact_person.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

  if (!customerName) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'customer_name is required.' }, 400);
  }
  if (!contactPerson) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'contact_person is required.' }, 400);
  }
  if (!phone) {
    return c.json({ success: false, code: 'INVALID_INPUT', message: 'phone is required.' }, 400);
  }

  // Validate Status & Type
  const status: CustomerStatus =
    typeof body.status === 'string' && VALID_STATUSES.has(body.status as CustomerStatus)
      ? (body.status as CustomerStatus)
      : 'Active';

  if (body.status !== undefined && !VALID_STATUSES.has(body.status as CustomerStatus)) {
    return c.json(
      { success: false, code: 'INVALID_INPUT', message: `Invalid status: "${body.status}". Allowed: Active, Inactive, Prospect.` },
      400
    );
  }

  const type: CustomerType =
    typeof body.type === 'string' && VALID_TYPES.has(body.type as CustomerType)
      ? (body.type as CustomerType)
      : 'Customer';

  if (body.type !== undefined && !VALID_TYPES.has(body.type as CustomerType)) {
    return c.json(
      { success: false, code: 'INVALID_INPUT', message: `Invalid type: "${body.type}". Allowed: Customer, Prospect.` },
      400
    );
  }

  // Server-authoritative ownership enforcement (Never trust user-supplied ID from request body)
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
          { success: false, code: 'FORBIDDEN', message: 'Managers cannot assign customers to users outside their reporting scope.' },
          403
        );
      }
      ownerId = targetOwnerId;
      ownerName = typeof body.owner_name === 'string' && body.owner_name.trim() ? body.owner_name.trim() : ownerId;
    }
  }
  // Employees are strictly forced to ownerId = user.id

  // Generate ID and sequential sl_no
  const id = `cust_${crypto.randomUUID().replace(/-/g, '')}`;

  try {
    const slResult = await c.env.DB.prepare('SELECT COALESCE(MAX(sl_no), 0) + 1 AS next_sl FROM customers').first<{
      next_sl: number;
    }>();
    const slNo = slResult?.next_sl ?? 1;

    const keyCustomer = body.key_customer === true || body.key_customer === 1 ? 1 : 0;
    const isSupplier = body.is_supplier === true || body.is_supplier === 1 ? 1 : 0;
    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : typeof body.tags === 'string' ? body.tags : null;

    const insertSql = `
      INSERT INTO customers (
        id, sl_no, customer_name, company_name, trn, company_group, industry_type, category,
        parent_customer_id, parent_customer_name, contact_person, salutation, email, phone,
        mobile, website, address, city, state_region, country, location, status, type,
        key_customer, is_supplier, no_of_employees, source, source_name, campaign, tags,
        comments, contract_status, last_visit_date, assigned_equipment_count, active_jobs_count,
        sla_level, owner_id, owner_name, owner_avatar, created_by_id, created_by_name,
        created_from_lead_id, assigned_date, date, total_spend, outstanding, total_deals,
        open_enquiries, last_enquiry, last_order, last_activity, is_deleted
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 0
      )
    `;

    await c.env.DB.prepare(insertSql)
      .bind(
        id,
        slNo,
        customerName.toUpperCase(),
        (body.company_name as string) || null,
        (body.trn as string) || null,
        (body.company_group as string) || null,
        (body.industry_type as string) || null,
        (body.category as string) || null,
        (body.parent_customer_id as string) || null,
        (body.parent_customer_name as string) || null,
        contactPerson,
        (body.salutation as string) || 'Mr.',
        (body.email as string) || null,
        phone,
        (body.mobile as string) || null,
        (body.website as string) || null,
        (body.address as string) || null,
        (body.city as string) || 'Dubai',
        (body.state_region as string) || 'Dubai',
        (body.country as string) || 'United Arab Emirates',
        (body.location as string) || null,
        status,
        type,
        keyCustomer,
        isSupplier,
        (body.no_of_employees as string) || null,
        (body.source as string) || null,
        (body.source_name as string) || null,
        (body.campaign as string) || null,
        tags,
        (body.comments as string) || null,
        (body.contract_status as string) || null,
        (body.last_visit_date as string) || null,
        Number(body.assigned_equipment_count) || 0,
        Number(body.active_jobs_count) || 0,
        (body.sla_level as string) || null,
        ownerId,
        ownerName,
        (body.owner_avatar as string) || null,
        createdById,
        createdByName,
        (body.created_from_lead_id as string) || null,
        (body.assigned_date as string) || new Date().toISOString().split('T')[0],
        (body.date as string) || new Date().toISOString().split('T')[0],
        Number(body.total_spend) || 0,
        Number(body.outstanding) || 0,
        Number(body.total_deals) || 0,
        Number(body.open_enquiries) || 0,
        (body.last_enquiry as string) || null,
        (body.last_order as string) || null,
        (body.last_activity as string) || 'Created customer account'
      )
      .run();

    const created = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first<CustomerRow>();

    return c.json({ success: true, customer: created }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create customer';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 3. GET /api/customers/:id - Retrieve customer by ID or sl_no with contacts
// ============================================================================
customersApp.get('/:id', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  try {
    const customer = await c.env.DB.prepare(
      'SELECT * FROM customers WHERE (id = ? OR CAST(sl_no AS TEXT) = ?) AND is_deleted = 0 LIMIT 1'
    )
      .bind(idParam, idParam)
      .first<CustomerRow>();

    if (!customer) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Customer record not found.' }, 404);
    }

    // Record-level RBAC check
    const allowed = await canAccessCustomer(user, customer, c.env.DB);
    if (!allowed) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'You do not have permission to access this customer record.' },
        403
      );
    }

    // Fetch associated contacts
    const contactsQuery = await c.env.DB.prepare(
      'SELECT * FROM customer_contacts WHERE customer_id = ? AND is_deleted = 0 ORDER BY is_primary DESC, created_at ASC'
    )
      .bind(customer.id)
      .all<CustomerContactRow>();

    return c.json({
      success: true,
      customer: {
        ...customer,
        contacts: contactsQuery.results || [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 4. PUT /api/customers/:id - Update existing customer record
// ============================================================================
customersApp.put('/:id', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM customers WHERE id = ? AND is_deleted = 0 LIMIT 1'
    )
      .bind(idParam)
      .first<CustomerRow>();

    if (!existing) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Customer record not found.' }, 404);
    }

    // Record-level RBAC check
    const allowed = await canAccessCustomer(user, existing, c.env.DB);
    if (!allowed) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'You do not have permission to edit this customer record.' },
        403
      );
    }

    // Validate Status & Type if provided
    if (body.status !== undefined && !VALID_STATUSES.has(body.status as CustomerStatus)) {
      return c.json(
        { success: false, code: 'INVALID_INPUT', message: `Invalid status: "${body.status}". Allowed: Active, Inactive, Prospect.` },
        400
      );
    }

    if (body.type !== undefined && !VALID_TYPES.has(body.type as CustomerType)) {
      return c.json(
        { success: false, code: 'INVALID_INPUT', message: `Invalid type: "${body.type}". Allowed: Customer, Prospect.` },
        400
      );
    }

    // Disallow Employees from modifying owner_id
    if (user.role === 'EMPLOYEE' && body.owner_id !== undefined && body.owner_id !== existing.owner_id) {
      return c.json(
        { success: false, code: 'FORBIDDEN', message: 'Employees cannot reassign customer ownership.' },
        403
      );
    }

    // Managers cannot reassign to owners outside their team
    if (user.role === 'MANAGER' && typeof body.owner_id === 'string' && body.owner_id !== existing.owner_id) {
      const inScope = await isOwnerInManagerScope(user, body.owner_id, c.env.DB);
      if (!inScope) {
        return c.json(
          { success: false, code: 'FORBIDDEN', message: 'Cannot assign customer to an owner outside your reporting scope.' },
          403
        );
      }
    }

    // Construct dynamic parameterized update query
    const updatableFields = [
      'customer_name', 'company_name', 'trn', 'company_group', 'industry_type',
      'category', 'parent_customer_id', 'parent_customer_name', 'contact_person',
      'salutation', 'email', 'phone', 'mobile', 'website', 'address', 'city',
      'state_region', 'country', 'location', 'status', 'type', 'key_customer',
      'is_supplier', 'no_of_employees', 'source', 'source_name', 'campaign',
      'tags', 'comments', 'contract_status', 'last_visit_date', 'assigned_equipment_count',
      'active_jobs_count', 'sla_level', 'owner_id', 'owner_name', 'owner_avatar',
      'assigned_date', 'date', 'total_spend', 'outstanding', 'total_deals',
      'open_enquiries', 'last_enquiry', 'last_order', 'last_activity'
    ];

    const updateClauses: string[] = ["updated_at = datetime('now')"];
    const updateParams: unknown[] = [];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateClauses.push(`${field} = ?`);
        let val = body[field];
        if (field === 'customer_name' && typeof val === 'string') {
          val = val.trim().toUpperCase();
        } else if (field === 'key_customer' || field === 'is_supplier') {
          val = val === true || val === 1 ? 1 : 0;
        } else if (field === 'tags' && Array.isArray(val)) {
          val = JSON.stringify(val);
        }
        updateParams.push(val);
      }
    }

    const updateSql = `UPDATE customers SET ${updateClauses.join(', ')} WHERE id = ?`;
    updateParams.push(idParam);

    await c.env.DB.prepare(updateSql).bind(...updateParams).run();

    const updated = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(idParam).first<CustomerRow>();

    return c.json({ success: true, customer: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update customer';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// ============================================================================
// 5. DELETE /api/customers/:id - Soft-delete customer (Admins only)
// ============================================================================
customersApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const idParam = c.req.param('id');

  // Deletion is strictly reserved for Super Admins and Admins
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return c.json(
      { success: false, code: 'INSUFFICIENT_PERMISSIONS', message: 'Only administrators are authorized to deactivate customer records.' },
      403
    );
  }

  try {
    const existing = await c.env.DB.prepare('SELECT id, is_deleted FROM customers WHERE id = ? LIMIT 1')
      .bind(idParam)
      .first<{ id: string; is_deleted: number }>();

    if (!existing || existing.is_deleted === 1) {
      return c.json({ success: false, code: 'NOT_FOUND', message: 'Customer record not found.' }, 404);
    }

    // Perform non-destructive soft deletion
    const softDeleteCustomerSql = `
      UPDATE customers 
      SET is_deleted = 1, deleted_at = datetime('now'), deleted_by_id = ?, updated_at = datetime('now') 
      WHERE id = ?
    `;
    await c.env.DB.prepare(softDeleteCustomerSql).bind(user.id, idParam).run();

    // Soft delete child contacts
    await c.env.DB.prepare(
      "UPDATE customer_contacts SET is_deleted = 1, updated_at = datetime('now') WHERE customer_id = ?"
    )
      .bind(idParam)
      .run();

    return c.json({ success: true, message: 'Customer deactivated successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to deactivate customer';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

export default customersApp;
export { customersApp };
