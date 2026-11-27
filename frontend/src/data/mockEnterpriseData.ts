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
  CrmPurchaseOrder,
} from '@/types/enterprise-crm';

// Clean initial live state datasets (All live data is entered and managed by users in real-time)
export const mockTasks: CrmTask[] = [];

export const mockLeads: CrmLead[] = [];

export const mockCustomers: CrmCustomer[] = [];

export const mockSalesOpportunities: CrmSalesOpportunity[] = [];

export const mockQuotations: CrmQuotation[] = [];

export const mockSalesOrders: CrmSalesOrder[] = [];

export const mockProformaInvoices: CrmProformaInvoice[] = [
  {
    id: 'pi_1',
    slNo: 1,
    piNumber: 'CTPI#1001',
    issueDate: '2026-10-07',
    owner: 'shaheer',
    ownerAvatar: '',
    customer: 'RASHAD',
    opportunityTitle: 'EQ 2 Supply of AC and Water Cooler',
    quotationRef: 'CTSQ#4343',
    amount: 9448.00,
    vatAmount: 472.25,
    totalAmount: 9918.25,
    status: 'Pending',
  },
];

export const mockInvoices: CrmInvoice[] = [];

export const mockReceipts: CrmReceipt[] = [];

export const mockDeliveryNotes: CrmDeliveryNote[] = [];

export const mockPurchaseStocks: CrmPurchaseStock[] = [];

export const mockCampaigns: CrmCampaign[] = [];

export const mockCezconStocks: CrmCezconStock[] = [];

export const mockCezconStockItems: CrmCezconStock[] = [
  {
    id: 'PROD-CARRIER-40-DUCT',
    slNo: 1,
    code: 'CARR-40-DUCT',
    name: 'Carrier 4.0 Ton Ducted Split AC',
    unit: 'Pcs',
    brand: 'Carrier',
    category: 'Air Conditioning',
    type: 'Product',
    purchaseRate: 4200,
    sellingPrice: 5500,
    openingStock: 3,
    stock: 5,
    currentStock: 5,
    minimumStock: 2,
    store: 'CT',
    status: 'Active',
    supplier: 'Al Futtaim Engineering & Technologies LLC',
    preferredSupplier: 'Al Futtaim Engineering & Technologies LLC',
    supplierId: 'sup_al_futtaim_001',
    owner: 'Stock Management',
  },
];

export const mockStockTransfers: CrmStockTransfer[] = [];

// Baseline active Purchase Orders for cross-session testing and governance sign-off
export const baselinePurchaseOrders: any[] = [
  {
    id: 'po_1794462645581',
    slNo: 19,
    poNumber: 'CTPO#2519',
    date: '2026-11-12',
    supplier: 'Mueller Middle East FZE',
    amount: 19500,
    vat: 975,
    totalAmount: 20475,
    total_amount: 20475,
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
    paymentStatus: 'Due',
    owner: 'Murshid',
    preparedBy: 'Murshid',
    requiredApprovalTier: 'FINANCE_CONTROLLER',
    items: [
      {
        id: 'item_1',
        item: 'Mitsubishi 5.0 Ton Heavy Package AC',
        description: 'Mitsubishi 5.0 Ton Heavy Package AC',
        code: 'MITS-50-PKG',
        brand: 'COOLTECH',
        unit: 'Pcs',
        qty: 3,
        deliveryPending: 3,
        rate: 6500,
        amount: 6500,
        total: 19500,
      },
    ],
  },
  {
    id: 'po_1794462645582',
    slNo: 17,
    poNumber: 'CTPO#2547',
    date: '11-11-2026',
    supplier: 'Danfoss Gulf FZE',
    reference: 'CTPO#2545',
    amount: 6500,
    vat: 325,
    totalAmount: 6825,
    total_amount: 6825,
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
    paymentStatus: 'Due',
    owner: 'Murshid',
    preparedBy: 'Murshid',
    requiredApprovalTier: 'FINANCE_CONTROLLER',
    items: [
      {
        id: 'item_1',
        item: 'Danfoss Expansion Valves',
        description: 'Danfoss Expansion Valves',
        code: 'DANF-VALVE-01',
        brand: 'Danfoss',
        unit: 'Pcs',
        qty: 1,
        deliveryPending: 1,
        rate: 6500,
        amount: 6500,
        total: 6500,
      },
    ],
  },
  {
    id: 'po_1794462645583',
    slNo: 16,
    poNumber: 'CTPO#2516',
    date: '2026-11-11',
    supplier: 'Mueller Middle East FZE',
    amount: 19500,
    vat: 975,
    totalAmount: 20475,
    total_amount: 20475,
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
    paymentStatus: 'Due',
    owner: 'Murshid',
    preparedBy: 'Murshid',
    requiredApprovalTier: 'FINANCE_CONTROLLER',
    items: [
      {
        id: 'item_1',
        item: 'Mueller Copper Pipes',
        description: 'Mueller Copper Pipes',
        code: 'MUEL-COP-01',
        brand: 'Mueller',
        unit: 'Pcs',
        qty: 3,
        deliveryPending: 3,
        rate: 6500,
        amount: 6500,
        total: 19500,
      },
    ],
  },
];
export const mockPurchaseOrders = baselinePurchaseOrders;

// Persistent Approval Registry Helper: Ensures approved statuses survive page refreshes and fallbacks
export const applyApprovalRegistry = (orders: any[]): any[] => {
  if (typeof window === 'undefined' || !Array.isArray(orders)) return orders;
  try {
    const rawRegistry = localStorage.getItem('crm_po_approvals_registry');
    const registry = rawRegistry ? JSON.parse(rawRegistry) : {};
    return orders.map((o) => {
      const key = o.poNumber || o.id;
      if (key && registry[key]) {
        return { ...o, ...registry[key] };
      }
      // If an order claims to be Approved but has no actual approver signature,
      // heal it to 'Waiting for Final Approval' so the Finance Controller can review and sign off!
      if (o.approval === 'Approved' && !o.approvedByName && !o.approved_by_name) {
        const amt = Number(o.totalAmount || o.total_amount || o.amount || 0);
        return {
          ...o,
          approval: 'Waiting for Final Approval',
          requiredApprovalTier: amt >= 100000 ? 'CHIEF_OPERATING_OFFICER' : 'FINANCE_CONTROLLER',
        };
      }
      return o;
    });
  } catch {
    return orders;
  }
};

// System User Directory (Dynamically populated from Cloudflare D1 via userApiService / EnterpriseCrmContext)
export const mockUsers: CrmUser[] = [];

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

  if (clean === 'shemin' || clean.includes('shemin')) return '/avatars/shemin.jpg';
  if (clean === 'tariq' || clean.includes('tariq')) return '/avatars/tariq.jpg';

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
