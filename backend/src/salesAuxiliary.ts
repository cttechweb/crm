/**
 * Sales Auxiliary Documents Endpoints for cool-tech-crm-api
 * 
 * Manages:
 * - Proforma Invoices & Line Items
 * - Payment Receipts
 * - Delivery Notes & Dispatch Items
 * 
 * Protected by authMiddleware & RBAC
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  ProformaInvoiceRow,
  ProformaInvoiceItemRow,
  ReceiptRow,
  DeliveryNoteRow,
  DeliveryNoteItemRow,
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
// 1. PROFORMA INVOICES ROUTER
// ============================================================================
const proformasApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
proformasApp.use('*', authMiddleware);

proformasApp.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const customer = (url.searchParams.get('customer') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM proforma_invoices WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (user.role === 'EMPLOYEE') {
    conditions.push('(owner_id = ? OR prepared_by = ?)');
    bindings.push(user.id, user.full_name);
  }

  if (search) {
    conditions.push('(pi_number LIKE ? OR customer LIKE ? OR quotation_ref LIKE ? OR opportunity_title LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (status && status !== 'All') {
    conditions.push('status = ?');
    bindings.push(status);
  }

  if (customer) {
    conditions.push('customer LIKE ?');
    bindings.push(`%${customer}%`);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<ProformaInvoiceRow>();

  return c.json({
    success: true,
    proformas: rows.results || [],
    total,
    page,
    limit,
  });
});

proformasApp.get('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const proforma = await db
    .prepare('SELECT * FROM proforma_invoices WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<ProformaInvoiceRow>();

  if (!proforma) {
    return c.json({ success: false, message: 'Proforma Invoice not found' }, 404);
  }

  if (!canUserAccessRecord(user, proforma.owner_id)) {
    return c.json({ success: false, message: 'Access denied' }, 403);
  }

  const items = await db
    .prepare('SELECT * FROM proforma_invoice_items WHERE proforma_id = ? ORDER BY sort_order ASC')
    .bind(id)
    .all<ProformaInvoiceItemRow>();

  return c.json({
    success: true,
    proforma: {
      ...proforma,
      items: items.results || [],
    },
  });
});

proformasApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const customer = (body.customer || '').trim();
  if (!customer) {
    return c.json({ success: false, message: 'Customer name is required' }, 400);
  }

  const piNumber = body.piNumber || body.pi_number || `CTPI#${Math.floor(1000 + Math.random() * 9000)}`;

  // Duplicate check
  const existing = await db
    .prepare('SELECT id FROM proforma_invoices WHERE pi_number = ? AND is_deleted = 0')
    .bind(piNumber)
    .first();
  if (existing) {
    return c.json({ success: false, message: `Proforma Invoice ${piNumber} already exists` }, 409);
  }

  const id = body.id || `pi_${Date.now()}`;
  const now = new Date().toISOString();

  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM proforma_invoices').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const quotationRef = body.quotationRef || body.quotation_ref || null;
  const quotationId = body.quotationId || body.quotation_id || null;
  const opportunityId = body.opportunityId || body.opportunity_id || null;
  const opportunityTitle = body.opportunityTitle || body.opportunity_title || null;
  const customerId = body.customerId || body.customer_id || null;
  const issueDate = body.issueDate || body.issue_date || now.split('T')[0];
  const paymentTerms = body.paymentTerms || body.payment_terms || 'Payment within 30 days';
  const amount = Number(body.amount) || 0;
  const vatRate = Number(body.vatRate || body.vat_rate) || 5;
  const vatType = body.vatType || body.vat_type || 'With VAT';
  const vatAmount = body.vatAmount !== undefined ? Number(body.vatAmount) : (amount * (vatRate / 100));
  const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (amount + vatAmount);
  const discount = Number(body.discount) || 0;
  const adjustment = Number(body.adjustment) || 0;
  const status = body.status || 'Pending';
  const preparedBy = body.preparedBy || body.prepared_by || user.full_name;
  const preparedByMobile = body.preparedByMobile || body.prepared_by_mobile || '';
  const owner = body.owner || user.full_name;
  const ownerId = body.ownerId || body.owner_id || user.id;
  const ownerAvatar = body.ownerAvatar || body.owner_avatar || null;
  const phone = body.phone || '';
  const location = body.location || '';
  const attention = body.attention || '';
  const trnNumber = body.trnNumber || body.trn_number || '';
  const lpoNumber = body.lpoNumber || body.lpo_number || '';
  const lpoDate = body.lpoDate || body.lpo_date || '';
  const remarks = body.remarks || '';

  await db
    .prepare(`
      INSERT INTO proforma_invoices (
        id, sl_no, pi_number, quotation_ref, quotation_id, opportunity_id, opportunity_title,
        customer, customer_id, issue_date, payment_terms, amount, vat_type, vat_rate,
        vat_amount, total_amount, discount, adjustment, status, prepared_by, prepared_by_mobile,
        owner, owner_id, owner_avatar, phone, location, attention, trn_number,
        lpo_number, lpo_date, remarks, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `)
    .bind(
      id, nextSl, piNumber, quotationRef, quotationId, opportunityId, opportunityTitle,
      customer, customerId, issueDate, paymentTerms, amount, vatType, vatRate,
      vatAmount, totalAmount, discount, adjustment, status, preparedBy, preparedByMobile,
      owner, ownerId, ownerAvatar, phone, location, attention, trnNumber,
      lpoNumber, lpoDate, remarks, now, now
    )
    .run();

  // Insert items if provided
  if (Array.isArray(body.items) && body.items.length > 0) {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      const itemId = item.id || `pi_item_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO proforma_invoice_items (
            id, proforma_id, code, description, brand, unit, qty, price, total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, item.code || null, item.description || 'Line item',
          item.brand || null, item.unit || 'Pcs', Number(item.qty) || 1,
          Number(item.price) || 0, Number(item.total) || 0, i
        )
        .run();
    }
  }

  const created = await db.prepare('SELECT * FROM proforma_invoices WHERE id = ?').bind(id).first<ProformaInvoiceRow>();

  return c.json({
    success: true,
    proforma: created,
    message: 'Proforma Invoice created successfully',
  }, 201);
});

proformasApp.put('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT * FROM proforma_invoices WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<ProformaInvoiceRow>();

  if (!existing) {
    return c.json({ success: false, message: 'Proforma Invoice not found' }, 404);
  }

  if (!canUserAccessRecord(user, existing.owner_id)) {
    return c.json({ success: false, message: 'Access denied' }, 403);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const now = new Date().toISOString();
  const customer = body.customer !== undefined ? body.customer : existing.customer;
  const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
  const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : existing.vat_rate;
  const vatType = body.vatType || existing.vat_type;
  const vatAmount = body.vatAmount !== undefined ? Number(body.vatAmount) : existing.vat_amount;
  const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : existing.total_amount;
  const status = body.status || existing.status;
  const remarks = body.remarks !== undefined ? body.remarks : existing.remarks;
  const paymentTerms = body.paymentTerms !== undefined ? body.paymentTerms : existing.payment_terms;

  await db
    .prepare(`
      UPDATE proforma_invoices SET
        customer = ?, amount = ?, vat_type = ?, vat_rate = ?, vat_amount = ?,
        total_amount = ?, status = ?, remarks = ?, payment_terms = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(
      customer, amount, vatType, vatRate, vatAmount,
      totalAmount, status, remarks, paymentTerms, now, id
    )
    .run();

  const updated = await db.prepare('SELECT * FROM proforma_invoices WHERE id = ?').bind(id).first<ProformaInvoiceRow>();

  return c.json({
    success: true,
    proforma: updated,
    message: 'Proforma Invoice updated successfully',
  });
});

proformasApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT * FROM proforma_invoices WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<ProformaInvoiceRow>();

  if (!existing) {
    return c.json({ success: false, message: 'Proforma Invoice not found' }, 404);
  }

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete proforma invoices' }, 403);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE proforma_invoices SET is_deleted = 1, deleted_at = ?, deleted_by_id = ? WHERE id = ?')
    .bind(now, user.id, id)
    .run();

  return c.json({ success: true, message: 'Proforma Invoice soft deleted successfully' });
});

proformasApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list: any[] = Array.isArray(body.proformas) ? body.proformas : [];
  let synced = 0;
  let skipped = 0;

  for (const item of list) {
    if (!item || (!item.id && !item.piNumber)) continue;

    const existing = await db
      .prepare('SELECT id FROM proforma_invoices WHERE id = ? OR pi_number = ?')
      .bind(item.id || '', item.piNumber || '')
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const id = item.id || `pi_${Date.now()}_${synced}`;
    const piNumber = item.piNumber || `CTPI#${1000 + synced}`;
    const now = item.issueDate || new Date().toISOString();

    await db
      .prepare(`
        INSERT INTO proforma_invoices (
          id, sl_no, pi_number, quotation_ref, opportunity_title, customer,
          issue_date, payment_terms, amount, vat_amount, total_amount, status,
          prepared_by, owner, owner_id, phone, location, attention, trn_number,
          lpo_number, lpo_date, remarks, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id, item.slNo || (synced + 1), piNumber, item.quotationRef || null,
        item.opportunityTitle || null, item.customer || 'Client Facility',
        item.issueDate || now.split('T')[0], item.paymentTerms || 'Payment within 30 days',
        Number(item.amount) || 0, Number(item.vatAmount) || 0, Number(item.totalAmount) || 0,
        item.status || 'Pending', item.preparedBy || user.full_name, item.owner || user.full_name,
        user.id, item.phone || '', item.location || '', item.attention || '', item.trnNumber || '',
        item.lpoNumber || '', item.lpoDate || '', item.remarks || '', now, now
      )
      .run();

    synced++;
  }

  return c.json({ success: true, synced, skipped });
});

// ============================================================================
// 2. RECEIPTS ROUTER
// ============================================================================
const receiptsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
receiptsApp.use('*', authMiddleware);

receiptsApp.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const paymentMethod = (url.searchParams.get('paymentMethod') || '').trim();
  const customer = (url.searchParams.get('customer') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM receipts WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (user.role === 'EMPLOYEE') {
    conditions.push('(created_by_id = ? OR created_by = ?)');
    bindings.push(user.id, user.full_name);
  }

  if (search) {
    conditions.push('(receipt_number LIKE ? OR customer LIKE ? OR invoice_ref LIKE ? OR reference_number LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (status && status !== 'All') {
    conditions.push('status = ?');
    bindings.push(status);
  }

  if (paymentMethod && paymentMethod !== 'All') {
    conditions.push('payment_method = ?');
    bindings.push(paymentMethod);
  }

  if (customer) {
    conditions.push('customer LIKE ?');
    bindings.push(`%${customer}%`);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<ReceiptRow>();

  return c.json({
    success: true,
    receipts: rows.results || [],
    total,
    page,
    limit,
  });
});

receiptsApp.get('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const receipt = await db
    .prepare('SELECT * FROM receipts WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<ReceiptRow>();

  if (!receipt) {
    return c.json({ success: false, message: 'Receipt not found' }, 404);
  }

  return c.json({ success: true, receipt });
});

receiptsApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const customer = (body.customer || '').trim();
  if (!customer) {
    return c.json({ success: false, message: 'Customer is required' }, 400);
  }

  const receiptNumber = body.receiptNumber || body.receipt_number || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const existing = await db
    .prepare('SELECT id FROM receipts WHERE receipt_number = ? AND is_deleted = 0')
    .bind(receiptNumber)
    .first();
  if (existing) {
    return c.json({ success: false, message: `Receipt ${receiptNumber} already exists` }, 409);
  }

  const id = body.id || `rec_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM receipts').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const invoiceRef = body.invoiceRef || body.invoice_ref || null;
  const invoiceId = body.invoiceId || body.invoice_id || null;
  const customerId = body.customerId || body.customer_id || null;
  const contactPerson = body.contactPerson || body.contact_person || '';
  const phone = body.phone || '';
  const createdBy = body.createdBy || body.created_by || user.full_name;
  const createdById = user.id;
  const createdByAvatar = body.createdByAvatar || body.created_by_avatar || null;
  const receiptType = body.receiptType || body.receipt_type || 'Against Invoice';
  const tags = body.tags || '';
  const paymentMethod = body.paymentMethod || body.payment_method || 'Bank Transfer';
  const receiptDate = body.receiptDate || body.receipt_date || now.split('T')[0];
  const amount = Number(body.amount) || 0;
  const referenceNumber = body.referenceNumber || body.reference_number || '';
  const status = body.status || 'Cleared';

  await db
    .prepare(`
      INSERT INTO receipts (
        id, sl_no, receipt_number, invoice_ref, invoice_id, customer, customer_id,
        contact_person, phone, created_by, created_by_id, created_by_avatar,
        receipt_type, tags, payment_method, receipt_date, amount, reference_number,
        status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `)
    .bind(
      id, nextSl, receiptNumber, invoiceRef, invoiceId, customer, customerId,
      contactPerson, phone, createdBy, createdById, createdByAvatar,
      receiptType, tags, paymentMethod, receiptDate, amount, referenceNumber,
      status, now, now
    )
    .run();

  const created = await db.prepare('SELECT * FROM receipts WHERE id = ?').bind(id).first<ReceiptRow>();

  return c.json({
    success: true,
    receipt: created,
    message: 'Receipt recorded successfully',
  }, 201);
});

receiptsApp.put('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT * FROM receipts WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<ReceiptRow>();

  if (!existing) {
    return c.json({ success: false, message: 'Receipt not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const now = new Date().toISOString();
  const customer = body.customer !== undefined ? body.customer : existing.customer;
  const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
  const status = body.status || existing.status;
  const paymentMethod = body.paymentMethod || existing.payment_method;
  const receiptDate = body.receiptDate || existing.receipt_date;
  const referenceNumber = body.referenceNumber !== undefined ? body.referenceNumber : existing.reference_number;

  await db
    .prepare(`
      UPDATE receipts SET
        customer = ?, amount = ?, status = ?, payment_method = ?,
        receipt_date = ?, reference_number = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(customer, amount, status, paymentMethod, receiptDate, referenceNumber, now, id)
    .run();

  const updated = await db.prepare('SELECT * FROM receipts WHERE id = ?').bind(id).first<ReceiptRow>();

  return c.json({
    success: true,
    receipt: updated,
    message: 'Receipt updated successfully',
  });
});

receiptsApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT * FROM receipts WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<ReceiptRow>();

  if (!existing) {
    return c.json({ success: false, message: 'Receipt not found' }, 404);
  }

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete receipts' }, 403);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE receipts SET is_deleted = 1, deleted_at = ?, deleted_by_id = ? WHERE id = ?')
    .bind(now, user.id, id)
    .run();

  return c.json({ success: true, message: 'Receipt soft deleted successfully' });
});

receiptsApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list: any[] = Array.isArray(body.receipts) ? body.receipts : [];
  let synced = 0;
  let skipped = 0;

  for (const item of list) {
    if (!item || (!item.id && !item.receiptNumber)) continue;

    const existing = await db
      .prepare('SELECT id FROM receipts WHERE id = ? OR receipt_number = ?')
      .bind(item.id || '', item.receiptNumber || '')
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const id = item.id || `rec_${Date.now()}_${synced}`;
    const receiptNumber = item.receiptNumber || `REC-2026-${1000 + synced}`;
    const now = item.receiptDate || new Date().toISOString();

    await db
      .prepare(`
        INSERT INTO receipts (
          id, sl_no, receipt_number, invoice_ref, customer, contact_person,
          phone, created_by, created_by_id, receipt_type, tags, payment_method,
          receipt_date, amount, reference_number, status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id, item.slNo || (synced + 1), receiptNumber, item.invoiceRef || null,
        item.customer || 'Client Facility', item.contactPerson || '', item.phone || '',
        item.createdBy || user.full_name, user.id, item.receiptType || 'Against Invoice',
        Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || ''),
        item.paymentMethod || 'Bank Transfer', item.receiptDate || now.split('T')[0],
        Number(item.amount) || 0, item.referenceNumber || '', item.status || 'Cleared',
        now, now
      )
      .run();

    synced++;
  }

  return c.json({ success: true, synced, skipped });
});

// ============================================================================
// 3. DELIVERY NOTES ROUTER
// ============================================================================
const deliveryNotesApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
deliveryNotesApp.use('*', authMiddleware);

deliveryNotesApp.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const search = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const customer = (url.searchParams.get('customer') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM delivery_notes WHERE is_deleted = 0';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (user.role === 'EMPLOYEE') {
    conditions.push('(owner_id = ? OR owner = ?)');
    bindings.push(user.id, user.full_name);
  }

  if (search) {
    conditions.push('(delivery_note_number LIKE ? OR customer LIKE ? OR order_ref LIKE ? OR driver_name LIKE ?)');
    const term = `%${search}%`;
    bindings.push(term, term, term, term);
  }

  if (status && status !== 'All') {
    conditions.push('status = ?');
    bindings.push(status);
  }

  if (customer) {
    conditions.push('customer LIKE ?');
    bindings.push(`%${customer}%`);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRes = await db.prepare(countQuery).bind(...bindings).first<{ total: number }>();
  const total = countRes ? countRes.total : 0;

  query += ' ORDER BY created_at DESC, sl_no DESC LIMIT ? OFFSET ?';
  const listBindings = [...bindings, limit, offset];

  const rows = await db.prepare(query).bind(...listBindings).all<DeliveryNoteRow>();

  return c.json({
    success: true,
    deliveryNotes: rows.results || [],
    total,
    page,
    limit,
  });
});

deliveryNotesApp.get('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const deliveryNote = await db
    .prepare('SELECT * FROM delivery_notes WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<DeliveryNoteRow>();

  if (!deliveryNote) {
    return c.json({ success: false, message: 'Delivery Note not found' }, 404);
  }

  const items = await db
    .prepare('SELECT * FROM delivery_note_items WHERE delivery_note_id = ? ORDER BY sort_order ASC')
    .bind(id)
    .all<DeliveryNoteItemRow>();

  return c.json({
    success: true,
    deliveryNote: {
      ...deliveryNote,
      items: items.results || [],
    },
  });
});

deliveryNotesApp.post('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const customer = (body.customer || '').trim();
  if (!customer) {
    return c.json({ success: false, message: 'Customer is required' }, 400);
  }

  const deliveryNoteNumber = body.deliveryNoteNumber || body.delivery_note_number || `CTDN#${Math.floor(1000 + Math.random() * 9000)}`;

  const existing = await db
    .prepare('SELECT id FROM delivery_notes WHERE delivery_note_number = ? AND is_deleted = 0')
    .bind(deliveryNoteNumber)
    .first();
  if (existing) {
    return c.json({ success: false, message: `Delivery Note ${deliveryNoteNumber} already exists` }, 409);
  }

  const id = body.id || `dn_${Date.now()}`;
  const now = new Date().toISOString();
  const lastSl = await db.prepare('SELECT MAX(sl_no) as max_sl FROM delivery_notes').first<{ max_sl: number | null }>();
  const nextSl = (lastSl?.max_sl || 0) + 1;

  const owner = body.owner || user.full_name;
  const ownerId = body.ownerId || user.id;
  const ownerAvatar = body.ownerAvatar || null;
  const orderRef = body.orderRef || body.order_ref || null;
  const orderId = body.orderId || body.order_id || null;
  const orderDescription = body.orderDescription || body.order_description || '';
  const customerId = body.customerId || body.customer_id || null;
  const invoiceRef = body.invoiceRef || body.invoice_ref || null;
  const invoiceId = body.invoiceId || body.invoice_id || null;
  const dnType = body.dnType || body.dn_type || 'Customer DN';
  const location = body.location || '';
  const receivedBy = body.receivedBy || body.received_by || '';
  const receivedPhone = body.receivedPhone || body.received_phone || '';
  const costUpdated = body.costUpdated ? 1 : 0;
  const siteLocation = body.siteLocation || body.site_location || location;
  const driverName = body.driverName || body.driver_name || '';
  const vehicleNumber = body.vehicleNumber || body.vehicle_number || '';
  const dispatchDate = body.dispatchDate || body.dispatch_date || now.split('T')[0];
  const itemsCount = Array.isArray(body.items) ? body.items.length : (body.itemsCount || 0);
  const status = body.status || 'Scheduled';

  await db
    .prepare(`
      INSERT INTO delivery_notes (
        id, sl_no, delivery_note_number, owner, owner_id, owner_avatar,
        order_ref, order_id, order_description, customer, customer_id,
        invoice_ref, invoice_id, dn_type, location, received_by, received_phone,
        cost_updated, site_location, driver_name, vehicle_number, dispatch_date,
        items_count, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `)
    .bind(
      id, nextSl, deliveryNoteNumber, owner, ownerId, ownerAvatar,
      orderRef, orderId, orderDescription, customer, customerId,
      invoiceRef, invoiceId, dnType, location, receivedBy, receivedPhone,
      costUpdated, siteLocation, driverName, vehicleNumber, dispatchDate,
      itemsCount, status, now, now
    )
    .run();

  if (Array.isArray(body.items) && body.items.length > 0) {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      const itemId = item.id || `dn_item_${Date.now()}_${i}`;
      await db
        .prepare(`
          INSERT INTO delivery_note_items (
            id, delivery_note_id, item_code, description, unit, quantity, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          itemId, id, item.itemCode || item.code || null,
          item.description || 'Delivered Item', item.unit || 'Pcs',
          Number(item.quantity || item.qty) || 1, i
        )
        .run();
    }
  }

  const created = await db.prepare('SELECT * FROM delivery_notes WHERE id = ?').bind(id).first<DeliveryNoteRow>();

  return c.json({
    success: true,
    deliveryNote: created,
    message: 'Delivery Note created successfully',
  }, 201);
});

deliveryNotesApp.put('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT * FROM delivery_notes WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<DeliveryNoteRow>();

  if (!existing) {
    return c.json({ success: false, message: 'Delivery Note not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const now = new Date().toISOString();
  const customer = body.customer !== undefined ? body.customer : existing.customer;
  const status = body.status || existing.status;
  const driverName = body.driverName !== undefined ? body.driverName : existing.driver_name;
  const vehicleNumber = body.vehicleNumber !== undefined ? body.vehicleNumber : existing.vehicle_number;
  const receivedBy = body.receivedBy !== undefined ? body.receivedBy : existing.received_by;
  const receivedPhone = body.receivedPhone !== undefined ? body.receivedPhone : existing.received_phone;

  await db
    .prepare(`
      UPDATE delivery_notes SET
        customer = ?, status = ?, driver_name = ?, vehicle_number = ?,
        received_by = ?, received_phone = ?, updated_at = ?
      WHERE id = ?
    `)
    .bind(customer, status, driverName, vehicleNumber, receivedBy, receivedPhone, now, id)
    .run();

  const updated = await db.prepare('SELECT * FROM delivery_notes WHERE id = ?').bind(id).first<DeliveryNoteRow>();

  return c.json({
    success: true,
    deliveryNote: updated,
    message: 'Delivery Note updated successfully',
  });
});

deliveryNotesApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT * FROM delivery_notes WHERE id = ? AND is_deleted = 0')
    .bind(id)
    .first<DeliveryNoteRow>();

  if (!existing) {
    return c.json({ success: false, message: 'Delivery Note not found' }, 404);
  }

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete delivery notes' }, 403);
  }

  const now = new Date().toISOString();
  await db
    .prepare('UPDATE delivery_notes SET is_deleted = 1, deleted_at = ?, deleted_by_id = ? WHERE id = ?')
    .bind(now, user.id, id)
    .run();

  return c.json({ success: true, message: 'Delivery Note soft deleted successfully' });
});

deliveryNotesApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON payload' }, 400);
  }

  const list: any[] = Array.isArray(body.deliveryNotes) ? body.deliveryNotes : [];
  let synced = 0;
  let skipped = 0;

  for (const item of list) {
    if (!item || (!item.id && !item.deliveryNoteNumber)) continue;

    const existing = await db
      .prepare('SELECT id FROM delivery_notes WHERE id = ? OR delivery_note_number = ?')
      .bind(item.id || '', item.deliveryNoteNumber || '')
      .first();

    if (existing) {
      skipped++;
      continue;
    }

    const id = item.id || `dn_${Date.now()}_${synced}`;
    const dnNumber = item.deliveryNoteNumber || `CTDN#${1000 + synced}`;
    const now = item.dispatchDate || new Date().toISOString();

    await db
      .prepare(`
        INSERT INTO delivery_notes (
          id, sl_no, delivery_note_number, owner, owner_id, order_ref,
          order_description, customer, invoice_ref, dn_type, location,
          received_by, received_phone, cost_updated, site_location, driver_name,
          vehicle_number, dispatch_date, items_count, status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `)
      .bind(
        id, item.slNo || (synced + 1), dnNumber, item.owner || user.full_name, user.id,
        item.orderRef || null, item.orderDescription || '', item.customer || 'Client Facility',
        item.invoiceRef || null, item.dnType || 'Customer DN', item.location || '',
        item.receivedBy || '', item.receivedPhone || '', item.costUpdated ? 1 : 0,
        item.siteLocation || item.location || '', item.driverName || '', item.vehicleNumber || '',
        item.dispatchDate || now.split('T')[0], item.itemsCount || 0, item.status || 'Scheduled',
        now, now
      )
      .run();

    synced++;
  }

  return c.json({ success: true, synced, skipped });
});

export { proformasApp, receiptsApp, deliveryNotesApp };
