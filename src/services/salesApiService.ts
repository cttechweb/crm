/**
 * Sales API Service for Cool Technologies CRM Frontend
 * 
 * Manages the complete 5-stage CRM Sales Lifecycle:
 * Lead -> Opportunity -> Quotation (Commercial Offer) -> Sales Order -> Invoice
 * 
 * - Communicates with Cloudflare Worker API:
 *     - /api/opportunities
 *     - /api/quotations
 *     - /api/orders
 *     - /api/invoices
 * - Uses apiClient with Firebase ID token authentication (Bearer header)
 * - Two-way mapper between database snake_case and frontend camelCase types
 * - Fail-fast and robust error propagation
 */

import { apiClient, ApiError } from '@/lib/apiClient';
import type {
  CrmSalesOpportunity,
  CrmQuotation,
  CrmQuotationItem,
  CrmSalesOrder,
  CrmInvoice,
  CrmInvoiceLineItem,
} from '@/types/enterprise-crm';

// ============================================================================
// 1. OPPORTUNITIES SERVICE
// ============================================================================
export function mapBackendOpportunityToFrontend(row: any): CrmSalesOpportunity {
  if (!row) return {} as CrmSalesOpportunity;
  return {
    ...row,
    id: row.id,
    slNo: row.sl_no || row.slNo || undefined,
    opportunityCode: row.opportunity_code || row.opportunityCode || undefined,
    createdFromLeadId: row.created_from_lead_id || row.createdFromLeadId || undefined,
    title: row.title || 'Untitled Opportunity',
    customer: row.customer || '',
    contactPerson: row.contact_person || row.contactPerson || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    amount: Number(row.amount) || 0,
    stage: row.stage || 'Opportunity',
    probability: Number(row.probability) || 50,
    expectedClose: row.expected_close || row.expectedClose || new Date().toISOString().split('T')[0],
    owner: row.owner || 'Unassigned',
    campaign: row.campaign || '',
    source: row.source || '',
    vatType: row.vat_type || row.vatType || 'With VAT',
    vatRate: Number(row.vat_rate ?? row.vatRate ?? 5),
    adjustment: Number(row.adjustment) || 0,
    lpoNumber: row.lpo_number || row.lpoNumber || '',
    lpoDate: row.lpo_date || row.lpoDate || '',
    location: row.location || '',
    reference: row.reference || '',
    comments: row.comments || '',
    tags: row.tags ? (typeof row.tags === 'string' ? row.tags.split(',') : row.tags) : [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    opportunityDate: row.opportunityDate || row.opportunity_date || (row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
    lastActivity: row.lastActivity || row.last_activity || `${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} 12:00:00 PM`,
    lastActivityRelative: row.lastActivityRelative || 'Today',
    classification: row.classification || 'Corporate',
    rating: row.rating || 'Cold',
    businessOpportunity: row.businessOpportunity || row.subtitle || '',
    subtitle: row.subtitle || row.businessOpportunity || '',
    discount: Number(row.discount) || 0,
    totalAmount: Number(row.totalAmount || row.total_amount || row.amount) || 0,
    enquiryItems: row.enquiryItems || row.items || [],
    items: row.items || row.enquiryItems || [],
  };
}

export const opportunityApiService = {
  async getOpportunities(params: { limit?: number; page?: number; search?: string; stage?: string } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.stage && params.stage !== 'All') queryParams.stage = params.stage;

    const res = await apiClient.get<{
      success: boolean;
      opportunities: any[];
      total: number;
    }>('/api/opportunities', { params: queryParams });

    return {
      success: res.success,
      opportunities: (res.opportunities || []).map(mapBackendOpportunityToFrontend),
      total: res.total,
    };
  },

  async createOpportunity(data: Partial<CrmSalesOpportunity>) {
    const res = await apiClient.post<{
      success: boolean;
      alreadyConverted?: boolean;
      opportunity: any;
      message?: string;
    }>('/api/opportunities', {
      body: {
        id: data.id,
        opportunityCode: data.opportunityCode,
        opportunity_code: data.opportunityCode,
        title: data.title,
        customer: data.customer,
        contactPerson: data.contactPerson,
        phone: data.phone,
        whatsapp: data.whatsapp,
        amount: data.amount,
        stage: data.stage || 'Opportunity',
        probability: data.probability,
        expectedClose: data.expectedClose,
        owner: data.owner,
        createdFromLeadId: data.createdFromLeadId,
        campaign: data.campaign,
        source: data.source,
        vatType: data.vatType,
        vatRate: data.vatRate,
        adjustment: data.adjustment,
        lpoNumber: data.lpoNumber,
        lpoDate: data.lpoDate,
        location: data.location,
        reference: data.reference,
        comments: data.comments,
        tags: data.tags,
      },
    });

    return {
      success: res.success,
      alreadyConverted: res.alreadyConverted,
      opportunity: mapBackendOpportunityToFrontend(res.opportunity),
      message: res.message,
    };
  },

  async updateOpportunity(id: string, data: Partial<CrmSalesOpportunity>) {
    const res = await apiClient.put<{
      success: boolean;
      opportunity: any;
    }>(`/api/opportunities/${id}`, {
      body: data,
    });

    return mapBackendOpportunityToFrontend(res.opportunity);
  },

  async deleteOpportunity(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(`/api/opportunities/${id}`);
  },
};


// ============================================================================
// 2. QUOTATIONS SERVICE
// ============================================================================
export function mapBackendQuotationToFrontend(row: any): CrmQuotation {
  const items: CrmQuotationItem[] = Array.isArray(row.items)
    ? row.items.map((itm: any) => ({
      id: itm.id,
      productId: itm.product_id || undefined,
      itemCode: itm.item_code || '',
      description: itm.description || '',
      quantity: Number(itm.quantity) || 1,
      unit: itm.unit || 'Pcs',
      unitPrice: Number(itm.unit_price) || 0,
      discount: Number(itm.discount) || 0,
      vatRate: Number(itm.vat_rate) || 5,
      vatAmount: Number(itm.vat_amount) || 0,
      totalAmount: Number(itm.total_amount) || 0,
      total: Number(itm.total_amount) || 0,
    }))
    : [];

  return {
    id: row.id,
    slNo: row.sl_no || undefined,
    quotationNumber: row.quotation_number,
    customer: row.customer,
    customerId: row.customer_id || undefined,
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    billingAddress: row.billing_address || '',
    shippingAddress: row.shipping_address || '',
    opportunityId: row.opportunity_id || undefined,
    opportunityCode: row.opportunity_code || undefined,
    subject: row.subject || '',
    quoteDate: row.quote_date || new Date().toISOString().split('T')[0],
    validUntil: row.valid_until || '',
    subtotal: Number(row.subtotal) || 0,
    discountTotal: Number(row.discount_total) || 0,
    vatRate: Number(row.vat_rate) || 5,
    vatAmount: Number(row.vat_amount) || 0,
    totalAmount: Number(row.total_amount) || 0,
    status: row.status || 'Draft',
    owner: row.owner || '',
    assignedTo: row.assigned_to || '',
    paymentTerms: row.payment_terms || '',
    deliveryTerms: row.delivery_terms || '',
    customerNotes: row.customer_notes || '',
    convertedOrderId: row.converted_order_id || undefined,
    salesOrderNumber: row.sales_order_number || undefined,
    convertedAt: row.converted_at || undefined,
    items,
    itemsCount: items.length,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export const quotationApiService = {
  async getQuotations(params: { limit?: number; page?: number; search?: string; status?: string; oppId?: string } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.oppId) queryParams.oppId = params.oppId;

    const res = await apiClient.get<{
      success: boolean;
      quotations: any[];
      total: number;
    }>('/api/quotations', { params: queryParams });

    return {
      success: res.success,
      quotations: (res.quotations || []).map(mapBackendQuotationToFrontend),
      total: res.total,
    };
  },

  async createQuotation(data: Partial<CrmQuotation>) {
    const res = await apiClient.post<{
      success: boolean;
      quotation: any;
    }>('/api/quotations', {
      body: data,
    });

    return mapBackendQuotationToFrontend(res.quotation);
  },

  async updateQuotation(id: string, data: Partial<CrmQuotation>) {
    const res = await apiClient.put<{
      success: boolean;
      quotation: any;
    }>(`/api/quotations/${id}`, {
      body: data,
    });

    return mapBackendQuotationToFrontend(res.quotation);
  },

  async deleteQuotation(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(`/api/quotations/${id}`);
  },
};


// ============================================================================
// 3. SALES ORDERS SERVICE
// ============================================================================
export function mapBackendSalesOrderToFrontend(row: any): CrmSalesOrder {
  const items: CrmQuotationItem[] = Array.isArray(row.items)
    ? row.items.map((itm: any) => ({
      id: itm.id,
      productId: itm.product_id || undefined,
      itemCode: itm.item_code || '',
      description: itm.description || '',
      quantity: Number(itm.quantity) || 1,
      unit: itm.unit || 'Pcs',
      unitPrice: Number(itm.unit_price) || 0,
      discount: Number(itm.discount) || 0,
      vatRate: Number(itm.vat_rate) || 5,
      vatAmount: Number(itm.vat_amount) || 0,
      totalAmount: Number(itm.total_amount) || 0,
      total: Number(itm.total_amount) || 0,
    }))
    : [];

  return {
    id: row.id,
    slNo: row.sl_no || undefined,
    orderNumber: row.order_number,
    quotationRef: row.quotation_ref || undefined,
    opportunityRef: row.opportunity_ref || undefined,
    customer: row.customer,
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    billingAddress: row.billing_address || '',
    shippingAddress: row.shipping_address || '',
    orderDate: row.order_date || new Date().toISOString().split('T')[0],
    deliveryDueDate: row.delivery_due_date || '',
    poReference: row.po_reference || '',
    amount: Number(row.amount) || 0,
    vatAmount: Number(row.vat_amount) || 0,
    totalAmount: Number(row.total_amount) || 0,
    profit: Number(row.profit) || 0,
    receivable: Number(row.receivable) || 0,
    status: row.status || 'Confirmed',
    owner: row.owner || '',
    assignedTo: row.assigned_to || '',
    subject: row.subject || '',
    notes: row.notes || '',
    paymentTerms: row.payment_terms || '',
    deliveryTerms: row.delivery_terms || '',
    items,
  };
}

export const salesOrderApiService = {
  async getSalesOrders(params: { limit?: number; page?: number; search?: string; status?: string; quotationId?: string } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.quotationId) queryParams.quotationId = params.quotationId;

    const res = await apiClient.get<{
      success: boolean;
      orders: any[];
      total: number;
    }>('/api/orders', { params: queryParams });

    return {
      success: res.success,
      orders: (res.orders || []).map(mapBackendSalesOrderToFrontend),
      total: res.total,
    };
  },

  async createSalesOrder(data: Partial<CrmSalesOrder> & { quotationId?: string }) {
    const res = await apiClient.post<{
      success: boolean;
      alreadyConverted?: boolean;
      order: any;
      message?: string;
    }>('/api/orders', {
      body: data,
    });

    return {
      success: res.success,
      alreadyConverted: res.alreadyConverted,
      order: mapBackendSalesOrderToFrontend(res.order),
      message: res.message,
    };
  },

  async updateSalesOrder(id: string, data: Partial<CrmSalesOrder>) {
    const res = await apiClient.put<{
      success: boolean;
      order: any;
    }>(`/api/orders/${id}`, {
      body: data,
    });

    return mapBackendSalesOrderToFrontend(res.order);
  },

  async deleteSalesOrder(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(`/api/orders/${id}`);
  },
};


// ============================================================================
// 4. INVOICES SERVICE
// ============================================================================
export function mapBackendInvoiceToFrontend(row: any): CrmInvoice {
  const items: CrmInvoiceLineItem[] = Array.isArray(row.items)
    ? row.items.map((itm: any) => ({
      id: itm.id,
      code: itm.code || '',
      description: itm.description || '',
      brand: itm.brand || '',
      unit: itm.unit || 'Pcs',
      qty: Number(itm.qty) || 1,
      price: Number(itm.price) || 0,
      total: Number(itm.total) || 0,
    }))
    : [];

  return {
    id: row.id,
    slNo: row.sl_no || 1,
    invoiceNumber: row.invoice_number,
    orderRef: row.order_ref || undefined,
    opportunityOrderRef: row.opportunity_order_ref || undefined,
    customer: row.customer,
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    attention: row.attention || '',
    location: row.location || '',
    trnNumber: row.trn_number || '',
    lpoNumber: row.lpo_number || '',
    lpoDate: row.lpo_date || '',
    referenceNumber: row.reference_number || '',
    description: row.description || '',
    issueDate: row.issue_date || new Date().toISOString().split('T')[0],
    dueDate: row.due_date || '',
    amount: Number(row.amount) || 0,
    subtotal: Number(row.subtotal) || Number(row.amount) || 0,
    discount: Number(row.discount) || 0,
    adjustment: Number(row.adjustment) || 0,
    vatType: row.vat_type || 'With VAT',
    vatRate: Number(row.vat_rate) || 5,
    vatAmount: Number(row.vat_amount) || 0,
    totalAmount: Number(row.total_amount) || 0,
    paidAmount: Number(row.paid_amount) || 0,
    balanceAmount: Number(row.balance_amount) || 0,
    status: row.status || 'Unpaid',
    termsConditions: row.terms_conditions || '',
    owner: row.owner || '',
    items,
  };
}

export const invoiceApiService = {
  async getInvoices(params: { limit?: number; page?: number; search?: string; status?: string; orderId?: string } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.orderId) queryParams.orderId = params.orderId;

    const res = await apiClient.get<{
      success: boolean;
      invoices: any[];
      total: number;
    }>('/api/invoices', { params: queryParams });

    return {
      success: res.success,
      invoices: (res.invoices || []).map(mapBackendInvoiceToFrontend),
      total: res.total,
    };
  },

  async createInvoice(data: Partial<CrmInvoice> & { orderId?: string }) {
    const res = await apiClient.post<{
      success: boolean;
      invoice: any;
    }>('/api/invoices', {
      body: data,
    });

    return mapBackendInvoiceToFrontend(res.invoice);
  },

  async updateInvoice(id: string, data: Partial<CrmInvoice>) {
    const res = await apiClient.put<{
      success: boolean;
      invoice: any;
    }>(`/api/invoices/${id}`, {
      body: data,
    });

    return mapBackendInvoiceToFrontend(res.invoice);
  },

  async deleteInvoice(id: string) {
    return await apiClient.delete<{ success: boolean; message?: string }>(`/api/invoices/${id}`);
  },
};
