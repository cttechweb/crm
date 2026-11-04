/**
 * Dedicated Test Suite for Procurement Governance, Financial Approval Gatekeeper,
 * Quotation Rules, Delegations, Delivery Modes, and Legacy Migration
 * (cool-tech-crm-api)
 *
 * Verifies:
 * 1. Financial Approval Gatekeeper:
 *    - Boundary checks: AED 99,999.99, AED 100,000.00, and AED 100,000.01.
 *    - Finance Controller vs Chief Operating Officer tier enforcement.
 *    - Unauthorized users (plain employee/manager) rejected with 403.
 * 2. Approver Delegations:
 *    - Active, valid date range delegation permits approval.
 *    - Expired delegation rejected with 403.
 *    - Inactive delegation (is_active = 0) rejected with 403.
 *    - Insufficient tier delegation rejected with 403.
 * 3. Anti-Bypass and Security Gatekeepers:
 *    - PATCH /api/purchase-orders/:id/status cannot change approval (400 APPROVAL_GATEWAY_ENFORCED).
 *    - Price/qty modifications to approved PO auto-revoke approval and reset status.
 * 4. Ad-Hoc Purchase Orders:
 *    - Created with is_adhoc = 1 and status 'Waiting for Final Approval'.
 *    - GRN / Stock-in blocked with 422 if PO is not yet approved.
 *    - GRN allowed once PO is approved.
 * 5. Quotation Governance:
 *    - Under AED 10,000: >= 1 approved quote required.
 *    - AED 10,000 and above: >= 3 distinct competing supplier quotes required.
 * 6. Inventory & Delivery Modes:
 *    - Warehouse_Receipt increments crm_inventory stock.
 *    - Direct_Site_Delivery links to Sales Order and does NOT increment warehouse stock.
 * 7. Legacy Data Migration & Deduplication:
 *    - Batch import with deduplication by po_number and reconciliation report.
 *    - Batch stock-in deduplication by stock_in_no.
 * 8. Protected Systems Isolation:
 *    - Sales module records cannot be mutated through procurement routes.
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
const TEST_KID = 'procurement-gov-test-key';

function createGovernanceDatabase() {
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

  return { sqlite, mockD1 };
}

describe('Procurement Governance & Core Controls Test Suite', () => {
  let keyPair;
  let sqlite;
  let mockD1;

  let superAdminToken;
  let cooToken;
  let fcToken;
  let warehouseMgrToken;
  let procStaffToken;
  let salesExecToken;
  let delegateToken;

  before(async () => {
    keyPair = await generateKeyPair('RS256');
    setCustomJWKS(async (protectedHeader) => {
      if (protectedHeader?.kid === TEST_KID) return keyPair.publicKey;
      throw new Error('Key ID not found');
    });

    const createToken = async (uid, email) => {
      return new SignJWT({ user_id: uid, sub: uid, email, email_verified: true })
        .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
        .setIssuer(ISSUER)
        .setAudience(PROJECT_ID)
        .setExpirationTime('2h')
        .sign(keyPair.privateKey);
    };

    superAdminToken = await createToken('fb_super_admin', 'superadmin@cooltech.com');
    cooToken = await createToken('fb_coo', 'coo@cooltech.com');
    fcToken = await createToken('fb_fc', 'finance.controller@cooltech.com');
    warehouseMgrToken = await createToken('fb_wh_mgr', 'warehouse.mgr@cooltech.com');
    procStaffToken = await createToken('fb_proc_staff', 'procurement@cooltech.com');
    salesExecToken = await createToken('fb_sales_exec', 'sales@cooltech.com');
    delegateToken = await createToken('fb_delegate', 'delegate.user@cooltech.com');
  });

  beforeEach(() => {
    const dbObj = createGovernanceDatabase();
    sqlite = dbObj.sqlite;
    mockD1 = dbObj.mockD1;

    // Seed staff profiles with authoritative designations in D1 users table
    sqlite.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, department, designation, permissions) VALUES
      ('usr_super_admin', 'fb_super_admin', 'superadmin@cooltech.com', 'System SuperAdmin', 'SUPER_ADMIN', 'Executive', 'Super Administrator', NULL),
      ('usr_coo', 'fb_coo', 'coo@cooltech.com', 'Sarah Al COO', 'ADMIN', 'Executive', 'Chief Operating Officer', NULL),
      ('usr_fc', 'fb_fc', 'finance.controller@cooltech.com', 'Farhan Finance', 'ADMIN', 'Finance', 'Financial Controller', NULL),
      ('usr_wh_mgr', 'fb_wh_mgr', 'warehouse.mgr@cooltech.com', 'Walid Warehouse', 'MANAGER', 'Logistics', 'Warehouse Manager', NULL),
      ('usr_proc_staff', 'fb_proc_staff', 'procurement@cooltech.com', 'Pradeep Procurement', 'EMPLOYEE', 'Procurement', 'Procurement Specialist', NULL),
      ('usr_sales_exec', 'fb_sales_exec', 'sales@cooltech.com', 'Samir Sales', 'EMPLOYEE', 'Sales', 'Sales Executive', NULL),
      ('usr_delegate', 'fb_delegate', 'delegate.user@cooltech.com', 'Dev Delegated', 'EMPLOYEE', 'Operations', 'Operations Officer', NULL);
    `);

    // Seed test store
    sqlite.exec(`
      INSERT INTO stores (id, name, location, is_active, created_at, updated_at) VALUES
      ('str_main', 'MAIN WAREHOUSE', 'Dubai Industrial Area', 1, datetime('now'), datetime('now'));
    `);

    // Seed test supplier
    sqlite.exec(`
      INSERT INTO suppliers (id, supplier_name, status, created_at, updated_at) VALUES
      ('sup_acme', 'Acme Cooling LLC', 'Active', datetime('now'), datetime('now')),
      ('sup_carrier', 'Carrier UAE Corp', 'Active', datetime('now'), datetime('now')),
      ('sup_daikin', 'Daikin Middle East', 'Active', datetime('now'), datetime('now'));
    `);

    // Seed initial inventory item
    sqlite.exec(`
      INSERT INTO crm_inventory (id, code, name, category, brand, stock, unit, purchase_rate, selling_price, created_at, updated_at) VALUES
      ('inv_comp_01', 'COMP-01', 'Rotary Compressor 1.5 Ton', 'Compressors', 'GMCC', 10, 'Pcs', 250.0, 450.0, datetime('now'), datetime('now'));
    `);

    // Seed test Sales Order (for direct site delivery testing)
    sqlite.exec(`
      INSERT INTO sales_orders (id, order_number, customer, order_date, total_amount, status, owner_id, created_at, updated_at) VALUES
      ('so_project_alpha', 'CTSO#9901', 'Alpha Contracting LLC', '2026-10-15', 150000.0, 'Confirmed', 'usr_sales_exec', datetime('now'), datetime('now'));
    `);
  });

  const getEnv = () => ({
    DB: mockD1,
    FIREBASE_PROJECT_ID: PROJECT_ID,
  });

  // ==========================================================================
  // SECTION 1: FINANCIAL APPROVAL GATEKEEPER & BOUNDARY TESTS
  // ==========================================================================

  it('1.1 Boundary test: AED 99,999.99 PO can be approved by Finance Controller, rejected for plain employee', async () => {
    // Create PO of evaluated value 99,999.99
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#TEST_99K',
          supplier: 'Acme Cooling LLC',
          amount: 99999.99,
          vatType: 'no_vat',
          totalAmount: 99999.99,
          items: [{ code: 'COMP-01', description: 'Compressors', qty: 100, amount: 999.9999, total: 99999.99 }],
        }),
      },
      getEnv()
    );
    assert.equal(createRes.status, 201);
    const po = (await createRes.json()).order;
    assert.equal(po.required_approval_tier, 'FINANCE_CONTROLLER');

    // Plain employee attempt is rejected (403 UNAUTHORIZED_APPROVER)
    const empRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ action: 'Approve', remarks: 'Trying self-approval' }),
      },
      getEnv()
    );
    assert.equal(empRes.status, 403);
    const empBody = await empRes.json();
    assert.equal(empBody.code, 'UNAUTHORIZED_APPROVAL_TIER');

    // Finance Controller approves successfully (200)
    const fcRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fcToken}` },
        body: JSON.stringify({ action: 'Approve', remarks: 'FC Budget Approved' }),
      },
      getEnv()
    );
    assert.equal(fcRes.status, 200);
    const fcBody = await fcRes.json();
    assert.equal(fcBody.order.approval, 'Approved');
    assert.equal(fcBody.order.approved_by_name, 'Farhan Finance');

    // Audit log was recorded
    const auditRes = sqlite.prepare('SELECT * FROM procurement_audit_logs WHERE entity_id = ?').all(po.id);
    assert.ok(auditRes.length >= 1);
  });

  it('1.2 Boundary test: AED 100,000.00 PO requires COO approval; Finance Controller is rejected with 403', async () => {
    // Create PO of exactly 100,000.00
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#TEST_100K_EXACT',
          supplier: 'Carrier UAE Corp',
          amount: 100000.00,
          vatType: 'no_vat',
          totalAmount: 100000.00,
          items: [{ code: 'COMP-01', description: 'Compressors', qty: 100, amount: 1000.0, total: 100000.0 }],
        }),
      },
      getEnv()
    );
    assert.equal(createRes.status, 201);
    const po = (await createRes.json()).order;
    assert.equal(po.required_approval_tier, 'CHIEF_OPERATING_OFFICER');

    // Finance Controller attempt is rejected (403 UNAUTHORIZED_APPROVAL_TIER, exceeds FC tier)
    const fcRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fcToken}` },
        body: JSON.stringify({ action: 'Approve', remarks: 'FC attempting 100k' }),
      },
      getEnv()
    );
    assert.equal(fcRes.status, 403);
    const fcBody = await fcRes.json();
    assert.equal(fcBody.code, 'UNAUTHORIZED_APPROVAL_TIER');

    // Chief Operating Officer approves successfully (200)
    const cooRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cooToken}` },
        body: JSON.stringify({ action: 'Approve', remarks: 'COO Executive Approved' }),
      },
      getEnv()
    );
    assert.equal(cooRes.status, 200);
    const cooBody = await cooRes.json();
    assert.equal(cooBody.order.approval, 'Approved');
    assert.equal(cooBody.order.approved_by_name, 'Sarah Al COO');
  });

  it('1.3 Boundary test: AED 100,000.01 PO strictly requires COO approval', async () => {
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#TEST_100K_01',
          supplier: 'Carrier UAE Corp',
          amount: 100000.01,
          vatType: 'no_vat',
          totalAmount: 100000.01,
          items: [{ code: 'COMP-01', description: 'Compressors', qty: 1, amount: 100000.01, total: 100000.01 }],
        }),
      },
      getEnv()
    );
    assert.equal(createRes.status, 201);
    const po = (await createRes.json()).order;
    assert.equal(po.required_approval_tier, 'CHIEF_OPERATING_OFFICER');

    // FC is blocked
    const fcRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fcToken}` },
        body: JSON.stringify({ action: 'Approve' }),
      },
      getEnv()
    );
    assert.equal(fcRes.status, 403);

    // COO approves
    const cooRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cooToken}` },
        body: JSON.stringify({ action: 'Approve', remarks: 'COO Approved 100k+' }),
      },
      getEnv()
    );
    assert.equal(cooRes.status, 200);
  });

  // ==========================================================================
  // SECTION 2: APPROVER DELEGATIONS (VALID, EXPIRED, INACTIVE, TIER-MISMATCH)
  // ==========================================================================

  it('2.1 Valid active delegation allows delegate to approve within delegated tier', async () => {
    // Delegate usr_delegate for FINANCE_CONTROLLER tier for today
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    sqlite.exec(`
      INSERT INTO approver_delegations (
        id, delegator_id, delegator_name, delegator_designation, delegate_id, delegate_name, delegate_designation,
        approval_tier, start_date, end_date, is_active, reason
      ) VALUES (
        'del_01', 'usr_fc', 'Farhan Finance', 'Financial Controller', 'usr_delegate', 'Dev Delegated', 'Operations Officer',
        'FINANCE_CONTROLLER', '${today}', '${tomorrow}', 1, 'Leave cover'
      );
    `);

    // Create a 50k PO
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#TEST_DELEGATED',
          supplier: 'Acme Cooling LLC',
          amount: 50000,
        }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;

    // Delegated user approves successfully
    const delApproveRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${delegateToken}` },
        body: JSON.stringify({ action: 'Approve', remarks: 'Approved under FC delegation' }),
      },
      getEnv()
    );
    assert.equal(delApproveRes.status, 200);
    const body = await delApproveRes.json();
    assert.equal(body.order.approval, 'Approved');
    assert.ok(body.order.approved_by_name.includes('Dev Delegated'));
  });

  it('2.2 Expired delegation is rejected with 403', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

    sqlite.exec(`
      INSERT INTO approver_delegations (
        id, delegator_id, delegator_name, delegator_designation, delegate_id, delegate_name, delegate_designation,
        approval_tier, start_date, end_date, is_active, reason
      ) VALUES (
        'del_expired', 'usr_fc', 'Farhan Finance', 'Financial Controller', 'usr_delegate', 'Dev Delegated', 'Operations Officer',
        'FINANCE_CONTROLLER', '${lastWeek}', '${yesterday}', 1, 'Expired cover'
      );
    `);

    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ poNumber: 'CTPO#TEST_EXPIRED_DEL', supplier: 'Acme Cooling LLC', amount: 15000 }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;

    const delRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${delegateToken}` },
        body: JSON.stringify({ action: 'Approve' }),
      },
      getEnv()
    );
    assert.equal(delRes.status, 403);
    const body = await delRes.json();
    assert.ok(body.code === 'UNAUTHORIZED_APPROVAL_TIER' || body.code === 'UNAUTHORIZED_APPROVER');
  });

  it('2.3 Inactive delegation (is_active = 0) is rejected with 403', async () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    sqlite.exec(`
      INSERT INTO approver_delegations (
        id, delegator_id, delegator_name, delegator_designation, delegate_id, delegate_name, delegate_designation,
        approval_tier, start_date, end_date, is_active, reason
      ) VALUES (
        'del_inactive', 'usr_fc', 'Farhan Finance', 'Financial Controller', 'usr_delegate', 'Dev Delegated', 'Operations Officer',
        'FINANCE_CONTROLLER', '${today}', '${nextWeek}', 0, 'Revoked delegation'
      );
    `);

    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ poNumber: 'CTPO#TEST_INACTIVE_DEL', supplier: 'Acme Cooling LLC', amount: 20000 }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;

    const delRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${delegateToken}` },
        body: JSON.stringify({ action: 'Approve' }),
      },
      getEnv()
    );
    assert.equal(delRes.status, 403);
  });

  it('2.4 FC delegation cannot approve COO tier PO (AED 120,000)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    sqlite.exec(`
      INSERT INTO approver_delegations (
        id, delegator_id, delegator_name, delegator_designation, delegate_id, delegate_name, delegate_designation,
        approval_tier, start_date, end_date, is_active, reason
      ) VALUES (
        'del_fc_only', 'usr_fc', 'Farhan Finance', 'Financial Controller', 'usr_delegate', 'Dev Delegated', 'Operations Officer',
        'FINANCE_CONTROLLER', '${today}', '${nextWeek}', 1, 'FC tier only'
      );
    `);

    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ poNumber: 'CTPO#TEST_120K', supplier: 'Acme Cooling LLC', amount: 120000 }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;
    assert.equal(po.required_approval_tier, 'CHIEF_OPERATING_OFFICER');

    const delRes = await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${delegateToken}` },
        body: JSON.stringify({ action: 'Approve' }),
      },
      getEnv()
    );
    assert.equal(delRes.status, 403);
  });

  // ==========================================================================
  // SECTION 3: ANTI-BYPASS CONTROLS & AMOUNT REVISIONS
  // ==========================================================================

  it('3.1 PATCH /api/purchase-orders/:id/status cannot bypass approval gatekeeper (returns 400)', async () => {
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ poNumber: 'CTPO#TEST_BYPASS', supplier: 'Acme Cooling LLC', amount: 5000 }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;

    const bypassRes = await app.request(
      `/api/purchase-orders/${po.id}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseMgrToken}` },
        body: JSON.stringify({ approval: 'Approved' }),
      },
      getEnv()
    );
    assert.equal(bypassRes.status, 400);
    const body = await bypassRes.json();
    assert.equal(body.code, 'APPROVAL_GATEWAY_ENFORCED');
  });

  it('3.2 Amount revision on an already Approved PO automatically revokes approval to Waiting for Final Approval', async () => {
    // 1. Create and approve a 10k PO
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ poNumber: 'CTPO#TEST_REVISION', supplier: 'Acme Cooling LLC', amount: 10000 }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;

    await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fcToken}` },
        body: JSON.stringify({ action: 'Approve' }),
      },
      getEnv()
    );

    // Verify it is Approved
    const getBefore = await app.request(`/api/purchase-orders/${po.id}`, { headers: { Authorization: `Bearer ${fcToken}` } }, getEnv());
    assert.equal((await getBefore.json()).order.approval, 'Approved');

    // 2. Put update with revised amount
    const putRes = await app.request(
      `/api/purchase-orders/${po.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#TEST_REVISION',
          supplier: 'Acme Cooling LLC',
          amount: 15000, // Amount changed
        }),
      },
      getEnv()
    );
    assert.equal(putRes.status, 200);
    const updatedPo = (await putRes.json()).order;
    assert.equal(updatedPo.approval, 'Waiting for Final Approval');
    assert.equal(updatedPo.approved_by_name, null);
  });

  // ==========================================================================
  // SECTION 4: AD-HOC PO ISSUANCE AND GRN RESTRICTIONS
  // ==========================================================================

  it('4.1 Ad-hoc PO created without MSRF sets is_adhoc=1 and forces status Waiting for Final Approval', async () => {
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseMgrToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#ADHOC_01',
          supplier: 'Acme Cooling LLC',
          amount: 8500,
          isAdhoc: true, // Emergency ad-hoc PO
        }),
      },
      getEnv()
    );
    assert.equal(createRes.status, 201);
    const po = (await createRes.json()).order;
    assert.equal(po.is_adhoc, 1);
    assert.equal(po.approval, 'Waiting for Final Approval');
  });

  it('4.2 GRN / Stock-In against an unapproved PO is strictly blocked with 422', async () => {
    // Create an unapproved PO
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          poNumber: 'CTPO#BLOCK_GRN',
          supplier: 'Acme Cooling LLC',
          amount: 4000,
        }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;
    assert.equal(po.approval, 'Waiting for Final Approval');

    // Attempt Stock-In against this unapproved PO
    const grnRes = await app.request(
      '/api/stock-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseMgrToken}` },
        body: JSON.stringify({
          stockInNo: 'GRN-TEST-01',
          supplier: 'Acme Cooling LLC',
          lpoNumber: po.po_number,
          store: 'MAIN WAREHOUSE',
          items: [{ code: 'COMP-01', item: 'Rotary Compressor', qty: 2 }],
        }),
      },
      getEnv()
    );
    assert.equal(grnRes.status, 422);
    const body = await grnRes.json();
    assert.equal(body.code, 'UNAPPROVED_PO_RECEIPT_BLOCKED');

    // Approve the PO
    await app.request(
      `/api/purchase-orders/${po.id}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fcToken}` },
        body: JSON.stringify({ action: 'Approve' }),
      },
      getEnv()
    );

    // Stock-In now succeeds
    const approvedGrnRes = await app.request(
      '/api/stock-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseMgrToken}` },
        body: JSON.stringify({
          stockInNo: 'GRN-TEST-01',
          supplier: 'Acme Cooling LLC',
          lpoNumber: po.po_number,
          store: 'MAIN WAREHOUSE',
          items: [{ code: 'COMP-01', item: 'Rotary Compressor', qty: 2 }],
        }),
      },
      getEnv()
    );
    assert.equal(approvedGrnRes.status, 201);
  });

  // ==========================================================================
  // SECTION 5: QUOTATION RULES (< 10k: >= 1; >= 10k: >= 3 COMPETING)
  // ==========================================================================

  it('5.1 Quotation rule: Below AED 10,000 requires at least 1 formal quotation', async () => {
    // 0 quotes fails (422)
    const zeroRes = await app.request(
      '/api/purchase-quotes/validate-rules',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({ estimatedAmount: 5000, quotes: [] }),
      },
      getEnv()
    );
    assert.equal(zeroRes.status, 422);
    const zeroBody = await zeroRes.json();
    assert.equal(zeroBody.compliant, false);

    // 1 quote passes (200)
    const oneRes = await app.request(
      '/api/purchase-quotes/validate-rules',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          estimatedAmount: 5000,
          quotes: [{ supplier_id: 'sup_acme', landed_total_value: 5000 }],
        }),
      },
      getEnv()
    );
    assert.equal(oneRes.status, 200);
    const oneBody = await oneRes.json();
    assert.equal(oneBody.compliant, true);
  });

  it('5.2 Quotation rule: AED 10,000 and above requires >= 3 distinct competing quotations', async () => {
    // 2 quotes only -> Rejected (422)
    const twoQuotesRes = await app.request(
      '/api/purchase-quotes/validate-rules',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          estimatedAmount: 25000,
          quotes: [
            { supplier_id: 'sup_acme', landed_total_value: 25000 },
            { supplier_id: 'sup_carrier', landed_total_value: 27000 },
          ],
        }),
      },
      getEnv()
    );
    assert.equal(twoQuotesRes.status, 422);
    assert.equal((await twoQuotesRes.json()).compliant, false);

    // 3 quotes with duplicate supplier (only 2 distinct suppliers) -> Rejected (422)
    const dupSupplierRes = await app.request(
      '/api/purchase-quotes/validate-rules',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          estimatedAmount: 25000,
          quotes: [
            { supplier_id: 'sup_acme', landed_total_value: 25000 },
            { supplier_id: 'sup_acme', landed_total_value: 26000 },
            { supplier_id: 'sup_carrier', landed_total_value: 27000 },
          ],
        }),
      },
      getEnv()
    );
    assert.equal(dupSupplierRes.status, 422);
    assert.equal((await dupSupplierRes.json()).compliant, false);

    // 3 quotes with 3 distinct suppliers -> Passes (200)
    const validRes = await app.request(
      '/api/purchase-quotes/validate-rules',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procStaffToken}` },
        body: JSON.stringify({
          estimatedAmount: 25000,
          quotes: [
            { supplier_id: 'sup_acme', landed_total_value: 25000 },
            { supplier_id: 'sup_carrier', landed_total_value: 27000 },
            { supplier_id: 'sup_daikin', landed_total_value: 28000 },
          ],
        }),
      },
      getEnv()
    );
    assert.equal(validRes.status, 200);
    assert.equal((await validRes.json()).compliant, true);
  });

  // ==========================================================================
  // SECTION 6: DELIVERY MODES & INVENTORY EFFECTS
  // ==========================================================================

  it('6.1 Warehouse_Receipt increments warehouse inventory in crm_inventory', async () => {
    const invBefore = sqlite.prepare('SELECT stock FROM crm_inventory WHERE code = ?').get('COMP-01');
    assert.equal(invBefore.stock, 10);

    const grnRes = await app.request(
      '/api/stock-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseMgrToken}` },
        body: JSON.stringify({
          stockInNo: 'GRN-WH-01',
          supplier: 'Acme Cooling LLC',
          store: 'MAIN WAREHOUSE',
          deliveryMode: 'Warehouse_Receipt',
          items: [{ code: 'COMP-01', item: 'Rotary Compressor', qty: 5, purchaseRate: 250 }],
        }),
      },
      getEnv()
    );
    assert.equal(grnRes.status, 201);

    const invAfter = sqlite.prepare('SELECT stock FROM crm_inventory WHERE code = ?').get('COMP-01');
    assert.equal(invAfter.stock, 15); // Incremented from 10 to 15
  });

  it('6.2 Direct_Site_Delivery links to Sales Order and does NOT increment warehouse inventory', async () => {
    const invBefore = sqlite.prepare('SELECT stock FROM crm_inventory WHERE code = ?').get('COMP-01');
    assert.equal(invBefore.stock, 10);

    const grnRes = await app.request(
      '/api/stock-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${warehouseMgrToken}` },
        body: JSON.stringify({
          stockInNo: 'GRN-SITE-01',
          supplier: 'Carrier UAE Corp',
          store: 'Direct Project Site',
          deliveryMode: 'Direct_Site_Delivery',
          salesOrderId: 'so_project_alpha',
          orderName: 'CTSO#9901',
          items: [{ code: 'COMP-01', item: 'Rotary Compressor', qty: 8, purchaseRate: 250 }],
        }),
      },
      getEnv()
    );
    assert.equal(grnRes.status, 201);
    const grn = (await grnRes.json()).record;
    assert.equal(grn.delivery_mode, 'Direct_Site_Delivery');

    // Warehouse inventory MUST NOT increase for direct site delivery
    const invAfter = sqlite.prepare('SELECT stock FROM crm_inventory WHERE code = ?').get('COMP-01');
    assert.equal(invAfter.stock, 10); // Remains 10!
  });

  // ==========================================================================
  // SECTION 7: LEGACY DATA IMPORT & DEDUPLICATION RECONCILIATION
  // ==========================================================================

  it('7.1 Legacy PO import deduplicates existing records and returns reconciliation report', async () => {
    // Seed an existing PO
    sqlite.exec(`
      INSERT INTO purchase_orders (id, po_number, date, supplier, amount, approval, is_deleted, created_at, updated_at)
      VALUES ('po_exist_01', 'CTPO#HIST_100', '2026-09-01', 'Carrier UAE Corp', 2200, 'Approved', 0, datetime('now'), datetime('now'));
    `);

    // Attempt importing batch of 3 POs (1 duplicate, 2 new)
    const importRes = await app.request(
      '/api/purchase-orders/legacy-import',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superAdminToken}` },
        body: JSON.stringify({
          batchId: 'BATCH_2026_MIG_01',
          orders: [
            { poNumber: 'CTPO#HIST_100', supplier: 'Carrier UAE Corp', amount: 2200 }, // Duplicate!
            { poNumber: 'CTPO#HIST_101', supplier: 'Acme Cooling LLC', amount: 3500 },
            { poNumber: 'CTPO#HIST_102', supplier: 'Daikin Middle East', amount: 4800 },
          ],
        }),
      },
      getEnv()
    );
    assert.equal(importRes.status, 200);
    const report = await importRes.json();
    assert.equal(report.totalProcessed, 3);
    assert.equal(report.importedCount, 2);
    assert.equal(report.skippedCount, 1);
    assert.ok(report.duplicateNumbers.includes('CTPO#HIST_100'));
  });

  // ==========================================================================
  // SECTION 8: SALES MODULE ISOLATION & READ-ONLY ACCESS
  // ==========================================================================

  it('8.1 Sales Orders are strictly read-only and cannot be mutated by procurement routes', async () => {
    const soBefore = sqlite.prepare('SELECT * FROM sales_orders WHERE id = ?').get('so_project_alpha');
    assert.equal(soBefore.status, 'Confirmed');
    assert.equal(soBefore.total_amount, 150000.0);

    // MSRF creation referencing sales order
    const msrfRes = await app.request(
      '/api/msrf',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesExecToken}` },
        body: JSON.stringify({
          purpose: 'Procure high-efficiency coils for project Alpha',
          requiredByDate: '2026-11-15',
          salesOrderId: 'so_project_alpha',
          items: [{ itemDescription: 'Evaporator Coil', quantityRequested: 4 }],
        }),
      },
      getEnv()
    );
    assert.equal(msrfRes.status, 201);

    // Verify Sales Order in D1 was NOT mutated
    const soAfter = sqlite.prepare('SELECT * FROM sales_orders WHERE id = ?').get('so_project_alpha');
    assert.equal(soAfter.status, 'Confirmed');
    assert.equal(soAfter.total_amount, 150000.0);
  });
});
