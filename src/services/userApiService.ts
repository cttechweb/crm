/**
 * Authenticated User Management Service for Cool Technologies CRM
 * 
 * Interacts directly with cool-tech-crm-api Cloudflare Worker (/api/users)
 * to persist and manage staff profiles in Cloudflare D1 (users table).
 * 
 * - Full CRUD: GET /, GET /:id, POST /, PUT /:id, PATCH /:id/status, DELETE /:id
 * - Automatically attaches Firebase ID Token via apiClient (requireAuth: true)
 * - Strict type definitions aligned with Cloudflare D1 users schema
 * - Explicit error classification (401, 403, 409 Conflict, validation, network)
 */

import { apiClient, ApiError } from '@/lib/apiClient';

export type CrmRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface CrmBackendUser {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  role: CrmRole;
  position?: string;
  department?: string;
  team_id?: string;
  reports_to?: string;
  is_active: number | boolean;
  phone?: string;
  username?: string;
  avatar_image?: string;
  dob?: string;
  designation?: string;
  business_opportunity?: string;
  store?: string;
  sales_visit_permission?: number | boolean;
  permissions?: string | Record<string, unknown>;
  resolvedPermissions?: {
    modulePermissions: Record<string, boolean>;
    actionPermissions: Record<string, boolean>;
  };
  created_at?: string;
  updated_at?: string;
}

export interface UserQueryParams {
  q?: string;
  role?: string;
  department?: string;
  status?: 'active' | 'inactive' | string;
  scope?: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  success: boolean;
  users: CrmBackendUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  id?: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  role: CrmRole;
  position?: string;
  department?: string;
  team_id?: string;
  reports_to?: string | null;
  is_active?: number | boolean;
  phone?: string;
  username?: string;
  avatar_image?: string;
  dob?: string;
  designation?: string;
  business_opportunity?: string;
  store?: string;
  sales_visit_permission?: number | boolean;
  permissions?: string | Record<string, unknown>;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  firebase_uid?: string;
  role?: CrmRole;
  position?: string | null;
  department?: string | null;
  team_id?: string | null;
  reports_to?: string | null;
  is_active?: number | boolean;
  phone?: string | null;
  username?: string | null;
  avatar_image?: string | null;
  dob?: string | null;
  designation?: string | null;
  business_opportunity?: string | null;
  store?: string | null;
  sales_visit_permission?: number | boolean;
  permissions?: string | Record<string, unknown>;
}

export const userApiService = {
  /**
   * Retrieves paginated staff members from Cloudflare D1
   */
  async getUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
    return await apiClient.get<UserListResponse>('/api/users', {
      params: {
        q: params.q,
        role: params.role,
        department: params.department,
        status: params.status,
        scope: params.scope,
        page: params.page,
        limit: params.limit,
      },
      requireAuth: true,
      timeoutMs: 15000,
    });
  },

  /**
   * Retrieves a single staff member by ID
   */
  async getUserById(id: string): Promise<CrmBackendUser> {
    const res = await apiClient.get<{ success: boolean; user: CrmBackendUser }>(`/api/users/${encodeURIComponent(id)}`, {
      requireAuth: true,
      timeoutMs: 10000,
    });
    return res.user;
  },

  /**
   * Persists a newly created staff profile directly into Cloudflare D1
   */
  async createUser(payload: CreateUserPayload): Promise<CrmBackendUser> {
    const res = await apiClient.post<{ success: boolean; user: CrmBackendUser }>('/api/users', payload, {
      requireAuth: true,
      timeoutMs: 15000,
    });
    return res.user;
  },

  /**
   * Updates an existing staff profile in Cloudflare D1
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<CrmBackendUser> {
    const res = await apiClient.put<{ success: boolean; user: CrmBackendUser }>(`/api/users/${encodeURIComponent(id)}`, payload, {
      requireAuth: true,
      timeoutMs: 15000,
    });
    return res.user;
  },

  /**
   * Activates or deactivates a staff member in Cloudflare D1
   */
  async updateUserStatus(id: string, isActive: boolean | number): Promise<{ success: boolean; is_active: number }> {
    return await apiClient.patch<{ success: boolean; is_active: number }>(`/api/users/${encodeURIComponent(id)}/status`, {
      is_active: isActive ? 1 : 0,
    }, {
      requireAuth: true,
      timeoutMs: 10000,
    });
  },

  /**
   * Permanently deletes a staff profile from Cloudflare D1
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string; id: string }> {
    return await apiClient.delete<{ success: boolean; message: string; id: string }>(
      `/api/users/${encodeURIComponent(id)}`,
      {
        requireAuth: true,
        timeoutMs: 10000,
      }
    );
  },
};
export { ApiError };
