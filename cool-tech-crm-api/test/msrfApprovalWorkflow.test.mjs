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

const TEST_KID = 'msrf-approval-test-key-id';
const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

function createTestDatabase() {
  const db = new DatabaseSync(':memory:');

  // Base Users Table matching production D1
  db.exec(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'OFFICER')),
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

describe('MSRF Approval Workflow & Role Authorization Test Suite', () => {
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

    tokens.ceo = await makeToken('uid_ceo', 'ceo@cooltech.ae');
    tokens.coo = await makeToken('uid_coo', 'coo@cooltech.ae');
    tokens.managerHvac = await makeToken('uid_mgr_hvac', 'mgr.hvac@cooltech.ae');
    tokens.managerSales = await makeToken('uid_mgr_sales', 'mgr.sales@cooltech.ae');
    tokens.purchaseOfficer = await makeToken('uid_off_purchase', 'purchase.officer@cooltech.ae');
    tokens.procurementBuyer = await makeToken('uid_buyer', 'buyer@cooltech.ae');
    tokens.operationsOfficer = await makeToken('uid_off_ops', 'ops.officer@cooltech.ae');
    tokens.employeeTech = await makeToken('uid_emp_tech', 'tech1@cooltech.ae');
    tokens.employeeWithOfficerTitle = await makeToken('uid_emp_officer_title', 'support.officer@cooltech.ae');
    tokens.inactiveManager = await makeToken('uid_mgr_inactive', 'inactive.mgr@cooltech.ae');
  });

  beforeEach(() => {
    const dbObj = createTestDatabase();
    env = { DB: dbObj.d1 };
    rawDb = dbObj.rawDb;

    // Seed staff profiles matching Cool Tech CRM business positions
    rawDb.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, position, designation, department, is_active)
      VALUES
        ('usr_ceo', 'uid_ceo', 'ceo@cooltech.ae', 'Shemin CEO', 'SUPER_ADMIN', 'CEO', 'CEO', 'Executive', 1),
        ('usr_coo', 'uid_coo', 'coo@cooltech.ae', 'Muhammed COO', 'ADMIN', 'COO', 'COO', 'Management', 1),
        ('usr_mgr_hvac', 'uid_mgr_hvac', 'mgr.hvac@cooltech.ae', 'Fahad Al-Nuaimi', 'MANAGER', 'Operations Manager', 'Operations Manager', 'Technical', 1),
        ('usr_mgr_sales', 'uid_mgr_sales', 'mgr.sales@cooltech.ae', 'Rithul Sales Mgr', 'MANAGER', 'Sales Manager', 'Sales Manager', 'Sales', 1),
        ('usr_off_purchase', 'uid_off_purchase', 'purchase.officer@cooltech.ae', 'Mustafa Purchase Officer', 'MANAGER', 'Purchase Officer', 'Purchase Officer', 'Purchase', 1),
        ('usr_buyer', 'uid_buyer', 'buyer@cooltech.ae', 'Sourcing Buyer', 'EMPLOYEE', 'Procurement Specialist', 'Buyer', 'Procurement', 1),
        ('usr_off_ops', 'uid_off_ops', 'ops.officer@cooltech.ae', 'Dev Ops Officer', 'MANAGER', 'Operations Officer', 'Operations Officer', 'Technical', 1),
        ('usr_emp_tech', 'uid_emp_tech', 'tech1@cooltech.ae', 'Ahmed Technician', 'EMPLOYEE', 'HVAC Technician', 'HVAC Technician', 'Technical', 1),
        ('usr_emp_officer_title', 'uid_emp_officer_title', 'support.officer@cooltech.ae', 'Tariq Support', 'EMPLOYEE', 'Customer Care Officer', 'Customer Care Officer', 'Support', 1),
        ('usr_mgr_inactive', 'uid_mgr_inactive', 'inactive.mgr@cooltech.ae', 'Inactive Manager', 'MANAGER', 'Branch Manager', 'Branch Manager', 'Operations', 0);
    `);

    rawDb.exec(`
      INSERT OR REPLACE INTO crm_inventory (id, sl_no, code, name, purchase_rate, current_stock, minimum_stock, created_at, updated_at)
      VALUES
        ('inv_comp_01', 1, 'COMP-2TON', 'Rotary Compressor 2.0 Ton', 450.0, 10.0, 2.0, datetime('now'), datetime('now')),
        ('inv_valve_01', 2, 'VALVE-EXP-01', 'Electronic Expansion Valve', 250.0, 3.0, 1.0, datetime('now'), datetime('now')),
        ('inv_filter_01', 3, 'FILTER-DRIER', 'Filter Drier 3/8', 75.0, 0.0, 5.0, datetime('now'), datetime('now'));
    `);

    rawDb.exec(`
      INSERT OR REPLACE INTO suppliers (id, sl_no, supplier_name, trn, status, created_at, updated_at)
      VALUES
        ('sup_01', 1, 'Al-Futtaim HVAC Supplies', '100234567800003', 'Active', datetime('now'), datetime('now'));
    `);
  });

  // Helper: create an MSRF requisition
  async function createMsrf(requestorToken, payloadOverrides = {}) {
    const res = await app.request('/api/msrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestorToken}`,
      },
      body: JSON.stringify({
        purpose: 'Site repair parts for AHU units',
        department: 'Technical',
        priority: 'High',
        requiredByDate: '2026-11-15',
        items: [
          {
            description: 'Rotary Compressor 2.0 Ton',
            itemCode: 'COMP-2TON',
            requestedQty: 2,
            estimatedUnitRate: 450,
          },
        ],
        ...payloadOverrides,
      }),
    }, env);

    assert.equal(res.status, 201, 'MSRF creation should succeed');
    const { request } = await res.json();
    return request;
  }

  // --------------------------------------------------------------------------
  // TEST 1: CEO can approve and reject requests
  // --------------------------------------------------------------------------
  it('1. CEO can approve and reject material requests with comprehensive audit logging', async () => {
    // 1a. CEO Approves
    const msrf1 = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    const approveRes = await app.request(`/api/msrf/${msrf1.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.ceo}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Executive authorization granted by CEO',
      }),
    }, env);

    assert.equal(approveRes.status, 200);
    const approveBody = await approveRes.json();
    assert.equal(approveBody.request.reporting_head_status, 'Approved');
    assert.equal(approveBody.request.procurement_status, 'Awaiting_Intake');
    assert.equal(approveBody.request.reporting_head_remarks, 'Executive authorization granted by CEO');

    // Verify audit log
    const auditRow = rawDb.prepare(
      "SELECT * FROM procurement_audit_logs WHERE entity_id = ? AND action = 'MSRF_REPORTING_HEAD_APPROVED'"
    ).get(msrf1.id);
    assert.ok(auditRow);
    assert.equal(auditRow.actor_id, 'usr_ceo');
    const meta = JSON.parse(auditRow.metadata);
    assert.equal(meta.approver_position, 'CEO');
    assert.equal(meta.decision, 'Approved');

    // 1b. CEO Rejects with reason
    const msrf2 = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    const rejectRes = await app.request(`/api/msrf/${msrf2.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.ceo}`,
      },
      body: JSON.stringify({
        decision: 'Rejected',
        remarks: 'Budget exceeded for Q4 maintenance pool.',
      }),
    }, env);

    assert.equal(rejectRes.status, 200);
    const rejectBody = await rejectRes.json();
    assert.equal(rejectBody.request.reporting_head_status, 'Rejected');
    assert.equal(rejectBody.request.procurement_status, 'Cancelled');
    assert.equal(rejectBody.request.reporting_head_remarks, 'Budget exceeded for Q4 maintenance pool.');
  });

  // --------------------------------------------------------------------------
  // TEST 2: COO can approve and reject requests
  // --------------------------------------------------------------------------
  it('2. COO can approve and reject material requests when authorized', async () => {
    // 2a. COO Approves
    const msrf1 = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    const approveRes = await app.request(`/api/msrf/${msrf1.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.coo}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'COO operational sign-off complete',
      }),
    }, env);

    assert.equal(approveRes.status, 200);
    const approveBody = await approveRes.json();
    assert.equal(approveBody.request.reporting_head_status, 'Approved');
    assert.equal(approveBody.request.procurement_status, 'Awaiting_Intake');

    // 2b. COO Rejects
    const msrf2 = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    const rejectRes = await app.request(`/api/msrf/${msrf2.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.coo}`,
      },
      body: JSON.stringify({
        decision: 'Rejected',
        remarks: 'Alternative refurbished parts available in central depot.',
      }),
    }, env);

    assert.equal(rejectRes.status, 200);
    const rejectBody = await rejectRes.json();
    assert.equal(rejectBody.request.reporting_head_status, 'Rejected');
    assert.equal(rejectBody.request.procurement_status, 'Cancelled');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Authorized Manager can approve and reject requests
  // --------------------------------------------------------------------------
  it('3. An authorized Manager can approve and reject material requests routed to them', async () => {
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });

    // Designated reporting head approves
    const approveRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Verified site requirements and approved for intake',
      }),
    }, env);

    assert.equal(approveRes.status, 200);
    const approveBody = await approveRes.json();
    assert.equal(approveBody.request.reporting_head_status, 'Approved');
    assert.equal(approveBody.request.procurement_status, 'Awaiting_Intake');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Authorized Officer can approve and reject requests
  // --------------------------------------------------------------------------
  it('4. An authorized Officer (Purchase Officer / Operations Officer) can approve requests', async () => {
    // 4a. Purchase Officer (role: MANAGER, position: 'Purchase Officer')
    const msrf1 = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_off_purchase' });
    const offApproveRes = await app.request(`/api/msrf/${msrf1.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.purchaseOfficer}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Purchase Officer approved specification',
      }),
    }, env);

    assert.equal(offApproveRes.status, 200);
    const offBody = await offApproveRes.json();
    assert.equal(offBody.request.reporting_head_status, 'Approved');

    // 4b. Operations Officer (role: OFFICER)
    const msrf2 = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_off_ops' });
    const opsApproveRes = await app.request(`/api/msrf/${msrf2.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.operationsOfficer}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Operations Officer verification complete',
      }),
    }, env);

    assert.equal(opsApproveRes.status, 200);
    const opsBody = await opsApproveRes.json();
    assert.equal(opsBody.request.reporting_head_status, 'Approved');
  });

  // --------------------------------------------------------------------------
  // TEST 5: Employee cannot approve or reject (Strict 403 enforcement)
  // --------------------------------------------------------------------------
  it('5. An Employee cannot approve or reject a request, even by calling the API directly', async () => {
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });

    // 5a. Regular Employee attempts approval
    const empApproveRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.employeeTech}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Unauthorized employee approval attempt',
      }),
    }, env);

    assert.equal(empApproveRes.status, 403);
    const empApproveBody = await empApproveRes.json();
    assert.equal(empApproveBody.code, 'FORBIDDEN_NOT_APPROVER');
    assert.equal(empApproveBody.message, 'You are not authorized to approve or reject material requests.');

    // 5b. Regular Employee attempts rejection
    const empRejectRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.employeeTech}`,
      },
      body: JSON.stringify({
        decision: 'Rejected',
        remarks: 'Unauthorized employee rejection attempt',
      }),
    }, env);

    assert.equal(empRejectRes.status, 403);
    const empRejectBody = await empRejectRes.json();
    assert.equal(empRejectBody.message, 'You are not authorized to approve or reject material requests.');

    // 5c. Employee whose position contains 'Officer' but role is generic EMPLOYEE is also strictly blocked
    const empOfficerTitleRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.employeeWithOfficerTitle}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Customer care officer trying to approve',
      }),
    }, env);

    assert.equal(empOfficerTitleRes.status, 403);
    const empOfficerTitleBody = await empOfficerTitleRes.json();
    assert.equal(empOfficerTitleBody.code, 'FORBIDDEN_NOT_APPROVER');
    assert.equal(empOfficerTitleBody.message, 'You are not authorized to approve or reject material requests.');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Unauthenticated users cannot approve or reject
  // --------------------------------------------------------------------------
  it('6. Unauthenticated users cannot approve or reject requests (401 Unauthorized)', async () => {
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });

    const noAuthRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    assert.equal(noAuthRes.status, 401);
    const noAuthBody = await noAuthRes.json();
    assert.equal(noAuthBody.code, 'UNAUTHORIZED');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Inactive users cannot approve or reject
  // --------------------------------------------------------------------------
  it('7. Inactive users cannot approve or reject requests (403 ACCOUNT_INACTIVE)', async () => {
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_inactive' });

    const inactiveRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.inactiveManager}`,
      },
      body: JSON.stringify({ decision: 'Approved' }),
    }, env);

    assert.equal(inactiveRes.status, 403);
    const inactiveBody = await inactiveRes.json();
    assert.equal(inactiveBody.code, 'ACCOUNT_INACTIVE');
  });

  // --------------------------------------------------------------------------
  // TEST 8: Users cannot bypass request-specific approval-routing rules
  // --------------------------------------------------------------------------
  it('8. Users cannot bypass request-specific approval-routing rules or self-approve', async () => {
    // 8a. Manager B cannot approve MSRF routed to Manager A
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    const wrongManagerRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerSales}`, // Sales Manager attempting to approve HVAC MSRF
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Sales manager trying to approve HVAC request',
      }),
    }, env);

    assert.equal(wrongManagerRes.status, 403);
    const wrongBody = await wrongManagerRes.json();
    assert.equal(wrongBody.code, 'FORBIDDEN_ROUTING_MISMATCH');
    assert.equal(wrongBody.message, 'You are not the designated reporting head for this material request.');

    // 8b. Self-approval protection: Manager cannot approve their own requisition
    const selfMsrf = await createMsrf(tokens.managerHvac, { reportingHeadId: 'usr_mgr_hvac' });
    const selfApproveRes = await app.request(`/api/msrf/${selfMsrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Self approval attempt',
      }),
    }, env);

    assert.equal(selfApproveRes.status, 403);
    const selfBody = await selfApproveRes.json();
    assert.equal(selfBody.code, 'FORBIDDEN_SELF_APPROVAL');
  });

  // --------------------------------------------------------------------------
  // TEST 9: Mandatory rejection reason & valid status transitions
  // --------------------------------------------------------------------------
  it('9. Rejection requires a mandatory reason and valid workflow status transitions are enforced', async () => {
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });

    // 9a. Rejection without remarks returns 400
    const noReasonRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Rejected',
        remarks: '',
      }),
    }, env);

    assert.equal(noReasonRes.status, 400);
    const noReasonBody = await noReasonRes.json();
    assert.equal(noReasonBody.code, 'REJECTION_REASON_REQUIRED');

    // 9b. Valid approval
    const validApprove = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Approved for procurement intake',
      }),
    }, env);
    assert.equal(validApprove.status, 200);

    // 9c. Re-approving an already approved request is blocked with 400
    const reApprove = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Duplicate approval attempt',
      }),
    }, env);
    assert.equal(reApprove.status, 400);
    const reApproveBody = await reApprove.json();
    assert.equal(reApproveBody.code, 'INVALID_STATUS_TRANSITION');
  });

  // --------------------------------------------------------------------------
  // TEST 10: Employees can view their own requests and track status
  // --------------------------------------------------------------------------
  it('10. Employees can create requests, view their own requests, and view rejection reasons', async () => {
    // Employee creates request
    const msrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });

    // Manager rejects with remarks
    await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Rejected',
        remarks: 'Item is not eligible under warranty coverage.',
      }),
    }, env);

    // Employee fetches their requests list
    const listRes = await app.request('/api/msrf', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.employeeTech}` },
    }, env);

    assert.equal(listRes.status, 200);
    const { requests } = await listRes.json();
    assert.ok(requests.length > 0);
    const found = requests.find((r) => r.id === msrf.id);
    assert.ok(found);
    assert.equal(found.reporting_head_status, 'Rejected');
    assert.equal(found.reporting_head_remarks, 'Item is not eligible under warranty coverage.');

    // Employee fetches individual detail
    const detailRes = await app.request(`/api/msrf/${msrf.id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens.employeeTech}` },
    }, env);
    assert.equal(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.equal(detailBody.request.reporting_head_status, 'Rejected');
    assert.equal(detailBody.request.reporting_head_remarks, 'Item is not eligible under warranty coverage.');
  });

  // --------------------------------------------------------------------------
  // TEST 11: Procurement Intake Workflow
  // --------------------------------------------------------------------------
  it('11. Procurement Intake: verifies approval prerequisite, authorized buyer, duplicate rejection, and audit trails', async () => {
    // 11a. Create MSRF with items and project details
    const msrf = await createMsrf(tokens.employeeTech, {
      purpose: 'Central Chiller Overhaul Parts',
      department: 'Technical',
      projectName: 'Marina Heights Tower',
      reportingHeadId: 'usr_mgr_hvac',
      items: [
        {
          itemCode: 'VALVE-EXP-01',
          description: 'Electronic Expansion Valve',
          requestedQty: 4,
          estimatedUnitRate: 250,
        },
      ],
    });

    // 11b. Pending request cannot enter procurement intake (422 MSRF_NOT_APPROVED)
    const prematureIntake = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({ notes: 'Premature intake attempt' }),
    }, env);
    assert.equal(prematureIntake.status, 422);
    const prematureBody = await prematureIntake.json();
    assert.equal(prematureBody.code, 'MSRF_NOT_APPROVED');

    // 11c. Manager approves request -> transitions to Awaiting_Intake
    const approveRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Approved',
        remarks: 'Approved for procurement intake by Operations Manager',
      }),
    }, env);
    assert.equal(approveRes.status, 200);
    const approveBody = await approveRes.json();
    assert.equal(approveBody.request.reporting_head_status, 'Approved');
    assert.equal(approveBody.request.procurement_status, 'Awaiting_Intake');

    // 11d. Unauthorized users cannot accept request into procurement (HTTP 403)
    // Non-procurement employee (HVAC Technician)
    const techIntake = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.employeeTech}`,
      },
    }, env);
    assert.equal(techIntake.status, 403);
    const techBody = await techIntake.json();
    assert.equal(techBody.code, 'FORBIDDEN_NOT_PROCUREMENT');

    // Non-procurement manager (Sales Manager)
    const salesMgrIntake = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerSales}`,
      },
    }, env);
    assert.equal(salesMgrIntake.status, 403);
    const salesMgrBody = await salesMgrIntake.json();
    assert.equal(salesMgrBody.code, 'FORBIDDEN_NOT_PROCUREMENT');

    // 11e. Authorized procurement staff can review details, requested items, quantities, estimated rates, department, project, and approval history
    const detailRes = await app.request(`/api/msrf/${msrf.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
    }, env);
    assert.equal(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.equal(detailBody.request.id, msrf.id);
    assert.equal(detailBody.request.department, 'Technical');
    assert.equal(detailBody.request.project_name, 'Marina Heights Tower');
    assert.equal(detailBody.request.reporting_head_status, 'Approved');
    assert.equal(detailBody.request.items.length, 1);
    assert.equal(detailBody.request.items[0].requested_qty, 4);
    assert.equal(detailBody.request.items[0].estimated_unit_rate, 250);
    assert.ok(Array.isArray(detailBody.request.auditLogs));
    assert.ok(detailBody.request.auditLogs.some((l) => l.action === 'MSRF_REPORTING_HEAD_APPROVED'));

    // 11f. Authorized procurement buyer accepts request into procurement intake
    const intakeRes = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        notes: 'Assigned to Sourcing Buyer; vendor RFQ initiated.',
      }),
    }, env);
    assert.equal(intakeRes.status, 200);
    const intakeBody = await intakeRes.json();
    assert.equal(intakeBody.request.procurement_status, 'Intake_Accepted');
    assert.equal(intakeBody.request.assigned_buyer_id, 'usr_buyer');
    assert.equal(intakeBody.request.assigned_buyer_name, 'Sourcing Buyer');

    // 11g. Verify audit log entry created for intake
    const intakeAudit = rawDb.prepare(
      "SELECT * FROM procurement_audit_logs WHERE entity_id = ? AND action = 'MSRF_INTAKE_ACCEPTED'"
    ).get(msrf.id);
    assert.ok(intakeAudit, 'MSRF_INTAKE_ACCEPTED audit log must exist');
    assert.equal(intakeAudit.actor_id, 'usr_buyer');
    const intakeMeta = JSON.parse(intakeAudit.metadata);
    assert.equal(intakeMeta.assigned_buyer_id, 'usr_buyer');
    assert.equal(intakeMeta.intake_notes, 'Assigned to Sourcing Buyer; vendor RFQ initiated.');

    // 11h. Duplicate intake attempts are rejected safely (HTTP 409)
    const duplicateIntake = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({ notes: 'Duplicate intake call' }),
    }, env);
    assert.equal(duplicateIntake.status, 409);
    const duplicateBody = await duplicateIntake.json();
    assert.equal(duplicateBody.code, 'ALREADY_INTAKE_ACCEPTED');

    // 11i. Rejected MSRFs cannot enter procurement intake (422 MSRF_CANCELLED)
    const msrfRejected = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    await app.request(`/api/msrf/${msrfRejected.id}/manager-approval`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.managerHvac}`,
      },
      body: JSON.stringify({
        decision: 'Rejected',
        remarks: 'Duplicate order detected.',
      }),
    }, env);

    const rejectedIntake = await app.request(`/api/msrf/${msrfRejected.id}/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
    }, env);
    assert.equal(rejectedIntake.status, 422);
    const rejectedBody = await rejectedIntake.json();
    assert.equal(rejectedBody.code, 'MSRF_NOT_APPROVED');
  });

  // --------------------------------------------------------------------------
  // TEST 12: Stock Availability Verification, Reservation & Issue Lifecycle
  // --------------------------------------------------------------------------
  it('12. Stock Verification: full availability, partial shortage, complete shortage, reservation, duplicate prevention, and authorization', async () => {
    // Seed test warehouse inventory
    rawDb.exec(`
      INSERT OR REPLACE INTO crm_inventory (id, sl_no, code, name, purchase_rate, current_stock, minimum_stock, created_at, updated_at)
      VALUES
        ('inv_comp_01', 1, 'COMP-2TON', 'Rotary Compressor 2.0 Ton', 450.0, 10.0, 2.0, datetime('now'), datetime('now')),
        ('inv_valve_01', 2, 'VALVE-EXP-01', 'Electronic Expansion Valve', 250.0, 3.0, 1.0, datetime('now'), datetime('now')),
        ('inv_filter_01', 3, 'FILTER-DRIER', 'Filter Drier 3/8', 75.0, 0.0, 5.0, datetime('now'), datetime('now'));
    `);

    // 12a. Workflow Pre-requisites: Unapproved & Pre-intake requests cannot undergo stock verification
    const unapprovedMsrf = await createMsrf(tokens.employeeTech, { reportingHeadId: 'usr_mgr_hvac' });
    const prematureVerify = await app.request(`/api/msrf/${unapprovedMsrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(prematureVerify.status, 422);
    const prematureVerifyBody = await prematureVerify.json();
    assert.equal(prematureVerifyBody.code, 'MSRF_NOT_APPROVED');

    // Manager approves -> now in Awaiting_Intake
    await app.request(`/api/msrf/${unapprovedMsrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved' }),
    }, env);

    const preIntakeVerify = await app.request(`/api/msrf/${unapprovedMsrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(preIntakeVerify.status, 422);
    const preIntakeVerifyBody = await preIntakeVerify.json();
    assert.equal(preIntakeVerifyBody.code, 'MSRF_NOT_INTAKE_ACCEPTED');

    // 12b. Unauthorized users cannot perform stock verification (HTTP 403)
    // Non-procurement employee
    const unauthEmpVerify = await app.request(`/api/msrf/${unapprovedMsrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.employeeTech}` },
    }, env);
    assert.equal(unauthEmpVerify.status, 403);
    const unauthEmpBody = await unauthEmpVerify.json();
    assert.equal(unauthEmpBody.code, 'FORBIDDEN_NOT_PROCUREMENT');

    // Non-procurement manager
    const unauthMgrVerify = await app.request(`/api/msrf/${unapprovedMsrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.managerSales}` },
    }, env);
    assert.equal(unauthMgrVerify.status, 403);

    // Inactive user
    const inactiveVerify = await app.request(`/api/msrf/${unapprovedMsrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.inactiveManager}` },
    }, env);
    assert.equal(inactiveVerify.status, 403);

    // Unauthenticated
    const noAuthVerify = await app.request(`/api/msrf/${unapprovedMsrf.id}/stock-verify`, {
      method: 'POST',
    }, env);
    assert.equal(noAuthVerify.status, 401);

    // 12c. Fully Available Stock: requested quantity <= warehouse stock
    const msrfFull = await createMsrf(tokens.employeeTech, {
      reportingHeadId: 'usr_mgr_hvac',
      items: [
        {
          itemCode: 'COMP-2TON',
          description: 'Rotary Compressor 2.0 Ton',
          requestedQty: 2,
          estimatedUnitRate: 450,
        },
      ],
    });
    // Approve & Accept Intake
    await app.request(`/api/msrf/${msrfFull.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved' }),
    }, env);
    await app.request(`/api/msrf/${msrfFull.id}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ notes: 'Accepted into intake' }),
    }, env);

    // Run stock verification
    const verifyFullRes = await app.request(`/api/msrf/${msrfFull.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(verifyFullRes.status, 200);
    const verifyFullBody = await verifyFullRes.json();
    assert.equal(verifyFullBody.stockVerificationStatus, 'Full_Stock_Available');
    assert.equal(verifyFullBody.request.procurement_status, 'Stock_Verified');
    assert.equal(verifyFullBody.items[0].availableStockQty, 10);
    assert.equal(verifyFullBody.items[0].allocatableQty, 2);
    assert.equal(verifyFullBody.items[0].procureQty, 0); // Shortage is 0!

    // Verify audit log for stock verification
    const fullAudit = rawDb.prepare(
      "SELECT * FROM procurement_audit_logs WHERE entity_id = ? AND action = 'MSRF_STOCK_VERIFIED'"
    ).get(msrfFull.id);
    assert.ok(fullAudit, 'MSRF_STOCK_VERIFIED audit log must exist');
    assert.equal(fullAudit.new_state, 'Full_Stock_Available');

    // 12d. Partial Stock Availability: available stock > 0 but < requested quantity
    const msrfPartial = await createMsrf(tokens.employeeTech, {
      reportingHeadId: 'usr_mgr_hvac',
      items: [
        {
          itemCode: 'VALVE-EXP-01',
          description: 'Electronic Expansion Valve',
          requestedQty: 5, // 5 requested, only 3 in stock
          estimatedUnitRate: 250,
        },
      ],
    });
    await app.request(`/api/msrf/${msrfPartial.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved' }),
    }, env);
    await app.request(`/api/msrf/${msrfPartial.id}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ notes: 'Accepted into intake' }),
    }, env);

    const verifyPartialRes = await app.request(`/api/msrf/${msrfPartial.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(verifyPartialRes.status, 200);
    const verifyPartialBody = await verifyPartialRes.json();
    assert.equal(verifyPartialBody.stockVerificationStatus, 'Partial_Stock_Available');
    assert.equal(verifyPartialBody.items[0].availableStockQty, 3);
    assert.equal(verifyPartialBody.items[0].allocatableQty, 3);
    assert.equal(verifyPartialBody.items[0].procureQty, 2); // Exact shortage of 2 units!

    // 12e. Complete Stock Shortage: available stock is 0
    const msrfShortage = await createMsrf(tokens.employeeTech, {
      reportingHeadId: 'usr_mgr_hvac',
      items: [
        {
          itemCode: 'FILTER-DRIER',
          description: 'Filter Drier 3/8',
          requestedQty: 4, // 4 requested, 0 in stock
          estimatedUnitRate: 75,
        },
      ],
    });
    await app.request(`/api/msrf/${msrfShortage.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved' }),
    }, env);
    await app.request(`/api/msrf/${msrfShortage.id}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ notes: 'Accepted into intake' }),
    }, env);

    const verifyShortageRes = await app.request(`/api/msrf/${msrfShortage.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(verifyShortageRes.status, 200);
    const verifyShortageBody = await verifyShortageRes.json();
    assert.equal(verifyShortageBody.stockVerificationStatus, 'No_Stock_Available');
    assert.equal(verifyShortageBody.items[0].availableStockQty, 0);
    assert.equal(verifyShortageBody.items[0].procureQty, 4); // Full requested quantity must be procured

    // 12f. Invalid or Missing Item Codes: defaults safely to 0 available stock and full procure quantity
    const msrfMissingCode = await createMsrf(tokens.employeeTech, {
      reportingHeadId: 'usr_mgr_hvac',
      items: [
        {
          itemCode: 'NON-EXISTENT-SKU-999',
          description: 'Custom Fabricated Bracket',
          requestedQty: 6,
          estimatedUnitRate: 50,
        },
        {
          itemCode: '',
          description: 'Specialty Adhesive Tape',
          requestedQty: 3,
          estimatedUnitRate: 20,
        },
      ],
    });
    await app.request(`/api/msrf/${msrfMissingCode.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved' }),
    }, env);
    await app.request(`/api/msrf/${msrfMissingCode.id}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ notes: 'Accepted into intake' }),
    }, env);

    const verifyMissingRes = await app.request(`/api/msrf/${msrfMissingCode.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(verifyMissingRes.status, 200);
    const verifyMissingBody = await verifyMissingRes.json();
    assert.equal(verifyMissingBody.stockVerificationStatus, 'No_Stock_Available');
    assert.equal(verifyMissingBody.items[0].availableStockQty, 0);
    assert.equal(verifyMissingBody.items[0].procureQty, 6);
    assert.equal(verifyMissingBody.items[1].availableStockQty, 0);
    assert.equal(verifyMissingBody.items[1].procureQty, 3);

    // 12g. Stock Reservation & Duplicate Reservation Prevention
    // Reserving for msrfFull
    const reserveRes = await app.request(`/api/msrf/${msrfFull.id}/reserve-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(reserveRes.status, 200);
    const reserveBody = await reserveRes.json();
    assert.equal(reserveBody.success, true);
    assert.equal(reserveBody.reservations[0].reservedQty, 2);

    // Verify audit log for reservation
    const reserveAudit = rawDb.prepare(
      "SELECT * FROM procurement_audit_logs WHERE entity_id = ? AND action = 'MSRF_STOCK_RESERVED'"
    ).get(msrfFull.id);
    assert.ok(reserveAudit);

    // Duplicate reservation is blocked (409)
    const dupReserveRes = await app.request(`/api/msrf/${msrfFull.id}/reserve-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(dupReserveRes.status, 409);
    const dupReserveBody = await dupReserveRes.json();
    assert.equal(dupReserveBody.code, 'DUPLICATE_RESERVATION');

    // Reserving when zero stock available returns 422 INSUFFICIENT_STOCK
    const zeroStockReserve = await app.request(`/api/msrf/${msrfShortage.id}/reserve-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(zeroStockReserve.status, 422);
    const zeroStockBody = await zeroStockReserve.json();
    assert.equal(zeroStockBody.code, 'INSUFFICIENT_STOCK');

    // 12h. Stock Issue, Over-issue Prevention, and Duplicate Issue Prevention
    // Try to over-issue more stock than exists
    const overIssueRes = await app.request(`/api/msrf/${msrfFull.id}/issue-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        customQuantities: {
          [verifyFullBody.items[0].id]: 50, // 50 requested to issue, only 10 in warehouse
        },
      }),
    }, env);
    assert.equal(overIssueRes.status, 422);
    const overIssueBody = await overIssueRes.json();
    assert.equal(overIssueBody.code, 'INSUFFICIENT_STOCK');

    // Valid issue of available stock
    const validIssueRes = await app.request(`/api/msrf/${msrfFull.id}/issue-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
    }, env);
    assert.equal(validIssueRes.status, 200);
    const validIssueBody = await validIssueRes.json();
    assert.equal(validIssueBody.success, true);
    assert.equal(validIssueBody.isFullyStockFulfilled, true);
    assert.equal(validIssueBody.request.procurement_status, 'Closed');

    // Verify inventory deduction in crm_inventory
    const compInv = rawDb.prepare("SELECT current_stock, stock FROM crm_inventory WHERE code = 'COMP-2TON'").get();
    assert.equal(compInv.current_stock, 8); // 10 initial - 2 issued = 8

    // Verify audit log for stock issue
    const issueAudit = rawDb.prepare(
      "SELECT * FROM procurement_audit_logs WHERE entity_id = ? AND action = 'MSRF_STOCK_ISSUED'"
    ).get(msrfFull.id);
    assert.ok(issueAudit);

    // Duplicate stock issue attempt is blocked (409)
    const dupIssueRes = await app.request(`/api/msrf/${msrfFull.id}/issue-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(dupIssueRes.status, 409);
    const dupIssueBody = await dupIssueRes.json();
    assert.equal(dupIssueBody.code, 'DUPLICATE_STOCK_ISSUE');
  });

  // --------------------------------------------------------------------------
  // TEST 13: Partial Stock Issuance, Shortage Non-Closure & Shortage PO Flow
  // --------------------------------------------------------------------------
  it('13. Partial Stock Issuance: updates line items, never prematurely closes MSRF, and flows into shortage PO', async () => {
    // 13a. Create MSRF with partial stock item
    const msrf = await createMsrf(tokens.employeeTech, {
      reportingHeadId: 'usr_mgr_hvac',
      purpose: 'HVAC expansion valve maintenance',
      items: [
        {
          itemCode: 'VALVE-EXP-01',
          description: 'Electronic Expansion Valve',
          requestedQty: 5, // 5 requested, 3 available in inventory, 2 shortage
          estimatedUnitRate: 250,
        },
      ],
    });

    // 13b. Manager approves
    const appRes = await app.request(`/api/msrf/${msrf.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved for procurement' }),
    }, env);
    assert.equal(appRes.status, 200);

    // 13c. Procurement Intake
    const intakeRes = await app.request(`/api/msrf/${msrf.id}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ notes: 'Accepted into procurement queue' }),
    }, env);
    assert.equal(intakeRes.status, 200);

    // 13d. Stock Verification
    const verifyRes = await app.request(`/api/msrf/${msrf.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.stockVerificationStatus, 'Partial_Stock_Available');
    assert.equal(verifyBody.items[0].availableStockQty, 3);
    assert.equal(verifyBody.items[0].allocatableQty, 3);
    assert.equal(verifyBody.items[0].procureQty, 2);

    // 13e. Reserve Available Stock (3 units)
    const reserveRes = await app.request(`/api/msrf/${msrf.id}/reserve-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(reserveRes.status, 200);
    const reserveBody = await reserveRes.json();
    assert.equal(reserveBody.reservations[0].reservedQty, 3);
    assert.equal(reserveBody.reservations[0].shortageQty, 2);

    // 13f. Issue Available Stock (3 units)
    // CRITICAL: Stock issuance MUST NOT close the MSRF because shortage of 2 units remains!
    const issueRes = await app.request(`/api/msrf/${msrf.id}/issue-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
    }, env);
    assert.equal(issueRes.status, 200);
    const issueBody = await issueRes.json();
    assert.equal(issueBody.success, true);
    assert.equal(issueBody.isFullyStockFulfilled, false, 'Partial stock issuance must NOT be marked fully fulfilled');
    assert.equal(issueBody.remainingShortageCount, 1, 'Shortage count must be exactly 1');
    assert.equal(issueBody.request.procurement_status, 'Stock_Verified', 'Status must remain Stock_Verified');
    assert.equal(issueBody.request.is_closed, 0, 'is_closed must remain 0');

    // Verify inventory deduction in crm_inventory (3 units deducted, 0 remaining)
    const valveInv = rawDb.prepare("SELECT current_stock, stock FROM crm_inventory WHERE code = 'VALVE-EXP-01'").get();
    assert.equal(valveInv.current_stock, 0);

    // Verify line item was updated with issued stock and remaining procure quantity
    const updatedItem = rawDb.prepare(
      'SELECT available_stock_qty, procure_qty FROM material_service_request_items WHERE msrf_id = ?'
    ).get(msrf.id);
    assert.equal(updatedItem.available_stock_qty, 3);
    assert.equal(updatedItem.procure_qty, 2);

    // 13g. Attempting premature closure before shortage resolution is blocked (422)
    const prematureClose = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ closureNotes: 'Trying to close before shortage fulfilled' }),
    }, env);
    assert.equal(prematureClose.status, 422);
    const prematureCloseBody = await prematureClose.json();
    assert.equal(prematureCloseBody.code, 'PREMATURE_CLOSURE_BLOCKED');

    // 13h. Procurement proceeds with Sourcing for remaining shortage
    // Seed supplier quote for 2 units
    rawDb.exec(`
      INSERT INTO supplier_quotations (
        id, msrf_id, quotation_ref, quotation_date, supplier_id, supplier_name,
        currency, subtotal, tax_amount, landed_total_value, delivery_lead_time_days, is_recommended, created_at, updated_at
      ) VALUES (
        'sq_shortage_01', '${msrf.id}', 'QT-EXP-001', '2026-11-01', 'sup_01', 'Al-Futtaim HVAC Supplies',
        'AED', 500, 25, 525, 3, 1, datetime('now'), datetime('now')
      );
    `);

    // 13i. Submit recommendation
    const recRes = await app.request(`/api/msrf/${msrf.id}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        selectedQuotationId: 'sq_shortage_01',
        recommendationReason: 'Best pricing and fastest lead time for valve shortage.',
      }),
    }, env);
    assert.equal(recRes.status, 200);

    // 13j. Generate PO for Shortage
    const poRes = await app.request(`/api/msrf/${msrf.id}/generate-po`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
      body: JSON.stringify({
        supplier: 'Al-Futtaim HVAC Supplies',
        deliveryMode: 'Warehouse_Receipt',
      }),
    }, env);
    assert.equal(poRes.status, 201);
    const poBody = await poRes.json();
    assert.equal(poBody.success, true);
    assert.ok(poBody.po.po_number);

    // Verify PO line item has exact shortage quantity of 2 units
    const poItem = rawDb.prepare(
      'SELECT qty, code FROM purchase_order_items WHERE purchase_order_id = ?'
    ).get(poBody.po.id);
    assert.equal(poItem.qty, 2, 'PO must be generated for the exact remaining shortage of 2 units');

    // Duplicate PO generation attempt is blocked (400)
    const dupPoRes = await app.request(`/api/msrf/${msrf.id}/generate-po`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.procurementBuyer}`,
      },
    }, env);
    assert.equal(dupPoRes.status, 400);
    const dupPoBody = await dupPoRes.json();
    assert.equal(dupPoBody.code, 'PO_ALREADY_EXISTS');

    // 13k. Attempting closure while linked PO is pending delivery is blocked (422)
    const poPendingClose = await app.request(`/api/msrf/${msrf.id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
    }, env);
    assert.equal(poPendingClose.status, 422);
    const poPendingBody = await poPendingClose.json();
    assert.equal(poPendingBody.code, 'PREMATURE_CLOSURE_BLOCKED');
  });

  // --------------------------------------------------------------------------
  // TEST 14: Zero-Stock Requisition Workflow & Issuance Rejection
  // --------------------------------------------------------------------------
  it('14. Zero Stock Scenario: rejects reservation and issuance (422) and protects inventory', async () => {
    // Create zero-stock MSRF
    const msrfZero = await createMsrf(tokens.employeeTech, {
      reportingHeadId: 'usr_mgr_hvac',
      purpose: 'Drier replacement',
      items: [
        {
          itemCode: 'FILTER-DRIER',
          description: 'Filter Drier 3/8',
          requestedQty: 4, // 0 in stock
          estimatedUnitRate: 75,
        },
      ],
    });

    // Approve & Intake
    await app.request(`/api/msrf/${msrfZero.id}/manager-approval`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.managerHvac}` },
      body: JSON.stringify({ decision: 'Approved', remarks: 'Approved' }),
    }, env);

    await app.request(`/api/msrf/${msrfZero.id}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.procurementBuyer}` },
      body: JSON.stringify({ notes: 'Accepted into intake' }),
    }, env);

    // Stock verify confirms No_Stock_Available
    const verifyRes = await app.request(`/api/msrf/${msrfZero.id}/stock-verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.stockVerificationStatus, 'No_Stock_Available');
    assert.equal(verifyBody.items[0].availableStockQty, 0);
    assert.equal(verifyBody.items[0].procureQty, 4);

    // Stock reservation rejected with 422
    const reserveRes = await app.request(`/api/msrf/${msrfZero.id}/reserve-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(reserveRes.status, 422);
    const reserveBody = await reserveRes.json();
    assert.equal(reserveBody.code, 'INSUFFICIENT_STOCK');

    // Stock issue rejected with 422
    const issueRes = await app.request(`/api/msrf/${msrfZero.id}/issue-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.procurementBuyer}` },
    }, env);
    assert.equal(issueRes.status, 422);
    const issueBody = await issueRes.json();
    assert.equal(issueBody.code, 'INSUFFICIENT_STOCK');

    // MSRF remains open in Stock_Verified state
    const currentMsrf = rawDb.prepare(
      'SELECT procurement_status, is_closed FROM material_service_requests WHERE id = ?'
    ).get(msrfZero.id);
    assert.equal(currentMsrf.procurement_status, 'Stock_Verified');
    assert.equal(currentMsrf.is_closed, 0);
  });
});

