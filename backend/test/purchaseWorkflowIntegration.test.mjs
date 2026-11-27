/**
 * Phase 3 Purchase Workflow Integration Test Suite
 * (cool-tech-crm-api)
 *
 * Verifies end-to-end integration:
 * 1. MSRF creation, editing, submission, and request tracking.
 * 2. Reporting Head approval, rejection, and return-for-correction workflow.
 * 3. Procurement stock verification using CRM inventory.
 * 4. Supplier quotation entry and comparison, enforcing quotation thresholds:
 *    - < AED 10,000: >= 1 quotation
 *    - >= AED 10,000: >= 3 distinct competing quotations
 * 5. Purchase recommendation submission and PO generation.
 * 6. Purchase Order executive approval with FC/COO tier enforcement.
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
const TEST_KID = 'p3-workflow-test-key';

function createWorkflowDatabase() {
  const sqlite = new DatabaseSync(':memory:');

  // Base Users Table matching production D1
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

  // Run migrations 0002 to 0010 sequentially
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

describe('Phase 3 Purchase Workflow Integration Test Suite', () => {
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
    tokens.techStaff = await makeToken('uid_tech_staff', 'tech1@cooltech.ae');
    tokens.procurementBuyer = await makeToken('uid_buyer', 'buyer@cooltech.ae');
    tokens.financeController = await makeToken('uid_fc', 'fc@cooltech.ae');
    tokens.coo = await makeToken('uid_coo', 'coo@cooltech.ae');
  });

  beforeEach(() => {
    const dbObj = createWorkflowDatabase();
    env = { DB: dbObj.d1 };
    const raw = dbObj.rawDb;

    // Seed staff
    raw.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, designation, department, is_active)
      VALUES
        ('usr_superadmin', 'uid_superadmin', 'superadmin@cooltech.ae', 'Super Administrator', 'SUPER_ADMIN', 'Chief Operating Officer', 'Management', 1),
        ('usr_rep_head', 'uid_rep_head', 'manager.hvac@cooltech.ae', 'Fahad Al-Nuaimi', 'MANAGER', 'Operations Manager', 'Technical', 1),
        ('usr_tech_staff', 'uid_tech_staff', 'tech1@cooltech.ae', 'Ahmed Tech', 'EMPLOYEE', 'HVAC Technician', 'Technical', 1),
        ('usr_buyer', 'uid_buyer', 'buyer@cooltech.ae', 'Buyer Sourcing', 'EMPLOYEE', 'Procurement Specialist', 'Procurement', 1),
        ('usr_fc', 'uid_fc', 'fc@cooltech.ae', 'Finance Controller', 'MANAGER', 'Finance Controller', 'Finance', 1),
        ('usr_coo', 'uid_coo', 'coo@cooltech.ae', 'Rashid Al-Maktoum', 'MANAGER', 'Chief Operating Officer', 'Management', 1);
    `);

    // Seed suppliers
    raw.exec(`
      INSERT INTO suppliers (id, sl_no, supplier_name, trn, status, created_at, updated_at)
      VALUES
        ('sup_01', 1, 'Al-Futtaim HVAC Supplies', '100234567800003', 'Active', datetime('now'), datetime('now')),
        ('sup_02', 2, 'Lutfi Trading LLC', '100345678900003', 'Active', datetime('now'), datetime('now')),
        ('sup_03', 3, 'Super General Distributing', '100456789000003', 'Active', datetime('now'), datetime('now')),
        ('sup_04', 4, 'Emirates Spare Parts FZE', '100567890100003', 'Active', datetime('now'), datetime('now'));
    `);

    // Seed inventory
    raw.exec(`
      INSERT INTO crm_inventory (id, sl_no, code, name, purchase_rate, current_stock, minimum_stock, created_at, updated_at)
      VALUES
        ('inv_01', 1, 'MAT-COPPER-01', 'Copper Pipe 1/2 inch', 45.0, 10.0, 5.0, datetime('now'), datetime('now')),
        ('inv_02', 2, 'MAT-GAS-R410A', 'Refrigerant R410A Cylinder', 320.0, 0.0, 2.0, datetime('now'), datetime('now'));
    `);
  });

  it('1. Technical Employee creates MSRF with items; initial status is Pending and Awaiting_Intake', async () => {
    const res = await app.request('/api/msrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({
        purpose: 'Site repair parts for Al-Barsha Tower AHU unit',
        priority: 'High',
        requiredByDate: '2026-11-05',
        projectName: 'Al-Barsha Tower Overhaul',
        items: [
          {
            item_code: 'MAT-COPPER-01',
            description: 'Copper Pipe 1/2 inch',
            unit: 'Mtr',
            brand_preference: 'Mueller',
            requested_qty: 15,
            estimated_unit_rate: 50.0,
          },
          {
            item_code: 'MAT-GAS-R410A',
            description: 'Refrigerant R410A Cylinder',
            unit: 'Cyl',
            requested_qty: 2,
            estimated_unit_rate: 350.0,
          },
        ],
      }),
    }, env);

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.request.reporting_head_status, 'Pending');
    assert.equal(body.request.procurement_status, 'Awaiting_Intake');
    assert.ok(body.request.msrf_number.startsWith('MSRF-2026-'));
    assert.equal(body.request.estimated_total_value, 1450.0); // (15*50) + (2*350)
  });

  it('1.1 Regression: Frontend camelCase payload (itemCode, brandPreference, etc.) properly persists in MSRF and items', async () => {
    const res = await app.request('/api/msrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({
        purpose: 'Replacement material requisition',
        department: 'Technical',
        priority: 'High',
        requiredByDate: '2026-11-15',
        estimatedTotalValue: 252500,
        items: [
          {
            description: 'Copper Pipe 1/2 inch',
            itemCode: 'MAT-04',
            brandPreference: 'Mueller',
            unit: 'Pcs',
            requestedQty: 101,
            estimatedUnitRate: 2500,
            estimatedTotalAmount: 252500,
          },
        ],
      }),
    }, env);

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.request.purpose, 'Replacement material requisition');
    assert.equal(body.request.estimated_total_value, 252500);

    // Verify persisted item in DB via GET /api/msrf/:id
    const detailRes = await app.request(`/api/msrf/${body.request.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.techStaff}`,
      },
    }, env);
    assert.equal(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.equal(detailBody.success, true);
    assert.equal(detailBody.request.items.length, 1);
    assert.equal(detailBody.request.items[0].item_code, 'MAT-04');
    assert.equal(detailBody.request.items[0].brand_preference, 'Mueller');
    assert.equal(detailBody.request.items[0].requested_qty, 101);
    assert.equal(detailBody.request.items[0].estimated_unit_rate, 2500);
  });

  it('2. Reporting Head reviews MSRF: can Return for Info, requestor updates, and status resets to Pending', async () => {
    // 1. Create MSRF
    const createRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({
        purpose: 'Initial requisition needing clarification',
        requiredByDate: '2026-11-10',
        items: [{ description: 'Test Item', requested_qty: 1, estimated_unit_rate: 100 }],
      }),
    }, env);
    const { request: msrf } = await createRes.json();

    // 2. Reporting head returns for info
    const retRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.reportingHead}`,
      },
      body: JSON.stringify({
        decision: 'More_Info_Required',
        remarks: 'Please specify the exact site tag number and unit location.',
      }),
    }, env);

    assert.equal(retRes.status, 200);
    const retBody = await retRes.json();
    assert.equal(retBody.request.reporting_head_status, 'More_Info_Required');
    assert.equal(retBody.request.reporting_head_remarks, 'Please specify the exact site tag number and unit location.');

    // 3. Requestor updates purpose with tag details via PUT /api/msrf/:id
    const putRes = await app.request(`/api/msrf/${msrf.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({
        purpose: 'Site repair parts for Al-Barsha Tower AHU unit (Tag #AHU-04, Roof Level)',
        items: [{ description: 'Test Item Verified', requested_qty: 2, estimated_unit_rate: 120 }],
      }),
    }, env);

    assert.equal(putRes.status, 200);
    const putBody = await putRes.json();
    assert.equal(putBody.request.reporting_head_status, 'Pending'); // Resets to Pending for re-review!
    assert.equal(putBody.request.estimated_total_value, 240.0);

    // 4. Reporting head approves
    const appRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.reportingHead}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Approved for procurement intake.',
      }),
    }, env);

    assert.equal(appRes.status, 200);
    const appBody = await appRes.json();
    assert.equal(appBody.request.reporting_head_status, 'Approved');
    assert.equal(appBody.request.procurement_status, 'Awaiting_Intake');

    // 5. Authorized procurement buyer accepts for processing
    const intakeRes = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        notes: 'Accepted for intake processing',
      }),
    }, env);
    assert.equal(intakeRes.status, 200);
    const intakeBody = await intakeRes.json();
    assert.equal(intakeBody.request.procurement_status, 'Intake_Accepted');
  });

  it('3. Procurement stock verification checks CRM inventory and splits available stock vs procure qty', async () => {
    // Create MSRF with 15 copper pipes (10 in CRM stock) and 2 cylinders (0 in CRM stock)
    const createRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({
        purpose: 'Stock verification test',
        requiredByDate: '2026-11-10',
        items: [
          { item_code: 'MAT-COPPER-01', description: 'Copper Pipe', requested_qty: 15, estimated_unit_rate: 50 },
          { item_code: 'MAT-GAS-R410A', description: 'Gas Cylinder', requested_qty: 2, estimated_unit_rate: 350 },
        ],
      }),
    }, env);
    const { request: msrf } = await createRes.json();

    // Requisition is authorized and accepted into procurement intake
    await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.reportingHead}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Approved for procurement operations.',
      }),
    }, env);

    await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({ notes: 'Accepted into procurement processing queue' }),
    }, env);

    // Verify stock
    const verifyRes = await app.request(`/api/msrf/${msrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);

    assert.equal(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.stockVerificationStatus, 'Partial_Stock_Available');
    assert.equal(verifyBody.request.procurement_status, 'Stock_Verified');

    // Check item rows
    const detailRes = await app.request(`/api/msrf/${msrf.id}`, {
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    const { request: updatedMsrf } = await detailRes.json();

    const copperItem = updatedMsrf.items.find((i) => i.item_code === 'MAT-COPPER-01');
    assert.equal(copperItem.available_stock_qty, 10);
    assert.equal(copperItem.procure_qty, 5); // 15 requested - 10 available = 5 to procure!

    const gasItem = updatedMsrf.items.find((i) => i.item_code === 'MAT-GAS-R410A');
    assert.equal(gasItem.available_stock_qty, 0);
    assert.equal(gasItem.procure_qty, 2);
  });

  it('4. Quotation Threshold: purchases >= 10,000 mandate >= 3 distinct competing quotations', async () => {
    // 1. Create a large MSRF estimated at AED 15,000
    const createRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({
        purpose: 'Major compressor overhaul',
        requiredByDate: '2026-11-15',
        estimatedTotalValue: 15000,
        items: [{ description: 'Daikin Compressor 10HP', requested_qty: 1, estimated_unit_rate: 15000 }],
      }),
    }, env);
    const { request: msrf } = await createRes.json();

    // Add 1st quote from Supplier 1 (Al-Futtaim)
    const quote1Res = await app.request('/api/purchase-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        msrfId: msrf.id,
        supplierId: 'sup_01',
        supplierName: 'Al-Futtaim HVAC Supplies',
        quotationRef: 'AF-QT-991',
        subtotal: 14000,
        taxAmount: 700,
        shippingDeliveryCost: 300,
      }),
    }, env);
    const { quotation: quote1 } = await quote1Res.json();

    // Validate rules: only 1 distinct supplier => must fail
    const ruleRes1 = await app.request('/api/purchase-quotes/validate-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({ msrfId: msrf.id, estimatedAmount: 15000 }),
    }, env);

    assert.equal(ruleRes1.status, 422);
    const ruleBody1 = await ruleRes1.json();
    assert.equal(ruleBody1.compliant, false);
    assert.equal(ruleBody1.distinctSuppliers, 1);

    // Submitting recommendation with only 1 quote must be blocked
    const recRes1 = await app.request(`/api/msrf/${msrf.id}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        selectedQuotationId: quote1.id,
        recommendationReason: 'Premature selection without 3 quotes',
      }),
    }, env);
    assert.equal(recRes1.status, 422);

    // Add 2nd quote from Supplier 2 (Lutfi)
    await app.request('/api/purchase-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        msrfId: msrf.id,
        supplierId: 'sup_02',
        supplierName: 'Lutfi Trading LLC',
        quotationRef: 'LT-QT-802',
        subtotal: 13500,
        taxAmount: 675,
        shippingDeliveryCost: 250,
      }),
    }, env);

    // Add 3rd quote from Supplier 3 (Super General)
    const quote3Res = await app.request('/api/purchase-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        msrfId: msrf.id,
        supplierId: 'sup_03',
        supplierName: 'Super General Distributing',
        quotationRef: 'SG-QT-101',
        subtotal: 13200,
        taxAmount: 660,
        shippingDeliveryCost: 200,
        deliveryLeadTimeDays: 5,
        paymentTerms: 'Net 30 Days',
      }),
    }, env);
    const { quotation: bestQuote } = await quote3Res.json();

    // Validate rules now => 3 distinct suppliers => compliant!
    const ruleRes2 = await app.request('/api/purchase-quotes/validate-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({ msrfId: msrf.id, estimatedAmount: 15000 }),
    }, env);

    assert.equal(ruleRes2.status, 200);
    const ruleBody2 = await ruleRes2.json();
    assert.equal(ruleBody2.compliant, true);
    assert.equal(ruleBody2.distinctSuppliers, 3);

    // Submit Recommendation with best quote
    const recRes2 = await app.request(`/api/msrf/${msrf.id}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        selectedQuotationId: bestQuote.id,
        recommendationReason: 'Selected Super General: lowest landed cost (AED 14,060) and fastest delivery (5 days).',
      }),
    }, env);

    assert.equal(recRes2.status, 200);
    const recBody2 = await recRes2.json();
    assert.equal(recBody2.request.procurement_status, 'Recommendation_Prepared');

    // Generate PO from recommended MSRF
    const genPoRes = await app.request(`/api/msrf/${msrf.id}/generate-po`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        deliveryMode: 'Warehouse_Receipt',
      }),
    }, env);

    assert.equal(genPoRes.status, 201);
    const genPoBody = await genPoRes.json();
    assert.equal(genPoBody.success, true);
    assert.ok(genPoBody.po.po_number);
    assert.equal(genPoBody.po.approval, 'Waiting for Final Approval');
    assert.equal(genPoBody.po.supplier, 'Super General Distributing');
    assert.equal(genPoBody.po.msrf_id, msrf.id);
  });

  it('5. PO Approval Governance: AED 100,000 threshold, FC vs COO authorization & rejection of unauthorized users', async () => {
    // A: PO < 100k (e.g. AED 14,060)
    const createSmallPo = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-INT-SMALL',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 14060,
        vat: 703,
        items: [{ item: 'Copper Pipes', qty: 10, amount: 1406 }],
      }),
    }, env);
    const { order: smallPo } = await createSmallPo.json();
    assert.equal(smallPo.required_approval_tier, 'FINANCE_CONTROLLER');

    // Technician attempts approval -> 403 UNAUTHORIZED_APPROVAL_TIER
    const unauthApprove = await app.request(`/api/purchase-orders/${smallPo.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.techStaff}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);
    assert.equal(unauthApprove.status, 403);
    const unauthBody = await unauthApprove.json();
    assert.equal(unauthBody.code, 'UNAUTHORIZED_APPROVAL_TIER');

    // FC approves small PO -> 200 Approved
    const fcApproveSmall = await app.request(`/api/purchase-orders/${smallPo.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);
    assert.equal(fcApproveSmall.status, 200);
    const fcSmallBody = await fcApproveSmall.json();
    assert.equal(fcSmallBody.order.approval, 'Approved');
    assert.equal(fcSmallBody.approval.decision, 'Approved');

    // B: PO >= 100k (e.g. AED 120,000)
    const createLargePo = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-INT-LARGE',
        supplier: 'Super General Distributing',
        amount: 120000,
        vat: 6000,
        items: [{ item: 'Chiller Compressor Units', qty: 4, amount: 30000 }],
      }),
    }, env);
    const { order: largePo } = await createLargePo.json();
    assert.equal(largePo.required_approval_tier, 'CHIEF_OPERATING_OFFICER');

    // FC attempts approval on >= 100k PO -> 403 UNAUTHORIZED_APPROVAL_TIER
    const fcApproveLarge = await app.request(`/api/purchase-orders/${largePo.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);
    assert.equal(fcApproveLarge.status, 403);
    const fcLargeBody = await fcApproveLarge.json();
    assert.equal(fcLargeBody.code, 'UNAUTHORIZED_APPROVAL_TIER');
    assert.equal(fcLargeBody.requiredTier, 'CHIEF_OPERATING_OFFICER');

    // COO approves large PO -> 200 Approved
    const cooApproveLarge = await app.request(`/api/purchase-orders/${largePo.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.coo}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);
    assert.equal(cooApproveLarge.status, 200);
    const cooLargeBody = await cooApproveLarge.json();
    assert.equal(cooLargeBody.order.approval, 'Approved');
    assert.equal(cooLargeBody.approval.decision, 'Approved');
  });

  it('6. Goods Receipt Note (GRN): verifies Warehouse_Receipt increments inventory and Direct_Site_Delivery does NOT', async () => {
    // 1. Warehouse_Receipt PO
    const createPoWh = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-WH-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        deliveryMode: 'Warehouse_Receipt',
        amount: 500,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 10, amount: 50 }],
      }),
    }, env);
    const { order: poWh } = await createPoWh.json();
    const poWhItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(poWh.id).all()).results;

    // Approve PO
    await app.request(`/api/purchase-orders/${poWh.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    // Initial stock was 10
    const invBefore = env.DB.prepare('SELECT current_stock FROM crm_inventory WHERE code = ?').bind('MAT-COPPER-01');
    const { current_stock: stockBefore } = await invBefore.first();
    assert.equal(stockBefore, 10);

    // Record GRN for 10 pipes
    const grnWhRes = await app.request('/api/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        purchase_order_id: poWh.id,
        lpoNumber: poWh.po_number,
        deliveryMode: 'Warehouse_Receipt',
        supplier: poWh.supplier,
        items: [
          {
            code: 'MAT-COPPER-01',
            item: 'Copper Pipe 1/2 inch',
            qty: 10,
            purchaseRate: 50,
            purchase_order_item_id: poWhItems[0].id,
          },
        ],
      }),
    }, env);
    assert.equal(grnWhRes.status, 201);

    // Warehouse stock MUST have increased to 20
    const { current_stock: stockAfterWh } = await invBefore.first();
    assert.equal(stockAfterWh, 20);

    // Check PO delivery status updated to Delivered
    const poWhCheck = await app.request(`/api/purchase-orders/${poWh.id}`, {
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    const { order: poWhUpdated } = await poWhCheck.json();
    assert.equal(poWhUpdated.delivery_status, 'Delivered');

    // 2. Direct_Site_Delivery PO
    const createPoDirect = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-DIRECT-01',
        supplier: 'Lutfi Trading LLC',
        deliveryMode: 'Direct_Site_Delivery',
        amount: 640,
        items: [{ code: 'MAT-GAS-R410A', item: 'Refrigerant R410A Cylinder', qty: 2, amount: 320 }],
      }),
    }, env);
    const { order: poDirect } = await createPoDirect.json();
    const poDirectItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(poDirect.id).all()).results;

    await app.request(`/api/purchase-orders/${poDirect.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    // Stock for gas before was 0
    const invGas = env.DB.prepare('SELECT current_stock FROM crm_inventory WHERE code = ?').bind('MAT-GAS-R410A');
    const { current_stock: gasBefore } = await invGas.first();
    assert.equal(gasBefore, 0);

    // Record GRN for Direct Site Delivery
    const grnDirectRes = await app.request('/api/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        purchase_order_id: poDirect.id,
        lpoNumber: poDirect.po_number,
        deliveryMode: 'Direct_Site_Delivery',
        supplier: poDirect.supplier,
        items: [
          {
            code: 'MAT-GAS-R410A',
            item: 'Refrigerant R410A Cylinder',
            qty: 2,
            purchaseRate: 320,
            purchase_order_item_id: poDirectItems[0].id,
          },
        ],
      }),
    }, env);
    assert.equal(grnDirectRes.status, 201);

    // Direct Site Delivery MUST NOT increment warehouse stock (remains 0)
    const { current_stock: gasAfter } = await invGas.first();
    assert.equal(gasAfter, 0);
  });

  it('7. Supplier Invoicing & 3-Way Matching: flags Price and Quantity Discrepancies and blocks unapproved payment', async () => {
    // 1. Create & Approve PO for 10 pipes @ 50 AED
    const createPo = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-MATCH-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 500,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 10, amount: 50 }],
      }),
    }, env);
    const { order: po } = await createPo.json();
    const poItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(po.id).all()).results;

    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    // Record GRN for only 6 pipes
    await app.request('/api/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        purchase_order_id: po.id,
        lpoNumber: po.po_number,
        deliveryMode: 'Warehouse_Receipt',
        supplier: po.supplier,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 6, purchaseRate: 50, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);

    // Case A: Invoice billed for 10 pipes (Qty Discrepancy because GRN received is 6)
    const invQtyDiscRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-QTY-DISC-01',
        subtotal: 500,
        total_amount: 525,
        items: [
          {
            code: 'MAT-COPPER-01',
            description: 'Copper Pipe 1/2 inch',
            invoiced_qty: 10,
            unit_price: 50,
            purchase_order_item_id: poItems[0].id,
          },
        ],
      }),
    }, env);
    assert.equal(invQtyDiscRes.status, 201);
    const { invoice: invQtyDisc } = await invQtyDiscRes.json();
    assert.equal(invQtyDisc.matching_status, 'Quantity_Discrepancy');

    // Case B: Invoice billed @ 60 AED (Price Discrepancy because PO contracted is 50 AED)
    const invPriceDiscRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-PRICE-DISC-01',
        subtotal: 360,
        total_amount: 378,
        items: [
          {
            code: 'MAT-COPPER-01',
            description: 'Copper Pipe 1/2 inch',
            invoiced_qty: 6,
            unit_price: 60,
            purchase_order_item_id: poItems[0].id,
          },
        ],
      }),
    }, env);
    assert.equal(invPriceDiscRes.status, 201);
    const { invoice: invPriceDisc } = await invPriceDiscRes.json();
    assert.equal(invPriceDisc.matching_status, 'Price_Discrepancy');

    // Attempting to approve payment for discrepant invoice must fail
    const approveFail = await app.request(`/api/supplier-invoices/${invPriceDisc.id}/approve-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
    }, env);
    assert.equal(approveFail.status, 422);
    const approveFailBody = await approveFail.json();
    assert.equal(approveFailBody.code, 'UNRESOLVED_DISCREPANCY');
  });

  it('8. Discrepancy Resolution & Payment Approval: controlled resolution with mandatory notes allows payment sign-off', async () => {
    // 1. Create & Approve PO
    const createPo = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-RESOLVE-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 250,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 5, amount: 50 }],
      }),
    }, env);
    const { order: po } = await createPo.json();
    const poItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(po.id).all()).results;

    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    // Record GRN for 5
    await app.request('/api/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        purchase_order_id: po.id,
        lpoNumber: po.po_number,
        deliveryMode: 'Warehouse_Receipt',
        supplier: po.supplier,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 5, purchaseRate: 50, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);

    // Invoice with slight price variance (52 vs 50)
    const invRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-RES-01',
        subtotal: 260,
        total_amount: 273,
        items: [{ code: 'MAT-COPPER-01', description: 'Copper Pipe 1/2 inch', invoiced_qty: 5, unit_price: 52, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    const { invoice: inv } = await invRes.json();
    assert.equal(inv.matching_status, 'Price_Discrepancy');

    // Resolve without notes -> 400
    const failRes = await app.request(`/api/supplier-invoices/${inv.id}/resolve-discrepancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        resolutionAction: 'Accept_Difference',
        resolutionNotes: '   ',
      }),
    }, env);
    assert.equal(failRes.status, 400);

    // Resolve with authorized notes -> 200 Verified_Matching
    const successRes = await app.request(`/api/supplier-invoices/${inv.id}/resolve-discrepancy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        resolutionAction: 'Accept_Difference',
        resolutionNotes: 'AED 2/unit difference accepted due to urgent supplier surcharge.',
      }),
    }, env);
    assert.equal(successRes.status, 200);
    const { invoice: resolvedInv } = await successRes.json();
    assert.equal(resolvedInv.matching_status, 'Approved');
    assert.equal(resolvedInv.resolution_action, 'Accept_Difference');

    // Authorize payment approval
    const apprRes = await app.request(`/api/supplier-invoices/${inv.id}/approve-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
    }, env);
    assert.equal(apprRes.status, 200);
    const { invoice: approvedInv } = await apprRes.json();
    assert.equal(approvedInv.matching_status, 'Approved');
    assert.ok(approvedInv.payment_approved_at);
  });

  it('9. Manual Payment Recording & Settlement: partial disbursement, balance calculation, and full settlement', async () => {
    // 1. Create PO, GRN, & Matching Invoice for 1,000 AED
    const createPo = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-PMT-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 1000,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 20, amount: 50 }],
      }),
    }, env);
    const { order: po } = await createPo.json();
    const poItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(po.id).all()).results;

    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    await app.request('/api/stock-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        purchase_order_id: po.id,
        lpoNumber: po.po_number,
        deliveryMode: 'Warehouse_Receipt',
        supplier: po.supplier,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 20, purchaseRate: 50, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);

    const invRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-PMT-01',
        subtotal: 1000,
        total_amount: 1050,
        items: [{ code: 'MAT-COPPER-01', description: 'Copper Pipe 1/2 inch', invoiced_qty: 20, unit_price: 50, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    const { invoice: inv } = await invRes.json();
    assert.equal(inv.matching_status, 'Verified_Matching');

    // Approve for payment
    await app.request(`/api/supplier-invoices/${inv.id}/approve-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
    }, env);

    // Part A: Partial Payment of 600 AED
    const pmt1Res = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        supplierId: 'sup_01',
        supplierName: 'Al-Futtaim HVAC Supplies',
        paymentDate: '2026-11-20',
        paymentMode: 'Bank_Transfer',
        bankName: 'Emirates NBD',
        referenceNo: 'TXN-BANK-001',
        amount: 600,
        allocations: [{ invoiceId: inv.id, allocatedAmount: 600 }],
      }),
    }, env);
    assert.equal(pmt1Res.status, 201);

    // Check Invoice: 600 paid, 450 outstanding, Partially_Paid
    const invCheck1 = await app.request(`/api/supplier-invoices/${inv.id}`, {
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    const { invoice: invAfterPmt1 } = await invCheck1.json();
    assert.equal(invAfterPmt1.amount_paid, 600);
    assert.equal(invAfterPmt1.balance_due, 450);
    assert.equal(invAfterPmt1.payment_status, 'Partially_Paid');

    // Part B: Final Payment of 450 AED (Full Settlement)
    const pmt2Res = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        supplierId: 'sup_01',
        supplierName: 'Al-Futtaim HVAC Supplies',
        paymentDate: '2026-11-25',
        paymentMode: 'Bank_Transfer',
        bankName: 'Emirates NBD',
        referenceNo: 'TXN-BANK-002',
        amount: 450,
        allocations: [{ invoiceId: inv.id, allocatedAmount: 450 }],
      }),
    }, env);
    assert.equal(pmt2Res.status, 201);

    // Check Invoice: 1,050 paid, 0 outstanding, Paid
    const invCheck2 = await app.request(`/api/supplier-invoices/${inv.id}`, {
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    const { invoice: invAfterPmt2 } = await invCheck2.json();
    assert.equal(invAfterPmt2.amount_paid, 1050);
    assert.equal(invAfterPmt2.balance_due, 0);
    assert.equal(invAfterPmt2.payment_status, 'Paid');

    // Check PO status synchronized to Paid
    const poCheck = await app.request(`/api/purchase-orders/${po.id}`, {
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    const { order: poAfterSettlement } = await poCheck.json();
    assert.equal(poAfterSettlement.payment_status, 'Paid');
  });

  it('10. Duplicate Reference & Invoice Prevention: rejects identical invoice numbers and transaction references', async () => {
    // 0. Create and approve a PO for the supplier
    const createPo = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        poNumber: 'CTPO-DUP-TEST',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 200,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 2, amount: 100 }],
      }),
    }, env);
    const { order: po } = await createPo.json();
    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    const poItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(po.id).all()).results;

    // 1. Re-attempt creating duplicate invoice number for Al-Futtaim
    const dupInvRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-UNIQUE-TEST-01',
        subtotal: 100,
        total_amount: 105,
        items: [{ description: 'Test', invoiced_qty: 1, unit_price: 100, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    assert.equal(dupInvRes.status, 201);

    // Exact duplicate attempt
    const dupInvRes2 = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-UNIQUE-TEST-01',
        subtotal: 100,
        total_amount: 105,
        items: [{ description: 'Test', invoiced_qty: 1, unit_price: 100, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    assert.equal(dupInvRes2.status, 409);
    const dupInvBody = await dupInvRes2.json();
    assert.equal(dupInvBody.code, 'DUPLICATE_INVOICE');

    // 2. Re-attempt recording duplicate payment reference for Al-Futtaim
    const pmtRes1 = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        supplierId: 'sup_01',
        supplierName: 'Al-Futtaim HVAC Supplies',
        paymentDate: '2026-11-20',
        paymentMode: 'Bank_Transfer',
        referenceNo: 'TXN-DUP-TEST-01',
        amount: 100,
      }),
    }, env);
    assert.equal(pmtRes1.status, 201);

    // Duplicate reference attempt
    const pmtRes2 = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.financeController}`,
      },
      body: JSON.stringify({
        supplierId: 'sup_01',
        supplierName: 'Al-Futtaim HVAC Supplies',
        paymentDate: '2026-11-21',
        paymentMode: 'Bank_Transfer',
        referenceNo: 'TXN-DUP-TEST-01',
        amount: 200,
      }),
    }, env);
    assert.equal(pmtRes2.status, 409);
    const pmtDupBody = await pmtRes2.json();
    assert.equal(pmtDupBody.code, 'DUPLICATE_PAYMENT_REFERENCE');
  });

  it('11. Immutable Audit Trail: confirms audit logs are created across MSRF, PO, GRN, INVOICE, and PAYMENT', async () => {
    // 1. Create MSRF -> MSRF_CREATED audit event
    const msrfRes = await app.request('/api/msrf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.techStaff}` },
      body: JSON.stringify({
        purpose: 'Audit trail verification',
        requiredByDate: '2026-11-30',
        items: [{ description: 'Audit Item', requested_qty: 1, estimated_unit_rate: 100 }],
      }),
    }, env);
    assert.equal(msrfRes.status, 201);
    const { request: msrf } = await msrfRes.json();

    // 2. Create and Approve PO -> PO_CREATED and PO_APPROVED audit events
    const poRes = await app.request('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        poNumber: 'CTPO-AUDIT-01',
        supplier: 'Al-Futtaim HVAC Supplies',
        amount: 100,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 1, amount: 100 }],
      }),
    }, env);
    assert.equal(poRes.status, 201);
    const { order: po } = await poRes.json();
    await app.request(`/api/purchase-orders/${po.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    const poItems = (await env.DB.prepare('SELECT id FROM purchase_order_items WHERE purchase_order_id = ?').bind(po.id).all()).results;

    // 3. Stock In -> STOCK_IN_RECORDED audit event
    const stockInRes = await app.request('/api/stock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        purchase_order_id: po.id,
        lpoNumber: po.po_number,
        supplier: po.supplier,
        items: [{ code: 'MAT-COPPER-01', item: 'Copper Pipe 1/2 inch', qty: 1, purchaseRate: 100, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    assert.equal(stockInRes.status, 201);

    // 4. Supplier Invoice -> INVOICE_CREATED audit event
    const invRes = await app.request('/api/supplier-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({
        supplier_id: 'sup_01',
        supplier_name: 'Al-Futtaim HVAC Supplies',
        purchase_order_id: po.id,
        purchase_order_no: po.po_number,
        invoice_number: 'INV-AUDIT-01',
        subtotal: 100,
        total_amount: 105,
        items: [{ description: 'Copper Pipe', invoiced_qty: 1, unit_price: 100, purchase_order_item_id: poItems[0].id }],
      }),
    }, env);
    assert.equal(invRes.status, 201);
    const { invoice: inv } = await invRes.json();

    // 5. Payment -> PAYMENT_RECORDED audit event
    await app.request(`/api/supplier-invoices/${inv.id}/approve-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
    }, env);

    const pmtRes = await app.request('/api/supplier-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.financeController}` },
      body: JSON.stringify({
        supplierId: 'sup_01',
        supplierName: 'Al-Futtaim HVAC Supplies',
        paymentDate: '2026-11-20',
        paymentMode: 'Bank_Transfer',
        referenceNo: 'TXN-AUDIT-001',
        amount: 105,
        allocations: [{ invoiceId: inv.id, allocatedAmount: 105 }],
      }),
    }, env);
    assert.equal(pmtRes.status, 201);

    // Verify Audit Logs
    const raw = env.DB;
    const auditRows = await raw.prepare('SELECT entity_type, action, actor_name FROM procurement_audit_logs ORDER BY created_at ASC').all();
    assert.ok(auditRows.results.length >= 5);

    const entityTypes = auditRows.results.map((r) => r.entity_type);
    assert.ok(entityTypes.includes('MSRF'), 'Expected MSRF audit event');
    assert.ok(entityTypes.includes('PURCHASE_ORDER'), 'Expected PURCHASE_ORDER audit event');
    assert.ok(entityTypes.includes('STOCK_IN'), 'Expected STOCK_IN audit event');
    assert.ok(entityTypes.includes('SUPPLIER_INVOICE'), 'Expected SUPPLIER_INVOICE audit event');
    assert.ok(entityTypes.includes('SUPPLIER_PAYMENT'), 'Expected SUPPLIER_PAYMENT audit event');
  });
});

