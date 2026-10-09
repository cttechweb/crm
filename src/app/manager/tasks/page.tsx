'use client';

import React, { useState, Suspense, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  CheckCircle2,
  MapPin,
  Building2,
  Phone,
  Calendar,
  X,
  ArrowLeft,
  Trash2,
  CheckSquare,
  User,
  Clock,
  Briefcase,
  Layers,
  Eye,
  Edit2,
  MoreVertical,
  Settings,
  AlertTriangle,
  FileText,
  Tag,
  Paperclip,
  UploadCloud,
  Folder,
  Info,
  RotateCcw,
  Shield,
  Wrench,
  List as ListIcon,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { CrmTask, TaskPriority, TaskStatus } from '@/types/enterprise-crm';

const OFFICE_TERRITORIES = [
  'Dubai Corporate HQ (Main Sales Desk)',
  'Abu Dhabi Commercial Hub (Regional Desk)',
  'Northern Emirates Branch (Trade Center)',
  'Global Key Accounts (Executive Suite)',
  'Remote / Virtual Desk',
];

const SALES_CATEGORIES = [
  'Client Quotation Presentation',
  'Deal Follow-up & Nurturing',
  'Client Meeting & Sales Pitch',
  'Product Demo & Presentation',
  'Commercial Contract Review',
  'Customer Discovery Call',
  'Site Survey & Measurement',
];

const MARKETING_CATEGORIES = [
  'Marketing Campaign Planning',
  'Lead Generation & Inbound Follow-up',
  'Content Creation & Design Assets',
  'WhatsApp & Email Broadcast Dispatch',
  'Social Media & Digital Ads Management',
  'Event & Trade Show Preparation',
  'Market Research & Competitor Analysis',
];

const PURCHASE_CATEGORIES = [
  'Vendor Quotation & Pricing Analysis',
  'Purchase Order (PO) Processing',
  'Material Quality & Delivery Inspection',
  'Supplier Contract Negotiation',
  'Stock Inventory Reconciliation',
];

const OPERATIONS_CATEGORIES = [
  'Site Maintenance & Repair Order',
  'Equipment Installation & Commissioning',
  'AMC Preventive Maintenance Inspection',
  'Emergency Breakdown Dispatch',
  'Technical Site Inspection & Audit',
];

const DEFAULT_CATEGORIES = [
  'Client Follow-up & Task Execution',
  'Commercial Proposal Presentation',
  'Project Deliverable & Milestone',
  'Quality Audit & Review',
  'Customer Success & Support',
];

// Fallback Employees Per Department
const FALLBACK_SALES_EMPLOYEES = [
  { id: 'emp_shaheer_001', name: 'Shaheer', role: 'Sales Executive', department: 'Sales Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 776 5432', type: 'Sales Executive', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'emp_adhil_001', name: 'Muhammed Adhil', role: 'Sales Executive', department: 'Sales Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 56 881 1334', type: 'Sales Executive', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'emp_1', name: 'Employee 1', role: 'Sales Executive', department: 'Sales Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 111 0001', type: 'Sales Executive', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'emp_2', name: 'Employee 2', role: 'Sales Executive', department: 'Sales Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 111 0002', type: 'Sales Executive', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'emp_3', name: 'Employee 3', role: 'Sales Executive', department: 'Sales Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 111 0003', type: 'Sales Executive', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
];

const FALLBACK_MARKETING_EMPLOYEES = [
  { id: 'emp_shameem_001', name: 'Shameem', role: 'Marketing Executive', department: 'Marketing Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 52 443 8901', type: 'Marketing Employee', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'emp_arun_001', name: 'Arun', role: 'Marketing Specialist', department: 'Marketing Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 54 321 0987', type: 'Marketing Employee', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { id: 'emp_7', name: 'Employee 7', role: 'Marketing Specialist', department: 'Marketing Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 333 0007', type: 'Marketing Employee', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { id: 'emp_8', name: 'Employee 8', role: 'Marketing Executive', department: 'Marketing Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 333 0008', type: 'Marketing Employee', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
];

const FALLBACK_PURCHASE_EMPLOYEES = [
  { id: 'emp_4', name: 'Employee 4', role: 'Purchase Officer', department: 'Purchase Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 222 0004', type: 'Purchase Employee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'emp_5', name: 'Employee 5', role: 'Purchase Specialist', department: 'Purchase Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 222 0005', type: 'Purchase Employee', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: 'emp_6', name: 'Employee 6', role: 'Inventory Officer', department: 'Purchase Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 222 0006', type: 'Purchase Employee', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
];

const FALLBACK_OPERATIONS_EMPLOYEES = [
  { id: 'emp_9', name: 'Employee 9', role: 'Operations Specialist', department: 'Operations Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 444 0009', type: 'Operations Employee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'emp_10', name: 'Employee 10', role: 'Field Technician', department: 'Operations Department', territory: 'Dubai Corporate HQ (Main Sales Desk)', phone: '+971 50 444 0010', type: 'Operations Employee', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
];

function ManagerTasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') || 'All';
  const viewParam = searchParams.get('view');
  const { tasks, createTask, updateTask, deleteTask } = useEnterpriseCrm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [deptFilter, setDeptFilter] = useState('All');
  const [isAssignViewOpen, setIsAssignViewOpen] = useState(viewParam === 'assign');

  // Modals & Full Page Views for View, Edit, Delete
  const [viewingTask, setViewingTask] = useState<CrmTask | null>(null);
  const [editingTask, setEditingTask] = useState<CrmTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<CrmTask | null>(null);
  const [actionMenuTaskId, setActionMenuTaskId] = useState<string | null>(null);

  // Cezcon UI state for Task Details
  const [taskDetailTab, setTaskDetailTab] = useState<'details' | 'history'>('details');
  const [showCreatedNotice, setShowCreatedNotice] = useState(true);
  const [attachmentViewMode, setAttachmentViewMode] = useState<'list' | 'slider'>('list');
  const [taskAttachments, setTaskAttachments] = useState<Array<{ name: string; size: string; type: string }>>([]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [usersVersion, setUsersVersion] = useState(0);
  const [tasksVersion, setTasksVersion] = useState(0);

  // Current Logged-in Manager Info with live client hydration & real-time listeners
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(() => authMockService.getCurrentUser());

  useEffect(() => {
    const syncUser = () => {
      const u = authMockService.getCurrentUser();
      if (u) setCurrentUser(u);
    };
    syncUser();
    const unsub = authMockService.onAuthStateChanged((u) => {
      if (u) setCurrentUser(u);
    });
    window.addEventListener('storage', syncUser);
    window.addEventListener('crm_auth_updated', syncUser);
    window.addEventListener('crm_users_updated', syncUser);
    return () => {
      unsub();
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('crm_auth_updated', syncUser);
      window.removeEventListener('crm_users_updated', syncUser);
    };
  }, []);

  useEffect(() => {
    const handleTaskChange = () => {
      setTasksVersion((v) => v + 1);
    };
    window.addEventListener('crm_tasks_updated', handleTaskChange);
    window.addEventListener('crm_data_updated', handleTaskChange);
    window.addEventListener('storage', handleTaskChange);
    return () => {
      window.removeEventListener('crm_tasks_updated', handleTaskChange);
      window.removeEventListener('crm_data_updated', handleTaskChange);
      window.removeEventListener('storage', handleTaskChange);
    };
  }, []);

  useEffect(() => {
    if (viewParam === 'assign') {
      setIsAssignViewOpen(true);
    } else if (viewParam === 'all') {
      setIsAssignViewOpen(false);
    }
  }, [viewParam]);

  const currentManagerId = currentUser?.id || 'mgr_1';

  // Comprehensive Manager Role & Domain Determination
  const roleStr = String(currentUser?.role || '').toLowerCase();
  const profileStr = String(currentUser?.profileType || '').toLowerCase();
  const typeStr = String(currentUser?.managerType || '').toLowerCase();
  const deptStr = String(currentUser?.department || '').toLowerCase();
  const desigStr = String(currentUser?.designation || '').toLowerCase();
  const emailStr = String(currentUser?.email || '').toLowerCase();
  const nameStr = String(currentUser?.name || '').toLowerCase();
  const curMgrId = String(currentUser?.id || '').toLowerCase();

  const isSuperAdminOrAdmin =
    roleStr === 'super_admin' ||
    roleStr === 'admin' ||
    profileStr.includes('admin') ||
    emailStr.includes('admin');

  let isMarketingManager = false;
  let isPurchaseManager = false;
  let isOperationsManager = false;
  let isSalesManager = false;

  if (!isSuperAdminOrAdmin) {
    if (
      typeStr.includes('market') ||
      deptStr.includes('market') ||
      desigStr.includes('market') ||
      profileStr.includes('market') ||
      emailStr.includes('afsal') ||
      emailStr.includes('manager3') ||
      nameStr.includes('afsal') ||
      curMgrId === 'mgr_3' ||
      curMgrId === 'usr_afsal_001' ||
      curMgrId.includes('afsal')
    ) {
      isMarketingManager = true;
    } else if (
      typeStr.includes('purchase') ||
      deptStr.includes('purchase') ||
      desigStr.includes('purchase') ||
      profileStr.includes('purchase') ||
      emailStr.includes('manager2') ||
      curMgrId === 'mgr_2'
    ) {
      isPurchaseManager = true;
    } else if (
      typeStr.includes('operation') ||
      deptStr.includes('operation') ||
      desigStr.includes('operation') ||
      profileStr.includes('operation') ||
      emailStr.includes('manager4') ||
      curMgrId === 'mgr_4'
    ) {
      isOperationsManager = true;
    } else if (
      typeStr.includes('sales') ||
      deptStr.includes('sales') ||
      desigStr.includes('sales') ||
      profileStr.includes('sales') ||
      emailStr.includes('shibil') ||
      nameStr.includes('shibil') ||
      curMgrId === 'mgr_1' ||
      curMgrId.includes('shibil')
    ) {
      isSalesManager = true;
    } else {
      if (desigStr.includes('market') || profileStr.includes('market') || deptStr.includes('market')) {
        isMarketingManager = true;
      } else {
        isSalesManager = true; // Default fallback to Sales Manager
      }
    }
  }

  const domainLabel = isMarketingManager
    ? 'Marketing'
    : isPurchaseManager
      ? 'Purchase'
      : isOperationsManager
        ? 'Operations'
        : isSalesManager
          ? 'Sales'
          : 'Enterprise';

  const taskCategories = useMemo(() => {
    if (isMarketingManager) return MARKETING_CATEGORIES;
    if (isPurchaseManager) return PURCHASE_CATEGORIES;
    if (isOperationsManager) return OPERATIONS_CATEGORIES;
    if (isSalesManager) return SALES_CATEGORIES;
    return DEFAULT_CATEGORIES;
  }, [isSalesManager, isMarketingManager, isPurchaseManager, isOperationsManager]);

  // Base standard departments per manager domain
  const defaultDomainDepartments = useMemo(() => {
    if (isSalesManager) {
      return ['Sales Department', 'Direct Sales & Follow-up', 'Enterprise Key Accounts', 'Commercial Quotations'];
    }
    if (isMarketingManager) {
      return ['Marketing Department', 'Digital Marketing & Social Media', 'Lead Generation & Campaigns', 'Brand & Advertising'];
    }
    if (isPurchaseManager) {
      return ['Purchase Department', 'Vendor Procurement', 'Stock & Inventory Management'];
    }
    if (isOperationsManager) {
      return ['Operations Department', 'Technical Maintenance', 'Field Service & Installation'];
    }
    return ['Sales Department', 'Marketing Department', 'Purchase Department', 'Operations Department'];
  }, [isSalesManager, isMarketingManager, isPurchaseManager, isOperationsManager]);

  // Dynamic Departments State - Filtered strictly by Manager Domain
  const [customDepartments, setCustomDepartments] = useState<string[]>([]);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Combined Active Departments for Current Manager
  const activeDepartments = useMemo(() => {
    const combined = Array.from(new Set([...defaultDomainDepartments, ...customDepartments]));

    // Strict domain filtering: exclude other departments
    if (isSalesManager) {
      return combined.filter(
        (d) =>
          !d.toLowerCase().includes('market') &&
          !d.toLowerCase().includes('purchase') &&
          !d.toLowerCase().includes('operation')
      );
    }
    if (isMarketingManager) {
      return combined.filter(
        (d) =>
          !d.toLowerCase().includes('sales') &&
          !d.toLowerCase().includes('purchase') &&
          !d.toLowerCase().includes('operation')
      );
    }
    if (isPurchaseManager) {
      return combined.filter(
        (d) =>
          !d.toLowerCase().includes('sales') &&
          !d.toLowerCase().includes('market') &&
          !d.toLowerCase().includes('operation')
      );
    }
    if (isOperationsManager) {
      return combined.filter(
        (d) =>
          !d.toLowerCase().includes('sales') &&
          !d.toLowerCase().includes('market') &&
          !d.toLowerCase().includes('purchase')
      );
    }
    return combined;
  }, [defaultDomainDepartments, customDepartments, isSalesManager, isMarketingManager, isPurchaseManager, isOperationsManager]);

  // Quick Add Employee sub-modal state
  const [isQuickAddEmployeeOpen, setIsQuickAddEmployeeOpen] = useState(false);
  const [quickEmpForm, setQuickEmpForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    designation: isMarketingManager
      ? 'Marketing Executive'
      : isPurchaseManager
        ? 'Purchase Officer'
        : isOperationsManager
          ? 'Operations Technician'
          : 'Sales Representative',
    department: `${domainLabel} Department`,
    location: 'Dubai Corporate HQ (Main Sales Desk)',
    password: 'employee123',
  });

  // Listen for real-time user database and department updates
  React.useEffect(() => {
    const handleUpdate = () => {
      setUsersVersion((v) => v + 1);
      try {
        const storedDepts = localStorage.getItem('cezcon_crm_departments_list');
        if (storedDepts) {
          const parsed = JSON.parse(storedDepts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCustomDepartments(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    handleUpdate();
    window.addEventListener('crm_users_updated', handleUpdate);
    window.addEventListener('crm_departments_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('crm_users_updated', handleUpdate);
      window.removeEventListener('crm_departments_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Form state for task assignment - strictly defaulted to current manager's department
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    customerName: '',
    dealReference: '',
    department: `${domainLabel} Department`,
    assignedTo: '',
    employeePhone: '',
    employeeRole: '',
    location: 'Dubai Corporate HQ (Main Sales Desk)',
    priority: 'Medium' as 'High' | 'Medium' | 'Low' | 'Urgent',
    category: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '04:00 PM',
    instructions: '',
  });

  // Form state for editing task
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    customerName: '',
    dealReference: '',
    department: '',
    assignedTo: '',
    employeePhone: '',
    employeeRole: '',
    location: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low' | 'Urgent',
    status: 'Assigned' as TaskStatus,
    category: '',
    dueDate: '',
    dueTime: '',
    instructions: '',
  });

  // Auto-sync Quick Employee form and Task form defaults with active manager domain
  React.useEffect(() => {
    setNewTaskForm((prev) => {
      if (!prev.department || !prev.department.toLowerCase().includes(domainLabel.toLowerCase())) {
        return { ...prev, department: `${domainLabel} Department` };
      }
      return prev;
    });

    setQuickEmpForm((prev) => ({
      ...prev,
      designation: isMarketingManager
        ? 'Marketing Executive'
        : isPurchaseManager
          ? 'Purchase Officer'
          : isOperationsManager
            ? 'Operations Technician'
            : 'Sales Representative',
      department: `${domainLabel} Department`,
    }));
  }, [domainLabel, isMarketingManager, isPurchaseManager, isOperationsManager]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) {
      showToast('Please enter a department name.');
      return;
    }
    const updated = Array.from(new Set([...customDepartments, trimmed]));
    setCustomDepartments(updated);
    try {
      localStorage.setItem('cezcon_crm_departments_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_departments_updated'));
      window.dispatchEvent(new Event('crm_users_updated'));
    } catch (err) {
      console.error(err);
    }
    setNewTaskForm((prev) => ({ ...prev, department: trimmed }));
    setIsAddDeptModalOpen(false);
    setNewDeptName('');
    showToast(`Department "${trimmed}" added!`);
  };

  const handleDeleteDepartment = (deptToDelete: string) => {
    const updated = customDepartments.filter((d) => d !== deptToDelete);
    setCustomDepartments(updated);
    try {
      localStorage.setItem('cezcon_crm_departments_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_departments_updated'));
      window.dispatchEvent(new Event('crm_users_updated'));
    } catch (err) {
      console.error(err);
    }
    if (newTaskForm.department === deptToDelete) {
      setNewTaskForm((prev) => ({ ...prev, department: `${domainLabel} Department` }));
    }
    showToast(`Department "${deptToDelete}" removed.`);
  };

  // STRICT Dynamic Employee List Filtered Exclusively By Manager Department / Role
  const availableEmployees = useMemo(() => {
    let dynamicList: Array<{
      id?: string | number;
      name: string;
      email?: string;
      role: string;
      department: string;
      territory: string;
      phone: string;
      avatar?: string;
      type: string;
    }> = [];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cezcon_crm_users_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const curMgrId = String(currentManagerId || '').toLowerCase();
            const curMgrEmail = String(currentUser?.email || '').toLowerCase();
            const curMgrName = String(currentUser?.name || '').toLowerCase();

            const filteredUsers = parsed.filter((u: any) => {
              const uEmpType = String(u.employeeType || '').toLowerCase();
              const uProfile = String(u.profileType || '').toLowerCase();
              const uDept = String(u.department || '').toLowerCase();
              const uDesig = String(u.designation || '').toLowerCase();
              const uRole = String(u.role || '').toLowerCase();
              const uName = String(u.name || '').toLowerCase();
              const uEmail = String(u.email || '').toLowerCase();
              const uId = String(u.id || '').toLowerCase();
              const uMgrId = String(u.managerId || u.reportingManagerId || '').toLowerCase();

              const isEmp =
                uProfile === 'employee' ||
                uProfile === 'worker' ||
                uRole === 'employee' ||
                u.isWorker ||
                (!u.isAdmin &&
                  !uProfile.includes('manager') &&
                  !uProfile.includes('admin') &&
                  !uRole.includes('manager') &&
                  !uRole.includes('admin'));

              if (!isEmp) return false;

              // Manager direct hierarchy match
              const matchesDirectManager =
                uMgrId.length > 0 &&
                (uMgrId === curMgrId ||
                  `usr_${uMgrId}` === curMgrId ||
                  uMgrId === curMgrId.replace('usr_', '') ||
                  uMgrId === curMgrEmail ||
                  uMgrId === curMgrName ||
                  (isMarketingManager && (uMgrId.includes('afsal') || uMgrId === 'mgr_3' || uMgrId === '3' || uMgrId.includes('manager3'))) ||
                  (isSalesManager && (uMgrId.includes('shibil') || uMgrId === 'mgr_1' || uMgrId === '1' || uMgrId.includes('manager1'))) ||
                  (isPurchaseManager && (uMgrId.includes('manager2') || uMgrId === 'mgr_2' || uMgrId === '2')) ||
                  (isOperationsManager && (uMgrId.includes('manager4') || uMgrId === 'mgr_4' || uMgrId === '4')));

              // Strict Department Categorization
              const isEmpMarketing =
                uEmpType.includes('market') ||
                uDept.includes('market') ||
                uDesig.includes('market') ||
                uProfile.includes('market') ||
                uId === 'emp_7' ||
                uId === 'emp_8' ||
                uId === 'emp_arun_001' ||
                uId === 'emp_shameem_001' ||
                uId.includes('arun') ||
                uId.includes('shameem') ||
                uName.includes('arun') ||
                uName.includes('shameem') ||
                uName.includes('marketing') ||
                uEmail.includes('arun') ||
                uEmail.includes('shameem') ||
                uEmail.includes('employee7') ||
                uEmail.includes('employee8') ||
                (isMarketingManager && matchesDirectManager);

              const isEmpPurchase =
                !isEmpMarketing &&
                (uEmpType.includes('purchase') ||
                  uDept.includes('purchase') ||
                  uDesig.includes('purchase') ||
                  uProfile.includes('purchase') ||
                  uId === 'emp_4' ||
                  uId === 'emp_5' ||
                  uId === 'emp_6' ||
                  uName.includes('purchase') ||
                  uEmail.includes('employee4') ||
                  uEmail.includes('employee5') ||
                  uEmail.includes('employee6') ||
                  (isPurchaseManager && matchesDirectManager));

              const isEmpOperations =
                !isEmpMarketing &&
                !isEmpPurchase &&
                (uEmpType.includes('operation') ||
                  uEmpType.includes('service') ||
                  uDept.includes('operation') ||
                  uDept.includes('service') ||
                  uDesig.includes('operation') ||
                  uDesig.includes('service') ||
                  uProfile.includes('operation') ||
                  uProfile.includes('service') ||
                  uId === 'emp_9' ||
                  uId === 'emp_10' ||
                  uName.includes('operation') ||
                  uEmail.includes('employee9') ||
                  uEmail.includes('employee10') ||
                  (isOperationsManager && matchesDirectManager));

              const isEmpSales =
                !isEmpMarketing &&
                !isEmpPurchase &&
                !isEmpOperations &&
                (uEmpType.includes('sales') ||
                  uDept.includes('sales') ||
                  uDesig.includes('sales') ||
                  uProfile.includes('sales') ||
                  uId === 'emp_1' ||
                  uId === 'emp_2' ||
                  uId === 'emp_3' ||
                  uId === 'emp_shaheer_001' ||
                  uId === 'emp_adhil_001' ||
                  uName.includes('shaheer') ||
                  uName.includes('adhil') ||
                  uEmail.includes('shaheer') ||
                  uEmail.includes('adhil') ||
                  uEmail.includes('employee1') ||
                  uEmail.includes('employee2') ||
                  uEmail.includes('employee3') ||
                  (isSalesManager && matchesDirectManager));

              if (isSuperAdminOrAdmin) return true;
              if (isMarketingManager) return isEmpMarketing;
              if (isSalesManager) return isEmpSales;
              if (isPurchaseManager) return isEmpPurchase;
              if (isOperationsManager) return isEmpOperations;

              return false;
            });

            dynamicList = filteredUsers.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email || `${u.username || 'user'}@company.com`,
              role: u.designation || u.employeeType || `${domainLabel} Representative`,
              department: u.department || `${domainLabel} Department`,
              territory: u.location || 'Dubai Corporate HQ (Main Sales Desk)',
              phone: u.phone || u.mobile || '+971 50 123 4567',
              avatar: u.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              type: u.employeeType || `${domainLabel} Employee`,
            }));
          }
        }
      } catch (e) {
        console.error('Error parsing cezcon_crm_users_list:', e);
      }
    }

    // If dynamic list has items, use it; otherwise provide department-specific default team members
    if (dynamicList.length > 0) {
      return dynamicList;
    }

    if (isMarketingManager) return FALLBACK_MARKETING_EMPLOYEES;
    if (isSalesManager) return FALLBACK_SALES_EMPLOYEES;
    if (isPurchaseManager) return FALLBACK_PURCHASE_EMPLOYEES;
    if (isOperationsManager) return FALLBACK_OPERATIONS_EMPLOYEES;

    return FALLBACK_SALES_EMPLOYEES;
  }, [
    usersVersion,
    isSuperAdminOrAdmin,
    isSalesManager,
    isMarketingManager,
    isPurchaseManager,
    isOperationsManager,
    domainLabel,
    currentManagerId,
    currentUser,
  ]);

  const handleEmployeeSelect = (empName: string) => {
    if (empName === '__add_new__') {
      setIsQuickAddEmployeeOpen(true);
      return;
    }
    const selected = availableEmployees.find((w) => w.name === empName);
    if (selected) {
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: selected.name,
        department: selected.department || prev.department,
        employeePhone: selected.phone,
        employeeRole: selected.role,
        location: selected.territory || prev.location,
      }));
    } else {
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: empName,
      }));
    }
  };

  const handleQuickAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmpForm.name.trim() || !quickEmpForm.email.trim()) {
      showToast('Please enter both employee name and email.');
      return;
    }

    try {
      const stored = localStorage.getItem('cezcon_crm_users_list');
      let currentList: any[] = [];
      if (stored) {
        currentList = JSON.parse(stored);
        if (!Array.isArray(currentList)) currentList = [];
      }

      const newId = `usr_${Date.now()}`;
      const defaultEmpType = isMarketingManager
        ? 'Marketing Employee'
        : isPurchaseManager
          ? 'Purchase Employee'
          : isOperationsManager
            ? 'Operations Employee'
            : 'Sales Employee';

      const newEmp = {
        id: newId,
        name: quickEmpForm.name.trim(),
        username: quickEmpForm.username.trim() || quickEmpForm.email.trim().split('@')[0],
        email: quickEmpForm.email.trim(),
        phone: quickEmpForm.phone.trim() || '+971 50 000 0000',
        mobile: quickEmpForm.phone.trim() || '+971 50 000 0000',
        designation: quickEmpForm.designation.trim() || `${domainLabel} Representative`,
        department: quickEmpForm.department || `${domainLabel} Department`,
        location: quickEmpForm.location || 'Dubai Corporate HQ (Main Sales Desk)',
        profileType: 'Employee',
        employeeType: defaultEmpType,
        role: 'Employee',
        status: 'Active',
        password: quickEmpForm.password || 'employee123',
        managerId: String(currentManagerId),
        reportingManagerId: String(currentManagerId),
        managerName: currentUser?.name || `${domainLabel} Manager`,
        createdAt: new Date().toISOString(),
      };

      const updated = [newEmp, ...currentList];
      localStorage.setItem('cezcon_crm_users_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_users_updated'));
      setUsersVersion((v) => v + 1);

      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: newEmp.name,
        department: newEmp.department,
        employeePhone: newEmp.phone,
        employeeRole: newEmp.designation,
        location: newEmp.location,
      }));

      setIsQuickAddEmployeeOpen(false);
      setQuickEmpForm({
        name: '',
        email: '',
        username: '',
        phone: '',
        designation: isMarketingManager
          ? 'Marketing Executive'
          : isPurchaseManager
            ? 'Purchase Officer'
            : isOperationsManager
              ? 'Operations Technician'
              : 'Sales Representative',
        department: `${domainLabel} Department`,
        location: 'Dubai Corporate HQ (Main Sales Desk)',
        password: 'employee123',
      });

      showToast(`Employee "${newEmp.name}" added to ${domainLabel} Team!`);
    } catch (err) {
      console.error('Error adding employee:', err);
      showToast('Error saving new employee.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) {
      showToast('Please enter a task title.');
      return;
    }
    if (!newTaskForm.assignedTo) {
      showToast(`Please select a ${domainLabel.toLowerCase()} employee.`);
      return;
    }

    const employee = availableEmployees.find((w) => w.name === newTaskForm.assignedTo);
    const customerDisplayName = newTaskForm.customerName.trim() || 'General Client Objective';
    const taskUnderDisplay = newTaskForm.dealReference
      ? `${newTaskForm.dealReference} / ${customerDisplayName}`
      : customerDisplayName;

    createTask({
      taskDetails: newTaskForm.title.trim(),
      description: newTaskForm.instructions || newTaskForm.location,
      department: newTaskForm.department || `${domainLabel} Department`,
      location: newTaskForm.location,
      siteLocation: newTaskForm.location,
      equipmentTag: newTaskForm.dealReference,
      workerContact: newTaskForm.employeePhone,
      customer: customerDisplayName,
      taskUnder: taskUnderDisplay,
      taskType: newTaskForm.category || 'General Task',
      priority: newTaskForm.priority,
      dueDate: newTaskForm.dueDate || new Date().toISOString().split('T')[0],
      dueTime: newTaskForm.dueTime || '04:00 PM',
      assignedEmployee: newTaskForm.assignedTo,
      assignedBy: currentUser?.name || `${domainLabel} Manager`,
      createdBy: currentUser?.name || `${domainLabel} Manager`,
      status: 'Assigned',
      assignee: {
        name: newTaskForm.assignedTo,
        role: newTaskForm.employeeRole || employee?.role || `${domainLabel} Employee`,
        avatar: employee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });

    setIsAssignViewOpen(false);
    showToast(`Task assigned to ${newTaskForm.assignedTo}!`);
    try {
      router.replace('/manager/tasks?view=all');
      window.dispatchEvent(new Event('crm_tasks_updated'));
      window.dispatchEvent(new Event('crm_data_updated'));
    } catch (err) {
      console.error(err);
    }
    setNewTaskForm({
      title: '',
      customerName: '',
      dealReference: '',
      department: `${domainLabel} Department`,
      assignedTo: '',
      employeePhone: '',
      employeeRole: '',
      location: 'Dubai Corporate HQ (Main Sales Desk)',
      priority: 'Medium',
      category: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '04:00 PM',
      instructions: '',
    });
  };

  // Open Edit Task Modal
  const handleOpenEditModal = (task: CrmTask) => {
    setEditingTask(task);
    setEditFormData({
      id: task.id,
      title: task.taskDetails || task.title || '',
      customerName: task.customer || task.taskUnder || '',
      dealReference: task.equipmentTag || '',
      department: task.department || `${domainLabel} Department`,
      assignedTo: task.assignedEmployee || task.assignee?.name || '',
      employeePhone: task.workerContact || '',
      employeeRole: task.assignee?.role || '',
      location: task.location || task.siteLocation || 'Dubai Corporate HQ (Main Sales Desk)',
      priority: (task.priority as any) || 'Medium',
      status: task.status || 'Assigned',
      category: task.taskType || '',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      dueTime: task.dueTime || '04:00 PM',
      instructions: task.description || '',
    });
  };

  // Save Task Edits
  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const employee = availableEmployees.find((w) => w.name === editFormData.assignedTo);
    const customerDisplayName = editFormData.customerName.trim() || 'General Client Objective';
    const taskUnderDisplay = editFormData.dealReference
      ? `${editFormData.dealReference} / ${customerDisplayName}`
      : customerDisplayName;

    updateTask(editingTask.id, {
      taskDetails: editFormData.title.trim(),
      description: editFormData.instructions || editFormData.location,
      department: editFormData.department || `${domainLabel} Department`,
      location: editFormData.location,
      siteLocation: editFormData.location,
      equipmentTag: editFormData.dealReference,
      workerContact: editFormData.employeePhone,
      customer: customerDisplayName,
      taskUnder: taskUnderDisplay,
      taskType: editFormData.category || 'General Task',
      priority: editFormData.priority,
      status: editFormData.status,
      dueDate: editFormData.dueDate,
      dueTime: editFormData.dueTime,
      assignedEmployee: editFormData.assignedTo,
      assignee: {
        name: editFormData.assignedTo,
        role: editFormData.employeeRole || employee?.role || editingTask.assignee?.role || `${domainLabel} Employee`,
        avatar: employee?.avatar || editingTask.assignee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });

    setEditingTask(null);
    showToast(`Task "${editFormData.title}" updated successfully!`);
  };

  // Delete Task Handler
  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    showToast(`Task "${taskToDelete.taskDetails || taskToDelete.title}" deleted.`);
    setTaskToDelete(null);
  };

  // Immediate fallback hydration from localStorage to prevent empty-state flicker during hydration
  const displayTasks = useMemo(() => {
    let localData: CrmTask[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_tasks_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localData = parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (localData.length > 0) return localData;
    return tasks || [];
  }, [tasks, tasksVersion]);

  const filteredTasks = useMemo(() => {
    return displayTasks.filter((t) => {
      const title = t.taskDetails || t.title || '';
      const cust = t.customer || t.taskUnder || '';
      const rep = t.assignedEmployee || t.assignee?.name || '';
      const dept = t.department || '';
      const loc = t.location || t.description || '';
      const taskType = t.taskType || '';
      const assignedBy = t.assignedBy || '';
      const createdBy = t.createdBy || '';

      // Direct Creator / Assigner Ownership Guarantee:
      // If task was assigned/created by this manager or matches current domain
      const isCreatedByMe =
        Boolean(
          currentUser?.name &&
          ((assignedBy && assignedBy.toLowerCase().includes(nameStr)) ||
            (createdBy && createdBy.toLowerCase().includes(nameStr)))
        ) ||
        (Boolean(currentUser?.id) &&
          (String(assignedBy) === String(currentUser?.id) ||
            String(createdBy) === String(currentUser?.id))) ||
        (isSalesManager && (assignedBy.toLowerCase().includes('sales') || createdBy.toLowerCase().includes('sales') || dept.toLowerCase().includes('sales'))) ||
        (isMarketingManager && (assignedBy.toLowerCase().includes('marketing') || createdBy.toLowerCase().includes('marketing') || dept.toLowerCase().includes('marketing'))) ||
        (isPurchaseManager && (assignedBy.toLowerCase().includes('purchase') || createdBy.toLowerCase().includes('purchase') || dept.toLowerCase().includes('purchase'))) ||
        (isOperationsManager && (assignedBy.toLowerCase().includes('operation') || createdBy.toLowerCase().includes('operation') || dept.toLowerCase().includes('operation')));

      // Strict Domain Isolation for Manager Roles (when not created by / matching current manager)
      if (!isSuperAdminOrAdmin && !isCreatedByMe) {
        if (isSalesManager) {
          const isMarketing = dept.toLowerCase().includes('marketing') || dept.toLowerCase().includes('digital marketing');
          const isPurchase = dept.toLowerCase().includes('purchase') || dept.toLowerCase().includes('procurement');
          const isOperations = dept.toLowerCase().includes('operations') || dept.toLowerCase().includes('technical maintenance');
          if (isMarketing || isPurchase || isOperations) return false;
        } else if (isMarketingManager) {
          const isSales = dept.toLowerCase().includes('sales');
          const isPurchase = dept.toLowerCase().includes('purchase') || dept.toLowerCase().includes('procurement');
          const isOperations = dept.toLowerCase().includes('operations') || dept.toLowerCase().includes('technical maintenance');
          if (isSales || isPurchase || isOperations) return false;
        } else if (isPurchaseManager) {
          const isSales = dept.toLowerCase().includes('sales');
          const isMarketing = dept.toLowerCase().includes('marketing') || dept.toLowerCase().includes('digital marketing');
          const isOperations = dept.toLowerCase().includes('operations') || dept.toLowerCase().includes('technical maintenance');
          if (isSales || isMarketing || isOperations) return false;
        } else if (isOperationsManager) {
          const isSales = dept.toLowerCase().includes('sales');
          const isMarketing = dept.toLowerCase().includes('marketing') || dept.toLowerCase().includes('digital marketing');
          const isPurchase = dept.toLowerCase().includes('purchase') || dept.toLowerCase().includes('procurement');
          if (isSales || isMarketing || isPurchase) return false;
        }
      }

      const matchSearch =
        !search.trim() ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        cust.toLowerCase().includes(search.toLowerCase()) ||
        rep.toLowerCase().includes(search.toLowerCase()) ||
        dept.toLowerCase().includes(search.toLowerCase()) ||
        loc.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        !statusFilter ||
        statusFilter.toLowerCase() === 'all' ||
        (t.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchDept =
        !deptFilter ||
        deptFilter.toLowerCase() === 'all' ||
        (dept || '').toLowerCase() === deptFilter.toLowerCase();

      return matchSearch && matchStatus && matchDept;
    });
  }, [displayTasks, search, statusFilter, deptFilter, isSuperAdminOrAdmin, isSalesManager, isMarketingManager, isPurchaseManager, isOperationsManager, currentUser, nameStr]);

  return (
    <ManagerShell
      title={
        viewingTask
          ? `Task Details`
          : editingTask
            ? `Edit Task`
            : isAssignViewOpen
              ? `Assign ${domainLabel} Task`
              : `${domainLabel} Tasks & Team Allocation`
      }
      subtitle={
        viewingTask
          ? `Comprehensive operational details, schedule, and team allocation for ${viewingTask.id || 'Task'}`
          : editingTask
            ? `Modify task specifications, employee allocation, deadlines, and scope`
            : isAssignViewOpen
              ? `Create and allocate a task strictly to your active ${domainLabel.toLowerCase()} employees`
              : `Manage, view, edit, and assign tasks to ${domainLabel.toLowerCase()} team members`
      }
      showAssignButton={false}
    >
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-5 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. FULL-PAGE TASK DETAILS VIEW (Exact Cezcon CRM UI)
      ───────────────────────────────────────────────────────────── */}
      {viewingTask ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Notice Banner with Red Close Button */}
          <div className="bg-[#f1f3f5] border border-slate-300/80 rounded-[3px] px-3.5 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wide">
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div className="space-y-0.5 text-[11px] leading-tight text-slate-700">
                <p>
                  TASK CREATED BY{' '}
                  <span className="text-slate-900 font-extrabold">
                    {(viewingTask.createdBy || viewingTask.assignedBy || currentUser?.name || `${domainLabel} Manager`).toUpperCase()}
                  </span>{' '}
                  ON {viewingTask.createdAt ? new Date(viewingTask.createdAt).toLocaleDateString('en-GB') : 'THU 04-09-2025 9:04:19 AM'}
                </p>
                <p>
                  TASK LAST MODIFIED BY{' '}
                  <span className="text-slate-900 font-extrabold">
                    {(viewingTask.assignedBy || viewingTask.createdBy || currentUser?.name || `${domainLabel} Manager`).toUpperCase()}
                  </span>{' '}
                  ON {viewingTask.updatedAt ? new Date(viewingTask.updatedAt).toLocaleDateString('en-GB') : 'MON 13-10-2025 5:18:53 PM'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewingTask(null)}
              className="w-6 h-6 bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 text-white rounded-[4px] flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-xs"
              title="Close Task Details"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-transparent gap-1">
            <button
              type="button"
              onClick={() => setTaskDetailTab('details')}
              className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${taskDetailTab === 'details'
                  ? 'bg-white text-slate-800 border-t-2 border-t-rose-600 border-x border-slate-200 -mb-px rounded-t-xs shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
            >
              <ListIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Task Details</span>
            </button>
            <button
              type="button"
              onClick={() => setTaskDetailTab('history')}
              className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${taskDetailTab === 'history'
                  ? 'bg-white text-slate-800 border-t-2 border-t-rose-600 border-x border-slate-200 -mb-px rounded-t-xs shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Task History Details</span>
            </button>
          </div>

          {/* Tab Content */}
          {taskDetailTab === 'details' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Task Details Table (7 Cols) */}
              <div className="lg:col-span-6 xl:col-span-6 bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                    <ListIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-xs font-bold text-slate-700">Task Details</span>
                  </div>

                  <div className="divide-y divide-slate-200 text-xs">
                    {/* Assignee */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-center">
                        Assignee
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3 flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {(viewingTask.assignedEmployee || viewingTask.assignee?.name || 'MH').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 uppercase">
                          {viewingTask.assignedEmployee || viewingTask.assignee?.name || 'MUHAMMAD HAMZA'}
                        </span>
                      </div>
                    </div>

                    {/* Task */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-start">
                        Task
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3 text-slate-900 font-medium leading-relaxed">
                        {viewingTask.taskDetails || viewingTask.title || 'Follow up with the customer about the requirements'}
                        {viewingTask.description && viewingTask.description !== viewingTask.taskDetails && (
                          <p className="text-xs text-slate-500 mt-1 font-normal">{viewingTask.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-center">
                        Due Date
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3 text-slate-900 font-medium">
                        {viewingTask.dueDate || '20-10-2025'}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-center">
                        Time
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3 text-slate-900 font-medium">
                        {viewingTask.dueTime || '06:00 PM'}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-center">
                        Status
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white rounded shadow-2xs ${viewingTask.status === 'Completed' || viewingTask.status === 'Reviewed'
                              ? 'bg-emerald-600'
                              : viewingTask.status === 'In Progress'
                                ? 'bg-[#0ea5e9]'
                                : 'bg-[#0284c7]'
                            }`}
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>{viewingTask.status === 'In Progress' ? 'Progress' : viewingTask.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Task Under */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-start">
                        Task Under
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0284c7]">
                          <Wrench className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            {viewingTask.equipmentTag || 'CTEQ#3426 Ice machine repair- compressor change'}
                          </span>
                          <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            {viewingTask.customer || viewingTask.taskUnder || 'ROBT. STONE (ME) LLC'}
                          </span>
                          <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* Task Type */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-center">
                        Task Type
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3 text-slate-900 font-medium">
                        {viewingTask.taskType || 'Followup'}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="grid grid-cols-12">
                      <div className="col-span-4 sm:col-span-3 bg-slate-50/40 p-3 font-semibold text-slate-600 border-r border-slate-200 flex items-center">
                        Priority
                      </div>
                      <div className="col-span-8 sm:col-span-9 p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#f59e0b] rounded shadow-2xs">
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>
                            {viewingTask.priority === 'Medium' ? 'Mid' : viewingTask.priority}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons inside Left Card */}
                <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Task schedule postponed by 24 hours.');
                    }}
                    className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Postpone</span>
                  </button>

                  {viewingTask.status !== 'Completed' && viewingTask.status !== 'Reviewed' ? (
                    <button
                      type="button"
                      onClick={() => {
                        updateTask(viewingTask.id, { status: 'Completed' });
                        setViewingTask((prev) => (prev ? { ...prev, status: 'Completed' } : null));
                        showToast('Task marked as Completed!');
                      }}
                      className="px-3.5 py-1.5 bg-[#334155] hover:bg-[#1e293b] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark as Completed</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        updateTask(viewingTask.id, { status: 'In Progress' });
                        setViewingTask((prev) => (prev ? { ...prev, status: 'In Progress' } : null));
                        showToast('Task status updated to Progress.');
                      }}
                      className="px-3.5 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Reopen / Progress</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const t = viewingTask;
                      setViewingTask(null);
                      handleOpenEditModal(t);
                    }}
                    className="px-3.5 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = viewingTask;
                      setViewingTask(null);
                      setTaskToDelete(t);
                    }}
                    className="px-3.5 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Attachments Card (5 Cols) */}
              <div className="lg:col-span-6 xl:col-span-6 bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase">
                      <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                      <span>ATTACHMENTS</span>
                    </div>

                    <div className="flex items-center border border-slate-300 rounded overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setAttachmentViewMode('list')}
                        className={`px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${attachmentViewMode === 'list'
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <ListIcon className="w-3 h-3" />
                        <span>List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachmentViewMode('slider')}
                        className={`px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 transition-colors border-l border-slate-200 cursor-pointer ${attachmentViewMode === 'slider'
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <LayoutGrid className="w-3 h-3" />
                        <span>Slider</span>
                      </button>
                    </div>
                  </div>

                  {/* Attachment Content Body */}
                  <div className="p-8 flex flex-col items-center justify-center min-h-[160px] text-center border-b border-slate-100">
                    {taskAttachments.length > 0 ? (
                      <div className="w-full space-y-2">
                        {taskAttachments.map((f, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-800">{f.name}</span>
                            <span className="text-slate-400">{f.size}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <Folder className="w-12 h-12 text-slate-300 stroke-[1.2] mb-2" />
                        <p className="text-xs text-slate-400 font-medium">No attachments yet</p>
                      </>
                    )}
                  </div>

                  {/* Add More Attachments Section */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase">
                      <Plus className="w-3.5 h-3.5 text-sky-600" />
                      <span>ADD MORE ATTACHMENTS</span>
                    </div>

                    <label className="block border-2 border-dashed border-sky-200 rounded-sm p-6 bg-sky-50/20 hover:bg-sky-50/60 transition-colors text-center cursor-pointer">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const newFiles = Array.from(files).map((f) => ({
                              name: f.name,
                              size: `${(f.size / 1024).toFixed(1)} KB`,
                              type: f.type,
                            }));
                            setTaskAttachments((prev) => [...prev, ...newFiles]);
                            showToast(`${files.length} file(s) attached to task.`);
                          }
                        }}
                      />
                      <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-1 stroke-[1.5]" />
                      <p className="text-xs text-slate-600 font-medium">
                        Drop files here or <span className="text-sky-600 underline">click to browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Multiple files supported</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Task History Details Tab Content */
            <div className="bg-white border border-slate-200 rounded-sm p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Task Modification &amp; Activity Log
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingTask.createdAt ? new Date(viewingTask.createdAt).toLocaleString('en-GB') : '04-09-2025 09:04 AM'}{' '}
                    by {viewingTask.createdBy || `${domainLabel} Manager`}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Last Status Update:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingTask.status} (by {viewingTask.assignedBy || 'Manager'})
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Target Deadline:</span>
                  <span className="font-semibold text-slate-800">
                    {viewingTask.dueDate || '20-10-2025'} at {viewingTask.dueTime || '06:00 PM'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : editingTask ? (
        /* ─────────────────────────────────────────────────────────────
            2. FULL-PAGE EDIT TASK VIEW (Unified Cezcon CRM Form)
        ───────────────────────────────────────────────────────────── */
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden animate-in fade-in duration-150">
          {/* Header Action Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <h1 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Edit Task Details <span className="text-slate-400 font-normal">({editingTask.id})</span>
            </h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEditTask}
                className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="w-6 h-6 bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 text-white rounded-[4px] flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-xs ml-1"
                title="Close"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Edit Form Body */}
          <form onSubmit={handleSaveEditTask} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Core Task Details */}
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Task Objective &amp; Details
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Task Title / Objective <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Scope of Work &amp; Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={editFormData.instructions}
                    onChange={(e) => setEditFormData({ ...editFormData, instructions: e.target.value })}
                    placeholder="Enter key deliverables, instructions, or operational notes..."
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Client Account</label>
                    <input
                      type="text"
                      value={editFormData.customerName}
                      onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                      placeholder="e.g. ROBT. STONE (ME) LLC"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deal Reference / Tag</label>
                    <input
                      type="text"
                      value={editFormData.dealReference}
                      onChange={(e) => setEditFormData({ ...editFormData, dealReference: e.target.value })}
                      placeholder="e.g. CTEQ#3426"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Office / Branch Territory</label>
                  <select
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {OFFICE_TERRITORIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column: Assignment & Scheduling */}
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Allocation &amp; Schedule
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assign {domainLabel} Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editFormData.assignedTo}
                    required
                    onChange={(e) => {
                      const selected = availableEmployees.find((w) => w.name === e.target.value);
                      setEditFormData({
                        ...editFormData,
                        assignedTo: e.target.value,
                        employeeRole: selected?.role || editFormData.employeeRole,
                        employeePhone: selected?.phone || editFormData.employeePhone,
                      });
                    }}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Select {domainLabel} Employee --</option>
                    {availableEmployees.map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name} — {w.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={editFormData.department}
                      required
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {activeDepartments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Task Category</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="">-- Select Category --</option>
                      {taskCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                    <select
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Urgent">🚨 Urgent</option>
                      <option value="High">⚡ High</option>
                      <option value="Medium">🔹 Medium</option>
                      <option value="Low">⚪ Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Due Date</label>
                    <input
                      type="date"
                      required
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Time Slot</label>
                    <input
                      type="text"
                      value={editFormData.dueTime}
                      onChange={(e) => setEditFormData({ ...editFormData, dueTime: e.target.value })}
                      placeholder="e.g. 04:00 PM"
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      ) : isAssignViewOpen ? (
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden animate-in fade-in duration-150">
          {/* Header Action Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <h1 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Assign Task to {domainLabel} Team
            </h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateTask}
                className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assign Task</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAssignViewOpen(false)}
                className="w-6 h-6 bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 text-white rounded-[4px] flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-xs ml-1"
                title="Close"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleCreateTask} className="p-6 sm:p-8 space-y-7 max-w-5xl">

            {/* Section 1: Task Objective */}
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-3">
                <h3 className="text-sm font-bold text-slate-900">1. Task Subject &amp; Scope</h3>
                <p className="text-xs text-slate-500">Define the core task title and instructions</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Task Title / Action Subject <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl p-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs leading-relaxed"
                  placeholder="e.g. Present Commercial Quotation & Specs to Client"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Task Category
                  </label>
                  <select
                    value={newTaskForm.category}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">-- Select Category --</option>
                    {taskCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="Urgent">🚨 Urgent</option>
                    <option value="High">⚡ High</option>
                    <option value="Medium">🔹 Medium</option>
                    <option value="Low">⚪ Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Detailed Scope of Work &amp; Instructions
                </label>
                <textarea
                  rows={3}
                  value={newTaskForm.instructions}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, instructions: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all leading-relaxed"
                  placeholder="Enter specific instructions, key deliverables, or notes for the employee..."
                />
              </div>
            </div>

            {/* Section 2: Team Allocation */}
            <div className="space-y-4 pt-2">
              <div className="border-l-4 border-blue-600 pl-3">
                <h3 className="text-sm font-bold text-slate-900">
                  2. Team Allocation ({domainLabel} Employees Only)
                </h3>
                <p className="text-xs text-slate-500">
                  Assign this task strictly to a verified <strong>{domainLabel.toLowerCase()} team member</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Assign {domainLabel} Employee <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddEmployeeOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      + Add New Employee
                    </button>
                  </div>
                  <select
                    value={newTaskForm.assignedTo}
                    required
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">
                      {availableEmployees.length === 0
                        ? `-- No ${domainLabel.toLowerCase()} employees found --`
                        : `-- Select ${domainLabel} Employee --`}
                    </option>
                    {availableEmployees.map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name} — {w.role} ({w.department})
                      </option>
                    ))}
                    <option value="__add_new__" className="text-blue-600 font-bold bg-blue-50">
                      + Add New {domainLabel} Employee...
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddDeptModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      + Add Department
                    </button>
                  </div>
                  <select
                    value={newTaskForm.department}
                    required
                    onChange={(e) => {
                      if (e.target.value === '__add_new_dept__') {
                        setIsAddDeptModalOpen(true);
                      } else {
                        setNewTaskForm({ ...newTaskForm, department: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    {activeDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="__add_new_dept__" className="text-blue-600 font-bold bg-blue-50">
                      + Add New Department...
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Target Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Target Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.dueTime}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueTime: e.target.value })}
                    placeholder="e.g. 04:00 PM"
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Client Details */}
            <div className="space-y-4 pt-2">
              <div className="border-l-4 border-blue-600 pl-3">
                <h3 className="text-sm font-bold text-slate-900">3. Client &amp; Territory (Optional)</h3>
                <p className="text-xs text-slate-500">Associate with customer account or deal reference</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Customer / Client Account Name
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.customerName}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. Focus EMC Kitchens LLC"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Office / Branch Location
                  </label>
                  <select
                    value={newTaskForm.location}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    {OFFICE_TERRITORIES.map((terr) => (
                      <option key={terr} value={terr}>
                        {terr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deal / Opportunity Reference
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.dealReference}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dealReference: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. DEAL-1049"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Client Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.employeePhone}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, employeePhone: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Dispatching Manager:{' '}
                <strong className="text-slate-800">{currentUser?.name || `${domainLabel} Manager`}</strong>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsAssignViewOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assign &amp; Dispatch Task</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            STANDARD TASKS LIST VIEW WITH VIEW / EDIT / DELETE ACTIONS
        ───────────────────────────────────────────────────────────── */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {activeDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsAssignViewOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task to Employee</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[240px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-4 text-center">Settings / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <p className="font-bold text-slate-700 mb-1">No tasks found</p>
                      <p className="text-xs text-slate-400">
                        Click &quot;+ Assign Task to Employee&quot; above to create a new task.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{t.taskDetails || t.title}</p>
                        <p className="text-[11px] text-slate-400">{t.taskType || 'Task'}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {t.department || `${domainLabel} Department`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-800">{t.customer || t.taskUnder || '-'}</p>
                        <p className="text-[11px] text-slate-400">{t.location || ''}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">
                          {t.assignedEmployee || t.assignee?.name || 'Unassigned'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t.assignee?.role || `${domainLabel} Employee`}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${t.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : t.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                            }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${t.status === 'Completed' || t.status === 'Reviewed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">{t.dueDate}</td>
                      <td className="py-3.5 px-3 text-slate-700">{t.dueTime || '04:00 PM'}</td>

                      {/* Action / Settings Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActionMenuTaskId((prev) => (prev === t.id ? null : t.id));
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#002f4a] hover:bg-[#002338] text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5 text-white stroke-[2.2]" />
                            <span className="text-[8px] text-white leading-none">▼</span>
                          </button>

                          {/* Dropdown Menu */}
                          {actionMenuTaskId === t.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActionMenuTaskId(null);
                                }}
                              />
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-[4px] shadow-2xl z-50 py-1 text-left text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActionMenuTaskId(null);
                                    setViewingTask(t);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900 cursor-pointer text-left text-xs font-medium"
                                >
                                  <Eye className="w-4 h-4 text-slate-500 shrink-0 stroke-[1.75]" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActionMenuTaskId(null);
                                    handleOpenEditModal(t);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900 cursor-pointer text-left text-xs font-medium"
                                >
                                  <Edit2 className="w-4 h-4 text-slate-500 shrink-0 stroke-[1.75]" />
                                  <span>Edit</span>
                                </button>

                                <div className="border-t border-slate-100 my-1" />

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActionMenuTaskId(null);
                                    setTaskToDelete(t);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 transition-colors text-rose-600 cursor-pointer text-left text-xs font-medium"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* ─────────────────────────────────────────────────────────────
          3. DELETE TASK CONFIRMATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {taskToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Task?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete &quot;<strong>{taskToDelete.taskDetails || taskToDelete.title}</strong>&quot;? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Employee Modal */}
      {isQuickAddEmployeeOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Add New {domainLabel} Employee
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAddEmployeeOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddEmployee} className="p-5 space-y-3 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammed Rashid"
                  value={quickEmpForm.name}
                  onChange={(e) => setQuickEmpForm({ ...quickEmpForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rashid@company.com"
                    value={quickEmpForm.email}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={quickEmpForm.phone}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={quickEmpForm.designation}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, designation: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={quickEmpForm.department}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                  >
                    {activeDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickAddEmployeeOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Departments Modal */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Manage Departments</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddDeptModalOpen(false);
                  setNewDeptName('');
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <form onSubmit={handleAddDepartment} className="space-y-2">
                <label className="block font-bold text-slate-700">
                  New Department Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Key Accounts"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 mb-2 block">
                  Existing Departments ({activeDepartments.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activeDepartments.map((dept) => (
                    <div
                      key={dept}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <span className="font-bold text-slate-800">{dept}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDepartment(dept)}
                        className="text-red-600 hover:text-red-800 text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDeptModalOpen(false);
                    setNewDeptName('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}

export default function ManagerTasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Tasks...</div>}>
      <ManagerTasksContent />
    </Suspense>
  );
}
