/**
 * Lead API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with the Cloudflare Worker API at /api/leads
 * - Uses existing apiClient with Firebase ID token authentication (Bearer header)
 * - Explicitly maps database snake_case fields to CrmLead camelCase fields
 * - Provides dedicated updateLeadStatus method for ChangeLeadStatusModal.tsx
 * - Never stores tokens in localStorage
 * - Fail-fast and robust error propagation
 */

import { apiClient, ApiError } from '@/lib/apiClient';
import type { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';

export interface BackendLeadRow {
  id: string;
  sl_no: number;
  lead_date: string;
  assigned_date: string | null;
  lead_specification: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  contact_company: string;
  contact_whatsapp: string | null;
  contact_salutation: string | null;
  contact_designation: string | null;
  contact_personal_mobile: string | null;
  contact_nationality: string | null;
  contact_telephone: string | null;
  contact_website: string | null;
  rating: string;
  status: string;
  value: number;
  source: string | null;
  source_name: string | null;
  campaign: string | null;
  business_opportunity: string | null;
  location: string | null;
  tags: string | null;
  comments: string | null;
  last_activity: string | null;
  last_activity_date: string | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_avatar: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  assigned_employee: string | null;
  assigned_manager: string | null;
  department: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendLeadNote {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

export interface BackendLeadActivityLog {
  id: string;
  lead_id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  note: string | null;
  old_status: string | null;
  new_status: string | null;
  old_rating: string | null;
  new_rating: string | null;
  created_at: string;
}

export interface LeadsListApiResponse {
  success: boolean;
  leads: BackendLeadRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  code?: string;
  message?: string;
}

export interface LeadDetailApiResponse {
  success: boolean;
  lead: BackendLeadRow;
  notes: BackendLeadNote[];
  activityLogs: BackendLeadActivityLog[];
  code?: string;
  message?: string;
}

export interface LeadStatusPatchApiResponse {
  success: boolean;
  message: string;
  lead: BackendLeadRow;
  code?: string;
}

export interface LeadQueryParams {
  q?: string;
  status?: string;
  rating?: string;
  page?: number;
  limit?: number;
}

/**
 * Maps a database snake_case row into the frontend CrmLead camelCase structure.
 */
export function mapBackendToCrmLead(
  row: BackendLeadRow,
  notes?: BackendLeadNote[]
): CrmLead {
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

  const mappedNotes = notes
    ? notes.map((n) => ({
        id: n.id,
        author: n.author_name,
        avatar: n.author_avatar || undefined,
        date: n.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        content: n.content,
      }))
    : undefined;

  return {
    id: row.id,
    slNo: row.sl_no ?? 1,
    leadDate: row.lead_date || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    assignedDate: row.assigned_date || undefined,
    leadAssigned: {
      name: row.assigned_employee || row.owner_name || 'Unassigned',
      avatar: row.owner_avatar || undefined,
    },
    contactDetails: {
      name: row.contact_name,
      phone: row.contact_phone,
      email: row.contact_email || undefined,
      company: row.contact_company,
      whatsapp: row.contact_whatsapp || undefined,
      salutation: row.contact_salutation || 'Mr.',
      designation: row.contact_designation || undefined,
      personalMobile: row.contact_personal_mobile || undefined,
      nationality: row.contact_nationality || undefined,
      telephone: row.contact_telephone || undefined,
      website: row.contact_website || undefined,
    },
    leadSpecification: row.lead_specification,
    createdBy: row.created_by_name || 'System',
    owner: row.owner_name || row.assigned_employee || 'Unassigned',
    ownerAvatar: row.owner_avatar || undefined,
    assignedEmployee: row.assigned_employee || row.owner_name || undefined,
    assignedManager: row.assigned_manager || undefined,
    department: row.department || 'Sales & HVAC Services',
    rating: (row.rating || 'Cold') as LeadRating,
    status: (row.status || 'Pending') as LeadStatus,
    lastActivity: row.last_activity || 'Lead registered',
    lastActivityDate: row.last_activity_date || undefined,
    value: Number(row.value) || 0,
    source: row.source || 'Direct Outreach',
    sourceName: row.source_name || undefined,
    campaign: row.campaign || undefined,
    businessOpportunity: row.business_opportunity || undefined,
    location: row.location || 'Dubai, UAE',
    tags: parsedTags,
    comments: row.comments || undefined,
    notes: mappedNotes,
  };
}

/**
 * Maps frontend CrmLead into backend snake_case JSON payload.
 */
export function mapCrmLeadToBackendPayload(lead: Partial<CrmLead>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (lead.id !== undefined) payload.id = lead.id;
  if (lead.leadDate !== undefined) payload.lead_date = lead.leadDate;
  if (lead.assignedDate !== undefined) payload.assigned_date = lead.assignedDate;
  const spec = (lead.leadSpecification || lead.comments || lead.businessOpportunity || 'Commercial client HVAC specification').trim();
  payload.lead_specification = spec;

  if (lead.contactDetails) {
    if (lead.contactDetails.name !== undefined) payload.contact_name = lead.contactDetails.name;
    if (lead.contactDetails.phone !== undefined) payload.contact_phone = lead.contactDetails.phone;
    if (lead.contactDetails.email !== undefined) payload.contact_email = lead.contactDetails.email;
    payload.contact_company = (lead.contactDetails.company || lead.contactDetails.name || 'New Enterprise Client').trim();
    if (lead.contactDetails.whatsapp !== undefined) payload.contact_whatsapp = lead.contactDetails.whatsapp;
    if (lead.contactDetails.salutation !== undefined) payload.contact_salutation = lead.contactDetails.salutation;
    if (lead.contactDetails.designation !== undefined) payload.contact_designation = lead.contactDetails.designation;
    if (lead.contactDetails.personalMobile !== undefined) payload.contact_personal_mobile = lead.contactDetails.personalMobile;
    if (lead.contactDetails.nationality !== undefined) payload.contact_nationality = lead.contactDetails.nationality;
    if (lead.contactDetails.telephone !== undefined) payload.contact_telephone = lead.contactDetails.telephone;
    if (lead.contactDetails.website !== undefined) payload.contact_website = lead.contactDetails.website;
  }

  if (lead.rating !== undefined) payload.rating = lead.rating;
  if (lead.status !== undefined) payload.status = lead.status;
  if (lead.value !== undefined) payload.value = Number(lead.value) || 0;
  if (lead.source !== undefined) payload.source = lead.source;
  if (lead.sourceName !== undefined) payload.source_name = lead.sourceName;
  if (lead.campaign !== undefined) payload.campaign = lead.campaign;
  if (lead.businessOpportunity !== undefined) payload.business_opportunity = lead.businessOpportunity;
  if (lead.location !== undefined) payload.location = lead.location;
  if (lead.tags !== undefined) {
    payload.tags = Array.isArray(lead.tags) ? lead.tags : lead.tags;
  }
  if (lead.comments !== undefined) payload.comments = lead.comments;
  if (lead.lastActivity !== undefined) payload.last_activity = lead.lastActivity;
  if (lead.lastActivityDate !== undefined) payload.last_activity_date = lead.lastActivityDate;
  if (lead.owner !== undefined) payload.owner_name = lead.owner;
  if (lead.ownerAvatar !== undefined) payload.owner_avatar = lead.ownerAvatar;
  if (lead.assignedEmployee !== undefined) payload.assigned_employee = lead.assignedEmployee;
  if (lead.assignedManager !== undefined) payload.assigned_manager = lead.assignedManager;
  if (lead.department !== undefined) payload.department = lead.department;

  return payload;
}

export const leadApiService = {
  /**
   * Retrieves paginated leads with optional search, status, and rating filters
   */
  async getLeads(
    params: LeadQueryParams = {}
  ): Promise<{ leads: CrmLead[]; total: number; totalPages: number }> {
    const res = await apiClient.get<LeadsListApiResponse>('/api/leads', {
      params: {
        q: params.q,
        status: params.status,
        rating: params.rating,
        page: params.page,
        limit: params.limit,
      },
      requireAuth: false,
    });

    if (!res || !res.success || !Array.isArray(res.leads)) {
      throw new ApiError(res?.message || 'Failed to retrieve leads from database', 500);
    }

    return {
      leads: res.leads.map((row) => mapBackendToCrmLead(row)),
      total: res.pagination?.total ?? res.leads.length,
      totalPages: res.pagination?.totalPages ?? 1,
    };
  },

  /**
   * Retrieves single lead by ID with notes and activity history
   */
  async getLead(id: string): Promise<{ lead: CrmLead; notes: BackendLeadNote[]; activityLogs: BackendLeadActivityLog[] }> {
    if (!id || !id.trim()) {
      throw new ApiError('Lead ID is required for retrieval', 400);
    }

    const res = await apiClient.get<LeadDetailApiResponse>(`/api/leads/${encodeURIComponent(id.trim())}`, {
      requireAuth: false,
    });

    if (!res || !res.success || !res.lead) {
      throw new ApiError(res?.message || `Lead ${id} not found`, 404);
    }

    return {
      lead: mapBackendToCrmLead(res.lead, res.notes),
      notes: res.notes || [],
      activityLogs: res.activityLogs || [],
    };
  },

  /**
   * Creates a new lead in the Cloudflare D1 database
   */
  async createLead(leadData: Omit<CrmLead, 'id' | 'slNo'> | Partial<CrmLead>): Promise<CrmLead> {
    const payload = mapCrmLeadToBackendPayload(leadData);

    const res = await apiClient.post<{ success: boolean; lead: BackendLeadRow; message?: string }>(
      '/api/leads',
      payload,
      { requireAuth: false }
    );

    if (!res || !res.success || !res.lead) {
      throw new ApiError(res?.message || 'Failed to create lead record', 500);
    }

    return mapBackendToCrmLead(res.lead);
  },

  /**
   * Updates an existing lead record in Cloudflare D1
   */
  async updateLead(id: string, updated: Partial<CrmLead>): Promise<CrmLead> {
    if (!id || !id.trim()) {
      throw new ApiError('Lead ID is required for update', 400);
    }

    const payload = mapCrmLeadToBackendPayload(updated);

    const res = await apiClient.put<{ success: boolean; lead: BackendLeadRow; message?: string }>(
      `/api/leads/${encodeURIComponent(id.trim())}`,
      payload,
      { requireAuth: false }
    );

    if (!res || !res.success || !res.lead) {
      throw new ApiError(res?.message || `Failed to update lead ${id}`, 500);
    }

    return mapBackendToCrmLead(res.lead);
  },

  /**
   * Dedicated status and rating update endpoint tailored for ChangeLeadStatusModal.tsx
   * Updates status, rating, comments, inserts activity log, and optionally creates a lead note.
   */
  async updateLeadStatus(
    id: string,
    data: {
      status?: LeadStatus;
      rating?: LeadRating;
      comments?: string;
      addNote?: boolean;
    }
  ): Promise<CrmLead> {
    if (!id || !id.trim()) {
      throw new ApiError('Lead ID is required for status update', 400);
    }

    const res = await apiClient.patch<LeadStatusPatchApiResponse>(
      `/api/leads/${encodeURIComponent(id.trim())}/status`,
      {
        status: data.status,
        rating: data.rating,
        comments: data.comments,
        addNote: data.addNote,
      },
      { requireAuth: false }
    );

    if (!res || !res.success || !res.lead) {
      throw new ApiError(res?.message || `Failed to update lead status for ${id}`, 500);
    }

    return mapBackendToCrmLead(res.lead);
  },

  /**
   * Soft-deletes a lead from Cloudflare D1
   */
  async deleteLead(id: string): Promise<void> {
    if (!id || !id.trim()) {
      throw new ApiError('Lead ID is required for deletion', 400);
    }

    const res = await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/leads/${encodeURIComponent(id.trim())}`,
      { requireAuth: false }
    );

    if (!res || !res.success) {
      throw new ApiError(res?.message || `Failed to delete lead ${id}`, 500);
    }
  },
};

export default leadApiService;
