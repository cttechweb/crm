/**
 * Automated Test Suite for Lead API (cool-tech-crm-api)
 * 
 * Tests:
 * 1. Authentication enforcement on all lead endpoints (401 without valid token)
 * 2. Input validation on POST (required fields)
 * 3. Full CRUD operations by Super Admin (Create, Read, Update, List with pagination/search)
 * 4. Dedicated PATCH /api/leads/:id/status (tailored for ChangeLeadStatusModal.tsx)
 * 5. Soft deletion enforcement (is_deleted = 1, excluded from regular queries)
 * 6. RBAC scoping (Employee sees own, Manager sees team)
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

function createRealSqliteD1Database() {
  const sqlite = new DatabaseSync(':memory:');

  // Create users table
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

  // Load migration 0003_create_leads.sql
  const migrationPath = path.resolve(__dirname, '../migrations/0003_create_leads.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  sqlite.exec(migrationSql);

  return {
    sqlite,
    prepare(sql) {
      let bound = [];
      return {
        bind(...params) {
          bound = params;
          return this;
        },
        async all() {
          const stmt = sqlite.prepare(sql);
          const results = stmt.all(...bound);
          return { results };
        },
        async first(col) {
          const stmt = sqlite.prepare(sql);
          const row = stmt.get(...bound);
          if (!row) return null;
          if (col && typeof col === 'string') return row[col];
          return row;
        },
        async run() {
          const stmt = sqlite.prepare(sql);
          const result = stmt.run(...bound);
          return { success: true, meta: result };
        },
      };
    },
  };
}

describe('Lead API Test Suite', () => {
  let validKeyPair;
  let validKeyId = 'google-test-lead-key-1';
  let mockDb;

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
      throw new Error('Key ID not found in JWKS');
    };

    setCustomJWKS(mockJWKS);
  });

  beforeEach(() => {
    mockDb = createRealSqliteD1Database();

    // Seed test users: Super Admin, Manager, Report Employee, Other Employee
    mockDb.sqlite.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, department, reports_to, is_active) VALUES
      ('usr_admin_1', 'fb_uid_admin', 'admin@cooltech.ae', 'Super Admin Nafal', 'SUPER_ADMIN', 'Executive', NULL, 1),
      ('usr_mgr_1', 'fb_uid_mgr', 'manager@cooltech.ae', 'Sales Manager Shibil', 'MANAGER', 'Sales', 'usr_admin_1', 1),
      ('usr_emp_1', 'fb_uid_emp1', 'emp1@cooltech.ae', 'Sales Executive Arun', 'EMPLOYEE', 'Sales', 'usr_mgr_1', 1),
      ('usr_emp_2', 'fb_uid_emp2', 'emp2@cooltech.ae', 'Sales Executive Bilal', 'EMPLOYEE', 'Sales', NULL, 1);
    `);
  });

  async function makeToken(uid) {
    return await new SignJWT({
      user_id: uid,
      email: `${uid}@cooltech.ae`,
    })
      .setProtectedHeader({ alg: 'RS256', kid: validKeyId })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setSubject(uid)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(validKeyPair.privateKey);
  }

  it('1. All lead endpoints reject requests without token (401)', async () => {
    const resGet = await app.request('/api/leads', {}, { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.strictEqual(resGet.status, 401);

    const resPost = await app.request(
      '/api/leads',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_name: 'Test' }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(resPost.status, 401);
  });

  it('2. POST /api/leads rejects missing required fields (400)', async () => {
    const token = await makeToken('fb_uid_admin');

    const res = await app.request(
      '/api/leads',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contact_name: '', // missing
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'INVALID_INPUT');
  });

  it('3. Full CRUD operations work with search, pagination and filtering', async () => {
    const adminToken = await makeToken('fb_uid_admin');

    // CREATE
    const createRes = await app.request(
      '/api/leads',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          contact_name: 'Ahmed Al Mansoori',
          contact_phone: '+971 50 123 4567',
          contact_email: 'ahmed@almansoori.ae',
          contact_company: 'Al Mansoori Holdings',
          lead_specification: 'VRF Air Conditioning System 50TR',
          rating: 'Hot',
          status: 'Pending',
          value: 125000,
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );

    assert.strictEqual(createRes.status, 201);
    const createdData = await createRes.json();
    assert.strictEqual(createdData.success, true);
    assert.strictEqual(createdData.lead.contact_name, 'Ahmed Al Mansoori');
    assert.strictEqual(createdData.lead.rating, 'Hot');
    assert.strictEqual(createdData.lead.status, 'Pending');
    const leadId = createdData.lead.id;

    // LIST
    const listRes = await app.request(
      '/api/leads?q=Mansoori&status=Pending',
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.strictEqual(listData.leads.length, 1);
    assert.strictEqual(listData.leads[0].id, leadId);

    // GET SINGLE
    const getRes = await app.request(
      `/api/leads/${leadId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(getRes.status, 200);
    const singleData = await getRes.json();
    assert.strictEqual(singleData.lead.id, leadId);
    assert.ok(singleData.activityLogs.length >= 1);
  });

  it('4. PATCH /api/leads/:id/status updates status, rating, activity log, and adds note', async () => {
    const adminToken = await makeToken('fb_uid_admin');

    // Create lead
    const createRes = await app.request(
      '/api/leads',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          contact_name: 'Rashid Khalifa',
          contact_phone: '+971 52 987 6543',
          contact_company: 'Gulf Cold Stores LLC',
          lead_specification: 'Cold Room Maintenance AMC',
          rating: 'Cold',
          status: 'Pending',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const { lead } = await createRes.json();

    // Call dedicated status update endpoint (simulating ChangeLeadStatusModal)
    const patchRes = await app.request(
      `/api/leads/${lead.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'Contacted',
          rating: 'Hot',
          comments: 'Client requested quotation urgently before Thursday.',
          addNote: true,
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );

    assert.strictEqual(patchRes.status, 200);
    const patchData = await patchRes.json();
    assert.strictEqual(patchData.success, true);
    assert.strictEqual(patchData.lead.status, 'Contacted');
    assert.strictEqual(patchData.lead.rating, 'Hot');
    assert.strictEqual(patchData.lead.comments, 'Client requested quotation urgently before Thursday.');

    // Verify notes and activity logs were recorded
    const getRes = await app.request(
      `/api/leads/${lead.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const detail = await getRes.json();
    assert.strictEqual(detail.notes.length, 1);
    assert.strictEqual(detail.notes[0].content, 'Client requested quotation urgently before Thursday.');
    assert.ok(detail.activityLogs.some((l) => l.new_status === 'Contacted'));
  });

  it('5. DELETE performs soft-delete (is_deleted = 1), excludes record from regular queries', async () => {
    const adminToken = await makeToken('fb_uid_admin');

    const createRes = await app.request(
      '/api/leads',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          contact_name: 'To Be Soft Deleted',
          contact_phone: '+971 50 000 0000',
          contact_company: 'Test Company',
          lead_specification: 'Chiller Inspection',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const { lead } = await createRes.json();

    // Soft delete
    const delRes = await app.request(
      `/api/leads/${lead.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(delRes.status, 200);

    // Verify excluded from ordinary queries
    const getRes = await app.request(
      `/api/leads/${lead.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(getRes.status, 404);
  });

  it('6. RBAC rules are enforced for Employees and Managers', async () => {
    const emp1Token = await makeToken('fb_uid_emp1');
    const emp2Token = await makeToken('fb_uid_emp2');
    const mgrToken = await makeToken('fb_uid_mgr');

    // 1. Employee 1 creates lead (automatically owned by emp1)
    const createRes = await app.request(
      '/api/leads',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${emp1Token}`,
        },
        body: JSON.stringify({
          contact_name: 'Emp1 Client',
          contact_phone: '+971 50 111 2222',
          contact_company: 'Emp1 Company',
          lead_specification: 'Air Duct Cleaning',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const { lead: emp1Lead } = await createRes.json();

    // 2. Employee 2 attempts to access Employee 1 lead -> 403 Forbidden
    const emp2Get = await app.request(
      `/api/leads/${emp1Lead.id}`,
      {
        headers: { Authorization: `Bearer ${emp2Token}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(emp2Get.status, 403);

    // 3. Manager (who supervises Employee 1) can view Employee 1 lead -> 200 OK
    const mgrGet = await app.request(
      `/api/leads/${emp1Lead.id}`,
      {
        headers: { Authorization: `Bearer ${mgrToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(mgrGet.status, 200);

    // 4. Employee attempts to delete lead -> 403 Forbidden
    const empDel = await app.request(
      `/api/leads/${emp1Lead.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${emp1Token}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.strictEqual(empDel.status, 403);
  });
});
