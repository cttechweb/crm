/**
 * Automated Test Suite for Customer API (cool-tech-crm-api)
 * 
 * Tests:
 * 1. Authentication enforcement on all customer endpoints (401 without valid token)
 * 2. Input validation on POST (required fields, invalid status/type values)
 * 3. Full CRUD operations by Super Admin (Create, Read, Update, List with pagination/search)
 * 4. Soft deletion enforcement (is_deleted = 1, deleted_at, deleted_by_id, excluded from regular queries)
 * 5. RBAC enforcement:
 *    - Employee can only see own records
 *    - Employee cannot access another user's record by guessing ID (403)
 *    - Employee cannot delete customers (403)
 *    - Employee cannot reassign owner_id to another user
 *    - Manager can access team records, cannot access outside records (403)
 *    - Manager cannot delete customers (403)
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

  // Load migration 0002
  const migrationPath = path.resolve(__dirname, '../migrations/0002_create_customers.sql');
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

describe('Customer API Test Suite', () => {
  let validKeyPair;
  let validKeyId = 'google-test-customer-key-1';
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
      ('usr_emp_2', 'fb_uid_emp2', 'emp2@cooltech.ae', 'Other Employee Jane', 'EMPLOYEE', 'Purchasing', NULL, 1);
    `);
  });

  async function createToken(firebaseUid) {
    return await new SignJWT({ email: 'user@test.ae' })
      .setProtectedHeader({ alg: 'RS256', kid: validKeyId })
      .setSubject(firebaseUid)
      .setAudience(PROJECT_ID)
      .setIssuer(ISSUER)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(validKeyPair.privateKey);
  }

  // ==========================================================================
  // 1. Authentication Enforcement
  // ==========================================================================
  it('1. All customer endpoints reject requests without token (401)', async () => {
    const endpoints = [
      { method: 'GET', path: '/api/customers' },
      { method: 'POST', path: '/api/customers' },
      { method: 'GET', path: '/api/customers/cust_test' },
      { method: 'PUT', path: '/api/customers/cust_test' },
      { method: 'DELETE', path: '/api/customers/cust_test' },
    ];

    for (const ep of endpoints) {
      const res = await app.request(ep.path, { method: ep.method }, { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID });
      assert.equal(res.status, 401, `Expected 401 for ${ep.method} ${ep.path}`);
    }
  });

  // ==========================================================================
  // 2. Input Validation
  // ==========================================================================
  it('2. POST /api/customers rejects missing required fields and invalid status/type (400)', async () => {
    const adminToken = await createToken('fb_uid_admin');

    // Missing customer_name
    let res = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ contact_person: 'John', phone: '+971 50 123 4567' }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 400);

    // Missing phone
    res = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ customer_name: 'Acme Corp', contact_person: 'John' }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 400);

    // Invalid status
    res = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          customer_name: 'Acme Corp',
          contact_person: 'John',
          phone: '+971 50 123 4567',
          status: 'InvalidStatus',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 400);

    // Invalid type
    res = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          customer_name: 'Acme Corp',
          contact_person: 'John',
          phone: '+971 50 123 4567',
          type: 'InvalidType',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 400);
  });

  // ==========================================================================
  // 3. CRUD Operations & Search/Pagination (Super Admin)
  // ==========================================================================
  it('3. Full CRUD operations work with search, pagination and filtering', async () => {
    const adminToken = await createToken('fb_uid_admin');

    // Create Customer
    const createRes = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          customer_name: 'Emaar Properties PJSC',
          contact_person: 'Mohamed Alabbar',
          email: 'info@emaar.ae',
          phone: '+971 4 367 3333',
          city: 'Dubai',
          status: 'Active',
          type: 'Customer',
          key_customer: 1,
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(createRes.status, 201);
    const createdBody = await createRes.json();
    assert.equal(createdBody.success, true);
    assert.equal(createdBody.customer.customer_name, 'EMAAR PROPERTIES PJSC');
    assert.equal(createdBody.customer.sl_no, 1);
    assert.equal(createdBody.customer.created_by_id, 'usr_admin_1');
    const customerId = createdBody.customer.id;

    // Get Single Customer
    const getRes = await app.request(
      `/api/customers/${customerId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.customer.id, customerId);
    assert.ok(Array.isArray(getBody.customer.contacts));

    // Update Customer
    const updateRes = await app.request(
      `/api/customers/${customerId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          company_name: 'Emaar Hospitality Group',
          total_spend: 250000,
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.equal(updateBody.customer.company_name, 'Emaar Hospitality Group');
    assert.equal(updateBody.customer.total_spend, 250000);

    // List Customers & Search
    const listRes = await app.request(
      '/api/customers?q=Emaar',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.customers.length, 1);
    assert.equal(listBody.pagination.total, 1);
    assert.equal(listBody.pagination.page, 1);
  });

  // ==========================================================================
  // 4. Soft Deletion
  // ==========================================================================
  it('4. DELETE performs soft-delete (is_deleted = 1), excludes record from ordinary queries', async () => {
    const adminToken = await createToken('fb_uid_admin');

    // Create a customer
    const createRes = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          customer_name: 'Damac Hills',
          contact_person: 'Hussain Sajwani',
          phone: '+971 4 373 1000',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const { customer } = await createRes.json();

    // Delete customer
    const delRes = await app.request(
      `/api/customers/${customer.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(delRes.status, 200);

    // Verify raw DB record still exists and has is_deleted = 1
    const rawRecord = mockDb.sqlite
      .prepare('SELECT id, is_deleted, deleted_at, deleted_by_id FROM customers WHERE id = ?')
      .get(customer.id);
    assert.ok(rawRecord);
    assert.equal(rawRecord.is_deleted, 1);
    assert.ok(rawRecord.deleted_at);
    assert.equal(rawRecord.deleted_by_id, 'usr_admin_1');

    // GET /api/customers should now return 0 records
    const listRes = await app.request(
      '/api/customers',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const listBody = await listRes.json();
    assert.equal(listBody.customers.length, 0);

    // GET /api/customers/:id should return 404
    const getRes = await app.request(
      `/api/customers/${customer.id}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(getRes.status, 404);
  });

  // ==========================================================================
  // 5. Role-Based Access Control (RBAC)
  // ==========================================================================
  it('5. RBAC rules are enforced for Employees and Managers', async () => {
    const emp1Token = await createToken('fb_uid_emp1'); // Arun (reports to Shibil)
    const emp2Token = await createToken('fb_uid_emp2'); // Jane (different department)
    const mgrToken = await createToken('fb_uid_mgr');   // Shibil (Manager of Arun)

    // Employee 1 creates a customer -> forced ownership to emp1
    const emp1CreateRes = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emp1Token}` },
        body: JSON.stringify({
          customer_name: 'Arun Client LLC',
          contact_person: 'Client Contact',
          phone: '+971 50 111 2222',
          owner_id: 'usr_admin_1', // Attempted bypass: should be overridden to usr_emp_1
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(emp1CreateRes.status, 201);
    const { customer: emp1Cust } = await emp1CreateRes.json();
    assert.equal(emp1Cust.owner_id, 'usr_emp_1', 'Employee ownership must never trust request body');
    assert.equal(emp1Cust.created_by_id, 'usr_emp_1');

    // Employee 2 creates their own customer
    const emp2CreateRes = await app.request(
      '/api/customers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emp2Token}` },
        body: JSON.stringify({
          customer_name: 'Jane Client LLC',
          contact_person: 'Jane Contact',
          phone: '+971 50 333 4444',
        }),
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const { customer: emp2Cust } = await emp2CreateRes.json();

    // A. Employee 1 lists customers -> only sees Arun Client LLC (not Jane Client)
    const emp1ListRes = await app.request(
      '/api/customers',
      { method: 'GET', headers: { Authorization: `Bearer ${emp1Token}` } },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const emp1List = await emp1ListRes.json();
    assert.equal(emp1List.customers.length, 1);
    assert.equal(emp1List.customers[0].id, emp1Cust.id);

    // B. Employee 1 attempts to access Employee 2's customer by ID -> 403 Forbidden
    const guessRes = await app.request(
      `/api/customers/${emp2Cust.id}`,
      { method: 'GET', headers: { Authorization: `Bearer ${emp1Token}` } },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(guessRes.status, 403, 'Employee must not be able to guess another user customer ID');

    // C. Employee 1 attempts to delete customer -> 403 Forbidden
    const empDelRes = await app.request(
      `/api/customers/${emp1Cust.id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${emp1Token}` } },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(empDelRes.status, 403, 'Employees must not be permitted to delete customers');

    // D. Manager lists customers -> sees Arun Client LLC (direct report) but NOT Jane Client (different dept)
    const mgrListRes = await app.request(
      '/api/customers',
      { method: 'GET', headers: { Authorization: `Bearer ${mgrToken}` } },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    const mgrList = await mgrListRes.json();
    assert.equal(mgrList.customers.length, 1);
    assert.equal(mgrList.customers[0].id, emp1Cust.id);

    // E. Manager attempts to delete customer -> 403 Forbidden (Only Super Admin/Admin can delete)
    const mgrDelRes = await app.request(
      `/api/customers/${emp1Cust.id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${mgrToken}` } },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(mgrDelRes.status, 403, 'Managers must not be permitted to delete customers');
  });
});
