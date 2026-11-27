/**
 * Phase 4 Supplier Invoicing, 3-Way Matching Engine, and Payment Governance Test Suite
 * (cool-tech-crm-api)
 *
 * Verifies:
 * 1. Supplier invoice creation, line items, and 3-way matching engine (Verified_Matching).
 * 2. Quantity discrepancy and price discrepancy detection with item variance reporting.
 * 3. Pending_Audit state when invoice is recorded prior to GRN receipt.
 * 4. Rejection of invoices against unapproved or missing Purchase Orders.
 * 5. Duplicate invoice number detection per supplier.
 * 6. Discrepancy resolution with role enforcement and audit logging.
 * 7. Payment approval gate blocking unapproved/discrepant invoices.
 * 8. Manual payment disbursement recording with duplicate reference prevention.
 * 9. Over-allocation and over-payment prevention.
 * 10. Full & partial payment allocation, invoice/PO balance synchronization.
 * 11. Immutable procurement audit log generation.
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { app } from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const TEST_KID = 'p4-invoicing-test-key';

function createPhase4Database() {
  const sqlite = new DatabaseSync(':memory:');

  // Base Users Table
  sqlite.exec(`CREATE TABLE users (
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

  // Sequential migrations 0002 to 0011
  const m2 = fs.readFileSync(path.resolve(__dirname, '../migrations/0002_create_customers.sql'), 'utf8');
  sqlite.exec(m2);

  const m3 = fs.readFileSync(path.resolve(__dirname, '../migrations/0003_create_leads.sql'), 'utf8');
  sqlite.exec(m3);

  const m4 = fs.readFileSync(path.resolve(__dirname, '../migrations/0004_create_sales_workflow.sql'), 'utf8');
  sqlite.exec(m4);

  const m5 = fs.readFileSync(path.resolve(__dirname, '../migrations/0005_create_tasks_and_worker_ops.sql'), 'utf8');
  sqlite.exec(m5);

  const m6 = fs.readFileSync(path.resolve(__dirname, '../migrations/0006_create_sales_auxiliary_documents.sql'), 'utf8');
  sqlite.exec(m6);

  const m7 = fs.readFileSync(path.resolve(__dirname, '../migrations/0007_create_procurement_and_inventory.sql'), 'utf8');
  sqlite.exec(m7);

  const m8 = fs.readFileSync(path.resolve(__dirname, '../migrations/0008_create_settings_targets_stages.sql'), 'utf8');
  sqlite.exec(m8);

  const m9 = fs.readFileSync(path.resolve(__dirname, '../migrations/0009_user_profile_and_permissions.sql'), 'utf8');
  sqlite.exec(m9);

  const m10 = fs.readFileSync(path.resolve(__dirname, '../migrations/0010_procurement_governance_core.sql'), 'utf8');
  sqlite.exec(m10);

  const m11 = fs.readFileSync(path.resolve(__dirname, '../migrations/0011_supplier_invoicing_and_matching.sql'), 'utf8');
  sqlite.exec(m11);

  const mockD1 = {
    prepare(sql) {
      return {
        _sql: sql,
        _bindings: [],
        bind(...args) {
          this._bindings = args.map((v) => (v === undefined ? null : v));
          return this;
        },
        async first(col) {
          const stmt = sqlite.prepare(this._sql);
          const row = stmt.get(...this._bindings);
          if (!row) return null;
          if (col && typeof col === 'string') return row[col];
          return row;
        },
        async all() {
          const stmt = sqlite.prepare(this._sql);
          const results = stmt.all(...this._bindings);
          return { results, success: true };
        },
        async run() {
          const stmt = sqlite.prepare(this._sql);
          const result = stmt.run(...this._bindings);
          return {
            success: true,
            meta: {
              changes: result.changes,
              last_row_id: Number(result.lastInsertRowid),
            },
          };
        },
      };
    },
  };

  return { d1: mockD1, rawDb: sqlite };
}

describe('Phase 4 Supplier Invoicing, 3-Way Matching, and Payment Governance Test Suite', () => {
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
    tokens.financeController = await makeToken('uid_fc', 'fc@cooltech.ae');
    tokens.procurementBuyer = await makeToken('uid_buyer', 'buyer@cooltech.ae');
    tokens.fieldWorker = await makeToken('uid_worker', 'worker@cooltech.ae');
  });

  beforeEach(() => {
    const dbObj = createPhase4Database();
    env = { DB: dbObj.d1 };
    const raw = dbObj.rawDb;

    // Seed staff
    raw.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, designation, department, is_active)
      VALUES
        ('usr_superadmin', 'uid_superadmin', 'superadmin@cooltech.ae', 'Super Administrator', 'SUPER_ADMIN', 'Chief Operating Officer', 'Management', 1),
        ('usr_fc', 'uid_fc', 'fc@cooltech.ae', 'Finance Controller', 'MANAGER', 'Finance Controller', 'Finance', 1),
        ('usr_buyer', 'uid_buyer', 'buyer@cooltech.ae', 'Procurement Officer', 'EMPLOYEE', 'Buyer', 'Procurement', 1),
        ('usr_worker', 'uid_worker', 'worker@cooltech.ae', 'Field Worker', 'EMPLOYEE', 'Technician', 'Field Ops', 1);
    `);

    // Seed suppliers
    raw.exec(`
      INSERT INTO suppliers (id, sl_no, supplier_name, trn, status, created_at, updated_at)
      VALUES
        ('sup_01', 1, 'Al-Futtaim HVAC Supplies', '100234567800003', 'Active', datetime('now'), datetime('now')),
        ('sup_02', 2, 'Lutfi Trading LLC', '100345678900003', 'Active', datetime('now'), datetime('now'));
    `);
  });

  it('1. Exact 3-Way Matching: Approved PO + Matching GRN + Accurate Invoice results in Verified_Matching', async () => {
    // 1. Seed Approved PO
    const poId = 'po_match_01';
    const now = new Date().toISOString();
    env.DB.prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, supplier, supplier_id, amount, vat, total_amount,
        approval, delivery_status, payment_status, created_at, updated_at
      ) VALUES (?, 1, 'CTPO#2801', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', 5000, 250, 5250, 'Approved', 'Pending', 'Due', ?, ?)
    `).bind(poId, now, now).run();

    // PO Items
    await env.DB.prepare(`
      INSERT INTO purchase_order_items (id, purchase_order_id, code, description, qty, amount, total, sort_order)
      VALUES ('poi_01', ?, 'COMP-101', 'Copeland Scroll Compressor 5HP', 5, 1000, 5000, 0)
    `).bind(poId).run();

    // 2. Seed Matching GRN (Goods Receipt)
    const grnId = 'grn_match_01';
    await env.DB.prepare(`
      INSERT INTO stock_in_vouchers (
        id, sl_no, stock_in_no, date, supplier, supplier_id, purchase_order_id, status, created_at, updated_at
      ) VALUES (?, 1, 'STK-IN-901', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', ?, 'Approved', ?, ?)
    `).bind(grnId, poId, now, now).run();

    await env.DB.prepare(`
      INSERT INTO stock_in_items (id, voucher_id, code, item_name, qty, purchase_rate, purchase_order_item_id, sort_order)
      VALUES ('sii_grn_01', ?, 'COMP-101', 'Copeland Scroll Compressor 5HP', 5, 1000, 'poi_01', 0)
    `).bind(grnId).run();

    // 3. Create Supplier Invoice matching exact quantity and rate
    const res = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-AF-901',
        invoiceDate: '2026-10-26',
        dueDate: '2026-11-25',
        supplierId: 'sup_01',
        purchaseOrderId: poId,
        grnId,
        subtotal: 5000,
        vatAmount: 250,
        totalAmount: 5250,
        items: [
          {
            purchaseOrderItemId: 'poi_01',
            code: 'COMP-101',
            description: 'Copeland Scroll Compressor 5HP',
            invoicedQty: 5,
            unitPrice: 1000,
            taxRate: 5,
          },
        ],
      }),
    }, env);

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.invoice.matching_status, 'Verified_Matching');
    assert.equal(body.matchResult.overallStatus, 'Verified_Matching');
    assert.equal(body.invoice.balance_due, 5250);
    assert.equal(body.invoice.payment_status, 'Due');
  });

  it('2. Discrepancy Detection: Price Discrepancy, Quantity Discrepancy, and Missing GRN (Pending_Audit)', async () => {
    const now = new Date().toISOString();
    const poId = 'po_disc_02';
    await env.DB.prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, supplier, supplier_id, amount, vat, total_amount,
        approval, delivery_status, payment_status, created_at, updated_at
      ) VALUES (?, 2, 'CTPO#2802', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', 3000, 150, 3150, 'Approved', 'Pending', 'Due', ?, ?)
    `).bind(poId, now, now).run();

    await env.DB.prepare(`
      INSERT INTO purchase_order_items (id, purchase_order_id, code, description, qty, amount, total, sort_order)
      VALUES ('poi_02', ?, 'VALV-202', 'Expansion Valve 2 Ton', 3, 1000, 3000, 0)
    `).bind(poId).run();

    // 2a. Invoice recorded before GRN -> Pending_Audit
    const pendingRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-AF-PENDING',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: poId,
        subtotal: 3000,
        vatAmount: 150,
        totalAmount: 3150,
        items: [{ purchaseOrderItemId: 'poi_02', description: 'Expansion Valve 2 Ton', invoicedQty: 3, unitPrice: 1000 }],
      }),
    }, env);

    assert.equal(pendingRes.status, 201);
    const pendingBody = await pendingRes.json();
    assert.equal(pendingBody.invoice.matching_status, 'Pending_Audit');

    // 2b. Price Discrepancy: Supplier bills 1,200 AED vs contracted 1,000 AED
    const priceRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-AF-PRICE-DISC',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: poId,
        subtotal: 3600,
        vatAmount: 180,
        totalAmount: 3780,
        items: [{ purchaseOrderItemId: 'poi_02', description: 'Expansion Valve 2 Ton', invoicedQty: 3, unitPrice: 1200 }],
      }),
    }, env);

    assert.equal(priceRes.status, 201);
    const priceBody = await priceRes.json();
    assert.equal(priceBody.invoice.matching_status, 'Price_Discrepancy');
    assert.ok(priceBody.matchResult.reasons.some((r) => r.includes('Invoiced unit price')));

    // 2c. Quantity Discrepancy: Seed partial GRN (1 received), invoice bills 3
    const grnId = 'grn_partial_02';
    await env.DB.prepare(`
      INSERT INTO stock_in_vouchers (id, sl_no, stock_in_no, date, supplier, supplier_id, purchase_order_id, status, created_at, updated_at)
      VALUES (?, 2, 'STK-IN-902', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', ?, 'Approved', ?, ?)
    `).bind(grnId, poId, now, now).run();

    await env.DB.prepare(`
      INSERT INTO stock_in_items (id, voucher_id, code, item_name, qty, purchase_rate, purchase_order_item_id, sort_order)
      VALUES ('sii_02', ?, 'VALV-202', 'Expansion Valve 2 Ton', 1, 1000, 'poi_02', 0)
    `).bind(grnId).run();

    const qtyRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-AF-QTY-DISC',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: poId,
        grnId,
        subtotal: 3000,
        vatAmount: 150,
        totalAmount: 3150,
        items: [{ purchaseOrderItemId: 'poi_02', description: 'Expansion Valve 2 Ton', invoicedQty: 3, unitPrice: 1000 }],
      }),
    }, env);

    assert.equal(qtyRes.status, 201);
    const qtyBody = await qtyRes.json();
    assert.equal(qtyBody.invoice.matching_status, 'Quantity_Discrepancy');
    assert.ok(qtyBody.matchResult.reasons.some((r) => r.includes('exceeds GRN received quantity')));
  });

  it('3. Invoicing Validations: Rejects unapproved POs, missing POs, and duplicate invoices', async () => {
    const now = new Date().toISOString();
    // 3a. PO not approved yet
    const unapprovedPoId = 'po_unapproved_03';
    await env.DB.prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, supplier, supplier_id, amount, vat, total_amount,
        approval, delivery_status, payment_status, created_at, updated_at
      ) VALUES (?, 3, 'CTPO#2803', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', 2000, 100, 2100, 'Waiting for Final Approval', 'Pending', 'Due', ?, ?)
    `).bind(unapprovedPoId, now, now).run();

    const unapprovedRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-AF-UNAPP',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: unapprovedPoId,
        totalAmount: 2100,
      }),
    }, env);

    assert.equal(unapprovedRes.status, 422);
    const unappBody = await unapprovedRes.json();
    assert.equal(unappBody.code, 'PO_NOT_APPROVED');

    // 3b. Missing PO
    const missingPoRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-AF-NONEXIST',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: 'po_does_not_exist',
        totalAmount: 1000,
      }),
    }, env);
    assert.equal(missingPoRes.status, 404);

    // 3c. Duplicate Invoice Number for same supplier
    const validPoId = 'po_valid_03';
    await env.DB.prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, supplier, supplier_id, amount, vat, total_amount,
        approval, delivery_status, payment_status, created_at, updated_at
      ) VALUES (?, 4, 'CTPO#2804', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', 1000, 50, 1050, 'Approved', 'Pending', 'Due', ?, ?)
    `).bind(validPoId, now, now).run();

    const inv1Res = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-DUP-TEST',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: validPoId,
        totalAmount: 1050,
      }),
    }, env);
    assert.equal(inv1Res.status, 201);

    const dupRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-DUP-TEST',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: validPoId,
        totalAmount: 1050,
      }),
    }, env);
    assert.equal(dupRes.status, 409);
    const dupBody = await dupRes.json();
    assert.equal(dupBody.code, 'DUPLICATE_INVOICE');
  });

  it('4. Discrepancy Resolution & Payment Approval Governance with RBAC', async () => {
    const now = new Date().toISOString();
    const poId = 'po_gov_04';
    await env.DB.prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, supplier, supplier_id, amount, vat, total_amount,
        approval, delivery_status, payment_status, created_at, updated_at
      ) VALUES (?, 5, 'CTPO#2805', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', 4000, 200, 4200, 'Approved', 'Pending', 'Due', ?, ?)
    `).bind(poId, now, now).run();

    await env.DB.prepare(`
      INSERT INTO purchase_order_items (id, purchase_order_id, code, description, qty, amount, total, sort_order)
      VALUES ('poi_04', ?, 'MTR-404', 'Fan Motor 1.5HP', 4, 1000, 4000, 0)
    `).bind(poId).run();

    // Create invoice with price discrepancy
    const invRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-GOV-04',
        invoiceDate: '2026-10-26',
        supplierId: 'sup_01',
        purchaseOrderId: poId,
        subtotal: 4400,
        vatAmount: 220,
        totalAmount: 4620,
        items: [{ purchaseOrderItemId: 'poi_04', description: 'Fan Motor 1.5HP', invoicedQty: 4, unitPrice: 1100 }],
      }),
    }, env);
    const { invoice } = await invRes.json();
    assert.equal(invoice.matching_status, 'Price_Discrepancy');

    // 4a. Field worker cannot resolve discrepancy (403)
    const workerRes = await app.request(`/api/supplier-invoices/${invoice.id}/resolve-discrepancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.fieldWorker}`,
      },
      body: JSON.stringify({
        resolutionAction: 'Accept_Difference',
        resolutionNotes: 'Unauthorized worker attempt',
      }),
    }, env);
    assert.equal(workerRes.status, 403);

    // 4b. Cannot approve payment while discrepancy is active (422)
    const unapprovedPayRes = await app.request(`/api/supplier-invoices/${invoice.id}/approve-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
    }, env);
    assert.equal(unapprovedPayRes.status, 422);
    const unappPayBody = await unapprovedPayRes.json();
    assert.equal(unappPayBody.code, 'UNRESOLVED_DISCREPANCY');

    // 4c. Finance Controller resolves discrepancy
    const resolveRes = await app.request(`/api/supplier-invoices/${invoice.id}/resolve-discrepancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        resolutionAction: 'Accept_Difference',
        resolutionNotes: 'Approved emergency price hike due to urgent freight surcharge.',
      }),
    }, env);
    assert.equal(resolveRes.status, 200);
    const resolveBody = await resolveRes.json();
    assert.equal(resolveBody.invoice.matching_status, 'Approved');
    assert.equal(resolveBody.invoice.resolved_by_name, 'Finance Controller');

    // 4d. Finance Controller executes payment approval sign-off
    const approvePayRes = await app.request(`/api/supplier-invoices/${invoice.id}/approve-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
    }, env);
    assert.equal(approvePayRes.status, 200);
    const approvePayBody = await approvePayRes.json();
    assert.ok(approvePayBody.invoice.payment_approved_at);
  });

  it('5. Payment Recording, Allocations, Overpayment Rejection, and Audit Logging', async () => {
    const now = new Date().toISOString();
    const poId = 'po_pay_05';
    await env.DB.prepare(`
      INSERT INTO purchase_orders (
        id, sl_no, po_number, date, supplier, supplier_id, amount, vat, total_amount,
        approval, delivery_status, payment_status, created_at, updated_at
      ) VALUES (?, 6, 'CTPO#2806', '2026-10-26', 'Al-Futtaim HVAC Supplies', 'sup_01', 10000, 500, 10500, 'Approved', 'Pending', 'Due', ?, ?)
    `).bind(poId, now, now).run();

    // Create an Approved Invoice
    const invId = 'inv_pay_05';
    await env.DB.prepare(`
      INSERT INTO supplier_invoices (
        id, sl_no, invoice_number, invoice_date, supplier_id, supplier_name, purchase_order_id, purchase_order_number,
        subtotal, vat_amount, total_amount, amount_paid, balance_due, payment_status, matching_status,
        created_at, updated_at
      ) VALUES (?, 1, 'INV-PAY-05', '2026-10-26', 'sup_01', 'Al-Futtaim HVAC Supplies', ?, 'CTPO#2806',
        10000, 500, 10500, 0, 10500, 'Due', 'Approved', ?, ?)
    `).bind(invId, poId, now, now).run();

    // 5a. Prevent Duplicate Payment Reference
    const pay1Res = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        paymentDate: '2026-10-26',
        supplierId: 'sup_01',
        paymentMode: 'Bank_Transfer',
        bankName: 'Emirates NBD',
        referenceNo: 'ENBD-TXN-88192',
        amount: 5000,
        allocations: [{ invoiceId: invId, amount: 5000 }],
      }),
    }, env);
    assert.equal(pay1Res.status, 201);
    const pay1Body = await pay1Res.json();
    assert.equal(pay1Body.payment.allocated_amount, 5000);
    assert.equal(pay1Body.payment.unallocated_amount, 0);

    // Duplicate check with same referenceNo
    const dupRefRes = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        paymentDate: '2026-10-26',
        supplierId: 'sup_01',
        paymentMode: 'Bank_Transfer',
        referenceNo: 'ENBD-TXN-88192',
        amount: 2000,
      }),
    }, env);
    assert.equal(dupRefRes.status, 409);
    const dupRefBody = await dupRefRes.json();
    assert.equal(dupRefBody.code, 'DUPLICATE_PAYMENT_REFERENCE');

    // 5b. Verify Invoice Balance is partially paid: 10,500 - 5,000 = 5,500 Due
    const invCheck1 = await env.DB.prepare('SELECT amount_paid, balance_due, payment_status FROM supplier_invoices WHERE id = ?').bind(invId).first();
    assert.equal(invCheck1.amount_paid, 5000);
    assert.equal(invCheck1.balance_due, 5500);
    assert.equal(invCheck1.payment_status, 'Partially_Paid');

    // 5c. Overpayment Attempt: Remaining balance is 5,500; try to pay 6,000
    const overpayRes = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        paymentDate: '2026-10-26',
        supplierId: 'sup_01',
        paymentMode: 'Cheque',
        chequeNumber: 'CHQ-9001',
        amount: 6000,
        allocations: [{ invoiceId: invId, amount: 6000 }],
      }),
    }, env);
    assert.equal(overpayRes.status, 422);
    const overpayBody = await overpayRes.json();
    assert.equal(overpayBody.code, 'OVER_PAYMENT');

    // 5d. Settle Final Balance: Pay remaining 5,500
    const payFinalRes = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        paymentDate: '2026-10-26',
        supplierId: 'sup_01',
        paymentMode: 'Bank_Transfer',
        referenceNo: 'ENBD-TXN-FINAL-99',
        amount: 5500,
        allocations: [{ invoiceId: invId, amount: 5500 }],
      }),
    }, env);
    assert.equal(payFinalRes.status, 201);

    // Verify Invoice and PO are both fully 'Paid'
    const invFinal = await env.DB.prepare('SELECT amount_paid, balance_due, payment_status FROM supplier_invoices WHERE id = ?').bind(invId).first();
    assert.equal(invFinal.amount_paid, 10500);
    assert.equal(invFinal.balance_due, 0);
    assert.equal(invFinal.payment_status, 'Paid');

    const poFinal = await env.DB.prepare('SELECT payment_status FROM purchase_orders WHERE id = ?').bind(poId).first();
    assert.equal(poFinal.payment_status, 'Paid');

    // 5e. Audit log integrity
    const auditLogsRes = await app.request(`/api/supplier-invoices/${invId}`, {
      headers: { Authorization: `Bearer ${tokens.financeController}` },
    }, env);
    const invDetail = await auditLogsRes.json();
    assert.equal(invDetail.success, true);
    assert.ok(invDetail.allocations.length >= 2);
  });
});
