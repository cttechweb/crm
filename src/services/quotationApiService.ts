/**
 * Quotation & RFQ API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with the Cloudflare Worker API at /api/quotations
 * - Full seamless offline & localhost integration fallback with website localStorage
 * - Supports executive CEO/COO approval and rejection workflows
 */

import { apiClient } from '@/lib/apiClient';

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id?: string | null;
  item_code?: string | null;
  description: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount?: number;
  vat_rate?: number;
  vat_amount?: number;
  total_amount: number;
  sort_order?: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer: string;
  customer_id?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  billing_address?: string | null;
  shipping_address?: string | null;
  subject: string;
  quote_date: string;
  valid_until?: string | null;
  subtotal: number;
  discount_total: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  status: 'Pending CEO Approval' | 'Approved' | 'Rejected' | 'Draft' | string;
  owner?: string | null;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  customer_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: QuotationItem[];
}

export interface QuotationListParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const quotationApiService = {
  /**
   * Fetches quotations list from CRM Worker API with local fallback
   */
  async getQuotations(
    params?: QuotationListParams
  ): Promise<{
    quotations: Quotation[];
    total: number;
  }> {
    const queryParams: Record<string, string | number> = {};
    if (params?.status && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.page) {
      queryParams.page = params.page;
    }
    if (params?.limit) {
      queryParams.limit = params.limit;
    }

    // 1. Try server API
    try {
      const res = await apiClient.get<{
        success: boolean;
        quotations: Quotation[];
        total: number;
      }>('/api/quotations', {
        params: queryParams,
        requireAuth: true,
      });

      if (res?.quotations && Array.isArray(res.quotations) && res.quotations.length > 0) {
        return {
          quotations: res.quotations,
          total: res.total || res.quotations.length,
        };
      }
    } catch (apiErr) {
      console.warn('[Quotation API] Server fetch note:', apiErr);
    }

    // 2. Localhost & Client-side storage fallback (matches website submissions)
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('cooltech_rfqs_v1');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped: Quotation[] = parsed.map((item: any, idx: number) => {
              const products = Array.isArray(item.products)
                ? item.products
                : Array.isArray(item.items)
                ? item.items
                : [];
              const subtotal = products.reduce(
                (acc: number, p: any) =>
                  acc + (Number(p.quantity || 1) * Number(p.unitPrice || 0)),
                0
              );
              const vatAmount = subtotal * 0.05;
              const totalAmount = subtotal + vatAmount;

              const isApproved =
                item.status?.toLowerCase() === 'approved' || item.isApproved === true;
              const isRejected =
                item.status?.toLowerCase() === 'rejected' ||
                item.status?.toLowerCase() === 'declined';

              return {
                id: item.id || item.rfqNumber || `RFQ-2026-${idx}`,
                quotation_number: item.rfqNumber || item.id || `RFQ-2026-${idx}`,
                customer: item.company || item.name || 'Valued B2B Partner',
                contact_person: item.name || 'Customer',
                phone: item.phone || '',
                email: item.email || '',
                shipping_address: item.projectLocation || 'Abu Dhabi, UAE',
                subject:
                  item.projectDescription ||
                  item.loadRequirements ||
                  'Commercial HVAC Project Quotation',
                quote_date: item.createdAt
                  ? item.createdAt.split('T')[0]
                  : new Date().toISOString().split('T')[0],
                subtotal: subtotal,
                discount_total: 0,
                vat_rate: 5,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                status: isApproved
                  ? 'Approved'
                  : isRejected
                  ? 'Rejected'
                  : 'Pending CEO Approval',
                owner: 'Muhammed Shamseer (CEO)',
                payment_terms: item.paymentTerms || '30 Days Net B2B Credit',
                delivery_terms: 'Ex-Works Abu Dhabi / Free Delivery within UAE',
                customer_notes: item.projectDescription || '',
                created_at: item.createdAt || new Date().toISOString(),
                updated_at: item.updatedAt || new Date().toISOString(),
                items: products.map((p: any, pIdx: number) => ({
                  id: `itm_${idx}_${pIdx}`,
                  quotation_id: item.id || item.rfqNumber,
                  description: p.productName || p.name || 'Equipment Unit',
                  quantity: Number(p.quantity || 1),
                  unit_price: Number(p.unitPrice || 0),
                  total_amount:
                    Number(p.quantity || 1) * Number(p.unitPrice || 0),
                })),
              };
            });

            // Filter by active status
            let filtered = mapped;
            if (params?.status && params.status !== 'all') {
              filtered = filtered.filter((q) => q.status === params.status);
            }
            if (params?.search && params.search.trim()) {
              const q = params.search.toLowerCase();
              filtered = filtered.filter(
                (item) =>
                  item.quotation_number.toLowerCase().includes(q) ||
                  item.customer.toLowerCase().includes(q) ||
                  item.subject.toLowerCase().includes(q)
              );
            }

            return {
              quotations: filtered,
              total: filtered.length,
            };
          }
        }
      } catch (storageErr) {
        console.warn('[Quotation API] Local storage mapping warning:', storageErr);
      }
    }

    return {
      quotations: [],
      total: 0,
    };
  },

  /**
   * Fetches a single quotation by ID
   */
  async getQuotationById(id: string): Promise<Quotation> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        quotation: Quotation;
      }>(`/api/quotations/${encodeURIComponent(id)}`, {
        requireAuth: true,
      });

      if (res?.quotation) {
        return res.quotation;
      }
    } catch {}

    // Fallback from getQuotations
    const list = await this.getQuotations();
    const found = list.quotations.find((q) => q.id === id || q.quotation_number === id);
    if (found) return found;

    throw new Error('Quotation not found');
  },

  /**
   * CEO / COO Executive Sign-off Approval
   */
  async approveQuotation(
    id: string,
    payload: {
      notes?: string;
      total_amount?: number;
      payment_terms?: string;
    }
  ): Promise<Quotation> {
    // 1. Try server approve
    try {
      const res = await apiClient.post<{
        success: boolean;
        message: string;
        quotation: Quotation;
      }>(`/api/quotations/${encodeURIComponent(id)}/approve`, payload, {
        requireAuth: true,
      });

      if (res?.quotation) {
        return res.quotation;
      }
    } catch (err) {
      console.warn('[Quotation API] Server approve warning:', err);
    }

    // 2. Localhost persistence update
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('cooltech_rfqs_v1');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            const updatedList = parsed.map((item: any) => {
              if (item.id === id || item.rfqNumber === id) {
                return {
                  ...item,
                  status: 'Approved',
                  isApproved: true,
                  paymentTerms: payload.payment_terms || '30 Days Net B2B Credit',
                  approvedAt: new Date().toISOString(),
                  totalAmount: payload.total_amount || item.totalAmount,
                };
              }
              return item;
            });
            localStorage.setItem('cooltech_rfqs_v1', JSON.stringify(updatedList));

            const matched = updatedList.find((i: any) => i.id === id || i.rfqNumber === id);
            if (matched) {
              const userKey = matched.userId || matched.email;
              if (userKey) {
                localStorage.setItem(`ct_approved_quote_${userKey}`, JSON.stringify(matched));
              }
              // Dispatch event for website tabs in the same browser
              window.dispatchEvent(
                new CustomEvent('cooltech_rfqs_updated', { detail: updatedList })
              );

              return {
                id: matched.id || matched.rfqNumber,
                quotation_number: matched.rfqNumber || matched.id,
                customer: matched.company || matched.name,
                contact_person: matched.name,
                phone: matched.phone,
                email: matched.email,
                shipping_address: matched.projectLocation,
                subject: matched.projectDescription || 'Approved Quotation',
                quote_date: new Date().toISOString().split('T')[0],
                subtotal: matched.totalAmount || 0,
                discount_total: 0,
                vat_rate: 5,
                vat_amount: (matched.totalAmount || 0) * 0.05,
                total_amount: (matched.totalAmount || 0) * 1.05,
                status: 'Approved',
                owner: 'Muhammed Shamseer (CEO)',
                payment_terms: payload.payment_terms || '30 Days Net B2B Credit',
                delivery_terms: 'Ex-Works Abu Dhabi / Free Delivery within UAE',
                customer_notes: payload.notes || '',
                created_at: matched.createdAt || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            }
          }
        }
      } catch (storageErr) {
        console.warn('[Quotation API] Local approve warning:', storageErr);
      }
    }

    throw new Error('Failed to approve quotation');
  },

  /**
   * CEO / COO Executive Decline
   */
  async rejectQuotation(
    id: string,
    payload: {
      reason?: string;
    }
  ): Promise<Quotation> {
    try {
      const res = await apiClient.post<{
        success: boolean;
        message: string;
        quotation: Quotation;
      }>(`/api/quotations/${encodeURIComponent(id)}/reject`, payload, {
        requireAuth: true,
      });

      if (res?.quotation) {
        return res.quotation;
      }
    } catch (err) {
      console.warn('[Quotation API] Server reject warning:', err);
    }

    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem('cooltech_rfqs_v1');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            const updatedList = parsed.map((item: any) => {
              if (item.id === id || item.rfqNumber === id) {
                return {
                  ...item,
                  status: 'Rejected',
                  isApproved: false,
                  rejectedAt: new Date().toISOString(),
                  rejectionReason: payload.reason,
                };
              }
              return item;
            });
            localStorage.setItem('cooltech_rfqs_v1', JSON.stringify(updatedList));
            window.dispatchEvent(
              new CustomEvent('cooltech_rfqs_updated', { detail: updatedList })
            );

            return {
              id,
              quotation_number: id,
              customer: 'Valued Partner',
              subject: 'Quotation Declined',
              quote_date: new Date().toISOString().split('T')[0],
              subtotal: 0,
              discount_total: 0,
              vat_rate: 5,
              vat_amount: 0,
              total_amount: 0,
              status: 'Rejected',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
        }
      } catch {}
    }

    throw new Error('Failed to reject quotation');
  },
};
