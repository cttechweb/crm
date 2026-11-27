-- Migration: 0013_add_retailer_applications.sql
-- Description: Schema for B2B Retailer Applications in Cool Technologies CRM
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Dedicated additive migration. No existing CRM tables or records modified.

CREATE TABLE IF NOT EXISTS retailer_applications (
    id TEXT PRIMARY KEY,
    website_application_id TEXT UNIQUE NOT NULL,
    website_user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    legal_name TEXT,
    trade_license_number TEXT NOT NULL,
    tax_registration_number TEXT,
    business_type TEXT DEFAULT 'contractor',
    emirate TEXT,
    city TEXT,
    address TEXT,
    contact_person TEXT NOT NULL,
    designation TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    interested_categories TEXT,
    annual_volume_estimate TEXT,
    payment_terms_requested TEXT,
    trade_license_url TEXT,
    tax_certificate_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    rejection_reason TEXT,
    review_notes TEXT,
    reviewed_by_id TEXT REFERENCES users(id),
    reviewed_by_name TEXT,
    reviewed_at TEXT,
    customer_id TEXT REFERENCES customers(id),
    idempotency_key TEXT UNIQUE,
    last_event_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_retailer_apps_status ON retailer_applications(status);
CREATE INDEX IF NOT EXISTS idx_retailer_apps_email ON retailer_applications(email);
CREATE INDEX IF NOT EXISTS idx_retailer_apps_created ON retailer_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_retailer_apps_web_id ON retailer_applications(website_application_id);
CREATE INDEX IF NOT EXISTS idx_retailer_apps_idempotency ON retailer_applications(idempotency_key);
