/**
 * Automated Test Suite for Retailer Application Query Endpoints (cool-tech-crm-api)
 * 
 * Tests:
 * 1. Authentication enforcement on GET /api/retailer-applications (401 without token)
 * 2. Successful listing of applications with pagination and total counts
 * 3. Status filtering ('pending', 'approved', 'rejected', 'all')
 * 4. Keyword search across company name, contact person, email, license number
 * 5. GET /api/retailer-applications/:id retrieval (200 with details, 404 for non-existent)
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

let privateKey;
let publicKey;

async function setupTestJWKS() {
  const keyPair = await generateKeyPair('RS256', { extractable: true });
  privateKey = keyPair.privateKey;
  publicKey = keyPair.publicKey;

  const validKeyId = 'test-key-id-query-2026';

  const mockJWKS = async (protectedHeader) => {
    if (protectedHeader?.kid === validKeyId) {
      return publicKey;
    }
    throw new Error('Key ID not found in JWKS');
  };

  setCustomJWKS(mockJWKS);
}

async function createStaffToken(uid, email = 'admin@cooltech.ae') {
  return new SignJWT({
    email,
    email_verified: true,
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key-id-query-2026' })
    .setIssuer(ISSUER)
    .setAudience(PROJECT_ID)
    .setSubject(uid)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(privateKey);
}

function createTestDatabase() {
  const sqlite = new DatabaseSync(':memory:');

  // Create users table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    position TEXT,
    department TEXT,
    team_id TEXT,
    reports_to TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);

  // Insert test staff user
  sqlite.exec(`INSERT INTO users (id, firebase_uid, email, full_name, role, is_active)
    VALUES ('staff_001', 'fb_staff_001', 'admin@cooltech.ae', 'Chief Executive Officer', 'ADMIN', 1);`);

  // Baseline customers table for foreign key reference
  sqlite.exec(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);

  // Run migration 0013
  const migrationPath = path.resolve(__dirname, '../migrations/0013_add_retailer_applications.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  sqlite.exec(migrationSql);

  // Seed sample applications
  sqlite.exec(`
    INSERT INTO retailer_applications (
      id, website_application_id, website_user_id, company_name, trade_license_number,
      contact_person, designation, email, phone, emirate, city, status, created_at, trade_license_url
    ) VALUES 
    ('APP-2026-001', 'APP-2026-001', 'usr_001', 'Al Sahel Contracting LLC', 'TL-1001', 'Rashid Al Nuaimi', 'Director', 'rashid@alsahel.ae', '+971501111111', 'Abu Dhabi', 'Abu Dhabi', 'pending', '2026-11-20 09:00:00', 'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/license_1.pdf'),
    ('APP-2026-002', 'APP-2026-002', 'usr_002', 'Emirates Cool Solutions', 'TL-1002', 'Farooq Ahmed', 'Procurement Head', 'farooq@emcool.ae', '+971502222222', 'Dubai', 'Dubai', 'pending', '2026-11-21 11:30:00', 'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/license_2.pdf'),
    ('APP-2026-003', 'APP-2026-003', 'usr_003', 'Apex Climate MEP', 'TL-1003', 'Sunil Kumar', 'Project Manager', 'sunil@apexclimate.com', '+971503333333', 'Sharjah', 'Sharjah', 'approved', '2026-11-22 14:15:00', NULL),
    ('APP-2026-004', 'APP-2026-004', 'usr_004', 'Falcon Chillers Trading', 'TL-1004', 'Omar Al Sayed', 'Partner', 'omar@falconchillers.ae', '+971504444444', 'Ajman', 'Ajman', 'rejected', '2026-11-23 16:45:00', NULL);
  `);

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

describe('CRM Retailer Applications Query Endpoints', () => {
  let mockDb;
  let mockEnv;
  let authToken;

  before(async () => {
    await setupTestJWKS();
    authToken = await createStaffToken('fb_staff_001');
  });

  beforeEach(() => {
    mockDb = createTestDatabase();
    mockEnv = {
      DB: mockDb,
      FIREBASE_PROJECT_ID: PROJECT_ID,
    };
  });

  it('1. GET /api/retailer-applications returns 401 without auth token', async () => {
    const req = new Request('http://localhost/api/retailer-applications');
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 401);
  });

  it('2. GET /api/retailer-applications returns list and total counts with valid token', async () => {
    const req = new Request('http://localhost/api/retailer-applications', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.applications.length, 4);
    assert.equal(body.pagination.total, 4);
    assert.equal(body.pagination.page, 1);
  });

  it('3. Filters by status=pending correctly', async () => {
    const req = new Request('http://localhost/api/retailer-applications?status=pending', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.applications.length, 2);
    body.applications.forEach((app) => {
      assert.equal(app.status, 'pending');
    });
  });

  it('4. Filters by keyword search (company or contact person)', async () => {
    const req = new Request('http://localhost/api/retailer-applications?search=Sahel', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.applications.length, 1);
    assert.equal(body.applications[0].companyName, 'Al Sahel Contracting LLC');
    assert.equal(body.applications[0].contactPerson, 'Rashid Al Nuaimi');
  });

  it('5. Supports pagination parameters (limit and page)', async () => {
    const req = new Request('http://localhost/api/retailer-applications?limit=2&page=1', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.applications.length, 2);
    assert.equal(body.pagination.total, 4);
    assert.equal(body.pagination.totalPages, 2);
  });

  it('6. GET /api/retailer-applications/:id returns 404 for unknown ID', async () => {
    const req = new Request('http://localhost/api/retailer-applications/NON_EXISTENT', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 404);
  });

  it('7. GET /api/retailer-applications/:id returns full detail for valid application', async () => {
    const req = new Request('http://localhost/api/retailer-applications/APP-2026-001', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.application.id, 'APP-2026-001');
    assert.equal(body.application.companyName, 'Al Sahel Contracting LLC');
    assert.equal(body.application.tradeLicenseNumber, 'TL-1001');
    assert.equal(body.application.hasTradeLicense, true);
    assert.equal(
      body.application.tradeLicenseUrl,
      'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/license_1.pdf'
    );
  });
});
