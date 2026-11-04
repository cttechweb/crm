-- Migration: 0010_procurement_governance_core.sql
-- Description: Core Schema for Procurement Governance, MSRF Requisitions, Financial Approvals, Approver Delegations, 3-Way Invoicing, and Audit Logging
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- SAFETY NOTICE: Dedicated CRM database only. No e-commerce or sales workflow tables touched.
-- Backward-compatible: Uses CREATE TABLE IF NOT EXISTS. ALTER TABLE adds nullable/defaulted columns.

-- ============================================================================
-- 1. MATERIAL / SERVICE REQUEST FORMS (MSRF) MASTER TABLE
-- Upstream requisition initiating the procurement lifecycle
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_service_requests (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  msrf_number TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  requestor_id TEXT NOT NULL REFERENCES users(id),
  requestor_name TEXT NOT NULL,
  department TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  purpose TEXT NOT NULL,
  required_by_date TEXT NOT NULL,
  sales_order_id TEXT REFERENCES sales_orders(id) ON DELETE SET NULL,
  sales_order_number TEXT,
  project_name TEXT,
  estimated_total_value REAL NOT NULL DEFAULT 0,
  
  -- Stage 2: Reporting Head Authorization
  reporting_head_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reporting_head_name TEXT,
  reporting_head_status TEXT NOT NULL DEFAULT 'Pending' CHECK (reporting_head_status IN ('Pending', 'Approved', 'Rejected', 'More_Info_Required')),
  reporting_head_decision_at TEXT,
  reporting_head_remarks TEXT,

  -- Stage 3 & 4: Procurement Intake & Stock Verification
  procurement_status TEXT NOT NULL DEFAULT 'Awaiting_Intake' CHECK (procurement_status IN (
    'Awaiting_Intake', 'Intake_Accepted', 'Stock_Verified', 'Sourcing', 'Recommendation_Prepared', 'Closed', 'Cancelled'
  )),
  assigned_buyer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_buyer_name TEXT,
  stock_verification_status TEXT DEFAULT 'Unverified' CHECK (stock_verification_status IN (
    'Unverified', 'Full_Stock_Available', 'Partial_Stock_Available', 'No_Stock_Available'
  )),

  -- Stage 15 & 16: Requestor Confirmation & Closure
  requestor_confirmed_at TEXT,
  requestor_feedback TEXT,
  is_closed INTEGER NOT NULL DEFAULT 0 CHECK (is_closed IN (0, 1)),
  closed_at TEXT,
  closed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,

  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_msrf_number ON material_service_requests(msrf_number);
CREATE INDEX IF NOT EXISTS idx_msrf_requestor ON material_service_requests(requestor_id);
CREATE INDEX IF NOT EXISTS idx_msrf_rep_head ON material_service_requests(reporting_head_id);
CREATE INDEX IF NOT EXISTS idx_msrf_so_id ON material_service_requests(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_msrf_status ON material_service_requests(reporting_head_status, procurement_status);

-- ============================================================================
-- 2. MSRF LINE ITEMS TABLE
-- Line items requested and verified available vs. required to procure
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_service_request_items (
  id TEXT PRIMARY KEY,
  msrf_id TEXT NOT NULL REFERENCES material_service_requests(id) ON DELETE CASCADE,
  item_code TEXT,
  description TEXT NOT NULL,
  unit TEXT DEFAULT 'Pcs',
  brand_preference TEXT,
  requested_qty REAL NOT NULL DEFAULT 1,
  available_stock_qty REAL NOT NULL DEFAULT 0,
  procure_qty REAL NOT NULL DEFAULT 1,
  estimated_unit_rate REAL NOT NULL DEFAULT 0,
  estimated_total_amount REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_msrf_items_msrf_id ON material_service_request_items(msrf_id);

-- ============================================================================
-- 3. APPROVER DELEGATIONS TABLE
-- Formal temporary executive sign-off delegations for FC and COO
-- ============================================================================
CREATE TABLE IF NOT EXISTS approver_delegations (
  id TEXT PRIMARY KEY,
  delegator_id TEXT NOT NULL REFERENCES users(id),
  delegator_name TEXT NOT NULL,
  delegator_designation TEXT NOT NULL,
  delegate_id TEXT NOT NULL REFERENCES users(id),
  delegate_name TEXT NOT NULL,
  delegate_designation TEXT,
  approval_tier TEXT NOT NULL CHECK (approval_tier IN ('FINANCE_CONTROLLER', 'CHIEF_OPERATING_OFFICER')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  reason TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ad_delegator ON approver_delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_ad_delegate ON approver_delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_ad_active_tier ON approver_delegations(approval_tier, is_active);

-- ============================================================================
-- 4. PURCHASE APPROVAL AUDIT TABLE
-- Immutable server-enforced sign-off records (< 100k FC vs >= 100k COO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_approvals (
  id TEXT PRIMARY KEY,
  record_type TEXT NOT NULL CHECK (record_type IN ('PURCHASE_ORDER', 'PURCHASE_RECOMMENDATION')),
  record_id TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  total_evaluated_value REAL NOT NULL,
  required_authority TEXT NOT NULL CHECK (required_authority IN ('FINANCE_CONTROLLER', 'CHIEF_OPERATING_OFFICER')),
  approver_id TEXT NOT NULL REFERENCES users(id),
  approver_name TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  approver_designation TEXT NOT NULL,
  is_delegated INTEGER NOT NULL DEFAULT 0 CHECK (is_delegated IN (0, 1)),
  delegation_id TEXT REFERENCES approver_delegations(id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('Approved', 'Rejected', 'Returned_For_Clarification')),
  decision_at TEXT NOT NULL DEFAULT (datetime('now')),
  comments TEXT,
  signature_hash TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_pa_record ON purchase_approvals(record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_pa_approver ON purchase_approvals(approver_id);

-- ============================================================================
-- 5. SUPPLIER QUOTATIONS TABLE
-- Sourcing quotes (< 10k: 1 quote min; >= 10k: 3 quotes min)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_quotations (
  id TEXT PRIMARY KEY,
  msrf_id TEXT REFERENCES material_service_requests(id) ON DELETE CASCADE,
  quotation_ref TEXT NOT NULL,
  quotation_date TEXT NOT NULL,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  currency TEXT DEFAULT 'AED',
  subtotal REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  shipping_delivery_cost REAL NOT NULL DEFAULT 0,
  installation_cost REAL NOT NULL DEFAULT 0,
  other_associated_costs REAL NOT NULL DEFAULT 0,
  landed_total_value REAL NOT NULL DEFAULT 0,
  delivery_lead_time_days INTEGER DEFAULT 7,
  payment_terms TEXT,
  validity_date TEXT,
  is_recommended INTEGER NOT NULL DEFAULT 0 CHECK (is_recommended IN (0, 1)),
  recommendation_reason TEXT,
  quote_document_url TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sq_msrf_id ON supplier_quotations(msrf_id);
CREATE INDEX IF NOT EXISTS idx_sq_supplier_id ON supplier_quotations(supplier_id);

-- ============================================================================
-- 6. SUPPLIER INVOICES (3-WAY MATCHING) TABLE
-- Vendor invoices verified against PO rates and GRN quantities
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_invoices (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  invoice_number TEXT NOT NULL,
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  purchase_order_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  purchase_order_number TEXT,
  grn_id TEXT REFERENCES stock_in_vouchers(id) ON DELETE SET NULL,
  grn_number TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  vat_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  amount_paid REAL NOT NULL DEFAULT 0,
  balance_due REAL NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'Due' CHECK (payment_status IN ('Due', 'Partially_Paid', 'Paid')),
  matching_status TEXT NOT NULL DEFAULT 'Pending_Audit' CHECK (matching_status IN (
    'Pending_Audit', 'Verified_Matching', 'Price_Discrepancy', 'Quantity_Discrepancy', 'Approved'
  )),
  notes TEXT,
  invoice_file_url TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_si_invoice_number ON supplier_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_si_po_id ON supplier_invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_si_supplier ON supplier_invoices(supplier_id);

-- ============================================================================
-- 7. SUPPLIER PAYMENTS & SETTLEMENTS TABLE
-- Disbursement vouchers recording payments to suppliers
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_payments (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  voucher_number TEXT NOT NULL UNIQUE,
  payment_date TEXT NOT NULL,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Bank_Transfer', 'Cheque', 'Cash', 'Credit_Card')),
  bank_name TEXT,
  reference_no TEXT,
  cheque_number TEXT,
  cheque_date TEXT,
  amount REAL NOT NULL DEFAULT 0,
  notes TEXT,
  prepared_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Bounced', 'Void')),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sp_voucher_number ON supplier_payments(voucher_number);
CREATE INDEX IF NOT EXISTS idx_sp_supplier_id ON supplier_payments(supplier_id);

-- ============================================================================
-- 8. SUPPLIER PAYMENT ALLOCATIONS TABLE
-- Line-by-line settlement mapping payment vouchers to specific supplier invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_payment_allocations (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES supplier_payments(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL REFERENCES supplier_invoices(id) ON DELETE CASCADE,
  allocated_amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_spa_payment ON supplier_payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_spa_invoice ON supplier_payment_allocations(invoice_id);

-- ============================================================================
-- 9. PROCUREMENT AUDIT LOGS TABLE
-- Immutable trail of state transitions, approvals, receipts, and edits
-- ============================================================================
CREATE TABLE IF NOT EXISTS procurement_audit_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL REFERENCES users(id),
  actor_name TEXT NOT NULL,
  previous_state TEXT,
  new_state TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pal_entity ON procurement_audit_logs(entity_type, entity_id);

-- ============================================================================
-- 10. SAFELY EXTEND EXISTING PURCHASE ORDERS TABLE
-- Non-conflicting additions: Landed Evaluated Value, Ad-hoc Flag, Delivery Mode, Legacy Sync
-- ============================================================================
ALTER TABLE purchase_orders ADD COLUMN msrf_id TEXT REFERENCES material_service_requests(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN sales_order_id TEXT REFERENCES sales_orders(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN evaluated_total_value REAL DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN required_approval_tier TEXT CHECK (required_approval_tier IN ('FINANCE_CONTROLLER', 'CHIEF_OPERATING_OFFICER'));
ALTER TABLE purchase_orders ADD COLUMN approval_id TEXT REFERENCES purchase_approvals(id) ON DELETE SET NULL;
ALTER TABLE purchase_orders ADD COLUMN approved_by_name TEXT;
ALTER TABLE purchase_orders ADD COLUMN approved_at TEXT;
ALTER TABLE purchase_orders ADD COLUMN is_adhoc INTEGER NOT NULL DEFAULT 0 CHECK (is_adhoc IN (0, 1));
ALTER TABLE purchase_orders ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'Warehouse_Receipt' CHECK (delivery_mode IN ('Warehouse_Receipt', 'Direct_Site_Delivery'));
ALTER TABLE purchase_orders ADD COLUMN is_legacy_migrated INTEGER NOT NULL DEFAULT 0 CHECK (is_legacy_migrated IN (0, 1));
ALTER TABLE purchase_orders ADD COLUMN migration_batch_id TEXT;

-- ============================================================================
-- 11. SAFELY EXTEND EXISTING STOCK-IN VOUCHERS TABLE
-- Delivery destination mode and migration tracking
-- ============================================================================
ALTER TABLE stock_in_vouchers ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'Warehouse_Receipt' CHECK (delivery_mode IN ('Warehouse_Receipt', 'Direct_Site_Delivery'));
ALTER TABLE stock_in_vouchers ADD COLUMN is_legacy_migrated INTEGER NOT NULL DEFAULT 0 CHECK (is_legacy_migrated IN (0, 1));
ALTER TABLE stock_in_vouchers ADD COLUMN migration_batch_id TEXT;

-- ============================================================================
-- 12. SAFELY EXTEND EXISTING STOCK-IN ITEMS TABLE
-- Linkage to PO line items to track received balance vs. pending delivery
-- ============================================================================
ALTER TABLE stock_in_items ADD COLUMN purchase_order_item_id TEXT REFERENCES purchase_order_items(id) ON DELETE SET NULL;
