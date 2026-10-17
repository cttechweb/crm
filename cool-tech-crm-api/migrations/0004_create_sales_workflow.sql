-- Migration: 0004_create_sales_workflow.sql
-- Description: Complete sales pipeline schema for Opportunities, Quotations, Sales Orders, and Invoices
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Additive only. Preserves all existing tables (users, customers, leads).

-- ============================================================================
-- 1. OPPORTUNITIES TABLE
-- Stage 2 of CRM Sales Pipeline (Lead -> Opportunity)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    opportunity_code TEXT,
    created_from_lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    customer TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    whatsapp TEXT,
    amount REAL NOT NULL DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'Opportunity',
    probability INTEGER NOT NULL DEFAULT 50,
    expected_close TEXT,
    owner TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    campaign TEXT,
    source TEXT,
    vat_type TEXT DEFAULT 'With VAT',
    vat_rate REAL DEFAULT 5,
    adjustment REAL DEFAULT 0,
    lpo_number TEXT,
    lpo_date TEXT,
    location TEXT,
    reference TEXT,
    comments TEXT,
    tags TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(created_from_lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_customer ON opportunities(customer);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);

-- ============================================================================
-- 2. QUOTATIONS TABLE & ITEMS
-- Stage 3 of CRM Sales Pipeline (Opportunity -> Quotation / Commercial Offer)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    quotation_number TEXT UNIQUE NOT NULL,
    customer TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
    opportunity_code TEXT,
    subject TEXT NOT NULL,
    quote_date TEXT NOT NULL,
    valid_until TEXT,
    subtotal REAL NOT NULL DEFAULT 0,
    discount_total REAL NOT NULL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 5,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Draft',
    owner TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    customer_notes TEXT,
    converted_order_id TEXT,
    sales_order_number TEXT,
    converted_at TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quotations_opp_id ON quotations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

CREATE TABLE IF NOT EXISTS quotation_items (
    id TEXT PRIMARY KEY,
    quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id TEXT,
    item_code TEXT,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Pcs',
    unit_price REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 5,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quote_id ON quotation_items(quotation_id);

-- ============================================================================
-- 3. SALES ORDERS TABLE & ITEMS
-- Stage 4 of CRM Sales Pipeline (Quotation -> Sales Order)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    order_number TEXT UNIQUE NOT NULL,
    quotation_ref TEXT,
    quotation_id TEXT REFERENCES quotations(id) ON DELETE SET NULL,
    opportunity_ref TEXT,
    customer TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    order_date TEXT NOT NULL,
    delivery_due_date TEXT,
    po_reference TEXT,
    amount REAL NOT NULL DEFAULT 0,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    profit REAL NOT NULL DEFAULT 0,
    receivable REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    owner TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to TEXT,
    subject TEXT,
    notes TEXT,
    payment_terms TEXT,
    delivery_terms TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_quote_id ON sales_orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id TEXT,
    item_code TEXT,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Pcs',
    unit_price REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 5,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(order_id);

-- ============================================================================
-- 4. INVOICES TABLE & ITEMS
-- Stage 5 of CRM Sales Pipeline (Sales Order -> Invoice)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    invoice_number TEXT UNIQUE NOT NULL,
    order_ref TEXT,
    order_id TEXT REFERENCES sales_orders(id) ON DELETE SET NULL,
    opportunity_order_ref TEXT,
    customer TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    attention TEXT,
    location TEXT,
    trn_number TEXT,
    lpo_number TEXT,
    lpo_date TEXT,
    reference_number TEXT,
    description TEXT,
    issue_date TEXT NOT NULL,
    due_date TEXT,
    amount REAL NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    adjustment REAL NOT NULL DEFAULT 0,
    vat_type TEXT DEFAULT 'With VAT',
    vat_rate REAL DEFAULT 5,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    paid_amount REAL NOT NULL DEFAULT 0,
    balance_amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Unpaid',
    terms_conditions TEXT,
    owner TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    code TEXT,
    description TEXT NOT NULL,
    brand TEXT,
    unit TEXT DEFAULT 'Pcs',
    qty REAL NOT NULL DEFAULT 1,
    price REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
