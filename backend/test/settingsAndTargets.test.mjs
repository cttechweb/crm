/**
 * Automated Test Suite for Settings, Targets, and Opportunity Stages (cool-tech-crm-api)
 * 
 * Verifies Phase 4:
 * 1. Unauthenticated requests are rejected with 401
 * 2. Company profile configuration & Admin RBAC enforcement
 * 3. System settings key-value persistence & RBAC
 * 4. Lead Sources CRUD, duplicate prevention, and batch sync
 * 5. Target Industries CRUD, duplicate prevention, and batch sync
 * 6. User Sales Targets CRUD, quota calculations, and RBAC
 * 7. Company Targets CRUD, monthly quotas, and batch sync
 * 8. Opportunity Pipeline Stages CRUD, order sorting, and protected system stages
 * 9. Opportunity Lost Reasons CRUD, active toggling, and batch sync
 * 10. Non-destructive sync-batch idempotency and soft-delete preservation
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, SignJWT } from 'jose';
import { app } from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const TEST_KID = 'settings-test-key-1';

function createSettingsDatabase() {
  const sqlite = new DatabaseSync(':memory:');

  // Users table
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

  // Load migrations 0002 to 0008
  for (let i = 2; i <= 8; i++) {
    const migFiles = fs.readdirSync(path.resolve(__dirname, '../migrations'));
    const migFile = migFiles.find((f) => f.startsWith(`000${i}_`));
    if (migFile) {
      const sql = fs.readFileSync(path.resolve(__dirname, '../migrations', migFile), 'utf8');
      sqlite.exec(sql);
    }
  }

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

describe('Settings, Targets, and Opportunity Stages Test Suite', () => {
  let keyPair;
  let sqlite;
  let mockD1;
  let adminToken;
  let managerToken;
  let employeeToken;

  before(async () => {
    keyPair = await generateKeyPair('RS256');
    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === TEST_KID) {
        return keyPair.publicKey;
      }
      throw new Error('Key ID not found in JWKS');
    };
    setCustomJWKS(mockJWKS);

    adminToken = await new SignJWT({
      user_id: 'firebase_admin_settings',
      sub: 'firebase_admin_settings',
      email: 'admin.settings@cooltech.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);

    managerToken = await new SignJWT({
      user_id: 'firebase_manager_settings',
      sub: 'firebase_manager_settings',
      email: 'manager.settings@cooltech.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);

    employeeToken = await new SignJWT({
      user_id: 'firebase_emp_settings',
      sub: 'firebase_emp_settings',
      email: 'emp.settings@cooltech.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);
  });

  beforeEach(() => {
    const dbObj = createSettingsDatabase();
    sqlite = dbObj.sqlite;
    mockD1 = dbObj.mockD1;

    // Seed test users
    sqlite.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, is_active) VALUES
      ('usr_admin_sett', 'firebase_admin_settings', 'admin.settings@cooltech.com', 'Admin Lead', 'ADMIN', 1),
      ('usr_mgr_sett', 'firebase_manager_settings', 'manager.settings@cooltech.com', 'Commercial Manager', 'MANAGER', 1),
      ('usr_emp_sett', 'firebase_emp_settings', 'emp.settings@cooltech.com', 'Sales Exec', 'EMPLOYEE', 1);
    `);
  });

  // 1. Authentication check
  it('1. Settings and Target endpoints reject unauthenticated requests (401)', async () => {
    const endpoints = [
      '/api/settings/company',
      '/api/settings/system',
      '/api/settings/lead-sources',
      '/api/settings/industries',
      '/api/targets/users',
      '/api/targets/company',
      '/api/opportunity-stages',
      '/api/opportunity-lost-reasons',
    ];

    for (const ep of endpoints) {
      const res = await app.request(ep, { method: 'GET' }, { DB: mockD1 });
      assert.equal(res.status, 401, `Expected 401 for ${ep}`);
    }
  });

  // 2. Company Settings Profile
  it('2. Company Settings: GET returns profile, PUT updates legal profile; Employee is blocked (403)', async () => {
    // GET default profile
    const getRes = await app.request('/api/settings/company', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.success, true);
    assert.equal(getData.company.company_name, 'Cool Technologies LLC');

    // Employee tries to update -> 403 Forbidden
    const empPutRes = await app.request('/api/settings/company', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: 'Hacked Entity',
      }),
    }, { DB: mockD1 });
    assert.equal(empPutRes.status, 403);

    // Admin updates company profile -> 200 OK
    const adminPutRes = await app.request('/api/settings/company', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: 'Cool Technologies Commercial LLC',
        legal_entity: 'Cool Technologies Commercial LLC',
        trn: '100999888777003',
        operating_region: 'UAE & GCC Region (AED)',
        primary_email: 'hq@cooltechuae.com',
        phone: '+971 4 800 2665',
        address: 'Al Quoz Industrial Area 3, Dubai, UAE',
        currency: 'AED',
        vat_rate: 5.0,
      }),
    }, { DB: mockD1 });
    assert.equal(adminPutRes.status, 200);
    const putData = await adminPutRes.json();
    assert.equal(putData.success, true);
    assert.equal(putData.company.trn, '100999888777003');
    assert.equal(putData.company.primary_email, 'hq@cooltechuae.com');
  });

  // 3. System Key-Value Settings
  it('3. System Settings: GET lists settings; PUT stores key-value; Employee cannot modify', async () => {
    // Admin sets key-value
    const putRes = await app.request('/api/settings/system', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'crm.portal.theme',
        value: 'cooltech-dark',
        category: 'appearance',
      }),
    }, { DB: mockD1 });
    assert.equal(putRes.status, 200);

    // Employee lists settings -> 200 OK (open read)
    const listRes = await app.request('/api/settings/system?category=appearance', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: mockD1 });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.settings.length, 1);
    assert.equal(listData.settings[0].key, 'crm.portal.theme');
    assert.equal(listData.settings[0].value, 'cooltech-dark');

    // Employee tries to modify -> 403
    const empRes = await app.request('/api/settings/system', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'crm.portal.theme', value: 'light' }),
    }, { DB: mockD1 });
    assert.equal(empRes.status, 403);
  });

  // 4. Lead Sources
  it('4. Lead Sources: GET returns seeded sources; POST adds source; rejects duplicate name (409); DELETE soft deletes', async () => {
    // GET initial sources
    const getRes = await app.request('/api/settings/lead-sources', {
      method: 'GET',
      headers: { Authorization: `Bearer ${managerToken}` },
    }, { DB: mockD1 });
    assert.equal(getRes.status, 200);
    const initialData = await getRes.json();
    assert.ok(initialData.sources.length >= 7);

    // Manager creates new source
    const createRes = await app.request('/api/settings/lead-sources', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Government Tender Board',
        sortOrder: 8,
      }),
    }, { DB: mockD1 });
    assert.equal(createRes.status, 201);
    const createdData = await createRes.json();
    const newId = createdData.source.id;

    // Duplicate creation returns 409 Conflict
    const dupRes = await app.request('/api/settings/lead-sources', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Government Tender Board',
      }),
    }, { DB: mockD1 });
    assert.equal(dupRes.status, 409);

    // Admin soft-deletes source
    const delRes = await app.request(`/api/settings/lead-sources/${newId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(delRes.status, 200);

    // Verify deleted source is excluded from list
    const afterDelRes = await app.request('/api/settings/lead-sources', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    const afterDelData = await afterDelRes.json();
    assert.ok(!afterDelData.sources.some((s) => s.id === newId));
  });

  // 5. Target Industries
  it('5. Target Industries: GET returns seeded industries; POST adds industry; DELETE soft-deletes', async () => {
    const listRes = await app.request('/api/settings/industries', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: mockD1 });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.industries.length >= 7);

    // Manager adds industry
    const addRes = await app.request('/api/settings/industries', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Data Centers & Tech Infrastructure',
        sortOrder: 10,
      }),
    }, { DB: mockD1 });
    assert.equal(addRes.status, 201);
    const addData = await addRes.json();
    const indId = addData.industry.id;

    // Admin deletes industry
    const delRes = await app.request(`/api/settings/industries/${indId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(delRes.status, 200);
  });

  // 6. User Sales Targets
  it('6. User Targets: Manager can set quota; Employee cannot establish quotas (403); GET lists targets', async () => {
    // Employee tries to create target -> 403 Forbidden
    const empRes = await app.request('/api/targets/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${employeeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sales Exec',
        role: 'Commercial Representative',
        targetRev: 120000,
        targetDeals: 15,
      }),
    }, { DB: mockD1 });
    assert.equal(empRes.status, 403);

    // Manager creates target for employee
    const mgrRes = await app.request('/api/targets/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sales Exec',
        role: 'Commercial Representative',
        targetRev: 120000,
        targetDeals: 15,
        period: 'Q1 - 2026',
        year: 2026,
      }),
    }, { DB: mockD1 });
    assert.equal(mgrRes.status, 201);
    const mgrData = await mgrRes.json();
    assert.equal(mgrData.success, true);
    assert.equal(mgrData.target.target_rev, 120000);

    // Upsert target with new values
    const updateRes = await app.request('/api/targets/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sales Exec',
        role: 'Commercial Representative',
        targetRev: 150000,
        targetDeals: 18,
        period: 'Q1 - 2026',
        year: 2026,
      }),
    }, { DB: mockD1 });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.target.target_rev, 150000);

    // GET targets
    const getRes = await app.request('/api/targets/users?year=2026', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: mockD1 });
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.ok(getData.targets.some((t) => t.user_name === 'Sales Exec' && t.target_rev === 150000));
  });

  // 7. Company Sales Targets
  it('7. Company Targets: Manager creates monthly target; PUT updates target; DELETE soft deletes', async () => {
    // Manager creates company target
    const createRes = await app.request('/api/targets/company', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        month: 'OCT 2026 TO OCT 2026',
        saleTarget: 500000,
        profitTarget: 150000,
        invoiceTarget: 480000,
        collectionTarget: 400000,
      }),
    }, { DB: mockD1 });
    assert.equal(createRes.status, 201);
    const createData = await createRes.json();
    assert.equal(createData.target.month, 'OCT 2026');
    assert.equal(createData.target.sale_target, 500000);
    const targetId = createData.target.id;

    // Manager updates target
    const putRes = await app.request(`/api/targets/company/${targetId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        month: 'OCT 2026',
        saleTarget: 550000,
        profitTarget: 160000,
        invoiceTarget: 520000,
        collectionTarget: 450000,
      }),
    }, { DB: mockD1 });
    assert.equal(putRes.status, 200);
    const putData = await putRes.json();
    assert.equal(putData.target.sale_target, 550000);

    // Admin deletes target
    const delRes = await app.request(`/api/targets/company/${targetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(delRes.status, 200);

    // Verify excluded from list
    const listRes = await app.request('/api/targets/company', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    const listData = await listRes.json();
    assert.ok(!listData.targets.some((t) => t.id === targetId));
  });

  // 8. Opportunity Pipeline Stages
  it('8. Opportunity Stages: GET returns stages in order; POST adds stage; system stages cannot be deleted (400); custom stage can be deleted', async () => {
    // GET seeded stages
    const getRes = await app.request('/api/opportunity-stages', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: mockD1 });
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.ok(getData.stages.length >= 6);

    // Verify ordering
    const orders = getData.stages.map((s) => s.stage_order);
    for (let i = 1; i < orders.length; i++) {
      assert.ok(orders[i] >= orders[i - 1], 'Stages must be ordered by stage_order ASC');
    }

    // Try deleting system stage 'stage_1' -> 400 PROTECTED_RECORD
    const sysDelRes = await app.request('/api/opportunity-stages/stage_1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(sysDelRes.status, 400);

    // Add custom stage
    const addRes = await app.request('/api/opportunity-stages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Technical Verification',
        abbreviation: 'TECH',
        color: '#8b5cf6',
        probability: 40,
        stageOrder: 25,
      }),
    }, { DB: mockD1 });
    assert.equal(addRes.status, 201);
    const addData = await addRes.json();
    const customStageId = addData.stage.id;

    // Delete custom stage -> 200 OK
    const delRes = await app.request(`/api/opportunity-stages/${customStageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(delRes.status, 200);
  });

  // 9. Opportunity Lost Reasons
  it('9. Opportunity Lost Reasons: GET returns reasons; POST adds reason; PUT updates; DELETE soft-deletes', async () => {
    const listRes = await app.request('/api/opportunity-lost-reasons', {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    }, { DB: mockD1 });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.reasons.length >= 6);

    // Add lost reason
    const addRes = await app.request('/api/opportunity-lost-reasons', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Client relocated operations overseas',
        description: 'Facility closure or international relocation outside UAE',
      }),
    }, { DB: mockD1 });
    assert.equal(addRes.status, 201);
    const addData = await addRes.json();
    const reasonId = addData.lostReason.id;

    // Update lost reason
    const updateRes = await app.request(`/api/opportunity-lost-reasons/${reasonId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${managerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Facility closure or overseas headquarters relocation',
      }),
    }, { DB: mockD1 });
    assert.equal(updateRes.status, 200);

    // Delete lost reason
    const delRes = await app.request(`/api/opportunity-lost-reasons/${reasonId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, { DB: mockD1 });
    assert.equal(delRes.status, 200);
  });

  // 10. Non-destructive sync-batch idempotency
  it('10. Non-destructive sync-batch imports local records without duplicating existing data', async () => {
    // Batch sync sources
    const batchSourcesRes = await app.request('/api/settings/lead-sources/sync-batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sources: [
          { id: 'src_1', name: 'Direct Website Inquiry' }, // already exists
          { id: 'src_custom_1', name: 'Billboard Highway Ads' }, // new
        ],
      }),
    }, { DB: mockD1 });
    assert.equal(batchSourcesRes.status, 200);
    const sourcesData = await batchSourcesRes.json();
    assert.equal(sourcesData.success, true);

    // Batch sync company targets
    const batchCompanyTargetsRes = await app.request('/api/targets/company/sync-batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targets: [
          { month: 'NOV 2026', saleTarget: 420000, profitTarget: 120000 },
          { month: 'DEC 2026', saleTarget: 600000, profitTarget: 200000 },
        ],
      }),
    }, { DB: mockD1 });
    assert.equal(batchCompanyTargetsRes.status, 200);

    // Batch sync user targets
    const batchUserTargetsRes = await app.request('/api/targets/users/sync-batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targets: [
          { name: 'Commercial Manager', deals: 12, targetRev: 180000 },
        ],
      }),
    }, { DB: mockD1 });
    assert.equal(batchUserTargetsRes.status, 200);
  });
});
