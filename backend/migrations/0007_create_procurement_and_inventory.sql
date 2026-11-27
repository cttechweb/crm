-- Migration 0007: Create Procurement and Inventory Tables
-- Target Database: cool-tech-crm-db (Cloudflare D1)
-- Scope: Suppliers, Purchase Orders & Items, Stores, CRM Inventory, Stock-In Records & Items, Stock Transfers & Items
-- SAFETY NOTICE: Does NOT touch or alter e-commerce database, tables, or storage.

-- 1. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  supplier_name TEXT NOT NULL,
  company_name TEXT,
  trn TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  city TEXT DEFAULT 'Dubai',
  state_region TEXT DEFAULT 'Dubai',
  country TEXT DEFAULT 'United Arab Emirates',
  payment_terms TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Blocked')),
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  owner TEXT,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  remarks TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_owner ON suppliers(owner_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_deleted ON suppliers(is_deleted);

-- 2. STORES / WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  location TEXT,
  address TEXT,
  manager_name TEXT,
  manager_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_deleted ON stores(is_deleted);

-- 3. CRM INVENTORY / PURCHASE STOCKS TABLE
CREATE TABLE IF NOT EXISTS crm_inventory (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  unit TEXT DEFAULT 'Pcs',
  brand TEXT,
  category TEXT,
  type TEXT DEFAULT 'Standard',
  purchase_rate REAL NOT NULL DEFAULT 0,
  selling_price REAL NOT NULL DEFAULT 0,
  min_stock TEXT,
  stock REAL NOT NULL DEFAULT 0,
  current_stock REAL DEFAULT 0,
  minimum_stock REAL DEFAULT 0,
  store TEXT DEFAULT 'MAIN WAREHOUSE',
  store_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
  supplier TEXT,
  supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'In Stock',
  serial_no TEXT,
  owner TEXT,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by_role TEXT,
  created_by_email TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_inv_code ON crm_inventory(code);
CREATE INDEX IF NOT EXISTS idx_crm_inv_name ON crm_inventory(name);
CREATE INDEX IF NOT EXISTS idx_crm_inv_store ON crm_inventory(store);
CREATE INDEX IF NOT EXISTS idx_crm_inv_deleted ON crm_inventory(is_deleted);

-- 4. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  po_number TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  expected_delivery_date TEXT,
  supplier TEXT NOT NULL,
  supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  order_ref TEXT,
  reference TEXT,
  description TEXT,
  opportunity_order TEXT,
  project_number TEXT,
  project_name TEXT,
  vat_type TEXT DEFAULT 'with_vat',
  vat_rate REAL DEFAULT 5,
  attention TEXT,
  prepared_by TEXT,
  prepared_by_mobile TEXT,
  prepared_by_email TEXT,
  prepared_by_designation TEXT,
  terms_condition TEXT,
  terms_condition_text TEXT,
  amount REAL NOT NULL DEFAULT 0,
  vat REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  adjustment REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  invoice_received TEXT,
  approval TEXT NOT NULL DEFAULT 'Waiting for Final Approval',
  delivery_status TEXT NOT NULL DEFAULT 'Pending',
  payment_status TEXT NOT NULL DEFAULT 'Due',
  owner TEXT,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  owner_avatar TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier);
CREATE INDEX IF NOT EXISTS idx_po_approval ON purchase_orders(approval);
CREATE INDEX IF NOT EXISTS idx_po_owner ON purchase_orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_po_deleted ON purchase_orders(is_deleted);

-- 5. PURCHASE ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id TEXT PRIMARY KEY,
  purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  code TEXT,
  description TEXT NOT NULL,
  unit TEXT DEFAULT 'Pcs',
  brand TEXT,
  qty REAL NOT NULL DEFAULT 1,
  delivery_pending REAL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_poi_order_id ON purchase_order_items(purchase_order_id);

-- 6. STOCK-IN VOUCHERS TABLE (Compatible with existing production D1 table)
CREATE TABLE IF NOT EXISTS stock_in_vouchers (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  stock_in_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  supplier TEXT NOT NULL,
  supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_invoice_number TEXT,
  delivery_note TEXT,
  do_file_name TEXT,
  lpo_number TEXT,
  order_name TEXT,
  purchase_order_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  store TEXT DEFAULT 'MAIN WAREHOUSE',
  store_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
  total_items INTEGER DEFAULT 1,
  total_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'Approved',
  notes TEXT,
  created_by TEXT,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_formatted TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_in_no ON stock_in_vouchers(stock_in_no);
CREATE INDEX IF NOT EXISTS idx_stock_in_supplier ON stock_in_vouchers(supplier);
CREATE INDEX IF NOT EXISTS idx_stock_in_deleted ON stock_in_vouchers(is_deleted);

-- 7. STOCK-IN ITEMS TABLE (Compatible with existing production D1 table)
CREATE TABLE IF NOT EXISTS stock_in_items (
  id TEXT PRIMARY KEY,
  voucher_id TEXT NOT NULL REFERENCES stock_in_vouchers(id) ON DELETE CASCADE,
  sl_no INTEGER,
  code TEXT,
  item_name TEXT NOT NULL,
  unit TEXT DEFAULT 'Pcs',
  brand TEXT,
  purchase_rate REAL NOT NULL DEFAULT 0,
  selling_price REAL NOT NULL DEFAULT 0,
  qty REAL NOT NULL DEFAULT 1,
  current_stock REAL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sii_voucher_id ON stock_in_items(voucher_id);

-- Backward-compatibility view: stock_in_records -> stock_in_vouchers
CREATE VIEW IF NOT EXISTS stock_in_records AS
SELECT 
  id, sl_no, stock_in_no, date, supplier, store, delivery_note, do_file_name,
  lpo_number, purchase_invoice_number, order_name, total_items, status,
  created_by, created_formatted, created_at, updated_at, is_deleted
FROM stock_in_vouchers;

-- 8. STOCK TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS stock_transfers (
  id TEXT PRIMARY KEY,
  sl_no INTEGER,
  transfer_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  owner TEXT,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  owner_avatar TEXT,
  transfer_from TEXT NOT NULL,
  transfer_from_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
  transfer_to TEXT NOT NULL,
  transfer_to_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  notes TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_st_transfer_no ON stock_transfers(transfer_no);
CREATE INDEX IF NOT EXISTS idx_st_owner ON stock_transfers(owner_id);
CREATE INDEX IF NOT EXISTS idx_st_deleted ON stock_transfers(is_deleted);

-- 9. STOCK TRANSFER ITEMS TABLE
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id TEXT PRIMARY KEY,
  stock_transfer_id TEXT NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  code TEXT,
  item_name TEXT NOT NULL,
  unit TEXT DEFAULT 'Pcs',
  qty REAL NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sti_transfer_id ON stock_transfer_items(stock_transfer_id);
