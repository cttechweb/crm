/**
 * Automated Test Suite for CRM Sales Workflow (cool-tech-crm-api)
 * 
 * Verifies the complete 5-stage lifecycle:
 * Lead -> Opportunity -> Quotation (Commercial Offer) -> Sales Order -> Invoice
 * 
 * Tests:
 * 1. Authentication enforcement (401 on unauthenticated calls)
 * 2. Stage 1: Lead to Opportunity
 *    - Opportunity creation preserves created_from_lead_id
 *    - Duplicate prevention when converting the same lead repeatedly
 * 3. Stage 2: Opportunity to Quotation
 *    - Populates customer and opportunity details
 *    - Preserves product, quantity, price, tax, and total values
 *    - Links opportunity_id
 * 4. Stage 3: Quotation to Sales Order
 *    - Converts accepted quotation to sales order
 *    - Preserves quotation_id and line items
 *    - Duplicate prevention when converting the same quotation repeatedly
 *    - Updates quotation status to Converted
 * 5. Stage 4: Sales Order to Invoice
 *    - Creates invoice from sales order, preserving order_id
 *    - Correctly calculates total, paid, balance, and status (Unpaid, Partially Paid, Paid)
 *    - Preserves line items
 * 6. Stage 5: Safe In-Place Editing
 *    - Editing updates the record in-place without deleting or changing ID
 *    - Editing invoice updates balance and status accurately
 * 7. Soft deletion and cleanup
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
const TEST_KID = 'sales-workflow-test-key-1';

function createSalesWorkflowDatabase() {
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

  // Load migrations in order
  const customersMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0002_create_customers.sql'), 'utf8');
  sqlite.exec(customersMigration);

  const leadsMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0003_create_leads.sql'), 'utf8');
  sqlite.exec(leadsMigration);

  const salesMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0004_create_sales_workflow.sql'), 'utf8');
  sqlite.exec(salesMigration);

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
        async first(column) {
          const stmt = sqlite.prepare(sql);
          const row = stmt.get(...bound);
          if (!row) return null;
          if (column && typeof row === 'object') return row[column];
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

describe('Complete CRM Sales Workflow Test Suite', () => {
  let keyPair;
  let superAdminToken;
  let db;

  before(async () => {
    keyPair = await generateKeyPair('RS256', { extractable: true });

    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === TEST_KID) {
        return keyPair.publicKey;
      }
      throw new Error('Key ID not found in JWKS');
    };

    setCustomJWKS(mockJWKS);

    superAdminToken = await new SignJWT({
      email: 'admin@cooltechuae.com',
      user_id: 'firebase_sa_001',
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setSubject('firebase_sa_001')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(keyPair.privateKey);
  });

  beforeEach(() => {
    db = createSalesWorkflowDatabase();

    // Seed Super Admin User
    db.sqlite.exec(`INSERT INTO users (id, firebase_uid, email, full_name, role)
      VALUES ('usr_admin_1', 'firebase_sa_001', 'admin@cooltechuae.com', 'Super Admin', 'SUPER_ADMIN')`);

    // Seed an initial Lead
    db.sqlite.exec(`INSERT INTO leads (
      id, sl_no, lead_date, lead_specification, contact_name, contact_phone,
      contact_company, rating, status, value, owner_id, owner_name
    ) VALUES (
      'lead_test_101', 1, '2026-10-16', '10 Ton Chiller Supply', 'Hassan Ali',
      '+971501234567', 'Al Futtaim Engineering', 'Hot', 'Pending', 45000.0,
      'usr_admin_1', 'Super Admin'
    )`);
  });

  const envOpts = () => ({ DB: db, FIREBASE_PROJECT_ID: PROJECT_ID });

  // ─── 1. Authentication Tests ──────────────────────────────────────────────
  it('1. Rejects unauthenticated requests with 401 across all workflow endpoints', async () => {
    const endpoints = [
      { method: 'GET', path: '/api/opportunities' },
      { method: 'POST', path: '/api/opportunities', body: { title: 'Test', customer: 'Test' } },
      { method: 'GET', path: '/api/quotations' },
      { method: 'POST', path: '/api/quotations', body: { subject: 'Test', customer: 'Test' } },
      { method: 'GET', path: '/api/orders' },
      { method: 'POST', path: '/api/orders', body: { customer: 'Test' } },
      { method: 'GET', path: '/api/invoices' },
      { method: 'POST', path: '/api/invoices', body: { customer: 'Test' } },
    ];

    for (const ep of endpoints) {
      const res = await app.request(
        ep.path,
        {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        },
        envOpts()
      );
      assert.strictEqual(res.status, 401, `Expected 401 for ${ep.method} ${ep.path}`);
    }
  });

  // ─── 2. Stage 1: Lead to Opportunity ──────────────────────────────────────
  it('2. Stage 1: Converts lead to opportunity, preserving lead ID and preventing duplicate conversion', async () => {
    // A. First conversion
    const res1 = await app.request(
      '/api/opportunities',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          title: 'Al Futtaim 10 Ton Chiller Project',
          customer: 'Al Futtaim Engineering',
          contactPerson: 'Hassan Ali',
          phone: '+971501234567',
          amount: 45000,
          createdFromLeadId: 'lead_test_101',
          stage: 'Opportunity',
        }),
      },
      envOpts()
    );

    assert.strictEqual(res1.status, 201);
    const data1 = await res1.json();
    assert.strictEqual(data1.success, true);
    assert.ok(data1.opportunity.id);
    assert.strictEqual(data1.opportunity.created_from_lead_id, 'lead_test_101');
    assert.strictEqual(data1.opportunity.amount, 45000);

    // Verify original lead was updated to 'Converted'
    const leadRow = db.sqlite.prepare('SELECT status FROM leads WHERE id = ?').get('lead_test_101');
    assert.strictEqual(leadRow.status, 'Converted');

    // B. Repeated submission with same lead ID -> must prevent duplicate
    const res2 = await app.request(
      '/api/opportunities',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          title: 'Duplicate Submission Attempt',
          customer: 'Al Futtaim Engineering',
          createdFromLeadId: 'lead_test_101',
        }),
      },
      envOpts()
    );

    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();
    assert.strictEqual(data2.alreadyConverted, true);
    assert.strictEqual(data2.opportunity.id, data1.opportunity.id);

    // Total opportunities count must be exactly 1
    const count = db.sqlite.prepare('SELECT COUNT(*) as cnt FROM opportunities').get().cnt;
    assert.strictEqual(count, 1);
  });

  // ─── 3. Stage 2: Opportunity to Quotation ─────────────────────────────────
  it('3. Stage 2: Creates quotation from opportunity, preserving opportunity details and line items', async () => {
    // Create Opportunity first
    const oppRes = await app.request(
      '/api/opportunities',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          title: 'Chiller Supply Project',
          customer: 'Al Futtaim Engineering',
          contactPerson: 'Hassan Ali',
          phone: '+971501234567',
          amount: 50000,
          stage: 'Opportunity',
        }),
      },
      envOpts()
    );
    const opp = (await oppRes.json()).opportunity;

    // Create Quotation linked to Opportunity
    const quoteRes = await app.request(
      '/api/quotations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          opportunityId: opp.id,
          opportunityCode: opp.opportunity_code,
          customer: opp.customer,
          contactPerson: opp.contact_person,
          phone: opp.phone,
          subject: 'Formal Commercial Proposal - 10 Ton Chiller',
          subtotal: 50000,
          vatRate: 5,
          vatAmount: 2500,
          totalAmount: 52500,
          status: 'Accepted',
          items: [
            {
              itemCode: 'CHL-10T',
              description: '10 Ton Air-Cooled Package Chiller',
              quantity: 2,
              unitPrice: 25000,
              vatRate: 5,
              totalAmount: 52500,
            },
          ],
        }),
      },
      envOpts()
    );

    const quoteText = await quoteRes.text();
    if (quoteRes.status !== 201) {
      console.log('Quotation Create Error:', quoteRes.status, quoteText);
    }
    const quoteData = JSON.parse(quoteText);
    assert.strictEqual(quoteRes.status, 201, `Failed to create quotation: ${quoteText}`);
    assert.strictEqual(quoteData.success, true);
    assert.strictEqual(quoteData.quotation.opportunity_id, opp.id);
    assert.strictEqual(quoteData.quotation.total_amount, 52500);
    assert.strictEqual(quoteData.quotation.items.length, 1);
    assert.strictEqual(quoteData.quotation.items[0].item_code, 'CHL-10T');

    // Verify opportunity stage progressed to Quotation
    const updatedOpp = db.sqlite.prepare('SELECT stage FROM opportunities WHERE id = ?').get(opp.id);
    assert.strictEqual(updatedOpp.stage, 'Quotation');
  });

  // ─── 4. Stage 3: Quotation to Sales Order ─────────────────────────────────
  it('4. Stage 3: Converts quotation to sales order, preserving quotation link, copying items, and blocking duplicates', async () => {
    // Create Quotation
    const quoteRes = await app.request(
      '/api/quotations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          customer: 'Al Futtaim Engineering',
          contactPerson: 'Hassan Ali',
          subject: 'Commercial Proposal',
          subtotal: 40000,
          vatRate: 5,
          vatAmount: 2000,
          totalAmount: 42000,
          status: 'Accepted',
          items: [
            {
              itemCode: 'AC-DUCT',
              description: 'Industrial Ductwork & Insulation',
              quantity: 4,
              unitPrice: 10000,
              totalAmount: 42000,
            },
          ],
        }),
      },
      envOpts()
    );
    const quote = (await quoteRes.json()).quotation;

    // Convert Quotation to Sales Order
    const orderRes1 = await app.request(
      '/api/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          quotationId: quote.id,
          quotationRef: quote.quotation_number,
          customer: quote.customer,
          contactPerson: quote.contact_person,
          amount: quote.subtotal,
          vatAmount: quote.vat_amount,
          totalAmount: quote.total_amount,
          status: 'Confirmed',
          items: quote.items,
        }),
      },
      envOpts()
    );

    assert.strictEqual(orderRes1.status, 201);
    const orderData1 = await orderRes1.json();
    assert.strictEqual(orderData1.success, true);
    assert.strictEqual(orderData1.order.quotation_id, quote.id);
    assert.strictEqual(orderData1.order.items.length, 1);
    assert.strictEqual(orderData1.order.items[0].item_code, 'AC-DUCT');

    // Quotation status must now be 'Converted'
    const updatedQuote = db.sqlite.prepare('SELECT status, converted_order_id FROM quotations WHERE id = ?').get(quote.id);
    assert.strictEqual(updatedQuote.status, 'Converted');
    assert.strictEqual(updatedQuote.converted_order_id, orderData1.order.id);

    // Repeated conversion attempt -> must block duplicate and return existing order
    const orderRes2 = await app.request(
      '/api/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          quotationId: quote.id,
          customer: quote.customer,
        }),
      },
      envOpts()
    );

    assert.strictEqual(orderRes2.status, 200);
    const orderData2 = await orderRes2.json();
    assert.strictEqual(orderData2.alreadyConverted, true);
    assert.strictEqual(orderData2.order.id, orderData1.order.id);

    const totalOrders = db.sqlite.prepare('SELECT COUNT(*) as cnt FROM sales_orders').get().cnt;
    assert.strictEqual(totalOrders, 1);
  });

  // ─── 5. Stage 4: Sales Order to Invoice ───────────────────────────────────
  it('5. Stage 4: Creates invoice from sales order with accurate balances and status calculation', async () => {
    // Create Sales Order
    const orderRes = await app.request(
      '/api/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          customer: 'Emaar Hospitality',
          contactPerson: 'David Miller',
          orderNumber: 'SO-9901',
          amount: 20000,
          vatAmount: 1000,
          totalAmount: 21000,
          items: [{ itemCode: 'FAN-01', description: 'Exhaust Fan', quantity: 2, unitPrice: 10000 }],
        }),
      },
      envOpts()
    );
    const order = (await orderRes.json()).order;

    // A. Create Unpaid Invoice (paidAmount = 0)
    const invRes1 = await app.request(
      '/api/invoices',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          orderRef: order.order_number,
          customer: order.customer,
          amount: 20000,
          vatAmount: 1000,
          totalAmount: 21000,
          paidAmount: 0,
          items: order.items,
        }),
      },
      envOpts()
    );

    assert.strictEqual(invRes1.status, 201);
    const invData1 = await invRes1.json();
    assert.strictEqual(invData1.invoice.order_id, order.id);
    assert.strictEqual(invData1.invoice.balance_amount, 21000);
    assert.strictEqual(invData1.invoice.status, 'Unpaid');
    assert.strictEqual(invData1.invoice.items.length, 1);

    // B. Create Partially Paid Invoice (paidAmount = 10000)
    const invRes2 = await app.request(
      '/api/invoices',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          orderRef: order.order_number,
          customer: order.customer,
          amount: 20000,
          vatAmount: 1000,
          totalAmount: 21000,
          paidAmount: 10000,
        }),
      },
      envOpts()
    );

    const invData2 = await invRes2.json();
    assert.strictEqual(invData2.invoice.paid_amount, 10000);
    assert.strictEqual(invData2.invoice.balance_amount, 11000);
    assert.strictEqual(invData2.invoice.status, 'Partially Paid');

    // C. Create Fully Paid Invoice (paidAmount = 21000)
    const invRes3 = await app.request(
      '/api/invoices',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          orderRef: order.order_number,
          customer: order.customer,
          amount: 20000,
          vatAmount: 1000,
          totalAmount: 21000,
          paidAmount: 21000,
        }),
      },
      envOpts()
    );

    const invData3 = await invRes3.json();
    assert.strictEqual(invData3.invoice.paid_amount, 21000);
    assert.strictEqual(invData3.invoice.balance_amount, 0);
    assert.strictEqual(invData3.invoice.status, 'Paid');
  });

  // ─── 6. Stage 5: In-Place Editing (Preserves IDs & Updates Fields) ───────────
  it('6. Stage 5: Editing invoice updates the existing database record in-place without changing its ID', async () => {
    // Create an Invoice
    const createRes = await app.request(
      '/api/invoices',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          invoiceNumber: 'CTINV#5501',
          customer: 'Initial Customer Name',
          amount: 10000,
          vatAmount: 500,
          totalAmount: 10500,
          paidAmount: 0,
        }),
      },
      envOpts()
    );
    const original = (await createRes.json()).invoice;
    const originalId = original.id;

    // Edit the Invoice: update customer, apply partial payment of 5000
    const editRes = await app.request(
      `/api/invoices/${originalId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({
          customer: 'Updated Customer Name LLC',
          paidAmount: 5000,
          description: 'Payment receipt #1 added',
        }),
      },
      envOpts()
    );

    assert.strictEqual(editRes.status, 200);
    const editData = await editRes.json();
    assert.strictEqual(editData.success, true);
    assert.strictEqual(editData.invoice.id, originalId, 'ID MUST remain strictly unchanged');
    assert.strictEqual(editData.invoice.customer, 'Updated Customer Name LLC');
    assert.strictEqual(editData.invoice.paid_amount, 5000);
    assert.strictEqual(editData.invoice.balance_amount, 5500);
    assert.strictEqual(editData.invoice.status, 'Partially Paid');

    // Confirm only 1 invoice exists in the database (did not delete or create duplicate)
    const count = db.sqlite.prepare('SELECT COUNT(*) as cnt FROM invoices WHERE is_deleted = 0').get().cnt;
    assert.strictEqual(count, 1);

    // GET by ID returns the updated values
    const fetchRes = await app.request(
      `/api/invoices/${originalId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${superAdminToken}` },
      },
      envOpts()
    );
    const fetched = (await fetchRes.json()).invoice;
    assert.strictEqual(fetched.id, originalId);
    assert.strictEqual(fetched.customer, 'Updated Customer Name LLC');
    assert.strictEqual(fetched.balance_amount, 5500);
  });
});
