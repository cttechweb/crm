-- ============================================================================
-- 0011_supplier_invoicing_and_matching.sql
-- Phase 4: Supplier Invoicing, 3-Way Matching Engine, and Payment Governance
-- ============================================================================

-- 1. Extend supplier_invoices with discounts, discrepancy resolution, payment approval, and match details
ALTER TABLE supplier_invoices ADD COLUMN discount_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE supplier_invoices ADD COLUMN adjustment_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE supplier_invoices ADD COLUMN discrepancy_reason TEXT;
ALTER TABLE supplier_invoices ADD COLUMN resolution_action TEXT;
ALTER TABLE supplier_invoices ADD COLUMN resolution_notes TEXT;
ALTER TABLE supplier_invoices ADD COLUMN resolved_by_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE supplier_invoices ADD COLUMN resolved_by_name TEXT;
ALTER TABLE supplier_invoices ADD COLUMN resolved_at TEXT;
ALTER TABLE supplier_invoices ADD COLUMN payment_approved_by_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE supplier_invoices ADD COLUMN payment_approved_by_name TEXT;
ALTER TABLE supplier_invoices ADD COLUMN payment_approved_at TEXT;
ALTER TABLE supplier_invoices ADD COLUMN match_details TEXT;

-- 2. Line Items Table for Supplier Invoices (for granular 3-way matching)
CREATE TABLE IF NOT EXISTS supplier_invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES supplier_invoices(id) ON DELETE CASCADE,
  purchase_order_item_id TEXT REFERENCES purchase_order_items(id) ON DELETE SET NULL,
  code TEXT,
  description TEXT NOT NULL,
  unit TEXT DEFAULT 'Pcs',
  invoiced_qty REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  tax_rate REAL NOT NULL DEFAULT 5,
  tax_amount REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sii_invoice_id ON supplier_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sii_po_item_id ON supplier_invoice_items(purchase_order_item_id);

-- 3. Extend supplier_payments with tracking for allocated and unallocated balances
ALTER TABLE supplier_payments ADD COLUMN allocated_amount REAL NOT NULL DEFAULT 0;
ALTER TABLE supplier_payments ADD COLUMN unallocated_amount REAL NOT NULL DEFAULT 0;

-- 4. Extend supplier_payment_allocations with notes and payment reference tracking
ALTER TABLE supplier_payment_allocations ADD COLUMN notes TEXT;
