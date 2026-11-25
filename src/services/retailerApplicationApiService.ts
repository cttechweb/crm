/**
 * Retailer Applications API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with the Cloudflare Worker API at /api/retailer-applications
 * - Uses existing apiClient with Firebase ID token / authenticated staff session
 * - Maps backend responses to typed RetailerApplication interfaces
 * - Never leaks secrets, tokens, or credentials to logs
 */

import { apiClient, ApiError } from '@/lib/apiClient';

export interface RetailerApplication {
  id: string;
  websiteApplicationId: string;
  websiteUserId: string;
  companyName: string;
  legalName: string;
  tradeLicenseNumber: string;
  taxRegistrationNumber: string | null;
  businessType: string;
  emirate: string;
  city: string;
  address: string | null;
  contactPerson: string;
  designation: string | null;
  email: string;
  phone: string;
  whatsappNumber: string | null;
  interestedCategories: string[];
  annualVolumeEstimate: string | null;
  paymentTermsRequested: string | null;
  tradeLicenseUrl: string | null;
  taxCertificateUrl: string | null;
  hasTradeLicense: boolean;
  hasTaxCertificate: boolean;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | string;
  rejectionReason: string | null;
  reviewNotes: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RetailerApplicationsListApiResponse {
  success: boolean;
  applications: RetailerApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts?: {
    filtered: number;
  };
  error?: string;
  message?: string;
}

export interface RetailerApplicationDetailApiResponse {
  success: boolean;
  application: RetailerApplication;
  error?: string;
  message?: string;
}

export interface RetailerApplicationListParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const retailerApplicationApiService = {
  /**
   * Fetches paginated, filtered retailer applications from the CRM Worker API
   */
  async getApplications(
    params?: RetailerApplicationListParams
  ): Promise<{
    applications: RetailerApplication[];
    total: number;
    totalPages: number;
    page: number;
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

    const response = await apiClient.get<RetailerApplicationsListApiResponse>(
      '/api/retailer-applications',
      {
        params: queryParams,
        requireAuth: true,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success || !Array.isArray(response.applications)) {
      throw new ApiError(
        response?.message || 'Invalid retailer applications list received from backend.',
        500,
        response,
        '/api/retailer-applications'
      );
    }

    return {
      applications: response.applications,
      total: response.pagination?.total ?? response.applications.length,
      totalPages: response.pagination?.totalPages ?? 1,
      page: response.pagination?.page ?? 1,
    };
  },

  /**
   * Fetches single retailer application details by ID or websiteApplicationId
   */
  async getApplicationById(id: string): Promise<RetailerApplication> {
    const cleanId = encodeURIComponent(id.trim());
    const response = await apiClient.get<RetailerApplicationDetailApiResponse>(
      `/api/retailer-applications/${cleanId}`,
      {
        requireAuth: true,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success || !response.application) {
      throw new ApiError(
        response?.message || `Retailer application "${id}" could not be retrieved from backend.`,
        404,
        response,
        `/api/retailer-applications/${cleanId}`
      );
    }

    return response.application;
  },

  /**
   * Approves a retailer application
   */
  async approveApplication(id: string, notes?: string): Promise<RetailerApplication> {
    const cleanId = encodeURIComponent(id.trim());
    const response = await apiClient.post<RetailerApplicationDetailApiResponse>(
      `/api/retailer-applications/${cleanId}/approve`,
      {
        body: { notes: notes?.trim() || null },
        requireAuth: true,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success || !response.application) {
      throw new ApiError(
        response?.message || `Failed to approve retailer application "${id}".`,
        500,
        response,
        `/api/retailer-applications/${cleanId}/approve`
      );
    }

    return response.application;
  },

  /**
   * Rejects a retailer application with a mandatory reason
   */
  async rejectApplication(id: string, reason: string, notes?: string): Promise<RetailerApplication> {
    const cleanId = encodeURIComponent(id.trim());
    const response = await apiClient.post<RetailerApplicationDetailApiResponse>(
      `/api/retailer-applications/${cleanId}/reject`,
      {
        body: {
          reason: reason.trim(),
          notes: notes?.trim() || null,
        },
        requireAuth: true,
        timeoutMs: 15000,
      }
    );

    if (!response || !response.success || !response.application) {
      throw new ApiError(
        response?.message || `Failed to reject retailer application "${id}".`,
        500,
        response,
        `/api/retailer-applications/${cleanId}/reject`
      );
    }

    return response.application;
  },
};
