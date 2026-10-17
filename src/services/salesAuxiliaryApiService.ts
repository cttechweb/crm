/**
 * Sales Auxiliary API Service for Cool Technologies CRM Frontend
 * 
 * Communicates with Cloudflare Worker API for Phase 2 modules:
 * - Proforma Invoices: /api/proformas
 * - Receipts: /api/receipts
 * - Delivery Notes: /api/delivery-notes
 * 
 * Features:
 * - Uses centralized apiClient with Firebase ID token authentication (Bearer header)
 * - Maps between backend database snake_case and frontend camelCase types
 * - Provides non-destructive idempotent migration helpers for localStorage records
 * - Preserves relationships to customers, quotations, invoices, and opportunities/sales orders
 * - Robust error handling with graceful fallback
 */

import { apiClient } from '@/lib/apiClient';
import type {
  CrmProformaInvoice,
  CrmInvoiceLineItem,
  CrmReceipt,
  CrmDeliveryNote,
} from '@/types/enterprise-crm';

// ============================================================================
// 1. BACKEND TYPE DEFINITIONS
// ============================================================================

export interface BackendProformaInvoiceRow {
  id: string;
  sl_no: number | null;
  pi_number: string;
  quotation_ref: string | null;
  quotation_id: string | null;
  opportunity_id: string | null;
  opportunity_title: string | null;
  customer: string;
  customer_id: string | null;
  issue_date: string;
  payment_terms: string | null;
  amount: number;
  vat_type: string | null;
  vat_rate: number | null;
  vat_amount: number;
  total_amount: number;
  discount: number;
  adjustment: number;
  status: string;
  prepared_by: string | null;
  prepared_by_mobile: string | null;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  phone: string | null;
  location: string | null;
  attention: string | null;
  trn_number: string | null;
  lpo_number: string | null;
  lpo_date: string | null;
  remarks: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  items?: BackendProformaItemRow[];
}

export interface BackendProformaItemRow {
  id: string;
  proforma_id: string;
  code: string | null;
  description: string;
  brand: string | null;
  unit: string | null;
  qty: number;
  price: number;
  total: number;
  sort_order: number;
}

export interface BackendReceiptRow {
  id: string;
  sl_no: number | null;
  receipt_number: string;
  invoice_ref: string | null;
  invoice_id: string | null;
  customer: string;
  customer_id: string | null;
  contact_person: string | null;
  phone: string | null;
  created_by: string | null;
  created_by_id: string | null;
  created_by_avatar: string | null;
  receipt_type: string | null;
  tags: string | null;
  payment_method: string;
  receipt_date: string;
  amount: number;
  reference_number: string | null;
  status: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BackendDeliveryNoteRow {
  id: string;
  sl_no: number | null;
  delivery_note_number: string;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  order_ref: string | null;
  order_id: string | null;
  order_description: string | null;
  customer: string;
  customer_id: string | null;
  invoice_ref: string | null;
  invoice_id: string | null;
  dn_type: string | null;
  location: string | null;
  received_by: string | null;
  received_phone: string | null;
  cost_updated: number;
  site_location: string | null;
  driver_name: string | null;
  vehicle_number: string | null;
  dispatch_date: string;
  items_count: number;
  status: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  items?: BackendDeliveryNoteItemRow[];
}

export interface BackendDeliveryNoteItemRow {
  id: string;
  delivery_note_id: string;
  code: string | null;
  description: string;
  brand: string | null;
  unit: string | null;
  qty_ordered: number;
  qty_dispatched: number;
  sort_order: number;
}

// ============================================================================
// 2. BACKEND -> FRONTEND MAPPERS
// ============================================================================

export function mapBackendProformaToFrontend(
  row: BackendProformaInvoiceRow
): CrmProformaInvoice {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    piNumber: row.pi_number,
    quotationRef: row.quotation_ref || undefined,
    opportunityTitle: row.opportunity_title || undefined,
    customer: row.customer,
    issueDate: row.issue_date,
    paymentTerms: row.payment_terms || undefined,
    amount: row.amount,
    vatAmount: row.vat_amount,
    totalAmount: row.total_amount,
    status: row.status,
    preparedBy: row.prepared_by || undefined,
    preparedByMobile: row.prepared_by_mobile || undefined,
    owner: row.owner || undefined,
    ownerAvatar: row.owner_avatar || undefined,
    remarks: row.remarks || undefined,
    phone: row.phone || undefined,
    location: row.location || undefined,
    attention: row.attention || undefined,
    trnNumber: row.trn_number || undefined,
    lpoNumber: row.lpo_number || undefined,
    lpoDate: row.lpo_date || undefined,
    adjustment: row.adjustment || undefined,
    items: Array.isArray(row.items)
      ? row.items.map((it) => ({
          id: it.id,
          code: it.code || undefined,
          description: it.description,
          unit: it.unit || undefined,
          brand: it.brand || undefined,
          qty: it.qty,
          price: it.price,
          total: it.total,
        }))
      : undefined,
  };
}

export function mapBackendReceiptToFrontend(row: BackendReceiptRow): CrmReceipt {
  let tagsArray: string[] = [];
  if (row.tags) {
    try {
      if (row.tags.startsWith('[')) {
        tagsArray = JSON.parse(row.tags);
      } else {
        tagsArray = [row.tags];
      }
    } catch {
      tagsArray = [row.tags];
    }
  }

  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    receiptNumber: row.receipt_number,
    invoiceRef: row.invoice_ref || undefined,
    customer: row.customer,
    contactPerson: row.contact_person || undefined,
    phone: row.phone || undefined,
    createdBy: row.created_by || undefined,
    createdByAvatar: row.created_by_avatar || undefined,
    receiptType: row.receipt_type || undefined,
    tags: tagsArray.length > 0 ? tagsArray : undefined,
    paymentMethod: row.payment_method,
    receiptDate: row.receipt_date,
    amount: row.amount,
    referenceNumber: row.reference_number || undefined,
    status: row.status,
  };
}

export function mapBackendDeliveryNoteToFrontend(
  row: BackendDeliveryNoteRow
): CrmDeliveryNote {
  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    deliveryNoteNumber: row.delivery_note_number,
    owner: row.owner || undefined,
    ownerAvatar: row.owner_avatar || undefined,
    orderRef: row.order_ref || undefined,
    orderDescription: row.order_description || undefined,
    customer: row.customer,
    invoiceRef: row.invoice_ref || undefined,
    dnType: row.dn_type || undefined,
    location: row.location || undefined,
    receivedBy: row.received_by || undefined,
    receivedPhone: row.received_phone || undefined,
    costUpdated: Boolean(row.cost_updated),
    siteLocation: row.site_location || undefined,
    driverName: row.driver_name || undefined,
    vehicleNumber: row.vehicle_number || undefined,
    dispatchDate: row.dispatch_date,
    itemsCount: row.items_count,
    status: row.status,
  };
}

// ============================================================================
// 3. PROFORMA INVOICES API SERVICE
// ============================================================================

export const proformaApiService = {
  async getProformas(params: {
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    customer?: string;
  } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.customer) queryParams.customer = params.customer;

    const res = await apiClient.get<{
      success: boolean;
      proformas: BackendProformaInvoiceRow[];
      total: number;
      page: number;
      limit: number;
    }>('/api/proformas', { params: queryParams });

    return {
      success: res.success,
      proformas: (res.proformas || []).map(mapBackendProformaToFrontend),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  },

  async getProformaById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      proforma: BackendProformaInvoiceRow;
    }>(`/api/proformas/${encodeURIComponent(id)}`);

    return {
      success: res.success,
      proforma: mapBackendProformaToFrontend(res.proforma),
      raw: res.proforma,
    };
  },

  async createProforma(data: Partial<CrmProformaInvoice>) {
    const res = await apiClient.post<{
      success: boolean;
      proforma: BackendProformaInvoiceRow;
      message?: string;
    }>('/api/proformas', data);

    return {
      success: res.success,
      proforma: res.proforma ? mapBackendProformaToFrontend(res.proforma) : null,
      message: res.message,
    };
  },

  async updateProforma(id: string, data: Partial<CrmProformaInvoice>) {
    const res = await apiClient.put<{
      success: boolean;
      proforma: BackendProformaInvoiceRow;
      message?: string;
    }>(`/api/proformas/${encodeURIComponent(id)}`, data);

    return {
      success: res.success,
      proforma: res.proforma ? mapBackendProformaToFrontend(res.proforma) : null,
      message: res.message,
    };
  },

  async deleteProforma(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/proformas/${encodeURIComponent(id)}`
    );
  },

  async syncBatchProformas(proformas: CrmProformaInvoice[]) {
    return await apiClient.post<{
      success: boolean;
      inserted: number;
      skipped: number;
      total: number;
    }>('/api/proformas/sync-batch', { proformas });
  },

  /**
   * Safe, idempotent migration of local storage proforma invoices to Cloudflare D1.
   * Preserves existing local storage untouched.
   */
  async migrateLocalProformasToDatabase(): Promise<{
    migrated: boolean;
    count: number;
    error?: string;
  }> {
    if (typeof window === 'undefined') {
      return { migrated: false, count: 0 };
    }

    try {
      const isAlreadyMigrated = localStorage.getItem('crm_proforma_invoices_migrated');
      if (isAlreadyMigrated === 'true') {
        return { migrated: false, count: 0 };
      }

      const raw = localStorage.getItem('crm_proforma_invoices');
      if (!raw) {
        localStorage.setItem('crm_proforma_invoices_migrated', 'true');
        return { migrated: false, count: 0 };
      }

      let localProformas: CrmProformaInvoice[] = [];
      try {
        localProformas = JSON.parse(raw);
      } catch {
        return { migrated: false, count: 0, error: 'Failed to parse local proforma invoices' };
      }

      if (!Array.isArray(localProformas) || localProformas.length === 0) {
        localStorage.setItem('crm_proforma_invoices_migrated', 'true');
        return { migrated: false, count: 0 };
      }

      const res = await this.syncBatchProformas(localProformas);
      if (res.success) {
        localStorage.setItem('crm_proforma_invoices_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0, error: 'Sync endpoint returned unsuccessful' };
    } catch (e: any) {
      console.warn('[proformaApiService] Local storage proforma invoices migration error:', e);
      return { migrated: false, count: 0, error: e?.message || 'Unknown migration error' };
    }
  },
};

// ============================================================================
// 4. RECEIPTS API SERVICE
// ============================================================================

export const receiptApiService = {
  async getReceipts(params: {
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    customer?: string;
  } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.customer) queryParams.customer = params.customer;

    const res = await apiClient.get<{
      success: boolean;
      receipts: BackendReceiptRow[];
      total: number;
      page: number;
      limit: number;
    }>('/api/receipts', { params: queryParams });

    return {
      success: res.success,
      receipts: (res.receipts || []).map(mapBackendReceiptToFrontend),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  },

  async getReceiptById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      receipt: BackendReceiptRow;
    }>(`/api/receipts/${encodeURIComponent(id)}`);

    return {
      success: res.success,
      receipt: mapBackendReceiptToFrontend(res.receipt),
      raw: res.receipt,
    };
  },

  async createReceipt(data: Partial<CrmReceipt>) {
    const res = await apiClient.post<{
      success: boolean;
      receipt: BackendReceiptRow;
      message?: string;
    }>('/api/receipts', data);

    return {
      success: res.success,
      receipt: res.receipt ? mapBackendReceiptToFrontend(res.receipt) : null,
      message: res.message,
    };
  },

  async updateReceipt(id: string, data: Partial<CrmReceipt>) {
    const res = await apiClient.put<{
      success: boolean;
      receipt: BackendReceiptRow;
      message?: string;
    }>(`/api/receipts/${encodeURIComponent(id)}`, data);

    return {
      success: res.success,
      receipt: res.receipt ? mapBackendReceiptToFrontend(res.receipt) : null,
      message: res.message,
    };
  },

  async deleteReceipt(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/receipts/${encodeURIComponent(id)}`
    );
  },

  async syncBatchReceipts(receipts: CrmReceipt[]) {
    return await apiClient.post<{
      success: boolean;
      inserted: number;
      skipped: number;
      total: number;
    }>('/api/receipts/sync-batch', { receipts });
  },

  /**
   * Safe, idempotent migration of local storage receipts to Cloudflare D1.
   * Preserves existing local storage untouched.
   */
  async migrateLocalReceiptsToDatabase(): Promise<{
    migrated: boolean;
    count: number;
    error?: string;
  }> {
    if (typeof window === 'undefined') {
      return { migrated: false, count: 0 };
    }

    try {
      const isAlreadyMigrated = localStorage.getItem('crm_receipts_migrated');
      if (isAlreadyMigrated === 'true') {
        return { migrated: false, count: 0 };
      }

      const raw = localStorage.getItem('crm_receipts_data');
      if (!raw) {
        localStorage.setItem('crm_receipts_migrated', 'true');
        return { migrated: false, count: 0 };
      }

      let localReceipts: CrmReceipt[] = [];
      try {
        localReceipts = JSON.parse(raw);
      } catch {
        return { migrated: false, count: 0, error: 'Failed to parse local receipts' };
      }

      if (!Array.isArray(localReceipts) || localReceipts.length === 0) {
        localStorage.setItem('crm_receipts_migrated', 'true');
        return { migrated: false, count: 0 };
      }

      const res = await this.syncBatchReceipts(localReceipts);
      if (res.success) {
        localStorage.setItem('crm_receipts_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0, error: 'Sync endpoint returned unsuccessful' };
    } catch (e: any) {
      console.warn('[receiptApiService] Local storage receipts migration error:', e);
      return { migrated: false, count: 0, error: e?.message || 'Unknown migration error' };
    }
  },
};

// ============================================================================
// 5. DELIVERY NOTES API SERVICE
// ============================================================================

export const deliveryNoteApiService = {
  async getDeliveryNotes(params: {
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    customer?: string;
  } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.customer) queryParams.customer = params.customer;

    const res = await apiClient.get<{
      success: boolean;
      deliveryNotes: BackendDeliveryNoteRow[];
      total: number;
      page: number;
      limit: number;
    }>('/api/delivery-notes', { params: queryParams });

    return {
      success: res.success,
      deliveryNotes: (res.deliveryNotes || []).map(mapBackendDeliveryNoteToFrontend),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  },

  async getDeliveryNoteById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      deliveryNote: BackendDeliveryNoteRow;
    }>(`/api/delivery-notes/${encodeURIComponent(id)}`);

    return {
      success: res.success,
      deliveryNote: mapBackendDeliveryNoteToFrontend(res.deliveryNote),
      raw: res.deliveryNote,
    };
  },

  async createDeliveryNote(data: Partial<CrmDeliveryNote>) {
    const res = await apiClient.post<{
      success: boolean;
      deliveryNote: BackendDeliveryNoteRow;
      message?: string;
    }>('/api/delivery-notes', data);

    return {
      success: res.success,
      deliveryNote: res.deliveryNote ? mapBackendDeliveryNoteToFrontend(res.deliveryNote) : null,
      message: res.message,
    };
  },

  async updateDeliveryNote(id: string, data: Partial<CrmDeliveryNote>) {
    const res = await apiClient.put<{
      success: boolean;
      deliveryNote: BackendDeliveryNoteRow;
      message?: string;
    }>(`/api/delivery-notes/${encodeURIComponent(id)}`, data);

    return {
      success: res.success,
      deliveryNote: res.deliveryNote ? mapBackendDeliveryNoteToFrontend(res.deliveryNote) : null,
      message: res.message,
    };
  },

  async deleteDeliveryNote(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/delivery-notes/${encodeURIComponent(id)}`
    );
  },

  async syncBatchDeliveryNotes(deliveryNotes: CrmDeliveryNote[]) {
    return await apiClient.post<{
      success: boolean;
      inserted: number;
      skipped: number;
      total: number;
    }>('/api/delivery-notes/sync-batch', { deliveryNotes });
  },

  /**
   * Safe, idempotent migration of local storage delivery notes to Cloudflare D1.
   * Preserves existing local storage untouched.
   */
  async migrateLocalDeliveryNotesToDatabase(): Promise<{
    migrated: boolean;
    count: number;
    error?: string;
  }> {
    if (typeof window === 'undefined') {
      return { migrated: false, count: 0 };
    }

    try {
      const isAlreadyMigrated = localStorage.getItem('crm_delivery_notes_migrated');
      if (isAlreadyMigrated === 'true') {
        return { migrated: false, count: 0 };
      }

      const raw = localStorage.getItem('crm_delivery_notes_data');
      if (!raw) {
        localStorage.setItem('crm_delivery_notes_migrated', 'true');
        return { migrated: false, count: 0 };
      }

      let localDeliveryNotes: CrmDeliveryNote[] = [];
      try {
        localDeliveryNotes = JSON.parse(raw);
      } catch {
        return { migrated: false, count: 0, error: 'Failed to parse local delivery notes' };
      }

      if (!Array.isArray(localDeliveryNotes) || localDeliveryNotes.length === 0) {
        localStorage.setItem('crm_delivery_notes_migrated', 'true');
        return { migrated: false, count: 0 };
      }

      const res = await this.syncBatchDeliveryNotes(localDeliveryNotes);
      if (res.success) {
        localStorage.setItem('crm_delivery_notes_migrated', 'true');
        return { migrated: true, count: res.inserted || 0 };
      }
      return { migrated: false, count: 0, error: 'Sync endpoint returned unsuccessful' };
    } catch (e: any) {
      console.warn('[deliveryNoteApiService] Local storage delivery notes migration error:', e);
      return { migrated: false, count: 0, error: e?.message || 'Unknown migration error' };
    }
  },
};
