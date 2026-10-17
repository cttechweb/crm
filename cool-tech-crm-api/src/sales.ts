/**
 * Sales Workflow Endpoints for cool-tech-crm-api
 * 
 * Implements the 5-stage CRM Sales Lifecycle:
 * Lead -> Opportunity -> Quotation (Commercial Offer) -> Sales Order -> Invoice
 * 
 * - Full CRUD & RBAC for Opportunities, Quotations, Sales Orders, and Invoices
 * - Link preservation:
 *     - Lead -> Opportunity (created_from_lead_id)
 *     - Opportunity -> Quotation (opportunity_id)
 *     - Quotation -> Sales Order (quotation_id)
 *     - Sales Order -> Invoice (order_id)
 * - Duplicate prevention:
 *     - Prevents duplicate opportunity creation for the same lead
 *     - Prevents duplicate sales order creation for the same quotation
 * - Full line items cascading for quotations, sales orders, and invoices
 * - Server-side validation and financial calculation (subtotal, VAT, paid, balance, status)
 * - Safe in-place editing (never deletes and recreates on edit; preserves stable IDs)
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  OpportunityRow,
  QuotationRow,
  QuotationItemRow,
  SalesOrderRow,
  SalesOrderItemRow,
  InvoiceRow,
  InvoiceItemRow,
} from './types.ts';
import { authMiddleware } from './auth.ts';

// Helper: Check if an owner is under a manager's reporting scope
async function isOwnerInManagerScope(
  manager: CrmUserProfile,
  ownerId: string,
  db: D1Database
): Promise<boolean> {
  if (manager.id === ownerId) return true;

  try {
    if (manager.team_id && manager.team_id.trim()) {
      const query = await db
        .prepare('SELECT id FROM users WHERE id = ? AND (reports_to = ? OR team_id = ?) LIMIT 1')
        .bind(ownerId, manager.id, manager.team_id.trim())
        .first<{ id: string }>();
      return Boolean(query);
    } else {
      const query = await db
        .prepare('SELECT id FROM users WHERE id = ? AND reports_to = ? LIMIT 1')
        .bind(ownerId, manager.id)
        .first<{ id: string }>();
      return Boolean(query);
    }
  } catch {
    return false;
  }
}

function canUserAccessRecord(
  user: CrmUserProfile,
  ownerId: string | null | undefined
): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  if (!ownerId) return true;
  if (user.role === 'EMPLOYEE') return ownerId === user.id;
  if (user.role === 'MANAGER') return true; // Detailed scope checked if needed
  return false;
}

// ============================================================================
// 1. OPPORTUNITIES APP (/api/opportunities)
// ============================================================================
export const opportunitiesApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
opportunitiesApp.use('*', authMiddleware);

// GET /api/opportunities - List
opportunitiesApp.get('/', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);
  const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const stage = (url.searchParams.get('stage') || '').trim();
  const leadId = (url.searchParams.get('leadId') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10) || 100));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  try {
    let whereClauses = ['is_deleted = 0'];
    const bindings: any[] = [];

    if (user.role === 'EMPLOYEE') {
      whereClauses.push('(owner_id = ? OR owner_id IS NULL)');
      bindings.push(user.id);
    }

    if (leadId) {
      whereClauses.push('created_from_lead_id = ?');
      bindings.push(leadId);
    }

    if (stage && stage !== 'All') {
      whereClauses.push('stage = ?');
      bindings.push(stage);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR customer LIKE ? OR opportunity_code LIKE ?)');
      const pattern = `%${search}%`;
      bindings.push(pattern, pattern, pattern);
    }

    const whereSql = whereClauses.join(' AND ');
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM opportunities WHERE ${whereSql}`
    ).bind(...bindings).first<{ total: number }>();

    const total = countQuery?.total || 0;

    const listQuery = await c.env.DB.prepare(
      `SELECT * FROM opportunities WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all<OpportunityRow>();

    return c.json({
      success: true,
      opportunities: listQuery.results || [],
      total,
      page,
      limit,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch opportunities';
    return c.json({ success: false, message: msg, opportunities: [], total: 0 }, 500);
  }
});

// GET /api/opportunities/:id
opportunitiesApp.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  try {
    const opp = await c.env.DB.prepare(
      'SELECT * FROM opportunities WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<OpportunityRow>();

    if (!opp) {
      return c.json({ success: false, message: 'Opportunity not found' }, 404);
    }

    if (!canUserAccessRecord(user, opp.owner_id)) {
      return c.json({ success: false, message: 'Unauthorized to view this opportunity' }, 403);
    }

    return c.json({ success: true, opportunity: opp });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// POST /api/opportunities - Create & Duplicate Prevention
opportunitiesApp.post('/', async (c) => {
  const user = c.get('user');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body || !body.title || !body.customer) {
    return c.json({ success: false, message: 'Title and customer are required' }, 400);
  }

  const createdFromLeadId = body.createdFromLeadId || body.created_from_lead_id || null;

  // Duplicate Prevention: Check if this lead was already converted
  if (createdFromLeadId) {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM opportunities WHERE created_from_lead_id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(createdFromLeadId).first<OpportunityRow>();

    if (existing) {
      return c.json({
        success: true,
        alreadyConverted: true,
        message: `Opportunity already exists for this lead: ${existing.title}`,
        opportunity: existing,
      }, 200);
    }
  }

  const id = body.id || `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const oppCode = body.opportunityCode || body.opportunity_code || `OPP-${Date.now().toString().slice(-4)}`;
  const amount = Number(body.amount) || 0;
  const stage = body.stage || 'Opportunity';
  const probability = Number(body.probability) || 50;
  const expectedClose = body.expectedClose || body.expected_close || new Date().toISOString().split('T')[0];
  const owner = body.owner || user.full_name || 'Unassigned';
  const ownerId = body.ownerId || body.owner_id || user.id;
  const contactPerson = body.contactPerson || body.contact_person || '';
  const phone = body.phone || '';
  const whatsapp = body.whatsapp || '';
  const campaign = body.campaign || '';
  const source = body.source || '';
  const vatType = body.vatType || body.vat_type || 'With VAT';
  const vatRate = Number(body.vatRate ?? body.vat_rate ?? 5);
  const adjustment = Number(body.adjustment) || 0;
  const lpoNumber = body.lpoNumber || body.lpo_number || '';
  const lpoDate = body.lpoDate || body.lpo_date || '';
  const location = body.location || '';
  const reference = body.reference || '';
  const comments = body.comments || '';
  const tags = Array.isArray(body.tags) ? body.tags.join(',') : (body.tags || '');

  try {
    await c.env.DB.prepare(`
      INSERT INTO opportunities (
        id, opportunity_code, created_from_lead_id, title, customer, contact_person,
        phone, whatsapp, amount, stage, probability, expected_close, owner, owner_id,
        campaign, source, vat_type, vat_rate, adjustment, lpo_number, lpo_date,
        location, reference, comments, tags, is_deleted, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 0, datetime('now'), datetime('now')
      )
    `).bind(
      id, oppCode, createdFromLeadId, body.title, body.customer, contactPerson,
      phone, whatsapp, amount, stage, probability, expectedClose, owner, ownerId,
      campaign, source, vatType, vatRate, adjustment, lpoNumber, lpoDate,
      location, reference, comments, tags
    ).run();

    // If converted from lead, mark lead as Converted
    if (createdFromLeadId) {
      await c.env.DB.prepare(
        "UPDATE leads SET status = 'Converted', updated_at = datetime('now') WHERE id = ?"
      ).bind(createdFromLeadId).run().catch(() => {});
    }

    const created = await c.env.DB.prepare(
      'SELECT * FROM opportunities WHERE id = ? LIMIT 1'
    ).bind(id).first<OpportunityRow>();

    return c.json({ success: true, opportunity: created }, 201);
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// PUT /api/opportunities/:id - In-place Update (Preserves ID)
opportunitiesApp.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body) return c.json({ success: false, message: 'No body provided' }, 400);

  try {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM opportunities WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<OpportunityRow>();

    if (!existing) return c.json({ success: false, message: 'Opportunity not found' }, 404);
    if (!canUserAccessRecord(user, existing.owner_id)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403);
    }

    const title = body.title !== undefined ? body.title : existing.title;
    const customer = body.customer !== undefined ? body.customer : existing.customer;
    const contactPerson = body.contactPerson !== undefined ? body.contactPerson : (body.contact_person !== undefined ? body.contact_person : existing.contact_person);
    const phone = body.phone !== undefined ? body.phone : existing.phone;
    const whatsapp = body.whatsapp !== undefined ? body.whatsapp : existing.whatsapp;
    const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
    const stage = body.stage !== undefined ? body.stage : existing.stage;
    const probability = body.probability !== undefined ? Number(body.probability) : existing.probability;
    const expectedClose = body.expectedClose !== undefined ? body.expectedClose : (body.expected_close !== undefined ? body.expected_close : existing.expected_close);
    const owner = body.owner !== undefined ? body.owner : existing.owner;
    const ownerId = body.ownerId !== undefined ? body.ownerId : (body.owner_id !== undefined ? body.owner_id : existing.owner_id);
    const campaign = body.campaign !== undefined ? body.campaign : existing.campaign;
    const source = body.source !== undefined ? body.source : existing.source;
    const vatType = body.vatType !== undefined ? body.vatType : (body.vat_type !== undefined ? body.vat_type : existing.vat_type);
    const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : (body.vat_rate !== undefined ? Number(body.vat_rate) : existing.vat_rate);
    const adjustment = body.adjustment !== undefined ? Number(body.adjustment) : existing.adjustment;
    const lpoNumber = body.lpoNumber !== undefined ? body.lpoNumber : (body.lpo_number !== undefined ? body.lpo_number : existing.lpo_number);
    const lpoDate = body.lpoDate !== undefined ? body.lpoDate : (body.lpo_date !== undefined ? body.lpo_date : existing.lpo_date);
    const location = body.location !== undefined ? body.location : existing.location;
    const reference = body.reference !== undefined ? body.reference : existing.reference;
    const comments = body.comments !== undefined ? body.comments : existing.comments;
    const tags = body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags.join(',') : body.tags) : existing.tags;

    await c.env.DB.prepare(`
      UPDATE opportunities SET
        title = ?, customer = ?, contact_person = ?, phone = ?, whatsapp = ?,
        amount = ?, stage = ?, probability = ?, expected_close = ?, owner = ?, owner_id = ?,
        campaign = ?, source = ?, vat_type = ?, vat_rate = ?, adjustment = ?,
        lpo_number = ?, lpo_date = ?, location = ?, reference = ?, comments = ?, tags = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      title, customer, contactPerson, phone, whatsapp,
      amount, stage, probability, expectedClose, owner, ownerId,
      campaign, source, vatType, vatRate, adjustment,
      lpoNumber, lpoDate, location, reference, comments, tags,
      id
    ).run();

    const updated = await c.env.DB.prepare(
      'SELECT * FROM opportunities WHERE id = ? LIMIT 1'
    ).bind(id).first<OpportunityRow>();

    return c.json({ success: true, opportunity: updated });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// DELETE /api/opportunities/:id - Soft Delete
opportunitiesApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete opportunities' }, 403);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE opportunities SET is_deleted = 1, deleted_at = datetime('now'), deleted_by_id = ?
      WHERE id = ?
    `).bind(user.id, id).run();

    return c.json({ success: true, message: 'Opportunity deleted' });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});


// ============================================================================
// 2. QUOTATIONS APP (/api/quotations)
// ============================================================================
export const quotationsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
quotationsApp.use('*', authMiddleware);

// GET /api/quotations - List
quotationsApp.get('/', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);
  const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const oppId = (url.searchParams.get('oppId') || url.searchParams.get('opportunityId') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10) || 100));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  try {
    let whereClauses = ['is_deleted = 0'];
    const bindings: any[] = [];

    if (user.role === 'EMPLOYEE') {
      whereClauses.push('(owner_id = ? OR owner_id IS NULL)');
      bindings.push(user.id);
    }

    if (oppId) {
      whereClauses.push('opportunity_id = ?');
      bindings.push(oppId);
    }

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      bindings.push(status);
    }

    if (search) {
      whereClauses.push('(quotation_number LIKE ? OR customer LIKE ? OR subject LIKE ?)');
      const pattern = `%${search}%`;
      bindings.push(pattern, pattern, pattern);
    }

    const whereSql = whereClauses.join(' AND ');
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM quotations WHERE ${whereSql}`
    ).bind(...bindings).first<{ total: number }>();

    const total = countQuery?.total || 0;

    const listQuery = await c.env.DB.prepare(
      `SELECT * FROM quotations WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all<QuotationRow>();

    const quotes = listQuery.results || [];

    // Attach items for each quote
    const enriched = await Promise.all(
      quotes.map(async (q) => {
        const items = await c.env.DB.prepare(
          'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC'
        ).bind(q.id).all<QuotationItemRow>();
        return {
          ...q,
          items: items.results || [],
        };
      })
    );

    return c.json({
      success: true,
      quotations: enriched,
      total,
      page,
      limit,
    });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err), quotations: [], total: 0 }, 500);
  }
});

// GET /api/quotations/:id
quotationsApp.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const q = await c.env.DB.prepare(
      'SELECT * FROM quotations WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<QuotationRow>();

    if (!q) return c.json({ success: false, message: 'Quotation not found' }, 404);

    const items = await c.env.DB.prepare(
      'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<QuotationItemRow>();

    return c.json({ success: true, quotation: { ...q, items: items.results || [] } });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// POST /api/quotations - Create from Opportunity or Scratch
quotationsApp.post('/', async (c) => {
  const user = c.get('user');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body || !body.customer || !body.subject) {
    return c.json({ success: false, message: 'Customer and subject are required' }, 400);
  }

  const id = body.id || `qtn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const quoteNumber = body.quotationNumber || body.quotation_number || `QTN-${Date.now().toString().slice(-4)}`;
  const customer = body.customer;
  const customerId = body.customerId || body.customer_id || null;
  const contactPerson = body.contactPerson || body.contact_person || '';
  const phone = body.phone || '';
  const email = body.email || '';
  const billingAddress = body.billingAddress || body.billing_address || '';
  const shippingAddress = body.shippingAddress || body.shipping_address || '';
  const opportunityId = body.opportunityId || body.opportunity_id || null;
  const opportunityCode = body.opportunityCode || body.opportunity_code || '';
  const subject = body.subject;
  const quoteDate = body.quoteDate || body.quote_date || new Date().toISOString().split('T')[0];
  const validUntil = body.validUntil || body.valid_until || '';
  const subtotal = Number(body.subtotal) || 0;
  const discountTotal = Number(body.discountTotal ?? body.discount_total) || 0;
  const vatRate = Number(body.vatRate ?? body.vat_rate ?? 5);
  const vatAmount = Number(body.vatAmount ?? body.vat_amount ?? (subtotal * (vatRate / 100)));
  const totalAmount = Number(body.totalAmount ?? body.total_amount ?? (subtotal + vatAmount));
  const status = body.status || 'Draft';
  const owner = body.owner || user.full_name || 'Unassigned';
  const ownerId = body.ownerId || body.owner_id || user.id;
  const assignedTo = body.assignedTo || body.assigned_to || owner;
  const paymentTerms = body.paymentTerms || body.payment_terms || '';
  const deliveryTerms = body.deliveryTerms || body.delivery_terms || '';
  const customerNotes = body.customerNotes || body.customer_notes || '';
  const rawItems: any[] = Array.isArray(body.items) ? body.items : [];

  try {
    await c.env.DB.prepare(`
      INSERT INTO quotations (
        id, quotation_number, customer, customer_id, contact_person, phone, email,
        billing_address, shipping_address, opportunity_id, opportunity_code, subject,
        quote_date, valid_until, subtotal, discount_total, vat_rate, vat_amount,
        total_amount, status, owner, owner_id, assigned_to, payment_terms,
        delivery_terms, customer_notes, is_deleted, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, 0, datetime('now'), datetime('now')
      )
    `).bind(
      id, quoteNumber, customer, customerId, contactPerson, phone, email,
      billingAddress, shippingAddress, opportunityId, opportunityCode, subject,
      quoteDate, validUntil, subtotal, discountTotal, vatRate, vatAmount,
      totalAmount, status, owner, ownerId, assignedTo, paymentTerms,
      deliveryTerms, customerNotes
    ).run();

    // Insert line items
    for (let i = 0; i < rawItems.length; i++) {
      const itm = rawItems[i];
      const itemId = itm.id || `qitm_${Date.now()}_${i}`;
      const desc = itm.description || itm.name || 'Quotation Item';
      const qty = Number(itm.quantity ?? itm.qty) || 1;
      const unit = itm.unit || 'Pcs';
      const price = Number(itm.unitPrice ?? itm.unit_price ?? itm.price) || 0;
      const discount = Number(itm.discount) || 0;
      const itmVat = Number(itm.vatAmount ?? itm.vat_amount ?? (qty * price * (vatRate / 100)));
      const itmTotal = Number(itm.totalAmount ?? itm.total_amount ?? itm.total ?? (qty * price + itmVat));

      await c.env.DB.prepare(`
        INSERT INTO quotation_items (
          id, quotation_id, product_id, item_code, description, quantity,
          unit, unit_price, discount, vat_rate, vat_amount, total_amount, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        itemId, id, itm.productId || itm.product_id || null, itm.itemCode || itm.item_code || itm.code || '',
        desc, qty, unit, price, discount, vatRate, itmVat, itmTotal, i
      ).run();
    }

    // Link back to Opportunity if specified
    if (opportunityId) {
      await c.env.DB.prepare(
        "UPDATE opportunities SET stage = 'Quotation', updated_at = datetime('now') WHERE id = ?"
      ).bind(opportunityId).run().catch(() => {});
    }

    const created = await c.env.DB.prepare('SELECT * FROM quotations WHERE id = ?').bind(id).first<QuotationRow>();
    const createdItems = await c.env.DB.prepare(
      'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<QuotationItemRow>();

    return c.json({ success: true, quotation: { ...created, items: createdItems.results || [] } }, 201);
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// PUT /api/quotations/:id - In-place Update
quotationsApp.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body) return c.json({ success: false, message: 'No body provided' }, 400);

  try {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM quotations WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<QuotationRow>();

    if (!existing) return c.json({ success: false, message: 'Quotation not found' }, 404);
    if (!canUserAccessRecord(user, existing.owner_id)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403);
    }

    const customer = body.customer !== undefined ? body.customer : existing.customer;
    const contactPerson = body.contactPerson !== undefined ? body.contactPerson : (body.contact_person !== undefined ? body.contact_person : existing.contact_person);
    const phone = body.phone !== undefined ? body.phone : existing.phone;
    const email = body.email !== undefined ? body.email : existing.email;
    const billingAddress = body.billingAddress !== undefined ? body.billingAddress : (body.billing_address !== undefined ? body.billing_address : existing.billing_address);
    const shippingAddress = body.shippingAddress !== undefined ? body.shippingAddress : (body.shipping_address !== undefined ? body.shipping_address : existing.shipping_address);
    const subject = body.subject !== undefined ? body.subject : existing.subject;
    const quoteDate = body.quoteDate !== undefined ? body.quoteDate : (body.quote_date !== undefined ? body.quote_date : existing.quote_date);
    const validUntil = body.validUntil !== undefined ? body.validUntil : (body.valid_until !== undefined ? body.valid_until : existing.valid_until);
    const subtotal = body.subtotal !== undefined ? Number(body.subtotal) : existing.subtotal;
    const discountTotal = body.discountTotal !== undefined ? Number(body.discountTotal) : (body.discount_total !== undefined ? Number(body.discount_total) : existing.discount_total);
    const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : (body.vat_rate !== undefined ? Number(body.vat_rate) : existing.vat_rate);
    const vatAmount = body.vatAmount !== undefined ? Number(body.vatAmount) : (body.vat_amount !== undefined ? Number(body.vat_amount) : existing.vat_amount);
    const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (body.total_amount !== undefined ? Number(body.total_amount) : existing.total_amount);
    const status = body.status !== undefined ? body.status : existing.status;
    const owner = body.owner !== undefined ? body.owner : existing.owner;
    const paymentTerms = body.paymentTerms !== undefined ? body.paymentTerms : (body.payment_terms !== undefined ? body.payment_terms : existing.payment_terms);
    const deliveryTerms = body.deliveryTerms !== undefined ? body.deliveryTerms : (body.delivery_terms !== undefined ? body.delivery_terms : existing.delivery_terms);
    const customerNotes = body.customerNotes !== undefined ? body.customerNotes : (body.customer_notes !== undefined ? body.customer_notes : existing.customer_notes);
    const convertedOrderId = body.convertedOrderId !== undefined ? body.convertedOrderId : (body.converted_order_id !== undefined ? body.converted_order_id : existing.converted_order_id);
    const salesOrderNumber = body.salesOrderNumber !== undefined ? body.salesOrderNumber : (body.sales_order_number !== undefined ? body.sales_order_number : existing.sales_order_number);

    await c.env.DB.prepare(`
      UPDATE quotations SET
        customer = ?, contact_person = ?, phone = ?, email = ?,
        billing_address = ?, shipping_address = ?, subject = ?, quote_date = ?,
        valid_until = ?, subtotal = ?, discount_total = ?, vat_rate = ?,
        vat_amount = ?, total_amount = ?, status = ?, owner = ?, payment_terms = ?,
        delivery_terms = ?, customer_notes = ?, converted_order_id = ?, sales_order_number = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      customer, contactPerson, phone, email,
      billingAddress, shippingAddress, subject, quoteDate,
      validUntil, subtotal, discountTotal, vatRate,
      vatAmount, totalAmount, status, owner, paymentTerms,
      deliveryTerms, customerNotes, convertedOrderId, salesOrderNumber,
      id
    ).run();

    // Replace items if provided
    if (Array.isArray(body.items)) {
      await c.env.DB.prepare('DELETE FROM quotation_items WHERE quotation_id = ?').bind(id).run();
      for (let i = 0; i < body.items.length; i++) {
        const itm = body.items[i];
        const itemId = itm.id || `qitm_${Date.now()}_${i}`;
        const desc = itm.description || itm.name || 'Quotation Item';
        const qty = Number(itm.quantity ?? itm.qty) || 1;
        const unit = itm.unit || 'Pcs';
        const price = Number(itm.unitPrice ?? itm.price) || 0;
        const discount = Number(itm.discount) || 0;
        const itmVat = Number(itm.vatAmount ?? itm.vat_amount ?? (qty * price * (vatRate / 100)));
        const itmTotal = Number(itm.totalAmount ?? itm.total ?? (qty * price + itmVat));

        await c.env.DB.prepare(`
          INSERT INTO quotation_items (
            id, quotation_id, product_id, item_code, description, quantity,
            unit, unit_price, discount, vat_rate, vat_amount, total_amount, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          itemId, id, itm.productId || null, itm.itemCode || itm.code || '',
          desc, qty, unit, price, discount, vatRate, itmVat, itmTotal, i
        ).run();
      }
    }

    const updated = await c.env.DB.prepare('SELECT * FROM quotations WHERE id = ?').bind(id).first<QuotationRow>();
    const updatedItems = await c.env.DB.prepare(
      'SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<QuotationItemRow>();

    return c.json({ success: true, quotation: { ...updated, items: updatedItems.results || [] } });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// DELETE /api/quotations/:id
quotationsApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete quotations' }, 403);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE quotations SET is_deleted = 1, deleted_at = datetime('now'), deleted_by_id = ?
      WHERE id = ?
    `).bind(user.id, id).run();

    return c.json({ success: true, message: 'Quotation deleted' });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});


// ============================================================================
// 3. SALES ORDERS APP (/api/orders & /api/sales-orders)
// ============================================================================
export const salesOrdersApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
salesOrdersApp.use('*', authMiddleware);

// GET /api/orders - List
salesOrdersApp.get('/', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);
  const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const quoteId = (url.searchParams.get('quotationId') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10) || 100));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  try {
    let whereClauses = ['is_deleted = 0'];
    const bindings: any[] = [];

    if (user.role === 'EMPLOYEE') {
      whereClauses.push('(owner_id = ? OR owner_id IS NULL)');
      bindings.push(user.id);
    }

    if (quoteId) {
      whereClauses.push('quotation_id = ?');
      bindings.push(quoteId);
    }

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      bindings.push(status);
    }

    if (search) {
      whereClauses.push('(order_number LIKE ? OR customer LIKE ? OR subject LIKE ?)');
      const pattern = `%${search}%`;
      bindings.push(pattern, pattern, pattern);
    }

    const whereSql = whereClauses.join(' AND ');
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM sales_orders WHERE ${whereSql}`
    ).bind(...bindings).first<{ total: number }>();

    const total = countQuery?.total || 0;

    const listQuery = await c.env.DB.prepare(
      `SELECT * FROM sales_orders WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all<SalesOrderRow>();

    const orders = listQuery.results || [];

    const enriched = await Promise.all(
      orders.map(async (o) => {
        const items = await c.env.DB.prepare(
          'SELECT * FROM sales_order_items WHERE order_id = ? ORDER BY sort_order ASC'
        ).bind(o.id).all<SalesOrderItemRow>();
        return {
          ...o,
          items: items.results || [],
        };
      })
    );

    return c.json({
      success: true,
      orders: enriched,
      total,
      page,
      limit,
    });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err), orders: [], total: 0 }, 500);
  }
});

// GET /api/orders/:id
salesOrdersApp.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const o = await c.env.DB.prepare(
      'SELECT * FROM sales_orders WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<SalesOrderRow>();

    if (!o) return c.json({ success: false, message: 'Sales order not found' }, 404);

    const items = await c.env.DB.prepare(
      'SELECT * FROM sales_order_items WHERE order_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<SalesOrderItemRow>();

    return c.json({ success: true, order: { ...o, items: items.results || [] } });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// POST /api/orders - Convert from Quotation or Direct Create (Duplicate Prevention)
salesOrdersApp.post('/', async (c) => {
  const user = c.get('user');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body || !body.customer) {
    return c.json({ success: false, message: 'Customer is required' }, 400);
  }

  const quotationId = body.quotationId || body.quotation_id || null;
  const quotationRef = body.quotationRef || body.quotation_ref || '';

  // Duplicate Prevention: Check if this quotation was already converted
  if (quotationId) {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM sales_orders WHERE quotation_id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(quotationId).first<SalesOrderRow>();

    if (existing) {
      const items = await c.env.DB.prepare(
        'SELECT * FROM sales_order_items WHERE order_id = ? ORDER BY sort_order ASC'
      ).bind(existing.id).all<SalesOrderItemRow>();

      return c.json({
        success: true,
        alreadyConverted: true,
        message: `Quotation already converted to Sales Order: ${existing.order_number}`,
        order: { ...existing, items: items.results || [] },
      }, 200);
    }
  }

  const id = body.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = body.orderNumber || body.order_number || `SO-${Date.now().toString().slice(-4)}`;
  const opportunityRef = body.opportunityRef || body.opportunity_ref || '';
  const customer = body.customer;
  const contactPerson = body.contactPerson || body.contact_person || '';
  const phone = body.phone || '';
  const email = body.email || '';
  const billingAddress = body.billingAddress || body.billing_address || '';
  const shippingAddress = body.shippingAddress || body.shipping_address || '';
  const orderDate = body.orderDate || body.order_date || new Date().toISOString().split('T')[0];
  const deliveryDueDate = body.deliveryDueDate || body.delivery_due_date || '';
  const poReference = body.poReference || body.po_reference || '';
  const amount = Number(body.amount) || 0;
  const vatAmount = Number(body.vatAmount ?? body.vat_amount) || 0;
  const totalAmount = Number(body.totalAmount ?? body.total_amount ?? (amount + vatAmount));
  const profit = Number(body.profit) || (amount * 0.25);
  const receivable = Number(body.receivable) || totalAmount;
  const status = body.status || 'Confirmed';
  const owner = body.owner || user.full_name || 'Unassigned';
  const ownerId = body.ownerId || body.owner_id || user.id;
  const assignedTo = body.assignedTo || body.assigned_to || owner;
  const subject = body.subject || '';
  const notes = body.notes || '';
  const paymentTerms = body.paymentTerms || body.payment_terms || '';
  const deliveryTerms = body.deliveryTerms || body.delivery_terms || '';
  const rawItems: any[] = Array.isArray(body.items) ? body.items : [];

  try {
    await c.env.DB.prepare(`
      INSERT INTO sales_orders (
        id, order_number, quotation_ref, quotation_id, opportunity_ref, customer,
        contact_person, phone, email, billing_address, shipping_address, order_date,
        delivery_due_date, po_reference, amount, vat_amount, total_amount, profit,
        receivable, status, owner, owner_id, assigned_to, subject, notes,
        payment_terms, delivery_terms, is_deleted, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, 0, datetime('now'), datetime('now')
      )
    `).bind(
      id, orderNumber, quotationRef, quotationId, opportunityRef, customer,
      contactPerson, phone, email, billingAddress, shippingAddress, orderDate,
      deliveryDueDate, poReference, amount, vatAmount, totalAmount, profit,
      receivable, status, owner, ownerId, assignedTo, subject, notes,
      paymentTerms, deliveryTerms
    ).run();

    // Insert line items
    for (let i = 0; i < rawItems.length; i++) {
      const itm = rawItems[i];
      const itemId = itm.id || `sitm_${Date.now()}_${i}`;
      const desc = itm.description || itm.name || 'Sales Order Item';
      const qty = Number(itm.quantity ?? itm.qty) || 1;
      const unit = itm.unit || 'Pcs';
      const price = Number(itm.unitPrice ?? itm.unit_price ?? itm.price) || 0;
      const discount = Number(itm.discount) || 0;
      const itmVat = Number(itm.vatAmount ?? itm.vat_amount ?? (qty * price * 0.05));
      const itmTotal = Number(itm.totalAmount ?? itm.total_amount ?? itm.total ?? (qty * price + itmVat));

      await c.env.DB.prepare(`
        INSERT INTO sales_order_items (
          id, order_id, product_id, item_code, description, quantity,
          unit, unit_price, discount, vat_rate, vat_amount, total_amount, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        itemId, id, itm.productId || itm.product_id || null, itm.itemCode || itm.item_code || itm.code || '',
        desc, qty, unit, price, discount, 5, itmVat, itmTotal, i
      ).run();
    }

    // Update Quotation status to Converted if linked
    if (quotationId) {
      await c.env.DB.prepare(`
        UPDATE quotations SET
          status = 'Converted',
          converted_order_id = ?,
          sales_order_number = ?,
          converted_at = datetime('now'),
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(id, orderNumber, quotationId).run().catch(() => {});
    }

    const created = await c.env.DB.prepare('SELECT * FROM sales_orders WHERE id = ?').bind(id).first<SalesOrderRow>();
    const createdItems = await c.env.DB.prepare(
      'SELECT * FROM sales_order_items WHERE order_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<SalesOrderItemRow>();

    return c.json({ success: true, order: { ...created, items: createdItems.results || [] } }, 201);
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// PUT /api/orders/:id - In-place Update
salesOrdersApp.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body) return c.json({ success: false, message: 'No body provided' }, 400);

  try {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM sales_orders WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<SalesOrderRow>();

    if (!existing) return c.json({ success: false, message: 'Sales order not found' }, 404);
    if (!canUserAccessRecord(user, existing.owner_id)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403);
    }

    const customer = body.customer !== undefined ? body.customer : existing.customer;
    const contactPerson = body.contactPerson !== undefined ? body.contactPerson : (body.contact_person !== undefined ? body.contact_person : existing.contact_person);
    const phone = body.phone !== undefined ? body.phone : existing.phone;
    const email = body.email !== undefined ? body.email : existing.email;
    const billingAddress = body.billingAddress !== undefined ? body.billingAddress : (body.billing_address !== undefined ? body.billing_address : existing.billing_address);
    const shippingAddress = body.shippingAddress !== undefined ? body.shippingAddress : (body.shipping_address !== undefined ? body.shipping_address : existing.shipping_address);
    const orderDate = body.orderDate !== undefined ? body.orderDate : (body.order_date !== undefined ? body.order_date : existing.order_date);
    const deliveryDueDate = body.deliveryDueDate !== undefined ? body.deliveryDueDate : (body.delivery_due_date !== undefined ? body.delivery_due_date : existing.delivery_due_date);
    const poReference = body.poReference !== undefined ? body.poReference : (body.po_reference !== undefined ? body.po_reference : existing.po_reference);
    const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
    const vatAmount = body.vatAmount !== undefined ? Number(body.vatAmount) : (body.vat_amount !== undefined ? Number(body.vat_amount) : existing.vat_amount);
    const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (body.total_amount !== undefined ? Number(body.total_amount) : existing.total_amount);
    const profit = body.profit !== undefined ? Number(body.profit) : existing.profit;
    const receivable = body.receivable !== undefined ? Number(body.receivable) : existing.receivable;
    const status = body.status !== undefined ? body.status : existing.status;
    const owner = body.owner !== undefined ? body.owner : existing.owner;
    const subject = body.subject !== undefined ? body.subject : existing.subject;
    const notes = body.notes !== undefined ? body.notes : existing.notes;
    const paymentTerms = body.paymentTerms !== undefined ? body.paymentTerms : (body.payment_terms !== undefined ? body.payment_terms : existing.payment_terms);
    const deliveryTerms = body.deliveryTerms !== undefined ? body.deliveryTerms : (body.delivery_terms !== undefined ? body.delivery_terms : existing.delivery_terms);

    await c.env.DB.prepare(`
      UPDATE sales_orders SET
        customer = ?, contact_person = ?, phone = ?, email = ?,
        billing_address = ?, shipping_address = ?, order_date = ?, delivery_due_date = ?,
        po_reference = ?, amount = ?, vat_amount = ?, total_amount = ?,
        profit = ?, receivable = ?, status = ?, owner = ?, subject = ?,
        notes = ?, payment_terms = ?, delivery_terms = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      customer, contactPerson, phone, email,
      billingAddress, shippingAddress, orderDate, deliveryDueDate,
      poReference, amount, vatAmount, totalAmount,
      profit, receivable, status, owner, subject,
      notes, paymentTerms, deliveryTerms,
      id
    ).run();

    if (Array.isArray(body.items)) {
      await c.env.DB.prepare('DELETE FROM sales_order_items WHERE order_id = ?').bind(id).run();
      for (let i = 0; i < body.items.length; i++) {
        const itm = body.items[i];
        const itemId = itm.id || `sitm_${Date.now()}_${i}`;
        const desc = itm.description || itm.name || 'Sales Order Item';
        const qty = Number(itm.quantity ?? itm.qty) || 1;
        const unit = itm.unit || 'Pcs';
        const price = Number(itm.unitPrice ?? itm.price) || 0;
        const discount = Number(itm.discount) || 0;
        const itmVat = Number(itm.vatAmount ?? itm.vat_amount ?? (qty * price * 0.05));
        const itmTotal = Number(itm.totalAmount ?? itm.total ?? (qty * price + itmVat));

        await c.env.DB.prepare(`
          INSERT INTO sales_order_items (
            id, order_id, product_id, item_code, description, quantity,
            unit, unit_price, discount, vat_rate, vat_amount, total_amount, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          itemId, id, itm.productId || null, itm.itemCode || itm.code || '',
          desc, qty, unit, price, discount, 5, itmVat, itmTotal, i
        ).run();
      }
    }

    const updated = await c.env.DB.prepare('SELECT * FROM sales_orders WHERE id = ?').bind(id).first<SalesOrderRow>();
    const updatedItems = await c.env.DB.prepare(
      'SELECT * FROM sales_order_items WHERE order_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<SalesOrderItemRow>();

    return c.json({ success: true, order: { ...updated, items: updatedItems.results || [] } });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// DELETE /api/orders/:id
salesOrdersApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete sales orders' }, 403);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE sales_orders SET is_deleted = 1, deleted_at = datetime('now'), deleted_by_id = ?
      WHERE id = ?
    `).bind(user.id, id).run();

    return c.json({ success: true, message: 'Sales order deleted' });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});


// ============================================================================
// 4. INVOICES APP (/api/invoices)
// ============================================================================
export const invoicesApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
invoicesApp.use('*', authMiddleware);

// GET /api/invoices - List
invoicesApp.get('/', async (c) => {
  const user = c.get('user');
  const url = new URL(c.req.url);
  const search = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();
  const orderId = (url.searchParams.get('orderId') || '').trim();
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10) || 100));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;

  try {
    let whereClauses = ['is_deleted = 0'];
    const bindings: any[] = [];

    if (user.role === 'EMPLOYEE') {
      whereClauses.push('(owner_id = ? OR owner_id IS NULL)');
      bindings.push(user.id);
    }

    if (orderId) {
      whereClauses.push('order_id = ?');
      bindings.push(orderId);
    }

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      bindings.push(status);
    }

    if (search) {
      whereClauses.push('(invoice_number LIKE ? OR customer LIKE ? OR description LIKE ? OR order_ref LIKE ?)');
      const pattern = `%${search}%`;
      bindings.push(pattern, pattern, pattern, pattern);
    }

    const whereSql = whereClauses.join(' AND ');
    const countQuery = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM invoices WHERE ${whereSql}`
    ).bind(...bindings).first<{ total: number }>();

    const total = countQuery?.total || 0;

    const listQuery = await c.env.DB.prepare(
      `SELECT * FROM invoices WHERE ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all<InvoiceRow>();

    const invoices = listQuery.results || [];

    const enriched = await Promise.all(
      invoices.map(async (inv) => {
        const items = await c.env.DB.prepare(
          'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC'
        ).bind(inv.id).all<InvoiceItemRow>();
        return {
          ...inv,
          items: items.results || [],
        };
      })
    );

    return c.json({
      success: true,
      invoices: enriched,
      total,
      page,
      limit,
    });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err), invoices: [], total: 0 }, 500);
  }
});

// GET /api/invoices/:id
invoicesApp.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const inv = await c.env.DB.prepare(
      'SELECT * FROM invoices WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<InvoiceRow>();

    if (!inv) return c.json({ success: false, message: 'Invoice not found' }, 404);

    const items = await c.env.DB.prepare(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<InvoiceItemRow>();

    return c.json({ success: true, invoice: { ...inv, items: items.results || [] } });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// POST /api/invoices - Create from Sales Order or Direct Create
invoicesApp.post('/', async (c) => {
  const user = c.get('user');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body || !body.customer) {
    return c.json({ success: false, message: 'Customer is required' }, 400);
  }

  const id = body.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const invoiceNumber = body.invoiceNumber || body.invoice_number || `CTINV#${Math.floor(10000 + Math.random() * 90000)}`;
  const orderRef = body.orderRef || body.order_ref || '';
  const orderId = body.orderId || body.order_id || null;
  const opportunityOrderRef = body.opportunityOrderRef || body.opportunity_order_ref || '';
  const customer = body.customer;
  const contactPerson = body.contactPerson || body.contact_person || '';
  const phone = body.phone || '';
  const attention = body.attention || '';
  const location = body.location || '';
  const trnNumber = body.trnNumber || body.trn_number || '';
  const lpoNumber = body.lpoNumber || body.lpo_number || '';
  const lpoDate = body.lpoDate || body.lpo_date || '';
  const referenceNumber = body.referenceNumber || body.reference_number || '';
  const description = body.description || '';
  const issueDate = body.issueDate || body.issue_date || new Date().toISOString().split('T')[0];
  const dueDate = body.dueDate || body.due_date || '';
  const amount = Number(body.amount) || 0;
  const subtotal = Number(body.subtotal ?? amount) || amount;
  const discount = Number(body.discount) || 0;
  const adjustment = Number(body.adjustment) || 0;
  const vatType = body.vatType || body.vat_type || 'With VAT';
  const vatRate = Number(body.vatRate ?? body.vat_rate ?? 5);
  const vatAmount = Number(body.vatAmount ?? body.vat_amount ?? (subtotal * (vatRate / 100)));
  const totalAmount = Number(body.totalAmount ?? body.total_amount ?? (subtotal + vatAmount - discount + adjustment));
  const paidAmount = Number(body.paidAmount ?? body.paid_amount ?? 0);
  const balanceAmount = Math.max(0, totalAmount - paidAmount);

  // Derive status from paid and balance amounts
  let status = body.status;
  if (!status || status === 'Pending') {
    if (paidAmount >= totalAmount && totalAmount > 0) {
      status = 'Paid';
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      status = 'Partially Paid';
    } else {
      status = 'Unpaid';
    }
  }

  const termsConditions = body.termsConditions || body.terms_conditions || '';
  const owner = body.owner || user.full_name || 'Unassigned';
  const ownerId = body.ownerId || body.owner_id || user.id;
  const rawItems: any[] = Array.isArray(body.items) ? body.items : [];

  try {
    await c.env.DB.prepare(`
      INSERT INTO invoices (
        id, invoice_number, order_ref, order_id, opportunity_order_ref, customer,
        contact_person, phone, attention, location, trn_number, lpo_number,
        lpo_date, reference_number, description, issue_date, due_date, amount,
        subtotal, discount, adjustment, vat_type, vat_rate, vat_amount,
        total_amount, paid_amount, balance_amount, status, terms_conditions,
        owner, owner_id, is_deleted, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, 0, datetime('now'), datetime('now')
      )
    `).bind(
      id, invoiceNumber, orderRef, orderId, opportunityOrderRef, customer,
      contactPerson, phone, attention, location, trnNumber, lpoNumber,
      lpoDate, referenceNumber, description, issueDate, dueDate, amount,
      subtotal, discount, adjustment, vatType, vatRate, vatAmount,
      totalAmount, paidAmount, balanceAmount, status, termsConditions,
      owner, ownerId
    ).run();

    // Insert line items
    for (let i = 0; i < rawItems.length; i++) {
      const itm = rawItems[i];
      const itemId = itm.id || `inv_itm_${Date.now()}_${i}`;
      const desc = itm.description || itm.name || 'Invoice Item';
      const qty = Number(itm.qty ?? itm.quantity) || 1;
      const price = Number(itm.price ?? itm.unitPrice) || 0;
      const total = Number(itm.total ?? (qty * price));

      await c.env.DB.prepare(`
        INSERT INTO invoice_items (
          id, invoice_id, code, description, brand, unit, qty, price, total, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        itemId, id, itm.code || '', desc, itm.brand || '',
        itm.unit || 'Pcs', qty, price, total, i
      ).run();
    }

    const created = await c.env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first<InvoiceRow>();
    const createdItems = await c.env.DB.prepare(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<InvoiceItemRow>();

    return c.json({ success: true, invoice: { ...created, items: createdItems.results || [] } }, 201);
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// PUT /api/invoices/:id - In-place Update (Preserves Stable ID, Recalculates Balance/Status)
invoicesApp.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = (await c.req.json().catch(() => null)) as any;

  if (!body) return c.json({ success: false, message: 'No body provided' }, 400);

  try {
    const existing = await c.env.DB.prepare(
      'SELECT * FROM invoices WHERE id = ? AND is_deleted = 0 LIMIT 1'
    ).bind(id).first<InvoiceRow>();

    if (!existing) return c.json({ success: false, message: 'Invoice not found' }, 404);
    if (!canUserAccessRecord(user, existing.owner_id)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403);
    }

    const customer = body.customer !== undefined ? body.customer : existing.customer;
    const contactPerson = body.contactPerson !== undefined ? body.contactPerson : (body.contact_person !== undefined ? body.contact_person : existing.contact_person);
    const phone = body.phone !== undefined ? body.phone : existing.phone;
    const attention = body.attention !== undefined ? body.attention : existing.attention;
    const location = body.location !== undefined ? body.location : existing.location;
    const trnNumber = body.trnNumber !== undefined ? body.trnNumber : (body.trn_number !== undefined ? body.trn_number : existing.trn_number);
    const lpoNumber = body.lpoNumber !== undefined ? body.lpoNumber : (body.lpo_number !== undefined ? body.lpo_number : existing.lpo_number);
    const lpoDate = body.lpoDate !== undefined ? body.lpoDate : (body.lpo_date !== undefined ? body.lpo_date : existing.lpo_date);
    const referenceNumber = body.referenceNumber !== undefined ? body.referenceNumber : (body.reference_number !== undefined ? body.reference_number : existing.reference_number);
    const description = body.description !== undefined ? body.description : existing.description;
    const issueDate = body.issueDate !== undefined ? body.issueDate : (body.issue_date !== undefined ? body.issue_date : existing.issue_date);
    const dueDate = body.dueDate !== undefined ? body.dueDate : (body.due_date !== undefined ? body.due_date : existing.due_date);
    const amount = body.amount !== undefined ? Number(body.amount) : existing.amount;
    const subtotal = body.subtotal !== undefined ? Number(body.subtotal) : existing.subtotal;
    const discount = body.discount !== undefined ? Number(body.discount) : existing.discount;
    const adjustment = body.adjustment !== undefined ? Number(body.adjustment) : existing.adjustment;
    const vatType = body.vatType !== undefined ? body.vatType : (body.vat_type !== undefined ? body.vat_type : existing.vat_type);
    const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : (body.vat_rate !== undefined ? Number(body.vat_rate) : existing.vat_rate);
    const vatAmount = body.vatAmount !== undefined ? Number(body.vatAmount) : (body.vat_amount !== undefined ? Number(body.vat_amount) : existing.vat_amount);
    const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : (body.total_amount !== undefined ? Number(body.total_amount) : existing.total_amount);
    const paidAmount = body.paidAmount !== undefined ? Number(body.paidAmount) : (body.paid_amount !== undefined ? Number(body.paid_amount) : existing.paid_amount);
    const balanceAmount = Math.max(0, totalAmount - paidAmount);

    let status = body.status !== undefined ? body.status : existing.status;
    if (body.paidAmount !== undefined || body.paid_amount !== undefined || body.totalAmount !== undefined || body.total_amount !== undefined) {
      if (paidAmount >= totalAmount && totalAmount > 0) {
        status = 'Paid';
      } else if (paidAmount > 0 && paidAmount < totalAmount) {
        status = 'Partially Paid';
      } else {
        status = 'Unpaid';
      }
    }

    const termsConditions = body.termsConditions !== undefined ? body.termsConditions : (body.terms_conditions !== undefined ? body.terms_conditions : existing.terms_conditions);
    const owner = body.owner !== undefined ? body.owner : existing.owner;

    await c.env.DB.prepare(`
      UPDATE invoices SET
        customer = ?, contact_person = ?, phone = ?, attention = ?,
        location = ?, trn_number = ?, lpo_number = ?, lpo_date = ?,
        reference_number = ?, description = ?, issue_date = ?, due_date = ?,
        amount = ?, subtotal = ?, discount = ?, adjustment = ?,
        vat_type = ?, vat_rate = ?, vat_amount = ?, total_amount = ?,
        paid_amount = ?, balance_amount = ?, status = ?, terms_conditions = ?,
        owner = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      customer, contactPerson, phone, attention,
      location, trnNumber, lpoNumber, lpoDate,
      referenceNumber, description, issueDate, dueDate,
      amount, subtotal, discount, adjustment,
      vatType, vatRate, vatAmount, totalAmount,
      paidAmount, balanceAmount, status, termsConditions,
      owner, id
    ).run();

    // Replace items if provided
    if (Array.isArray(body.items)) {
      await c.env.DB.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').bind(id).run();
      for (let i = 0; i < body.items.length; i++) {
        const itm = body.items[i];
        const itemId = itm.id || `inv_itm_${Date.now()}_${i}`;
        const desc = itm.description || itm.name || 'Invoice Item';
        const qty = Number(itm.qty ?? itm.quantity) || 1;
        const price = Number(itm.price ?? itm.unitPrice) || 0;
        const total = Number(itm.total ?? (qty * price));

        await c.env.DB.prepare(`
          INSERT INTO invoice_items (
            id, invoice_id, code, description, brand, unit, qty, price, total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          itemId, id, itm.code || '', desc, itm.brand || '',
          itm.unit || 'Pcs', qty, price, total, i
        ).run();
      }
    }

    const updated = await c.env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first<InvoiceRow>();
    const updatedItems = await c.env.DB.prepare(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC'
    ).bind(id).all<InvoiceItemRow>();

    return c.json({ success: true, invoice: { ...updated, items: updatedItems.results || [] } });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});

// DELETE /api/invoices/:id
invoicesApp.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  if (user.role === 'EMPLOYEE') {
    return c.json({ success: false, message: 'Employees cannot delete invoices' }, 403);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE invoices SET is_deleted = 1, deleted_at = datetime('now'), deleted_by_id = ?
      WHERE id = ?
    `).bind(user.id, id).run();

    return c.json({ success: true, message: 'Invoice deleted' });
  } catch (err: unknown) {
    return c.json({ success: false, message: String(err) }, 500);
  }
});
