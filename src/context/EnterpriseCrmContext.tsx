'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  CrmReceipt,
  CrmDeliveryNote,
  TaskStatus,
  TaskPriority,
  TaskType,
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
  mockReceipts,
  mockDeliveryNotes,
} from '@/data/mockEnterpriseData';

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
  receipts: CrmReceipt[];
  deliveryNotes: CrmDeliveryNote[];
  purchaseStocks: CrmPurchaseStock[];
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
  addLead: (lead: Omit<CrmLead, 'id' | 'slNo'>) => void;
  assignLead: (leadId: string, employeeName: string, managerName?: string) => void;
  updateLead: (id: string, updated: Partial<CrmLead>) => void;
  deleteLead: (id: string) => void;

  // Customer Actions
  addCustomer: (cust: Omit<CrmCustomer, 'id' | 'slNo'>) => void;
  assignCustomer: (customerId: string, employeeName: string, managerName?: string) => void;
  updateCustomer: (id: string, updated: Partial<CrmCustomer>) => void;
  deleteCustomer: (id: string) => void;

  // Opportunity Actions
  addOpportunity: (opp: Omit<CrmSalesOpportunity, 'id' | 'createdAt'>) => void;
  updateOpportunity: (id: string, updated: Partial<CrmSalesOpportunity>) => void;
  updateOpportunityStage: (id: string, newStage: DealStage) => void;
  deleteOpportunity: (id: string) => void;

  // Quotation Actions
  addQuotation: (quote: Omit<CrmQuotation, 'id'>) => void;
  updateQuotation: (id: string, updated: Partial<CrmQuotation>) => void;
  deleteQuotation: (id: string) => void;

  // Sales Order Actions
  addSalesOrder: (order: Omit<CrmSalesOrder, 'id'>) => void;
  updateSalesOrder: (id: string, updated: Partial<CrmSalesOrder>) => void;
  deleteSalesOrder: (id: string) => void;

  // Invoice Actions
  addInvoice: (inv: Omit<CrmInvoice, 'id'>) => void;
  updateInvoice: (id: string, updated: Partial<CrmInvoice>) => void;
  deleteInvoice: (id: string) => void;

  // Receipt Actions
  addReceipt: (rec: Omit<CrmReceipt, 'id'>) => void;
  deleteReceipt: (id: string) => void;

  // Delivery Note Actions
  addDeliveryNote: (dn: Omit<CrmDeliveryNote, 'id'>) => void;
  deleteDeliveryNote: (id: string) => void;

  // Stock / Purchase
  addStockItem: (item: Omit<CrmPurchaseStock, 'id' | 'slNo'>) => void;
  updateStockItem: (id: string, updated: Partial<CrmPurchaseStock>) => void;
  deleteStockItem: (id: string) => void;

  // User Actions
  addUser: (user: Omit<CrmUser, 'id' | 'lastLogin'>) => void;
  deleteUser: (id: string) => void;

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
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [salesOpportunities, setSalesOpportunities] = useState<CrmSalesOpportunity[]>([]);
  const [quotations, setQuotations] = useState<CrmQuotation[]>([]);
  const [salesOrders, setSalesOrders] = useState<CrmSalesOrder[]>([]);
  const [invoices, setInvoices] = useState<CrmInvoice[]>([]);
  const [receipts, setReceipts] = useState<CrmReceipt[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<CrmDeliveryNote[]>([]);
  const [purchaseStocks, setPurchaseStocks] = useState<CrmPurchaseStock[]>([]);
  const [campaigns, setCampaigns] = useState<CrmCampaign[]>([]);
  const [users, setUsers] = useState<CrmUser[]>(mockUsers);
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
      localStorage.removeItem('crm_receipts_data');
      localStorage.removeItem('crm_delivery_notes_data');
      localStorage.removeItem('crm_campaigns_data');
      localStorage.removeItem('crm_stocks_data');
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
      setReceipts([]);
      setDeliveryNotes([]);
      setCampaigns([]);
      setPurchaseStocks([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to persist state and dispatch live sync events
  const persist = (key: string, data: any, eventName?: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
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
                      : key === 'crm_receipts_data'
                        ? 'crm_receipts_updated'
                        : key === 'crm_delivery_notes_data'
                          ? 'crm_delivery_notes_updated'
                          : key === 'crm_campaigns_data'
                            ? 'crm_campaigns_updated'
                            : key === 'crm_stocks_data'
                              ? 'crm_stocks_updated'
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

  // Load persisted data on mount & subscribe to live mutations across modules
  useEffect(() => {
    const loadAllData = () => {
      try {
        const storedLeads = localStorage.getItem('crm_leads_data');
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          setLeads(Array.isArray(parsed) ? parsed : []);
        } else {
          setLeads([]);
        }

        const storedCustomers = localStorage.getItem('crm_customers_data');
        if (storedCustomers) {
          const parsed = JSON.parse(storedCustomers);
          setCustomers(Array.isArray(parsed) ? parsed : []);
        } else {
          setCustomers([]);
        }

        const storedOpps = localStorage.getItem('crm_opportunities_data');
        if (storedOpps) {
          const parsed = JSON.parse(storedOpps);
          setSalesOpportunities(Array.isArray(parsed) ? parsed : []);
        } else {
          setSalesOpportunities([]);
        }

        const storedTasks = localStorage.getItem('crm_tasks_data');
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          setTasks(Array.isArray(parsed) ? parsed : []);
        } else {
          setTasks([]);
        }

        const storedQuotes = localStorage.getItem('crm_quotations_data');
        if (storedQuotes) {
          const parsed = JSON.parse(storedQuotes);
          setQuotations(Array.isArray(parsed) ? parsed : []);
        } else {
          setQuotations([]);
        }

        const storedOrders = localStorage.getItem('crm_orders_data');
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          setSalesOrders(Array.isArray(parsed) ? parsed : []);
        } else {
          setSalesOrders([]);
        }

        const storedInvoices = localStorage.getItem('crm_invoices_data');
        if (storedInvoices) {
          const parsed = JSON.parse(storedInvoices);
          setInvoices(Array.isArray(parsed) ? parsed : []);
        } else {
          setInvoices([]);
        }

        const storedReceipts = localStorage.getItem('crm_receipts_data');
        if (storedReceipts) {
          const parsed = JSON.parse(storedReceipts);
          setReceipts(Array.isArray(parsed) ? parsed : []);
        } else {
          setReceipts([]);
        }

        const storedDeliveryNotes = localStorage.getItem('crm_delivery_notes_data');
        if (storedDeliveryNotes) {
          const parsed = JSON.parse(storedDeliveryNotes);
          setDeliveryNotes(Array.isArray(parsed) ? parsed : []);
        } else {
          setDeliveryNotes([]);
        }

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

        // Load dynamic shared users
        const cezconRaw = localStorage.getItem('cezcon_crm_users_list');
        const adminRaw = localStorage.getItem('crm_admin_accounts_list');
        const loadedUsers: CrmUser[] = [];
        if (cezconRaw) {
          const parsed = JSON.parse(cezconRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: any) => {
              loadedUsers.push({
                id: String(u.id).startsWith('usr_') || String(u.id).startsWith('mgr_') || String(u.id).startsWith('emp_') ? String(u.id) : `usr_${u.id}`,
                name: u.name,
                email: u.email || `${u.username}@cooltechuae.com`,
                role: (u.isAdmin ? 'Admin' : u.profileType?.toLowerCase().includes('manager') ? 'Manager' : 'Employee') as UserRole,
                phone: u.phone || '+971 50 123 4567',
                department: u.department || u.profileType || 'Sales',
                status: u.status === 'Inactive' ? 'Inactive' : 'Active',
                lastLogin: u.lastLogin || 'Recent',
                avatar: u.avatarImage || u.avatarUrl || u.avatar || '',
              });
            });
          }
        }
        if (adminRaw) {
          const parsedAdmins = JSON.parse(adminRaw);
          if (Array.isArray(parsedAdmins)) {
            parsedAdmins.forEach((a: any) => {
              if (!loadedUsers.some((u) => u.email.toLowerCase() === (a.email || '').toLowerCase())) {
                loadedUsers.push({
                  id: a.id || `adm_${Date.now()}`,
                  name: a.name,
                  email: a.email,
                  role: 'Admin',
                  phone: a.phone || '+971 55 485 3829',
                  department: a.department || 'Management',
                  status: a.status || 'Active',
                  lastLogin: a.lastLogin || 'Recent',
                  avatar: a.avatar || a.avatarUrl || a.avatarImage || '',
                });
              }
            });
          }
        }
        if (loadedUsers.length > 0) {
          setUsers(loadedUsers);
        } else {
          setUsers(mockUsers);
        }
      } catch (e) {
        console.error('EnterpriseCrmContext loadAllData error:', e);
      }
    };

    loadAllData();

    const eventNames = [
      'storage',
      'crm_tasks_updated',
      'crm_leads_updated',
      'crm_customers_updated',
      'crm_opportunities_updated',
      'crm_quotations_updated',
      'crm_orders_updated',
      'crm_invoices_updated',
      'crm_receipts_updated',
      'crm_delivery_notes_updated',
      'crm_stocks_updated',
      'crm_campaigns_updated',
      'crm_users_updated',
      'crm_admins_updated',
      'crm_team_updated',
      'crm_profiles_updated',
      'crm_data_updated',
    ];

    eventNames.forEach((evt) => window.addEventListener(evt, loadAllData));
    return () => {
      eventNames.forEach((evt) => window.removeEventListener(evt, loadAllData));
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
    };
    const updated = [newTask, ...currentTasks.filter((t) => t.id !== uniqueId)];
    setTasks(updated);
    persist('crm_tasks_data', updated);
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
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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

  const reviewTask = (taskId: string, managerName = 'Alex Rivera (Operations Manager)', notes?: string) => {
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
  };

  const updateTask = (id: string, updated: Partial<CrmTask>) => {
    let currentTasks = tasks;
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) currentTasks = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const list = currentTasks.map((t) => (t.id === id ? { ...t, ...updated } : t));
    setTasks(list);
    persist('crm_tasks_data', list);
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
  };

  // Lead Handlers
  const addLead = (leadData: Omit<CrmLead, 'id' | 'slNo'>) => {
    const newLead: CrmLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      slNo: leads.length + 1,
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    persist('crm_leads_data', updated);
  };

  const assignLead = (leadId: string, employeeName: string, managerName = 'Alex Rivera (Operations Manager)') => {
    const list = leads.map((l) => {
      if (l.id !== leadId) return l;
      return {
        ...l,
        assignedEmployee: employeeName,
        assignedManager: managerName,
        owner: employeeName,
        leadAssigned: { name: employeeName, avatar: l.leadAssigned?.avatar },
        status: l.status === 'New' ? 'Qualified' : l.status,
        lastActivity: `Assigned to ${employeeName}`,
        lastActivityDate: new Date().toISOString().split('T')[0],
      };
    });
    setLeads(list);
    persist('crm_leads_data', list);
  };

  const updateLead = (id: string, updated: Partial<CrmLead>) => {
    const list = leads.map((l) => (l.id === id ? { ...l, ...updated } : l));
    setLeads(list);
    persist('crm_leads_data', list);
  };

  const deleteLead = (id: string) => {
    const list = leads.filter((l) => l.id !== id);
    setLeads(list);
    persist('crm_leads_data', list);
  };

  // Customer Handlers
  const addCustomer = (custData: Omit<CrmCustomer, 'id' | 'slNo'>) => {
    const newCust: CrmCustomer = {
      ...custData,
      id: `cust-${Date.now()}`,
      slNo: customers.length + 1,
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    persist('crm_customers_data', updated);
  };

  const assignCustomer = (customerId: string, employeeName: string, managerName = 'Alex Rivera (Operations Manager)') => {
    const list = customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        owner: employeeName,
        lastActivity: `Assigned to ${employeeName}`,
      };
    });
    setCustomers(list);
    persist('crm_customers_data', list);
  };

  const updateCustomer = (id: string, updated: Partial<CrmCustomer>) => {
    const list = customers.map((c) => (c.id === id ? { ...c, ...updated } : c));
    setCustomers(list);
    persist('crm_customers_data', list);
  };

  const deleteCustomer = (id: string) => {
    const list = customers.filter((c) => c.id !== id);
    setCustomers(list);
    persist('crm_customers_data', list);
  };

  // Opportunity Handlers
  const addOpportunity = (oppData: Omit<CrmSalesOpportunity, 'id' | 'createdAt'>) => {
    const newOpp: CrmSalesOpportunity = {
      ...oppData,
      id: `opp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      opportunityCode: `OPP-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newOpp, ...salesOpportunities];
    setSalesOpportunities(updated);
    persist('crm_opportunities_data', updated);
  };

  const updateOpportunity = (id: string, updated: Partial<CrmSalesOpportunity>) => {
    const list = salesOpportunities.map((o) => (o.id === id ? { ...o, ...updated } : o));
    setSalesOpportunities(list);
    persist('crm_opportunities_data', list);
  };

  const updateOpportunityStage = (id: string, newStage: DealStage) => {
    const list = salesOpportunities.map((opp) => (opp.id === id ? { ...opp, stage: newStage } : opp));
    setSalesOpportunities(list);
    persist('crm_opportunities_data', list);
  };

  const deleteOpportunity = (id: string) => {
    const list = salesOpportunities.filter((opp) => opp.id !== id);
    setSalesOpportunities(list);
    persist('crm_opportunities_data', list);
  };

  // Quotation Handlers
  const addQuotation = (quoteData: Omit<CrmQuotation, 'id'>) => {
    const newQuote: CrmQuotation = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quotationNumber: quoteData.quotationNumber || `QT-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newQuote, ...quotations];
    setQuotations(updated);
    persist('crm_quotations_data', updated);
  };

  const updateQuotation = (id: string, updated: Partial<CrmQuotation>) => {
    const list = quotations.map((q) => (q.id === id ? { ...q, ...updated } : q));
    setQuotations(list);
    persist('crm_quotations_data', list);
  };

  const deleteQuotation = (id: string) => {
    const list = quotations.filter((q) => q.id !== id);
    setQuotations(list);
    persist('crm_quotations_data', list);
  };

  // Sales Order Handlers
  const addSalesOrder = (orderData: Omit<CrmSalesOrder, 'id'>) => {
    const newOrder: CrmSalesOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: orderData.orderNumber || `SO-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newOrder, ...salesOrders];
    setSalesOrders(updated);
    persist('crm_orders_data', updated);
  };

  const updateSalesOrder = (id: string, updated: Partial<CrmSalesOrder>) => {
    const list = salesOrders.map((o) => (o.id === id ? { ...o, ...updated } : o));
    setSalesOrders(list);
    persist('crm_orders_data', list);
  };

  const deleteSalesOrder = (id: string) => {
    const list = salesOrders.filter((o) => o.id !== id);
    setSalesOrders(list);
    persist('crm_orders_data', list);
  };

  // Invoice Handlers
  const addInvoice = (invData: Omit<CrmInvoice, 'id'>) => {
    const newInv: CrmInvoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: invData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    persist('crm_invoices_data', updated);
  };

  const updateInvoice = (id: string, updated: Partial<CrmInvoice>) => {
    const list = invoices.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv));
    setInvoices(list);
    persist('crm_invoices_data', list);
  };

  const deleteInvoice = (id: string) => {
    const list = invoices.filter((inv) => inv.id !== id);
    setInvoices(list);
    persist('crm_invoices_data', list);
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
  };

  const deleteReceipt = (id: string) => {
    const updated = receipts.filter((r) => r.id !== id);
    setReceipts(updated);
    persist('crm_receipts_data', updated);
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
  };

  const deleteDeliveryNote = (id: string) => {
    const updated = deliveryNotes.filter((d) => d.id !== id);
    setDeliveryNotes(updated);
    persist('crm_delivery_notes_data', updated);
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
  };

  const updateStockItem = (id: string, updated: Partial<CrmPurchaseStock>) => {
    const list = purchaseStocks.map((s) => (s.id === id ? { ...s, ...updated } : s));
    setPurchaseStocks(list);
    persist('crm_stocks_data', list);
  };

  const deleteStockItem = (id: string) => {
    const list = purchaseStocks.filter((s) => s.id !== id);
    setPurchaseStocks(list);
    persist('crm_stocks_data', list);
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
        deleteLead,
        addCustomer,
        assignCustomer,
        updateCustomer,
        deleteCustomer,
        addOpportunity,
        updateOpportunity,
        updateOpportunityStage,
        deleteOpportunity,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        addSalesOrder,
        updateSalesOrder,
        deleteSalesOrder,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addReceipt,
        deleteReceipt,
        addDeliveryNote,
        deleteDeliveryNote,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        addUser,
        deleteUser,
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
