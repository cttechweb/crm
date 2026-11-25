/**
 * Automated Test Suite for Retailer Application Event Ingestion (cool-tech-crm-api)
 * 
 * Verifies:
 * 1. Shared secret authentication enforcement (401 without valid CRM API Key)
 * 2. Envelope & required fields validation (400 on malformed payloads)
 * 3. Processing and saving of 'retailer.application.created' in local CRM D1
 * 4. Preservation of all commercial, contact, and document URL fields
 * 5. Idempotent duplicate prevention (re-sending does not create duplicate rows)
 * 6. End-to-end integration with website outbound event structure
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { app } from '../src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_CRM_API_KEY = 'test_crm_secret_key_step1_2026';

function createMockD1Database() {
  const sqlite = new DatabaseSync(':memory:');

  // Baseline users table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);

  // Baseline customers table
  sqlite.exec(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);

  // Run migration 0013: Add retailer_applications
  const migrationPath = path.resolve(__dirname, '../migrations/0013_add_retailer_applications.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  sqlite.exec(migrationSql);

  return {
    sqlite,
    prepare(sql) {
      const stmt = sqlite.prepare(sql);
      return {
        bind(...params) {
          return {
            async first() {
              return stmt.get(...params);
            },
            async all() {
              return { results: stmt.all(...params) };
            },
            async run() {
              const info = stmt.run(...params);
              return { success: true, meta: info };
            },
          };
        },
        async first() {
          return stmt.get();
        },
        async all() {
          return { results: stmt.all() };
        },
        async run() {
          const info = stmt.run();
          return { success: true, meta: info };
        },
      };
    },
  };
}

describe('CRM Inbound Events: B2B Retailer Application Ingestion', () => {
  let mockDb;
  let mockEnv;

  beforeEach(() => {
    mockDb = createMockD1Database();
    mockEnv = {
      DB: mockDb,
      CRM_API_KEY: TEST_CRM_API_KEY,
      FIREBASE_PROJECT_ID: 'cool-tech-crm',
    };
  });

  it('1. Rejects request without Authorization header with 401', async () => {
    const req = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'retailer.application.created' }),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /invalid or missing/i);
  });

  it('2. Rejects request with incorrect Bearer token with 401', async () => {
    const req = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid_secret_key',
      },
      body: JSON.stringify({ event_type: 'retailer.application.created' }),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 401);
  });

  it('3. Rejects malformed payload or missing required envelope fields with 400', async () => {
    const req = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
      },
      body: JSON.stringify({
        event_type: 'retailer.application.created',
        // missing entity_type, entity_id, data
      }),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  it('4. Rejects retailer application with missing mandatory business fields with 400', async () => {
    const req = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
      },
      body: JSON.stringify({
        event_id: 'evt_test_001',
        event_type: 'retailer.application.created',
        entity_type: 'retailer_application',
        entity_id: 'APP-2026-INVALID',
        occurred_at: new Date().toISOString(),
        source: 'cool-technologies-website',
        version: '1.0',
        idempotency_key: 'retailer_application:APP-2026-INVALID:retailer.application.created',
        data: {
          application_id: 'APP-2026-INVALID',
          // missing company_name, contact_person, email, phone, trade_license_number
        },
      }),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /company name is required/i);
  });

  it('5. Successfully ingests and saves retailer application in CRM D1 database', async () => {
    const samplePayload = {
      event_id: 'evt_1700000001_abc123',
      event_type: 'retailer.application.created',
      entity_type: 'retailer_application',
      entity_id: 'APP-2026-881234',
      occurred_at: '2026-11-25T10:00:00.000Z',
      source: 'cool-technologies-website',
      version: '1.0',
      idempotency_key: 'retailer_application:APP-2026-881234:retailer.application.created:2026-11-25',
      data: {
        application_id: 'APP-2026-881234',
        user_id: 'firebase_user_abc123',
        company_name: 'Gulf Engineering & Contracting LLC',
        legal_name: 'Gulf Engineering & Contracting LLC',
        trade_license_number: 'CN-9988776',
        tax_registration_number: '100-29384-77000',
        business_type: 'mep_contractor',
        emirate: 'Dubai',
        city: 'Dubai',
        address: 'Al Quoz Industrial Area 3, Warehouse 14',
        contact_person: 'Tariq Al Hashimi',
        designation: 'Managing Director',
        email: 'tariq@gulfengineering.ae',
        phone: '+971501239876',
        whatsapp_number: '+971501239876',
        interested_categories: ['Ducted Split Systems', 'Commercial VRF Systems', 'Air Chillers'],
        annual_volume_estimate: 'AED 500,000 – AED 1,000,000 / year',
        payment_terms_requested: '30-Day Commercial Trade Credit',
        trade_license_url: 'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/trade-documents/licenses/license_881234.pdf',
        tax_certificate_url: 'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/trade-documents/vat/vat_881234.pdf',
        status: 'pending',
        created_at: '2026-11-25T10:00:00.000Z',
        updated_at: '2026-11-25T10:00:00.000Z',
      },
    };

    const req = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
      },
      body: JSON.stringify(samplePayload),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.crm_record_id, 'APP-2026-881234');
    assert.equal(body.status, 'synced');
    assert.equal(body.event_id, 'evt_1700000001_abc123');

    // Verify row directly in CRM SQLite database
    const savedRow = mockDb.sqlite
      .prepare('SELECT * FROM retailer_applications WHERE id = ?')
      .get('APP-2026-881234');

    assert.ok(savedRow, 'Row must exist in retailer_applications table');
    assert.equal(savedRow.id, 'APP-2026-881234');
    assert.equal(savedRow.website_application_id, 'APP-2026-881234');
    assert.equal(savedRow.website_user_id, 'firebase_user_abc123');
    assert.equal(savedRow.company_name, 'Gulf Engineering & Contracting LLC');
    assert.equal(savedRow.contact_person, 'Tariq Al Hashimi');
    assert.equal(savedRow.email, 'tariq@gulfengineering.ae');
    assert.equal(savedRow.phone, '+971501239876');
    assert.equal(savedRow.trade_license_number, 'CN-9988776');
    assert.equal(savedRow.status, 'pending');
    assert.equal(
      savedRow.trade_license_url,
      'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/trade-documents/licenses/license_881234.pdf'
    );
    assert.equal(savedRow.idempotency_key, 'retailer_application:APP-2026-881234:retailer.application.created:2026-11-25');
  });

  it('6. Idempotency: Re-sending the identical event returns 200 without creating duplicate rows', async () => {
    const samplePayload = {
      event_id: 'evt_1700000002_dup',
      event_type: 'retailer.application.created',
      entity_type: 'retailer_application',
      entity_id: 'APP-2026-DUPLICATE-TEST',
      occurred_at: '2026-11-25T10:05:00.000Z',
      source: 'cool-technologies-website',
      version: '1.0',
      idempotency_key: 'retailer_application:APP-2026-DUPLICATE-TEST:retailer.application.created',
      data: {
        application_id: 'APP-2026-DUPLICATE-TEST',
        user_id: 'user_dup_1',
        company_name: 'Apex Air HVAC LLC',
        trade_license_number: 'CN-1122334',
        contact_person: 'Saeed Mansoor',
        email: 'saeed@apexair.ae',
        phone: '+971521234567',
        status: 'pending',
      },
    };

    // First Submission
    const req1 = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
      },
      body: JSON.stringify(samplePayload),
    });

    const res1 = await app.fetch(req1, mockEnv);
    assert.equal(res1.status, 201);
    const body1 = await res1.json();
    assert.equal(body1.status, 'synced');

    // Count records: must be 1
    const countAfterFirst = mockDb.sqlite
      .prepare('SELECT count(*) as cnt FROM retailer_applications WHERE website_application_id = ?')
      .get('APP-2026-DUPLICATE-TEST');
    assert.equal(countAfterFirst.cnt, 1);

    // Second Submission (Duplicate re-send)
    const req2 = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
      },
      body: JSON.stringify(samplePayload),
    });

    const res2 = await app.fetch(req2, mockEnv);
    assert.equal(res2.status, 200, 'Duplicate request must return 200 OK');
    const body2 = await res2.json();
    assert.equal(body2.success, true);
    assert.equal(body2.crm_record_id, 'APP-2026-DUPLICATE-TEST');
    assert.equal(body2.status, 'already_processed');

    // Count records again: must STILL be exactly 1
    const countAfterSecond = mockDb.sqlite
      .prepare('SELECT count(*) as cnt FROM retailer_applications WHERE website_application_id = ?')
      .get('APP-2026-DUPLICATE-TEST');
    assert.equal(countAfterSecond.cnt, 1, 'Duplicate request must NOT create second record');
  });

  it('7. Also accessible via alias /api/events', async () => {
    const samplePayload = {
      event_id: 'evt_alias_001',
      event_type: 'retailer.application.created',
      entity_type: 'retailer_application',
      entity_id: 'APP-2026-ALIAS-TEST',
      data: {
        application_id: 'APP-2026-ALIAS-TEST',
        company_name: 'Desert Cool Contracting LLC',
        trade_license_number: 'CN-5566778',
        contact_person: 'Rashid Khan',
        email: 'rashid@desertcool.ae',
        phone: '+971509988776',
      },
    };

    const req = new Request('http://localhost/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
      },
      body: JSON.stringify(samplePayload),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.crm_record_id, 'APP-2026-ALIAS-TEST');
  });

  it('8. Full Website Dispatcher Simulation: Validates crmRecordId response contract', async () => {
    // Simulates the exact structure created by CTTECHWEB/backend/src/crm/crmService.ts
    const websitePayload = {
      application_id: 'APP-2026-DISPATCH-TEST',
      user_id: 'uid_web_test_999',
      company_name: 'Cool Tech Partner Corp LLC',
      legal_name: 'Cool Tech Partner Corp LLC',
      trade_license_number: 'CN-88776655',
      tax_registration_number: '100-8877-6655',
      business_type: 'contractor',
      emirate: 'Abu Dhabi',
      address: 'Musaffah Industrial M-12',
      city: 'Abu Dhabi',
      contact_person: 'Khalid Al Zaabi',
      designation: 'Procurement Specialist',
      email: 'khalid@partnercorp.ae',
      phone: '+971509998888',
      whatsapp_number: '+971509998888',
      interested_categories: JSON.stringify(['HVAC Compressors', 'Copper Pipes']),
      annual_volume_estimate: 'AED 100,000 – AED 500,000 / year',
      payment_terms_requested: 'Standard Trade',
      trade_license_url: 'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/trade-documents/licenses/license_999.pdf',
      tax_certificate_url: 'https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev/trade-documents/vat/vat_999.pdf',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const eventId = `evt_${Date.now()}_test`;
    const now = new Date().toISOString();
    const outboundEvent = {
      event_id: eventId,
      event_type: 'retailer.application.created',
      entity_type: 'retailer_application',
      entity_id: websitePayload.application_id,
      occurred_at: now,
      source: 'cool-technologies-website',
      version: '1.0',
      idempotency_key: `retailer_application:${websitePayload.application_id}:retailer.application.created:${now.substring(0, 10)}`,
      data: websitePayload,
    };

    const req = new Request('http://localhost/api/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_CRM_API_KEY}`,
        'X-Idempotency-Key': outboundEvent.idempotency_key,
        'X-Event-ID': outboundEvent.event_id,
        'X-Event-Type': outboundEvent.event_type,
        'X-Integration-Source': 'cooltech-platform',
      },
      body: JSON.stringify(outboundEvent),
    });

    const res = await app.fetch(req, mockEnv);
    assert.equal(res.status, 201);
    const data = await res.json();

    // Verify properties expected by website's dispatchEventToCrm()
    const crmRecordId = data.crm_record_id || data.crm_id || data.record_id || data.id;
    assert.ok(crmRecordId, 'Response must provide crm_record_id');
    assert.equal(crmRecordId, 'APP-2026-DISPATCH-TEST');
    assert.equal(data.status, 'synced');

    // Verify row in CRM database
    const dbRow = mockDb.sqlite
      .prepare('SELECT * FROM retailer_applications WHERE id = ?')
      .get('APP-2026-DISPATCH-TEST');
    assert.ok(dbRow);
    assert.equal(dbRow.company_name, 'Cool Tech Partner Corp LLC');
    assert.equal(dbRow.trade_license_number, 'CN-88776655');
    assert.equal(dbRow.status, 'pending');
  });
});
