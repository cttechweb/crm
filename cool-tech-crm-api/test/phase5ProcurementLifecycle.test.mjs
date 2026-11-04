import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, SignJWT } from 'jose';
import app from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_KID = 'phase5-test-key-id';
const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

function createPhase5Database() {
  const db = new DatabaseSync(':memory:');

  // Base Users Table matching production D1
  db.exec(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE')),
    position TEXT,
    department TEXT,
    team_id TEXT,
    reports_to TEXT REFERENCES users(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);

  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = [
    '0002_create_customers.sql',
    '0003_create_leads.sql',
    '0004_create_sales_workflow.sql',
    '0005_create_tasks_and_worker_ops.sql',
    '0006_create_sales_auxiliary_documents.sql',
    '0007_create_procurement_and_inventory.sql',
    '0008_create_settings_targets_stages.sql',
    '0009_user_profile_and_permissions.sql',
    '0010_procurement_governance_core.sql',
    '0011_supplier_invoicing_and_matching.sql',
  ];

  for (const f of migrationFiles) {
    const fullPath = path.join(migrationsDir, f);
    if (fs.existsSync(fullPath)) {
      const sql = fs.readFileSync(fullPath, 'utf8');
      db.exec(sql);
    }
  }

  const d1 = {
    prepare(query) {
      return {
        _bound: [],
        bind(...params) {
          this._bound = params.map((v) => (v === undefined ? null : v));
          return this;
        },
        async first(col) {
          const stmt = db.prepare(query);
          const row = stmt.get(...this._bound);
          if (!row) return null;
          if (col && typeof col === 'string') return row[col];
          return row;
        },
        async all() {
          const stmt = db.prepare(query);
          const results = stmt.all(...this._bound);
          return { results };
        },
        async run() {
          const stmt = db.prepare(query);
          const info = stmt.run(...this._bound);
          return { success: true, meta: { changes: info.changes, last_row_id: info.lastInsertRowid } };
        },
      };
    },
    async exec(sql) {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
  };

  return { rawDb: db, d1 };
}

describe('Phase 5 Procurement Lifecycle & Analytics Test Suite', () => {
  let env;
  let keyPair;
  let tokens = {};

  before(async () => {
    keyPair = await generateKeyPair('RS256');
    setCustomJWKS(async (protectedHeader) => {
      if (protectedHeader?.kid === TEST_KID) return keyPair.publicKey;
      throw new Error('Key ID not found');
    });

    async function makeToken(sub, email) {
      return await new SignJWT({
        user_id: sub,
        sub,
        email,
        email_verified: true,
      })
        .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
        .setIssuer(ISSUER)
        .setAudience(PROJECT_ID)
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(keyPair.privateKey);
    }

    tokens.superAdmin = await makeToken('uid_superadmin', 'superadmin@cooltech.ae');
    tokens.reportingHead = await makeToken('uid_rep_head', 'manager.hvac@cooltech.ae');
    tokens.techStaff1 = await makeToken('uid_tech1', 'ahmed.tech@cooltech.ae');
    tokens.techStaff2 = await makeToken('uid_tech2', 'khalid.tech@cooltech.ae');
    tokens.procurementBuyer = await makeToken('uid_buyer', 'buyer@cooltech.ae');
    tokens.financeController = await makeToken('uid_fc', 'fc@cooltech.ae');
  });

  beforeEach(() => {
    const dbObj = createPhase5Database();
    env = { DB: dbObj.d1 };
    const raw = dbObj.rawDb;

    raw.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, designation, department, is_active)
      VALUES
        ('usr_superadmin', 'uid_superadmin', 'superadmin@cooltech.ae', 'Super Administrator', 'SUPER_ADMIN', 'Chief Operating Officer', 'Management', 1),
        ('usr_rep_head', 'uid_rep_head', 'manager.hvac@cooltech.ae', 'Fahad Al-Nuaimi', 'MANAGER', 'Operations Manager', 'Technical', 1),
        ('usr_tech1', 'uid_tech1', 'ahmed.tech@cooltech.ae', 'Ahmed Technician', 'EMPLOYEE', 'HVAC Technician', 'Technical', 1),
        ('usr_tech2', 'uid_tech2', 'khalid.tech@cooltech.ae', 'Khalid Tech', 'EMPLOYEE', 'Electrician', 'Technical', 1),
        ('usr_buyer', 'uid_buyer', 'buyer@cooltech.ae', 'Buyer Specialist', 'EMPLOYEE', 'Procurement Specialist', 'Procurement', 1),
        ('usr_fc', 'uid_fc', 'fc@cooltech.ae', 'Finance Controller', 'MANAGER', 'Finance Controller', 'Finance', 1);
    `);

    raw.exec(`
      INSERT INTO suppliers (id, sl_no, supplier_name, trn, status, created_at, updated_at)
      VALUES
        ('sup_01', 1, 'Al-Futtaim HVAC Supplies', '100234567800003', 'Active', datetime('now'), datetime('now')),
        ('sup_02', 2, 'Lutfi Trading LLC', '100345678900003', 'Active', datetime('now'), datetime('now'));
    `);

    raw.exec(`
      INSERT INTO crm_inventory (id, sl_no, code, name, purchase_rate, current_stock, minimum_stock, created_at, updated_at)
      VALUES
        ('inv_01', 1, 'MAT-COPPER-01', 'Copper Pipe 1/2 inch', 45.0, 10.0, 5.0, datetime('now'), datetime('now'));
    `);
  });

  // ==========================================================================
  // SECTION 1: REQUESTOR CONFIRMATION & CLOSURE
  // ==========================================================================
  it('1. Requestor Confirmation: blocks unauthorized staff, enforces approval/delivery, and saves feedback audit', async () => {
    // A: Create MSRF by Tech 1
    const createRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
      body: JSON.stringify({
        purpose: 'HVAC repair parts',
        requiredByDate: '2026-11-20',
        items: [{ description: 'Copper Fittings', requested_qty: 5, estimated_unit_rate: 20 }],
      }),
    }, env);
    const { request: msrf } = await createRes.json();

    // Tech 2 (different employee) attempts receipt confirmation -> 403 FORBIDDEN_REQUESTOR_ONLY
    const unauthConfirm = await app.request(`/api/msrf/${msrf.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff2}` },
      body: JSON.stringify({ rating: 5, comments: 'Unrelated user' }),
    }, env);
    assert.equal(unauthConfirm.status, 403);
    const unauthBody = await unauthConfirm.json();
    assert.equal(unauthBody.code, 'FORBIDDEN_REQUESTOR_ONLY');

    // Tech 1 attempts confirmation before approval -> 422 REQUEST_NOT_APPROVED
    const prematureConfirm = await app.request(`/api/msrf/${msrf.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
      body: JSON.stringify({ rating: 5 }),
    }, env);
    assert.equal(prematureConfirm.status, 422);
    const prematureBody = await prematureConfirm.json();
    assert.equal(prematureBody.code, 'REQUEST_NOT_APPROVED');

    // Reporting Head approves MSRF
    await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    // Tech 1 confirms receipt after approval
    const confirmRes = await app.request(`/api/msrf/${msrf.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
      body: JSON.stringify({ rating: 5, condition: 'Excellent', comments: 'Parts received in good condition at site.' }),
    }, env);
    assert.equal(confirmRes.status, 200);
    const confirmBody = await confirmRes.json();
    assert.ok(confirmBody.request.requestor_confirmed_at);
    assert.ok(confirmBody.request.requestor_feedback.includes('Excellent'));

    // Re-attempting confirmation -> 400 ALREADY_CONFIRMED
    const reConfirm = await app.request(`/api/msrf/${msrf.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
    }, env);
    assert.equal(reConfirm.status, 400);
  });

  it('2. Request Closure: blocks premature closure, enforces authorization, and records closure audit', async () => {
    // Create & Approve MSRF
    const createRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
      body: JSON.stringify({
        purpose: 'Site maintenance supplies',
        requiredByDate: '2026-11-20',
        items: [{ description: 'Test', requested_qty: 1, estimated_unit_rate: 50 }],
      }),
    }, env);
    const { request: msrf } = await createRes.json();

    // Technician attempts closure -> 403 FORBIDDEN_CLOSURE_AUTHORITY
    const techClose = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
    }, env);
    assert.equal(techClose.status, 403);

    // Manager attempts closure before requestor confirmation and without override -> 422 PREMATURE_CLOSURE_BLOCKED
    const unconfirmedClose = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
    }, env);
    assert.equal(unconfirmedClose.status, 422);
    const unconfirmedBody = await unconfirmedClose.json();
    assert.equal(unconfirmedBody.code, 'PREMATURE_CLOSURE_BLOCKED');

    // Approve MSRF and have requestor confirm receipt
    await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    await app.request(`/api/msrf/${msrf.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
      body: JSON.stringify({ rating: 4, comments: 'Received OK' }),
    }, env);

    // Manager executes final closure -> 200 OK
    const closeRes = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
      body: JSON.stringify({ closureNotes: 'Requisition fulfilled and verified.' }),
    }, env);
    assert.equal(closeRes.status, 200);
    const closeBody = await closeRes.json();
    assert.equal(closeBody.request.is_closed, 1);
    assert.equal(closeBody.request.procurement_status, 'Closed');
    assert.ok(closeBody.request.closed_at);

    // Re-attempting closure -> 400 ALREADY_CLOSED
    const reClose = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
    }, env);
    assert.equal(reClose.status, 400);
  });

  // ==========================================================================
  // SECTION 2: PROCUREMENT DASHBOARD METRICS
  // ==========================================================================
  it('3. Procurement Dashboard: aggregates spend by supplier, open commitments, matching health, and payables', async () => {
    // Seed an approved PO for Al-Futtaim
    const poRes = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        poNumber: 'CTPO-DASH-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 5000,
        vat: 250,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 50, amount: 100 }],
      }),
    }, env);
    const { order: po } = await poRes.json();
    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    // Query Dashboard Metrics
    const dashRes = await app.request('/api/procurement-dashboard/summary', {
      headers: { Authorization: `Bearer ${tokens.financeController}` },
    }, env);

    assert.equal(dashRes.status, 200);
    const dashBody = await dashRes.json();
    assert.equal(dashBody.success, true);

    const { spendBySupplier, openCommitments, payables, matchingHealth } = dashBody.data;

    // Spend by supplier includes Al-Futtaim
    const futtaimSpend = spendBySupplier.find((s) => s.supplier === 'Al-Futtaim HVAC Supplies');
    assert.ok(futtaimSpend);
    assert.equal(futtaimSpend.total_spend, 5250);

    // Open delivery commitments reflects pending PO
    assert.ok(openCommitments.openOrdersCount >= 1);
    assert.ok(openCommitments.totalCommittedValue >= 5250);

    // Matching health structure is present
    assert.ok(matchingHealth !== undefined);
    assert.equal(typeof matchingHealth.discrepancyRate, 'number');
  });

  // ==========================================================================
  // SECTION 3: LEGACY DATA MIGRATION & RECONCILIATION
  // ==========================================================================
  it('4. Legacy Data Migration: dry-run validates records, flags duplicates, and imports with batch identifier', async () => {
    // 1. Existing PO to test duplicate detection
    await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        poNumber: 'CTPO-EXISTING-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 1000,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper', qty: 1, amount: 1000 }],
      }),
    }, env);

    // 2. Validate a legacy batch containing 1 valid record and 1 duplicate record
    const valRes = await app.request('/api/procurement/legacy/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        records: [
          { poNumber: 'CTPO-LEGACY-VALID', supplier: 'Lutfi Trading LLC', amount: 2500, date: '2025-06-15' },
          { poNumber: 'CTPO-EXISTING-01', supplier: 'Al-Futtaim HVAC Supplies', amount: 1000, date: '2025-05-10' },
        ],
      }),
    }, env);

    assert.equal(valRes.status, 200);
    const valBody = await valRes.json();
    assert.equal(valBody.summary.totalRecords, 2);
    assert.equal(valBody.summary.validCount, 1);
    assert.equal(valBody.summary.duplicateCount, 1);
    assert.equal(valBody.records[0].status, 'VALID');
    assert.equal(valBody.records[1].status, 'DUPLICATE');

    // 3. Employee tries to run import -> 403
    const unauthImport = await app.request('/api/procurement/legacy/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff1}` },
      body: JSON.stringify({ records: valBody.records.map((r) => r.raw) }),
    }, env);
    assert.equal(unauthImport.status, 403);

    // 4. Admin runs import -> 201 Created
    const importRes = await app.request('/api/procurement/legacy/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.superAdmin}` },
      body: JSON.stringify({ records: valBody.records.map((r) => r.raw) }),
    }, env);

    assert.equal(importRes.status, 201);
    const importBody = await importRes.json();
    assert.equal(importBody.importedCount, 1);
    assert.equal(importBody.skippedCount, 1);
    assert.ok(importBody.batchId.startsWith('MIG-BATCH-'));

    // Check imported PO in database has is_legacy_migrated = 1 and batchId
    const checkPo = await env.DB.prepare('SELECT is_legacy_migrated, migration_batch_id FROM purchase_orders WHERE po_number = ?')
      .bind('CTPO-LEGACY-VALID')
      .first();
    assert.equal(checkPo.is_legacy_migrated, 1);
    assert.equal(checkPo.migration_batch_id, importBody.batchId);

    // Check reconciliation reports endpoint
    const repRes = await app.request('/api/procurement/legacy/reports', {
      headers: { Authorization: `Bearer ${tokens.superAdmin}` },
    }, env);
    assert.equal(repRes.status, 200);
    const repBody = await repRes.json();
    assert.ok(repBody.reports.length >= 1);
    assert.equal(repBody.reports[0].batchId, importBody.batchId);
  });

  // ==========================================================================
  // SECTION 4: SUPPLIER STATEMENT RECONCILIATION & AP AGING
  // ==========================================================================
  it('5. Supplier Statement Reconciliation & AP Aging: buckets aging invoices and matches statement entries with variances', async () => {
    // 1. Create and approve a PO, then create 2 invoices for Al-Futtaim:
    // Invoice A: AED 500, due 10 days ago (0–30 Days current)
    // Invoice B: AED 1,000, due 45 days ago (31–60 Days)
    const poRes = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        poNumber: 'CTPO-AGING-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 1500,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper', qty: 15, amount: 100 }],
      }),
    }, env);
    const { order: po } = await poRes.json();
    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    const poItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(po.id).all()).results;

    // Past dates
    const date10DaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
    const date45DaysAgo = new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0];

    await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-AGING-01',
        invoice_date: date10DaysAgo,
        due_date: date10DaysAgo,
        subtotal: 500,
        total_amount: 525,
        items: [{ description: 'Item A', invoiced_qty: 5, unit_price: 100, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);

    await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-AGING-02',
        invoice_date: date45DaysAgo,
        due_date: date45DaysAgo,
        subtotal: 1000,
        total_amount: 1050,
        items: [{ description: 'Item B', invoiced_qty: 10, unit_price: 100, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);

    // Query AP Aging
    const agingRes = await app.request('/api/supplier-reconciliation/ap-aging?supplierId=sup_01', {
      headers: { Authorization: `Bearer ${tokens.financeController}` },
    }, env);

    assert.equal(agingRes.status, 200);
    const agingBody = await agingRes.json();
    assert.equal(agingBody.totalUnpaidInvoices, 2);
    assert.equal(agingBody.grandTotal, 1575); // 525 + 1050
    assert.equal(agingBody.buckets.current.count, 1);
    assert.equal(agingBody.buckets.current.totalAmount, 525);
    assert.equal(agingBody.buckets.days31_60.count, 1);
    assert.equal(agingBody.buckets.days31_60.totalAmount, 1050);

    // Reconcile statement:
    // Statement has INV-AGING-01 (exact match: 525), INV-AGING-02 (variance: 1100 vs 1050), and INV-UNKNOWN (missing in CRM)
    const reconRes = await app.request('/api/supplier-reconciliation/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({
        supplierId: 'sup_01',
        statementDate: '2026-11-20',
        statementClosingBalance: 1825,
        entries: [
          { statementInvoiceNo: 'INV-AGING-01', amount: 525, date: date10DaysAgo },
          { statementInvoiceNo: 'INV-AGING-02', amount: 1100, date: date45DaysAgo },
          { statementInvoiceNo: 'INV-UNKNOWN-99', amount: 200, date: '2026-11-01' },
        ],
      }),
    }, env);

    assert.equal(reconRes.status, 200);
    const reconBody = await reconRes.json();
    const r = reconBody.reconciliation;
    assert.equal(r.summary.matchedCount, 1);
    assert.equal(r.summary.varianceCount, 1);
    assert.equal(r.summary.missingInCrmCount, 1);
    assert.equal(r.matchedEntries[0].statementInvoiceNo, 'INV-AGING-01');
    assert.equal(r.varianceEntries[0].statementInvoiceNo, 'INV-AGING-02');
    assert.equal(r.missingInCrmEntries[0].statementInvoiceNo, 'INV-UNKNOWN-99');
    assert.equal(r.netVariance, 250); // 1825 statement - 1575 ledger = 250 variance
  });
});
