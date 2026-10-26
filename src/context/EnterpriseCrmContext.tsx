'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  CrmTask,
  CrmLead,
  CrmCustomer,
  CrmSalesOpportunity,
  CrmPurchaseStock,
  CrmCampaign,
  CrmUser,
  PermissionRule,
  UserRole,
  DealStage,
  CrmQuotation,
  CrmSalesOrder,
  CrmInvoice,
  CrmProformaInvoice,
  CrmReceipt,
  CrmDeliveryNote,
  CrmSupplier,
  CrmPurchaseOrder,
  CrmStockTransfer,
  TaskStatus,
  TaskPriority,
  TaskType,
  LeadStatus,
  LeadRating,
} from '@/types/enterprise-crm';
import {
  mockTasks,
  mockLeads,
  mockCustomers,
  mockSalesOpportunities,
  mockPurchaseStocks,
  mockCampaigns,
  mockUsers,
  mockRbacRules,
  mockQuotations,
  mockSalesOrders,
  mockInvoices,
  mockProformaInvoices,
  mockReceipts,
  mockDeliveryNotes,
  getEmployeePhoto,
} from '@/data/mockEnterpriseData';
import { authMockService } from '@/services/authMockService';
import { customerApiService } from '@/services/customerApiService';
import { leadApiService } from '@/services/leadApiService';
import {
  opportunityApiService,
  quotationApiService,
  salesOrderApiService,
  invoiceApiService,
} from '@/services/salesApiService';
import { taskApiService } from '@/services/taskApiService';
import {
  proformaApiService,
  receiptApiService,
  deliveryNoteApiService,
} from '@/services/salesAuxiliaryApiService';
import {
  supplierApiService,
  crmInventoryApiService,
  purchaseOrderApiService,
  stockTransferApiService,
} from '@/services/procurementApiService';
import { userApiService, CrmBackendUser } from '@/services/userApiService';

interface EnterpriseCrmContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  tasks: CrmTask[];
  leads: CrmLead[];
  customers: CrmCustomer[];
  salesOpportunities: CrmSalesOpportunity[];
  quotations: CrmQuotation[];
  salesOrders: CrmSalesOrder[];
  invoices: CrmInvoice[];
  proformas: CrmProformaInvoice[];
  receipts: CrmReceipt[];
  deliveryNotes: CrmDeliveryNote[];
  purchaseStocks: CrmPurchaseStock[];
  suppliers: CrmSupplier[];
  purchaseOrders: CrmPurchaseOrder[];
  stockTransfers: CrmStockTransfer[];
  campaigns: CrmCampaign[];
  users: CrmUser[];
  rbacRules: PermissionRule[];

  // Global Search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;

  // Task Actions
  addTask: (task: Omit<CrmTask, 'id' | 'slNo'>) => void;
  createTask: (task: Partial<CrmTask> & { taskDetails: string }) => CrmTask;
  assignTask: (taskId: string, employeeName: string, managerName?: string) => void;
  acceptTask: (taskId: string, employeeName?: string) => void;
  startTask: (taskId: string, employeeName?: string) => void;
  updateTaskProgress: (taskId: string, progress: number, employeeName?: string, note?: string) => void;
  completeTask: (taskId: string, employeeName?: string, notes?: string) => void;
  reviewTask: (taskId: string, managerName?: string, notes?: string) => void;
  addCommentToTask: (taskId: string, text: string, author?: string, role?: string) => void;
  updateTaskStatusWorkflow: (taskId: string, status: TaskStatus, actor?: string, role?: string, note?: string) => void;
  updateTask: (id: string, updated: Partial<CrmTask>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Lead Actions
  addLead: (lead: Omit<CrmLead, 'id' | 'slNo'>) => Promise<CrmLead>;
  assignLead: (leadId: string, employeeName: string, managerName?: string, ownerId?: string) => Promise<void> | void;
  updateLead: (id: string, updated: Partial<CrmLead>) => Promise<CrmLead | void> | void;
  updateLeadStatus?: (
    id: string,
    data: {
      status?: LeadStatus;
      rating?: LeadRating;
      comments?: string;
      addNote?: boolean;
    }
  ) => Promise<CrmLead | void> | void;
  deleteLead: (id: string) => Promise<void> | void;
  isLeadsLoading?: boolean;
  leadsError?: string | null;
  refreshLeads?: () => Promise<void>;

  // Customer Actions
  addCustomer: (cust: Omit<CrmCustomer, 'id' | 'slNo'>) => Promise<CrmCustomer | void> | void;
  assignCustomer: (customerId: string, employeeName: string, managerName?: string) => Promise<void> | void;
  updateCustomer: (id: string, updated: Partial<CrmCustomer>) => Promise<CrmCustomer | void> | void;
  deleteCustomer: (id: string) => Promise<void> | void;
  isCustomersLoading?: boolean;
  customersError?: string | null;
  refreshCustomers?: () => Promise<void>;

  // Opportunity Actions
  addOpportunity: (opp: Omit<CrmSalesOpportunity, 'id' | 'createdAt'>) => void;
  updateOpportunity: (id: string, updated: Partial<CrmSalesOpportunity>) => void;
  updateOpportunityStage: (id: string, newStage: DealStage) => void;
  deleteOpportunity: (id: string) => void;

  // Quotation Actions
  addQuotation: (quote: Omit<CrmQuotation, 'id'>) => void;
  updateQuotation: (idOrObj: string | CrmQuotation, updated?: Partial<CrmQuotation>) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToSalesOrder: (quotationId: string) => CrmSalesOrder | null;

  // Sales Order Actions
  addSalesOrder: (order: Omit<CrmSalesOrder, 'id'>) => void;
  updateSalesOrder: (id: string, updated: Partial<CrmSalesOrder>) => void;
  deleteSalesOrder: (id: string) => void;

  // Invoice Actions
  addInvoice: (inv: Omit<CrmInvoice, 'id'>) => void;
  updateInvoice: (id: string, updated: Partial<CrmInvoice>) => void;
  deleteInvoice: (id: string) => void;

  // Proforma Invoice Actions
  addProforma: (pi: Omit<CrmProformaInvoice, 'id' | 'slNo'>) => void;
  updateProforma: (id: string, updated: Partial<CrmProformaInvoice>) => void;
  deleteProforma: (id: string) => void;

  // Receipt Actions
  addReceipt: (rec: Omit<CrmReceipt, 'id'>) => void;
  updateReceipt: (id: string, updated: Partial<CrmReceipt>) => void;
  deleteReceipt: (id: string) => void;

  // Delivery Note Actions
  addDeliveryNote: (dn: Omit<CrmDeliveryNote, 'id'>) => void;
  updateDeliveryNote: (id: string, updated: Partial<CrmDeliveryNote>) => void;
  deleteDeliveryNote: (id: string) => void;

  // Stock / Purchase
  addStockItem: (item: Omit<CrmPurchaseStock, 'id' | 'slNo'>) => void;
  updateStockItem: (id: string, updated: Partial<CrmPurchaseStock>) => void;
  deleteStockItem: (id: string) => void;

  // Supplier Actions
  addSupplier: (sup: Omit<CrmSupplier, 'id' | 'slNo'>) => void;
  updateSupplier: (id: string, updated: Partial<CrmSupplier>) => void;
  deleteSupplier: (id: string) => void;

  // Purchase Order Actions
  addPurchaseOrder: (po: Omit<CrmPurchaseOrder, 'id' | 'slNo'>) => void;
  updatePurchaseOrder: (id: string, updated: Partial<CrmPurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;

  // Stock Transfer Actions
  addStockTransfer: (st: Omit<CrmStockTransfer, 'id' | 'slNo'>) => void;
  deleteStockTransfer: (id: string) => void;

  // User Actions
  addUser: (user: Omit<CrmUser, 'id' | 'lastLogin'>) => void;
  deleteUser: (id: string) => void;
  refreshUsers?: () => Promise<void>;

  // Campaign Actions
  addCampaign: (campaign: Omit<CrmCampaign, 'id' | 'slNo'>) => void;
  updateCampaign: (id: string, updated: Partial<CrmCampaign>) => void;
  toggleCampaignListing: (id: string) => void;
  deleteCampaign: (id: string) => void;

  // Clear / Reset All Module Data
  clearAllData: () => void;
}

const EnterpriseCrmContext = createContext<EnterpriseCrmContextType | undefined>(undefined);

export function EnterpriseCrmProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [globalSearch, setGlobalSearch] = useState('');

  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const isFetchingDataRef = useRef(false);
  const [salesOpportunities, setSalesOpportunities] = useState<CrmSalesOpportunity[]>([]);
  const [quotations, setQuotations] = useState<CrmQuotation[]>([]);
  const [salesOrders, setSalesOrders] = useState<CrmSalesOrder[]>([]);
  const [invoices, setInvoices] = useState<CrmInvoice[]>(mockInvoices);
  const [proformas, setProformas] = useState<CrmProformaInvoice[]>([]);
  const [receipts, setReceipts] = useState<CrmReceipt[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<CrmDeliveryNote[]>([]);
  const [purchaseStocks, setPurchaseStocks] = useState<CrmPurchaseStock[]>([]);
  const [suppliers, setSuppliers] = useState<CrmSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<CrmPurchaseOrder[]>([]);
  const [stockTransfers, setStockTransfers] = useState<CrmStockTransfer[]>([]);
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([]);
  const [users, setUsers] = useState<CrmUser[]>([]);
  const isFetchingUsersRef = useRef(false);
  const [rbacRules, setRbacRules] = useState<PermissionRule[]>(mockRbacRules);

  // Clear / Purge all mock data
  const clearAllData = () => {
    try {
      localStorage.removeItem('crm_leads_data');
      localStorage.removeItem('crm_customers_data');
      localStorage.removeItem('crm_opportunities_data');
      localStorage.removeItem('crm_tasks_data');
      localStorage.removeItem('crm_quotations_data');
      localStorage.removeItem('crm_orders_data');
      localStorage.removeItem('crm_invoices_data');
      localStorage.removeItem('crm_proforma_invoices');
      localStorage.removeItem('crm_receipts_data');
      localStorage.removeItem('crm_delivery_notes_data');
      localStorage.removeItem('crm_campaigns_data');
      localStorage.removeItem('crm_stocks_data');
      localStorage.removeItem('crm_suppliers_list');
      localStorage.removeItem('crm_purchase_orders');
      localStorage.removeItem('crm_stock_transfers');
      localStorage.removeItem('cool_worker_tasks');
      localStorage.removeItem('cool_material_requests');
      localStorage.removeItem('cool_timesheet');
      localStorage.removeItem('crm_manager_tasks');
      localStorage.removeItem('crm_manager_opportunities');
      localStorage.removeItem('crm_manager_activities');
      setLeads([]);
      setCustomers([]);
      setSalesOpportunities([]);
      setTasks([]);
      setQuotations([]);
      setSalesOrders([]);
      setInvoices([]);
      setProformas([]);
      setReceipts([]);
      setDeliveryNotes([]);
      setCampaigns([]);
      setPurchaseStocks([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setStockTransfers([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to persist state and dispatch live sync events
  const persist = (key: string, data: any, eventName?: string, dispatchEvents: boolean = true) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      if (key === 'crm_leads_data') {
        localStorage.setItem('cooltech_crm_leads', JSON.stringify(data));
      }
      if (!dispatchEvents) return;

      const derivedEvent =
        eventName ||
        (key === 'crm_tasks_data'
          ? 'crm_tasks_updated'
          : key === 'crm_leads_data'
            ? 'crm_leads_updated'
            : key === 'crm_customers_data'
              ? 'crm_customers_updated'
              : key === 'crm_opportunities_data'
                ? 'crm_opportunities_updated'
                : key === 'crm_quotations_data'
                  ? 'crm_quotations_updated'
                  : key === 'crm_orders_data'
                    ? 'crm_orders_updated'
                    : key === 'crm_invoices_data'
                      ? 'crm_invoices_updated'
                      : key === 'crm_proforma_invoices'
                        ? 'crm_proforma_invoices_updated'
                        : key === 'crm_receipts_data'
                          ? 'crm_receipts_updated'
                          : key === 'crm_delivery_notes_data'
                            ? 'crm_delivery_notes_updated'
                            : key === 'crm_campaigns_data'
                              ? 'crm_campaigns_updated'
                              : key === 'crm_stocks_data'
                                ? 'crm_stocks_updated'
                                : key === 'crm_suppliers_list'
                                  ? 'crm_suppliers_updated'
                                  : key === 'crm_purchase_orders'
                                    ? 'crm_purchase_orders_updated'
                                    : key === 'crm_stock_transfers'
                                      ? 'crm_stock_transfers_updated'
                                      : key === 'cezcon_crm_users_list'
                                        ? 'crm_users_updated'
                                        : undefined);

      if (derivedEvent) {
        window.dispatchEvent(new Event(derivedEvent));
      }
      window.dispatchEvent(new Event('crm_data_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  // Authoritative background fetch of users from Cloudflare D1 (/api/users)
  const fetchAuthoritativeUsers = async () => {
    if (isFetchingUsersRef.current) return;
    isFetchingUsersRef.current = true;
    try {
      const res = await userApiService.getUsers({ limit: 100 });
      if (res && res.success && Array.isArray(res.users)) {
        const deletedIdsRaw = typeof window !== 'undefined' ? localStorage.getItem('cezcon_crm_deleted_user_ids') : null;
        const deletedSet = new Set<string>(deletedIdsRaw ? JSON.parse(deletedIdsRaw) : []);

        // Filter: ONLY current, active employees who are NOT deleted
        const activeServerUsers = res.users.filter((u) => {
          const isActive = u.is_active === 1 || u.is_active === true;
          if (!isActive) return false;
          const uid = String(u.id).toLowerCase();
          const uemail = (u.email || '').toLowerCase();
          if (deletedSet.has(uid) || deletedSet.has(uemail)) return false;
          return true;
        });

        const mappedUsers: CrmUser[] = activeServerUsers.map((u) => {
          const isSuperAdmin = u.role === 'SUPER_ADMIN';
          const isAdmin = u.role === 'ADMIN' || isSuperAdmin;
          const isManager = u.role === 'MANAGER';
          const roleStr: UserRole = isSuperAdmin
            ? 'Super Admin'
            : isAdmin
              ? 'Admin'
              : isManager
                ? 'Manager'
                : 'Employee';

          return {
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: roleStr,
            phone: u.phone || '+971 50 123 4567',
            department: u.department || 'General',
            position: u.position || u.designation || undefined,
            status: 'Active',
            lastLogin: 'Active now',
            avatar: u.avatar_image || '',
          };
        });

        setUsers(mappedUsers);

        // Keep cezcon_crm_users_list strictly synchronized with authoritative active accounts
        if (typeof window !== 'undefined') {
          const cezconItems = activeServerUsers.map((su) => {
            const isSuperAdmin = su.role === 'SUPER_ADMIN';
            const isAdmin = su.role === 'ADMIN' || isSuperAdmin;
            const isManager = su.role === 'MANAGER';
            return {
              id: su.id,
              name: su.full_name,
              email: su.email,
              username: su.username || (su.email.includes('@') ? su.email : `${su.email}@cooltechuae.com`),
              profileType: isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : isManager ? 'Manager' : 'Employee',
              designation: su.designation || su.position || (isManager ? 'Manager' : 'Executive'),
              position: su.position || su.designation,
              department: su.department || 'General',
              phone: su.phone || '',
              status: 'Active' as const,
              isAdmin,
              role: isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : isManager ? 'Manager' : 'Employee',
              loginPermission: 'Web & Mobile',
              avatarImage: su.avatar_image,
              managerId: su.reports_to || undefined,
            };
          });
          localStorage.setItem('cezcon_crm_users_list', JSON.stringify(cezconItems));
        }
      }
    } catch (err) {
      // Retain valid data and report errors without repeatedly displaying alerts. Do not fall back to old mock users.
      console.warn('[EnterpriseCrmContext] Authoritative users fetch failed, retaining existing state:', err);
    } finally {
      isFetchingUsersRef.current = false;
    }
  };

  // Load persisted data on mount & subscribe to live mutations across modules
  useEffect(() => {
    const loadAllData = () => {
      if (isFetchingDataRef.current) return;
      isFetchingDataRef.current = true;
      try {
        const liveUser = authMockService.getCurrentUser();

        // 1. Immediately prime local cached customers so UI never flashes empty
        const storedCustomers = localStorage.getItem('crm_customers_data');
        if (storedCustomers) {
          try {
            const parsed = JSON.parse(storedCustomers);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomers(parsed);
            }
          } catch { }
        }

        // 2. Immediately prime local cached leads
        const storedLeads = localStorage.getItem('cooltech_crm_leads') || localStorage.getItem('crm_leads_data');
        if (storedLeads) {
          try {
            const parsed = JSON.parse(storedLeads);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLeads(parsed);
            }
          } catch { }
        }

        // 3. Background fetch leads without dispatching recursive reload event
        setIsLeadsLoading(true);
        leadApiService
          .getLeads({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.leads)) {
              setLeads(res.leads);
              setLeadsError(null);
              persist('crm_leads_data', res.leads, undefined, false);
            }
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Failed to fetch leads from CRM database';
            console.warn('[EnterpriseCrmContext] Backend lead load failed, using local cache:', msg);
            setLeadsError(msg);
          })
          .finally(() => {
            setIsLeadsLoading(false);
          });

        // 4. Background fetch customers without dispatching recursive reload event
        setIsCustomersLoading(true);
        customerApiService
          .getCustomers({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.customers)) {
              setCustomers(res.customers);
              setCustomersError(null);
              persist('crm_customers_data', res.customers, undefined, false);
            }
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Failed to fetch customers from CRM database';
            console.warn('[EnterpriseCrmContext] Backend customer load failed:', msg);
            setCustomersError(msg);
          })
          .finally(() => {
            setIsCustomersLoading(false);
            isFetchingDataRef.current = false;
          });

        const storedOpps = localStorage.getItem('crm_opportunities_data');
        if (storedOpps) {
          const parsed = JSON.parse(storedOpps);
          setSalesOpportunities(Array.isArray(parsed) ? parsed : []);
        } else {
          setSalesOpportunities([]);
        }

        // Background fetch opportunities from D1 database
        opportunityApiService
          .getOpportunities({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.opportunities) && res.opportunities.length > 0) {
              setSalesOpportunities(res.opportunities);
              persist('crm_opportunities_data', res.opportunities, undefined, false);
            }
          })
          .catch(() => { });

        const storedTasks = localStorage.getItem('crm_tasks_data');
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          const sanitized = Array.isArray(parsed)
            ? parsed.map((t: any) => ({
              ...t,
              assignee: {
                ...t.assignee,
                avatar: t.assignee?.avatar?.includes('unsplash.com') ? undefined : t.assignee?.avatar,
              },
            }))
            : [];
          setTasks(sanitized);
        } else {
          setTasks([]);
        }

        // Background fetch tasks from D1 database
        taskApiService
          .getTasks({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.tasks) && res.tasks.length > 0) {
              setTasks((prev) => {
                const remoteIds = new Set(res.tasks.map((t) => t.id));
                const localOnly = prev.filter((t) => !remoteIds.has(t.id));
                const merged = [...localOnly, ...res.tasks];
                persist('crm_tasks_data', merged, undefined, false);
                return merged;
              });
            }
          })
          .catch(() => { });

        // Safely migrate existing offline tasks to D1
        taskApiService.migrateLocalTasksToDatabase().catch(() => { });

        const storedQuotes = localStorage.getItem('crm_quotations_data');
        if (storedQuotes) {
          const parsed = JSON.parse(storedQuotes);
          setQuotations(Array.isArray(parsed) ? parsed : []);
        } else {
          setQuotations([]);
        }

        // Background fetch quotations from D1 database
        quotationApiService
          .getQuotations({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.quotations) && res.quotations.length > 0) {
              setQuotations(res.quotations);
              persist('crm_quotations_data', res.quotations, undefined, false);
            }
          })
          .catch(() => { });

        const storedOrders = localStorage.getItem('crm_orders_data');
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          setSalesOrders(Array.isArray(parsed) ? parsed : []);
        } else {
          setSalesOrders([]);
        }

        // Background fetch sales orders from D1 database
        salesOrderApiService
          .getSalesOrders({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.orders) && res.orders.length > 0) {
              setSalesOrders(res.orders);
              persist('crm_orders_data', res.orders, undefined, false);
            }
          })
          .catch(() => { });

        // Background fetch invoices from D1 database
        invoiceApiService
          .getInvoices({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.invoices) && res.invoices.length > 0) {
              setInvoices(res.invoices);
              persist('crm_invoices_data', res.invoices, undefined, false);
            }
          })
          .catch(() => { });

        const storedInvoices = localStorage.getItem('crm_invoices_data');
        if (storedInvoices) {
          try {
            const parsed = JSON.parse(storedInvoices);
            const liveUser = authMockService.getCurrentUser()?.name || 'shaheer';
            const sanitizedInvoices = Array.isArray(parsed)
              ? parsed.map((inv: any) => {
                const isMockOwner = !inv.owner || inv.owner.toLowerCase().includes('alex rivera') || inv.owner.toLowerCase().includes('nebin benny');
                const effectiveOwner = isMockOwner ? liveUser : inv.owner;
                const isMockContact =
                  inv.contactPerson &&
                  (inv.contactPerson.toLowerCase().includes('mohammad hattab') || inv.contactPerson.toLowerCase().includes('hala fawzi'));
                const realAvatar = (inv.ownerAvatar && !inv.ownerAvatar.includes('unsplash') && !inv.ownerAvatar.includes('photo-')) ? inv.ownerAvatar : (getEmployeePhoto(effectiveOwner) || undefined);
                return {
                  ...inv,
                  owner: effectiveOwner,
                  ownerAvatar: realAvatar,
                  contactPerson: isMockContact ? '' : (inv.contactPerson || ''),
                };
              })
              : mockInvoices;
            setInvoices(sanitizedInvoices.length > 0 ? sanitizedInvoices : mockInvoices);
          } catch (e) {
            setInvoices(mockInvoices);
          }
        } else {
          setInvoices(mockInvoices);
        }

        const storedReceipts = localStorage.getItem('crm_receipts_data');
        if (storedReceipts) {
          const parsed = JSON.parse(storedReceipts);
          setReceipts(Array.isArray(parsed) ? parsed : []);
        } else {
          setReceipts([]);
        }

        // Background fetch receipts from D1 database
        receiptApiService
          .getReceipts({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.receipts) && res.receipts.length > 0) {
              setReceipts(res.receipts);
              persist('crm_receipts_data', res.receipts, undefined, false);
            }
          })
          .catch(() => { });

        // Safely migrate existing offline receipts to D1
        receiptApiService.migrateLocalReceiptsToDatabase().catch(() => { });

        const storedDeliveryNotes = localStorage.getItem('crm_delivery_notes_data');
        if (storedDeliveryNotes) {
          const parsed = JSON.parse(storedDeliveryNotes);
          setDeliveryNotes(Array.isArray(parsed) ? parsed : []);
        } else {
          setDeliveryNotes([]);
        }

        // Background fetch delivery notes from D1 database
        deliveryNoteApiService
          .getDeliveryNotes({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.deliveryNotes) && res.deliveryNotes.length > 0) {
              setDeliveryNotes(res.deliveryNotes);
              persist('crm_delivery_notes_data', res.deliveryNotes, undefined, false);
            }
          })
          .catch(() => { });

        // Safely migrate existing offline delivery notes to D1
        deliveryNoteApiService.migrateLocalDeliveryNotesToDatabase().catch(() => { });

        // Proforma Invoices
        const storedProformas = localStorage.getItem('crm_proforma_invoices');
        if (storedProformas) {
          try {
            const parsed = JSON.parse(storedProformas);
            setProformas(Array.isArray(parsed) ? parsed : mockProformaInvoices);
          } catch {
            setProformas(mockProformaInvoices);
          }
        } else {
          setProformas(mockProformaInvoices);
        }

        // Background fetch proformas from D1 database
        proformaApiService
          .getProformas({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.proformas) && res.proformas.length > 0) {
              setProformas(res.proformas);
              persist('crm_proforma_invoices', res.proformas, undefined, false);
            }
          })
          .catch(() => { });

        // Safely migrate existing offline proforma invoices to D1
        proformaApiService.migrateLocalProformasToDatabase().catch(() => { });

        const storedCampaigns = localStorage.getItem('crm_campaigns_data');
        if (storedCampaigns) {
          const parsed = JSON.parse(storedCampaigns);
          setCampaigns(Array.isArray(parsed) ? parsed : []);
        } else {
          setCampaigns([]);
        }

        const storedStocks = localStorage.getItem('crm_stocks_data');
        if (storedStocks) {
          const parsed = JSON.parse(storedStocks);
          setPurchaseStocks(Array.isArray(parsed) ? parsed : []);
        } else {
          setPurchaseStocks([]);
        }

        // Background fetch CRM inventory from D1
        crmInventoryApiService
          .getInventory({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.purchaseStocks) && res.purchaseStocks.length > 0) {
              setPurchaseStocks(res.purchaseStocks);
              persist('crm_stocks_data', res.purchaseStocks, undefined, false);
            }
          })
          .catch(() => { });
        crmInventoryApiService.migrateLocalInventoryToDatabase().catch(() => { });

        // Suppliers
        const storedSuppliers = localStorage.getItem('crm_suppliers_list');
        if (storedSuppliers) {
          try {
            const parsed = JSON.parse(storedSuppliers);
            const filtered = Array.isArray(parsed)
              ? parsed.filter(
                  (s: any) =>
                    !['sup_1', 'sup_2', 'sup_3', 'sup_4'].includes(s.id) &&
                    !['LUTFI TRADING LLC', 'SUPER GENERAL COMPANY LLC', 'CENTRAL TRADING COMPANY LLC', 'Shajarath Al Thalj Trading LLC'].includes(s.name)
                )
              : [];
            setSuppliers(filtered);
            if (Array.isArray(parsed) && filtered.length !== parsed.length) {
              localStorage.setItem('crm_suppliers_list', JSON.stringify(filtered));
            }
          } catch {
            setSuppliers([]);
          }
        } else {
          setSuppliers([]);
        }

        supplierApiService
          .getSuppliers({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.suppliers) && res.suppliers.length > 0) {
              setSuppliers(res.suppliers);
              persist('crm_suppliers_list', res.suppliers, undefined, false);
            }
          })
          .catch(() => { });
        supplierApiService.migrateLocalSuppliersToDatabase().catch(() => { });

        // Purchase Orders
        const storedPOs = localStorage.getItem('crm_purchase_orders');
        if (storedPOs) {
          try {
            const parsed = JSON.parse(storedPOs);
            setPurchaseOrders(Array.isArray(parsed) ? parsed : []);
          } catch {
            setPurchaseOrders([]);
          }
        } else {
          setPurchaseOrders([]);
        }

        purchaseOrderApiService
          .getPurchaseOrders({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.orders) && res.orders.length > 0) {
              setPurchaseOrders(res.orders);
              persist('crm_purchase_orders', res.orders, undefined, false);
            }
          })
          .catch(() => { });
        purchaseOrderApiService.migrateLocalPurchaseOrdersToDatabase().catch(() => { });

        // Stock Transfers
        const storedTransfers = localStorage.getItem('crm_stock_transfers');
        if (storedTransfers) {
          try {
            const parsed = JSON.parse(storedTransfers);
            setStockTransfers(Array.isArray(parsed) ? parsed : []);
          } catch {
            setStockTransfers([]);
          }
        } else {
          setStockTransfers([]);
        }

        stockTransferApiService
          .getStockTransfers({ limit: 100 })
          .then((res) => {
            if (res && Array.isArray(res.transfers) && res.transfers.length > 0) {
              setStockTransfers(res.transfers);
              persist('crm_stock_transfers', res.transfers, undefined, false);
            }
          })
          .catch(() => { });
        stockTransferApiService.migrateLocalStockTransfersToDatabase().catch(() => { });

        // Load dynamic shared users - prime active cached users immediately
        const deletedIdsRaw = typeof window !== 'undefined' ? localStorage.getItem('cezcon_crm_deleted_user_ids') : null;
        const deletedSet = new Set<string>(deletedIdsRaw ? JSON.parse(deletedIdsRaw) : []);

        const cezconRaw = localStorage.getItem('cezcon_crm_users_list');
        if (cezconRaw) {
          try {
            const parsed = JSON.parse(cezconRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const activeOnly = parsed.filter((u: any) => {
                const isActive = u.status === 'Active' || u.status === 'active' || u.is_active === 1 || u.is_active === true;
                if (!isActive) return false;
                const uid = String(u.id || '').toLowerCase();
                const uemail = String(u.email || '').toLowerCase();
                if (deletedSet.has(uid) || deletedSet.has(uemail)) return false;
                return true;
              });
              if (activeOnly.length > 0) {
                setUsers(
                  activeOnly.map((u: any) => ({
                    id: String(u.id),
                    name: u.name,
                    email: u.email || `${u.username}@cooltechuae.com`,
                    role: (u.isAdmin ? 'Admin' : u.profileType?.toLowerCase().includes('manager') ? 'Manager' : 'Employee') as UserRole,
                    phone: u.phone || '+971 50 123 4567',
                    department: u.department || u.profileType || 'General',
                    status: 'Active',
                    lastLogin: 'Active now',
                    avatar: u.avatarImage || u.avatarUrl || u.avatar || '',
                    position: u.position || u.designation,
                  }))
                );
              }
            }
          } catch { }
        }
      } catch (e) {
        console.error('EnterpriseCrmContext loadAllData error:', e);
      }
    };

    loadAllData();
    fetchAuthoritativeUsers();

    // Multi-device live database synchronizer
    let isLiveSyncInProgress = false;
    const syncActiveDataFromDatabase = async () => {
      if (isLiveSyncInProgress) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      isLiveSyncInProgress = true;

      try {
        // 1. Keep users synchronized
        fetchAuthoritativeUsers();

        // 2. Fetch authoritative leads directly from Cloudflare D1
        try {
          const res = await leadApiService.getLeads({ limit: 100 });
          if (res && Array.isArray(res.leads)) {
            setLeads((prev) => {
              if (
                prev.length === res.leads.length &&
                prev.every((l, idx) => {
                  const r = res.leads[idx];
                  return (
                    r &&
                    l.id === r.id &&
                    l.status === r.status &&
                    l.rating === r.rating &&
                    l.owner === r.owner &&
                    l.lastActivity === r.lastActivity
                  );
                })
              ) {
                return prev;
              }
              persist('crm_leads_data', res.leads, undefined, false);
              return res.leads;
            });
          }
        } catch {
          // Suppress background poll errors to maintain uninterrupted UX
        }

        // 3. Fetch authoritative customers directly from Cloudflare D1
        try {
          const res = await customerApiService.getCustomers({ limit: 100 });
          if (res && Array.isArray(res.customers)) {
            setCustomers((prev) => {
              if (
                prev.length === res.customers.length &&
                prev.every((c, idx) => {
                  const r = res.customers[idx];
                  return (
                    r &&
                    c.id === r.id &&
                    c.customerName === r.customerName &&
                    c.owner === r.owner
                  );
                })
              ) {
                return prev;
              }
              persist('crm_customers_data', res.customers, undefined, false);
              return res.customers;
            });
          }
        } catch {}

        // 4. Fetch authoritative tasks directly from Cloudflare D1
        try {
          const res = await taskApiService.getTasks({ limit: 100 });
          if (res && Array.isArray(res.tasks)) {
            setTasks((prev) => {
              // Never wipe out local tasks if remote returned empty array
              if (res.tasks.length === 0 && prev.length > 0) {
                return prev;
              }

              // Merge remote tasks with local tasks by ID (preserving any newly added local tasks)
              const remoteIds = new Set(res.tasks.map((t) => t.id));
              const localOnly = prev.filter((t) => !remoteIds.has(t.id));
              const merged = [...localOnly, ...res.tasks];

              if (
                prev.length === merged.length &&
                prev.every((t, idx) => {
                  const r = merged[idx];
                  return r && t.id === r.id && t.status === r.status && t.taskDetails === r.taskDetails;
                })
              ) {
                return prev;
              }
              persist('crm_tasks_data', merged, undefined, false);
              return merged;
            });
          }
        } catch {}

        // 5. Fetch authoritative opportunities directly from Cloudflare D1
        try {
          const res = await opportunityApiService.getOpportunities({ limit: 100 });
          if (res && Array.isArray(res.opportunities)) {
            setSalesOpportunities((prev) => {
              // Never wipe out local opportunities if remote returned empty array
              if (res.opportunities.length === 0 && prev.length > 0) {
                return prev;
              }
              if (
                prev.length === res.opportunities.length &&
                prev.every((o, idx) => {
                  const r = res.opportunities[idx];
                  return r && o.id === r.id && o.stage === r.stage && o.title === r.title;
                })
              ) {
                return prev;
              }
              // Merge: preserve local opportunities that haven't synced to remote yet
              const remoteIds = new Set(res.opportunities.map((o) => o.id));
              const remoteCodes = new Set(res.opportunities.map((o) => o.opportunityCode).filter(Boolean));
              const pendingLocal = prev.filter(
                (o) => !remoteIds.has(o.id) && (!o.opportunityCode || !remoteCodes.has(o.opportunityCode))
              );
              const combined = [...pendingLocal, ...res.opportunities];
              persist('crm_opportunities_data', combined, undefined, false);
              return combined;
            });
          }
        } catch {}
      } finally {
        isLiveSyncInProgress = false;
      }
    };

    // Live sync polling interval (every 3 seconds when tab is active/visible)
    const pollTimer = setInterval(() => {
      syncActiveDataFromDatabase();
    }, 3000);

    // Refresh instantly when phone screen wakes up, app opens, or browser tab regains focus
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncActiveDataFromDatabase();
      }
    };
    const handleWindowFocus = () => {
      syncActiveDataFromDatabase();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    const eventNames = [
      'storage',
      'crm_tasks_updated',
      'crm_leads_updated',
      'crm_customers_updated',
      'crm_opportunities_updated',
      'crm_quotations_updated',
      'crm_orders_updated',
      'crm_invoices_updated',
      'crm_proforma_invoices_updated',
      'crm_receipts_updated',
      'crm_delivery_notes_updated',
      'crm_stocks_updated',
      'crm_suppliers_updated',
      'crm_purchase_orders_updated',
      'crm_stock_transfers_updated',
      'crm_campaigns_updated',
      'crm_users_updated',
      'crm_admins_updated',
      'crm_team_updated',
      'crm_profiles_updated',
      'crm_data_updated',
      'crm_auth_updated',
    ];

    const handleDataEvent = (e: Event) => {
      loadAllData();
      if (e.type === 'crm_users_updated' || e.type === 'crm_auth_updated' || e.type === 'storage') {
        fetchAuthoritativeUsers();
      }
    };

    eventNames.forEach((evt) => window.addEventListener(evt, handleDataEvent));
    return () => {
      clearInterval(pollTimer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }
      eventNames.forEach((evt) => window.removeEventListener(evt, handleDataEvent));
    };
  }, []);

  // Task Handlers
  const addTask = (taskData: Omit<CrmTask, 'id' | 'slNo'>) => {
    let currentTasks = tasks;
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) currentTasks = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const uniqueId = `TSK-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const newTask: CrmTask = {
      ...taskData,
      id: uniqueId,
      slNo: currentTasks.length + 1,
      createdAt: (taskData as any).createdAt || new Date().toISOString(),
      progress: taskData.progress ?? 0,
      assignedEmployee: taskData.assignedEmployee || taskData.assignee?.name,
    };
    const updated = [newTask, ...currentTasks.filter((t) => t.id !== uniqueId)];
    setTasks(updated);
    persist('crm_tasks_data', updated);
    taskApiService.createTask(newTask).catch(() => { });
  };

  const createTask = (taskData: Partial<CrmTask> & { taskDetails: string }) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const assigneeName = taskData.assignedEmployee || taskData.assignee?.name || 'Assigned Employee';
    const managerName = taskData.assignedBy || taskData.createdBy || 'Operations Manager';

    let currentTasks = tasks;
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) currentTasks = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const uniqueId = taskData.id || `TSK-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    const newTask: CrmTask = {
      description: '',
      customer: 'Client Facility',
      taskUnder: 'General Maintenance',
      taskType: 'Service Order',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '04:00 PM',
      priority: 'Normal',
      assignedEmployee: assigneeName,
      assignedBy: managerName,
      createdBy: managerName,
      assignee: {
        name: assigneeName,
        role: 'Employee',
        avatar: undefined,
      },
      ...taskData,
      id: uniqueId,
      slNo: currentTasks.length + 1,
      status: taskData.status || 'Assigned',
      progress: taskData.progress || 0,
      createdAt: new Date().toISOString(),
      history: [
        {
          id: `log-${Date.now()}`,
          timestamp: `${now} - ${new Date().toLocaleDateString()}`,
          user: managerName,
          userRole: 'Manager',
          action: 'Created & Assigned',
          note: `Task assigned to ${assigneeName}`,
        },
      ],
      comments: taskData.comments || [],
    };
    const updated = [newTask, ...currentTasks.filter((t) => t.id !== uniqueId)];
    setTasks(updated);
    persist('crm_tasks_data', updated);
    taskApiService.createTask(newTask).catch(() => { });
    return newTask;
  };

  const assignTask = (taskId: string, employeeName: string, managerName = 'Operations Manager') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        assignedEmployee: employeeName,
        assignee: { ...t.assignee, name: employeeName },
        status: 'Assigned',
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: managerName,
            userRole: 'Manager',
            action: 'Assigned',
            note: `Assigned to ${employeeName}`,
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const acceptTask = (taskId: string, employeeName = 'Employee') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        status: 'Accepted',
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: employeeName,
            userRole: 'Employee',
            action: 'Accepted',
            note: 'Employee accepted the task',
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const startTask = (taskId: string, employeeName = 'Employee') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        status: 'In Progress',
        progress: Math.max(t.progress || 0, 15),
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: employeeName,
            userRole: 'Employee',
            action: 'Started',
            note: 'Work started on task',
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const updateTaskProgress = (taskId: string, progress: number, employeeName = 'Employee', note?: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        progress,
        status: progress === 100 ? 'Completed' : 'In Progress',
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: employeeName,
            userRole: 'Employee',
            action: 'Progress Update',
            progress,
            note: note || `Updated progress to ${progress}%`,
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const completeTask = (taskId: string, employeeName = 'Employee', notes?: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        status: 'Completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: employeeName,
            userRole: 'Employee',
            action: 'Completed',
            note: notes || 'Task completed by employee',
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const reviewTask = (taskId: string, managerName = 'Muhammed Shibil (Sales Manager)', notes?: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        status: 'Reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: managerName,
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: managerName,
            userRole: 'Manager',
            action: 'Reviewed',
            note: notes || 'Manager approved & signed off on task completion',
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const addCommentToTask = (taskId: string, text: string, author = 'Jordan Hayes', role = 'Employee') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const comments = t.comments || [];
      const history = t.history || [];
      return {
        ...t,
        comments: [
          ...comments,
          {
            id: `cmt-${Date.now()}`,
            author,
            role,
            text,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
          },
        ],
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: author,
            userRole: role,
            action: 'Comment Added',
            note: text,
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
    taskApiService.addComment(taskId, text).catch(() => { });
  };

  const updateTaskStatusWorkflow = (taskId: string, status: TaskStatus, actor = 'User', role = 'Manager', note?: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const list = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const history = t.history || [];
      return {
        ...t,
        status,
        history: [
          ...history,
          {
            id: `log-${Date.now()}`,
            timestamp: `${now} - ${new Date().toLocaleDateString()}`,
            user: actor,
            userRole: role,
            action: `Status: ${status}`,
            note: note || `Status updated to ${status}`,
          },
        ],
      };
    });
    setTasks(list);
    persist('crm_tasks_data', list);
    taskApiService.updateTaskStatus(taskId, { status, notes: note }).catch(() => { });
  };

  const updateTask = (id: string, updated: Partial<CrmTask>) => {
    let currentTasks = tasks;
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) currentTasks = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const enriched: Partial<CrmTask> = {
      ...updated,
      ...(updated.assignee?.name && !updated.assignedEmployee
        ? { assignedEmployee: updated.assignee.name }
        : {}),
      ...(updated.assignedEmployee && !updated.assignee
        ? { assignee: { name: updated.assignedEmployee } }
        : {}),
    };
    const list = currentTasks.map((t) => (t.id === id ? { ...t, ...enriched } : t));
    setTasks(list);
    persist('crm_tasks_data', list);
    taskApiService.updateTask(id, enriched).catch(() => { });
  };

  const toggleTaskStatus = (id: string) => {
    let currentTasks = tasks;
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) currentTasks = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const list = currentTasks.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'Completed' ? 'Pending' : 'Completed') as any } : t
    );
    setTasks(list);
    persist('crm_tasks_data', list);
  };

  const deleteTask = (id: string) => {
    let currentTasks = tasks;
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) currentTasks = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const list = currentTasks.filter((t) => t.id !== id);
    setTasks(list);
    persist('crm_tasks_data', list);
    taskApiService.deleteTask(id).catch(() => { });
  };

  // Lead Handlers
  const refreshLeads = async (): Promise<void> => {
    setIsLeadsLoading(true);
    try {
      const res = await leadApiService.getLeads({ limit: 100 });
      if (res && Array.isArray(res.leads)) {
        setLeads(res.leads);
        setLeadsError(null);
        persist('crm_leads_data', res.leads);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads from CRM database';
      console.warn('[EnterpriseCrmContext] refreshLeads failed on backend, using local cache:', msg);
      setLeadsError(msg);
      const stored = localStorage.getItem('cooltech_crm_leads') || localStorage.getItem('crm_leads_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeads(parsed);
          }
        } catch { }
      }
    } finally {
      setIsLeadsLoading(false);
    }
  };

  const addLead = async (leadData: Omit<CrmLead, 'id' | 'slNo'>): Promise<CrmLead> => {
    try {
      // 1. Authenticated database-first persistence directly into Cloudflare D1
      const created = await leadApiService.createLead(leadData);

      // 2. Update React state with the confirmed remote record
      setLeads((prev) => {
        const withoutNew = prev.filter((l) => l.id !== created.id);
        const updated = [created, ...withoutNew];
        persist('crm_leads_data', updated);
        return updated;
      });

      // 3. Update legacy localStorage cache non-destructively
      try {
        const storedCool = localStorage.getItem('cooltech_crm_leads');
        if (storedCool) {
          const parsed = JSON.parse(storedCool);
          if (Array.isArray(parsed) && !parsed.some((l: any) => l.id === created.id)) {
            localStorage.setItem('cooltech_crm_leads', JSON.stringify([created, ...parsed]));
          }
        }
      } catch { }

      // 4. Remote refresh to ensure canonical ordering & database state
      await refreshLeads();

      return created;
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] Automatic lead persistence to database failed:', err);
      // Fail-fast: Never silently pretend the lead was saved if remote D1 save failed!
      throw err;
    }
  };

  const assignLead = async (
    leadId: string,
    employeeName: string,
    managerName = 'Muhammed Shibil (Sales Manager)',
    ownerId?: string
  ): Promise<void> => {
    const list = leads.map((l) => {
      if (l.id !== leadId) return l;
      return {
        ...l,
        assignedEmployee: employeeName,
        assignedManager: managerName,
        owner: employeeName,
        ownerId: ownerId || l.ownerId,
        leadAssigned: { name: employeeName, avatar: l.leadAssigned?.avatar },
        status: l.status === 'New' ? 'Qualified' : l.status,
        lastActivity: `Assigned to ${employeeName}`,
        lastActivityDate: new Date().toISOString().split('T')[0],
      };
    });
    setLeads(list);
    persist('crm_leads_data', list);

    try {
      await leadApiService.updateLead(leadId, {
        assignedEmployee: employeeName,
        assignedManager: managerName,
        owner: employeeName,
        ownerId: ownerId,
        lastActivity: `Assigned to ${employeeName}`,
      });
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] assignLead failed on backend:', err);
      throw err;
    }
  };

  const updateLead = async (id: string, updated: Partial<CrmLead>): Promise<CrmLead | void> => {
    const list = leads.map((l) => (l.id === id ? { ...l, ...updated } : l));
    setLeads(list);
    persist('crm_leads_data', list);

    try {
      const saved = await leadApiService.updateLead(id, updated);
      setLeads((prev) => prev.map((l) => (l.id === id ? saved : l)));
      return saved;
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] updateLead failed on backend:', err);
      throw err;
    }
  };

  const updateLeadStatus = async (
    id: string,
    data: {
      status?: LeadStatus;
      rating?: LeadRating;
      comments?: string;
      addNote?: boolean;
    }
  ): Promise<CrmLead | void> => {
    const list = leads.map((l) => {
      if (l.id !== id) return l;
      return {
        ...l,
        status: data.status || l.status,
        rating: data.rating || l.rating,
        comments: data.comments !== undefined ? data.comments : l.comments,
        lastActivity: `Status updated to ${data.status || l.status}`,
        lastActivityDate: new Date().toISOString().split('T')[0],
      };
    });
    setLeads(list);
    persist('crm_leads_data', list);

    try {
      const saved = await leadApiService.updateLeadStatus(id, data);
      setLeads((prev) => prev.map((l) => (l.id === id ? saved : l)));
      return saved;
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] updateLeadStatus failed on backend:', err);
      throw err;
    }
  };

  const deleteLead = async (id: string): Promise<void> => {
    const list = leads.filter((l) => l.id !== id);
    setLeads(list);
    persist('crm_leads_data', list);

    try {
      await leadApiService.deleteLead(id);
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] deleteLead failed on backend:', err);
      throw err;
    }
  };

  // Customer Handlers
  const refreshCustomers = async (): Promise<void> => {
    setIsCustomersLoading(true);
    try {
      const res = await customerApiService.getCustomers({ limit: 100 });
      if (res && Array.isArray(res.customers)) {
        setCustomers(res.customers);
        setCustomersError(null);
        persist('crm_customers_data', res.customers, undefined, false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch customers from CRM database';
      setCustomersError(msg);
      const stored = localStorage.getItem('crm_customers_data');
      if (stored) {
        try {
          setCustomers(JSON.parse(stored));
        } catch { }
      }
    } finally {
      setIsCustomersLoading(false);
    }
  };

  const addCustomer = async (custData: Omit<CrmCustomer, 'id' | 'slNo'>): Promise<CrmCustomer | void> => {
    try {
      const created = await customerApiService.createCustomer(custData);
      setCustomers((prev) => {
        const withoutNew = prev.filter((c) => c.id !== created.id);
        const updated = [created, ...withoutNew];
        persist('crm_customers_data', updated);
        return updated;
      });
      return created;
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] createCustomer failed on backend:', err);
      throw err;
    }
  };

  const assignCustomer = async (
    customerId: string,
    employeeName: string,
    managerName = 'Muhammed Shibil (Sales Manager)'
  ): Promise<void> => {
    const list = customers.map((c) => {
      if (c.id !== customerId && String(c.slNo) !== customerId) return c;
      return {
        ...c,
        owner: employeeName,
        lastActivity: `Assigned to ${employeeName}`,
      };
    });
    setCustomers(list);
    persist('crm_customers_data', list);

    try {
      const updated = await customerApiService.updateCustomer(customerId, {
        owner: employeeName,
        lastActivity: `Assigned to ${employeeName}`,
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId || String(c.slNo) === customerId ? updated : c))
      );
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] assignCustomer failed on backend:', err);
      throw err;
    }
  };

  const updateCustomer = async (
    id: string,
    updatedData: Partial<CrmCustomer>
  ): Promise<CrmCustomer | void> => {
    const list = customers.map((c) => (c.id === id || String(c.slNo) === id ? { ...c, ...updatedData } : c));
    setCustomers(list);
    persist('crm_customers_data', list);

    try {
      const saved = await customerApiService.updateCustomer(id, updatedData);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id || String(c.slNo) === id ? saved : c))
      );
      return saved;
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] updateCustomer failed on backend:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    const list = customers.filter((c) => c.id !== id && String(c.slNo) !== id);
    setCustomers(list);
    persist('crm_customers_data', list);

    try {
      await customerApiService.deleteCustomer(id);
    } catch (err: unknown) {
      console.error('[EnterpriseCrmContext] deleteCustomer failed on backend:', err);
      throw err;
    }
  };

  // Opportunity Handlers
  const addOpportunity = (oppData: Omit<CrmSalesOpportunity, 'id' | 'createdAt'>) => {
    // Prevent duplicate opportunity if created from the same lead
    if (oppData.createdFromLeadId) {
      const existing = salesOpportunities.find((o) => o.createdFromLeadId === oppData.createdFromLeadId);
      if (existing) {
        return;
      }
    }

    const uniqueId = `opp-${Date.now()}`;
    const code = oppData.opportunityCode || `CTEQ#${Math.floor(7100 + Math.random() * 800)}`;
    const newOpp: CrmSalesOpportunity = {
      ...oppData,
      id: uniqueId,
      createdAt: new Date().toISOString().split('T')[0],
      opportunityCode: code,
    };
    const updated = [newOpp, ...salesOpportunities];
    setSalesOpportunities(updated);
    persist('crm_opportunities_data', updated);

    // Persist to D1 database
    opportunityApiService.createOpportunity(newOpp).then((res) => {
      if (res?.opportunity) {
        setSalesOpportunities((prev) =>
          prev.map((o) => (o.id === uniqueId ? { ...res.opportunity, opportunityCode: o.opportunityCode || res.opportunity.opportunityCode || code } : o))
        );
      }
    }).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to persist opportunity to D1, keeping local state:', err);
    });
    return newOpp;
  };

  const updateOpportunity = (id: string, updated: Partial<CrmSalesOpportunity>) => {
    const list = salesOpportunities.map((o) => (o.id === id ? { ...o, ...updated } : o));
    setSalesOpportunities(list);
    persist('crm_opportunities_data', list);

    opportunityApiService.updateOpportunity(id, updated).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to update opportunity on D1:', err);
    });
  };

  const updateOpportunityStage = (id: string, newStage: DealStage) => {
    const list = salesOpportunities.map((opp) => (opp.id === id ? { ...opp, stage: newStage } : opp));
    setSalesOpportunities(list);
    persist('crm_opportunities_data', list);

    opportunityApiService.updateOpportunity(id, { stage: newStage }).catch(() => { });
  };

  const deleteOpportunity = (id: string) => {
    const list = salesOpportunities.filter((opp) => opp.id !== id);
    setSalesOpportunities(list);
    persist('crm_opportunities_data', list);

    opportunityApiService.deleteOpportunity(id).catch(() => { });
  };

  // Quotation Handlers
  const addQuotation = (quoteData: Omit<CrmQuotation, 'id'>) => {
    const uniqueId = `quote-${Date.now()}`;
    const newQuote: CrmQuotation = {
      ...quoteData,
      id: uniqueId,
      quotationNumber: quoteData.quotationNumber || `QT-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newQuote, ...quotations];
    setQuotations(updated);
    persist('crm_quotations_data', updated);

    quotationApiService.createQuotation(newQuote).then((created) => {
      if (created) {
        setQuotations((prev) => prev.map((q) => (q.id === uniqueId ? created : q)));
      }
    }).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to persist quotation to D1:', err);
    });
  };

  const updateQuotation = (idOrObj: string | CrmQuotation, updated?: Partial<CrmQuotation>) => {
    const targetId = typeof idOrObj === 'object' && idOrObj !== null ? idOrObj.id : idOrObj;
    const targetPayload = typeof idOrObj === 'object' && idOrObj !== null ? idOrObj : updated || {};

    const list = quotations.map((q) => {
      if (q.id === targetId) {
        return { ...q, ...targetPayload, id: targetId };
      }
      return q;
    });
    setQuotations(list);
    persist('crm_quotations_data', list);

    quotationApiService.updateQuotation(targetId, targetPayload).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to update quotation on D1:', err);
    });
  };

  const deleteQuotation = (id: string) => {
    const list = quotations.filter((q) => q.id !== id);
    setQuotations(list);
    persist('crm_quotations_data', list);

    quotationApiService.deleteQuotation(id).catch(() => { });
  };

  const convertQuotationToSalesOrder = (quotationId: string): CrmSalesOrder | null => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return null;

    // Duplicate Prevention: Check if already converted to Sales Order
    const existingOrder = salesOrders.find(
      (o) =>
        o.id === quote.convertedOrderId ||
        o.quotationRef === quote.quotationNumber ||
        (o as any).quotationId === quotationId
    );
    if (existingOrder || quote.convertedOrderId) {
      const match = existingOrder || salesOrders.find((o) => o.id === quote.convertedOrderId);
      if (match) return match;
    }

    const orderNumber = `SO-${Date.now().toString().slice(-4)}`;
    const uniqueOrderId = `ord-${Date.now()}`;
    const newOrder: CrmSalesOrder = {
      id: uniqueOrderId,
      slNo: (salesOrders?.length || 0) + 1,
      orderNumber: orderNumber,
      quotationRef: quote.quotationNumber,
      quotationId: quote.id,
      opportunityRef: quote.opportunityCode || '',
      customer: quote.customer,
      contactPerson: quote.contactPerson || '',
      orderDate: new Date().toISOString().split('T')[0],
      amount: quote.subtotal || quote.totalAmount || 0,
      vatAmount: quote.vatAmount || 0,
      totalAmount: quote.totalAmount || 0,
      status: 'Confirmed',
      assignedTo: quote.assignedTo || quote.owner || '',
      billingAddress: quote.billingAddress || '',
      shippingAddress: quote.shippingAddress || '',
      notes: quote.customerNotes || '',
      paymentTerms: quote.paymentTerms || '',
      deliveryTerms: quote.deliveryTerms || '',
      items: quote.items || [],
    };

    const updatedOrders = [newOrder, ...(salesOrders || [])];
    setSalesOrders(updatedOrders);
    persist('crm_orders_data', updatedOrders);

    // Update Quotation Status to Converted
    const now = new Date().toISOString();
    const updatedQuotes = quotations.map((q) => {
      if (q.id === quotationId) {
        return {
          ...q,
          status: 'Converted' as const,
          salesOrderId: newOrder.id,
          salesOrderNumber: newOrder.orderNumber,
          convertedOrderId: newOrder.id,
          convertedAt: now,
          history: [
            ...(q.history || []),
            {
              id: `hist-${Date.now()}`,
              action: `Converted to Sales Order ${orderNumber}`,
              date: now,
              user: 'System',
              role: 'User',
              remarks: `Generated Sales Order Ref: ${orderNumber}`,
            },
          ],
        };
      }
      return q;
    });
    setQuotations(updatedQuotes);
    persist('crm_quotations_data', updatedQuotes);

    // Persist to D1 database
    salesOrderApiService.createSalesOrder({
      ...newOrder,
      quotationId: quote.id,
    }).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to persist sales order to D1:', err);
    });

    quotationApiService.updateQuotation(quote.id, {
      status: 'Converted',
      convertedOrderId: newOrder.id,
      salesOrderNumber: newOrder.orderNumber,
    }).catch(() => { });

    return newOrder;
  };

  // Sales Order Handlers
  const addSalesOrder = (orderData: Omit<CrmSalesOrder, 'id'>) => {
    const uniqueId = `ord-${Date.now()}`;
    const newOrder: CrmSalesOrder = {
      ...orderData,
      id: uniqueId,
      orderNumber: orderData.orderNumber || `SO-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newOrder, ...salesOrders];
    setSalesOrders(updated);
    persist('crm_orders_data', updated);

    salesOrderApiService.createSalesOrder(newOrder).then((res) => {
      if (res?.order) {
        setSalesOrders((prev) => prev.map((o) => (o.id === uniqueId ? res.order : o)));
      }
    }).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to persist sales order to D1:', err);
    });
  };

  const updateSalesOrder = (id: string, updated: Partial<CrmSalesOrder>) => {
    const list = salesOrders.map((o) => (o.id === id ? { ...o, ...updated } : o));
    setSalesOrders(list);
    persist('crm_orders_data', list);

    salesOrderApiService.updateSalesOrder(id, updated).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to update sales order on D1:', err);
    });
  };

  const deleteSalesOrder = (id: string) => {
    const list = salesOrders.filter((o) => o.id !== id);
    setSalesOrders(list);
    persist('crm_orders_data', list);

    salesOrderApiService.deleteSalesOrder(id).catch(() => { });
  };

  // Invoice Handlers
  const addInvoice = (invData: Omit<CrmInvoice, 'id'>) => {
    let currentInvoices = invoices;
    try {
      const stored = localStorage.getItem('crm_invoices_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentInvoices = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read crm_invoices_data from localStorage:', e);
    }

    const totalAmt = Number(invData.totalAmount) || 0;
    const paidAmt = Number(invData.paidAmount) || 0;
    const balanceAmt = Math.max(0, totalAmt - paidAmt);
    let derivedStatus = invData.status;
    if (!derivedStatus || derivedStatus === 'Pending') {
      if (paidAmt >= totalAmt && totalAmt > 0) {
        derivedStatus = 'Paid';
      } else if (paidAmt > 0 && paidAmt < totalAmt) {
        derivedStatus = 'Partially Paid';
      } else {
        derivedStatus = 'Unpaid';
      }
    }

    const uniqueId = `inv-${Date.now()}`;
    const newInv: CrmInvoice = {
      ...invData,
      id: uniqueId,
      slNo: invData.slNo || (currentInvoices.length + 1),
      invoiceNumber: invData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
      paidAmount: paidAmt,
      balanceAmount: balanceAmt,
      status: derivedStatus,
    };
    const updated = [newInv, ...currentInvoices.filter((inv) => inv.id !== newInv.id)];
    setInvoices(updated);
    persist('crm_invoices_data', updated);

    invoiceApiService.createInvoice(newInv).then((created) => {
      if (created) {
        setInvoices((prev) => prev.map((inv) => (inv.id === uniqueId ? created : inv)));
      }
    }).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to persist invoice to D1:', err);
    });
  };

  const updateInvoice = (id: string, updated: Partial<CrmInvoice>) => {
    let currentInvoices = invoices;
    try {
      const stored = localStorage.getItem('crm_invoices_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentInvoices = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read crm_invoices_data from localStorage:', e);
    }

    const exists = currentInvoices.some((inv) => inv.id === id);
    let list: CrmInvoice[];
    if (exists) {
      list = currentInvoices.map((inv) => {
        if (inv.id !== id) return inv;
        const total = updated.totalAmount !== undefined ? Number(updated.totalAmount) : Number(inv.totalAmount || 0);
        const paid = updated.paidAmount !== undefined ? Number(updated.paidAmount) : Number(inv.paidAmount || 0);
        const balance = Math.max(0, total - paid);

        let status = updated.status !== undefined ? updated.status : inv.status;
        if (updated.paidAmount !== undefined || updated.totalAmount !== undefined) {
          if (paid >= total && total > 0) {
            status = 'Paid';
          } else if (paid > 0 && paid < total) {
            status = 'Partially Paid';
          } else {
            status = 'Unpaid';
          }
        }

        return {
          ...inv,
          ...updated,
          id, // Never change id
          paidAmount: paid,
          balanceAmount: balance,
          status,
        };
      });
    } else {
      list = [{ ...(updated as CrmInvoice), id }, ...currentInvoices];
    }
    setInvoices(list);
    persist('crm_invoices_data', list);

    invoiceApiService.updateInvoice(id, updated).catch((err) => {
      console.warn('[EnterpriseCrmContext] Failed to update invoice on D1:', err);
    });
  };

  const deleteInvoice = (id: string) => {
    let currentInvoices = invoices;
    try {
      const stored = localStorage.getItem('crm_invoices_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentInvoices = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const list = currentInvoices.filter((inv) => inv.id !== id);
    setInvoices(list);
    persist('crm_invoices_data', list);

    invoiceApiService.deleteInvoice(id).catch(() => { });
  };

  // Proforma Invoice Handlers
  const addProforma = (piData: Omit<CrmProformaInvoice, 'id' | 'slNo'>) => {
    const newPi: CrmProformaInvoice = {
      ...piData,
      id: `pi_${Date.now()}`,
      slNo: proformas.length + 1,
      piNumber: piData.piNumber || `CTPI#${Date.now().toString().slice(-4)}`,
    };
    const updated = [newPi, ...proformas];
    setProformas(updated);
    persist('crm_proforma_invoices', updated);
    proformaApiService.createProforma(newPi).catch(() => { });
  };

  const updateProforma = (id: string, updatedFields: Partial<CrmProformaInvoice>) => {
    const updated = proformas.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setProformas(updated);
    persist('crm_proforma_invoices', updated);
    proformaApiService.updateProforma(id, updatedFields).catch(() => { });
  };

  const deleteProforma = (id: string) => {
    const updated = proformas.filter((p) => p.id !== id);
    setProformas(updated);
    persist('crm_proforma_invoices', updated);
    proformaApiService.deleteProforma(id).catch(() => { });
  };

  // Receipt Handlers
  const addReceipt = (recData: Omit<CrmReceipt, 'id'>) => {
    const newRec: CrmReceipt = {
      ...recData,
      id: `rec-${Date.now()}`,
      receiptNumber: recData.receiptNumber || `REC-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newRec, ...receipts];
    setReceipts(updated);
    persist('crm_receipts_data', updated);
    receiptApiService.createReceipt(newRec).catch(() => { });
  };

  const updateReceipt = (id: string, updatedFields: Partial<CrmReceipt>) => {
    const updated = receipts.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
    setReceipts(updated);
    persist('crm_receipts_data', updated);
    receiptApiService.updateReceipt(id, updatedFields).catch(() => { });
  };

  const deleteReceipt = (id: string) => {
    const updated = receipts.filter((r) => r.id !== id);
    setReceipts(updated);
    persist('crm_receipts_data', updated);
    receiptApiService.deleteReceipt(id).catch(() => { });
  };

  // Delivery Note Handlers
  const addDeliveryNote = (dnData: Omit<CrmDeliveryNote, 'id'>) => {
    const newDn: CrmDeliveryNote = {
      ...dnData,
      id: `dn-${Date.now()}`,
      deliveryNoteNumber: dnData.deliveryNoteNumber || `DN-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newDn, ...deliveryNotes];
    setDeliveryNotes(updated);
    persist('crm_delivery_notes_data', updated);
    deliveryNoteApiService.createDeliveryNote(newDn).catch(() => { });
  };

  const updateDeliveryNote = (id: string, updatedFields: Partial<CrmDeliveryNote>) => {
    const updated = deliveryNotes.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
    setDeliveryNotes(updated);
    persist('crm_delivery_notes_data', updated);
    deliveryNoteApiService.updateDeliveryNote(id, updatedFields).catch(() => { });
  };

  const deleteDeliveryNote = (id: string) => {
    const updated = deliveryNotes.filter((d) => d.id !== id);
    setDeliveryNotes(updated);
    persist('crm_delivery_notes_data', updated);
    deliveryNoteApiService.deleteDeliveryNote(id).catch(() => { });
  };

  // Stock / Purchase Handlers
  const addStockItem = (itemData: Omit<CrmPurchaseStock, 'id' | 'slNo'>) => {
    const newItem: CrmPurchaseStock = {
      ...itemData,
      id: `stk-${Date.now()}`,
      slNo: purchaseStocks.length + 1,
    };
    const updated = [newItem, ...purchaseStocks];
    setPurchaseStocks(updated);
    persist('crm_stocks_data', updated);
    crmInventoryApiService.createInventoryItem({
      id: newItem.id,
      name: newItem.productName,
      code: newItem.sku,
      store: newItem.store,
      supplier: newItem.supplier,
      stock: newItem.quantity,
      purchaseRate: newItem.unitPrice,
    } as any).catch(() => { });
  };

  const updateStockItem = (id: string, updated: Partial<CrmPurchaseStock>) => {
    const list = purchaseStocks.map((s) => (s.id === id ? { ...s, ...updated } : s));
    setPurchaseStocks(list);
    persist('crm_stocks_data', list);
    crmInventoryApiService.updateInventoryItem(id, {
      name: updated.productName,
      code: updated.sku,
      store: updated.store,
      stock: updated.quantity,
      purchaseRate: updated.unitPrice,
    } as any).catch(() => { });
  };

  const deleteStockItem = (id: string) => {
    const list = purchaseStocks.filter((s) => s.id !== id);
    setPurchaseStocks(list);
    persist('crm_stocks_data', list);
    crmInventoryApiService.deleteInventoryItem(id).catch(() => { });
  };

  // Supplier Handlers
  const addSupplier = (supData: Omit<CrmSupplier, 'id' | 'slNo'>) => {
    const newSup: CrmSupplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      slNo: suppliers.length + 1,
    };
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    persist('crm_suppliers_list', updated);
    supplierApiService.createSupplier(newSup).catch(() => { });
  };

  const updateSupplier = (id: string, updated: Partial<CrmSupplier>) => {
    const list = suppliers.map((s) => (s.id === id ? { ...s, ...updated } : s));
    setSuppliers(list);
    persist('crm_suppliers_list', list);
    supplierApiService.updateSupplier(id, updated).catch(() => { });
  };

  const deleteSupplier = (id: string) => {
    const list = suppliers.filter((s) => s.id !== id);
    setSuppliers(list);
    persist('crm_suppliers_list', list);
    supplierApiService.deleteSupplier(id).catch(() => { });
  };

  // Purchase Order Handlers
  const addPurchaseOrder = (poData: Omit<CrmPurchaseOrder, 'id' | 'slNo'>) => {
    const newPo: CrmPurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      slNo: purchaseOrders.length + 1,
    };
    const updated = [newPo, ...purchaseOrders];
    setPurchaseOrders(updated);
    persist('crm_purchase_orders', updated);
    purchaseOrderApiService.createPurchaseOrder(newPo).catch(() => { });
  };

  const updatePurchaseOrder = (id: string, updated: Partial<CrmPurchaseOrder>) => {
    const list = purchaseOrders.map((p) => (p.id === id ? { ...p, ...updated } : p));
    setPurchaseOrders(list);
    persist('crm_purchase_orders', list);
    purchaseOrderApiService.updatePurchaseOrder(id, updated).catch(() => { });
  };

  const deletePurchaseOrder = (id: string) => {
    const list = purchaseOrders.filter((p) => p.id !== id);
    setPurchaseOrders(list);
    persist('crm_purchase_orders', list);
    purchaseOrderApiService.deletePurchaseOrder(id).catch(() => { });
  };

  // Stock Transfer Handlers
  const addStockTransfer = (stData: Omit<CrmStockTransfer, 'id' | 'slNo'>) => {
    const newSt: CrmStockTransfer = {
      ...stData,
      id: `st-${Date.now()}`,
      slNo: stockTransfers.length + 1,
    };
    const updated = [newSt, ...stockTransfers];
    setStockTransfers(updated);
    persist('crm_stock_transfers', updated);
    stockTransferApiService.createStockTransfer(newSt).catch(() => { });
  };

  const deleteStockTransfer = (id: string) => {
    const list = stockTransfers.filter((st) => st.id !== id);
    setStockTransfers(list);
    persist('crm_stock_transfers', list);
    stockTransferApiService.deleteStockTransfer(id).catch(() => { });
  };

  // User Handlers
  const addUser = (userData: Omit<CrmUser, 'id' | 'lastLogin'>) => {
    const newUser: CrmUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Never',
    };
    const updated = [newUser, ...users];
    setUsers(updated);
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Campaign Handlers
  const addCampaign = (campaignData: Omit<CrmCampaign, 'id' | 'slNo'>) => {
    const newCmp: CrmCampaign = {
      ...campaignData,
      id: `cmp-${Date.now()}`,
      slNo: campaigns.length + 1,
    };
    const updated = [...campaigns, newCmp];
    setCampaigns(updated);
    persist('crm_campaigns_data', updated);
  };

  const updateCampaign = (id: string, updated: Partial<CrmCampaign>) => {
    const list = campaigns.map((c) => (c.id === id ? { ...c, ...updated } : c));
    setCampaigns(list);
    persist('crm_campaigns_data', list);
  };

  const toggleCampaignListing = (id: string) => {
    const list = campaigns.map((c) => (c.id === id ? { ...c, listing: !c.listing } : c));
    setCampaigns(list);
    persist('crm_campaigns_data', list);
  };

  const deleteCampaign = (id: string) => {
    const list = campaigns.filter((c) => c.id !== id);
    setCampaigns(list);
    persist('crm_campaigns_data', list);
  };

  return (
    <EnterpriseCrmContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        tasks,
        leads,
        customers,
        salesOpportunities,
        quotations,
        salesOrders,
        invoices,
        proformas,
        receipts,
        deliveryNotes,
        purchaseStocks,
        campaigns,
        users,
        rbacRules,
        globalSearch,
        setGlobalSearch,
        addTask,
        createTask,
        assignTask,
        acceptTask,
        startTask,
        updateTaskProgress,
        completeTask,
        reviewTask,
        addCommentToTask,
        updateTaskStatusWorkflow,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        addLead,
        assignLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        isLeadsLoading,
        leadsError,
        refreshLeads,
        addCustomer,
        assignCustomer,
        updateCustomer,
        deleteCustomer,
        isCustomersLoading,
        customersError,
        refreshCustomers,
        addOpportunity,
        updateOpportunity,
        updateOpportunityStage,
        deleteOpportunity,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToSalesOrder,
        addSalesOrder,
        updateSalesOrder,
        deleteSalesOrder,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addProforma,
        updateProforma,
        deleteProforma,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        addDeliveryNote,
        updateDeliveryNote,
        deleteDeliveryNote,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        suppliers,
        purchaseOrders,
        stockTransfers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        addStockTransfer,
        deleteStockTransfer,
        addUser,
        deleteUser,
        refreshUsers: fetchAuthoritativeUsers,
        addCampaign,
        updateCampaign,
        toggleCampaignListing,
        deleteCampaign,
        clearAllData,
      }}
    >
      {children}
    </EnterpriseCrmContext.Provider>
  );
}

export function useEnterpriseCrm() {
  const context = useContext(EnterpriseCrmContext);
  if (!context) {
    throw new Error('useEnterpriseCrm must be used within EnterpriseCrmProvider');
  }
  return context;
}
