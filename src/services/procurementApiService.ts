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
  CrmMsrf,
  CrmMsrfItem,
  CrmSupplierQuotation,
  CrmPurchaseApproval,
  CrmApproverDelegation,
  ProcurementDashboardSummary,
  ApAgingReport,
  SupplierStatementEntry,
  SupplierStatementReconciliation,
  LegacyValidationRecord,
  LegacyValidationSummary,
  LegacyMigrationReport,
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
  evaluated_total_value?: number | null;
  required_approval_tier?: string | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  is_adhoc?: number | null;
  delivery_mode?: string | null;
  msrf_id?: string | null;
  sales_order_id?: string | null;
  approvals?: BackendPurchaseApprovalRow[];
  items?: BackendPurchaseOrderItemRow[];
}

export interface BackendPurchaseApprovalRow {
  id: string;
  purchase_order_id: string;
  approval_tier: string;
  approver_id: string;
  approver_name: string;
  approver_designation?: string | null;
  is_delegated: number;
  delegation_id?: string | null;
  delegator_name?: string | null;
  decision: 'Approved' | 'Rejected';
  decision_at: string;
  evaluated_amount: number;
  remarks?: string | null;
  created_at: string;
}

export interface BackendMsrfItemRow {
  id: string;
  msrf_id: string;
  item_code: string | null;
  description: string;
  unit: string | null;
  brand_preference: string | null;
  requested_qty: number;
  available_stock_qty: number;
  procure_qty: number;
  estimated_unit_rate: number;
  estimated_total_amount: number;
  sort_order: number;
}

export interface BackendMsrfRow {
  id: string;
  sl_no: number | null;
  msrf_number: string;
  date: string;
  requestor_id: string;
  requestor_name: string;
  department: string;
  priority: string;
  purpose: string;
  required_by_date: string;
  sales_order_id: string | null;
  sales_order_number: string | null;
  project_name: string | null;
  estimated_total_value: number;
  reporting_head_id: string | null;
  reporting_head_name: string | null;
  reporting_head_status: string;
  reporting_head_decision_at: string | null;
  reporting_head_remarks: string | null;
  procurement_status: string;
  assigned_buyer_id: string | null;
  assigned_buyer_name: string | null;
  stock_verification_status: string | null;
  purchase_instructions?: string | null;
  requestor_confirmed_at: string | null;
  requestor_feedback: string | null;
  is_closed: number;
  closed_at: string | null;
  closed_by_id: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  items?: BackendMsrfItemRow[];
  auditLogs?: any[];
}

export interface BackendSupplierQuotationRow {
  id: string;
  msrf_id: string | null;
  quotation_ref: string;
  quotation_date: string;
  supplier_id: string;
  supplier_name: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_delivery_cost: number;
  installation_cost: number;
  other_associated_costs: number;
  landed_total_value: number;
  delivery_lead_time_days: number;
  payment_terms: string | null;
  validity_date: string | null;
  is_recommended: number;
  recommendation_reason: string | null;
  quote_document_url: string | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendApproverDelegationRow {
  id: string;
  delegator_id: string;
  delegator_name: string;
  delegator_designation: string;
  delegate_id: string;
  delegate_name: string;
  delegate_designation: string | null;
  approval_tier: string;
  start_date: string;
  end_date: string;
  is_active: number;
  reason: string | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
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
    name: row.supplier_name,
    companyName: row.company_name || undefined,
    trn: row.trn || undefined,
    contactPerson: row.contact_person || undefined,
    contact: row.phone || row.mobile || '',
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
    owner: row.owner || 'Musthafa Chirammal',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    outstanding: 0,
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
    evaluatedTotalValue: row.evaluated_total_value ?? undefined,
    requiredApprovalTier: row.required_approval_tier ?? undefined,
    approvedByName: row.approved_by_name ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    isAdhoc: Boolean(row.is_adhoc),
    deliveryMode: row.delivery_mode ?? undefined,
    msrfId: row.msrf_id ?? undefined,
    salesOrderId: row.sales_order_id ?? undefined,
    approvals: Array.isArray(row.approvals) ? row.approvals.map(mapBackendApprovalToFrontend) : undefined,
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

export function mapBackendMsrfItemToFrontend(row: BackendMsrfItemRow): CrmMsrfItem {
  return {
    id: row.id,
    msrfId: row.msrf_id,
    itemCode: row.item_code || undefined,
    description: row.description,
    unit: row.unit || 'Pcs',
    brandPreference: row.brand_preference || undefined,
    requestedQty: row.requested_qty,
    availableStockQty: row.available_stock_qty,
    procureQty: row.procure_qty,
    estimatedUnitRate: row.estimated_unit_rate,
    estimatedTotalAmount: row.estimated_total_amount,
    sortOrder: row.sort_order,
  };
}

export function mapBackendMsrfToFrontend(row: BackendMsrfRow): CrmMsrf {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    msrfNumber: row.msrf_number,
    date: row.date,
    requestorId: row.requestor_id,
    requestorName: row.requestor_name,
    department: row.department,
    priority: (row.priority as any) || 'Medium',
    purpose: row.purpose,
    requiredByDate: row.required_by_date,
    salesOrderId: row.sales_order_id || undefined,
    salesOrderNumber: row.sales_order_number || undefined,
    projectName: row.project_name || undefined,
    estimatedTotalValue: row.estimated_total_value,
    reportingHeadId: row.reporting_head_id || undefined,
    reportingHeadName: row.reporting_head_name || undefined,
    reportingHeadStatus: (row.reporting_head_status as any) || 'Pending',
    reportingHeadDecisionAt: row.reporting_head_decision_at || undefined,
    reportingHeadRemarks: row.reporting_head_remarks || undefined,
    procurementStatus: (row.procurement_status as any) || 'Awaiting_Intake',
    assignedBuyerId: row.assigned_buyer_id || undefined,
    assignedBuyerName: row.assigned_buyer_name || undefined,
    stockVerificationStatus: (row.stock_verification_status as any) || 'Unverified',
    purchaseInstructions: row.purchase_instructions || undefined,
    requestorConfirmedAt: row.requestor_confirmed_at || undefined,
    requestorFeedback: row.requestor_feedback || undefined,
    isClosed: Boolean(row.is_closed),
    closedAt: row.closed_at || undefined,
    closedById: row.closed_by_id || undefined,
    items: Array.isArray(row.items) ? row.items.map(mapBackendMsrfItemToFrontend) : undefined,
    auditLogs: Array.isArray(row.auditLogs)
      ? row.auditLogs.map((log: any) => ({
          id: log.id,
          entityType: log.entity_type,
          entityId: log.entity_id,
          action: log.action,
          actorId: log.actor_id,
          actorName: log.actor_name,
          previousState: log.previous_state,
          newState: log.new_state,
          metadata: log.metadata,
          createdAt: log.created_at,
        }))
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBackendQuotationToFrontend(row: BackendSupplierQuotationRow): CrmSupplierQuotation {
  return {
    id: row.id,
    msrfId: row.msrf_id || undefined,
    quotationRef: row.quotation_ref,
    quotationDate: row.quotation_date,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    currency: row.currency || 'AED',
    subtotal: row.subtotal,
    taxAmount: row.tax_amount,
    shippingDeliveryCost: row.shipping_delivery_cost,
    installationCost: row.installation_cost,
    otherAssociatedCosts: row.other_associated_costs,
    landedTotalValue: row.landed_total_value,
    deliveryLeadTimeDays: row.delivery_lead_time_days,
    paymentTerms: row.payment_terms || undefined,
    validityDate: row.validity_date || undefined,
    isRecommended: Boolean(row.is_recommended),
    recommendationReason: row.recommendation_reason || undefined,
    quoteDocumentUrl: row.quote_document_url || undefined,
    createdById: row.created_by_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBackendDelegationToFrontend(row: BackendApproverDelegationRow): CrmApproverDelegation {
  return {
    id: row.id,
    delegatorId: row.delegator_id,
    delegatorName: row.delegator_name,
    delegatorDesignation: row.delegator_designation,
    delegateId: row.delegate_id,
    delegateName: row.delegate_name,
    delegateDesignation: row.delegate_designation || undefined,
    approvalTier: row.approval_tier as any,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: Boolean(row.is_active),
    reason: row.reason || undefined,
    createdById: row.created_by_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBackendApprovalToFrontend(row: BackendPurchaseApprovalRow): CrmPurchaseApproval {
  return {
    id: row.id,
    purchaseOrderId: row.purchase_order_id,
    approvalTier: row.approval_tier,
    approverId: row.approver_id,
    approverName: row.approver_name,
    approverDesignation: row.approver_designation || undefined,
    isDelegated: Boolean(row.is_delegated),
    delegationId: row.delegation_id || undefined,
    delegatorName: row.delegator_name || undefined,
    decision: row.decision,
    decisionAt: row.decision_at,
    evaluatedAmount: row.evaluated_amount,
    remarks: row.remarks || undefined,
    createdAt: row.created_at,
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

  async migrateLocalSuppliersToDatabase(force = false): Promise<{ migrated: boolean; count: number }> {
    if (typeof window === 'undefined') return { migrated: false, count: 0 };
    try {
      const raw = localStorage.getItem('crm_suppliers_list');
      if (!raw) return { migrated: false, count: 0 };
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return { migrated: false, count: 0 };

      const lastSyncedCount = Number(localStorage.getItem('crm_suppliers_synced_count') || '0');
      if (!force && lastSyncedCount === parsed.length && localStorage.getItem('crm_suppliers_migrated') === 'true') {
        return { migrated: false, count: 0 };
      }

      // Ensure each item has supplierName and phone mapped
      const normalized = parsed.map((s: any) => ({
        ...s,
        supplierName: s.supplierName || s.name || 'Unnamed Supplier',
        name: s.name || s.supplierName,
        phone: s.phone || s.contact || '',
      }));

      const res = await this.syncBatchSuppliers(normalized);
      if (res.success) {
        localStorage.setItem('crm_suppliers_migrated', 'true');
        localStorage.setItem('crm_suppliers_synced_count', String(parsed.length));
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

  async approvePurchaseOrder(id: string, payload: { decision: 'Approved' | 'Rejected'; remarks?: string }) {
    return await apiClient.post<{ success: boolean; approval: any; order: BackendPurchaseOrderRow; message?: string }>(
      `/api/purchase-orders/${encodeURIComponent(id)}/approve`,
      payload
    );
  },

  async getPurchaseOrderApprovals(id: string) {
    const res = await apiClient.get<{ success: boolean; approvals: BackendPurchaseApprovalRow[] }>(
      `/api/purchase-orders/${encodeURIComponent(id)}/approvals`
    );
    return {
      success: res.success,
      approvals: (res.approvals || []).map(mapBackendApprovalToFrontend),
    };
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

// ============================================================================
// 7. MATERIAL SERVICE REQUESTS (MSRF) API SERVICE
// ============================================================================
export const msrfApiService = {
  async getMSRFs(params: { search?: string; reportingStatus?: string; procurementStatus?: string } = {}) {
    const res = await apiClient.get<{ success: boolean; requests: BackendMsrfRow[] }>('/api/msrf', { params, requireAuth: true });
    return {
      success: res.success,
      requests: (res.requests || []).map(mapBackendMsrfToFrontend),
    };
  },

  async getMSRFById(id: string) {
    const res = await apiClient.get<{ success: boolean; request: BackendMsrfRow }>(`/api/msrf/${encodeURIComponent(id)}`, { requireAuth: true });
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
    };
  },

  async createMSRF(data: Partial<CrmMsrf>) {
    const res = await apiClient.post<{ success: boolean; request: BackendMsrfRow }>('/api/msrf', data, { requireAuth: true });
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
    };
  },

  async updateMSRF(id: string, data: Partial<CrmMsrf>) {
    const res = await apiClient.put<{ success: boolean; request: BackendMsrfRow }>(`/api/msrf/${encodeURIComponent(id)}`, data, { requireAuth: true });
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
    };
  },

  async approveByReportingHead(id: string, payload: { decision: 'Approved' | 'Rejected' | 'More_Info_Required'; remarks?: string }) {
    const res = await apiClient.patch<{ success: boolean; request: BackendMsrfRow }>(
      `/api/msrf/${encodeURIComponent(id)}/manager-approval`,
      payload,
      { requireAuth: true }
    );
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
    };
  },

  async acceptIntake(id: string, payload?: { notes?: string }) {
    const res = await apiClient.post<{ success: boolean; request: BackendMsrfRow; message?: string }>(
      `/api/msrf/${encodeURIComponent(id)}/intake`,
      payload || {},
      { requireAuth: true }
    );
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      message: res.message,
    };
  },

  async verifyStock(id: string, payload?: { manualStatus?: 'No_Stock_Available' | 'Full_Stock_Available' | 'Partial_Stock_Available' }) {
    const res = await apiClient.post<{
      success: boolean;
      stockVerificationStatus: string;
      request: BackendMsrfRow;
      items?: any[];
      message?: string;
    }>(`/api/msrf/${encodeURIComponent(id)}/stock-verify`, payload || {}, { requireAuth: true });
    return {
      success: res.success,
      stockVerificationStatus: res.stockVerificationStatus,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      items: res.items,
      message: res.message,
    };
  },

  async reserveStock(id: string) {
    const res = await apiClient.post<{
      success: boolean;
      message?: string;
      request?: BackendMsrfRow;
      reservations?: any[];
    }>(`/api/msrf/${encodeURIComponent(id)}/reserve-stock`, {}, { requireAuth: true });
    return {
      success: res.success,
      message: res.message,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      reservations: res.reservations,
    };
  },

  async issueStock(id: string, customQuantities?: Record<string, number>) {
    const res = await apiClient.post<{
      success: boolean;
      message?: string;
      request?: BackendMsrfRow;
      isFullyStockFulfilled?: boolean;
      remainingShortageCount?: number;
    }>(`/api/msrf/${encodeURIComponent(id)}/issue-stock`, { customQuantities }, { requireAuth: true });
    return {
      success: res.success,
      message: res.message,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      isFullyStockFulfilled: res.isFullyStockFulfilled,
      remainingShortageCount: res.remainingShortageCount,
    };
  },

  async forwardShortageToPurchase(
    id: string,
    payload?: {
      description?: string;
      instructions?: string;
      stockVerificationStatus?: string;
    }
  ) {
    const res = await apiClient.post<{
      success: boolean;
      message?: string;
      request?: BackendMsrfRow;
    }>(`/api/msrf/${encodeURIComponent(id)}/forward-to-purchase`, payload || {}, { requireAuth: true });
    return {
      success: res.success,
      message: res.message,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
    };
  },

  async submitRecommendation(id: string, payload: { selectedQuotationId: string; recommendationReason: string; isSingleSource?: boolean; singleSourceJustification?: string }) {
    const res = await apiClient.post<{ success: boolean; request: BackendMsrfRow; message?: string }>(
      `/api/msrf/${encodeURIComponent(id)}/recommendation`,
      payload,
      { requireAuth: true }
    );
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      message: res.message,
    };
  },

  async generatePO(id: string, payload?: { deliveryMode?: string; expectedDeliveryDate?: string }) {
    const res = await apiClient.post<{ success: boolean; po: BackendPurchaseOrderRow; message?: string }>(
      `/api/msrf/${encodeURIComponent(id)}/generate-po`,
      payload || {},
      { requireAuth: true }
    );
    return {
      success: res.success,
      po: res.po ? mapBackendPurchaseOrderToFrontend(res.po) : null,
      message: res.message,
    };
  },

  async confirmReceipt(
    id: string,
    payload: { rating: number; condition?: string; comments?: string }
  ) {
    const res = await apiClient.post<{ success: boolean; request: BackendMsrfRow; message?: string }>(
      `/api/msrf/${encodeURIComponent(id)}/confirm-receipt`,
      payload,
      { requireAuth: true }
    );
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      message: res.message,
    };
  },

  async closeMSRF(
    id: string,
    payload: { closureNotes?: string; overrideReason?: string } = {}
  ) {
    const res = await apiClient.post<{ success: boolean; request: BackendMsrfRow; message?: string }>(
      `/api/msrf/${encodeURIComponent(id)}/close`,
      payload,
      { requireAuth: true }
    );
    return {
      success: res.success,
      request: res.request ? mapBackendMsrfToFrontend(res.request) : null,
      message: res.message,
    };
  },

  async deleteMSRF(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/msrf/${encodeURIComponent(id)}`,
      { requireAuth: true }
    );
  },
};

// ============================================================================
// 8. SUPPLIER QUOTATIONS API SERVICE
// ============================================================================
export const purchaseQuotationApiService = {
  async getQuotations(params: { msrfId?: string; supplierId?: string } = {}) {
    const res = await apiClient.get<{ success: boolean; quotations: BackendSupplierQuotationRow[] }>(
      '/api/purchase-quotes',
      { params }
    );
    return {
      success: res.success,
      quotations: (res.quotations || []).map(mapBackendQuotationToFrontend),
    };
  },

  async createQuotation(data: Partial<CrmSupplierQuotation>) {
    const res = await apiClient.post<{ success: boolean; quotation: BackendSupplierQuotationRow }>(
      '/api/purchase-quotes',
      data
    );
    return {
      success: res.success,
      quotation: res.quotation ? mapBackendQuotationToFrontend(res.quotation) : null,
    };
  },

  async updateQuotation(id: string, data: Partial<CrmSupplierQuotation>) {
    const res = await apiClient.put<{ success: boolean; quotation: BackendSupplierQuotationRow }>(
      `/api/purchase-quotes/${encodeURIComponent(id)}`,
      data
    );
    return {
      success: res.success,
      quotation: res.quotation ? mapBackendQuotationToFrontend(res.quotation) : null,
    };
  },

  async deleteQuotation(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/purchase-quotes/${encodeURIComponent(id)}`
    );
  },

  async validateQuotationRules(payload: { msrfId?: string; estimatedAmount?: number; quotes?: any[] }) {
    return await apiClient.post<{
      success: boolean;
      compliant: boolean;
      evaluatedAmount: number;
      distinctSuppliers: number;
      requiredCount?: number;
      message: string;
    }>('/api/purchase-quotes/validate-rules', payload);
  },
};

// ============================================================================
// 9. APPROVER DELEGATIONS API SERVICE
// ============================================================================
export const delegationsApiService = {
  async getDelegations(params: { active?: boolean; tier?: string } = {}) {
    const res = await apiClient.get<{ success: boolean; delegations: BackendApproverDelegationRow[] }>(
      '/api/delegations',
      { params: { active: params.active !== false ? 'true' : 'false', tier: params.tier } }
    );
    return {
      success: res.success,
      delegations: (res.delegations || []).map(mapBackendDelegationToFrontend),
    };
  },

  async createDelegation(data: Partial<CrmApproverDelegation>) {
    const res = await apiClient.post<{ success: boolean; delegation: BackendApproverDelegationRow }>(
      '/api/delegations',
      data
    );
    return {
      success: res.success,
      delegation: res.delegation ? mapBackendDelegationToFrontend(res.delegation) : null,
    };
  },

  async deactivateDelegation(id: string) {
    return await apiClient.patch<{ success: boolean; message?: string }>(
      `/api/delegations/${encodeURIComponent(id)}/deactivate`
    );
  },
};

// ============================================================================
// 10. SUPPLIER INVOICES & 3-WAY MATCHING API SERVICE
// ============================================================================
export interface BackendSupplierInvoiceRow {
  id: string;
  sl_no: number | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  supplier_id: string;
  supplier_name: string;
  purchase_order_id: string | null;
  purchase_order_number: string | null;
  grn_id: string | null;
  grn_number: string | null;
  subtotal: number;
  vat_amount: number;
  discount_amount?: number;
  adjustment_amount?: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'Due' | 'Partially_Paid' | 'Paid';
  matching_status: any;
  match_details?: string | null;
  discrepancy_reason?: string | null;
  resolution_action?: string | null;
  resolution_notes?: string | null;
  resolved_by_name?: string | null;
  resolved_at?: string | null;
  payment_approved_by_name?: string | null;
  payment_approved_at?: string | null;
  notes?: string | null;
  invoice_file_url?: string | null;
  created_at: string;
  updated_at: string;
  items?: any[];
  allocations?: any[];
}

export interface BackendSupplierPaymentRow {
  id: string;
  sl_no: number | null;
  voucher_number: string;
  payment_date: string;
  supplier_id: string;
  supplier_name: string;
  payment_mode: 'Bank_Transfer' | 'Cheque' | 'Cash' | 'Credit_Card';
  bank_name: string | null;
  reference_no: string | null;
  cheque_number: string | null;
  cheque_date: string | null;
  amount: number;
  allocated_amount?: number;
  unallocated_amount?: number;
  notes: string | null;
  status: 'Pending' | 'Completed' | 'Bounced' | 'Void';
  created_at: string;
  updated_at: string;
  allocations?: any[];
}

export function mapBackendInvoiceToFrontend(row: BackendSupplierInvoiceRow): any {
  let parsedMatchDetails: any = null;
  if (row.match_details) {
    try {
      parsedMatchDetails = typeof row.match_details === 'string' ? JSON.parse(row.match_details) : row.match_details;
    } catch {}
  }

  return {
    id: row.id,
    slNo: row.sl_no ?? undefined,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date ?? undefined,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    purchaseOrderId: row.purchase_order_id ?? undefined,
    purchaseOrderNumber: row.purchase_order_number ?? undefined,
    grnId: row.grn_id ?? undefined,
    grnNumber: row.grn_number ?? undefined,
    subtotal: row.subtotal ?? 0,
    vatAmount: row.vat_amount ?? 0,
    discountAmount: row.discount_amount ?? 0,
    adjustmentAmount: row.adjustment_amount ?? 0,
    totalAmount: row.total_amount ?? 0,
    amountPaid: row.amount_paid ?? 0,
    balanceDue: row.balance_due ?? (row.total_amount - (row.amount_paid || 0)),
    paymentStatus: row.payment_status,
    matchingStatus: row.matching_status,
    matchDetails: parsedMatchDetails,
    discrepancyReason: row.discrepancy_reason ?? undefined,
    resolutionAction: row.resolution_action ?? undefined,
    resolutionNotes: row.resolution_notes ?? undefined,
    resolvedByName: row.resolved_by_name ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
    paymentApprovedByName: row.payment_approved_by_name ?? undefined,
    paymentApprovedAt: row.payment_approved_at ?? undefined,
    notes: row.notes ?? undefined,
    invoiceFileUrl: row.invoice_file_url ?? undefined,
    items: Array.isArray(row.items)
      ? row.items.map((it: any) => ({
          id: it.id,
          purchaseOrderItemId: it.purchase_order_item_id,
          code: it.code,
          description: it.description,
          unit: it.unit,
          invoicedQty: it.invoiced_qty,
          unitPrice: it.unit_price,
          taxRate: it.tax_rate,
          taxAmount: it.tax_amount,
          discountAmount: it.discount_amount,
          totalAmount: it.total_amount,
        }))
      : [],
    allocations: Array.isArray(row.allocations)
      ? row.allocations.map((a: any) => ({
          id: a.id,
          paymentId: a.payment_id,
          invoiceId: a.invoice_id,
          invoiceNumber: a.invoice_number,
          allocatedAmount: a.allocated_amount,
          notes: a.notes,
          createdAt: a.created_at,
        }))
      : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBackendPaymentToFrontend(row: BackendSupplierPaymentRow): any {
  return {
    id: row.id,
    slNo: row.sl_no ?? undefined,
    voucherNumber: row.voucher_number,
    paymentDate: row.payment_date,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    paymentMode: row.payment_mode,
    bankName: row.bank_name ?? undefined,
    referenceNo: row.reference_no ?? undefined,
    chequeNumber: row.cheque_number ?? undefined,
    chequeDate: row.cheque_date ?? undefined,
    amount: row.amount ?? 0,
    allocatedAmount: row.allocated_amount ?? 0,
    unallocatedAmount: row.unallocated_amount ?? Math.max(0, (row.amount || 0) - (row.allocated_amount || 0)),
    notes: row.notes ?? undefined,
    status: row.status,
    allocations: Array.isArray(row.allocations)
      ? row.allocations.map((a: any) => ({
          id: a.id,
          paymentId: a.payment_id,
          invoiceId: a.invoice_id,
          invoiceNumber: a.invoice_number,
          allocatedAmount: a.allocated_amount,
          notes: a.notes,
          createdAt: a.created_at,
        }))
      : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supplierInvoiceApiService = {
  async getInvoices(params: {
    search?: string;
    supplierId?: string;
    poId?: string;
    matchingStatus?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      invoices: BackendSupplierInvoiceRow[];
      summary?: {
        totalInvoiced: number;
        totalPaid: number;
        totalOutstanding: number;
        totalOverdue: number;
      };
      pagination?: { total: number; page: number; limit: number; totalPages: number };
    }>('/api/supplier-invoices', { params });

    return {
      success: res.success,
      invoices: (res.invoices || []).map(mapBackendInvoiceToFrontend),
      summary: res.summary || { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0, totalOverdue: 0 },
      pagination: res.pagination,
    };
  },

  async getInvoice(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      invoice: BackendSupplierInvoiceRow;
      items: any[];
      allocations: any[];
      matchDetails: any;
      auditLogs: any[];
    }>(`/api/supplier-invoices/${encodeURIComponent(id)}`);

    return {
      success: res.success,
      invoice: res.invoice ? mapBackendInvoiceToFrontend({ ...res.invoice, items: res.items, allocations: res.allocations }) : null,
      matchDetails: res.matchDetails,
      auditLogs: res.auditLogs || [],
    };
  },

  async createInvoice(data: any) {
    const res = await apiClient.post<{
      success: boolean;
      invoice: BackendSupplierInvoiceRow;
      matchResult: any;
      message?: string;
    }>('/api/supplier-invoices', data);

    return {
      success: res.success,
      invoice: res.invoice ? mapBackendInvoiceToFrontend(res.invoice) : null,
      matchResult: res.matchResult,
      message: res.message,
    };
  },

  async updateInvoice(id: string, data: any) {
    const res = await apiClient.put<{
      success: boolean;
      invoice: BackendSupplierInvoiceRow;
      matchResult: any;
    }>(`/api/supplier-invoices/${encodeURIComponent(id)}`, data);

    return {
      success: res.success,
      invoice: res.invoice ? mapBackendInvoiceToFrontend(res.invoice) : null,
      matchResult: res.matchResult,
    };
  },

  async deleteInvoice(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/supplier-invoices/${encodeURIComponent(id)}`
    );
  },

  async rematchInvoice(id: string) {
    return await apiClient.post<{
      success: boolean;
      matchingStatus: string;
      matchResult: any;
    }>(`/api/supplier-invoices/${encodeURIComponent(id)}/rematch`, {});
  },

  async resolveDiscrepancy(id: string, payload: { resolutionAction: string; resolutionNotes: string }) {
    const res = await apiClient.post<{
      success: boolean;
      invoice: BackendSupplierInvoiceRow;
      message?: string;
    }>(`/api/supplier-invoices/${encodeURIComponent(id)}/resolve-discrepancy`, payload);

    return {
      success: res.success,
      invoice: res.invoice ? mapBackendInvoiceToFrontend(res.invoice) : null,
      message: res.message,
    };
  },

  async approvePayment(id: string) {
    const res = await apiClient.post<{
      success: boolean;
      invoice: BackendSupplierInvoiceRow;
      message?: string;
    }>(`/api/supplier-invoices/${encodeURIComponent(id)}/approve-payment`, {});

    return {
      success: res.success,
      invoice: res.invoice ? mapBackendInvoiceToFrontend(res.invoice) : null,
      message: res.message,
    };
  },
};

export const supplierPaymentApiService = {
  async getPayments(params: {
    search?: string;
    supplierId?: string;
    paymentMode?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const res = await apiClient.get<{
      success: boolean;
      payments: BackendSupplierPaymentRow[];
      summary?: { totalDisbursed: number; totalAllocated: number; totalUnallocated: number };
      pagination?: { total: number; page: number; limit: number; totalPages: number };
    }>('/api/supplier-payments', { params });

    return {
      success: res.success,
      payments: (res.payments || []).map(mapBackendPaymentToFrontend),
      summary: res.summary || { totalDisbursed: 0, totalAllocated: 0, totalUnallocated: 0 },
      pagination: res.pagination,
    };
  },

  async getPayment(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      payment: BackendSupplierPaymentRow;
      allocations: any[];
      auditLogs: any[];
    }>(`/api/supplier-payments/${encodeURIComponent(id)}`);

    return {
      success: res.success,
      payment: res.payment ? mapBackendPaymentToFrontend({ ...res.payment, allocations: res.allocations }) : null,
      auditLogs: res.auditLogs || [],
    };
  },

  async createPayment(data: any) {
    const res = await apiClient.post<{
      success: boolean;
      payment: BackendSupplierPaymentRow;
      message?: string;
    }>('/api/supplier-payments', data);

    return {
      success: res.success,
      payment: res.payment ? mapBackendPaymentToFrontend(res.payment) : null,
      message: res.message,
    };
  },

  async allocatePayment(id: string, payload: { allocations: Array<{ invoiceId: string; amount: number; notes?: string }> }) {
    const res = await apiClient.post<{
      success: boolean;
      payment: BackendSupplierPaymentRow;
      message?: string;
    }>(`/api/supplier-payments/${encodeURIComponent(id)}/allocate`, payload);

    return {
      success: res.success,
      payment: res.payment ? mapBackendPaymentToFrontend(res.payment) : null,
      message: res.message,
    };
  },

  async voidPayment(id: string, reason?: string) {
    return await apiClient.post<{ success: boolean; message?: string }>(
      `/api/supplier-payments/${encodeURIComponent(id)}/void`,
      { reason }
    );
  },

  async deletePayment(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/supplier-payments/${encodeURIComponent(id)}`
    );
  },
};

// ============================================================================
// 12. PROCUREMENT DASHBOARD API SERVICE
// Aggregates real CRM data across procurement, inventory, orders, and matching
// ============================================================================

export const procurementDashboardApiService = {
  async getSummary() {
    const res = await apiClient.get<{
      success: boolean;
      data: ProcurementDashboardSummary;
    }>('/api/procurement-dashboard/summary');

    return {
      success: res.success,
      data: res.data,
    };
  },
};

// ============================================================================
// 13. SUPPLIER RECONCILIATION & AP AGING API SERVICE
// Accounts Payable ageing analysis and supplier statement matching
// ============================================================================

export const supplierReconciliationApiService = {
  async getApAging(supplierId?: string) {
    const params = supplierId ? { supplierId } : {};
    const res = await apiClient.get<{
      success: boolean;
      asOfDate: string;
      grandTotal: number;
      totalUnpaidInvoices: number;
      buckets: ApAgingReport['buckets'];
      supplierSummary: ApAgingReport['supplierSummary'];
    }>('/api/supplier-reconciliation/ap-aging', { params });

    return {
      success: res.success,
      asOfDate: res.asOfDate,
      grandTotal: res.grandTotal,
      totalUnpaidInvoices: res.totalUnpaidInvoices,
      buckets: res.buckets,
      supplierSummary: res.supplierSummary,
    };
  },

  async reconcileStatement(payload: {
    supplierId: string;
    statementDate?: string;
    statementClosingBalance: number;
    entries: SupplierStatementEntry[];
  }) {
    const res = await apiClient.post<{
      success: boolean;
      reconciliation: SupplierStatementReconciliation;
    }>('/api/supplier-reconciliation/reconcile', payload);

    return {
      success: res.success,
      reconciliation: res.reconciliation,
    };
  },
};

// ============================================================================
// 14. LEGACY PROCUREMENT DATA MIGRATION API SERVICE
// Dry-run validation, duplicate & reference detection, safe batch import
// ============================================================================

export const legacyMigrationApiService = {
  async validateLegacyRecords(records: any[]) {
    const res = await apiClient.post<{
      success: boolean;
      summary: LegacyValidationSummary;
      records: LegacyValidationRecord[];
    }>('/api/procurement/legacy/validate', { records });

    return {
      success: res.success,
      summary: res.summary,
      records: res.records,
    };
  },

  async importLegacyRecords(records: any[]) {
    const res = await apiClient.post<{
      success: boolean;
      batchId: string;
      importedCount: number;
      skippedCount: number;
      message: string;
    }>('/api/procurement/legacy/import', { records });

    return {
      success: res.success,
      batchId: res.batchId,
      importedCount: res.importedCount,
      skippedCount: res.skippedCount,
      message: res.message,
    };
  },

  async getMigrationReports() {
    const res = await apiClient.get<{
      success: boolean;
      reports: LegacyMigrationReport[];
    }>('/api/procurement/legacy/reports');

    return {
      success: res.success,
      reports: res.reports || [],
    };
  },
};
