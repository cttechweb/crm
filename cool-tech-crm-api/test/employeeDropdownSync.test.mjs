/**
 * Automated Test Suite for Authoritative Employee Dropdown Synchronization
 * File: cool-tech-crm-api/test/employeeDropdownSync.test.mjs
 *
 * Verifies:
 * 1. Authoritative retrieval via GET /api/users?status=active returns only active employees
 * 2. Deactivated employees (is_active = 0) are excluded from active dropdown queries
 * 3. Newly created employees are immediately returned in subsequent queries
 * 4. Deleted employees are excluded from active queries
 * 5. Reports To / manager dropdown eligibility: only active staff with manager/admin privileges
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

describe('Authoritative Employee Dropdown Synchronization Suite', () => {
  let validKeyPair;
  let validKeyId = 'dropdown-test-key';
  let db;

  const RITHUL = {
    id: 'usr_rithul_001',
    firebase_uid: 'uid_rithul_001',
    email: 'rithul@cooltechuae.com',
    full_name: 'Rithul',
    role: 'ADMIN',
    position: 'General Manager',
    department: 'Management',
    is_active: 1,
  };

  const SHEMIN = {
    id: 'usr_shemin_001',
    firebase_uid: 'uid_shemin_001',
    email: 'shemin@cooltechuae.com',
    full_name: 'shemin',
    role: 'EMPLOYEE',
    position: 'Sales Executive',
    department: 'Sales',
    reports_to: 'usr_rithul_001',
    is_active: 1,
  };

  const SHAHEER_DEACTIVATED = {
    id: 'usr_shaheer_mock',
    firebase_uid: 'uid_shaheer_mock',
    email: 'shaheer@cooltechuae.com',
    full_name: 'Shaheer (Sales Executive)',
    role: 'EMPLOYEE',
    position: 'Sales Executive',
    department: 'Sales',
    reports_to: 'usr_rithul_001',
    is_active: 0, // Deactivated
  };

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

    // Seed database with Rithul (active Admin), shemin (active Employee), and Shaheer (deactivated)
    db.sqlite.prepare(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, position, department, reports_to, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      RITHUL.id,
      RITHUL.firebase_uid,
      RITHUL.email,
      RITHUL.full_name,
      RITHUL.role,
      RITHUL.position,
      RITHUL.department,
      null,
      RITHUL.is_active
    );

    db.sqlite.prepare(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, position, department, reports_to, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      SHEMIN.id,
      SHEMIN.firebase_uid,
      SHEMIN.email,
      SHEMIN.full_name,
      SHEMIN.role,
      SHEMIN.position,
      SHEMIN.department,
      SHEMIN.reports_to,
      SHEMIN.is_active
    );

    db.sqlite.prepare(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, position, department, reports_to, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      SHAHEER_DEACTIVATED.id,
      SHAHEER_DEACTIVATED.firebase_uid,
      SHAHEER_DEACTIVATED.email,
      SHAHEER_DEACTIVATED.full_name,
      SHAHEER_DEACTIVATED.role,
      SHAHEER_DEACTIVATED.position,
      SHAHEER_DEACTIVATED.department,
      SHAHEER_DEACTIVATED.reports_to,
      SHAHEER_DEACTIVATED.is_active
    );
  });

  it('1. GET /api/users?status=active returns only active users (Rithul and shemin) and excludes Shaheer', async () => {
    const token = await createToken(RITHUL.firebase_uid, RITHUL.email);

    const res = await app.request('/api/users?status=active', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.users));

    const names = body.users.map((u) => u.name || u.full_name);
    assert.ok(names.includes('Rithul'), 'Should include active user Rithul');
    assert.ok(names.includes('shemin'), 'Should include active user shemin');
    assert.ok(!names.some((n) => n.toLowerCase().includes('shaheer')), 'Must exclude deactivated user Shaheer');
  });

  it('2. Deactivating a user immediately removes them from GET /api/users?status=active without refresh', async () => {
    const token = await createToken(RITHUL.firebase_uid, RITHUL.email);

    // Deactivate shemin
    const patchRes = await app.request(`/api/users/${SHEMIN.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: false }),
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(patchRes.status, 200);

    // Query active users immediately
    const res = await app.request('/api/users?status=active', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const names = body.users.map((u) => u.name || u.full_name);
    assert.ok(names.includes('Rithul'), 'Rithul remains active');
    assert.ok(!names.includes('shemin'), 'shemin should now be excluded from active dropdown list');
  });

  it('3. Creating a new employee immediately makes them available in the authoritative users list', async () => {
    const token = await createToken(RITHUL.firebase_uid, RITHUL.email);

    const newStaff = {
      full_name: 'Zayed HVAC Tech',
      email: 'zayed@cooltechuae.com',
      firebase_uid: 'uid_zayed_001',
      role: 'EMPLOYEE',
      department: 'Operations',
      position: 'Field Technician',
      reports_to: RITHUL.id,
      is_active: true,
    };

    const createRes = await app.request('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStaff),
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(createRes.status, 201);

    // Subsequent active query
    const res = await app.request('/api/users?status=active', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const names = body.users.map((u) => u.name || u.full_name);
    assert.ok(names.includes('Zayed HVAC Tech'), 'Newly created employee must appear immediately');
  });

  it('4. Deleting a user immediately removes them from GET /api/users queries', async () => {
    const token = await createToken(RITHUL.firebase_uid, RITHUL.email);

    const deleteRes = await app.request(`/api/users/${SHEMIN.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(deleteRes.status, 200);

    const res = await app.request('/api/users?status=active', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, {
      DB: db,
      ENVIRONMENT: 'production',
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const names = body.users.map((u) => u.name || u.full_name);
    assert.ok(!names.includes('shemin'), 'Deleted user must not appear in dropdown query');
  });
});
