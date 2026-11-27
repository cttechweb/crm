-- Migration: 0002_create_customers.sql
-- Description: Refined schema for customers and customer_contacts tables
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Dedicated CRM database only. No e-commerce resources touched.

-- ============================================================================
-- 1. CUSTOMERS TABLE
-- Primary B2B and B2C commercial client records for Cool Technologies CRM
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    -- Primary Identity & Sequential Ordering
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    customer_name TEXT NOT NULL,
    company_name TEXT,
    trn TEXT,
    company_group TEXT,
    industry_type TEXT,
    category TEXT,
    parent_customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    parent_customer_name TEXT,

    -- Primary Contact Information
    contact_person TEXT NOT NULL,
    salutation TEXT DEFAULT 'Mr.',
    email TEXT,
    phone TEXT NOT NULL,
    mobile TEXT,
    website TEXT,

    -- Physical Location (UAE Regional Standards)
    address TEXT,
    city TEXT DEFAULT 'Dubai',
    state_region TEXT DEFAULT 'Dubai',
    country TEXT DEFAULT 'United Arab Emirates',
    location TEXT,

    -- Status, Classification & Commercial Attributes
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Prospect')),
    type TEXT NOT NULL DEFAULT 'Customer' CHECK (type IN ('Customer', 'Prospect')),
    key_customer INTEGER NOT NULL DEFAULT 0 CHECK (key_customer IN (0, 1)),
    is_supplier INTEGER NOT NULL DEFAULT 0 CHECK (is_supplier IN (0, 1)),
    no_of_employees TEXT,
    source TEXT,
    source_name TEXT,
    campaign TEXT,
    tags TEXT,
    comments TEXT,

    -- Operational & Service Fields (Service / Maintenance module alignment)
    contract_status TEXT,
    last_visit_date TEXT,
    assigned_equipment_count INTEGER NOT NULL DEFAULT 0,
    active_jobs_count INTEGER NOT NULL DEFAULT 0,
    sla_level TEXT,

    -- Ownership & RBAC Scoping (Foreign Keys to users table)
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    owner_name TEXT,
    owner_avatar TEXT,
    created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by_name TEXT,
    created_from_lead_id TEXT,
    assigned_date TEXT,
    date TEXT,

    -- Cached Financial & Engagement Metrics (Optimized for instant table listing)
    total_spend REAL NOT NULL DEFAULT 0,
    outstanding REAL NOT NULL DEFAULT 0,
    total_deals INTEGER NOT NULL DEFAULT 0,
    open_enquiries INTEGER NOT NULL DEFAULT 0,
    last_enquiry TEXT,
    last_order TEXT,
    last_activity TEXT,

    -- Lifecycle & Soft Deletion (Guarantees historical data preservation)
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,

    -- System Audit Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 2. CUSTOMER CONTACTS TABLE
-- Child table supporting multiple contact persons per customer (Customer 360°)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_contacts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    salutation TEXT DEFAULT 'Mr.',
    name TEXT NOT NULL,
    designation TEXT,
    email TEXT,
    business_mobile TEXT,
    personal_mobile TEXT,
    spoken_language TEXT,
    nationality TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE, FILTERING & RBAC ENFORCEMENT
-- ============================================================================
-- Soft deletion filtering (Included in all standard queries)
CREATE INDEX IF NOT EXISTS idx_customers_active_status ON customers(is_deleted, status);

-- Role-based data scoping (Fast filtering by owner / creator)
CREATE INDEX IF NOT EXISTS idx_customers_owner ON customers(is_deleted, owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(is_deleted, created_by_id);

-- UI Filter tabs and sorting
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(is_deleted, type);
CREATE INDEX IF NOT EXISTS idx_customers_sl_no ON customers(sl_no);

-- Search by text fields
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Contacts lookup by parent customer
CREATE INDEX IF NOT EXISTS idx_customer_contacts_cust ON customer_contacts(customer_id, is_deleted);
