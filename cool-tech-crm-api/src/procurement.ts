/**
 * Procurement and Inventory Endpoints for cool-tech-crm-api
 * 
 * Manages:
 * - Suppliers (/api/suppliers)
 * - Stores & Warehouses (/api/stores)
 * - CRM Inventory & Stocks (/api/inventory)
 * - Purchase Orders & Line Items (/api/purchase-orders)
 * - Stock-In Records & Items (/api/stock-in)
 * - Stock Transfers & Items (/api/stock-transfers)
 * 
 * Protected by authMiddleware and RBAC.
 * SAFETY: Dedicated CRM tables only. Completely isolated from e-commerce database.
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  SupplierRow,
  StoreRow,
  CrmInventoryRow,
  PurchaseOrderRow,
  PurchaseOrderItemRow,
  StockInRecordRow,
  StockInItemRow,
  StockTransferRow,
  StockTransferItemRow,
} from './types.ts';
import { authMiddleware } from './auth.ts';

// Helper: check access
function canUserAccessRecord(user: CrmUserProfile, ownerId: string | null | undefined): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  if (!ownerId) return true;
  if (user.role === 'EMPLOYEE') return ownerId === user.id;
  if (user.role === 'MANAGER') return true;
  return false;
}

// ============================================================================
// 1. SUPPLIERS ROUTER
// ============================================================================
export const suppliersApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
suppliersApp.use('*', authMiddleware);

suppliersApp.get('/', async (c) => {
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM suppliers WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (search) {
    conditions.push('(supplier_name LIKE ? OR company_name LIKE ? OR trn LIKE ? OR contact_person LIKE ? OR phone LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term, term);
  }

  if (status && status !== 'All') {
    conditions.push('status = ?');
    bindings.push(status);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<SupplierRow>();

  return c.json({
    success: true,
    suppliers: rows.results || [],
    total,
    page,
    limit,
  });
});

suppliersApp.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const supplier = await db
    .prepare('SELECT * FROM suppliers WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<SupplierRow>();

  if (!supplier) {
    return c.json({ success: false, message: 'Supplier not found' }, 404);
  }

  return c.json({ success: true, supplier });
});

suppliersApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const supplierName = (body.supplierName || body.supplier_name || '').trim();
  if (!supplierName) {
    return c.json({ success: false, message: 'Supplier name is required' }, 400);
  }

  const id = body.id || `sup_${Date.now()}`;
  const now = new Date().toISOString();

  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM suppliers').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const companyName = body.companyName || body.company_name || null;
  const trn = body.trn || null;
  const contactPerson = body.contactPerson || body.contact_person || '';
  const email = body.email || null;
  const phone = body.phone || '';
  const mobile = body.mobile || null;
  const address = body.address || null;
  const city = body.city || 'Dubai';
  const stateRegion = body.stateRegion || body.state_region || 'Dubai';
  const country = body.country || 'United Arab Emirates';
  const paymentTerms = body.paymentTerms || body.payment_terms || '30 Days';
  const status = body.status || 'Active';
  const customerId = body.customerId || body.customer_id || null;
  const owner = body.owner || user.full_name;
  const ownerId = body.ownerId || body.owner_id || user.id;
  const createdBy = user.full_name;
  const createdById = user.id;
  const remarks = body.remarks || null;

  await db
    .prepare(`
      INSERT INTO suppliers (
        id, sl_no, supplier_name, company_name, trn, contact_person, email, phone, mobile,
        address, city, state_region, country, payment_terms, status, customer_id,
        owner, owner_id, created_by, created_by_id, remarks, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `)
    .bind(
      id, nextSl, supplierName, companyName, trn, contactPerson, email, phone, mobile,
      address, city, stateRegion, country, paymentTerms, status, customerId,
      owner, ownerId, createdBy, createdById, remarks, now, now
    )
    .run();

  const created = await db.prepare('SELECT * FROM suppliers WHERE id = ?').bind(id).first<SupplierRow>();
  return c.json({ success: true, supplier: created }, 201);
});

suppliersApp.put('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM suppliers WHERE id = ? AND is_deleted = 0').bind(id).first<SupplierRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Supplier not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const supplierName = body.supplierName !== undefined ? body.supplierName : (body.supplier_name !== undefined ? body.supplier_name : existing.supplier_name);
  const companyName = body.companyName !== undefined ? body.companyName : (body.company_name !== undefined ? body.company_name : existing.company_name);
  const trn = body.trn !== undefined ? body.trn : existing.trn;
  const contactPerson = body.contactPerson !== undefined ? body.contactPerson : (body.contact_person !== undefined ? body.contact_person : existing.contact_person);
  const email = body.email !== undefined ? body.email : existing.email;
  const phone = body.phone !== undefined ? body.phone : existing.phone;
  const mobile = body.mobile !== undefined ? body.mobile : existing.mobile;
  const address = body.address !== undefined ? body.address : existing.address;
  const paymentTerms = body.paymentTerms !== undefined ? body.paymentTerms : (body.payment_terms !== undefined ? body.payment_terms : existing.payment_terms);
  const status = body.status !== undefined ? body.status : existing.status;
  const remarks = body.remarks !== undefined ? body.remarks : existing.remarks;
  const now = new Date().toISOString();

  await db
    .prepare(`
      UPDATE suppliers SET
        supplier_name = ?, company_name = ?, trn = ?, contact_person = ?,
        email = ?, phone = ?, mobile = ?, address = ?, payment_terms = ?,
        status = ?, remarks = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      supplierName, companyName, trn, contactPerson,
      email, phone, mobile, address, paymentTerms,
      status, remarks, now, id
    )
    .run();

  const updated = await db.prepare('SELECT * FROM suppliers WHERE id = ?').bind(id).first<SupplierRow>();
  return c.json({ success: true, supplier: updated });
});

suppliersApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM suppliers WHERE id = ? AND is_deleted = 0').bind(id).first<SupplierRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Supplier not found' }, 404);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE suppliers SET is_deleted = 1, deleted_at = ?, deleted_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(now, user.id, now, id)
    .run();

  return c.json({ success: true, message: 'Supplier deleted successfully' });
});

suppliersApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list = Array.isArray(body.suppliers) ? body.suppliers : [];
  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const s of list) {
    const id = s.id || `sup_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const name = (s.supplierName || s.supplier_name || s.name || '').trim();
    if (!name) {
      skipped++;
      continue;
    }

    const existing = await db
      .prepare('SELECT id FROM suppliers WHERE id = ? OR supplier_name = ?')
      .bind(id, name)
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM suppliers').first<{ max_sl: number | null }>();
    const nextSl = (lastSl?.max_sl || 0) + 1;

    await db
      .prepare(`
        INSERT INTO suppliers (
          id, sl_no, supplier_name, company_name, trn, contact_person, email, phone, mobile,
          address, city, state_region, country, payment_terms, status,
          owner, owner_id, created_by, created_by_id, remarks, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id, nextSl, name, s.companyName || s.company_name || null, s.trn || null,
        s.contactPerson || s.contact_person || '', s.email || null, s.phone || '', s.mobile || null,
        s.address || null, s.city || 'Dubai', s.stateRegion || 'Dubai', s.country || 'United Arab Emirates',
        s.paymentTerms || '30 Days', s.status || 'Active',
        user.full_name, user.id, user.full_name, user.id, s.remarks || null, now, now
      )
      .run();

    inserted++;
  }

  return c.json({ success: true, inserted, skipped, total: list.length });
});

// ============================================================================
// 2. STORES ROUTER
// ============================================================================
export const storesApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
storesApp.use('*', authMiddleware);

storesApp.get('/', async (c) => {
  const db = c.env.DB;
  const rows = await db
    .prepare('SELECT * FROM stores WHERE is_deleted = 0 ORDER BY sl_no ASC, name ASC')
    .all<StoreRow>();

  return c.json({
    success: true,
    stores: rows.results || [],
    total: (rows.results || []).length,
  });
});

storesApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const name = (body.name || '').trim();
  if (!name) {
    return c.json({ success: false, message: 'Store name is required' }, 400);
  }

  const existing = await db.prepare('SELECT id FROM stores WHERE name = ? AND is_deleted = 0').bind(name).first();
  if (existing) {
    return c.json({ success: false, message: `Store "${name}" already exists` }, 409);
  }

  const id = body.id || `store_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM stores').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  await db
    .prepare(`
      INSERT INTO stores (
        id, sl_no, name, code, location, address, manager_name, manager_id, phone, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id, nextSl, name, body.code || null, body.location || null, body.address || null,
      body.managerName || body.manager_name || user.full_name, user.id, body.phone || null, 1, now, now
    )
    .run();

  const created = await db.prepare('SELECT * FROM stores WHERE id = ?').bind(id).first<StoreRow>();
  return c.json({ success: true, store: created }, 201);
});

storesApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE stores SET is_deleted = 1, deleted_at = ?, deleted_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(now, user.id, now, id)
    .run();

  return c.json({ success: true, message: 'Store removed successfully' });
});

// ============================================================================
// 3. CRM INVENTORY ROUTER
// ============================================================================
export const crmInventoryApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
crmInventoryApp.use('*', authMiddleware);

crmInventoryApp.get('/', async (c) => {
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const store = (url.searchParams.get('store') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const category = (url.searchParams.get('category') || '').trim();
  const brand = (url.searchParams.get('brand') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM crm_inventory WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (search) {
    conditions.push('(code LIKE ? OR name LIKE ? OR brand LIKE ? OR category LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (store && store !== 'All' && store !== 'Select Store') {
    conditions.push('store = ?');
    bindings.push(store);
  }

  if (status && status !== 'All') {
    conditions.push('status = ?');
    bindings.push(status);
  }

  if (category && category !== 'All') {
    conditions.push('category = ?');
    bindings.push(category);
  }

  if (brand && brand !== 'All') {
    conditions.push('brand = ?');
    bindings.push(brand);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<CrmInventoryRow>();

  return c.json({
    success: true,
    items: rows.results || [],
    total,
    page,
    limit,
  });
});

crmInventoryApp.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const item = await db
    .prepare('SELECT * FROM crm_inventory WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<CrmInventoryRow>();

  if (!item) {
    return c.json({ success: false, message: 'Inventory item not found' }, 404);
  }

  return c.json({ success: true, item });
});

crmInventoryApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const name = (body.name || body.productName || '').trim();
  const code = (body.code || body.sku || `SKU-${Date.now().toString().slice(-4)}`).trim();

  if (!name) {
    return c.json({ success: false, message: 'Product item name is required' }, 400);
  }

  const id = body.id || `inv_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM crm_inventory').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const stock = Number(body.stock ?? body.quantity ?? body.currentStock ?? 0);
  const purchaseRate = Number(body.purchaseRate ?? body.unitPrice ?? 0);
  const sellingPrice = Number(body.sellingPrice ?? (purchaseRate * 1.25));

  await db
    .prepare(`
      INSERT INTO crm_inventory (
        id, sl_no, code, name, image, unit, brand, category, type,
        purchase_rate, selling_price, min_stock, stock, current_stock, minimum_stock,
        store, supplier, status, serial_no, owner, owner_id,
        created_by, created_by_id, created_by_role, created_by_email, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `)
    .bind(
      id, nextSl, code, name, body.image || null, body.unit || 'Pcs', body.brand || 'General', body.category || 'General', body.type || 'Standard',
      purchaseRate, sellingPrice, body.minStock || null, stock, stock, Number(body.minimumStock ?? body.reorderLevel ?? 5),
      body.store || 'MAIN WAREHOUSE', body.supplier || null, body.status || 'In Stock', body.serialNo || body.serial_no || null,
      user.full_name, user.id, user.full_name, user.id, user.role, user.email, now, now
    )
    .run();

  const created = await db.prepare('SELECT * FROM crm_inventory WHERE id = ?').bind(id).first<CrmInventoryRow>();
  return c.json({ success: true, item: created }, 201);
});

crmInventoryApp.put('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM crm_inventory WHERE id = ? AND is_deleted = 0').bind(id).first<CrmInventoryRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Inventory item not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const name = body.name !== undefined ? body.name : (body.productName !== undefined ? body.productName : existing.name);
  const code = body.code !== undefined ? body.code : (body.sku !== undefined ? body.sku : existing.code);
  const purchaseRate = body.purchaseRate !== undefined ? Number(body.purchaseRate) : (body.unitPrice !== undefined ? Number(body.unitPrice) : existing.purchase_rate);
  const sellingPrice = body.sellingPrice !== undefined ? Number(body.sellingPrice) : existing.selling_price;
  const stock = body.stock !== undefined ? Number(body.stock) : (body.quantity !== undefined ? Number(body.quantity) : existing.stock);
  const store = body.store !== undefined ? body.store : existing.store;
  const status = body.status !== undefined ? body.status : existing.status;
  const brand = body.brand !== undefined ? body.brand : existing.brand;
  const category = body.category !== undefined ? body.category : existing.category;
  const now = new Date().toISOString();

  await db
    .prepare(`
      UPDATE crm_inventory SET
        name = ?, code = ?, purchase_rate = ?, selling_price = ?,
        stock = ?, current_stock = ?, store = ?, status = ?,
        brand = ?, category = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(name, code, purchaseRate, sellingPrice, stock, stock, store, status, brand, category, now, id)
    .run();

  const updated = await db.prepare('SELECT * FROM crm_inventory WHERE id = ?').bind(id).first<CrmInventoryRow>();
  return c.json({ success: true, item: updated });
});

crmInventoryApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE crm_inventory SET is_deleted = 1, deleted_at = ?, deleted_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(now, user.id, now, id)
    .run();

  return c.json({ success: true, message: 'Inventory item removed successfully' });
});

crmInventoryApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list = Array.isArray(body.items) ? body.items : (Array.isArray(body.stocks) ? body.stocks : []);
  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const it of list) {
    const id = it.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const name = (it.name || it.productName || '').trim();
    const code = (it.code || it.sku || '').trim();

    if (!name) {
      skipped++;
      continue;
    }

    const existing = await db
      .prepare('SELECT id FROM crm_inventory WHERE id = ? OR (code = ? AND code != "")')
      .bind(id, code)
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM crm_inventory').first<{ max_sl: number | null }>();
    const nextSl = (lastSl?.max_sl || 0) + 1;
    const stock = Number(it.stock ?? it.quantity ?? it.currentStock ?? 0);
    const purchaseRate = Number(it.purchaseRate ?? it.unitPrice ?? 0);
    const sellingPrice = Number(it.sellingPrice ?? (purchaseRate * 1.25));

    await db
      .prepare(`
        INSERT INTO crm_inventory (
          id, sl_no, code, name, image, unit, brand, category, type,
          purchase_rate, selling_price, min_stock, stock, current_stock, minimum_stock,
          store, supplier, status, serial_no, owner, owner_id,
          created_by, created_by_id, created_by_role, created_by_email, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id, nextSl, code || `SKU-${nextSl}`, name, it.image || null, it.unit || 'Pcs', it.brand || 'General', it.category || 'General', it.type || 'Standard',
        purchaseRate, sellingPrice, it.minStock || null, stock, stock, Number(it.minimumStock ?? it.reorderLevel ?? 5),
        it.store || 'MAIN WAREHOUSE', it.supplier || null, it.status || 'In Stock', it.serialNo || it.serial_no || null,
        user.full_name, user.id, user.full_name, user.id, user.role, user.email, now, now
      )
      .run();

    inserted++;
  }

  return c.json({ success: true, inserted, skipped, total: list.length });
});

// ============================================================================
// 4. PURCHASE ORDERS ROUTER
// ============================================================================
export const purchaseOrdersApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
purchaseOrdersApp.use('*', authMiddleware);

purchaseOrdersApp.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const supplier = (url.searchParams.get('supplier') || '').trim();
  const approval = (url.searchParams.get('approval') || '').trim();
  const deliveryStatus = (url.searchParams.get('deliveryStatus') || '').trim();
  const paymentStatus = (url.searchParams.get('paymentStatus') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM purchase_orders WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (user.role === 'EMPLOYEE') {
    conditions.push('(owner_id = ? OR prepared_by = ?)');
    bindings.push(user.id, user.full_name);
  }

  if (search) {
    conditions.push('(po_number LIKE ? OR supplier LIKE ? OR reference LIKE ? OR description LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (supplier && supplier !== 'All' && supplier !== 'Select Supplier') {
    conditions.push('supplier = ?');
    bindings.push(supplier);
  }

  if (approval && approval !== 'All') {
    conditions.push('approval = ?');
    bindings.push(approval);
  }

  if (deliveryStatus && deliveryStatus !== 'All') {
    conditions.push('delivery_status = ?');
    bindings.push(deliveryStatus);
  }

  if (paymentStatus && paymentStatus !== 'All') {
    conditions.push('payment_status = ?');
    bindings.push(paymentStatus);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<PurchaseOrderRow>();

  return c.json({
    success: true,
    orders: rows.results || [],
    total,
    page,
    limit,
  });
});

purchaseOrdersApp.get('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const po = await db
    .prepare('SELECT * FROM purchase_orders WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<PurchaseOrderRow>();

  if (!po) {
    return c.json({ success: false, message: 'Purchase Order not found' }, 404);
  }

  if (!canUserAccessRecord(user, po.owner_id) && po.prepared_by !== user.full_name) {
    return c.json({ success: false, message: 'Access denied to this purchase order' }, 403);
  }

  const items = await db
    .prepare('SELECT * FROM purchase_order_items WHERE purchase_order_id = ? ORDER BY sort_order ASC')
    .bind(id)
    .all<PurchaseOrderItemRow>();

  return c.json({
    success: true,
    order: {
      ...po,
      items: items.results || [],
    },
  });
});

purchaseOrdersApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const supplier = (body.supplier || '').trim();
  if (!supplier || supplier === 'Select Supplier') {
    return c.json({ success: false, message: 'Supplier is required' }, 400);
  }

  const poNumber = body.poNumber || body.po_number || `CTPO#${Math.floor(2500 + Math.random() * 500)}`;

  const existing = await db
    .prepare('SELECT id FROM purchase_orders WHERE po_number = ? AND is_deleted = 0')
    .bind(poNumber)
    .first();

  if (existing) {
    return c.json({ success: false, message: `Purchase order ${poNumber} already exists` }, 409);
  }

  const id = body.id || `po_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM purchase_orders').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const date = body.date || now.split('T')[0];
  const expectedDeliveryDate = body.expectedDeliveryDate || body.expected_delivery_date || null;
  const orderRef = body.orderRef || body.order_ref || null;
  const reference = body.reference || null;
  const description = body.description || null;
  const opportunityOrder = body.opportunityOrder || body.opportunity_order || null;
  const projectNumber = body.projectNumber || body.project_number || null;
  const projectName = body.projectName || body.project_name || null;
  const vatType = body.vatType || body.vat_type || 'with_vat';
  const vatRate = Number(body.vatRate || body.vat_rate) || 5;
  const attention = body.attention || null;
  const preparedBy = body.preparedBy || body.prepared_by || user.full_name;
  const preparedByMobile = body.preparedByMobile || body.prepared_by_mobile || null;
  const preparedByEmail = body.preparedByEmail || body.prepared_by_email || user.email;
  const preparedByDesignation = body.preparedByDesignation || body.prepared_by_designation || 'Procurement';
  const termsCondition = body.termsCondition || body.terms_condition || null;
  const termsConditionText = body.termsConditionText || body.terms_condition_text || null;
  const amount = Number(body.amount) || 0;
  const vat = Number(body.vat) || (vatType === 'with_vat' ? amount * 0.05 : 0);
  const discount = Number(body.discount) || 0;
  const adjustment = Number(body.adjustment) || 0;
  const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (amount + vat - discount + adjustment);
  const invoiceReceived = body.invoiceReceived || body.invoice_received || null;
  const approval = body.approval || 'Waiting for Final Approval';
  const deliveryStatus = body.deliveryStatus || body.delivery_status || 'Pending';
  const paymentStatus = body.paymentStatus || body.payment_status || 'Due';
  const owner = body.owner || user.full_name;
  const ownerId = body.ownerId || body.owner_id || user.id;
  const ownerAvatar = body.ownerAvatar || body.owner_avatar || null;

  await db
    .prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, expected_delivery_date, supplier, order_ref, reference,
        description, opportunity_order, project_number, project_name, vat_type, vat_rate,
        attention, prepared_by, prepared_by_mobile, prepared_by_email, prepared_by_designation,
        terms_condition, terms_condition_text, amount, vat, discount, adjustment, total_amount,
        invoice_received, approval, delivery_status, payment_status, owner, owner_id, owner_avatar,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `)
    .bind(
      id, nextSl, poNumber, date, expectedDeliveryDate, supplier, orderRef, reference,
      description, opportunityOrder, projectNumber, projectName, vatType, vatRate,
      attention, preparedBy, preparedByMobile, preparedByEmail, preparedByDesignation,
      termsCondition, termsConditionText, amount, vat, discount, adjustment, totalAmount,
      invoiceReceived, approval, deliveryStatus, paymentStatus, owner, ownerId, ownerAvatar,
      now, now
    )
    .run();

  if (Array.isArray(body.items) && body.items.length > 0) {
    for (let i = 0; i < body.items.length; i++) {
      const it = body.items[i];
      const itemId = it.id || `poi_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO purchase_order_items (
            id, purchase_order_id, code, description, unit, brand, qty, delivery_pending, amount, total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, it.code || null, it.description || it.item || 'Item',
          it.unit || 'Pcs', it.brand || null, Number(it.qty) || 1, Number(it.deliveryPending ?? it.qty) || 1,
          Number(it.amount ?? it.purchaseRate) || 0, Number(it.total) || 0, i
        )
        .run();
    }
  }

  const created = await db.prepare('SELECT * FROM purchase_orders WHERE id = ?').bind(id).first<PurchaseOrderRow>();
  return c.json({ success: true, order: created }, 201);
});

purchaseOrdersApp.put('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND is_deleted = 0').bind(id).first<PurchaseOrderRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Purchase Order not found' }, 404);
  }

  if (!canUserAccessRecord(user, existing.owner_id) && existing.prepared_by !== user.full_name) {
    return c.json({ success: false, message: 'Access denied' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const now = new Date().toISOString();
  const supplier = body.supplier !== undefined ? body.supplier : existing.supplier;
  const date = body.date !== undefined ? body.date : existing.date;
  const expectedDeliveryDate = body.expectedDeliveryDate !== undefined ? body.expectedDeliveryDate : existing.expected_delivery_date;
  const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
  const vat = body.vat !== undefined ? Number(body.vat) : existing.vat;
  const discount = body.discount !== undefined ? Number(body.discount) : existing.discount;
  const adjustment = body.adjustment !== undefined ? Number(body.adjustment) : existing.adjustment;
  const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (amount + vat - discount + adjustment);
  const approval = body.approval !== undefined ? body.approval : existing.approval;
  const deliveryStatus = body.deliveryStatus !== undefined ? body.deliveryStatus : existing.delivery_status;
  const paymentStatus = body.paymentStatus !== undefined ? body.paymentStatus : existing.payment_status;
  const description = body.description !== undefined ? body.description : existing.description;
  const reference = body.reference !== undefined ? body.reference : existing.reference;

  await db
    .prepare(`
      UPDATE purchase_orders SET
        supplier = ?, date = ?, expected_delivery_date = ?, amount = ?, vat = ?,
        discount = ?, adjustment = ?, total_amount = ?, approval = ?, delivery_status = ?,
        payment_status = ?, description = ?, reference = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      supplier, date, expectedDeliveryDate, amount, vat,
      discount, adjustment, totalAmount, approval, deliveryStatus,
      paymentStatus, description, reference, now, id
    )
    .run();

  // If items updated
  if (Array.isArray(body.items)) {
    await db.prepare('DELETE FROM purchase_order_items WHERE purchase_order_id = ?').bind(id).run();
    for (let i = 0; i < body.items.length; i++) {
      const it = body.items[i];
      const itemId = it.id || `poi_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO purchase_order_items (
            id, purchase_order_id, code, description, unit, brand, qty, delivery_pending, amount, total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, it.code || null, it.description || it.item || 'Item',
          it.unit || 'Pcs', it.brand || null, Number(it.qty) || 1, Number(it.deliveryPending ?? it.qty) || 1,
          Number(it.amount ?? it.purchaseRate) || 0, Number(it.total) || 0, i
        )
        .run();
    }
  }

  const updated = await db.prepare('SELECT * FROM purchase_orders WHERE id = ?').bind(id).first<PurchaseOrderRow>();
  return c.json({ success: true, order: updated });
});

purchaseOrdersApp.patch('/:id/status', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND is_deleted = 0').bind(id).first<PurchaseOrderRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Purchase Order not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const approval = body.approval || existing.approval;
  const deliveryStatus = body.deliveryStatus || body.delivery_status || existing.delivery_status;
  const paymentStatus = body.paymentStatus || body.payment_status || existing.payment_status;
  const now = new Date().toISOString();

  await db
    .prepare(`
      UPDATE purchase_orders SET
        approval = ?, delivery_status = ?, payment_status = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(approval, deliveryStatus, paymentStatus, now, id)
    .run();

  const updated = await db.prepare('SELECT * FROM purchase_orders WHERE id = ?').bind(id).first<PurchaseOrderRow>();
  return c.json({ success: true, order: updated });
});

purchaseOrdersApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND is_deleted = 0').bind(id).first<PurchaseOrderRow>();
  if (!existing) {
    return c.json({ success: false, message: 'Purchase Order not found' }, 404);
  }

  if (!canUserAccessRecord(user, existing.owner_id)) {
    return c.json({ success: false, message: 'Access denied' }, 403);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE purchase_orders SET is_deleted = 1, deleted_at = ?, deleted_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(now, user.id, now, id)
    .run();

  return c.json({ success: true, message: 'Purchase Order deleted successfully' });
});

purchaseOrdersApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list = Array.isArray(body.orders) ? body.orders : (Array.isArray(body.purchaseOrders) ? body.purchaseOrders : []);
  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const po of list) {
    const id = po.id || `po_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const poNumber = po.poNumber || po.po_number || '';
    if (!poNumber) {
      skipped++;
      continue;
    }

    const existing = await db
      .prepare('SELECT id FROM purchase_orders WHERE id = ? OR po_number = ?')
      .bind(id, poNumber)
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM purchase_orders').first<{ max_sl: number | null }>();
    const nextSl = (lastSl?.max_sl || 0) + 1;

    await db
      .prepare(`
        INSERT INTO purchase_orders (
          id, sl_no, po_number, date, expected_delivery_date, supplier, order_ref, reference,
          description, opportunity_order, project_number, project_name, vat_type, vat_rate,
          attention, prepared_by, prepared_by_mobile, prepared_by_email, prepared_by_designation,
          terms_condition, terms_condition_text, amount, vat, discount, adjustment, total_amount,
          invoice_received, approval, delivery_status, payment_status, owner, owner_id, owner_avatar,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?
        )
      `)
      .bind(
        id, nextSl, poNumber, po.date || now.split('T')[0], po.expectedDeliveryDate || null, po.supplier || 'General Supplier',
        po.order || po.orderRef || null, po.reference || null, po.description || null, po.opportunityOrder || null,
        po.projectNumber || null, po.projectName || null, po.vatType || 'with_vat', 5,
        po.attention || null, po.preparedBy || user.full_name, po.preparedByMobile || null, po.preparedByEmail || user.email,
        po.preparedByDesignation || 'Procurement', po.termsCondition || null, po.termsConditionText || null,
        Number(po.amount) || 0, Number(po.vat) || 0, Number(po.discount) || 0, Number(po.adjustment) || 0,
        Number(po.totalAmount) || Number(po.amount) || 0, po.invoiceReceived || null, po.approval || 'Waiting for Final Approval',
        po.deliveryStatus || 'Pending', po.paymentStatus || 'Due', po.owner || user.full_name, user.id, po.ownerAvatar || null,
        now, now
      )
      .run();

    if (Array.isArray(po.items) && po.items.length > 0) {
      for (let i = 0; i < po.items.length; i++) {
        const it = po.items[i];
        const itemId = it.id || `poi_${id}_${i}`;
        await db
          .prepare(`
            INSERT INTO purchase_order_items (
              id, purchase_order_id, code, description, unit, brand, qty, delivery_pending, amount, total, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            itemId, id, it.code || null, it.description || it.item || 'Item',
            it.unit || 'Pcs', it.brand || null, Number(it.qty) || 1, Number(it.deliveryPending ?? it.qty) || 1,
            Number(it.amount ?? it.purchaseRate) || 0, Number(it.total) || 0, i
          )
          .run();
      }
    }

    inserted++;
  }

  return c.json({ success: true, inserted, skipped, total: list.length });
});

// ============================================================================
// 5. STOCK-IN ROUTER
// ============================================================================
export const stockInApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
stockInApp.use('*', authMiddleware);

stockInApp.get('/', async (c) => {
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const supplier = (url.searchParams.get('supplier') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM stock_in_vouchers WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (search) {
    conditions.push('(stock_in_no LIKE ? OR supplier LIKE ? OR lpo_number LIKE ? OR delivery_note LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (supplier && supplier !== 'All') {
    conditions.push('supplier = ?');
    bindings.push(supplier);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<StockInRecordRow>();

  return c.json({
    success: true,
    records: rows.results || [],
    total,
    page,
    limit,
  });
});

stockInApp.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const record = await db
    .prepare('SELECT * FROM stock_in_vouchers WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<StockInRecordRow>();

  if (!record) {
    return c.json({ success: false, message: 'Stock-in record not found' }, 404);
  }

  const items = await db
    .prepare('SELECT * FROM stock_in_items WHERE voucher_id = ? ORDER BY sl_no ASC')
    .bind(id)
    .all<any>();

  const normalizedItems = (items.results || []).map((it: any) => ({
    ...it,
    stock_in_id: it.voucher_id || it.stock_in_id,
    voucher_id: it.voucher_id || it.stock_in_id,
    item: it.item_name || it.item || 'Item',
    item_name: it.item_name || it.item || 'Item',
  }));

  return c.json({
    success: true,
    record: {
      ...record,
      items: normalizedItems,
    },
  });
});

stockInApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const supplier = (body.supplier || '').trim();
  if (!supplier || supplier === 'Select') {
    return c.json({ success: false, message: 'Supplier is required' }, 400);
  }

  const stockInNo = body.stockInNo || body.stock_in_no || `STK-${Date.now().toString().slice(-4)}`;
  const id = body.id || `si_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM stock_in_vouchers').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;
  const totalItems = Array.isArray(body.items)
    ? body.items.reduce((acc: number, curr: any) => acc + (Number(curr.qty) || 1), 0)
    : Number(body.totalItems || 1);

  await db
    .prepare(`
      INSERT INTO stock_in_vouchers (
        id, sl_no, stock_in_no, date, supplier, store, delivery_note, do_file_name,
        lpo_number, purchase_invoice_number, order_name, total_items, status,
        created_by, created_formatted, created_at, updated_at, is_deleted
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 0
      )
    `)
    .bind(
      id, nextSl, stockInNo, body.date || now.split('T')[0], supplier,
      body.store || 'MAIN WAREHOUSE',
      body.deliveryNote || body.delivery_note || '',
      body.doFileName || body.do_file_name || '',
      body.lpoNumber || body.lpo_number || '',
      body.purchaseInvoiceNumber || body.purchase_invoice_number || '',
      body.order || body.orderName || body.order_name || '',
      totalItems,
      body.status || 'Approved',
      user.full_name || body.createdBy || 'MOHAMMED ISHAQ',
      body.createdFormatted || now,
      now, now
    )
    .run();

  if (Array.isArray(body.items) && body.items.length > 0) {
    for (let i = 0; i < body.items.length; i++) {
      const it = body.items[i];
      const itemId = it.id || `sii_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO stock_in_items (
            id, voucher_id, sl_no, code, item_name, unit, brand, purchase_rate, selling_price, qty, current_stock, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, i + 1, it.code || null,
          it.item_name || it.item || it.description || 'Item',
          it.unit || 'Pcs', it.brand || null,
          Number(it.purchaseRate ?? it.purchase_rate) || 0,
          Number(it.sellingPrice ?? it.selling_price) || 0,
          Number(it.qty) || 1,
          Number(it.currentStock ?? it.current_stock ?? it.qty) || 1,
          i
        )
        .run();
    }
  }

  const created = await db.prepare('SELECT * FROM stock_in_vouchers WHERE id = ?').bind(id).first<StockInRecordRow>();
  return c.json({ success: true, record: created }, 201);
});

stockInApp.put('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const now = new Date().toISOString();
  const totalItems = Array.isArray(body.items)
    ? body.items.reduce((acc: number, curr: any) => acc + (Number(curr.qty) || 1), 0)
    : undefined;

  await db
    .prepare(`
      UPDATE stock_in_vouchers SET
        stock_in_no = COALESCE(?, stock_in_no),
        date = COALESCE(?, date),
        supplier = COALESCE(?, supplier),
        store = COALESCE(?, store),
        delivery_note = COALESCE(?, delivery_note),
        lpo_number = COALESCE(?, lpo_number),
        purchase_invoice_number = COALESCE(?, purchase_invoice_number),
        total_items = COALESCE(?, total_items),
        updated_at = ?
      WHERE id = ? AND is_deleted = 0
    `)
    .bind(
      body.stockInNo || body.stock_in_no || null,
      body.date || null,
      body.supplier || null,
      body.store || null,
      body.deliveryNote || body.delivery_note || null,
      body.lpoNumber || body.lpo_number || null,
      body.purchaseInvoiceNumber || body.purchase_invoice_number || null,
      totalItems ?? null,
      now,
      id
    )
    .run();

  if (Array.isArray(body.items)) {
    await db.prepare('DELETE FROM stock_in_items WHERE voucher_id = ?').bind(id).run();
    for (let i = 0; i < body.items.length; i++) {
      const it = body.items[i];
      const itemId = it.id || `sii_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO stock_in_items (
            id, voucher_id, sl_no, code, item_name, unit, brand, purchase_rate, selling_price, qty, current_stock, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, i + 1, it.code || null,
          it.item_name || it.item || it.description || 'Item',
          it.unit || 'Pcs', it.brand || null,
          Number(it.purchaseRate ?? it.purchase_rate) || 0,
          Number(it.sellingPrice ?? it.selling_price) || 0,
          Number(it.qty) || 1,
          Number(it.currentStock ?? it.current_stock ?? it.qty) || 1,
          i
        )
        .run();
    }
  }

  const updated = await db.prepare('SELECT * FROM stock_in_vouchers WHERE id = ?').bind(id).first<StockInRecordRow>();
  return c.json({ success: true, record: updated });
});

stockInApp.delete('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE stock_in_vouchers SET is_deleted = 1, updated_at = ? WHERE id = ?')
    .bind(now, id)
    .run();

  return c.json({ success: true, message: 'Stock-in record deleted successfully' });
});

stockInApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list = Array.isArray(body.records) ? body.records : (Array.isArray(body.stockInList) ? body.stockInList : []);
  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const s of list) {
    const id = s.id || `si_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const stockInNo = s.stockInNo || s.stock_in_no || '';
    if (!stockInNo) {
      skipped++;
      continue;
    }

    const existing = await db
      .prepare('SELECT id FROM stock_in_vouchers WHERE id = ? OR stock_in_no = ?')
      .bind(id, stockInNo)
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM stock_in_vouchers').first<{ max_sl: number | null }>();
    const nextSl = (lastSl?.max_sl || 0) + 1;
    const totalItems = Array.isArray(s.items)
      ? s.items.reduce((acc: number, curr: any) => acc + (Number(curr.qty) || 1), 0)
      : Number(s.totalItems || 1);

    await db
      .prepare(`
        INSERT INTO stock_in_vouchers (
          id, sl_no, stock_in_no, date, supplier, store, delivery_note, do_file_name,
          lpo_number, purchase_invoice_number, order_name, total_items, status,
          created_by, created_formatted, created_at, updated_at, is_deleted
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, 0
        )
      `)
      .bind(
        id, nextSl, stockInNo, s.date || now.split('T')[0], s.supplier || 'General Supplier',
        s.store || 'MAIN WAREHOUSE',
        s.deliveryNote || s.delivery_note || '',
        s.doFileName || s.do_file_name || '',
        s.lpoNumber || s.lpo_number || '',
        s.purchaseInvoiceNumber || s.purchase_invoice_number || '',
        s.order || s.orderName || s.order_name || '',
        totalItems,
        s.status || 'Approved',
        s.createdBy || user.full_name || 'MOHAMMED ISHAQ',
        s.createdFormatted || now,
        now, now
      )
      .run();

    if (Array.isArray(s.items) && s.items.length > 0) {
      for (let i = 0; i < s.items.length; i++) {
        const it = s.items[i];
        const itemId = it.id || `sii_${id}_${i}`;
        await db
          .prepare(`
            INSERT INTO stock_in_items (
              id, voucher_id, sl_no, code, item_name, unit, brand, purchase_rate, selling_price, qty, current_stock, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            itemId, id, i + 1, it.code || null,
            it.item_name || it.item || it.description || 'Item',
            it.unit || 'Pcs', it.brand || null,
            Number(it.purchaseRate ?? it.purchase_rate) || 0,
            Number(it.sellingPrice ?? it.selling_price) || 0,
            Number(it.qty) || 1,
            Number(it.currentStock ?? it.current_stock ?? it.qty) || 1,
            i
          )
          .run();
      }
    }

    inserted++;
  }

  return c.json({ success: true, inserted, skipped, total: list.length });
});

// ============================================================================
// 6. STOCK TRANSFERS ROUTER
// ============================================================================
export const stockTransfersApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
stockTransfersApp.use('*', authMiddleware);

stockTransfersApp.get('/', async (c) => {
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM stock_transfers WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (search) {
    conditions.push('(transfer_no LIKE ? OR transfer_from LIKE ? OR transfer_to LIKE ? OR owner LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<StockTransferRow>();

  return c.json({
    success: true,
    transfers: rows.results || [],
    total,
    page,
    limit,
  });
});

stockTransfersApp.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  const transfer = await db
    .prepare('SELECT * FROM stock_transfers WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<StockTransferRow>();

  if (!transfer) {
    return c.json({ success: false, message: 'Stock transfer not found' }, 404);
  }

  const items = await db
    .prepare('SELECT * FROM stock_transfer_items WHERE stock_transfer_id = ? ORDER BY sort_order ASC')
    .bind(id)
    .all<StockTransferItemRow>();

  return c.json({
    success: true,
    transfer: {
      ...transfer,
      items: items.results || [],
    },
  });
});

stockTransfersApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const transferFrom = (body.transferFrom || body.transfer_from || '').trim();
  const transferTo = (body.transferTo || body.transfer_to || '').trim();

  if (!transferFrom || !transferTo) {
    return c.json({ success: false, message: 'Source and destination stores are required' }, 400);
  }

  const transferNo = body.transferNo || body.transfer_no || `TRF-${Date.now().toString().slice(-4)}`;
  const id = body.id || `st_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM stock_transfers').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  await db
    .prepare(`
      INSERT INTO stock_transfers (
        id, sl_no, transfer_no, date, owner, owner_id, owner_avatar,
        transfer_from, transfer_to, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id, nextSl, transferNo, body.date || now.split('T')[0],
      body.owner || user.full_name, user.id, body.ownerAvatar || null,
      transferFrom, transferTo, body.status || 'Completed', body.notes || null, now, now
    )
    .run();

  if (Array.isArray(body.items) && body.items.length > 0) {
    for (let i = 0; i < body.items.length; i++) {
      const it = body.items[i];
      const itemId = it.id || `sti_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO stock_transfer_items (
            id, stock_transfer_id, code, item_name, unit, qty, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, it.code || null, it.itemName || it.item_name || it.item || 'Item',
          it.unit || 'Pcs', Number(it.qty) || 1, i
        )
        .run();
    }
  }

  const created = await db.prepare('SELECT * FROM stock_transfers WHERE id = ?').bind(id).first<StockTransferRow>();
  return c.json({ success: true, transfer: created }, 201);
});

stockTransfersApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE stock_transfers SET is_deleted = 1, deleted_at = ?, deleted_by_id = ?, updated_at = ? WHERE id = ?')
    .bind(now, user.id, now, id)
    .run();

  return c.json({ success: true, message: 'Stock transfer deleted successfully' });
});

stockTransfersApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list = Array.isArray(body.transfers) ? body.transfers : (Array.isArray(body.stockTransfers) ? body.stockTransfers : []);
  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const st of list) {
    const id = st.id || `st_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const transferNo = st.transferNo || st.transfer_no || '';
    if (!transferNo) {
      skipped++;
      continue;
    }

    const existing = await db
      .prepare('SELECT id FROM stock_transfers WHERE id = ? OR transfer_no = ?')
      .bind(id, transferNo)
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM stock_transfers').first<{ max_sl: number | null }>();
    const nextSl = (lastSl?.max_sl || 0) + 1;

    await db
      .prepare(`
        INSERT INTO stock_transfers (
          id, sl_no, transfer_no, date, owner, owner_id, owner_avatar,
          transfer_from, transfer_to, status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, nextSl, transferNo, st.date || now.split('T')[0],
        st.owner || user.full_name, user.id, st.ownerAvatar || null,
        st.transferFrom || st.transfer_from || 'MAIN WAREHOUSE',
        st.transferTo || st.transfer_to || 'M-42 OFFICE',
        st.status || 'Completed', st.notes || null, now, now
      )
      .run();

    inserted++;
  }

  return c.json({ success: true, inserted, skipped, total: list.length });
});
