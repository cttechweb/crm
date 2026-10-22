/**
 * Customer API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with the Cloudflare Worker API at /api/customers
 * - Uses existing apiClient with Firebase ID token authentication (Bearer header)
 * - Explicitly maps database snake_case fields to CrmCustomer camelCase fields
 * - Never stores tokens in localStorage
 * - Propagates backend errors accurately (fail-fast, no silent success on failure)
 */

import { apiClient, ApiError } from '@/lib/apiClient';
import type { CrmCustomer } from '@/types/enterprise-crm';

export interface BackendCustomerContact {
  id: string;
  customer_id: string;
  salutation: string | null;
  name: string;
  designation: string | null;
  email: string | null;
  business_mobile: string | null;
  personal_mobile: string | null;
  spoken_language: string | null;
  nationality: string | null;
  is_primary: number;
  is_deleted: number;
}

export interface BackendCustomerRow {
  id: string;
  sl_no: number;
  customer_name: string;
  company_name: string | null;
  trn: string | null;
  company_group: string | null;
  industry_type: string | null;
  category: string | null;
  parent_customer_id: string | null;
  parent_customer_name: string | null;
  contact_person: string;
  salutation: string | null;
  email: string | null;
  phone: string;
  mobile: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  location: string | null;
  status: 'Active' | 'Inactive' | 'Prospect';
  type: 'Customer' | 'Prospect';
  key_customer: number;
  is_supplier: number;
  no_of_employees: string | null;
  source: string | null;
  source_name: string | null;
  campaign: string | null;
  tags: string | null;
  comments: string | null;
  contract_status: string | null;
  last_visit_date: string | null;
  assigned_equipment_count: number;
  active_jobs_count: number;
  sla_level: string | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_avatar: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  created_from_lead_id: string | null;
  assigned_date: string | null;
  date: string | null;
  total_spend: number;
  outstanding: number;
  total_deals: number;
  open_enquiries: number;
  last_enquiry: string | null;
  last_order: string | null;
  last_activity: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  contacts?: BackendCustomerContact[];
}

export interface CustomersListApiResponse {
  success: boolean;
  customers: BackendCustomerRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  code?: string;
  message?: string;
}

export interface CustomerDetailApiResponse {
  success: boolean;
  customer: BackendCustomerRow;
  code?: string;
  message?: string;
}

export interface CustomerDeleteApiResponse {
  success: boolean;
  message: string;
  code?: string;
}

export interface CustomerQueryParams {
  q?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Maps a database snake_case row into the frontend CrmCustomer camelCase structure.
 */
export function mapBackendToCrmCustomer(row: BackendCustomerRow): CrmCustomer {
  // Parse tags if stored as JSON string
  let parsedTags: string[] = [];
  if (row.tags) {
    try {
      const parsed = JSON.parse(row.tags);
      if (Array.isArray(parsed)) {
        parsedTags = parsed.map((t) => String(t));
      } else if (typeof row.tags === 'string') {
        parsedTags = row.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    } catch {
      parsedTags = row.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    customerName: row.customer_name || '',
    companyName: row.company_name || undefined,
    contactPerson: row.contact_person || '',
    salutation: row.salutation || undefined,
    phone: row.phone || '',
    mobile: row.mobile || undefined,
    email: row.email || '',
    owner: row.owner_name || row.owner_id || 'Unassigned',
    ownerAvatar: row.owner_avatar || undefined,
    status: row.status || 'Active',
    type: row.type || 'Customer',
    date: row.date || row.created_at?.split('T')[0] || undefined,
    createdDate: row.created_at || undefined,
    assignedDate: row.assigned_date || undefined,
    industryType: row.industry_type || undefined,
    keyCustomer: Boolean(row.key_customer),
    source: row.source || undefined,
    sourceName: row.source_name || undefined,
    campaign: row.campaign || undefined,
    tags: parsedTags,
    lastEnquiry: row.last_enquiry || undefined,
    openEnquiries: row.open_enquiries ?? 0,
    lastOrder: row.last_order || undefined,
    outstanding: Number(row.outstanding) || 0,
    lastActivity: row.last_activity || 'Active account',
    companyGroup: row.company_group || '',
    totalDeals: Number(row.total_deals) || 0,
    totalSpend: Number(row.total_spend) || 0,
    category: row.category || undefined,
    address: row.address || undefined,
    city: row.city || 'Dubai',
    website: row.website || undefined,
    contractStatus: row.contract_status || undefined,
    lastVisitDate: row.last_visit_date || undefined,
    assignedEquipmentCount: Number(row.assigned_equipment_count) || 0,
    activeJobsCount: Number(row.active_jobs_count) || 0,
    slaLevel: row.sla_level || undefined,
    createdFromLeadId: row.created_from_lead_id || undefined,
    parentCustomer: row.parent_customer_name || row.parent_customer_id || undefined,
    employees: row.no_of_employees || undefined,
    country: row.country || 'United Arab Emirates',
    stateRegion: row.state_region || 'Dubai',
    location: row.location || undefined,
    trn: row.trn || undefined,
    comments: row.comments || undefined,
    isSupplier: Boolean(row.is_supplier),
    createdBy: row.created_by_name || row.created_by_id || undefined,
  };
}

/**
 * Maps frontend CrmCustomer partial fields into the database snake_case payload.
 */
export function mapCrmCustomerToBackendPayload(
  cust: Partial<CrmCustomer>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (cust.customerName !== undefined) payload.customer_name = cust.customerName.trim().toUpperCase();
  if (cust.companyName !== undefined) payload.company_name = cust.companyName;
  if (cust.contactPerson !== undefined) payload.contact_person = cust.contactPerson;
  if (cust.salutation !== undefined) payload.salutation = cust.salutation;
  if (cust.phone !== undefined) payload.phone = cust.phone;
  if (cust.mobile !== undefined) payload.mobile = cust.mobile;
  if (cust.email !== undefined) payload.email = cust.email;
  if (cust.website !== undefined) payload.website = cust.website;
  if (cust.address !== undefined) payload.address = cust.address;
  if (cust.city !== undefined) payload.city = cust.city;
  if (cust.stateRegion !== undefined) payload.state_region = cust.stateRegion;
  if (cust.country !== undefined) payload.country = cust.country;
  if (cust.location !== undefined) payload.location = cust.location;
  if (cust.status !== undefined) payload.status = cust.status;
  if (cust.type !== undefined) payload.type = cust.type;
  if (cust.companyGroup !== undefined) payload.company_group = cust.companyGroup;
  if (cust.industryType !== undefined) payload.industry_type = cust.industryType;
  if (cust.category !== undefined) payload.category = cust.category;
  if (cust.keyCustomer !== undefined) payload.key_customer = cust.keyCustomer ? 1 : 0;
  if (cust.isSupplier !== undefined) payload.is_supplier = cust.isSupplier ? 1 : 0;
  if (cust.employees !== undefined) payload.no_of_employees = String(cust.employees);
  if (cust.source !== undefined) payload.source = cust.source;
  if (cust.sourceName !== undefined) payload.source_name = cust.sourceName;
  if (cust.campaign !== undefined) payload.campaign = cust.campaign;
  if (cust.tags !== undefined) {
    payload.tags = Array.isArray(cust.tags) ? cust.tags : cust.tags;
  }
  if (cust.comments !== undefined) payload.comments = cust.comments;
  if (cust.trn !== undefined) payload.trn = cust.trn;
  if (cust.parentCustomer !== undefined) payload.parent_customer_name = cust.parentCustomer;
  if (cust.owner !== undefined) payload.owner_name = cust.owner;
  if (cust.ownerAvatar !== undefined) payload.owner_avatar = cust.ownerAvatar;
  if (cust.contractStatus !== undefined) payload.contract_status = cust.contractStatus;
  if (cust.lastVisitDate !== undefined) payload.last_visit_date = cust.lastVisitDate;
  if (cust.assignedEquipmentCount !== undefined) payload.assigned_equipment_count = cust.assignedEquipmentCount;
  if (cust.activeJobsCount !== undefined) payload.active_jobs_count = cust.activeJobsCount;
  if (cust.slaLevel !== undefined) payload.sla_level = cust.slaLevel;
  if (cust.createdFromLeadId !== undefined) payload.created_from_lead_id = cust.createdFromLeadId;
  if (cust.assignedDate !== undefined) payload.assigned_date = cust.assignedDate;
  if (cust.date !== undefined) payload.date = cust.date;
  if (cust.totalSpend !== undefined) payload.total_spend = Number(cust.totalSpend) || 0;
  if (cust.outstanding !== undefined) payload.outstanding = Number(cust.outstanding) || 0;
  if (cust.totalDeals !== undefined) payload.total_deals = Number(cust.totalDeals) || 0;
  if (cust.openEnquiries !== undefined) payload.open_enquiries = Number(cust.openEnquiries) || 0;
  if (cust.lastEnquiry !== undefined) payload.last_enquiry = cust.lastEnquiry;
  if (cust.lastOrder !== undefined) payload.last_order = cust.lastOrder;
  if (cust.lastActivity !== undefined) payload.last_activity = cust.lastActivity;

  return payload;
}

export const customerApiService = {
  /**
   * Fetches paginated, filtered customers from the CRM Worker API
   */
  async getCustomers(
    params?: CustomerQueryParams
  ): Promise<{ customers: CrmCustomer[]; total: number; totalPages: number; page: number }> {
    const queryParams: Record<string, string | number> = {};
    if (params?.q) queryParams.q = params.q;
    if (params?.status && params.status !== 'All') queryParams.status = params.status;
    if (params?.type && params.type !== 'All') queryParams.type = params.type;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    const response = await apiClient.get<CustomersListApiResponse>('/api/customers', {
      params: queryParams,
      requireAuth: false,
      timeoutMs: 15000,
    });

    if (!response || !response.success || !Array.isArray(response.customers)) {
      throw new ApiError(
        response?.message || 'Invalid customer list response received from backend.',
        500,
        response,
        '/api/customers'
      );
    }

    const customers = response.customers.map(mapBackendToCrmCustomer);
    return {
      customers,
      total: response.pagination?.total ?? customers.length,
      totalPages: response.pagination?.totalPages ?? 1,
      page: response.pagination?.page ?? 1,
    };
  },

  /**
   * Fetches a single customer by ID with contacts
   */
  async getCustomerById(id: string): Promise<CrmCustomer> {
    const cleanId = encodeURIComponent(id.trim());
    const response = await apiClient.get<CustomerDetailApiResponse>(`/api/customers/${cleanId}`, {
      requireAuth: false,
      timeoutMs: 15000,
    });

    if (!response || !response.success || !response.customer) {
      throw new ApiError(
        response?.message || `Customer "${id}" could not be retrieved from backend.`,
        404,
        response,
        `/api/customers/${cleanId}`
      );
    }

    return mapBackendToCrmCustomer(response.customer);
  },

  /**
   * Creates a new customer record via POST /api/customers
   */
  async createCustomer(
    custData: Omit<CrmCustomer, 'id' | 'slNo'>
  ): Promise<CrmCustomer> {
    const payload = mapCrmCustomerToBackendPayload(custData);

    const response = await apiClient.post<CustomerDetailApiResponse>(
      '/api/customers',
      payload,
      {
        requireAuth: false,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success || !response.customer) {
      throw new ApiError(
        response?.message || 'Failed to create customer on CRM backend.',
        500,
        response,
        '/api/customers'
      );
    }

    return mapBackendToCrmCustomer(response.customer);
  },

  /**
   * Updates an existing customer record via PUT /api/customers/:id
   */
  async updateCustomer(
    id: string,
    updated: Partial<CrmCustomer>
  ): Promise<CrmCustomer> {
    const cleanId = encodeURIComponent(id.trim());
    const payload = mapCrmCustomerToBackendPayload(updated);

    const response = await apiClient.put<CustomerDetailApiResponse>(
      `/api/customers/${cleanId}`,
      payload,
      {
        requireAuth: false,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success || !response.customer) {
      throw new ApiError(
        response?.message || `Failed to update customer "${id}" on CRM backend.`,
        500,
        response,
        `/api/customers/${cleanId}`
      );
    }

    return mapBackendToCrmCustomer(response.customer);
  },

  /**
   * Soft-deletes / deactivates a customer record via DELETE /api/customers/:id
   */
  async deleteCustomer(id: string): Promise<void> {
    const cleanId = encodeURIComponent(id.trim());
    const response = await apiClient.delete<CustomerDeleteApiResponse>(
      `/api/customers/${cleanId}`,
      {
        requireAuth: false,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success) {
      throw new ApiError(
        response?.message || `Failed to deactivate customer "${id}" on CRM backend.`,
        500,
        response,
        `/api/customers/${cleanId}`
      );
    }
  },
};

export default customerApiService;
