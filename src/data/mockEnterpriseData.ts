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

// Empty datasets for clean manual data entry across all CRM modules
export const mockTasks: CrmTask[] = [];

export const mockLeads: CrmLead[] = [
  {
    id: 'LD-2026-001',
    slNo: 1,
    leadDate: '2026-09-28',
    assignedDate: '2026-09-28',
    leadAssigned: {
      name: 'Manager',
    },
    contactDetails: {
      name: 'Eng. Tariq Mansoor',
      company: 'Al Futtaim Engineering LLC',
      phone: '+971 50 889 1234',
      email: 'tariq.mansoor@alfuttaim.ae',
      whatsapp: '+971 50 889 1234',
    },
    leadSpecification: 'Central Chiller Overhaul & 3-Year Commercial AMC Contract',
    owner: 'Manager',
    createdBy: 'Manager',
    assignedEmployee: 'Manager',
    rating: 'Hot',
    status: 'Converted',
    lastActivity: 'Lead converted to Customer & Deal',
    source: 'Direct Website Inquiry',
    campaign: 'Commercial HVAC 2026',
    businessOpportunity: 'HVAC Installation & AMC',
    value: 85000,
    tags: ['VIP Client', 'Commercial', 'Converted'],
    comments: 'Lead successfully converted to Active Customer and Sales Opportunity by Manager.',
  },
];

export const mockCustomers: CrmCustomer[] = [
  {
    id: 'CUST-001',
    slNo: 1,
    customerName: 'VILLA PARK AND LANDSCAPE - SOLE PROPRIETORSHIP LLC',
    contactPerson: 'Mr. Bishoy',
    salutation: 'Mr.',
    phone: '+971568811334',
    email: 'info@villapark.ae',
    owner: 'Muhammed Adhil',
    status: 'Active',
    type: 'Customer',
    date: '30-09-2026',
    lastEnquiry: 'Today',
    openEnquiries: 1,
    lastOrder: 'No order till the date.',
    outstanding: 0.0,
    companyGroup: 'Landscape & Contracting',
    industryType: 'Landscape & Horticulture',
    totalDeals: 1,
    totalSpend: 50000,
    lastActivity: 'Active AMC Contract',
    city: 'Dubai',
  },
  {
    id: 'CUST-002',
    slNo: 2,
    customerName: 'TROJAN GENERAL CONTRACTING',
    contactPerson: 'Mr. Bishoy',
    salutation: 'Mr.',
    phone: '+971568811334',
    email: 'procurement@trojan.ae',
    owner: 'shameem',
    status: 'Active',
    type: 'Customer',
    date: '29-09-2026',
    lastEnquiry: '1 day(s) ago',
    openEnquiries: 1,
    lastOrder: 'No order till the date.',
    outstanding: 0.0,
    companyGroup: 'General Contracting',
    industryType: 'Construction & Civil',
    totalDeals: 2,
    totalSpend: 120000,
    lastActivity: 'Quotation sent',
    city: 'Abu Dhabi',
  },
  {
    id: 'CUST-003',
    slNo: 3,
    customerName: 'CITICORE INTERIOR DESIGN - SOLE PROPRIETORSHIP L.L.C',
    contactPerson: 'Mr. Zack Zhang',
    salutation: 'Mr.',
    phone: '+97156 523 5270',
    email: 'zack@citicore.ae',
    owner: 'Muhammed Adhil',
    status: 'Active',
    type: 'Customer',
    date: '29-09-2026',
    lastEnquiry: '1 day(s) ago',
    openEnquiries: 1,
    lastOrder: 'No order till the date.',
    outstanding: 0.0,
    companyGroup: 'Interior Fitout',
    industryType: 'Fitout & Interior Design',
    totalDeals: 1,
    totalSpend: 85000,
    lastActivity: 'Enquiry received',
    city: 'Dubai',
  },
  {
    id: 'CUST-004',
    slNo: 4,
    customerName: 'Chemfusion Chemical Compound Industry-LLC SPC.',
    contactPerson: 'Mr. MOHAMMED',
    salutation: 'Mr.',
    phone: '+97150 987 6543',
    email: 'mohammed@chemfusion.ae',
    owner: 'JISMON JOSE',
    status: 'Active',
    type: 'Customer',
    date: '29-09-2026',
    lastEnquiry: '1 day(s) ago',
    openEnquiries: 1,
    lastOrder: 'No order till the date.',
    outstanding: 0.0,
    companyGroup: 'Industrial Chemical',
    industryType: 'Chemical & Manufacturing',
    totalDeals: 1,
    totalSpend: 45000,
    lastActivity: 'Site visit scheduled',
    city: 'Sharjah',
  },
];

export const mockSalesOpportunities: CrmSalesOpportunity[] = [
  {
    id: 'OPP-001',
    title: 'Al Futtaim Central Chiller Overhaul & 3-Year AMC Contract',
    customer: 'Al Futtaim Engineering LLC',
    amount: 85000,
    stage: 'Quotation',
    owner: 'Manager',
    expectedClose: '2026-10-15',
    probability: 90,
    source: 'Direct Website Inquiry',
    createdFromLeadId: 'LD-2026-001',
    createdAt: '2026-09-28',
  },
];

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
    lastLogin: 'Just now',
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
