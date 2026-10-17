/**
 * Automated Test Suite for Tasks and Worker Operations (cool-tech-crm-api)
 * 
 * Verifies Phase 1:
 * 1. Authentication enforcement (401 on unauthenticated requests)
 * 2. Task creation with activity log and checklist persistence
 * 3. In-place task editing and soft deletion
 * 4. Task status workflow transitions & field technician sign-off
 * 5. Task comments
 * 6. RBAC scoping: Admin, Manager, and Employee shared access
 * 7. Worker attendance clock-in and clock-out
 * 8. Worker timesheet logging and manager approval
 * 9. Material requests creation and status updates
 * 10. Non-destructive sync-batch for local storage migration
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
const TEST_KID = 'tasks-worker-test-key-1';

function createTasksAndWorkerDatabase() {
  const sqlite = new DatabaseSync(':memory:');

  // 1. Users table
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

  // 2. Customers migration
  const customersMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0002_create_customers.sql'), 'utf8');
  sqlite.exec(customersMigration);

  // 3. Tasks and Worker Ops migration
  const tasksMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0005_create_tasks_and_worker_ops.sql'), 'utf8');
  sqlite.exec(tasksMigration);

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

describe('Tasks and Worker Operations Test Suite', () => {
  let privateKey;
  let adminToken;
  let managerToken;
  let employeeToken;
  let otherEmployeeToken;
  let env;
  let sqlite;

  const adminUser = {
    id: 'usr_admin_test_1',
    firebase_uid: 'fb_admin_test_1',
    email: 'admin@cooltechuae.com',
    full_name: 'Operations Director',
    role: 'ADMIN',
  };

  const managerUser = {
    id: 'usr_manager_test_1',
    firebase_uid: 'fb_manager_test_1',
    email: 'manager@cooltechuae.com',
    full_name: 'HVAC Service Manager',
    role: 'MANAGER',
    department: 'Field Operations',
    team_id: 'team_alpha',
  };

  const employeeUser = {
    id: 'usr_emp_test_1',
    firebase_uid: 'fb_emp_test_1',
    email: 'tech1@cooltechuae.com',
    full_name: 'Lead Chiller Technician',
    role: 'EMPLOYEE',
    department: 'Field Operations',
    reports_to: 'usr_manager_test_1',
    team_id: 'team_alpha',
  };

  const otherEmployeeUser = {
    id: 'usr_emp_test_2',
    firebase_uid: 'fb_emp_test_2',
    email: 'tech2@cooltechuae.com',
    full_name: 'Ductwork Technician',
    role: 'EMPLOYEE',
    department: 'Field Operations',
  };

  before(async () => {
    const keyPair = await generateKeyPair('RS256', { extractable: true });
    privateKey = keyPair.privateKey;

    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === TEST_KID) {
        return keyPair.publicKey;
      }
      throw new Error('Key ID not found in JWKS');
    };

    setCustomJWKS(mockJWKS);

    adminToken = await new SignJWT({
      user_id: adminUser.firebase_uid,
      sub: adminUser.firebase_uid,
      email: adminUser.email,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    managerToken = await new SignJWT({
      user_id: managerUser.firebase_uid,
      sub: managerUser.firebase_uid,
      email: managerUser.email,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    employeeToken = await new SignJWT({
      user_id: employeeUser.firebase_uid,
      sub: employeeUser.firebase_uid,
      email: employeeUser.email,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    otherEmployeeToken = await new SignJWT({
      user_id: otherEmployeeUser.firebase_uid,
      sub: otherEmployeeUser.firebase_uid,
      email: otherEmployeeUser.email,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);
  });

  beforeEach(() => {
    const dbObj = createTasksAndWorkerDatabase();
    sqlite = dbObj.sqlite;
    env = { DB: dbObj.mockD1 };

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(adminUser.id, adminUser.firebase_uid, adminUser.email, adminUser.full_name, adminUser.role);

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, department, team_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)')
      .run(managerUser.id, managerUser.firebase_uid, managerUser.email, managerUser.full_name, managerUser.role, managerUser.department, managerUser.team_id);

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, department, reports_to, team_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
      .run(employeeUser.id, employeeUser.firebase_uid, employeeUser.email, employeeUser.full_name, employeeUser.role, employeeUser.department, employeeUser.reports_to, employeeUser.team_id);

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, department, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)')
      .run(otherEmployeeUser.id, otherEmployeeUser.firebase_uid, otherEmployeeUser.email, otherEmployeeUser.full_name, otherEmployeeUser.role, otherEmployeeUser.department);
  });

  it('1. Rejects unauthenticated requests with 401 across all task and worker endpoints', async () => {
    const endpoints = [
      ['GET', '/api/tasks'],
      ['POST', '/api/tasks'],
      ['GET', '/api/worker/attendance'],
      ['POST', '/api/worker/attendance/clock-in'],
      ['GET', '/api/worker/timesheets'],
      ['POST', '/api/worker/timesheets'],
      ['GET', '/api/worker/material-requests'],
      ['POST', '/api/worker/material-requests'],
    ];

    for (const [method, path] of endpoints) {
      const res = await app.fetch(
        new Request(`http://localhost${path}`, { method }),
        env
      );
      assert.equal(res.status, 401, `Expected 401 for ${method} ${path}`);
    }
  });

  it('2. Manager creates task with checklists, assigning to employee; verifies activity log', async () => {
    const taskPayload = {
      title: 'Chiller Preventative Maintenance',
      taskDetails: 'Execute 500-hour comprehensive service on Trane Chiller #02',
      customerName: 'Emaar Hospitality - Address Hotel',
      location: 'Downtown Dubai',
      priority: 'High',
      taskType: 'HVAC Repair',
      dueDate: '2026-10-25',
      assignedEmployee: employeeUser.full_name,
      assigneeId: employeeUser.id,
      assigneeEmail: employeeUser.email,
      checklist: [
        { label: 'Inspect refrigerant pressure', is_completed: 0, is_required: 1 },
        { label: 'Check oil separator level', is_completed: 0, is_required: 1 },
      ],
    };

    const res = await app.fetch(
      new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${managerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskPayload),
      }),
      env
    );

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.task.id.startsWith('TSK-'));
    assert.equal(data.task.assignee_id, employeeUser.id);
    assert.equal(data.task.status, 'Assigned');

    // Retrieve by ID with checklists & logs
    const getRes = await app.fetch(
      new Request(`http://localhost/api/tasks/${data.task.id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${managerToken}` },
      }),
      env
    );

    assert.equal(getRes.status, 200);
    const detail = await getRes.json();
    assert.equal(detail.task.checklist.length, 2);
    assert.equal(detail.task.history.length, 1);
    assert.equal(detail.task.history[0].action, 'Created & Assigned');
  });

  it('3. Assigned employee can view their task, while other unassigned employee cannot (RBAC)', async () => {
    // 1. Admin creates task assigned to employeeUser
    const createRes = await app.fetch(
      new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskDetails: 'Emergency Fan Coil Unit Repair',
          assigneeId: employeeUser.id,
          assigneeName: employeeUser.full_name,
          assigneeEmail: employeeUser.email,
        }),
      }),
      env
    );
    const created = await createRes.json();
    const taskId = created.task.id;

    // 2. Assigned employeeUser retrieves task -> 200
    const empRes = await app.fetch(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${employeeToken}` },
      }),
      env
    );
    assert.equal(empRes.status, 200);

    // 3. Other employeeUser retrieves task -> 403 Forbidden
    const otherRes = await app.fetch(
      new Request(`http://localhost/api/tasks/${taskId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${otherEmployeeToken}` },
      }),
      env
    );
    assert.equal(otherRes.status, 403);
  });

  it('4. Employee updates status workflow with customer sign-off and technician notes', async () => {
    // 1. Create task
    const createRes = await app.fetch(
      new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskDetails: 'Filter Replacement & Coil Cleaning',
          assigneeId: employeeUser.id,
        }),
      }),
      env
    );
    const { task } = await createRes.json();

    // 2. Transition status to Completed with signature
    const patchRes = await app.fetch(
      new Request(`http://localhost/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Completed',
          progress: 100,
          notes: 'All filters replaced. Coil cleaned with biodegradable foaming wash.',
          customerSignature: 'data:image/svg+xml;utf8,<svg>sig</svg>',
          customerSignedBy: 'Mr. Tariq Al Nuaimi',
          rating: 5,
        }),
      }),
      env
    );

    assert.equal(patchRes.status, 200);
    const updated = await patchRes.json();
    assert.equal(updated.task.status, 'Completed');
    assert.equal(updated.task.progress, 100);
    assert.equal(updated.task.customer_signed_by, 'Mr. Tariq Al Nuaimi');
    assert.equal(updated.task.completion_rating, 5);
  });

  it('5. Adds collaborative comments to a task', async () => {
    const createRes = await app.fetch(
      new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskDetails: 'VAV Box Commissioning' }),
      }),
      env
    );
    const { task } = await createRes.json();

    const commentRes = await app.fetch(
      new Request(`http://localhost/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Arrived at site. Security clearance received.',
        }),
      }),
      env
    );

    assert.equal(commentRes.status, 201);
    const commentData = await commentRes.json();
    assert.equal(commentData.success, true);
    assert.equal(commentData.comment.comment_text, 'Arrived at site. Security clearance received.');
    assert.equal(commentData.comment.author_name, employeeUser.full_name);
  });

  it('6. Worker attendance: clock-in, query today status, and clock-out', async () => {
    // 1. Clock in
    const clockInRes = await app.fetch(
      new Request('http://localhost/api/worker/attendance/clock-in', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: 'Dubai Silicon Oasis Depot' }),
      }),
      env
    );
    assert.equal(clockInRes.status, 200);
    const inData = await clockInRes.json();
    assert.equal(inData.attendance.isClockedIn, true);

    // 2. Query today attendance
    const queryRes = await app.fetch(
      new Request('http://localhost/api/worker/attendance', {
        method: 'GET',
        headers: { Authorization: `Bearer ${employeeToken}` },
      }),
      env
    );
    assert.equal(queryRes.status, 200);
    const qData = await queryRes.json();
    assert.equal(qData.attendance.isClockedIn, true);

    // 3. Clock out
    const clockOutRes = await app.fetch(
      new Request('http://localhost/api/worker/attendance/clock-out', {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
      }),
      env
    );
    assert.equal(clockOutRes.status, 200);
    const outData = await clockOutRes.json();
    assert.equal(outData.attendance.isClockedIn, false);
    assert.ok(outData.attendance.clockOutTime);
  });

  it('7. Worker logs timesheet entry; Manager approves timesheet', async () => {
    // 1. Worker logs hours
    const logRes = await app.fetch(
      new Request('http://localhost/api/worker/timesheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskNumber: 'TSK-9901',
          taskTitle: 'Chiller Leak Test',
          clientName: 'City Walk Residences',
          regularHours: 8,
          overtimeHours: 2,
          workSummary: 'Pressurized system with Nitrogen. Detected and brazed pinhole leak on suction line.',
        }),
      }),
      env
    );
    assert.equal(logRes.status, 201);
    const { timesheet } = await logRes.json();
    assert.equal(timesheet.regular_hours, 8);
    assert.equal(timesheet.status, 'Submitted');

    // 2. Manager approves timesheet
    const approveRes = await app.fetch(
      new Request(`http://localhost/api/worker/timesheets/${timesheet.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${managerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Approved' }),
      }),
      env
    );
    assert.equal(approveRes.status, 200);

    // 3. Employee cannot approve timesheets (403)
    const empApproveRes = await app.fetch(
      new Request(`http://localhost/api/worker/timesheets/${timesheet.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Approved' }),
      }),
      env
    );
    assert.equal(empApproveRes.status, 403);
  });

  it('8. Worker submits material request; Manager updates status to Approved', async () => {
    const reqRes = await app.fetch(
      new Request('http://localhost/api/worker/material-requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${employeeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemCode: 'R410A-GAS-11KG',
          itemName: 'R410A Refrigerant Gas Cylinder (11.3 kg)',
          category: 'Refrigerants',
          quantity: 2,
          unit: 'Cylinders',
          urgency: 'Urgent',
          notes: 'Required immediately for Chiller #1 recharge.',
        }),
      }),
      env
    );

    assert.equal(reqRes.status, 201);
    const { request } = await reqRes.json();
    assert.equal(request.urgency, 'Urgent');
    assert.equal(request.status, 'Pending Approval');

    // Manager approves
    const patchRes = await app.fetch(
      new Request(`http://localhost/api/worker/material-requests/${request.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${managerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Approved' }),
      }),
      env
    );
    assert.equal(patchRes.status, 200);
  });

  it('9. Non-destructive sync-batch imports local tasks without duplicating existing records', async () => {
    const batchPayload = {
      tasks: [
        {
          id: 'TSK-MIGRATED-001',
          taskDetails: 'Legacy Site Survey Task',
          customerName: 'Nakheel Mall',
          priority: 'Medium',
          status: 'Completed',
          progress: 100,
        },
        {
          id: 'TSK-MIGRATED-002',
          taskDetails: 'Legacy Duct Cleaning',
          customerName: 'JBR Tower 4',
          priority: 'Normal',
          status: 'Pending',
          progress: 0,
        },
      ],
    };

    // First sync: both imported
    const syncRes1 = await app.fetch(
      new Request('http://localhost/api/tasks/sync-batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchPayload),
      }),
      env
    );
    assert.equal(syncRes1.status, 200);
    const syncData1 = await syncRes1.json();
    assert.equal(syncData1.synced, 2);
    assert.equal(syncData1.skipped, 0);

    // Second sync of same payload: both skipped, zero duplicates created
    const syncRes2 = await app.fetch(
      new Request('http://localhost/api/tasks/sync-batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchPayload),
      }),
      env
    );
    assert.equal(syncRes2.status, 200);
    const syncData2 = await syncRes2.json();
    assert.equal(syncData2.synced, 0);
    assert.equal(syncData2.skipped, 2);
  });

  it('10. Soft deletion marks task as deleted without removing historical record', async () => {
    const createRes = await app.fetch(
      new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskDetails: 'Temporary task to be removed' }),
      }),
      env
    );
    const { task } = await createRes.json();

    const delRes = await app.fetch(
      new Request(`http://localhost/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );
    assert.equal(delRes.status, 200);

    // List excludes soft-deleted
    const listRes = await app.fetch(
      new Request('http://localhost/api/tasks', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );
    const listData = await listRes.json();
    assert.equal(listData.tasks.some((t) => t.id === task.id), false);

    // Verify row still exists in SQLite with is_deleted = 1
    const raw = sqlite.prepare('SELECT is_deleted FROM tasks WHERE id = ?').get(task.id);
    assert.equal(raw.is_deleted, 1);
  });
});
