/**
 * Mock Admin Management Service
 * Provides reactive persistence in localStorage with standard async signatures
 * designed for seamless 1:1 replacement with real backend APIs in Phase 2/3:
 * - POST /api/auth/login
 * - POST /api/admins
 * - GET /api/admins
 * - GET /api/admins/:id
 * - PUT /api/admins/:id
 * - PATCH /api/admins/:id/status
 * - DELETE /api/admins/:id
 */

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee' | 'worker';
export type AdminStatus = 'Active' | 'Inactive';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  phone: string;
  role: 'Admin';
  organizationId: string;
  organizationName: string;
  status: AdminStatus;
  avatar?: string;
  designation: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminListResponse {
  admins: AdminAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Initial Seed Admins
const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'adm_shemin_001',
    name: 'Muhammed shemin',
    email: 'shemin@gmail.com',
    username: 'shemin',
    password: 'password@123',
    phone: '+971 50 123 4567',
    role: 'Admin',
    organizationId: 'org_cool_tech_001',
    organizationName: 'Cool Technologies LLC',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    designation: 'Managing Director / Business Admin',
    department: 'Executive Operations',
    createdAt: '2026-01-15',
    updatedAt: '2026-10-01',
  },
];

const STORAGE_KEY = 'crm_admin_accounts_list';

function getStoredAdmins(): AdminAccount[] {
  if (typeof window === 'undefined') return INITIAL_ADMINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ADMINS;
  } catch {
    return INITIAL_ADMINS;
  }
}

function syncAdminsToCezcon(admins: AdminAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('cezcon_crm_users_list');
    const usersList: any[] = raw ? JSON.parse(raw) : [];

    admins.forEach((admin) => {
      const existingIdx = usersList.findIndex(
        (u) => (u.email && u.email.toLowerCase() === admin.email.toLowerCase()) || u.id === admin.id
      );
      const userObj = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        username: admin.username.includes('@') ? admin.username : `${admin.username}@cooltechuae.com`,
        profileType: 'Admin',
        designation: admin.designation || 'Admin',
        department: admin.department || 'Administration',
        phone: admin.phone || '+971 55 485 3829',
        status: admin.status,
        isAdmin: true,
        role: 'Admin',
        loginPermission: 'Web & Mobile',
        avatarImage: admin.avatar,
      };
      if (existingIdx >= 0) {
        usersList[existingIdx] = { ...usersList[existingIdx], ...userObj };
      } else {
        usersList.unshift(userObj);
      }
    });

    localStorage.setItem('cezcon_crm_users_list', JSON.stringify(usersList));
  } catch (err) {
    console.error('Failed to sync admins to cezcon users:', err);
  }
}

function saveStoredAdmins(admins: AdminAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
    syncAdminsToCezcon(admins);
    window.dispatchEvent(new Event('crm_admins_updated'));
    window.dispatchEvent(new Event('crm_users_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save admins to localStorage:', err);
  }
}

export const adminMockService = {
  /**
   * GET /api/admins
   * Retrieves paginated, filtered, and searched Admins list
   */
  async getAdmins(params: AdminListParams = {}): Promise<AdminListResponse> {
    await new Promise((res) => setTimeout(res, 200));
    const all = getStoredAdmins();
    const search = (params.search || '').trim().toLowerCase();
    const status = params.status || 'All';
    const page = params.page || 1;
    const limit = params.limit || 10;

    const filtered = all.filter((admin) => {
      const matchesSearch =
        !search ||
        admin.name.toLowerCase().includes(search) ||
        admin.email.toLowerCase().includes(search) ||
        admin.username.toLowerCase().includes(search) ||
        admin.phone.toLowerCase().includes(search);

      const matchesStatus = status === 'All' || admin.status === status;

      return matchesSearch && matchesStatus;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      admins: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  },

  /**
   * GET /api/admins/:id
   */
  async getAdminById(id: string): Promise<AdminAccount | null> {
    await new Promise((res) => setTimeout(res, 150));
    const all = getStoredAdmins();
    return all.find((a) => a.id === id) || null;
  },

  /**
   * POST /api/admins
   * Creates a new Admin user with validation
   */
  async createAdmin(
    data: Omit<AdminAccount, 'id' | 'createdAt' | 'updatedAt' | 'role'>
  ): Promise<{ success: boolean; admin?: AdminAccount; error?: string }> {
    await new Promise((res) => setTimeout(res, 350));
    const all = getStoredAdmins();

    // Check duplicate email or username
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim().toLowerCase();

    const emailExists = all.some((a) => a.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      return { success: false, error: 'An admin with this email address already exists.' };
    }

    const usernameExists = all.some((a) => a.username.toLowerCase() === normalizedUsername);
    if (usernameExists) {
      return { success: false, error: 'An admin with this username already exists.' };
    }

    const now = new Date().toISOString().split('T')[0];
    const newAdmin: AdminAccount = {
      ...data,
      id: `adm_${Date.now()}`,
      role: 'Admin',
      email: normalizedEmail,
      username: normalizedUsername,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newAdmin, ...all];
    saveStoredAdmins(updatedList);

    return { success: true, admin: newAdmin };
  },

  /**
   * PUT /api/admins/:id
   * Updates an existing Admin account
   */
  async updateAdmin(
    id: string,
    updates: Partial<Omit<AdminAccount, 'id' | 'role' | 'createdAt'>>
  ): Promise<{ success: boolean; admin?: AdminAccount; error?: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const all = getStoredAdmins();
    const index = all.findIndex((a) => a.id === id);

    if (index === -1) {
      return { success: false, error: 'Admin record not found.' };
    }

    const updatedRecord: AdminAccount = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    all[index] = updatedRecord;
    saveStoredAdmins(all);

    return { success: true, admin: updatedRecord };
  },

  /**
   * PATCH /api/admins/:id/status
   * Toggles an Admin between Active and Inactive
   */
  async toggleAdminStatus(id: string): Promise<{ success: boolean; newStatus?: AdminStatus; error?: string }> {
    await new Promise((res) => setTimeout(res, 200));
    const all = getStoredAdmins();
    const target = all.find((a) => a.id === id);

    if (!target) {
      return { success: false, error: 'Admin record not found.' };
    }

    const newStatus: AdminStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    target.status = newStatus;
    target.updatedAt = new Date().toISOString().split('T')[0];
    saveStoredAdmins(all);

    return { success: true, newStatus };
  },

  /**
   * DELETE /api/admins/:id
   */
  async deleteAdmin(id: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((res) => setTimeout(res, 250));
    const all = getStoredAdmins();
    const filtered = all.filter((a) => a.id !== id);

    if (filtered.length === all.length) {
      return { success: false, error: 'Admin record not found.' };
    }

    saveStoredAdmins(filtered);
    return { success: true };
  },

  /**
   * POST /api/auth/login
   * Authenticates using Email OR Username + Password
   */
  async login(
    identifier: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; admin?: AdminAccount; role?: string; redirectUrl?: string; error?: string }> {
    await new Promise((res) => setTimeout(res, 450));

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check Super Admin static fallback
    if (
      (cleanIdentifier === 'superadmin@gmail.com' || cleanIdentifier === 'superadmin') &&
      cleanPassword === 'super@123'
    ) {
      const superAdminUser = {
        id: 'usr_superadmin',
        name: 'System Super Admin',
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        phone: '+971 50 123 4567',
        role: 'Admin' as const,
        organizationId: 'org_platform_root',
        organizationName: 'Global Platform',
        status: 'Active' as const,
        designation: 'Super Administrator',
        department: 'Platform Engineering',
        createdAt: '2026-01-01',
        updatedAt: '2026-09-25',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'cool_crm_auth',
          JSON.stringify({ authenticated: true, user: superAdminUser, role: 'super_admin', timestamp: Date.now() })
        );
      }
      return {
        success: true,
        admin: superAdminUser,
        role: 'super_admin',
        redirectUrl: '/dashboard',
      };
    }

    // Lookup in Dynamic Admin Accounts List
    const allAdmins = getStoredAdmins();
    const match = allAdmins.find(
      (a) =>
        (a.email.toLowerCase() === cleanIdentifier || a.username.toLowerCase() === cleanIdentifier) &&
        a.password === cleanPassword
    );

    if (!match) {
      return {
        success: false,
        error: 'Invalid email/username or password. Please verify your credentials.',
      };
    }

    if (match.status === 'Inactive') {
      return {
        success: false,
        error: 'Your Admin account is currently inactive. Please contact the Super Administrator.',
      };
    }

    // Set active auth session
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'cool_crm_auth',
          JSON.stringify({
            authenticated: true,
            user: match,
            role: 'admin',
            rememberMe,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.error('Storage error:', e);
      }
    }

    return {
      success: true,
      admin: match,
      role: 'admin',
      redirectUrl: '/admin/dashboard',
    };
  },
};
