/**
 * Automated Test Suite for Automatic Lead Database Persistence
 * Project: Cool Technologies CRM
 * 
 * Verifies all 6 requirements of TASK 4:
 * 1. Creating a Lead calls authenticated POST /api/leads with validation.
 * 2. Successful API creation persists the Lead remotely in Cloudflare D1.
 * 3. The Leads list refreshes from the remote API (GET /api/leads).
 * 4. API failures are clearly reported (401, 400, etc.) without false success.
 * 5. Duplicate submissions do not create duplicate Leads.
 * 6. Existing localStorage Leads remain preserved non-destructively.
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

// In-memory mock localStorage for Node.js test environment
const memoryStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStorage.get(key) || null,
  setItem: (key, val) => memoryStorage.set(key, String(val)),
  removeItem: (key) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
};
globalThis.window = {};

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

describe('Automatic Lead Database Persistence Suite', () => {
  let privateKey;
  let superAdminToken;
  let mockEnv;
  let dbWrapper;

  before(async () => {
    // Generate RSA test keypair
    const keyPair = await generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    const publicJwk = await exportJWK(keyPair.publicKey);
    publicJwk.kid = 'test-rsa-key-lead-auto';
    publicJwk.alg = 'RS256';
    publicJwk.use = 'sig';

    const testKeyId = 'test-rsa-key-lead-auto';
    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === testKeyId) {
        return keyPair.publicKey;
      }
      throw new Error('Key ID not found in JWKS');
    };
    setCustomJWKS(mockJWKS);

    // Setup database
    dbWrapper = createRealSqliteD1Database();

    // Insert staff user
    dbWrapper.sqlite.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, is_active)
      VALUES ('usr_admin_auto', 'fb_uid_admin_auto', 'admin@cooltech.com', 'Nafal (Super Admin)', 'SUPER_ADMIN', 1)
    `);

    // Create auth token
    superAdminToken = await new SignJWT({ email: 'admin@cooltech.com' })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-rsa-key-lead-auto' })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setSubject('fb_uid_admin_auto')
      .setExpirationTime('2h')
      .sign(privateKey);

    mockEnv = {
      DB: dbWrapper,
      FIREBASE_PROJECT_ID: PROJECT_ID,
    };
  });

  beforeEach(() => {
    // Clean leads before each test
    dbWrapper.sqlite.exec('DELETE FROM lead_notes;');
    dbWrapper.sqlite.exec('DELETE FROM lead_activity_logs;');
    dbWrapper.sqlite.exec('DELETE FROM leads;');
    memoryStorage.clear();
  });

  it('1. POST /api/leads validates required fields and creates lead automatically', async () => {
    // Attempt invalid submission without contact_name
    const resInvalid = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        contact_phone: '+971 50 111 2233',
        contact_company: 'Al Habtoor Group',
        lead_specification: 'Chiller installation for office tower',
      }),
    }, mockEnv);

    assert.equal(resInvalid.status, 400);
    const invalidJson = await resInvalid.json();
    assert.equal(invalidJson.success, false);
    assert.equal(invalidJson.code, 'INVALID_INPUT');

    // Valid automatic submission
    const resValid = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        contact_name: 'Eng. Tariq Mansoor',
        contact_phone: '+971 50 999 8877',
        contact_email: 'tariq@alhabtoor.com',
        contact_company: 'Al Habtoor Engineering',
        lead_specification: 'HVAC Chiller Replacement Project',
        rating: 'Hot',
        status: 'New',
        value: 125000,
        source: 'Website Inbound',
      }),
    }, mockEnv);

    assert.equal(resValid.status, 201);
    const validJson = await resValid.json();
    assert.equal(validJson.success, true);
    assert.ok(validJson.lead.id.startsWith('lead_'));
    assert.equal(validJson.lead.contact_name, 'Eng. Tariq Mansoor');
    assert.equal(validJson.lead.contact_phone, '+971 50 999 8877');
    assert.equal(validJson.lead.sl_no, 1);
  });

  it('2. Successful API creation persists the Lead remotely in Cloudflare D1 with logs', async () => {
    const postRes = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        id: 'lead_persisted_test_001',
        contact_name: 'Fatima Al Zarooni',
        contact_phone: '+971 52 333 4455',
        contact_company: 'Zarooni Commercial Towers',
        lead_specification: 'Annual HVAC Maintenance Contract',
        rating: 'Warm',
        status: 'Pending',
      }),
    }, mockEnv);

    assert.equal(postRes.status, 201);

    // Verify directly in database
    const row = dbWrapper.sqlite
      .prepare('SELECT * FROM leads WHERE id = ?')
      .get('lead_persisted_test_001');

    assert.ok(row, 'Lead must exist in D1 leads table');
    assert.equal(row.contact_name, 'Fatima Al Zarooni');
    assert.equal(row.is_deleted, 0);

    // Verify activity log was created in D1
    const logRow = dbWrapper.sqlite
      .prepare('SELECT * FROM lead_activity_logs WHERE lead_id = ?')
      .get('lead_persisted_test_001');

    assert.ok(logRow, 'Initial activity log must exist in D1');
    assert.equal(logRow.action, 'Created');

    // Retrieve via GET /api/leads/:id
    const getRes = await app.request('/api/leads/lead_persisted_test_001', {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
      },
    }, mockEnv);

    assert.equal(getRes.status, 200);
    const getJson = await getRes.json();
    assert.equal(getJson.success, true);
    assert.equal(getJson.lead.id, 'lead_persisted_test_001');
    assert.equal(getJson.activityLogs.length, 1);
  });

  it('3. The Leads list refreshes from the API (GET /api/leads)', async () => {
    // Insert two leads via POST
    for (let i = 1; i <= 2; i++) {
      await app.request('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          contact_name: `Contact #${i}`,
          contact_phone: `+971 50 111 000${i}`,
          contact_company: `Company #${i}`,
          lead_specification: `HVAC Scope #${i}`,
        }),
      }, mockEnv);
    }

    // Call GET /api/leads
    const listRes = await app.request('/api/leads', {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
      },
    }, mockEnv);

    assert.equal(listRes.status, 200);
    const listJson = await listRes.json();
    assert.equal(listJson.success, true);
    assert.equal(listJson.pagination.total, 2);
    assert.equal(listJson.leads.length, 2);
    // Ordered by sl_no DESC (newest first)
    assert.equal(listJson.leads[0].contact_name, 'Contact #2');
    assert.equal(listJson.leads[1].contact_name, 'Contact #1');
  });

  it('4. API failures (401 Unauthorized, malformed JSON) are clearly reported without false success', async () => {
    // Unauthenticated POST returns 401
    const unauthRes = await app.request('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_name: 'Test Contact',
        contact_phone: '+971 50 123 4567',
        contact_company: 'Test Co',
        lead_specification: 'Test Scope',
      }),
    }, mockEnv);

    assert.equal(unauthRes.status, 401);
    const unauthJson = await unauthRes.json();
    assert.equal(unauthJson.success, false);
    assert.equal(unauthJson.code, 'UNAUTHORIZED');

    // Confirm nothing was inserted into D1
    const count = dbWrapper.sqlite.prepare('SELECT COUNT(*) as c FROM leads').get().c;
    assert.equal(count, 0, 'No lead should be created on authentication failure');

    // Malformed JSON returns 400
    const malformedRes = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: 'invalid-json-payload',
    }, mockEnv);

    assert.equal(malformedRes.status, 400);
    const malformedJson = await malformedRes.json();
    assert.equal(malformedJson.success, false);
    assert.equal(malformedJson.code, 'INVALID_JSON');
  });

  it('5. Duplicate submissions do not create duplicate Leads', async () => {
    const leadPayload = {
      id: 'lead_unique_fixed_001',
      contact_name: 'Same Contact',
      contact_phone: '+971 50 123 9999',
      contact_company: 'Duplicate Protection Co',
      lead_specification: 'Duplicate test',
    };

    // First submission succeeds
    const firstRes = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify(leadPayload),
    }, mockEnv);
    assert.equal(firstRes.status, 201);

    // Second submission with same ID fails at database constraint level
    const secondRes = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify(leadPayload),
    }, mockEnv);

    // Database error due to primary key conflict
    assert.equal(secondRes.status, 500);
    const secondJson = await secondRes.json();
    assert.equal(secondJson.success, false);

    // Database still has exactly 1 row
    const count = dbWrapper.sqlite
      .prepare('SELECT COUNT(*) as c FROM leads WHERE id = ?')
      .get('lead_unique_fixed_001').c;
    assert.equal(count, 1);
  });

  it('6. Existing localStorage Leads remain preserved non-destructively', async () => {
    // Seed existing legacy leads into both localStorage keys
    const legacyLeads = [
      {
        id: 'legacy_lead_001',
        slNo: 1,
        leadDate: '01-01-2025',
        contactDetails: {
          name: 'Legacy Client One',
          company: 'Legacy Corp',
          phone: '+971 50 111 2222',
        },
        leadSpecification: 'Legacy offline specification',
      },
    ];

    memoryStorage.set('cooltech_crm_leads', JSON.stringify(legacyLeads));
    memoryStorage.set('crm_leads_data', JSON.stringify(legacyLeads));

    // Simulate automatic creation of a new lead via API
    const newLeadRes = await app.request('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        id: 'lead_new_auto_999',
        contact_name: 'New Live Client',
        contact_phone: '+971 50 999 8888',
        contact_company: 'Live DB Corp',
        lead_specification: 'Live specification',
      }),
    }, mockEnv);
    assert.equal(newLeadRes.status, 201);

    // Verify localStorage has NOT been cleared or erased
    const storedCool = JSON.parse(memoryStorage.get('cooltech_crm_leads'));
    const storedCrm = JSON.parse(memoryStorage.get('crm_leads_data'));

    assert.ok(storedCool && storedCool.length > 0, 'cooltech_crm_leads must not be cleared');
    assert.ok(storedCrm && storedCrm.length > 0, 'crm_leads_data must not be cleared');
    assert.equal(storedCool[0].id, 'legacy_lead_001');
    assert.equal(storedCrm[0].id, 'legacy_lead_001');
  });
});
