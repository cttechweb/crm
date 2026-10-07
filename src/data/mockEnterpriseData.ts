import {
  CrmTask,
  CrmLead,
  CrmCustomer,
  CrmSalesOpportunity,
  CrmPurchaseStock,
  CrmCampaign,
  CrmUser,
  PermissionRule,
  CrmQuotation,
  CrmSalesOrder,
  CrmProformaInvoice,
  CrmInvoice,
  CrmReceipt,
  CrmDeliveryNote,
  CrmCezconStock,
  CrmStockTransfer,
} from '@/types/enterprise-crm';

// Clean initial live state datasets (All live data is entered and managed by users in real-time)
export const mockTasks: CrmTask[] = [];

export const mockLeads: CrmLead[] = [];

export const mockCustomers: CrmCustomer[] = [];

export const mockSalesOpportunities: CrmSalesOpportunity[] = [];

export const mockQuotations: CrmQuotation[] = [];

export const mockSalesOrders: CrmSalesOrder[] = [];

export const mockProformaInvoices: CrmProformaInvoice[] = [];

export const mockInvoices: CrmInvoice[] = [];

export const mockReceipts: CrmReceipt[] = [];

export const mockDeliveryNotes: CrmDeliveryNote[] = [];

export const mockPurchaseStocks: CrmPurchaseStock[] = [];

export const mockCampaigns: CrmCampaign[] = [];

export const mockCezconStocks: CrmCezconStock[] = [];

export const mockCezconStockItems: CrmCezconStock[] = [];

export const mockStockTransfers: CrmStockTransfer[] = [];

// System User Directory (Active real user profiles for assignment and role checks)
export const mockUsers: CrmUser[] = [
  {
    id: 'usr_superadmin_001',
    name: 'System Super Admin',
    email: 'superadmin@gmail.com',
    role: 'Super Admin',
    phone: '+971 50 111 2233',
    department: 'Executive Leadership',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr_shemin_001',
    name: 'Muhammed Shemin',
    email: 'shemin@gmail.com',
    role: 'Admin',
    phone: '+971 50 123 4567',
    department: 'Executive Operations',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr_shibil_001',
    name: 'Muhammed Shibil',
    email: 'shibil@gmail.com',
    role: 'Manager',
    phone: '+971 50 987 6543',
    department: 'Sales',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr_afsal_001',
    name: 'Afsal',
    email: 'afsal@gmail.com',
    role: 'Manager',
    phone: '+971 55 123 9988',
    department: 'Marketing',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'emp_shaheer_001',
    name: 'Shaheer',
    email: 'shaheer@gmail.com',
    role: 'Employee',
    phone: '+971 50 776 5432',
    department: 'Sales',
    status: 'Active',
    lastLogin: 'Recent',
  },
  {
    id: 'emp_adhil_001',
    name: 'Muhammed Adhil',
    email: 'adhil@gmail.com',
    role: 'Employee',
    phone: '+971 56 881 1334',
    department: 'Sales',
    status: 'Active',
    lastLogin: 'Recent',
  },
  {
    id: 'emp_shameem_001',
    name: 'Shameem',
    email: 'shameem@gmail.com',
    role: 'Employee',
    phone: '+971 52 443 8901',
    department: 'Marketing',
    status: 'Active',
    lastLogin: 'Recent',
  },
  {
    id: 'emp_arun_001',
    name: 'Arun',
    email: 'arun@gmail.com',
    role: 'Employee',
    phone: '+971 54 321 0987',
    department: 'Marketing',
    status: 'Active',
    lastLogin: 'Recent',
  },
];

// RBAC Permission Schema
export const mockRbacRules: PermissionRule[] = [
  { module: 'Dashboard & Analytics', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Tasks & Operations', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Marketing & Campaigns', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Leads Management', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Customers & Accounts', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Sales & Quotations', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Purchase & Inventory', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'Reports & Exporting', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
  { module: 'System & Security Settings', view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true },
];

export function getEmployeePhoto(name?: string): string {
  if (!name || typeof window === 'undefined') return '';
  const clean = name.toLowerCase().trim();

  try {
    // Check cool_crm_auth
    const authRaw = localStorage.getItem('cool_crm_auth');
    if (authRaw) {
      const authUser = JSON.parse(authRaw);
      if (
        authUser &&
        (authUser.name?.trim().toLowerCase() === clean || authUser.username?.trim().toLowerCase() === clean)
      ) {
        const av = authUser.avatar || authUser.avatarImage || authUser.avatarUrl;
        if (av && !av.includes('unsplash.com') && !av.includes('photo-')) {
          return av;
        }
      }
    }

    // Check cezcon_crm_users_list
    const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
    if (storedUsersRaw) {
      const parsed = JSON.parse(storedUsersRaw);
      if (Array.isArray(parsed)) {
        const found = parsed.find(
          (u: any) =>
            (u.name && u.name.trim().toLowerCase() === clean) ||
            (u.username && u.username.trim().toLowerCase() === clean) ||
            (u.email && u.email.trim().toLowerCase() === clean)
        );
        if (found) {
          const av = found.avatarImage || found.avatarUrl || found.avatar;
          if (av && !av.includes('unsplash.com') && !av.includes('photo-')) {
            return av;
          }
        }
      }
    }

    // Check crm_admin_accounts_list
    const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
    if (storedAdminsRaw) {
      const parsedAdmins = JSON.parse(storedAdminsRaw);
      if (Array.isArray(parsedAdmins)) {
        const foundAdmin = parsedAdmins.find(
          (a: any) =>
            (a.name && a.name.trim().toLowerCase() === clean) ||
            (a.email && a.email.trim().toLowerCase() === clean)
        );
        if (foundAdmin) {
          const av = foundAdmin.avatar || foundAdmin.avatarUrl || foundAdmin.avatarImage;
          if (av && !av.includes('unsplash.com') && !av.includes('photo-')) {
            return av;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return '';
}
