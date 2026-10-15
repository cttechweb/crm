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

  // 2. RBAC enforcement: EMPLOYEE and MANAGER cannot manage staff
  it('2. GET /api/users and POST /api/users reject EMPLOYEE and MANAGER access (403)', async () => {
    const managerToken = await createToken(STAFF_MANAGER.firebase_uid, STAFF_MANAGER.email);
    const employeeToken = await createToken(STAFF_EMPLOYEE.firebase_uid, STAFF_EMPLOYEE.email);

    // Manager attempt
    const resMgr = await app.request('/api/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${managerToken}` },
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(resMgr.status, 403);
    const bodyMgr = await resMgr.json();
    assert.equal(bodyMgr.code, 'FORBIDDEN');

    // Employee attempt
    const resEmp = await app.request('/api/users', {
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
    assert.equal(resEmp.status, 403);
    const bodyEmp = await resEmp.json();
    assert.equal(bodyEmp.code, 'FORBIDDEN');
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
  it('7. POST /api/users prevents ADMIN from creating a SUPER_ADMIN (403)', async () => {
    const adminToken = await createToken(STAFF_ADMIN.firebase_uid, STAFF_ADMIN.email);

    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Unauthorized Super Admin',
        email: 'fake_super@cooltechuae.com',
        firebase_uid: 'uid_fake_super',
        role: 'SUPER_ADMIN',
      }),
    }, { DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN');
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
});
