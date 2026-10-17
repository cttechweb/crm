/**
 * Procurement & Inventory API Service for Cool Technologies CRM Frontend
 * 
 * Communicates with Cloudflare Worker API for Phase 3 modules:
 * - Suppliers: /api/suppliers
 * - Stores: /api/stores
 * - CRM Inventory: /api/inventory
 * - Purchase Orders: /api/purchase-orders
 * - Stock-In Records: /api/stock-in
 * - Stock Transfers: /api/stock-transfers
 * 
 * Features:
 * - Uses centralized apiClient with Firebase ID token authentication (Bearer header)
 * - Strict separation between CRM inventory and e-commerce inventory
 * - Maps between backend database snake_case and frontend camelCase types
 * - Non-destructive idempotent migration helpers for localStorage records
 * - Robust error handling with graceful fallback
 */

import { apiClient } from '@/lib/apiClient';
import type {
  CrmSupplier,
  CrmStore,
  CrmCezconStock,
  CrmPurchaseStock,
  CrmPurchaseOrder,
  CrmPurchaseOrderItem,
  CrmStockInRecord,
  CrmStockInItem,
  CrmStockTransfer,
} from '@/types/enterprise-crm';

// ============================================================================
// 1. BACKEND ROW INTERFACES
// ============================================================================

export interface BackendSupplierRow {
  id: string;
  sl_no: number | null;
  supplier_name: string;
  company_name: string | null;
  trn: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  payment_terms: string | null;
  status: string;
  customer_id: string | null;
  owner: string | null;
  owner_id: string | null;
  created_by: string | null;
  created_by_id: string | null;
  remarks: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BackendStoreRow {
  id: string;
  sl_no: number | null;
  name: string;
  code: string | null;
  location: string | null;
  address: string | null;
  manager_name: string | null;
  manager_id: string | null;
  phone: string | null;
  is_active: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BackendCrmInventoryRow {
  id: string;
  sl_no: number | null;
  code: string;
  name: string;
  image: string | null;
  unit: string | null;
  brand: string | null;
  category: string | null;
  type: string | null;
  purchase_rate: number;
  selling_price: number;
  min_stock: string | null;
  stock: number;
  current_stock: number;
  minimum_stock: number;
  store: string | null;
  store_id: string | null;
  supplier: string | null;
  supplier_id: string | null;
  status: string | null;
  serial_no: string | null;
  owner: string | null;
  owner_id: string | null;
  created_by: string | null;
  created_by_id: string | null;
  created_by_role: string | null;
  created_by_email: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BackendPurchaseOrderRow {
  id: string;
  sl_no: number | null;
  po_number: string;
  date: string;
  expected_delivery_date: string | null;
  supplier: string;
  supplier_id: string | null;
  order_ref: string | null;
  reference: string | null;
  description: string | null;
  opportunity_order: string | null;
  project_number: string | null;
  project_name: string | null;
  vat_type: string | null;
  vat_rate: number | null;
  attention: string | null;
  prepared_by: string | null;
  prepared_by_mobile: string | null;
  prepared_by_email: string | null;
  prepared_by_designation: string | null;
  terms_condition: string | null;
  terms_condition_text: string | null;
  amount: number;
  vat: number;
  discount: number;
  adjustment: number;
  total_amount: number;
  invoice_received: string | null;
  approval: string;
  delivery_status: string;
  payment_status: string;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  items?: BackendPurchaseOrderItemRow[];
}

export interface BackendPurchaseOrderItemRow {
  id: string;
  purchase_order_id: string;
  code: string | null;
  description: string;
  unit: string | null;
  brand: string | null;
  qty: number;
  delivery_pending: number;
  amount: number;
  total: number;
  sort_order: number;
}

export interface BackendStockInRecordRow {
  id: string;
  sl_no: number | null;
  stock_in_no: string;
  date: string;
  supplier: string;
  supplier_id?: string | null;
  purchase_invoice_number?: string | null;
  delivery_note?: string | null;
  do_file_name?: string | null;
  lpo_number?: string | null;
  order_name?: string | null;
  purchase_order_id?: string | null;
  store: string | null;
  store_id?: string | null;
  total_items?: number | null;
  total_amount?: number;
  status?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_by_id?: string | null;
  created_formatted?: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  items?: BackendStockInItemRow[];
}

export interface BackendStockInItemRow {
  id: string;
  stock_in_id?: string;
  voucher_id?: string;
  sl_no: number | null;
  code: string | null;
  item?: string;
  item_name?: string;
  unit: string | null;
  brand: string | null;
  purchase_rate: number;
  selling_price: number;
  qty: number;
  current_stock: number;
  sort_order?: number;
}

export interface BackendStockTransferRow {
  id: string;
  sl_no: number | null;
  transfer_no: string;
  date: string;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  transfer_from: string;
  transfer_from_id: string | null;
  transfer_to: string;
  transfer_to_id: string | null;
  status: string;
  notes: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  items?: Array<{
    id: string;
    code: string | null;
    item_name: string;
    unit: string | null;
    qty: number;
    sort_order: number;
  }>;
}

// ============================================================================
// 2. BACKEND -> FRONTEND MAPPERS
// ============================================================================

export function mapBackendSupplierToFrontend(row: BackendSupplierRow): CrmSupplier {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    supplierName: row.supplier_name,
    companyName: row.company_name || undefined,
    trn: row.trn || undefined,
    contactPerson: row.contact_person || undefined,
    email: row.email || undefined,
    phone: row.phone || '',
    mobile: row.mobile || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    stateRegion: row.state_region || undefined,
    country: row.country || undefined,
    paymentTerms: row.payment_terms || undefined,
    status: row.status,
    customerId: row.customer_id || undefined,
    owner: row.owner || undefined,
    createdBy: row.created_by || undefined,
    remarks: row.remarks || undefined,
  };
}

export function mapBackendStoreToFrontend(row: BackendStoreRow): CrmStore {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    name: row.name,
    code: row.code || undefined,
    location: row.location || undefined,
    address: row.address || undefined,
    managerName: row.manager_name || undefined,
    phone: row.phone || undefined,
    isActive: Boolean(row.is_active),
  };
}

export function mapBackendInventoryToCezconStock(row: BackendCrmInventoryRow): CrmCezconStock {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    serialNo: row.serial_no || undefined,
    code: row.code,
    name: row.name,
    image: row.image || undefined,
    unit: row.unit || 'Pcs',
    brand: row.brand || 'General',
    category: row.category || 'General',
    type: row.type || 'Standard',
    purchaseRate: row.purchase_rate,
    sellingPrice: row.selling_price,
    minStock: row.min_stock || undefined,
    stock: row.stock,
    currentStock: row.current_stock,
    minimumStock: row.minimum_stock,
    store: row.store || undefined,
    status: row.status || 'In Stock',
    createdBy: row.created_by || undefined,
    createdByRole: row.created_by_role || undefined,
    createdById: row.created_by_id || undefined,
    createdByEmail: row.created_by_email || undefined,
    owner: row.owner || undefined,
  };
}

export function mapBackendInventoryToPurchaseStock(row: BackendCrmInventoryRow): CrmPurchaseStock {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    productName: row.name,
    sku: row.code,
    store: row.store || 'MAIN WAREHOUSE',
    supplier: row.supplier || 'Authorized Cooling Parts LLC',
    quantity: row.stock,
    unitPrice: row.purchase_rate,
    totalValue: row.stock * row.purchase_rate,
    status: (row.stock > (row.minimum_stock || 5) ? 'In Stock' : row.stock > 0 ? 'Low Stock' : 'Out of Stock') as any,
    reorderLevel: row.minimum_stock || 5,
  };
}

export function mapBackendPurchaseOrderToFrontend(row: BackendPurchaseOrderRow): CrmPurchaseOrder {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    poNumber: row.po_number,
    date: row.date,
    expectedDeliveryDate: row.expected_delivery_date || undefined,
    supplier: row.supplier,
    supplierId: row.supplier_id || undefined,
    orderRef: row.order_ref || undefined,
    reference: row.reference || undefined,
    description: row.description || undefined,
    opportunityOrder: row.opportunity_order || undefined,
    projectNumber: row.project_number || undefined,
    projectName: row.project_name || undefined,
    vatType: row.vat_type || 'with_vat',
    vatRate: row.vat_rate ?? 5,
    attention: row.attention || undefined,
    preparedBy: row.prepared_by || undefined,
    preparedByMobile: row.prepared_by_mobile || undefined,
    preparedByEmail: row.prepared_by_email || undefined,
    preparedByDesignation: row.prepared_by_designation || undefined,
    termsCondition: row.terms_condition || undefined,
    termsConditionText: row.terms_condition_text || undefined,
    amount: row.amount,
    vat: row.vat,
    discount: row.discount,
    adjustment: row.adjustment,
    totalAmount: row.total_amount,
    invoiceReceived: row.invoice_received || undefined,
    approval: row.approval,
    deliveryStatus: row.delivery_status,
    paymentStatus: row.payment_status,
    owner: row.owner || undefined,
    ownerAvatar: row.owner_avatar || undefined,
    items: Array.isArray(row.items)
      ? row.items.map((it) => ({
          id: it.id,
          code: it.code || undefined,
          description: it.description,
          unit: it.unit || 'Pcs',
          brand: it.brand || undefined,
          qty: it.qty,
          deliveryPending: it.delivery_pending,
          amount: it.amount,
          total: it.total,
        }))
      : undefined,
  };
}

export function mapBackendStockInToFrontend(row: BackendStockInRecordRow): CrmStockInRecord {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    stockInNo: row.stock_in_no,
    date: row.date,
    supplier: row.supplier,
    purchaseInvoiceNumber: row.purchase_invoice_number || undefined,
    deliveryNote: row.delivery_note || undefined,
    lpoNumber: row.lpo_number || undefined,
    store: row.store || 'MAIN WAREHOUSE',
    totalAmount: row.total_amount || 0,
    totalItems: row.total_items ?? undefined,
    notes: row.notes || undefined,
    createdBy: row.created_by || undefined,
    createdFormatted: row.created_formatted || undefined,
    items: Array.isArray(row.items)
      ? row.items.map((it) => ({
          id: it.id,
          slNo: it.sl_no || undefined,
          code: it.code || undefined,
          item: it.item || it.item_name || '',
          unit: it.unit || 'Pcs',
          brand: it.brand || undefined,
          purchaseRate: it.purchase_rate,
          sellingPrice: it.selling_price,
          qty: it.qty,
          currentStock: it.current_stock,
        }))
      : undefined,
  };
}

export function mapBackendStockTransferToFrontend(row: BackendStockTransferRow): CrmStockTransfer {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    transferNo: row.transfer_no,
    date: row.date,
    owner: row.owner || '',
    ownerAvatar: row.owner_avatar || undefined,
    transferFrom: row.transfer_from,
    transferTo: row.transfer_to,
    status: row.status,
    notes: row.notes || undefined,
  };
}

// ============================================================================
// 3. API SERVICES
// ============================================================================

export const supplierApiService = {
  async getSuppliers(params: { search?: string; status?: string; limit?: number; page?: number } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      suppliers: BackendSupplierRow[];
      total: number;
    }>('/api/suppliers', { params });
    return {
      success: res.success,
      suppliers: (res.suppliers || []).map(mapBackendSupplierToFrontend),
      total: res.total,
    };
  },

  async createSupplier(data: Partial<CrmSupplier>) {
    const res = await apiClient.post<{ success: boolean; supplier: BackendSupplierRow }>(
      '/api/suppliers',
      data
    );
    return {
      success: res.success,
      supplier: res.supplier ? mapBackendSupplierToFrontend(res.supplier) : null,
    };
  },

  async updateSupplier(id: string, data: Partial<CrmSupplier>) {
    const res = await apiClient.put<{ success: boolean; supplier: BackendSupplierRow }>(
      `/api/suppliers/${encodeURIComponent(id)}`,
      data
    );
    return {
      success: res.success,
      supplier: res.supplier ? mapBackendSupplierToFrontend(res.supplier) : null,
    };
  },

  async deleteSupplier(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/suppliers/${encodeURIComponent(id)}`
    );
  },

  async syncBatchSuppliers(suppliers: CrmSupplier[]) {
    return await apiClient.post<{ success: boolean; inserted: number; skipped: number; total: number }>(
      '/api/suppliers/sync-batch',
      { suppliers }
    );
  },

  async migrateLocalSuppliersToDatabase(): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      if (localStorage.getItem('crm_suppliers_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }
      const raw = localStorage.getItem('crm_suppliers_list');
      if (!raw) {
        localStorage.setItem('crm_suppliers_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('crm_suppliers_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const res = await this.syncBatchSuppliers(parsed);
      if (res.success) {
        localStorage.setItem('crm_suppliers_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0 };
    } catch {
      return { migrated: false, count: 0 };
    }
  },
};

export const storeApiService = {
  async getStores() {
    const res = await apiClient.get<{ success: boolean; stores: BackendStoreRow[]; total: number }>(
      '/api/stores'
    );
    return {
      success: res.success,
      stores: (res.stores || []).map(mapBackendStoreToFrontend),
      total: res.total,
    };
  },

  async createStore(data: Partial<CrmStore>) {
    const res = await apiClient.post<{ success: boolean; store: BackendStoreRow }>('/api/stores', data);
    return {
      success: res.success,
      store: res.store ? mapBackendStoreToFrontend(res.store) : null,
    };
  },

  async updateStore(id: string, data: Partial<CrmStore>) {
    const res = await apiClient.put<{ success: boolean; store: BackendStoreRow }>(
      `/api/stores/${encodeURIComponent(id)}`,
      data
    );
    return {
      success: res.success,
      store: res.store ? mapBackendStoreToFrontend(res.store) : null,
    };
  },

  async deleteStore(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/stores/${encodeURIComponent(id)}`
    );
  },

  async syncBatchStores(stores: CrmStore[]) {
    return await apiClient.post<{ success: boolean; inserted: number; skipped: number; total: number }>(
      '/api/stores/sync-batch',
      { stores }
    );
  },

  async migrateLocalStoresToDatabase(): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      if (localStorage.getItem('crm_stores_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }
      const raw = localStorage.getItem('crm_stores_list');
      if (!raw) {
        localStorage.setItem('crm_stores_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('crm_stores_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const res = await this.syncBatchStores(parsed);
      if (res.success) {
        localStorage.setItem('crm_stores_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0 };
    } catch {
      return { migrated: false, count: 0 };
    }
  },
};

export const crmInventoryApiService = {
  async getInventory(params: {
    search?: string;
    store?: string;
    status?: string;
    category?: string;
    brand?: string;
    limit?: number;
    page?: number;
  } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      items: BackendCrmInventoryRow[];
      total: number;
    }>('/api/inventory', { params });
    return {
      success: res.success,
      cezconStocks: (res.items || []).map(mapBackendInventoryToCezconStock),
      purchaseStocks: (res.items || []).map(mapBackendInventoryToPurchaseStock),
      total: res.total,
    };
  },

  async getInventoryItemById(id: string) {
    const res = await apiClient.get<{ success: boolean; item: BackendCrmInventoryRow }>(
      `/api/inventory/${encodeURIComponent(id)}`
    );
    return {
      success: res.success,
      item: mapBackendInventoryToCezconStock(res.item),
    };
  },

  async createInventoryItem(data: Partial<CrmCezconStock>) {
    const res = await apiClient.post<{ success: boolean; item: BackendCrmInventoryRow }>(
      '/api/inventory',
      data
    );
    return {
      success: res.success,
      item: res.item ? mapBackendInventoryToCezconStock(res.item) : null,
    };
  },

  async updateInventoryItem(id: string, data: Partial<CrmCezconStock>) {
    const res = await apiClient.put<{ success: boolean; item: BackendCrmInventoryRow }>(
      `/api/inventory/${encodeURIComponent(id)}`,
      data
    );
    return {
      success: res.success,
      item: res.item ? mapBackendInventoryToCezconStock(res.item) : null,
    };
  },

  async deleteInventoryItem(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/inventory/${encodeURIComponent(id)}`
    );
  },

  async syncBatchInventory(items: CrmCezconStock[]) {
    return await apiClient.post<{ success: boolean; inserted: number; skipped: number; total: number }>(
      '/api/inventory/sync-batch',
      { items }
    );
  },

  async migrateLocalInventoryToDatabase(): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      if (localStorage.getItem('crm_inventory_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }
      const raw = localStorage.getItem('cezcon_products_master_live') || localStorage.getItem('crm_stocks_data');
      if (!raw) {
        localStorage.setItem('crm_inventory_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('crm_inventory_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const res = await this.syncBatchInventory(parsed);
      if (res.success) {
        localStorage.setItem('crm_inventory_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0 };
    } catch {
      return { migrated: false, count: 0 };
    }
  },
};

export const purchaseOrderApiService = {
  async getPurchaseOrders(params: {
    search?: string;
    supplier?: string;
    approval?: string;
    deliveryStatus?: string;
    paymentStatus?: string;
    limit?: number;
    page?: number;
  } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      orders: BackendPurchaseOrderRow[];
      total: number;
    }>('/api/purchase-orders', { params });
    return {
      success: res.success,
      orders: (res.orders || []).map(mapBackendPurchaseOrderToFrontend),
      total: res.total,
    };
  },

  async getPurchaseOrderById(id: string) {
    const res = await apiClient.get<{ success: boolean; order: BackendPurchaseOrderRow }>(
      `/api/purchase-orders/${encodeURIComponent(id)}`
    );
    return {
      success: res.success,
      order: mapBackendPurchaseOrderToFrontend(res.order),
    };
  },

  async createPurchaseOrder(data: Partial<CrmPurchaseOrder>) {
    const res = await apiClient.post<{ success: boolean; order: BackendPurchaseOrderRow }>(
      '/api/purchase-orders',
      data
    );
    return {
      success: res.success,
      order: res.order ? mapBackendPurchaseOrderToFrontend(res.order) : null,
    };
  },

  async updatePurchaseOrder(id: string, data: Partial<CrmPurchaseOrder>) {
    const res = await apiClient.put<{ success: boolean; order: BackendPurchaseOrderRow }>(
      `/api/purchase-orders/${encodeURIComponent(id)}`,
      data
    );
    return {
      success: res.success,
      order: res.order ? mapBackendPurchaseOrderToFrontend(res.order) : null,
    };
  },

  async updatePurchaseOrderStatus(id: string, statusData: { approval?: string; deliveryStatus?: string; paymentStatus?: string }) {
    const res = await apiClient.patch<{ success: boolean; order: BackendPurchaseOrderRow }>(
      `/api/purchase-orders/${encodeURIComponent(id)}/status`,
      statusData
    );
    return {
      success: res.success,
      order: res.order ? mapBackendPurchaseOrderToFrontend(res.order) : null,
    };
  },

  async deletePurchaseOrder(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/purchase-orders/${encodeURIComponent(id)}`
    );
  },

  async syncBatchPurchaseOrders(orders: CrmPurchaseOrder[]) {
    return await apiClient.post<{ success: boolean; inserted: number; skipped: number; total: number }>(
      '/api/purchase-orders/sync-batch',
      { orders }
    );
  },

  async migrateLocalPurchaseOrdersToDatabase(): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      if (localStorage.getItem('crm_purchase_orders_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }
      const raw = localStorage.getItem('crm_purchase_orders');
      if (!raw) {
        localStorage.setItem('crm_purchase_orders_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('crm_purchase_orders_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const res = await this.syncBatchPurchaseOrders(parsed);
      if (res.success) {
        localStorage.setItem('crm_purchase_orders_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0 };
    } catch {
      return { migrated: false, count: 0 };
    }
  },
};

export const stockInApiService = {
  async getStockInRecords(params: { search?: string; supplier?: string; limit?: number; page?: number } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      records: BackendStockInRecordRow[];
      total: number;
    }>('/api/stock-in', { params });
    return {
      success: res.success,
      records: (res.records || []).map(mapBackendStockInToFrontend),
      total: res.total,
    };
  },

  async getStockInRecordById(id: string) {
    const res = await apiClient.get<{ success: boolean; record: BackendStockInRecordRow }>(
      `/api/stock-in/${encodeURIComponent(id)}`
    );
    return {
      success: res.success,
      record: mapBackendStockInToFrontend(res.record),
    };
  },

  async createStockInRecord(data: Partial<CrmStockInRecord>) {
    const res = await apiClient.post<{ success: boolean; record: BackendStockInRecordRow }>(
      '/api/stock-in',
      data
    );
    return {
      success: res.success,
      record: res.record ? mapBackendStockInToFrontend(res.record) : null,
    };
  },

  async updateStockInRecord(id: string, data: Partial<CrmStockInRecord>) {
    const res = await apiClient.put<{ success: boolean; record: BackendStockInRecordRow }>(
      `/api/stock-in/${encodeURIComponent(id)}`,
      data
    );
    return {
      success: res.success,
      record: res.record ? mapBackendStockInToFrontend(res.record) : null,
    };
  },

  async deleteStockInRecord(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/stock-in/${encodeURIComponent(id)}`
    );
  },

  async syncBatchStockInRecords(records: CrmStockInRecord[]) {
    return await apiClient.post<{ success: boolean; inserted: number; skipped: number; total: number }>(
      '/api/stock-in/sync-batch',
      { records }
    );
  },

  async migrateLocalStockInToDatabase(): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      if (localStorage.getItem('crm_stock_in_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }
      const raw = localStorage.getItem('crm_stock_in_list');
      if (!raw) {
        localStorage.setItem('crm_stock_in_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('crm_stock_in_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const res = await this.syncBatchStockInRecords(parsed);
      if (res.success) {
        localStorage.setItem('crm_stock_in_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0 };
    } catch {
      return { migrated: false, count: 0 };
    }
  },
};

export const stockTransferApiService = {
  async getStockTransfers(params: { search?: string; limit?: number; page?: number } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      transfers: BackendStockTransferRow[];
      total: number;
    }>('/api/stock-transfers', { params });
    return {
      success: res.success,
      transfers: (res.transfers || []).map(mapBackendStockTransferToFrontend),
      total: res.total,
    };
  },

  async getStockTransferById(id: string) {
    const res = await apiClient.get<{ success: boolean; transfer: BackendStockTransferRow }>(
      `/api/stock-transfers/${encodeURIComponent(id)}`
    );
    return {
      success: res.success,
      transfer: mapBackendStockTransferToFrontend(res.transfer),
    };
  },

  async createStockTransfer(data: Partial<CrmStockTransfer>) {
    const res = await apiClient.post<{ success: boolean; transfer: BackendStockTransferRow }>(
      '/api/stock-transfers',
      data
    );
    return {
      success: res.success,
      transfer: res.transfer ? mapBackendStockTransferToFrontend(res.transfer) : null,
    };
  },

  async deleteStockTransfer(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/stock-transfers/${encodeURIComponent(id)}`
    );
  },

  async syncBatchStockTransfers(transfers: CrmStockTransfer[]) {
    return await apiClient.post<{ success: boolean; inserted: number; skipped: number; total: number }>(
      '/api/stock-transfers/sync-batch',
      { transfers }
    );
  },

  async migrateLocalStockTransfersToDatabase(): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      if (localStorage.getItem('crm_stock_transfers_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }
      const raw = localStorage.getItem('crm_stock_transfers');
      if (!raw) {
        localStorage.setItem('crm_stock_transfers_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('crm_stock_transfers_migrated', 'true');
        return { migrated: false, count: 0 };
      }
      const res = await this.syncBatchStockTransfers(parsed);
      if (res.success) {
        localStorage.setItem('crm_stock_transfers_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0 };
    } catch {
      return { migrated: false, count: 0 };
    }
  },
};
