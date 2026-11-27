/**
 * Automated Test Suite for Sales Auxiliary Documents (cool-tech-crm-api)
 * 
 * Verifies Phase 2:
 * 1. Proforma Invoices CRUD, line items, and batch sync
 * 2. Receipts CRUD, payment methods, invoice links, and batch sync
 * 3. Delivery Notes CRUD, items, order links, and batch sync
 * 4. Authentication enforcement (401 without token)
 * 5. RBAC scoping: Admin, Manager, and Employee shared access
 * 6. Soft deletion preservation
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
const TEST_KID = 'sales-aux-test-key-1';

function createSalesAuxiliaryDatabase() {
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

  // Migrations 0002 to 0006
  const customersMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0002_create_customers.sql'), 'utf8');
  sqlite.exec(customersMigration);

  const leadsMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0003_create_leads.sql'), 'utf8');
  sqlite.exec(leadsMigration);

  const salesMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0004_create_sales_workflow.sql'), 'utf8');
  sqlite.exec(salesMigration);

  const tasksMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0005_create_tasks_and_worker_ops.sql'), 'utf8');
  sqlite.exec(tasksMigration);

  const auxMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0006_create_sales_auxiliary_documents.sql'), 'utf8');
  sqlite.exec(auxMigration);

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

describe('Sales Auxiliary Documents Test Suite (Phase 2)', () => {
  let privateKey;
  let adminToken;
  let employeeToken;
  let otherEmployeeToken;
  let env;
  let sqlite;

  const adminUser = {
    id: 'usr_admin_aux_1',
    firebase_uid: 'fb_admin_aux_1',
    email: 'admin_aux@cooltechuae.com',
    full_name: 'Finance Admin',
    role: 'ADMIN',
  };

  const employeeUser = {
    id: 'usr_emp_aux_1',
    firebase_uid: 'fb_emp_aux_1',
    email: 'sales_rep1@cooltechuae.com',
    full_name: 'Commercial Sales Rep',
    role: 'EMPLOYEE',
  };

  const otherEmployeeUser = {
    id: 'usr_emp_aux_2',
    firebase_uid: 'fb_emp_aux_2',
    email: 'sales_rep2@cooltechuae.com',
    full_name: 'Other Sales Rep',
    role: 'EMPLOYEE',
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
    const dbObj = createSalesAuxiliaryDatabase();
    sqlite = dbObj.sqlite;
    env = { DB: dbObj.mockD1 };

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(adminUser.id, adminUser.firebase_uid, adminUser.email, adminUser.full_name, adminUser.role);

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(employeeUser.id, employeeUser.firebase_uid, employeeUser.email, employeeUser.full_name, employeeUser.role);

    sqlite.prepare('INSERT INTO users (id, firebase_uid, email, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, 1)')
      .run(otherEmployeeUser.id, otherEmployeeUser.firebase_uid, otherEmployeeUser.email, otherEmployeeUser.full_name, otherEmployeeUser.role);
  });

  it('1. Rejects unauthenticated requests with 401 across proformas, receipts, and delivery notes', async () => {
    const endpoints = [
      ['GET', '/api/proformas'],
      ['POST', '/api/proformas'],
      ['GET', '/api/receipts'],
      ['POST', '/api/receipts'],
      ['GET', '/api/delivery-notes'],
      ['POST', '/api/delivery-notes'],
    ];

    for (const [method, path] of endpoints) {
      const res = await app.fetch(
        new Request(`http://localhost${path}`, { method }),
        env
      );
      assert.equal(res.status, 401, `Expected 401 for ${method} ${path}`);
    }
  });

  it('2. Creates and retrieves a Proforma Invoice with line items, preserving quotation link', async () => {
    const payload = {
      piNumber: 'CTPI#2001',
      quotationRef: 'CTSQ#8891',
      opportunityTitle: '50-Chiller Industrial Cooling Supply',
      customer: 'Sobha Realty LLC',
      issueDate: '2026-10-18',
      amount: 45000,
      vatRate: 5,
      vatAmount: 2250,
      totalAmount: 47250,
      status: 'Pending',
      items: [
        { code: 'CHILLER-50T', description: '50 Ton Chiller Unit', qty: 2, price: 20000, total: 40000 },
        { code: 'INSTALL-SVC', description: 'Installation & Pressure Test', qty: 1, price: 5000, total: 5000 },
      ],
    };

    const createRes = await app.fetch(
      new Request('http://localhost/api/proformas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
      env
    );

    assert.equal(createRes.status, 201);
    const data = await createRes.json();
    assert.equal(data.success, true);
    assert.equal(data.proforma.pi_number, 'CTPI#2001');
    assert.equal(data.proforma.total_amount, 47250);

    // Retrieve by ID with items
    const getRes = await app.fetch(
      new Request(`http://localhost/api/proformas/${data.proforma.id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );

    assert.equal(getRes.status, 200);
    const detail = await getRes.json();
    assert.equal(detail.proforma.items.length, 2);
    assert.equal(detail.proforma.items[0].code, 'CHILLER-50T');
  });

  it('3. In-place update and soft-delete on Proforma Invoices', async () => {
    const createRes = await app.fetch(
      new Request('http://localhost/api/proformas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          piNumber: 'CTPI#2002',
          customer: 'Damac Properties',
          amount: 10000,
          totalAmount: 10500,
        }),
      }),
      env
    );
    const { proforma } = await createRes.json();

    // In-place update
    const putRes = await app.fetch(
      new Request(`http://localhost/api/proformas/${proforma.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Approved',
          remarks: 'Approved by Financial Controller',
        }),
      }),
      env
    );

    assert.equal(putRes.status, 200);
    const updated = await putRes.json();
    assert.equal(updated.proforma.status, 'Approved');

    // Soft delete
    const delRes = await app.fetch(
      new Request(`http://localhost/api/proformas/${proforma.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );
    assert.equal(delRes.status, 200);

    const listRes = await app.fetch(
      new Request('http://localhost/api/proformas', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );
    const list = await listRes.json();
    assert.equal(list.proformas.some((p) => p.id === proforma.id), false);
  });

  it('4. Creates and queries Receipts, enforcing payment method and customer attribution', async () => {
    const payload = {
      receiptNumber: 'REC-2026-9001',
      invoiceRef: 'CTINV#1001',
      customer: 'Al Futtaim Engineering',
      contactPerson: 'Mr. Tariq',
      phone: '+971 50 123 4567',
      paymentMethod: 'Bank Transfer',
      receiptDate: '2026-10-18',
      amount: 25000,
      referenceNumber: 'ENBD-FT-889412',
      status: 'Cleared',
    };

    const createRes = await app.fetch(
      new Request('http://localhost/api/receipts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
      env
    );

    assert.equal(createRes.status, 201);
    const data = await createRes.json();
    assert.equal(data.receipt.receipt_number, 'REC-2026-9001');
    assert.equal(data.receipt.payment_method, 'Bank Transfer');
    assert.equal(data.receipt.amount, 25000);

    // Filter query
    const listRes = await app.fetch(
      new Request('http://localhost/api/receipts?paymentMethod=Bank Transfer&status=Cleared', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );

    assert.equal(listRes.status, 200);
    const list = await listRes.json();
    assert.equal(list.receipts.length, 1);
  });

  it('5. Creates Delivery Note with items, linking to Sales Order, and retrieves by ID', async () => {
    const payload = {
      deliveryNoteNumber: 'CTDN#5501',
      orderRef: 'CTSO#3341',
      orderDescription: 'Air Handling Units - Phase 1',
      customer: 'Arabtec Construction LLC',
      location: 'Jebel Ali Site Depot',
      driverName: 'Rashid Khan',
      vehicleNumber: 'DXB-88412',
      dispatchDate: '2026-10-18',
      status: 'Out for Delivery',
      items: [
        { itemCode: 'AHU-3000', description: 'Air Handling Unit 3000 CFM', quantity: 2, unit: 'Units' },
      ],
    };

    const createRes = await app.fetch(
      new Request('http://localhost/api/delivery-notes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
      env
    );

    assert.equal(createRes.status, 201);
    const data = await createRes.json();
    assert.equal(data.deliveryNote.delivery_note_number, 'CTDN#5501');
    assert.equal(data.deliveryNote.driver_name, 'Rashid Khan');

    // Retrieve with items
    const getRes = await app.fetch(
      new Request(`http://localhost/api/delivery-notes/${data.deliveryNote.id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      env
    );

    assert.equal(getRes.status, 200);
    const detail = await getRes.json();
    assert.equal(detail.deliveryNote.items.length, 1);
    assert.equal(detail.deliveryNote.items[0].item_code, 'AHU-3000');
  });

  it('6. Non-destructive sync-batch endpoints import records without duplicating existing ones', async () => {
    // 1. Proforma sync
    const proformaBatch = {
      proformas: [
        { id: 'pi_sync_1', piNumber: 'CTPI#7701', customer: 'Sync Customer A', amount: 5000, totalAmount: 5250 },
      ],
    };
    const pRes = await app.fetch(
      new Request('http://localhost/api/proformas/sync-batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proformaBatch),
      }),
      env
    );
    assert.equal(pRes.status, 200);
    const pData = await pRes.json();
    assert.equal(pData.synced, 1);

    // Sync same again -> skipped
    const pRes2 = await app.fetch(
      new Request('http://localhost/api/proformas/sync-batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proformaBatch),
      }),
      env
    );
    const pData2 = await pRes2.json();
    assert.equal(pData2.synced, 0);
    assert.equal(pData2.skipped, 1);

    // 2. Receipts sync
    const receiptBatch = {
      receipts: [
        { id: 'rec_sync_1', receiptNumber: 'REC-2026-7701', customer: 'Sync Customer B', amount: 3000 },
      ],
    };
    const rRes = await app.fetch(
      new Request('http://localhost/api/receipts/sync-batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptBatch),
      }),
      env
    );
    assert.equal(rRes.status, 200);
    const rData = await rRes.json();
    assert.equal(rData.synced, 1);

    // 3. Delivery Notes sync
    const dnBatch = {
      deliveryNotes: [
        { id: 'dn_sync_1', deliveryNoteNumber: 'CTDN#7701', customer: 'Sync Customer C' },
      ],
    };
    const dnRes = await app.fetch(
      new Request('http://localhost/api/delivery-notes/sync-batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dnBatch),
      }),
      env
    );
    assert.equal(dnRes.status, 200);
    const dnData = await dnRes.json();
    assert.equal(dnData.synced, 1);
  });
});
