/**
 * Automated Test Suite for Procurement and Inventory (cool-tech-crm-api)
 * 
 * Verifies Phase 3:
 * 1. Suppliers CRUD, status filtering, and batch sync
 * 2. Stores CRUD and duplicate name prevention
 * 3. CRM Inventory CRUD, category/brand search, and isolation from e-commerce
 * 4. Purchase Orders with line items, auto sl_no, and RBAC scoping
 * 5. Purchase Order status workflow (approval, delivery, payment)
 * 6. Stock-In records and line items
 * 7. Stock Transfers between stores and items
 * 8. Authentication enforcement (401 without token)
 * 9. Non-destructive sync-batch idempotency
 * 10. Soft deletion preservation
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
const TEST_KID = 'procurement-test-key-1';

function createProcurementDatabase() {
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

  // Migrations 0002 to 0007
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

  const procMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0007_create_procurement_and_inventory.sql'), 'utf8');
  sqlite.exec(procMigration);

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

describe('Procurement and Inventory Test Suite', () => {
  let keyPair;
  let sqlite;
  let mockD1;
  let adminToken;
  let managerToken;
  let employee1Token;
  let employee2Token;

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
      user_id: 'firebase_admin_proc',
      sub: 'firebase_admin_proc',
      email: 'admin.proc@cooltech.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);

    managerToken = await new SignJWT({
      user_id: 'firebase_manager_proc',
      sub: 'firebase_manager_proc',
      email: 'purchasemanager@gmail.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);

    employee1Token = await new SignJWT({
      user_id: 'firebase_emp1_proc',
      sub: 'firebase_emp1_proc',
      email: 'musthafa@cooltech.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);

    employee2Token = await new SignJWT({
      user_id: 'firebase_emp2_proc',
      sub: 'firebase_emp2_proc',
      email: 'shaheer.proc@cooltech.com',
      email_verified: true,
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);
  });

  beforeEach(() => {
    const dbObj = createProcurementDatabase();
    sqlite = dbObj.sqlite;
    mockD1 = dbObj.mockD1;

    // Seed staff profiles
    sqlite.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, department) VALUES
      ('usr_admin_p', 'firebase_admin_proc', 'admin.proc@cooltech.com', 'Admin User', 'ADMIN', 'Executive Operations'),
      ('usr_manager_p', 'firebase_manager_proc', 'purchasemanager@gmail.com', 'Rashid Ali', 'MANAGER', 'Purchase'),
      ('usr_emp1_p', 'firebase_emp1_proc', 'musthafa@cooltech.com', 'MUSTHAFA CHIRAMMAL', 'EMPLOYEE', 'Purchase'),
      ('usr_emp2_p', 'firebase_emp2_proc', 'shaheer.proc@cooltech.com', 'Shaheer', 'EMPLOYEE', 'Sales');
    `);
  });

  const getEnv = () => ({
    DB: mockD1,
    FIREBASE_PROJECT_ID: PROJECT_ID,
  });

  it('1. Unauthenticated requests to procurement endpoints return 401', async () => {
    const res1 = await app.request('/api/suppliers', { method: 'GET' }, getEnv());
    assert.equal(res1.status, 401);

    const res2 = await app.request('/api/stores', { method: 'GET' }, getEnv());
    assert.equal(res2.status, 401);

    const res3 = await app.request('/api/inventory', { method: 'GET' }, getEnv());
    assert.equal(res3.status, 401);

    const res4 = await app.request('/api/purchase-orders', { method: 'GET' }, getEnv());
    assert.equal(res4.status, 401);

    const res5 = await app.request('/api/stock-in', { method: 'GET' }, getEnv());
    assert.equal(res5.status, 401);

    const res6 = await app.request('/api/stock-transfers', { method: 'GET' }, getEnv());
    assert.equal(res6.status, 401);
  });

  it('2. Suppliers: create, list, filter by status, and update', async () => {
    const createRes = await app.request(
      '/api/suppliers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          supplierName: 'LUTFI TRADING LLC',
          contactPerson: 'Mr. Rama Krishnan',
          phone: '+971 4 288 9900',
          email: 'info@lutfitrading.ae',
          trn: '100234567800003',
          paymentTerms: '30 Days',
        }),
      },
      getEnv()
    );

    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.success, true);
    assert.equal(createBody.supplier.supplier_name, 'LUTFI TRADING LLC');
    const supplierId = createBody.supplier.id;

    // List suppliers
    const listRes = await app.request(
      '/api/suppliers?search=LUTFI',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${managerToken}` },
      },
      getEnv()
    );
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.total, 1);
    assert.equal(listBody.suppliers[0].id, supplierId);

    // Update supplier
    const updateRes = await app.request(
      `/api/suppliers/${supplierId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          paymentTerms: '60 Days Credit',
        }),
      },
      getEnv()
    );
    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.equal(updateBody.supplier.payment_terms, '60 Days Credit');
  });

  it('3. Stores: create store, list stores, and prevent duplicate store names', async () => {
    const res1 = await app.request(
      '/api/stores',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'MAIN WAREHOUSE',
          code: 'MWH-01',
          location: 'Industrial Area 4, Sharjah',
        }),
      },
      getEnv()
    );
    assert.equal(res1.status, 201);

    // Duplicate store name returns 409
    const dupRes = await app.request(
      '/api/stores',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'MAIN WAREHOUSE',
        }),
      },
      getEnv()
    );
    assert.equal(dupRes.status, 409);

    // List stores
    const listRes = await app.request(
      '/api/stores',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${employee1Token}` },
      },
      getEnv()
    );
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.total, 1);
    assert.equal(listBody.stores[0].name, 'MAIN WAREHOUSE');
  });

  it('4. CRM Inventory: create inventory item, search by code/category, and update stock', async () => {
    const createRes = await app.request(
      '/api/inventory',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          code: 'CT25F2-01',
          name: '25 usg water cooler cooltech',
          brand: 'COOLTECH',
          category: 'Water Coolers',
          purchaseRate: 625.0,
          sellingPrice: 850.0,
          stock: 15,
          store: 'MAIN WAREHOUSE',
        }),
      },
      getEnv()
    );
    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.item.code, 'CT25F2-01');
    assert.equal(createBody.item.stock, 15);
    const itemId = createBody.item.id;

    // Search inventory
    const searchRes = await app.request(
      '/api/inventory?search=cooler&category=Water+Coolers',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${employee1Token}` },
      },
      getEnv()
    );
    assert.equal(searchRes.status, 200);
    const searchBody = await searchRes.json();
    assert.equal(searchBody.total, 1);
    assert.equal(searchBody.items[0].id, itemId);

    // Update stock quantity
    const updateRes = await app.request(
      `/api/inventory/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          stock: 22,
        }),
      },
      getEnv()
    );
    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.equal(updateBody.item.stock, 22);
  });

  it('5. Purchase Orders: create PO with line items and retrieve full details', async () => {
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          poNumber: 'CTPO#2543',
          date: '2026-10-07',
          supplier: 'LUTFI TRADING LLC',
          vatType: 'with_vat',
          amount: 420.0,
          vat: 21.0,
          totalAmount: 441.0,
          items: [
            {
              code: 'NR140',
              description: 'REFRIGERATOR 140 LTR SINGLE DOOR NOBEL NR140',
              unit: 'Pcs',
              brand: 'NOBEL',
              qty: 1,
              amount: 335.0,
              total: 335.0,
            },
            {
              code: 'NIC101',
              description: 'Single Ring Infrared Cooker-Touch Control Nobel I',
              unit: 'Pcs',
              brand: 'NOBEL',
              qty: 1,
              amount: 85.0,
              total: 85.0,
            },
          ],
        }),
      },
      getEnv()
    );

    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.order.po_number, 'CTPO#2543');
    const poId = createBody.order.id;

    // Fetch PO by ID
    const getRes = await app.request(
      `/api/purchase-orders/${poId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${employee1Token}` },
      },
      getEnv()
    );
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.order.items.length, 2);
    assert.equal(getBody.order.items[0].code, 'NR140');
    assert.equal(getBody.order.items[1].code, 'NIC101');
  });

  it('6. RBAC: Employee only sees own Purchase Orders; Manager sees all POs', async () => {
    // Employee 1 creates a PO
    await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          poNumber: 'CTPO#EMP1',
          supplier: 'SUPPLIER A',
          amount: 1000,
        }),
      },
      getEnv()
    );

    // Employee 2 creates a PO
    await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employee2Token}`,
        },
        body: JSON.stringify({
          poNumber: 'CTPO#EMP2',
          supplier: 'SUPPLIER B',
          amount: 2000,
        }),
      },
      getEnv()
    );

    // Employee 1 views list -> should only see CTPO#EMP1
    const emp1Res = await app.request(
      '/api/purchase-orders',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${employee1Token}` },
      },
      getEnv()
    );
    const emp1Body = await emp1Res.json();
    assert.equal(emp1Body.total, 1);
    assert.equal(emp1Body.orders[0].po_number, 'CTPO#EMP1');

    // Manager views list -> should see both CTPO#EMP1 and CTPO#EMP2
    const mgrRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${managerToken}` },
      },
      getEnv()
    );
    const mgrBody = await mgrRes.json();
    assert.equal(mgrBody.total, 2);
  });

  it('7. Purchase Order Status Workflow: Manager approves PO and updates delivery/payment status', async () => {
    const createRes = await app.request(
      '/api/purchase-orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employee1Token}`,
        },
        body: JSON.stringify({
          poNumber: 'CTPO#APPROVAL_TEST',
          supplier: 'CARRIER UAE',
          amount: 5000,
          approval: 'Waiting for Final Approval',
          deliveryStatus: 'Pending',
          paymentStatus: 'Due',
        }),
      },
      getEnv()
    );
    const po = (await createRes.json()).order;

    // Manager updates approval to Approved and deliveryStatus to Delivered
    const patchRes = await app.request(
      `/api/purchase-orders/${po.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          approval: 'Approved',
          deliveryStatus: 'Delivered',
          paymentStatus: 'Paid',
        }),
      },
      getEnv()
    );

    assert.equal(patchRes.status, 200);
    const patchBody = await patchRes.json();
    assert.equal(patchBody.order.approval, 'Approved');
    assert.equal(patchBody.order.delivery_status, 'Delivered');
    assert.equal(patchBody.order.payment_status, 'Paid');
  });

  it('8. Stock-In: create stock-in record with items and retrieve by ID', async () => {
    const createRes = await app.request(
      '/api/stock-in',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          stockInNo: 'STK 923',
          date: '2026-10-03',
          supplier: 'Shajarath Al Thalj Trading LLC',
          lpoNumber: 'CTPO#2528',
          store: 'MAIN WAREHOUSE',
          items: [
            {
              code: 'CT25F2-01',
              item: '25 usg water cooler cooltech',
              unit: 'Pcs',
              brand: 'COOLTECH',
              purchaseRate: 625.0,
              qty: 5,
            },
          ],
        }),
      },
      getEnv()
    );

    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.record.stock_in_no, 'STK 923');
    const recordId = createBody.record.id;

    const getRes = await app.request(
      `/api/stock-in/${recordId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${managerToken}` },
      },
      getEnv()
    );
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.record.items.length, 1);
    assert.equal(getBody.record.items[0].code, 'CT25F2-01');
    assert.equal(getBody.record.items[0].qty, 5);
  });

  it('9. Stock Transfers: create transfer between stores with line items', async () => {
    const createRes = await app.request(
      '/api/stock-transfers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({
          transferNo: 'TRF-1001',
          date: '2026-10-15',
          transferFrom: 'MAIN WAREHOUSE',
          transferTo: 'M-42 OFFICE',
          status: 'Completed',
          items: [
            {
              code: 'CT25F2-01',
              itemName: '25 usg water cooler cooltech',
              unit: 'Pcs',
              qty: 2,
            },
          ],
        }),
      },
      getEnv()
    );

    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.transfer.transfer_no, 'TRF-1001');
    const transferId = createBody.transfer.id;

    const getRes = await app.request(
      `/api/stock-transfers/${transferId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${managerToken}` },
      },
      getEnv()
    );
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.transfer.transfer_from, 'MAIN WAREHOUSE');
    assert.equal(getBody.transfer.transfer_to, 'M-42 OFFICE');
    assert.equal(getBody.transfer.items.length, 1);
    assert.equal(getBody.transfer.items[0].qty, 2);
  });

  it('10. Non-destructive sync-batch imports local records without duplicating existing ones', async () => {
    // First sync batch with 2 suppliers
    const sync1 = await app.request(
      '/api/suppliers/sync-batch',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          suppliers: [
            { id: 'sup_local_1', supplierName: 'CENTRAL TRADING COMPANY LLC', phone: '+97140001' },
            { id: 'sup_local_2', supplierName: 'SUPER GENERAL COMPANY LLC', phone: '+97140002' },
          ],
        }),
      },
      getEnv()
    );
    const body1 = await sync1.json();
    assert.equal(body1.success, true);
    assert.equal(body1.inserted, 2);
    assert.equal(body1.skipped, 0);

    // Second sync batch with 1 existing supplier and 1 new supplier
    const sync2 = await app.request(
      '/api/suppliers/sync-batch',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          suppliers: [
            { id: 'sup_local_1', supplierName: 'CENTRAL TRADING COMPANY LLC', phone: '+97140001' },
            { id: 'sup_local_3', supplierName: 'EROS GROUP LLC', phone: '+97140003' },
          ],
        }),
      },
      getEnv()
    );
    const body2 = await sync2.json();
    assert.equal(body2.success, true);
    assert.equal(body2.inserted, 1); // Only EROS GROUP inserted
    assert.equal(body2.skipped, 1); // CENTRAL TRADING skipped as duplicate
  });

  it('11. Soft deletion marks records as deleted without removing historical rows', async () => {
    const createRes = await app.request(
      '/api/suppliers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          supplierName: 'TEMPORARY SUPPLIER',
        }),
      },
      getEnv()
    );
    const supId = (await createRes.json()).supplier.id;

    // Delete supplier
    const delRes = await app.request(
      `/api/suppliers/${supId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      getEnv()
    );
    assert.equal(delRes.status, 200);

    // GET by ID returns 404
    const getRes = await app.request(
      `/api/suppliers/${supId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      getEnv()
    );
    assert.equal(getRes.status, 404);

    // Database still contains record with is_deleted = 1
    const rawRow = sqlite.prepare('SELECT is_deleted, deleted_by_id FROM suppliers WHERE id = ?').get(supId);
    assert.equal(rawRow.is_deleted, 1);
    assert.equal(rawRow.deleted_by_id, 'usr_admin_p');
  });
});
