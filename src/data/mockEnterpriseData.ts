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

// System User Directory (Active user profiles for assignment and role checks)
export const mockUsers: CrmUser[] = [
  {
    id: 'usr-1',
    name: 'Super Admin',
    email: 'superadmin@gmail.com',
    role: 'Super Admin',
    phone: '+971 50 111 2233',
    department: 'Executive Leadership',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr-2',
    name: 'Cool Admin',
    email: 'admin@gmail.com',
    role: 'Admin',
    phone: '+971 55 485 3829',
    department: 'Administration',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr-3',
    name: 'Sarah Jenkins',
    email: 'manager@cooltech.com',
    role: 'Manager',
    phone: '+971 55 345 6789',
    department: 'Commercial Sales',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr-4',
    name: 'Jordan Hayes',
    email: 'worker@cooltech.com',
    role: 'Worker',
    phone: '+971 55 901 2345',
    department: 'Field Operations',
    status: 'Active',
    lastLogin: 'Active now',
  },
  {
    id: 'usr-5',
    name: 'Muhammed Adhil',
    email: 'adhil@cooltech.com',
    role: 'Employee',
    phone: '+971 56 881 1334',
    department: 'Commercial Sales',
    status: 'Active',
    lastLogin: 'Recent',
  },
  {
    id: 'usr-6',
    name: 'shameem',
    email: 'shameem@cooltech.com',
    role: 'Employee',
    phone: '+971 52 443 8901',
    department: 'Projects & Estimation',
    status: 'Active',
    lastLogin: 'Recent',
  },
  {
    id: 'usr-7',
    name: 'JISMON JOSE',
    email: 'jismon@cooltech.com',
    role: 'Employee',
    phone: '+971 50 987 6543',
    department: 'Industrial Services',
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
