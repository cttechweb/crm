-- Migration 0008: Create Settings, Targets, and Opportunity Stages Tables
-- Target Database: cool-tech-crm-db (Cloudflare D1)
-- Scope: System & Company Settings, Lead Sources, Target Industries, User Targets, Company Targets, Opportunity Stages, Opportunity Lost Reasons
-- SAFETY NOTICE: Dedicated CRM tables only. Completely isolated from e-commerce database.

-- 1. COMPANY SETTINGS TABLE (Singleton profile record)
CREATE TABLE IF NOT EXISTS company_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'Cool Technologies LLC',
  legal_entity TEXT NOT NULL DEFAULT 'Cool Technologies LLC',
  trn TEXT DEFAULT '100349284900003',
  operating_region TEXT DEFAULT 'United Arab Emirates (AED / +971)',
  primary_email TEXT DEFAULT 'support@cooltechuae.com',
  phone TEXT DEFAULT '+971 4 000 0000',
  address TEXT DEFAULT 'Dubai, United Arab Emirates',
  currency TEXT DEFAULT 'AED',
  vat_rate REAL DEFAULT 5.0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Seed default company profile
INSERT OR IGNORE INTO company_settings (
  id, company_name, legal_entity, trn, operating_region, primary_email, phone, address, currency, vat_rate, created_at, updated_at
) VALUES (
  'default', 'Cool Technologies LLC', 'Cool Technologies LLC', '100349284900003', 'United Arab Emirates (AED / +971)', 'support@cooltechuae.com', '+971 4 000 0000', 'Dubai, United Arab Emirates', 'AED', 5.0, datetime('now'), datetime('now')
);

-- 2. SYSTEM SETTINGS KEY-VALUE TABLE
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  updated_by TEXT,
  updated_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. LEAD SOURCES TABLE
CREATE TABLE IF NOT EXISTS lead_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_sources_name ON lead_sources(name);
CREATE INDEX IF NOT EXISTS idx_lead_sources_deleted ON lead_sources(is_deleted);

-- Seed initial lead sources
INSERT OR IGNORE INTO lead_sources (id, name, is_active, sort_order, is_deleted, created_at, updated_at) VALUES
('src_1', 'Direct Website Inquiry', 1, 1, 0, datetime('now'), datetime('now')),
('src_2', 'LinkedIn Campaign / InMail', 1, 2, 0, datetime('now'), datetime('now')),
('src_3', 'Cold Call / Outreach', 1, 3, 0, datetime('now'), datetime('now')),
('src_4', 'Existing Customer Referral', 1, 4, 0, datetime('now'), datetime('now')),
('src_5', 'Trade Show / Gitex Expo', 1, 5, 0, datetime('now'), datetime('now')),
('src_6', 'Google Ads / Search SEM', 1, 6, 0, datetime('now'), datetime('now')),
('src_7', 'Partner / Reseller Channel', 1, 7, 0, datetime('now'), datetime('now'));

-- 4. TARGET INDUSTRIES TABLE
CREATE TABLE IF NOT EXISTS target_industries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_target_industries_name ON target_industries(name);
CREATE INDEX IF NOT EXISTS idx_target_industries_deleted ON target_industries(is_deleted);

-- Seed initial target industries
INSERT OR IGNORE INTO target_industries (id, name, is_active, sort_order, is_deleted, created_at, updated_at) VALUES
('ind_1', 'Construction & Civil Engineering', 1, 1, 0, datetime('now'), datetime('now')),
('ind_2', 'Information Technology & Software', 1, 2, 0, datetime('now'), datetime('now')),
('ind_3', 'Oil & Gas / Petrochemicals', 1, 3, 0, datetime('now'), datetime('now')),
('ind_4', 'Hospitality & Luxury Hotels', 1, 4, 0, datetime('now'), datetime('now')),
('ind_5', 'Healthcare & Medical Devices', 1, 5, 0, datetime('now'), datetime('now')),
('ind_6', 'Retail & FMCG Distribution', 1, 6, 0, datetime('now'), datetime('now')),
('ind_7', 'Logistics & Marine Freight', 1, 7, 0, datetime('now'), datetime('now'));

-- 5. USER SALES TARGETS TABLE
CREATE TABLE IF NOT EXISTS user_targets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  role TEXT,
  period TEXT DEFAULT 'Q1 - 2026',
  year INTEGER NOT NULL DEFAULT 2026,
  month INTEGER,
  quarter INTEGER,
  deals INTEGER NOT NULL DEFAULT 0,
  target_rev REAL NOT NULL DEFAULT 0,
  closed_rev REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_targets_user ON user_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_targets_name ON user_targets(user_name);
CREATE INDEX IF NOT EXISTS idx_user_targets_year ON user_targets(year);
CREATE INDEX IF NOT EXISTS idx_user_targets_deleted ON user_targets(is_deleted);

-- 6. COMPANY TARGETS TABLE (Monthly / Quarterly Company Quotas)
CREATE TABLE IF NOT EXISTS company_targets (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  sale_target REAL NOT NULL DEFAULT 0,
  profit_target REAL,
  invoice_target REAL,
  collection_target REAL,
  year INTEGER DEFAULT 2026,
  created_by TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_company_targets_month ON company_targets(month);
CREATE INDEX IF NOT EXISTS idx_company_targets_year ON company_targets(year);
CREATE INDEX IF NOT EXISTS idx_company_targets_deleted ON company_targets(is_deleted);

-- 7. OPPORTUNITY PIPELINE STAGES TABLE
CREATE TABLE IF NOT EXISTS opportunity_stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL,
  color TEXT NOT NULL,
  text_color TEXT DEFAULT '#FFFFFF',
  probability INTEGER NOT NULL DEFAULT 0,
  stage_order INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_opportunity_stages_order ON opportunity_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_opportunity_stages_deleted ON opportunity_stages(is_deleted);

-- Seed initial opportunity pipeline stages
INSERT OR IGNORE INTO opportunity_stages (id, name, abbreviation, color, text_color, probability, stage_order, is_system, is_deleted, created_at, updated_at) VALUES
('stage_1', 'Prospecting / Discovery', 'DISC', '#64748b', '#64748b', 10, 1, 1, 0, datetime('now'), datetime('now')),
('stage_2', 'Qualification & Needs Assessment', 'QUAL', '#3b82f6', '#3b82f6', 25, 2, 1, 0, datetime('now'), datetime('now')),
('stage_3', 'Quotation / Proposal Sent', 'PROP', '#eab308', '#eab308', 50, 3, 1, 0, datetime('now'), datetime('now')),
('stage_4', 'Commercial Negotiation', 'NEGO', '#f97316', '#f97316', 75, 4, 1, 0, datetime('now'), datetime('now')),
('stage_5', 'Closed Won (Deal Signed)', 'WON', '#22c55e', '#22c55e', 100, 5, 1, 0, datetime('now'), datetime('now')),
('stage_6', 'Closed Lost / Dropped', 'LOST', '#ef4444', '#ef4444', 0, 6, 1, 0, datetime('now'), datetime('now'));

-- 8. OPPORTUNITY LOST REASONS TABLE
CREATE TABLE IF NOT EXISTS opportunity_lost_reasons (
  id TEXT PRIMARY KEY,
  reason TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_opportunity_lost_reasons_deleted ON opportunity_lost_reasons(is_deleted);

-- Seed initial lost reasons
INSERT OR IGNORE INTO opportunity_lost_reasons (id, reason, description, is_active, is_deleted, created_at, updated_at) VALUES
('lr_1', 'Competitor Price was significantly lower', 'Client selected alternate vendor quoting lower capital cost', 1, 0, datetime('now'), datetime('now')),
('lr_2', 'Budget constraint / Project canceled by client', 'Capital expenditure paused or rescinded by client finance committee', 1, 0, datetime('now'), datetime('now')),
('lr_3', 'Feature / Specification mismatch', 'HVAC engineering specifications did not meet strict architectural requirements', 1, 0, datetime('now'), datetime('now')),
('lr_4', 'Delivery timeline too long', 'Client required immediate delivery ahead of procurement lead times', 1, 0, datetime('now'), datetime('now')),
('lr_5', 'Client went with incumbent vendor', 'Existing long-term service contract maintained by customer', 1, 0, datetime('now'), datetime('now')),
('lr_6', 'Lack of executive sponsor / change of management', 'Key stakeholder left organization leading to project stall', 1, 0, datetime('now'), datetime('now'));
