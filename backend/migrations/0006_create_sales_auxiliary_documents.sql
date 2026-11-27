-- Migration: 0006_create_sales_auxiliary_documents.sql
-- Description: Schema for Proforma Invoices, Receipts, and Delivery Notes
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Strictly additive. Preserves all existing tables and records.

-- ============================================================================
-- 1. PROFORMA INVOICES TABLE & ITEMS
-- Commercial pre-invoice document
-- ============================================================================
CREATE TABLE IF NOT EXISTS proforma_invoices (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    pi_number TEXT UNIQUE NOT NULL,
    quotation_ref TEXT,
    quotation_id TEXT REFERENCES quotations(id) ON DELETE SET NULL,
    opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
    opportunity_title TEXT,
    customer TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    issue_date TEXT NOT NULL,
    payment_terms TEXT,
    amount REAL NOT NULL DEFAULT 0,
    vat_type TEXT DEFAULT 'With VAT',
    vat_rate REAL DEFAULT 5,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    discount REAL DEFAULT 0,
    adjustment REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Converted', 'Cancelled', 'Draft')),
    prepared_by TEXT,
    prepared_by_mobile TEXT,
    owner TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    owner_avatar TEXT,
    phone TEXT,
    location TEXT,
    attention TEXT,
    trn_number TEXT,
    lpo_number TEXT,
    lpo_date TEXT,
    remarks TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proforma_pi_number ON proforma_invoices(pi_number);
CREATE INDEX IF NOT EXISTS idx_proforma_quotation_id ON proforma_invoices(quotation_id);
CREATE INDEX IF NOT EXISTS idx_proforma_customer ON proforma_invoices(customer);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma_invoices(status);
CREATE INDEX IF NOT EXISTS idx_proforma_is_deleted ON proforma_invoices(is_deleted);

CREATE TABLE IF NOT EXISTS proforma_invoice_items (
    id TEXT PRIMARY KEY,
    proforma_id TEXT NOT NULL REFERENCES proforma_invoices(id) ON DELETE CASCADE,
    code TEXT,
    description TEXT NOT NULL,
    brand TEXT,
    unit TEXT DEFAULT 'Pcs',
    qty REAL NOT NULL DEFAULT 1,
    price REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_proforma_items_proforma_id ON proforma_invoice_items(proforma_id);

-- ============================================================================
-- 2. RECEIPTS TABLE
-- Payment collection receipts against invoices or advances
-- ============================================================================
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    receipt_number TEXT UNIQUE NOT NULL,
    invoice_ref TEXT,
    invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
    customer TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    contact_person TEXT,
    phone TEXT,
    created_by TEXT,
    created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by_avatar TEXT,
    receipt_type TEXT DEFAULT 'Against Invoice',
    tags TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Bank Transfer' CHECK (payment_method IN ('Bank Transfer', 'Cheque', 'Credit Card', 'Cash')),
    receipt_date TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'Cleared' CHECK (status IN ('Cleared', 'Pending Clearance', 'Bounced', 'Cancelled')),
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_id ON receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_receipts_customer ON receipts(customer);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_is_deleted ON receipts(is_deleted);

-- ============================================================================
-- 3. DELIVERY NOTES TABLE & ITEMS
-- Physical goods delivery and site dispatch notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_notes (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    delivery_note_number TEXT UNIQUE NOT NULL,
    owner TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    owner_avatar TEXT,
    order_ref TEXT,
    order_id TEXT REFERENCES sales_orders(id) ON DELETE SET NULL,
    order_description TEXT,
    customer TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    invoice_ref TEXT,
    invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
    dn_type TEXT DEFAULT 'Customer DN',
    location TEXT,
    received_by TEXT,
    received_phone TEXT,
    cost_updated INTEGER NOT NULL DEFAULT 0 CHECK (cost_updated IN (0, 1)),
    site_location TEXT,
    driver_name TEXT,
    vehicle_number TEXT,
    dispatch_date TEXT NOT NULL,
    items_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Out for Delivery', 'Delivered', 'Returned')),
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_delivery_notes_dn_number ON delivery_notes(delivery_note_number);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_order_id ON delivery_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_customer ON delivery_notes(customer);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_status ON delivery_notes(status);
CREATE INDEX IF NOT EXISTS idx_delivery_notes_is_deleted ON delivery_notes(is_deleted);

CREATE TABLE IF NOT EXISTS delivery_note_items (
    id TEXT PRIMARY KEY,
    delivery_note_id TEXT NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
    item_code TEXT,
    description TEXT NOT NULL,
    unit TEXT DEFAULT 'Pcs',
    quantity REAL NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_delivery_items_dn_id ON delivery_note_items(delivery_note_id);
