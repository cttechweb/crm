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

const TEST_KID = 'final-val-key-id';
const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

function createValidationDatabase() {
  const db = new DatabaseSync(':memory:');

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

describe('Final Purchase Module Validation Suite (Requirements 2 through 9)', () => {
  let env;
  let rawDb;
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

    tokens.superAdmin = await makeToken('uid_val_superadmin', 'superadmin@cooltech.ae');
    tokens.reportingHead = await makeToken('uid_val_head', 'manager.ops@cooltech.ae');
    tokens.techStaff = await makeToken('uid_val_tech', 'rashid.tech@cooltech.ae');
    tokens.procurementBuyer = await makeToken('uid_val_buyer', 'buyer@cooltech.ae');
    tokens.financeController = await makeToken('uid_val_fc', 'fc@cooltech.ae');
    tokens.unauthEmployee = await makeToken('uid_val_unauth', 'other@cooltech.ae');
  });

  beforeEach(() => {
    const dbObj = createValidationDatabase();
    env = { DB: dbObj.d1 };
    rawDb = dbObj.rawDb;

    rawDb.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, designation, department, is_active)
      VALUES
        ('usr_sa', 'uid_val_superadmin', 'superadmin@cooltech.ae', 'Chief Operating Officer', 'SUPER_ADMIN', 'Chief Operating Officer', 'Executive', 1),
        ('usr_head', 'uid_val_head', 'manager.ops@cooltech.ae', 'Operations Manager', 'MANAGER', 'Operations Manager', 'Operations', 1),
        ('usr_tech', 'uid_val_tech', 'rashid.tech@cooltech.ae', 'Rashid Technician', 'EMPLOYEE', 'Senior Technician', 'Technical', 1),
        ('usr_buyer', 'uid_val_buyer', 'buyer@cooltech.ae', 'Procurement Buyer', 'EMPLOYEE', 'Buyer Specialist', 'Procurement', 1),
        ('usr_fc', 'uid_val_fc', 'fc@cooltech.ae', 'Finance Controller', 'MANAGER', 'Finance Controller', 'Finance', 1),
        ('usr_unauth', 'uid_val_unauth', 'other@cooltech.ae', 'Unrelated Employee', 'EMPLOYEE', 'Clerk', 'Sales', 1);
    `);

    rawDb.exec(`
      INSERT INTO suppliers (id, sl_no, supplier_name, trn, status, created_at, updated_at)
      VALUES
        ('sup_futtaim', 1, 'Al-Futtaim HVAC Supplies', '100234567800003', 'Active', datetime('now'), datetime('now')),
        ('sup_lutfi', 2, 'Lutfi Trading LLC', '100345678900003', 'Active', datetime('now'), datetime('now')),
        ('sup_danfoss', 3, 'Danfoss Middle East FZCO', '100456789000003', 'Active', datetime('now'), datetime('now'));
    `);

    rawDb.exec(`
      INSERT INTO crm_inventory (id, sl_no, code, name, category, purchase_rate, stock, current_stock, minimum_stock, created_at, updated_at)
      VALUES
        ('inv_copper', 1, 'MAT-COPPER-01', 'Copper Pipe 1/2 inch', 'Piping', 50.0, 10.0, 10.0, 20.0, datetime('now'), datetime('now')),
        ('inv_filter', 2, 'MAT-FILTER-02', 'Air Filter Cartridge', 'Filtration', 30.0, 50.0, 50.0, 15.0, datetime('now'), datetime('now'));
    `);
  });

  // ==========================================================================
  // REQUIREMENT 2: VERIFY DASHBOARD METRICS MATCH ACTUAL DATABASE RECORDS
  // ==========================================================================
  it('Requirement 2: Dashboard metrics and 11 operational queues accurately reflect live SQLite records', async () => {
    // Seed known records across tables:
    // 1. MSRFs: 1 Draft/Pending, 1 Approved & Awaiting_Intake
    rawDb.exec(`
      INSERT INTO material_service_requests (id, sl_no, msrf_number, date, requestor_id, requestor_name, department, priority, purpose, required_by_date, estimated_total_value, reporting_head_status, procurement_status, created_at, updated_at)
      VALUES
        ('msrf_01', 1, 'MSRF-2026-001', '2026-10-20', 'usr_tech', 'Rashid Technician', 'Technical', 'High', 'AC Repairs', '2026-11-01', 5000, 'Pending', 'Awaiting_Intake', datetime('now'), datetime('now')),
        ('msrf_02', 2, 'MSRF-2026-002', '2026-10-22', 'usr_tech', 'Rashid Technician', 'Technical', 'Medium', 'Duct Maintenance', '2026-11-05', 8000, 'Approved', 'Awaiting_Intake', datetime('now'), datetime('now'));
    `);

    // 2. Approved Purchase Orders: 1 for Al-Futtaim (AED 10,500), 1 for Lutfi (AED 5,250)
    rawDb.exec(`
      INSERT INTO purchase_orders (id, sl_no, po_number, date, supplier, amount, vat, total_amount, approval, delivery_status, payment_status, created_at, updated_at)
      VALUES
        ('po_dash_01', 1, 'CTPO-DASH-101', '2026-10-01', 'Al-Futtaim HVAC Supplies', 10000, 500, 10500, 'Approved', 'Pending', 'Unpaid', datetime('now'), datetime('now')),
        ('po_dash_02', 2, 'CTPO-DASH-102', '2026-10-05', 'Lutfi Trading LLC', 5000, 250, 5250, 'Approved', 'Pending', 'Unpaid', datetime('now'), datetime('now')),
        ('po_dash_03', 3, 'CTPO-DASH-103', '2026-10-08', 'Danfoss Middle East FZCO', 3000, 150, 3150, 'Waiting for Final Approval', 'Pending', 'Unpaid', datetime('now'), datetime('now'));
    `);

    // 3. Supplier Invoices: 1 Verified_Matching (AED 10,500 with AED 10,500 balance), 1 Pending_Audit (AED 5,250 with AED 5,250 balance)
    rawDb.exec(`
      INSERT INTO supplier_invoices (id, invoice_number, supplier_id, supplier_name, purchase_order_id, purchase_order_number, invoice_date, total_amount, balance_due, matching_status, payment_status, created_at, updated_at)
      VALUES
        ('inv_dash_01', 'INV-DASH-01', 'sup_futtaim', 'Al-Futtaim HVAC Supplies', 'po_dash_01', 'CTPO-DASH-101', '2026-10-15', 10500, 10500, 'Verified_Matching', 'Due', datetime('now'), datetime('now')),
        ('inv_dash_02', 'INV-DASH-02', 'sup_lutfi', 'Lutfi Trading LLC', 'po_dash_02', 'CTPO-DASH-102', '2026-10-18', 5250, 5250, 'Pending_Audit', 'Due', datetime('now'), datetime('now'));
    `);

    const res = await app.request('/api/procurement-dashboard/summary', {
      headers: { Authorization: `Bearer ${tokens.financeController}` },
    }, env);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const { spendBySupplier, openCommitments, payables, operationalQueues } = body.data;

    // Verify Metrics Match Direct DB Record Sums
    const totalSpend = spendBySupplier.reduce((acc, s) => acc + s.total_spend, 0);
    assert.equal(totalSpend, 15750); // 10500 + 5250
    assert.equal(openCommitments.openOrdersCount, 2); // 2 Approved POs with pending delivery
    assert.equal(payables.totalOutstandingBalance, 15750); // 15,750 balance due
    assert.equal(operationalQueues.stockShortages.inventoryShortageCount, 1); // MAT-COPPER-01 current (10) <= min (20)

    // Verify Operational Queues
    assert.equal(operationalQueues.msrfPendingApproval.count, 1);
    assert.equal(operationalQueues.procurementIntake.count, 1);
    assert.equal(operationalQueues.posAwaitingApproval.count, 1); // po_dash_03 is 'Waiting for Final Approval'
    assert.equal(operationalQueues.invoicesAwaitingMatching.count, 1); // inv_dash_02 is 'Pending_Audit'

    // Verify Spend by Supplier breakdown
    const futtaimSpend = spendBySupplier.find((s) => s.supplier === 'Al-Futtaim HVAC Supplies');
    assert.equal(futtaimSpend.total_spend, 10500);
    const lutfiSpend = spendBySupplier.find((s) => s.supplier === 'Lutfi Trading LLC');
    assert.equal(lutfiSpend.total_spend, 5250);
  });

  // ==========================================================================
  // REQUIREMENT 3: SUPPLIER RECONCILIATION CONTROLLED EXAMPLES
  // ==========================================================================
  it('Requirement 3: Supplier statement reconciliation handles exact matches, partial payment balances, missing entries, statement duplicates, payment records, and net variances non-destructively', async () => {
    // 1. Seed CRM AP state for Al-Futtaim:
    // Invoice A: Total 3,000, Paid 1,000, Balance Due 2,000
    // Invoice B: Total 5,000, Paid 0, Balance Due 5,000
    // Invoice C: Total 1,500, Paid 0, Balance Due 1,500 (Omitted from statement to test MISSING_IN_STATEMENT)
    rawDb.exec(`
      INSERT INTO supplier_invoices (id, invoice_number, supplier_id, supplier_name, invoice_date, total_amount, amount_paid, balance_due, matching_status, payment_status, created_at, updated_at)
      VALUES
        ('inv_rec_01', 'INV-FT-001', 'sup_futtaim', 'Al-Futtaim HVAC Supplies', '2026-10-01', 3000, 1000, 2000, 'Verified_Matching', 'Partially_Paid', datetime('now'), datetime('now')),
        ('inv_rec_02', 'INV-FT-002', 'sup_futtaim', 'Al-Futtaim HVAC Supplies', '2026-10-05', 5000, 0, 5000, 'Verified_Matching', 'Due', datetime('now'), datetime('now')),
        ('inv_rec_03', 'INV-FT-003', 'sup_futtaim', 'Al-Futtaim HVAC Supplies', '2026-10-10', 1500, 0, 1500, 'Verified_Matching', 'Due', datetime('now'), datetime('now'));
    `);

    // 2. Seed CRM payment voucher of AED 1,000
    rawDb.exec(`
      INSERT INTO supplier_payments (id, sl_no, voucher_number, payment_date, supplier_id, supplier_name, payment_mode, amount, status, created_at, updated_at)
      VALUES
        ('sp_01', 1, 'PV-2026-001', '2026-10-08', 'sup_futtaim', 'Al-Futtaim HVAC Supplies', 'Bank_Transfer', 1000, 'Completed', datetime('now'), datetime('now'));
    `);

    // 3. Test Statement containing:
    // a) INV-FT-002: Exact match on total_amount (5000)
    // b) INV-FT-001: Statement bills the remaining balance after partial payment (2000) -> MATCHED with balance note
    // c) INV-FT-002: Repeated row on statement -> DUPLICATE_ON_STATEMENT
    // d) INV-FT-999: Not in CRM AP -> MISSING_IN_CRM (1,200)
    // e) PMT-2026-001: Statement payment matching CRM voucher PV-2026-001 (amount -1000) -> PAYMENT_MATCHED
    // f) PMT-UNRECORDED: Statement payment not in CRM (amount -300) -> PAYMENT_MISSING_IN_CRM
    // g) INV-FT-PRICE-DIFF: Invoiced for 4,000, CRM has nothing, but let's test variance by sending INV-FT-002 with 5,500 in another run or entry.
    const reconcilePayload = {
      supplierId: 'sup_futtaim',
      statementDate: '2026-10-31',
      statementClosingBalance: 7900, // Statement claim: 2000 + 5000 + 1200 - 300 = 7900
      entries: [
        { statementInvoiceNo: 'INV-FT-002', amount: 5000, date: '2026-10-05' },
        { statementInvoiceNo: 'INV-FT-001', amount: 2000, date: '2026-10-01' },
        { statementInvoiceNo: 'INV-FT-002', amount: 5000, date: '2026-10-05' }, // Duplicate entry on statement
        { statementInvoiceNo: 'INV-FT-999', amount: 1200, date: '2026-10-15' }, // Missing in CRM
        { statementInvoiceNo: 'PV-2026-001', amount: -1000, date: '2026-10-08', isPayment: true }, // Matched payment
        { statementInvoiceNo: 'PMT-UNKNOWN-88', amount: -300, date: '2026-10-25', isPayment: true }, // Unrecorded payment
      ],
    };

    const countBefore = rawDb.prepare('SELECT count(*) as c FROM supplier_invoices').get().c;
    const paymentCountBefore = rawDb.prepare('SELECT count(*) as c FROM supplier_payments').get().c;

    const res = await app.request('/api/supplier-reconciliation/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify(reconcilePayload),
    }, env);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const r = body.reconciliation;

    // Verify Classifications
    assert.equal(r.summary.matchedCount, 2); // INV-FT-002 (exact) and INV-FT-001 (balance matched)
    assert.equal(r.summary.missingInCrmCount, 1); // INV-FT-999
    assert.equal(r.summary.missingInStatementCount, 1); // INV-FT-003 was in CRM but missing on statement
    assert.equal(r.summary.duplicateCount, 1); // Repeated INV-FT-002
    assert.equal(r.summary.paymentCount, 2); // PV-2026-001 and PMT-UNKNOWN-88

    // Verify Specific Details
    assert.equal(r.matchedEntries[0].statementInvoiceNo, 'INV-FT-002');
    assert.equal(r.matchedEntries[1].statementInvoiceNo, 'INV-FT-001');
    assert.ok(r.matchedEntries[1].notes.includes('remaining balance'));

    assert.equal(r.duplicateEntries[0].statementInvoiceNo, 'INV-FT-002');
    assert.equal(r.duplicateEntries[0].status, 'DUPLICATE_ON_STATEMENT');

    assert.equal(r.missingInCrmEntries[0].statementInvoiceNo, 'INV-FT-999');
    assert.equal(r.missingInStatementEntries[0].invoiceNumber, 'INV-FT-003');

    assert.equal(r.paymentEntries[0].status, 'PAYMENT_MATCHED');
    assert.equal(r.paymentEntries[1].status, 'PAYMENT_MISSING_IN_CRM');

    // Internal Ledger Balance = 2000 + 5000 + 1500 = 8500
    assert.equal(r.internalLedgerBalance, 8500);
    // Net Variance = Statement (7900) - CRM (8500) = -600
    assert.equal(r.netVariance, -600);
    assert.equal(r.isReconciled, false);

    // Non-destructive verification: Database unchanged
    const countAfter = rawDb.prepare('SELECT count(*) as c FROM supplier_invoices').get().c;
    const paymentCountAfter = rawDb.prepare('SELECT count(*) as c FROM supplier_payments').get().c;
    assert.equal(countBefore, countAfter);
    assert.equal(paymentCountBefore, paymentCountAfter);
  });

  // ==========================================================================
  // REQUIREMENTS 4 & 5: AP AGEING, PARTIAL PAYMENTS & ESTIMATED DUE DATES
  // ==========================================================================
  it('Requirements 4 & 5: AP ageing buckets invoices by due date, tracks partial payments against balance due, and flags estimated due dates', async () => {
    const now = new Date();
    const dAgo = (days) => new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];

    // Seed 5 invoices for Lutfi Trading LLC:
    // 1. Inv 01: Due 15 days ago (0-30 Days Current). Due date specified. Total 1000, Balance 1000.
    // 2. Inv 02: Due 45 days ago (31-60 Days). Due date specified. Total 2000, Paid 500, Balance 1500 (Partial Payment).
    // 3. Inv 03: Due 75 days ago (61-90 Days). Due date specified. Total 3000, Balance 3000.
    // 4. Inv 04: Due 110 days ago (90+ Days Overdue). Due date specified. Total 4000, Balance 4000.
    // 5. Inv 05: NULL due_date! Invoice date is 20 days ago (0-30 Days Current). Total 1200, Balance 1200. Estimated due date!
    // 6. Inv 06: Fully paid (Balance 0) -> Excluded from aging.
    rawDb.exec(`
      INSERT INTO supplier_invoices (id, invoice_number, supplier_id, supplier_name, invoice_date, due_date, total_amount, amount_paid, balance_due, payment_status, matching_status, created_at, updated_at)
      VALUES
        ('inv_age_01', 'INV-AG-01', 'sup_lutfi', 'Lutfi Trading LLC', '${dAgo(15)}', '${dAgo(15)}', 1000, 0, 1000, 'Due', 'Verified_Matching', datetime('now'), datetime('now')),
        ('inv_age_02', 'INV-AG-02', 'sup_lutfi', 'Lutfi Trading LLC', '${dAgo(45)}', '${dAgo(45)}', 2000, 500, 1500, 'Partially_Paid', 'Verified_Matching', datetime('now'), datetime('now')),
        ('inv_age_03', 'INV-AG-03', 'sup_lutfi', 'Lutfi Trading LLC', '${dAgo(75)}', '${dAgo(75)}', 3000, 0, 3000, 'Due', 'Verified_Matching', datetime('now'), datetime('now')),
        ('inv_age_04', 'INV-AG-04', 'sup_lutfi', 'Lutfi Trading LLC', '${dAgo(110)}', '${dAgo(110)}', 4000, 0, 4000, 'Due', 'Verified_Matching', datetime('now'), datetime('now')),
        ('inv_age_05', 'INV-AG-05', 'sup_lutfi', 'Lutfi Trading LLC', '${dAgo(20)}', NULL, 1200, 0, 1200, 'Due', 'Verified_Matching', datetime('now'), datetime('now')),
        ('inv_age_06', 'INV-AG-06', 'sup_lutfi', 'Lutfi Trading LLC', '${dAgo(50)}', '${dAgo(50)}', 800, 800, 0, 'Paid', 'Verified_Matching', datetime('now'), datetime('now'));
    `);

    const res = await app.request('/api/supplier-reconciliation/ap-aging?supplierId=sup_lutfi', {
      headers: { Authorization: `Bearer ${tokens.financeController}` },
    }, env);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    // Total unpaid invoices = 5 (fully paid excluded)
    assert.equal(body.totalUnpaidInvoices, 5);

    // Total outstanding balance = 1000 + 1500 (partial!) + 3000 + 4000 + 1200 = 10,700
    assert.equal(body.grandTotal, 10700);

    const { buckets } = body;

    // Bucket 1: 0-30 Days -> Inv 01 (1000) + Inv 05 (1200) = 2200 (count 2)
    assert.equal(buckets.current.count, 2);
    assert.equal(buckets.current.totalAmount, 2200);

    // Bucket 2: 31-60 Days -> Inv 02 (balance_due 1500, not total 2000!)
    assert.equal(buckets.days31_60.count, 1);
    assert.equal(buckets.days31_60.totalAmount, 1500);

    // Bucket 3: 61-90 Days -> Inv 03 (3000)
    assert.equal(buckets.days61_90.count, 1);
    assert.equal(buckets.days61_90.totalAmount, 3000);

    // Bucket 4: 90+ Days Overdue -> Inv 04 (4000)
    assert.equal(buckets.days90_plus.count, 1);
    assert.equal(buckets.days90_plus.totalAmount, 4000);

    // Verification of Estimated Due Date Identification (Requirement 5):
    // Inv 01 has confirmed due date -> isDueDateEstimated: false
    const inv01 = buckets.current.invoices.find((i) => i.invoice_number === 'INV-AG-01');
    assert.equal(inv01.isDueDateEstimated, false);

    // Inv 05 has null due date -> isDueDateEstimated: true
    const inv05 = buckets.current.invoices.find((i) => i.invoice_number === 'INV-AG-05');
    assert.equal(inv05.isDueDateEstimated, true);
    assert.ok(inv05.daysOverdue >= 19 && inv05.daysOverdue <= 21);
  });

  // ==========================================================================
  // REQUIREMENTS 6 & 7: LEGACY DATA DRY-RUN VALIDATION & MIGRATION SAFEGUARDS
  // ==========================================================================
  it('Requirements 6 & 7: Dry-run validates records without mutating database, flags batch & CRM duplicates, blocks non-admins, and enforces migration audit trail', async () => {
    // 1. Seed an existing PO in CRM
    rawDb.exec(`
      INSERT INTO purchase_orders (id, sl_no, po_number, date, supplier, amount, vat, total_amount, created_at, updated_at)
      VALUES
        ('po_exist_01', 1, 'CTPO-LEGACY-EXISTING', '2025-01-10', 'Al-Futtaim HVAC Supplies', 5000, 250, 5250, datetime('now'), datetime('now'));
    `);

    // 2. Prepare legacy batch with:
    // Record A: Valid PO
    // Record B: Duplicate of existing CRM PO (CTPO-LEGACY-EXISTING)
    // Record C: Batch internal duplicate of Record A (repeated in payload)
    // Record D: Invalid amount (0)
    // Record E: Missing supplier
    // Record F: Valid GRN linked to existing PO
    // Record G: Orphan GRN linked to non-existent PO (CTPO-DOES-NOT-EXIST)
    const testBatch = [
      { type: 'PO', poNumber: 'CTPO-MIG-VALID-01', supplier: 'Lutfi Trading LLC', amount: 4500, date: '2025-03-01' },
      { type: 'PO', poNumber: 'CTPO-LEGACY-EXISTING', supplier: 'Al-Futtaim HVAC Supplies', amount: 5000, date: '2025-01-10' },
      { type: 'PO', poNumber: 'CTPO-MIG-VALID-01', supplier: 'Lutfi Trading LLC', amount: 4500, date: '2025-03-01' }, // Batch duplicate
      { type: 'PO', poNumber: 'CTPO-MIG-ZERO', supplier: 'Lutfi Trading LLC', amount: 0, date: '2025-03-05' }, // Invalid amount
      { type: 'PO', poNumber: 'CTPO-MIG-NOSUP', supplier: '', amount: 1000, date: '2025-03-06' }, // Missing supplier
      { type: 'GRN', stockInNo: 'GRN-MIG-VALID-01', purchaseOrderNumber: 'CTPO-LEGACY-EXISTING', supplier: 'Al-Futtaim HVAC Supplies', amount: 5000, date: '2025-01-15' },
      { type: 'GRN', stockInNo: 'GRN-MIG-ORPHAN', purchaseOrderNumber: 'CTPO-DOES-NOT-EXIST', supplier: 'Unknown Vendor', amount: 2000, date: '2025-03-10' }, // Orphan reference
    ];

    const poCountBeforeVal = rawDb.prepare('SELECT count(*) as c FROM purchase_orders').get().c;
    const grnCountBeforeVal = rawDb.prepare('SELECT count(*) as c FROM stock_in_vouchers').get().c;

    // Run Dry-Run Validation
    const valRes = await app.request('/api/procurement/legacy/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ records: testBatch }),
    }, env);

    assert.equal(valRes.status, 200);
    const valBody = await valRes.json();
    assert.equal(valBody.success, true);
    assert.equal(valBody.summary.totalRecords, 7);
    assert.equal(valBody.summary.validCount, 2); // 1 valid PO, 1 valid GRN
    assert.equal(valBody.summary.duplicateCount, 2); // 1 existing CRM duplicate, 1 batch internal duplicate
    assert.equal(valBody.summary.ambiguousCount, 3); // zero amount, missing supplier, orphan GRN PO reference

    // Verify Dry-Run Safeguard: Zero database writes
    const poCountAfterVal = rawDb.prepare('SELECT count(*) as c FROM purchase_orders').get().c;
    const grnCountAfterVal = rawDb.prepare('SELECT count(*) as c FROM stock_in_vouchers').get().c;
    assert.equal(poCountBeforeVal, poCountAfterVal);
    assert.equal(grnCountBeforeVal, grnCountAfterVal);

    // Safeguard 2: Unauthorized employee attempts import -> 403 Forbidden
    const unauthImport = await app.request('/api/procurement/legacy/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.unauthEmployee}` },
      body: JSON.stringify({ records: testBatch }),
    }, env);
    assert.equal(unauthImport.status, 403);

    // Safeguard 3: Super Admin executes controlled import -> Only valid PO imported, duplicates skipped
    const adminImport = await app.request('/api/procurement/legacy/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.superAdmin}` },
      body: JSON.stringify({ records: testBatch }),
    }, env);
    assert.equal(adminImport.status, 201);
    const importBody = await adminImport.json();
    assert.equal(importBody.importedCount, 1); // Only CTPO-MIG-VALID-01
    assert.equal(importBody.skippedCount, 6); // Duplicates and invalid skipped
    assert.ok(importBody.batchId.startsWith('MIG-BATCH-'));

    // Verify imported PO has migration tags
    const importedPo = rawDb.prepare('SELECT is_legacy_migrated, migration_batch_id FROM purchase_orders WHERE po_number = ?')
      .get('CTPO-MIG-VALID-01');
    assert.equal(importedPo.is_legacy_migrated, 1);
    assert.equal(importedPo.migration_batch_id, importBody.batchId);

    // Verify Audit Log was created
    const auditLog = rawDb.prepare("SELECT * FROM procurement_audit_logs WHERE entity_type = 'LEGACY_MIGRATION' AND entity_id = ?")
      .get(importBody.batchId);
    assert.ok(auditLog);
    assert.equal(auditLog.action, 'LEGACY_MIGRATION_BATCH_EXECUTED');

    // Safeguard 4: Re-running import with identical records -> 0 imported, 100% skipped
    const reImport = await app.request('/api/procurement/legacy/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.superAdmin}` },
      body: JSON.stringify({ records: testBatch }),
    }, env);
    assert.equal(reImport.status, 201);
    const reImportBody = await reImport.json();
    assert.equal(reImportBody.importedCount, 0);
    assert.equal(reImportBody.skippedCount, 7);
  });

  // ==========================================================================
  // REQUIREMENTS 8 & 9: COMPLETE PURCHASE WORKFLOW & GOVERNANCE INTEGRITY
  // ==========================================================================
  it('Requirements 8 & 9: Complete 11-stage purchase workflow executes from MSRF submission through approval, stock verification, PO, GRN, 3-way matching, payment, requester confirmation, to final closure with audit integrity', async () => {
    // ------------------------------------------------------------------------
    // STAGE 1: MSRF SUBMISSION (Technician)
    // ------------------------------------------------------------------------
    const msrfRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff}` },
      body: JSON.stringify({
        purpose: 'Site emergency HVAC compressor overhaul',
        requiredByDate: '2026-11-25',
        department: 'Technical',
        priority: 'High',
        items: [
          { item_code: 'MAT-COPPER-01', description: 'Copper Pipe 1/2 inch', requested_qty: 30, estimated_unit_rate: 50 },
        ],
      }),
    }, env);
    assert.equal(msrfRes.status, 201);
    const { request: msrf } = await msrfRes.json();
    assert.equal(msrf.reporting_head_status, 'Pending');
    assert.equal(msrf.procurement_status, 'Awaiting_Intake');

    // ------------------------------------------------------------------------
    // STAGE 2: REPORTING HEAD APPROVAL (Operations Manager)
    // ------------------------------------------------------------------------
    const apprvRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
      body: JSON.stringify({ decision: 'Approved', approvalNotes: 'Critical client site; approved immediately.' }),
    }, env);
    assert.equal(apprvRes.status, 200);
    const { request: approvedMsrf } = await apprvRes.json();
    assert.equal(approvedMsrf.reporting_head_status, 'Approved');
    assert.equal(approvedMsrf.procurement_status, 'Awaiting_Intake');

    // ------------------------------------------------------------------------
    // STAGE 3: PROCUREMENT INTAKE & STOCK VERIFICATION
    // Inventory current_stock is 10, requested is 30 -> Shortage of 20
    // ------------------------------------------------------------------------
    const msrfItems = rawDb.prepare('SELECT * FROM material_service_request_items WHERE msrf_id = ?').all(msrf.id);
    assert.equal(msrfItems.length, 1);
    const requestedItemId = msrfItems[0].id;

    // Reserve available 10 in stock
    const reserveRes = await app.request(`/api/msrf/${msrf.id}/reserve-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        allocations: [{ itemId: requestedItemId, inventoryId: 'inv_copper', reservedQty: 10 }],
      }),
    }, env);
    assert.equal(reserveRes.status, 200);

    // Issue the 10 reserved units from warehouse
    const issueRes = await app.request(`/api/msrf/${msrf.id}/issue-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        issuances: [{ itemId: requestedItemId, inventoryId: 'inv_copper', issuedQty: 10 }],
      }),
    }, env);
    assert.equal(issueRes.status, 200);

    // Check inventory stock decremented from 10 to 0
    const invAfterIssue = rawDb.prepare('SELECT current_stock FROM crm_inventory WHERE id = ?').get('inv_copper');
    assert.equal(invAfterIssue.current_stock, 0);

    // ------------------------------------------------------------------------
    // STAGE 4 & 5: GENERATE SHORTAGE PURCHASE ORDER (20 units)
    // ------------------------------------------------------------------------
    const poRes = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        poNumber: 'CTPO-SHORTAGE-001',
        supplier: 'Al-Futtaim HVAC Supplies',
        msrfId: msrf.id,
        amount: 1000, // 20 * 50
        vat: 50,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 20, amount: 50 }],
      }),
    }, env);
    assert.equal(poRes.status, 201);
    const { order: po } = await poRes.json();
    assert.equal(po.approval, 'Waiting for Final Approval');

    // ------------------------------------------------------------------------
    // STAGE 6: FINANCIAL APPROVAL ENFORCEMENT
    // Amount is 1,050 (< 100k) -> Finance Controller can approve
    // ------------------------------------------------------------------------
    const poApprvRes = await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);
    assert.equal(poApprvRes.status, 200);
    const { order: approvedPo } = await poApprvRes.json();
    assert.equal(approvedPo.approval, 'Approved');

    // ------------------------------------------------------------------------
    // STAGE 7: GOODS RECEIPT (Warehouse accepts 20 units)
    // ------------------------------------------------------------------------
    const poItems = rawDb.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').all(po.id);
    const grnRes = await app.request('/api/stock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        purchase_order_id: po.id,
        lpoNumber: po.po_number,
        deliveryMode: 'Warehouse_Receipt',
        supplier: po.supplier,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 20, purchaseRate: 50, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    assert.equal(grnRes.status, 201);
    const { record: grn } = await grnRes.json();
    assert.ok(grn.id);

    // Inventory incremented by 20 -> current_stock is now 20
    const invAfterGrn = rawDb.prepare('SELECT current_stock FROM crm_inventory WHERE id = ?').get('inv_copper');
    assert.equal(invAfterGrn.current_stock, 20);

    // ------------------------------------------------------------------------
    // STAGE 8: 3-WAY INVOICE MATCHING
    // ------------------------------------------------------------------------
    const invRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        supplierId: 'sup_futtaim',
        purchaseOrderId: po.id,
        grnId: grn.id,
        invoiceNumber: 'INV-3WAY-VAL-01',
        invoiceDate: '2026-11-02',
        dueDate: '2026-12-02',
        subtotal: 1000,
        vatAmount: 50,
        totalAmount: 1050,
        items: [{ purchaseOrderItemId: poItems[0].id, code: 'MAT-COPPER-01', description: 'Copper Pipe 1/2 inch', invoicedQty: 20, unitPrice: 50 }],
      }),
    }, env);
    assert.equal(invRes.status, 201);
    const { invoice } = await invRes.json();
    assert.equal(invoice.matching_status, 'Verified_Matching');

    // ------------------------------------------------------------------------
    // STAGE 9: PAYMENT DISBURSEMENT & ALLOCATION
    // ------------------------------------------------------------------------
    const payRes = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({
        voucher_number: 'PV-VAL-001',
        payment_date: '2026-11-05',
        supplier_id: 'sup_futtaim',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        payment_mode: 'Bank_Transfer',
        amount: 1050,
        allocations: [{ invoice_id: invoice.id, amount: 1050 }],
      }),
    }, env);
    assert.equal(payRes.status, 201);

    // Verify invoice is now fully Paid with 0 balance
    const updatedInv = rawDb.prepare('SELECT amount_paid, balance_due, payment_status FROM supplier_invoices WHERE id = ?').get(invoice.id);
    assert.equal(updatedInv.amount_paid, 1050);
    assert.equal(updatedInv.balance_due, 0);
    assert.equal(updatedInv.payment_status, 'Paid');

    // ------------------------------------------------------------------------
    // STAGE 10: REQUESTER RECEIPT CONFIRMATION
    // Premature closure by manager before confirmation is blocked
    // ------------------------------------------------------------------------
    const prematureClose = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
    }, env);
    assert.equal(prematureClose.status, 422);

    // Requester confirms receipt
    const confirmReceiptRes = await app.request(`/api/msrf/${msrf.id}/confirm-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff}` },
      body: JSON.stringify({ rating: 5, condition: 'Excellent', comments: 'All pipes received and installed at site.' }),
    }, env);
    assert.equal(confirmReceiptRes.status, 200);

    // ------------------------------------------------------------------------
    // STAGE 11: FINAL REQUISITION CLOSURE
    // ------------------------------------------------------------------------
    const finalCloseRes = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.reportingHead}` },
      body: JSON.stringify({ closureNotes: 'Overhaul successfully verified by site engineer.' }),
    }, env);
    assert.equal(finalCloseRes.status, 200);
    const { request: closedMsrf } = await finalCloseRes.json();
    assert.equal(closedMsrf.is_closed, 1);
    assert.equal(closedMsrf.procurement_status, 'Closed');

    // ------------------------------------------------------------------------
    // AUDIT LOG INTEGRITY VERIFICATION
    // ------------------------------------------------------------------------
    const auditLogs = rawDb.prepare('SELECT entity_type, action, actor_name FROM procurement_audit_logs ORDER BY created_at ASC').all();
    assert.ok(auditLogs.length >= 4);
    const actions = auditLogs.map((a) => a.action);
    assert.ok(actions.includes('MSRF_REPORTING_HEAD_APPROVED'));
    assert.ok(actions.includes('PO_APPROVED'));
    assert.ok(actions.includes('MSRF_RECEIPT_CONFIRMED'));
    assert.ok(actions.includes('MSRF_CLOSED'));
  });

  it('Requirement 10: Supplier created with name and contact persists to database and is immediately retrievable for quotation selection', async () => {
    // 1. Create supplier using frontend payload format (name, contact, trn)
    const createRes = await app.request('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.superAdmin}` },
      body: JSON.stringify({
        name: 'Hello Cooling Systems LLC',
        trn: '67486786786',
        contact: '8988789686',
        email: 'ctauhweb@gmail.com',
        address: 'Dubai Investment Park',
      }),
    }, env);
    assert.equal(createRes.status, 201);
    const { supplier } = await createRes.json();
    assert.equal(supplier.supplier_name, 'Hello Cooling Systems LLC');
    assert.equal(supplier.trn, '67486786786');
    assert.equal(supplier.phone, '8988789686');

    // 2. Fetch list of suppliers
    const listRes = await app.request('/api/suppliers', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(listRes.status, 200);
    const { suppliers } = await listRes.json();
    const found = suppliers.find((s) => s.supplier_name === 'Hello Cooling Systems LLC');
    assert.ok(found, 'Created supplier must appear in GET /api/suppliers for quotation selection');
  });
});
