-- Migration: 0003_create_leads.sql
-- Description: Schema for leads, lead_notes, and lead_activity_logs tables
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Additive only. Preserves all existing tables (users, customers, customer_contacts).

-- ============================================================================
-- 1. LEADS TABLE
-- Primary commercial lead acquisition and lifecycle management
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
    -- Primary Identity & Sequential Ordering
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    lead_date TEXT NOT NULL,
    assigned_date TEXT,
    lead_specification TEXT NOT NULL,

    -- Contact Information
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    contact_company TEXT NOT NULL,
    contact_whatsapp TEXT,
    contact_salutation TEXT DEFAULT 'Mr.',
    contact_designation TEXT,
    contact_personal_mobile TEXT,
    contact_nationality TEXT,
    contact_telephone TEXT,
    contact_website TEXT,

    -- Status & Qualification Pipeline
    rating TEXT NOT NULL DEFAULT 'Cold',
    status TEXT NOT NULL DEFAULT 'Pending',
    value REAL NOT NULL DEFAULT 0,

    -- Attribution & Marketing
    source TEXT,
    source_name TEXT,
    campaign TEXT,
    business_opportunity TEXT,
    location TEXT,
    tags TEXT,
    comments TEXT,
    last_activity TEXT,
    last_activity_date TEXT,

    -- Staff Allocation & RBAC Scoping
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    owner_name TEXT,
    owner_avatar TEXT,
    created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by_name TEXT,
    assigned_employee TEXT,
    assigned_manager TEXT,
    department TEXT,

    -- Soft Deletion & Audit Trail
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,

    -- Timestamp Tracking
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 2. LEAD NOTES TABLE
-- Contextual notes and comment entries attached to a lead
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_notes (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 3. LEAD ACTIVITY LOGS TABLE
-- Complete audit trail of stage changes, rating changes, and comments
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_activity_logs (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    note TEXT,
    old_status TEXT,
    new_status TEXT,
    old_rating TEXT,
    new_rating TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 4. PERFORMANCE & SCOPING INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by_id ON leads(created_by_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_rating ON leads(rating);
CREATE INDEX IF NOT EXISTS idx_leads_is_deleted ON leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead_id ON lead_activity_logs(lead_id);
