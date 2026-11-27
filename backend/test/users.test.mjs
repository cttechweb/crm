/**
 * Automated Test Suite for Staff Management API (cool-tech-crm-api)
 * 
 * Verifies:
 * 1. Authentication enforcement on all user endpoints (401 without valid token)
 * 2. RBAC enforcement: EMPLOYEE and MANAGER cannot access or manage staff (403)
 * 3. Authorized staff creation: SUPER_ADMIN and ADMIN can create staff with matching D1 profiles
 * 4. Input validation on POST: required fields (full_name, email, firebase_uid, role)
 * 5. Unique constraints: rejects duplicate email and duplicate firebase_uid (409 Conflict)
 * 6. Referential integrity: validates that reports_to references an existing user (400)
 * 7. Privilege escalation prevention: ADMIN cannot create a SUPER_ADMIN (403)
 * 8. Profile updates: PUT /api/users/:id updates profile fields and validates role changes
 * 9. Activation/deactivation: PATCH /api/users/:id/status updates is_active and prevents root Super Admin deactivation
 * 10. Inactive staff blocking: Deactivated users cannot access protected CRM API routes (403 ACCOUNT_INACTIVE)
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { app } from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';

const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

function createRealSqliteD1Database() {
  const sqlite = new DatabaseSync(':memory:');

  // Create users table strictly matching production schema
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

  return {
    sqlite,
    prepare(sql) {
      return {
        bind(...params) {
          return {
            async first() {
              try {
                const stmt = sqlite.prepare(sql);
                const row = stmt.get(...params);
                return row || null;
              } catch (err) {
                return null;
              }
            },
            async all() {
              try {
                const stmt = sqlite.prepare(sql);
                const rows = stmt.all(...params);
                return { results: rows || [] };
              } catch (err) {
                return { results: [] };
              }
            },
            async run() {
              const stmt = sqlite.prepare(sql);
              const result = stmt.run(...params);
              return { success: true, meta: { changes: result.changes } };
            },
          };
        },
      };
    },
  };
}

describe('Staff Management API Test Suite', () => {
  let validKeyPair;
  let validKeyId = 'google-test-key-users';
  let db;

  const ROOT_SUPERADMIN = {
    id: 'usr_superadmin_001',
    firebase_uid: 'uid_superadmin_001',
    email: 'superadmin@cooltechuae.com',
    full_name: 'Root Super Admin',
    role: 'SUPER_ADMIN',
    position: 'CEO',
    department: 'Executive Management',
    is_active: 1,
  };

  const STAFF_ADMIN = {
    id: 'usr_admin_001',
    firebase_uid: 'uid_admin_001',
    email: 'admin@cooltechuae.com',
    full_name: 'Operations Admin',
    role: 'ADMIN',
    position: 'COO',
    department: 'Operations',
    is_active: 1,
  };

  const STAFF_MANAGER = {
    id: 'usr_manager_001',
    firebase_uid: 'uid_manager_001',
    email: 'shibil@cooltechuae.com',
    full_name: 'Muhammed Shibil',
    role: 'MANAGER',
    position: 'CSO',
    department: 'Sales',
    team_id: 'team_sales',
    is_active: 1,
  };

  const STAFF_EMPLOYEE = {
    id: 'emp_shaheer_001',
    firebase_uid: 'uid_shaheer_001',
    email: 'shaheer@cooltechuae.com',
    full_name: 'Shaheer',
    role: 'EMPLOYEE',
    position: 'Sales Executive',
    department: 'Sales',
    team_id: 'team_sales',
    reports_to: 'usr_manager_001',
    is_active: 1,
  };

  const OUTSIDE_EMPLOYEE = {
    id: 'emp_outside_001',
    firebase_uid: 'uid_outside_001',
    email: 'outside@cooltechuae.com',
    full_name: 'Outside Employee',
    role: 'EMPLOYEE',
    position: 'Operations Staff',
    department: 'Operations',
    team_id: 'team_operations',
    reports_to: 'usr_admin_001',
    is_active: 1,
  };

  before(async () => {
    validKeyPair = await generateKeyPair('RS256', { extractable: true });
    const publicJwk = await exportJWK(validKeyPair.publicKey);
    publicJwk.kid = validKeyId;
    publicJwk.alg = 'RS256';
    publicJwk.use = 'sig';

    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === validKeyId) {
        return validKeyPair.publicKey;
      }
      throw new Error('Key ID not found');
    };

    setCustomJWKS(mockJWKS);
  });

  beforeEach(() => {
    db = createRealSqliteD1Database();

    // Seed standard staff
    const insert = db.sqlite.prepare(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      ROOT_SUPERADMIN.id,
      ROOT_SUPERADMIN.firebase_uid,
      ROOT_SUPERADMIN.email,
      ROOT_SUPERADMIN.full_name,
      ROOT_SUPERADMIN.role,
      ROOT_SUPERADMIN.position,
      ROOT_SUPERADMIN.department,
      null,
      null,
      ROOT_SUPERADMIN.is_active
    );

    insert.run(
      STAFF_ADMIN.id,
      STAFF_ADMIN.firebase_uid,
      STAFF_ADMIN.email,
      STAFF_ADMIN.full_name,
      STAFF_ADMIN.role,
      STAFF_ADMIN.position,
      STAFF_ADMIN.department,
      null,
      ROOT_SUPERADMIN.id,
      STAFF_ADMIN.is_active
    );

    insert.run(
      STAFF_MANAGER.id,
      STAFF_MANAGER.firebase_uid,
      STAFF_MANAGER.email,
      STAFF_MANAGER.full_name,
      STAFF_MANAGER.role,
      STAFF_MANAGER.position,
      STAFF_MANAGER.department,
      STAFF_MANAGER.team_id,
      ROOT_SUPERADMIN.id,
      STAFF_MANAGER.is_active
    );

    insert.run(
      STAFF_EMPLOYEE.id,
      STAFF_EMPLOYEE.firebase_uid,
      STAFF_EMPLOYEE.email,
      STAFF_EMPLOYEE.full_name,
      STAFF_EMPLOYEE.role,
      STAFF_EMPLOYEE.position,
      STAFF_EMPLOYEE.department,
      STAFF_EMPLOYEE.team_id,
      STAFF_EMPLOYEE.reports_to,
      STAFF_EMPLOYEE.is_active
    );

    insert.run(
      OUTSIDE_EMPLOYEE.id,
      OUTSIDE_EMPLOYEE.firebase_uid,
      OUTSIDE_EMPLOYEE.email,
      OUTSIDE_EMPLOYEE.full_name,
      OUTSIDE_EMPLOYEE.role,
      OUTSIDE_EMPLOYEE.position,
      OUTSIDE_EMPLOYEE.department,
      OUTSIDE_EMPLOYEE.team_id,
      OUTSIDE_EMPLOYEE.reports_to,
      OUTSIDE_EMPLOYEE.is_active
    );
  });

  async function createToken(sub, email) {
    return await new SignJWT({ email })
      .setProtectedHeader({ alg: 'RS256', kid: validKeyId })
      .setSubject(sub)
      .setAudience(PROJECT_ID)
      .setIssuer(ISSUER)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(validKeyPair.privateKey);
  }

  // 1. Authentication enforcement on all user endpoints
  it('1. All staff management endpoints reject requests without token (401)', async () => {
    const endpoints = [
      { method: 'GET', path: '/api/users' },
      { method: 'POST', path: '/api/users' },
      { method: 'PUT', path: '/api/users/usr_admin_001' },
      { method: 'PATCH', path: '/api/users/usr_admin_001/status' },
    ];

    for (const ep of endpoints) {
      const res = await app.request(ep.path, { method: ep.method }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
      assert.equal(res.status, 401, `${ep.method} ${ep.path} must return 401`);
      const body = await res.json();
      assert.equal(body.code, 'UNAUTHORIZED');
    }
  });

  // 2. RBAC enforcement: EMPLOYEE cannot access staff directory or create staff (403)
  it('2. GET /api/users and POST /api/users reject EMPLOYEE access without assignable scope (403)', async () => {
    const employeeToken = await createToken(STAFF_EMPLOYEE.firebase_uid, STAFF_EMPLOYEE.email);

    // Employee cannot list full directory (403)
    const resEmpGet = await app.request('/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEmpGet.status, 403);
    const bodyEmpGet = await resEmpGet.json();
    assert.equal(bodyEmpGet.code, 'FORBIDDEN');

    // Employee CAN query with scope=assignable to retrieve self
    const resEmpAssignable = await app.request('/api/users?scope=assignable', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEmpAssignable.status, 200);
    const bodyEmpAssignable = await resEmpAssignable.json();
    assert.equal(bodyEmpAssignable.users.length, 1);
    assert.equal(bodyEmpAssignable.users[0].id, STAFF_EMPLOYEE.id);

    // Employee cannot create staff (403)
    const resEmpPost = await app.request('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Hacker',
        email: 'hacker@test.com',
        firebase_uid: 'uid_hacker',
        role: 'EMPLOYEE',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEmpPost.status, 403);
    const bodyEmpPost = await resEmpPost.json();
    assert.equal(bodyEmpPost.code, 'FORBIDDEN');
  });

  // 2b. MANAGER Hierarchy & Scope enforcement
  it('2b. MANAGER can list reportees, create Employees only (auto-reports_to), and is blocked from managing out-of-scope staff', async () => {
    const managerToken = await createToken(STAFF_MANAGER.firebase_uid, STAFF_MANAGER.email);

    // 1. Manager lists users -> scoped to self and direct reportees only
    const resList = await app.request('/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${managerToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resList.status, 200);
    const listBody = await resList.json();
    const ids = listBody.users.map((u) => u.id);
    assert.ok(ids.includes(STAFF_MANAGER.id));
    assert.ok(ids.includes(STAFF_EMPLOYEE.id));
    assert.ok(!ids.includes(OUTSIDE_EMPLOYEE.id), 'Outside employee must not be visible to manager');
    assert.ok(!ids.includes(STAFF_ADMIN.id), 'Admin must not be visible to manager');

    // 2. Manager creates Employee -> successfully created with reports_to automatically set to Manager\'s D1 user ID
    const resCreateEmp = await app.request('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Sales Rep Tariq',
        email: 'tariq@cooltechuae.com',
        firebase_uid: 'uid_tariq_001',
        role: 'EMPLOYEE',
        position: 'Sales Representative',
        reports_to: 'usr_admin_001', // Attemping to set another manager/admin
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resCreateEmp.status, 201);
    const createBody = await resCreateEmp.json();
    assert.equal(createBody.user.role, 'EMPLOYEE');
    assert.equal(createBody.user.reports_to, STAFF_MANAGER.id, "Manager's actual D1 user ID must be enforced as reports_to");

    // 3. Manager attempts to create a MANAGER -> 403 Forbidden
    const resCreateMgr = await app.request('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Junior Manager',
        email: 'jrmgr@cooltechuae.com',
        firebase_uid: 'uid_jrmgr',
        role: 'MANAGER',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resCreateMgr.status, 403);

    // 4. Manager attempts to create an ADMIN -> 403 Forbidden
    const resCreateAdmin = await app.request('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Admin Attempt',
        email: 'adminattempt@cooltechuae.com',
        firebase_uid: 'uid_adminattempt',
        role: 'ADMIN',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resCreateAdmin.status, 403);

    // 5. Manager attempts to edit out-of-scope employee -> 403 Forbidden
    const resEditOut = await app.request(`/api/users/${OUTSIDE_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ position: 'Hacked Position' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEditOut.status, 403);

    // 6. Manager attempts to deactivate out-of-scope employee -> 403 Forbidden
    const resDeactOut = await app.request(`/api/users/${OUTSIDE_EMPLOYEE.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: 0 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resDeactOut.status, 403);
  });

  // 3. Authorized staff creation by Super Admin and Admin
  it('3. SUPER_ADMIN and ADMIN can successfully create staff and retrieve in GET list', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    const newStaffPayload = {
      full_name: 'Muhammed Adhil',
      email: 'adhil@cooltechuae.com',
      firebase_uid: 'uid_adhil_001',
      role: 'EMPLOYEE',
      position: 'Junior Sales Executive',
      department: 'Sales',
      team_id: 'team_sales',
      reports_to: 'usr_manager_001',
      is_active: 1,
    };

    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStaffPayload),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.user.email, 'adhil@cooltechuae.com');
    assert.equal(body.user.role, 'EMPLOYEE');
    assert.equal(body.user.reports_to, 'usr_manager_001');

    // Verify record in D1 directly
    const row = db.sqlite.prepare('SELECT * FROM users WHERE email = ?').get('adhil@cooltechuae.com');
    assert.ok(row);
    assert.equal(row.full_name, 'Muhammed Adhil');
    assert.equal(row.firebase_uid, 'uid_adhil_001');

    // Verify in GET /api/users
    const getRes = await app.request('/api/users?q=Adhil', {
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.users.length, 1);
    assert.equal(getBody.users[0].email, 'adhil@cooltechuae.com');
  });

  // 4. Input validation on POST
  it('4. POST /api/users rejects missing required fields and invalid roles (400)', async () => {
    const token = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // Missing full_name
    const res1 = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', firebase_uid: 'uid1', role: 'EMPLOYEE' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(res1.status, 400);

    // Invalid email
    const res2 = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Name', email: 'not-an-email', firebase_uid: 'uid2', role: 'EMPLOYEE' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(res2.status, 400);

    // Missing firebase_uid
    const res3 = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Name', email: 'test@test.com', role: 'EMPLOYEE' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(res3.status, 400);

    // Invalid role
    const res4 = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Name', email: 'test@test.com', firebase_uid: 'uid3', role: 'CHIEF_GUEST' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(res4.status, 400);
  });

  // 5. Unique constraints
  it('5. POST /api/users enforces uniqueness of email and firebase_uid (409 Conflict)', async () => {
    const token = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // Duplicate email
    const resEmail = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Duplicate Email Person',
        email: STAFF_EMPLOYEE.email,
        firebase_uid: 'uid_brand_new',
        role: 'EMPLOYEE',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEmail.status, 409);
    const bodyEmail = await resEmail.json();
    assert.equal(bodyEmail.code, 'EMAIL_ALREADY_EXISTS');

    // Duplicate Firebase UID
    const resUid = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Duplicate UID Person',
        email: 'unique_email@test.com',
        firebase_uid: STAFF_EMPLOYEE.firebase_uid,
        role: 'EMPLOYEE',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resUid.status, 409);
    const bodyUid = await resUid.json();
    assert.equal(bodyUid.code, 'UID_ALREADY_EXISTS');
  });

  // 6. Referential integrity
  it('6. POST /api/users validates that reports_to points to an existing user (400)', async () => {
    const token = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Orphaned Employee',
        email: 'orphan@cooltechuae.com',
        firebase_uid: 'uid_orphan_001',
        role: 'EMPLOYEE',
        reports_to: 'non_existent_manager_999',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_MANAGER');
  });

  // 7. Privilege escalation prevention
  it('7. ADMIN can create Managers and Employees, but cannot create SUPER_ADMIN, create ADMIN, or edit SUPER_ADMIN (403)', async () => {
    const adminToken = await createToken(STAFF_ADMIN.firebase_uid, STAFF_ADMIN.email);

    // Admin creates Manager -> Allowed (201)
    const resCreateMgr = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Operations Manager Kareem',
        email: 'kareem@cooltechuae.com',
        firebase_uid: 'uid_kareem_001',
        role: 'MANAGER',
        position: 'Operations Manager',
        department: 'Operations',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resCreateMgr.status, 201);

    // Admin attempts to create SUPER_ADMIN -> 403 Forbidden
    const resSuper = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Unauthorized Super Admin',
        email: 'fake_super@cooltechuae.com',
        firebase_uid: 'uid_fake_super',
        role: 'SUPER_ADMIN',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resSuper.status, 403);
    const bodySuper = await resSuper.json();
    assert.equal(bodySuper.code, 'FORBIDDEN');

    // Admin attempts to create another ADMIN -> 403 Forbidden
    const resAdmin = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Unauthorized Admin',
        email: 'fake_admin@cooltechuae.com',
        firebase_uid: 'uid_fake_admin',
        role: 'ADMIN',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resAdmin.status, 403);
    const bodyAdmin = await resAdmin.json();
    assert.equal(bodyAdmin.code, 'FORBIDDEN');

    // Admin attempts to edit SUPER_ADMIN profile -> 403 Forbidden
    const resEditSuper = await app.request(`/api/users/${ROOT_SUPERADMIN.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: 'Demoted' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEditSuper.status, 403);

    // Admin attempts to deactivate SUPER_ADMIN -> 403 Forbidden
    const resDeactSuper = await app.request(`/api/users/${ROOT_SUPERADMIN.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 0 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resDeactSuper.status, 403);
  });

  // 8. Profile updates (PUT /api/users/:id)
  it('8. PUT /api/users/:id updates profile fields and rejects self-reporting cycles', async () => {
    const token = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // Update Shaheer's position and role
    const res = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        position: 'Senior Sales Executive',
        role: 'EMPLOYEE',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.user.position, 'Senior Sales Executive');

    // Reject self-reporting cycle (reports_to = self id)
    const resCycle = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reports_to: STAFF_EMPLOYEE.id,
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resCycle.status, 400);
  });

  // 9. Activation/deactivation & root Super Admin protection
  it('9. PATCH /api/users/:id/status updates is_active and prevents root Super Admin deactivation', async () => {
    const token = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // Deactivate employee
    const resDeact = await app.request(`/api/users/${STAFF_EMPLOYEE.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 0 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resDeact.status, 200);
    const bodyDeact = await resDeact.json();
    assert.equal(bodyDeact.is_active, 0);

    // Verify in database
    const empRow = db.sqlite.prepare('SELECT is_active FROM users WHERE id = ?').get(STAFF_EMPLOYEE.id);
    assert.equal(empRow.is_active, 0);

    // Prevent Super Admin deactivating themselves
    const resSelf = await app.request(`/api/users/${ROOT_SUPERADMIN.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 0 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resSelf.status, 400);
  });

  // 10. Inactive staff blocking: Deactivated user blocked by authMiddleware
  it('10. Deactivated users cannot access protected CRM routes (403 ACCOUNT_INACTIVE)', async () => {
    // Explicitly deactivate Shaheer in D1
    db.sqlite.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(STAFF_EMPLOYEE.id);

    const deactToken = await createToken(STAFF_EMPLOYEE.firebase_uid, STAFF_EMPLOYEE.email);

    const res = await app.request('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${deactToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'ACCOUNT_INACTIVE');
  });

  // 11. Super Admin creation protection
  it('11. SUPER_ADMIN accounts cannot be created via standard POST /api/users (403)', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Second Super Admin',
        email: 'second_super@cooltechuae.com',
        firebase_uid: 'uid_second_super',
        role: 'SUPER_ADMIN',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
  });

  // 12. Full Profile Editing in D1 (Role, Department, Reporting Manager)
  it('12. PUT /api/users/:id automatically updates role, department, and reports_to in D1', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // Update Shaheer's department, position, role, and reports_to
    const resUpdate = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: 'HVAC Projects',
        position: 'Assistant Project Manager',
        role: 'EMPLOYEE',
        reports_to: STAFF_ADMIN.id,
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resUpdate.status, 200);
    const bodyUpdate = await resUpdate.json();
    assert.equal(bodyUpdate.user.department, 'HVAC Projects');
    assert.equal(bodyUpdate.user.reports_to, STAFF_ADMIN.id);

    // Verify directly in D1 SQLite
    const row = db.sqlite.prepare('SELECT department, position, reports_to FROM users WHERE id = ?').get(STAFF_EMPLOYEE.id);
    assert.equal(row.department, 'HVAC Projects');
    assert.equal(row.position, 'Assistant Project Manager');
    assert.equal(row.reports_to, STAFF_ADMIN.id);

    // Updating a nonexistent user returns 404 NOT_FOUND
    const resNotFound = await app.request('/api/users/usr_nonexistent_999', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: 'Sales' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resNotFound.status, 404);
  });

  // 13. Reactivation and status update edge cases
  it('13. PATCH /api/users/:id/status reactivates inactive staff and validates input', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // 1. Deactivate
    await app.request(`/api/users/${STAFF_EMPLOYEE.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 0 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    let row = db.sqlite.prepare('SELECT is_active FROM users WHERE id = ?').get(STAFF_EMPLOYEE.id);
    assert.equal(row.is_active, 0);

    // 2. Reactivate
    const resReactivate = await app.request(`/api/users/${STAFF_EMPLOYEE.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 1 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resReactivate.status, 200);
    const bodyReactivate = await resReactivate.json();
    assert.equal(bodyReactivate.is_active, 1);
    row = db.sqlite.prepare('SELECT is_active FROM users WHERE id = ?').get(STAFF_EMPLOYEE.id);
    assert.equal(row.is_active, 1);

    // 3. Missing is_active returns 400 INVALID_INPUT
    const resBadInput = await app.request(`/api/users/${STAFF_EMPLOYEE.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resBadInput.status, 400);

    // 4. Nonexistent user returns 404 NOT_FOUND
    const resNotFound = await app.request('/api/users/usr_nonexistent_999/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 1 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resNotFound.status, 404);
  });

  // 14. Employee authorization restrictions on PUT and PATCH
  it('14. Employees cannot edit or deactivate staff profiles (403)', async () => {
    const employeeToken = await createToken(STAFF_EMPLOYEE.firebase_uid, STAFF_EMPLOYEE.email);

    // Employee cannot update profiles
    const resPut = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${employeeToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: 'CEO' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resPut.status, 403);

    // Employee cannot change account status
    const resPatch = await app.request(`/api/users/${STAFF_EMPLOYEE.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employeeToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 0 }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resPatch.status, 403);
  });

  // 15. Manager privilege escalation prevention
  it('15. Manager cannot promote employee to MANAGER role (403)', async () => {
    const managerToken = await createToken(STAFF_MANAGER.firebase_uid, STAFF_MANAGER.email);

    const resPromote = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${managerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'MANAGER' }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resPromote.status, 403);
  });

  // 16. Database and input validation error handling
  it('16. Malformed JSON returns 400 without crashing', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    const endpoints = [
      { method: 'POST', path: '/api/users' },
      { method: 'PUT', path: `/api/users/${STAFF_EMPLOYEE.id}` },
      { method: 'PATCH', path: `/api/users/${STAFF_EMPLOYEE.id}/status` },
    ];

    for (const ep of endpoints) {
      const res = await app.request(ep.path, {
        method: ep.method,
        headers: { Authorization: `Bearer ${superAdminToken}`, 'Content-Type': 'application/json' },
        body: '{ malformed json: ...',
      }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.code, 'INVALID_JSON');
    }
  });

  // 17. JIT Profile Linking: Pre-seeded staff member with unlinked or updated Firebase UID resolves by verified email
  it('17. Pre-seeded staff profile with unlinked Firebase UID auto-links on verified email authentication', async () => {
    const SEEDED_USER = {
      id: 'usr_jit_test_001',
      firebase_uid: 'seed_placeholder_uid_001',
      email: 'staff.jit@cooltechuae.com',
      full_name: 'Test JIT Staff',
      role: 'MANAGER',
      position: 'Sales Manager',
      department: 'Sales',
      is_active: 1,
    };
    db.sqlite.prepare(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      SEEDED_USER.id,
      SEEDED_USER.firebase_uid,
      SEEDED_USER.email,
      SEEDED_USER.full_name,
      SEEDED_USER.role,
      SEEDED_USER.position,
      SEEDED_USER.department,
      'team_sales',
      null,
      SEEDED_USER.is_active
    );

    const realFirebaseUid = 'actual_firebase_uid_test_999';
    const token = await createToken(realFirebaseUid, 'staff.jit@cooltechuae.com');

    const resMe = await app.request('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resMe.status, 200);
    const bodyMe = await resMe.json();
    assert.equal(bodyMe.success, true);
    assert.equal(bodyMe.user.id, SEEDED_USER.id);
    assert.equal(bodyMe.user.role, 'MANAGER');
    assert.equal(bodyMe.user.position, 'Sales Manager');

    const updated = db.sqlite.prepare('SELECT firebase_uid FROM users WHERE id = ?').get(SEEDED_USER.id);
    assert.equal(updated.firebase_uid, realFirebaseUid);

    const resUsers = await app.request('/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resUsers.status, 200);
  });

  // 18. Unregistered Firebase email is rejected with 403 PROFILE_NOT_FOUND
  it('18. Authenticated user without matching Firebase UID or pre-registered email returns 403 PROFILE_NOT_FOUND', async () => {
    const unregisteredToken = await createToken('uid_unregistered_999', 'unknown@gmail.com');

    const res = await app.request('/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${unregisteredToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'PROFILE_NOT_FOUND');
  });

  // 19. POST /api/users persists staff profile directly into D1 with matching firebase_uid and fields
  it('19. POST /api/users permanently persists staff profile into D1 and can be immediately fetched by ID', async () => {
    const rootToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);
    const newStaff = {
      firebase_uid: 'uid_persisted_emp_888',
      email: 'persisted.employee@cooltechuae.com',
      full_name: 'Persisted Employee',
      role: 'EMPLOYEE',
      position: 'Field Engineer',
      department: 'Operations',
      team_id: 'team_ops_01',
      reports_to: ROOT_SUPERADMIN.id,
      is_active: 1,
    };

    const resCreate = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rootToken}`,
      },
      body: JSON.stringify(newStaff),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resCreate.status, 201);
    const bodyCreate = await resCreate.json();
    assert.equal(bodyCreate.success, true);
    assert.equal(bodyCreate.user.email, newStaff.email);
    assert.equal(bodyCreate.user.firebase_uid, newStaff.firebase_uid);
    assert.equal(bodyCreate.user.role, 'EMPLOYEE');
    const createdId = bodyCreate.user.id;

    // Direct SQLite D1 persistence verification
    const d1Record = db.sqlite.prepare('SELECT * FROM users WHERE id = ?').get(createdId);
    assert.ok(d1Record, 'User must exist in SQLite/D1 database');
    assert.equal(d1Record.firebase_uid, newStaff.firebase_uid);
    assert.equal(d1Record.email, newStaff.email);
    assert.equal(d1Record.full_name, newStaff.full_name);
    assert.equal(d1Record.role, 'EMPLOYEE');
    assert.equal(d1Record.is_active, 1);

    // API GET /api/users/:id retrieval verification
    const resGet = await app.request(`/api/users/${createdId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${rootToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resGet.status, 200);
    const bodyGet = await resGet.json();
    assert.equal(bodyGet.success, true);
    assert.equal(bodyGet.user.id, createdId);
    assert.equal(bodyGet.user.email, newStaff.email);
    assert.equal(bodyGet.user.firebase_uid, newStaff.firebase_uid);
  });

  // 20. POST /api/users without authentication token returns 401 and prevents D1 write
  it('20. POST /api/users rejects unauthenticated requests with 401 UNAUTHORIZED without writing to D1', async () => {
    const unauthPayload = {
      firebase_uid: 'uid_unauth_attempt_999',
      email: 'unauth.user@cooltechuae.com',
      full_name: 'Unauth User',
      role: 'EMPLOYEE',
    };

    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unauthPayload),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 401);
    const d1Check = db.sqlite.prepare('SELECT * FROM users WHERE email = ?').get(unauthPayload.email);
    assert.equal(d1Check, undefined, 'No D1 row should be inserted without authentication');
  });

  // 21. POST /api/users by user lacking D1 profile returns 403 PROFILE_NOT_FOUND
  it('21. POST /api/users by authenticated Firebase user lacking D1 profile returns 403 PROFILE_NOT_FOUND', async () => {
    const orphanToken = await createToken('uid_orphan_firebase_user_777', 'orphan@gmail.com');
    const attemptPayload = {
      firebase_uid: 'uid_new_staff_777',
      email: 'newstaff@cooltechuae.com',
      full_name: 'New Staff',
      role: 'EMPLOYEE',
    };

    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orphanToken}`,
      },
      body: JSON.stringify(attemptPayload),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'PROFILE_NOT_FOUND');
    const d1Check = db.sqlite.prepare('SELECT * FROM users WHERE email = ?').get(attemptPayload.email);
    assert.equal(d1Check, undefined, 'No D1 row should be inserted by unauthorized orphan user');
  });

  // 22. PUT /api/users/:id updates email and enforces uniqueness check
  it('22. PUT /api/users/:id updates email and enforces uniqueness check (409 on duplicate)', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    // 1. Successfully update email
    const resUpdate = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        email: 'shaheer_updated@cooltechuae.com',
        full_name: 'Shaheer Updated',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resUpdate.status, 200);
    const bodyUpdate = await resUpdate.json();
    assert.equal(bodyUpdate.success, true);
    assert.equal(bodyUpdate.user.email, 'shaheer_updated@cooltechuae.com');

    // 2. Reject duplicate email update (409 Conflict)
    const resDuplicate = await app.request(`/api/users/${STAFF_EMPLOYEE.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        email: STAFF_ADMIN.email, // already in use
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(resDuplicate.status, 409);
    const bodyDuplicate = await resDuplicate.json();
    assert.equal(bodyDuplicate.code, 'EMAIL_ALREADY_EXISTS');
  });

  // 23. Last-Super-Admin Demotion Protection
  it('23. PUT /api/users/:id blocks demoting the last active Super Admin (400)', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    const res = await app.request(`/api/users/${ROOT_SUPERADMIN.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        role: 'EMPLOYEE',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
    assert.match(body.message, /Cannot demote the last active Super Admin/i);
  });

  // 24. Last-Super-Admin Deactivation Protection
  it('24. PATCH /api/users/:id/status blocks deactivating the last active Super Admin (400)', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);

    const res = await app.request(`/api/users/${ROOT_SUPERADMIN.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        is_active: 0,
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
  });

  // 25. DELETE /api/users/:id safely deletes staff and protects Super Admin from deletion
  it('25. DELETE /api/users/:id safely deletes staff and protects Super Admin from deletion', async () => {
    const superAdminToken = await createToken(ROOT_SUPERADMIN.firebase_uid, ROOT_SUPERADMIN.email);
    const adminToken = await createToken(STAFF_ADMIN.firebase_uid, STAFF_ADMIN.email);
    const empToken = await createToken(STAFF_EMPLOYEE.firebase_uid, STAFF_EMPLOYEE.email);

    // 1. Employee cannot delete staff (403)
    const resEmp = await app.request(`/api/users/${OUTSIDE_EMPLOYEE.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${empToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resEmp.status, 403);

    // 2. Admin cannot delete Super Admin (403)
    const resAdminDeleteSuper = await app.request(`/api/users/${ROOT_SUPERADMIN.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resAdminDeleteSuper.status, 403);

    // 3. Cannot delete the last active Super Admin (400)
    const resSuperDeleteSelf = await app.request(`/api/users/${ROOT_SUPERADMIN.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resSuperDeleteSelf.status, 400);

    // 4. Super Admin can delete standard staff
    const resSuccess = await app.request(`/api/users/${OUTSIDE_EMPLOYEE.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resSuccess.status, 200);
    const bodySuccess = await resSuccess.json();
    assert.equal(bodySuccess.success, true);

    // Verify row removed from D1
    const checkDeleted = db.sqlite.prepare('SELECT id FROM users WHERE id = ?').get(OUTSIDE_EMPLOYEE.id);
    assert.equal(checkDeleted, undefined);
  });
});
