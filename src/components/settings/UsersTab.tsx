'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  User,
  Plus,
  CheckCircle,
  Trash2,
  DollarSign,
  Monitor,
  Smartphone,
  Check,
  Settings as SettingsIcon,
  Search,
  ChevronDown,
  Book,
  X,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  Calendar,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import {
  authMockService,
  resolveDefaultPermissions,
  canCreateRole,
  validateUserCreationAuthority,
} from '@/services/authMockService';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { CezconUserItem, CezconProfileItem } from '@/types/settings';
import { CEZCON_PROFILES_DATA } from '@/data/settingsMockData';
import { createFirebaseAuthUser } from '@/services/firebaseAuthService';

const COUNTRY_CODES = [
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE', minDigits: 9, maxDigits: 9, placeholder: '50 123 4567' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA', minDigits: 9, maxDigits: 9, placeholder: '50 123 4567' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM', minDigits: 8, maxDigits: 8, placeholder: '9123 4567' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA', minDigits: 8, maxDigits: 8, placeholder: '3312 3456' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW', minDigits: 8, maxDigits: 8, placeholder: '9123 4567' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH', minDigits: 8, maxDigits: 8, placeholder: '3612 3456' },
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN', minDigits: 10, maxDigits: 10, placeholder: '98765 43210' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK', minDigits: 10, maxDigits: 10, placeholder: '300 1234567' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG', minDigits: 10, maxDigits: 10, placeholder: '10 1234 5678' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB', minDigits: 10, maxDigits: 11, placeholder: '7123 456789' },
  { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US', minDigits: 10, maxDigits: 10, placeholder: '555 123 4567' },
];

export function UsersTab({
  selectedUserId,
}: {
  selectedUserId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = selectedUserId || searchParams?.get('userId') || null;

  const { addUser } = useEnterpriseCrm();

  const [cezconUsersList, setCezconUsersList] = useState<CezconUserItem[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState('Active');
  const [userProfileFilter, setUserProfileFilter] = useState('All');
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userSearch, setUserSearch] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [openActionUserId, setOpenActionUserId] = useState<number | string | null>(null);
  const [viewUserModalData, setViewUserModalData] = useState<CezconUserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<CezconUserItem | null>(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [assignWorkerUser, setAssignWorkerUser] = useState<CezconUserItem | null>(null);
  const [assignWorkerTab, setAssignWorkerTab] = useState<'NEW' | 'EXISTING'>('NEW');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingFirebaseUser, setIsCreatingFirebaseUser] = useState(false);

  const [workerFormData, setWorkerFormData] = useState({
    workerCode: '',
    grade: 'Select',
    hourlyRate: '',
    joiningDate: '24-09-2026',
    existingWorker: '',
  });

  const PROFILE_OPTIONS = [
    'Select Profile',
    'Manager',
    'Employee',
    'Sales',
    'Digital Marketing',
    'Finance',
    'IM',
    'Operations',
    'Sales Manager',
    'Operational Manager',
    'Admin',
    'Worker',
    'Service Supervisor',
  ];

  const MANAGER_TYPE_OPTIONS = [
    'Sales Manager',
    'Purchase Manager',
    'Marketing Manager',
    'Operations Manager',
    'Custom Manager',
  ];

  const EMPLOYEE_TYPE_OPTIONS = [
    'Sales Employee',
    'Purchase Employee',
    'Marketing Employee',
    'Operations Employee',
    'Custom Employee',
  ];

  const INITIAL_DESIGNATIONS = [
    'Accounts Payable (AP)',
    'Accounts Receivable (AR)',
    'Administrative Operations (AO)',
    'COO',
    'Customer Care',
    'Inventory Management (IM)',
    'Marketing',
    'Managing Director',
    'Operations Manager',
    'Sales Representative',
    'Senior Sales Executive',
    'Inside Sales Specialist',
    'Key Account Manager',
    'Field Service Technician',
  ];

  const [profileOptionsList, setProfileOptionsList] = useState<string[]>(PROFILE_OPTIONS);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [isAddingNewProfile, setIsAddingNewProfile] = useState(false);
  const [newProfileInput, setNewProfileInput] = useState('');

  const INITIAL_BUSINESS_OPPORTUNITIES = [
    'None selected',
    'All Works',
    'HVAC Systems',
    'Chiller Maintenance',
    'Duct Cleaning',
    'Facility Management',
  ];
  const [businessOpportunitiesList, setBusinessOpportunitiesList] = useState<string[]>(INITIAL_BUSINESS_OPPORTUNITIES);
  const [isAddingNewOpportunity, setIsAddingNewOpportunity] = useState(false);
  const [newOpportunityInput, setNewOpportunityInput] = useState('');

  const [designationsList, setDesignationsList] = useState<string[]>(INITIAL_DESIGNATIONS);
  const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] = useState(false);
  const [designationSearchQuery, setDesignationSearchQuery] = useState('');
  const [isAddingNewDesignation, setIsAddingNewDesignation] = useState(false);
  const [newDesignationInput, setNewDesignationInput] = useState('');

  const INITIAL_MODULE_OPTIONS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'tasks', label: 'Task Management' },
    { key: 'leads', label: 'Leads & Inquiries' },
    { key: 'customers', label: 'Customers Directory' },
    { key: 'sales', label: 'Sales & Quotations' },
    { key: 'invoices', label: 'Invoices & Billing' },
    { key: 'purchase', label: 'Purchase & Stock' },
    { key: 'manufacturing', label: 'Manufacturing & Production' },
    { key: 'service', label: 'Service & AMC' },
    { key: 'materials', label: 'Material Requisitions' },
    { key: 'timesheet', label: 'Timesheets & Attendance' },
    { key: 'marketing', label: 'Marketing Campaigns' },
    { key: 'whatsapp', label: 'WhatsApp & SMS Hub' },
    { key: 'financials', label: 'Financials & Accounts' },
    { key: 'reports', label: 'Reports & Analytics' },
    { key: 'fileManager', label: 'Document Repository' },
    { key: 'users', label: 'User Management' },
    { key: 'settings', label: 'Settings Access' },
  ];

  const INITIAL_ACTION_OPTIONS = [
    { key: 'canView', label: 'View Records' },
    { key: 'canCreate', label: 'Create New' },
    { key: 'canEdit', label: 'Edit / Update' },
    { key: 'canDelete', label: 'Delete Records' },
    { key: 'canExport', label: 'Export Data' },
    { key: 'canPrint', label: 'Print & PDF' },
    { key: 'canApprove', label: 'Approve / Reject' },
    { key: 'canImport', label: 'Bulk Import Data' },
    { key: 'canReassign', label: 'Reassign Ownership' },
    { key: 'canViewFinancials', label: 'View Cost & Margins' },
  ];

  const INITIAL_DATA_SCOPES = [
    { value: 'all', label: 'All Company Data (Unrestricted)' },
    { value: 'team', label: 'Team / Department Data Only' },
    { value: 'own', label: 'Own Assigned Records Only' },
    { value: 'branch', label: 'Assigned Branch / Store Only' },
    { value: 'region', label: 'Assigned Region / Territory Only' },
    { value: 'hierarchy', label: 'Direct Reportees & Sub-Teams Only' },
    { value: 'projects', label: 'Assigned Projects & Jobs Only' },
    { value: 'collaborators', label: 'Cross-Department Collaborators' },
    { value: 'restricted', label: 'Standard Data (Confidential Excluded)' },
  ];

  const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false);
  const [dataScopeList, setDataScopeList] = useState(INITIAL_DATA_SCOPES);
  const [isAddingCustomScope, setIsAddingCustomScope] = useState(false);
  const [customScopeInput, setCustomScopeInput] = useState('');

  const [moduleOptionsList, setModuleOptionsList] = useState(INITIAL_MODULE_OPTIONS);
  const [actionOptionsList, setActionOptionsList] = useState(INITIAL_ACTION_OPTIONS);
  const [isAddingCustomModule, setIsAddingCustomModule] = useState(false);
  const [customModuleInput, setCustomModuleInput] = useState('');
  const [isAddingCustomAction, setIsAddingCustomAction] = useState(false);
  const [customActionInput, setCustomActionInput] = useState('');

  const [editingUserId, setEditingUserId] = useState<number | string | null>(null);

  // Mobile & DOB Enhancements
  const [isCountryCodeDropdownOpen, setIsCountryCodeDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    showPassword: false,
    mobileCountry: '+971',
    mobileNumber: '',
    dob: '',
    profile: '',
    managerType: 'Sales Manager',
    employeeType: 'Sales Employee',
    assignedManagerId: '',
    businessOpportunity: 'None',
    businessOpportunityAll: false,
    designation: '',
    signatureImage: null as string | null,
    avatarImage: null as string | null,
    loginPermission: 'Web & Mobile' as 'Web Only' | 'Mobile Only' | 'Web & Mobile',
    salesVisitPermission: false,
    store: 'None',
    storeAll: false,
    isWorker: false,
    monthlyTargets: false,
    dataScope: 'team' as string,
    modulePermissions: {
      dashboard: true,
      tasks: true,
      leads: true,
      customers: true,
      sales: true,
      invoices: true,
      purchase: false,
      manufacturing: false,
      service: false,
      materials: false,
      timesheet: false,
      marketing: false,
      whatsapp: false,
      financials: false,
      reports: true,
      fileManager: true,
      users: false,
      settings: false,
    } as Record<string, boolean>,
    actionPermissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canExport: true,
      canPrint: true,
      canApprove: false,
      canImport: false,
      canReassign: false,
      canViewFinancials: false,
    } as Record<string, boolean>,
  });

  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_CODES.find((c) => c.code === userFormData.mobileCountry) ||
      COUNTRY_CODES[0]
    );
  }, [userFormData.mobileCountry]);

  const filteredCountryCodes = useMemo(() => {
    if (!countrySearchQuery.trim()) return COUNTRY_CODES;
    const q = countrySearchQuery.toLowerCase();
    return COUNTRY_CODES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const currentAge = useMemo(() => calculateAge(userFormData.dob), [userFormData.dob]);
  const isDobInFuture = useMemo(() => {
    if (!userFormData.dob) return false;
    const birthDate = new Date(userFormData.dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return birthDate > today;
  }, [userFormData.dob]);

  const isMobileValid = useMemo(() => {
    const rawDigits = userFormData.mobileNumber.replace(/\D/g, '');
    if (!rawDigits) return null;
    return rawDigits.length >= selectedCountry.minDigits && rawDigits.length <= selectedCountry.maxDigits;
  }, [userFormData.mobileNumber, selectedCountry]);

  const loggedInUser = authMockService.getCurrentUser();
  const isSuperAdminSession = loggedInUser?.role === 'super_admin';
  const isAdminSession = loggedInUser?.role === 'admin';
  const isManagerSession = loggedInUser?.role === 'manager';

  // Derive which employee type this manager's department maps to
  const managerDeptType = useMemo(() => {
    if (!isManagerSession) return null;
    // Read from all possible session fields where manager type might be stored
    const mgrType = (
      loggedInUser?.managerType ||
      loggedInUser?.department ||
      loggedInUser?.designation ||
      loggedInUser?.profileType ||
      ''
    ).toLowerCase();
    if (mgrType.includes('sales')) return 'Sales Employee';
    if (mgrType.includes('marketing') || mgrType.includes('market')) return 'Marketing Employee';
    if (mgrType.includes('purchase')) return 'Purchase Employee';
    if (mgrType.includes('operation')) return 'Operations Employee';
    return 'Sales Employee'; // default fallback
  }, [isManagerSession, loggedInUser]);

  // For manager sessions: only their department employee type is available
  const allowedEmployeeTypes = useMemo(() => {
    if (isManagerSession && managerDeptType) return [managerDeptType];
    return EMPLOYEE_TYPE_OPTIONS;
  }, [isManagerSession, managerDeptType]);

  const [profilesList, setProfilesList] = useState(CEZCON_PROFILES_DATA);

  const availableManagers = useMemo(() => {
    return cezconUsersList
      .filter((u) => {
        const p = (u.profileType || '').toLowerCase();
        const r = (u.role || '').toLowerCase();
        const m = (u.managerType || '').toLowerCase();
        return p.includes('manager') || r.includes('manager') || m.length > 0;
      })
      .map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email || u.username || '',
        managerType: u.managerType || u.profileType || 'Manager',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cezconUsersList]);

  const loadUnifiedUsers = () => {
    try {
      const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
      const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
      const deletedIdsRaw = localStorage.getItem('cezcon_crm_deleted_user_ids');
      const deletedIdsSet = new Set<string>(deletedIdsRaw ? JSON.parse(deletedIdsRaw) : []);

      let cezconList: CezconUserItem[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      let adminList: any[] = storedAdminsRaw ? JSON.parse(storedAdminsRaw) : [];

      const userMap = new Map<string | number, CezconUserItem>();

      if (storedUsersRaw !== null) {
        // Data already initialized in localStorage - respect the stored list and deletions strictly
        cezconList.forEach((u) => {
          if (u && u.id) {
            const uid = String(u.id).toLowerCase();
            const uemail = (u.email || '').toLowerCase();
            const uuser = (u.username || '').toLowerCase();
            if (!deletedIdsSet.has(uid) && !deletedIdsSet.has(uemail) && !deletedIdsSet.has(uuser)) {
              userMap.set(u.id, u);
            }
          }
        });

        // Merge any new Admins created in Super Admin if not deleted
        adminList.forEach((a) => {
          if (a && a.id) {
            const aid = String(a.id).toLowerCase();
            const aemail = (a.email || '').toLowerCase();
            if (!deletedIdsSet.has(aid) && !deletedIdsSet.has(aemail)) {
              const alreadyExists = Array.from(userMap.values()).some(
                (u) =>
                  String(u.id) === String(a.id) ||
                  (u.email && a.email && u.email.toLowerCase() === a.email.toLowerCase())
              );
              if (!alreadyExists) {
                userMap.set(a.id, {
                  id: a.id || `adm_${Date.now()}`,
                  name: a.name,
                  email: a.email,
                  username: a.username ? (a.username.includes('@') ? a.username : `${a.username}@cooltechuae.com`) : `${a.name.toLowerCase().replace(/\s+/g, '.')}@cooltechuae.com`,
                  profileType: 'Admin',
                  designation: a.designation || 'Admin',
                  department: a.department || 'Administration',
                  phone: a.phone || '+971 55 485 3829',
                  status: a.status || 'Active',
                  isAdmin: true,
                  role: 'Admin',
                  loginPermission: 'Web & Mobile',
                  avatarImage: a.avatar,
                });
              }
            }
          }
        });

        const currentUsers = Array.from(userMap.values());
        setCezconUsersList(currentUsers);
        return;
      }

      // Initial clean seed ONLY if cezcon_crm_users_list was never initialized
      cezconList.forEach((u) => {
        if (u && u.id) {
          userMap.set(u.id, u);
        }
      });

      adminList.forEach((a) => {
        if (a && a.id) {
          const alreadyExists = Array.from(userMap.values()).some(
            (u) =>
              String(u.id) === String(a.id) ||
              (u.email && a.email && u.email.toLowerCase() === a.email.toLowerCase())
          );
          if (!alreadyExists) {
            userMap.set(a.id, {
              id: a.id || `adm_${Date.now()}`,
              name: a.name,
              email: a.email,
              username: a.username ? (a.username.includes('@') ? a.username : `${a.username}@cooltechuae.com`) : `${a.name.toLowerCase().replace(/\s+/g, '.')}@cooltechuae.com`,
              profileType: 'Admin',
              designation: a.designation || 'Admin',
              department: a.department || 'Administration',
              phone: a.phone || '+971 55 485 3829',
              status: a.status || 'Active',
              isAdmin: true,
              role: 'Admin',
              loginPermission: 'Web & Mobile',
              avatarImage: a.avatar,
            });
          }
        }
      });

      // Default baseline users on first run
      userMap.set('usr_shemin_001', {
        id: 'usr_shemin_001',
        name: 'Muhammed shemin',
        email: 'shemin@gmail.com',
        username: 'shemin@cooltechuae.com',
        profileType: 'Admin',
        designation: 'Managing Director / Business Admin',
        department: 'Executive Operations',
        phone: '+971 50 123 4567',
        status: 'Active',
        isAdmin: true,
        role: 'Admin',
        loginPermission: 'Web & Mobile',
      });

      userMap.set('usr_afsal_001', {
        id: 'usr_afsal_001',
        name: 'Afsal',
        email: 'afsal@gmail.com',
        username: 'afsal@cooltechuae.com',
        profileType: 'Marketing Manager',
        managerType: 'Marketing Manager',
        designation: 'Marketing Manager',
        department: 'Marketing',
        phone: '+971 55 123 9988',
        status: 'Active',
        role: 'Manager',
        dataScope: 'team',
        loginPermission: 'Web & Mobile',
      });

      userMap.set('usr_shibil_001', {
        id: 'usr_shibil_001',
        name: 'Muhammed Shibil',
        email: 'shibil@gmail.com',
        username: 'shibil@cooltechuae.com',
        profileType: 'Sales Manager',
        managerType: 'Sales Manager',
        designation: 'Sales Manager',
        department: 'Sales',
        phone: '+971 50 987 6543',
        status: 'Active',
        role: 'Manager',
        dataScope: 'team',
        loginPermission: 'Web & Mobile',
      });

      userMap.set('emp_shaheer_001', {
        id: 'emp_shaheer_001',
        name: 'shaheer',
        email: 'shaheer@gmail.com',
        username: 'shaheer@cooltechuae.com',
        profileType: 'Sales Employee',
        employeeType: 'Sales Employee',
        designation: 'Sales Executive',
        department: 'Sales',
        managerId: 'usr_shibil_001',
        phone: '+971 50 776 5432',
        status: 'Active',
        role: 'Employee',
        dataScope: 'own',
        loginPermission: 'Web & Mobile',
      });

      userMap.set('emp_adhil_001', {
        id: 'emp_adhil_001',
        name: 'adhil',
        email: 'adhil@gmail.com',
        username: 'adhil@cooltechuae.com',
        profileType: 'Sales Employee',
        employeeType: 'Sales Employee',
        designation: 'Sales Representative',
        department: 'Sales',
        managerId: 'usr_shibil_001',
        phone: '+971 56 881 1334',
        status: 'Active',
        role: 'Employee',
        dataScope: 'own',
        loginPermission: 'Web & Mobile',
      });

      userMap.set('emp_shameem_001', {
        id: 'emp_shameem_001',
        name: 'shameem',
        email: 'shameem@gmail.com',
        username: 'shameem@cooltechuae.com',
        profileType: 'Marketing Employee',
        employeeType: 'Marketing Employee',
        designation: 'Marketing Executive',
        department: 'Marketing',
        managerId: 'usr_afsal_001',
        phone: '+971 52 443 8901',
        status: 'Active',
        role: 'Employee',
        dataScope: 'own',
        loginPermission: 'Web & Mobile',
      });

      userMap.set('emp_arun_001', {
        id: 'emp_arun_001',
        name: 'arun',
        email: 'arun@gmail.com',
        username: 'arun@cooltechuae.com',
        profileType: 'Marketing Employee',
        employeeType: 'Marketing Employee',
        designation: 'Marketing Specialist',
        department: 'Marketing',
        managerId: 'usr_afsal_001',
        phone: '+971 54 321 0987',
        status: 'Active',
        role: 'Employee',
        dataScope: 'own',
        loginPermission: 'Web & Mobile',
      });

      const mergedUsers = Array.from(userMap.values());
      setCezconUsersList(mergedUsers);

      try {
        localStorage.setItem('cezcon_crm_users_list', JSON.stringify(mergedUsers));
      } catch (err) {
        console.error('Error saving merged users:', err);
      }
    } catch (e) {
      console.error('Error loading unified users:', e);
    }
  };

  useEffect(() => {
    loadUnifiedUsers();
    window.addEventListener('crm_users_updated', loadUnifiedUsers);
    window.addEventListener('crm_admins_updated', loadUnifiedUsers);
    window.addEventListener('storage', loadUnifiedUsers);
    return () => {
      window.removeEventListener('crm_users_updated', loadUnifiedUsers);
      window.removeEventListener('crm_admins_updated', loadUnifiedUsers);
      window.removeEventListener('storage', loadUnifiedUsers);
    };
  }, []);

  useEffect(() => {
    const loadProfiles = () => {
      try {
        const saved = localStorage.getItem('cezcon_crm_profiles_list');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProfilesList(parsed);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProfiles();
    window.addEventListener('crm_profiles_updated', loadProfiles);
    window.addEventListener('storage', loadProfiles);
    return () => {
      window.removeEventListener('crm_profiles_updated', loadProfiles);
      window.removeEventListener('storage', loadProfiles);
    };
  }, []);

  const displayProfiles = useMemo(() => {
    if (isManagerSession) {
      return [
        { id: 103, name: 'Employee', date: '01-01-2026', sales: true, project: true },
        { id: 104, name: 'Worker', date: '01-01-2026', sales: false, project: true },
        { id: 105, name: 'Service Supervisor', date: '01-01-2026', sales: true, project: true },
      ];
    }
    if (isAdminSession) {
      return [
        { id: 101, name: 'Operational Manager', date: '01-01-2026', sales: true, project: true },
        { id: 102, name: 'Employee', date: '01-01-2026', sales: true, project: true },
        { id: 104, name: 'Worker', date: '01-01-2026', sales: false, project: true },
      ];
    }
    return [
      { id: 101, name: 'Operational Manager', date: '01-01-2026', sales: true, project: true },
      { id: 102, name: 'Employee', date: '01-01-2026', sales: true, project: true },
      { id: 103, name: 'Admin', date: '01-01-2026', sales: true, project: true },
    ];
  }, [isManagerSession, isAdminSession]);

  const availableProfileOptions = useMemo(() => {
    const base = ['Select Profile', 'Manager', 'Employee'];
    const dynamic = profilesList.map((p) => p.name).filter(Boolean);
    const combined = Array.from(new Set([...base, ...profileOptionsList, ...dynamic]));

    if (isSuperAdminSession) {
      return combined;
    }
    if (isAdminSession) {
      return combined.filter((p) => {
        const l = p.toLowerCase().trim();
        // Admin cannot create Super Admin or Admin accounts
        return (
          !l.includes('super admin') &&
          !l.includes('superadmin') &&
          !l.includes('super_admin') &&
          l !== 'admin'
        );
      });
    }
    if (isManagerSession) {
      return combined.filter((p) => {
        const l = p.toLowerCase().trim();
        // Manager cannot create Super Admin, Admin, or Manager accounts
        return !l.includes('admin') && !l.includes('manager') && !l.includes('super');
      });
    }
    return combined.filter((p) => {
      const l = p.toLowerCase().trim();
      return !l.includes('admin') && !l.includes('manager') && !l.includes('super');
    });
  }, [isSuperAdminSession, isAdminSession, isManagerSession, profilesList, profileOptionsList]);

  const filteredProfileOptions = useMemo(() => {
    if (!profileSearchQuery.trim()) return availableProfileOptions;
    return availableProfileOptions.filter((p) =>
      p.toLowerCase().includes(profileSearchQuery.toLowerCase())
    );
  }, [profileSearchQuery, availableProfileOptions]);

  const filteredDesignationOptions = useMemo(() => {
    if (!designationSearchQuery.trim()) return designationsList;
    return designationsList.filter((d) =>
      d.toLowerCase().includes(designationSearchQuery.toLowerCase())
    );
  }, [designationSearchQuery, designationsList]);

  const filteredCezconUsers = cezconUsersList.filter((u) => {
    // When logged in as Manager: only display team members (Employees, Workers) under their department
    if (isManagerSession) {
      const isTeam =
        (u.profileType || '').toLowerCase().includes('employee') ||
        (u.profileType || '').toLowerCase().includes('worker') ||
        (u.profileType || '').toLowerCase().includes('service') ||
        (u.profileType || '').toLowerCase().includes('sales') ||
        (u.profileType || '').toLowerCase().includes('marketing') ||
        (u.role || '').toLowerCase() === 'employee' ||
        (u.role || '').toLowerCase() === 'worker' ||
        !!u.employeeType;
      if (!isTeam) return false;

      // Only show employees whose department matches this manager's department
      if (managerDeptType) {
        const uType = (u.employeeType || u.profileType || u.department || '').toLowerCase();
        const deptKey = managerDeptType.toLowerCase().replace(' employee', '').trim();
        if (!uType.includes(deptKey)) return false;
      }
    }

    // When logged in as Admin: do NOT show Super Admin or Admin accounts (Admin only manages subordinate Managers, Employees, Workers)
    if (isAdminSession) {
      const isSuper =
        (u.profileType || '').toLowerCase().includes('super') ||
        (u.role || '').toLowerCase().includes('super');
      if (isSuper) return false;

      const isAdm =
        (u.profileType || '').toLowerCase().trim() === 'admin' ||
        (u.role || '').toLowerCase().trim() === 'admin' ||
        u.isAdmin === true ||
        (loggedInUser?.email && u.email && u.email.toLowerCase() === loggedInUser.email.toLowerCase()) ||
        String(u.id) === String(loggedInUser?.id);
      if (isAdm) return false;
    }

    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      u.profileType.toLowerCase().includes(userSearch.toLowerCase());

    const matchesStatus =
      userStatusFilter === 'All' ? true : u.status.toLowerCase() === userStatusFilter.toLowerCase();

    const matchesProfile =
      userProfileFilter === 'All'
        ? true
        : (u.profileType && u.profileType.toLowerCase().includes(userProfileFilter.toLowerCase())) ||
          (u.employeeType && u.employeeType.toLowerCase().includes(userProfileFilter.toLowerCase())) ||
          (u.managerType && u.managerType.toLowerCase().includes(userProfileFilter.toLowerCase())) ||
          (u.role && u.role.toLowerCase() === userProfileFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesProfile;
  });

  const activeViewUser = viewUserModalData || (userIdParam ? cezconUsersList.find((u) => String(u.id) === userIdParam) : null);

  const handleCloseUserDetails = () => {
    setViewUserModalData(null);
    if (userIdParam) {
      router.push('/settings/users');
    }
  };

  const handleSelectAllModules = (selectAll: boolean) => {
    const updated: Record<string, boolean> = {};
    moduleOptionsList.forEach((mod) => {
      updated[mod.key] = selectAll;
    });
    setUserFormData((prev) => ({
      ...prev,
      modulePermissions: {
        ...prev.modulePermissions,
        ...updated,
      },
    }));
  };

  const handleSelectAllActions = (selectAll: boolean) => {
    const updated: Record<string, boolean> = {};
    actionOptionsList.forEach((act) => {
      updated[act.key] = selectAll;
    });
    setUserFormData((prev) => ({
      ...prev,
      actionPermissions: {
        ...prev.actionPermissions,
        ...updated,
      },
    }));
  };

  const handleAddCustomModule = () => {
    const trimmed = customModuleInput.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!moduleOptionsList.some((m) => m.key === key)) {
      setModuleOptionsList((prev) => [...prev, { key, label: trimmed }]);
    }
    setUserFormData((prev) => ({
      ...prev,
      modulePermissions: {
        ...prev.modulePermissions,
        [key]: true,
      },
    }));
    setCustomModuleInput('');
    setIsAddingCustomModule(false);
  };

  const handleAddCustomAction = () => {
    const trimmed = customActionInput.trim();
    if (!trimmed) return;
    const key = 'can_' + trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!actionOptionsList.some((a) => a.key === key)) {
      setActionOptionsList((prev) => [...prev, { key, label: trimmed }]);
    }
    setUserFormData((prev) => ({
      ...prev,
      actionPermissions: {
        ...prev.actionPermissions,
        [key]: true,
      },
    }));
    setCustomActionInput('');
    setIsAddingCustomAction(false);
  };

  const handleAddCustomScope = () => {
    const trimmed = customScopeInput.trim();
    if (!trimmed) return;
    const value = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!dataScopeList.some((s) => s.value === value)) {
      setDataScopeList((prev) => [...prev, { value, label: trimmed }]);
    }
    setUserFormData((prev) => ({
      ...prev,
      dataScope: value,
    }));
    setCustomScopeInput('');
    setIsAddingCustomScope(false);
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      showPassword: false,
      mobileCountry: '+971',
      mobileNumber: '',
      dob: '',
      profile: 'Select Profile',
      managerType: 'Sales Manager',
      employeeType: 'Sales Employee',
      assignedManagerId: '',
      businessOpportunity: 'None selected',
      businessOpportunityAll: true,
      designation: 'Sales Representative',
      signatureImage: null,
      avatarImage: null,
      loginPermission: 'Web & Mobile',
      salesVisitPermission: false,
      store: 'None selected',
      storeAll: false,
      isWorker: false,
      monthlyTargets: false,
      dataScope: 'team',
      modulePermissions: {
        dashboard: true,
        tasks: true,
        marketing: false,
        leads: true,
        customers: true,
        sales: true,
        invoices: true,
        purchase: false,
        reports: true,
        fileManager: true,
        settings: false,
      },
      actionPermissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canExport: true,
        canPrint: true,
      },
    });
  };

  const handleEditUser = (user: CezconUserItem) => {
    setEditingUserId(user.id);
    const defaults = resolveDefaultPermissions(
      user.profileType || 'Sales',
      undefined,
      user.managerType || user.employeeType
    );
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      username: (user.username || '').replace('@cooltechuae.com', ''),
      password: user.password || 'password@123',
      showPassword: false,
      mobileCountry: '+971',
      mobileNumber: (user.phone || '').replace('+971', '').trim(),
      dob: user.dob || '',
      profile: user.profileType || 'Select Profile',
      managerType: user.managerType || 'Sales Manager',
      employeeType: user.employeeType || 'Sales Employee',
      assignedManagerId: String(user.managerId || user.reportingManagerId || ''),
      businessOpportunity: user.businessOpportunity || 'None selected',
      businessOpportunityAll: true,
      designation: user.designation || user.managerType || user.employeeType || 'Sales Representative',
      signatureImage: user.signatureImage || null,
      avatarImage: user.avatarImage || null,
      loginPermission: (user.loginPermission as any) || 'Web & Mobile',
      salesVisitPermission: user.salesVisitPermission ?? false,
      store: user.store || 'None selected',
      storeAll: false,
      isWorker: user.isWorker ?? false,
      monthlyTargets: user.hasTarget ?? false,
      dataScope: user.dataScope || defaults.dataScope,
      modulePermissions: user.modulePermissions
        ? ({ ...defaults.modulePermissions, ...(user.modulePermissions as Record<string, boolean>) } as Record<string, boolean>)
        : defaults.modulePermissions,
      actionPermissions: user.actionPermissions
        ? ({ ...defaults.actionPermissions, ...(user.actionPermissions as Record<string, boolean>) } as Record<string, boolean>)
        : defaults.actionPermissions,
    });
    setIsAddUserModalOpen(true);
  };

  const handleCezconAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim()) {
      alert('Validation Error: Please enter user name.');
      return;
    }

    if (!userFormData.password.trim()) {
      alert('Validation Error: Please enter a password.');
      return;
    }

    if (userFormData.password.trim().length < 6) {
      alert('Validation Error: Password must be at least 6 characters for Firebase Authentication.');
      return;
    }

    if (isDobInFuture) {
      alert('Validation Error: Date of birth cannot be in the future. Please select a valid past date.');
      return;
    }

    if (userFormData.mobileNumber && isMobileValid === false) {
      alert(`Validation Error: Please enter a valid ${selectedCountry.minDigits}-digit mobile number for ${selectedCountry.country}.`);
      return;
    }

    const enteredEmail = userFormData.email.trim();
    const rawUsername =
      userFormData.username.trim() ||
      (enteredEmail ? enteredEmail.split('@')[0] : userFormData.name.trim().toLowerCase().replace(/\s+/g, '.'));
    const fullUsername = rawUsername.includes('@')
      ? rawUsername
      : `${rawUsername}@cooltechuae.com`;
    const userEmail = enteredEmail || fullUsername;
    const profileName = userFormData.profile && userFormData.profile !== 'Select Profile' ? userFormData.profile : 'Employee';
    const isEmployeeSession = loggedInUser?.role === 'employee' || loggedInUser?.role === 'worker';
    if (isEmployeeSession) {
      alert('Authority Restriction: Employees do not have permission to create or modify user accounts.');
      return;
    }

    const isSuperAdminAttempt = profileName.toLowerCase().includes('super');
    if (isSuperAdminAttempt && !isSuperAdminSession) {
      alert('Authority Restriction: Only Super Admin can create or manage Super Admin accounts.');
      return;
    }

    const isAdminUser = profileName.toLowerCase().includes('admin');
    if (isAdminUser && !isSuperAdminSession) {
      alert('Authority Restriction: Only Super Admin can create Admin accounts.');
      return;
    }

    const isManager = profileName.toLowerCase().includes('manager') || profileName.toLowerCase().includes('operation');
    if (isManagerSession && (isAdminUser || isManager)) {
      alert('Authority Restriction: Managers can only create and manage Employee / Team accounts for their own team.');
      return;
    }
    const isEmployee = !isAdminUser && !isManager;

    const authCheck = validateUserCreationAuthority(
      loggedInUser,
      profileName,
      isAdminUser ? 'admin' : isManager ? 'manager' : 'employee'
    );
    if (!authCheck.allowed) {
      alert(authCheck.error || 'Authority Restriction: Unauthorized action.');
      return;
    }

    // For manager sessions: force the employee type to match the manager's own department
    const resolvedEmployeeType = isManagerSession && managerDeptType && isEmployee
      ? managerDeptType
      : userFormData.employeeType;

    // Resolve reporting manager: Manager sessions strictly auto-assign to themselves
    let effectiveManagerId = isEmployee
      ? (isManagerSession ? (loggedInUser?.id || loggedInUser?.email || 'mgr_1') : (userFormData.assignedManagerId || null))
      : null;

    if (isEmployee && !effectiveManagerId) {
      const typeStr = (resolvedEmployeeType || '').toLowerCase();
      if (typeStr.includes('sales')) {
        const salesMgr = cezconUsersList.find(
          (u) => (u.profileType || '').toLowerCase().includes('sales') && (u.profileType || '').toLowerCase().includes('manager')
        ) || cezconUsersList.find((u) => (u.name || '').toLowerCase().includes('shibil'));
        effectiveManagerId = salesMgr ? String(salesMgr.id || salesMgr.email) : 'shibil@gmail.com';
      } else if (typeStr.includes('marketing') || typeStr.includes('market')) {
        const mktMgr = cezconUsersList.find(
          (u) => (u.profileType || '').toLowerCase().includes('marketing') && (u.profileType || '').toLowerCase().includes('manager')
        ) || cezconUsersList.find((u) => (u.name || '').toLowerCase().includes('afsal'));
        effectiveManagerId = mktMgr ? String(mktMgr.id || mktMgr.email) : 'afsal@gmail.com';
      }
    }

    // Automatically create user in Firebase Auth if it's a new user registration
    let firebaseUid: string | undefined = undefined;
    if (!editingUserId) {
      setIsCreatingFirebaseUser(true);
      try {
        const fbResult = await createFirebaseAuthUser(
          userEmail,
          userFormData.password.trim(),
          userFormData.name.trim()
        );
        if (fbResult.success) {
          firebaseUid = fbResult.uid;
        } else if (fbResult.alreadyExists) {
          console.info('User already registered in Firebase Auth, linking CRM profile.');
        } else if (fbResult.error) {
          console.warn('Firebase Auth Registration Warning:', fbResult.error);
        }
      } catch (fbErr: any) {
        console.error('Firebase user creation failed:', fbErr);
      } finally {
        setIsCreatingFirebaseUser(false);
      }
    }

    if (editingUserId) {
      let currentList: CezconUserItem[] = [];
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) currentList = JSON.parse(raw);
      } catch (e) {}
      if (!Array.isArray(currentList) || currentList.length === 0) {
        currentList = cezconUsersList;
      }

      const updated = currentList.map((u) => {
        if (String(u.id) === String(editingUserId)) {
          return {
            ...u,
            name: userFormData.name.trim(),
            email: userEmail,
            username: fullUsername,
            password: userFormData.password.trim(),
            profileType: profileName,
            managerType: isManager ? userFormData.managerType : undefined,
            employeeType: isEmployee ? resolvedEmployeeType : undefined,
            managerId: effectiveManagerId,
            reportingManagerId: effectiveManagerId,
            dataScope: userFormData.dataScope,
            modulePermissions: userFormData.modulePermissions,
            actionPermissions: userFormData.actionPermissions,
            isAdmin: isAdminUser,
            hasTarget: userFormData.monthlyTargets,
            designation:
              userFormData.designation ||
              (isManager ? userFormData.managerType : isEmployee ? resolvedEmployeeType : profileName),
            phone: userFormData.mobileNumber ? `${userFormData.mobileCountry} ${userFormData.mobileNumber}` : u.phone,
            dob: userFormData.dob || u.dob,
            avatarImage: userFormData.avatarImage || u.avatarImage,
            signatureImage: userFormData.signatureImage || u.signatureImage,
            loginPermission: userFormData.loginPermission || 'Web & Mobile',
          };
        }
        return u;
      });

      setCezconUsersList(updated);
      try {
        localStorage.setItem('cezcon_crm_users_list', JSON.stringify(updated));
        window.dispatchEvent(new Event('crm_users_updated'));
        window.dispatchEvent(new Event('crm_team_updated'));
        window.dispatchEvent(new Event('crm_data_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }
    } else {
      const newUser: CezconUserItem = {
        id: `usr_${Date.now()}`,
        name: userFormData.name.trim(),
        email: userEmail,
        username: fullUsername,
        password: userFormData.password.trim(),
        firebaseUid: firebaseUid,
        profileType: profileName,
        managerType: isManager ? userFormData.managerType : undefined,
        employeeType: isEmployee ? resolvedEmployeeType : undefined,
        managerId: effectiveManagerId,
        reportingManagerId: effectiveManagerId,
        dataScope: userFormData.dataScope,
        modulePermissions: userFormData.modulePermissions,
        actionPermissions: userFormData.actionPermissions,
        isAdmin: isAdminUser,
        role: isAdminUser ? 'Admin' : isManager ? 'Manager' : 'Employee',
        hasTarget: userFormData.monthlyTargets,
        salesPermission: 'All',
        projectPermission: 'All',
        status: 'Active',
        avatarBg: isAdminUser ? 'bg-indigo-600' : isManager ? 'bg-blue-600' : 'bg-emerald-600',
        phone: userFormData.mobileNumber ? `${userFormData.mobileCountry} ${userFormData.mobileNumber}` : '+971 55 485 3829',
        dob: userFormData.dob || '20-05-1995',
        designation:
          userFormData.designation ||
          (isManager ? userFormData.managerType : isEmployee ? resolvedEmployeeType : profileName),
        businessOpportunity: userFormData.businessOpportunity || 'All Works',
        salesVisitPermission: userFormData.salesVisitPermission ?? true,
        store: userFormData.store || 'All Stores',
        avatarImage: userFormData.avatarImage,
        signatureImage: userFormData.signatureImage,
        loginPermission: userFormData.loginPermission || 'Web & Mobile',
        isWorker: isEmployee,
      };

      let currentUsers: CezconUserItem[] = [];
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) currentUsers = JSON.parse(raw);
      } catch (e) {}
      if (!Array.isArray(currentUsers) || currentUsers.length === 0) {
        currentUsers = cezconUsersList;
      }
      const updated = [
        newUser,
        ...currentUsers.filter(
          (u) => String(u.id) !== String(newUser.id) && (u.email ? u.email.toLowerCase() !== newUser.email.toLowerCase() : true)
        ),
      ];
      setCezconUsersList(updated);
      try {
        localStorage.setItem('cezcon_crm_users_list', JSON.stringify(updated));
        window.dispatchEvent(new Event('crm_users_updated'));
        window.dispatchEvent(new Event('crm_team_updated'));
        window.dispatchEvent(new Event('crm_data_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }

      // Sync Admin accounts with Super Admin's crm_admin_accounts_list
      if (isAdminUser || profileName === 'Admin') {
        try {
          const rawAdmins = localStorage.getItem('crm_admin_accounts_list');
          const adminList: any[] = rawAdmins ? JSON.parse(rawAdmins) : [];
          const exists = adminList.some(
            (a) => (a.email && a.email.toLowerCase() === userEmail.toLowerCase()) || a.id === String(newUser.id)
          );
          if (!exists) {
            adminList.push({
              id: String(newUser.id),
              name: newUser.name,
              email: newUser.email,
              username: newUser.username,
              password: newUser.password,
              phone: newUser.phone,
              role: 'Admin',
              organizationId: 'org_cool_tech_001',
              organizationName: 'Cool Technologies LLC',
              status: 'Active',
              avatar: newUser.avatarImage,
              designation: newUser.designation || 'Business Admin',
              department: newUser.department || 'Administration',
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
            });
            localStorage.setItem('crm_admin_accounts_list', JSON.stringify(adminList));
            window.dispatchEvent(new Event('crm_admins_updated'));
          }
        } catch (err) {
          console.error('Error syncing admin account:', err);
        }
      }

      addUser({
        name: userFormData.name.trim(),
        email: userEmail,
        role: (isAdminUser ? 'Admin' : isManager ? 'Manager' : 'Employee') as any,
        phone: `${userFormData.mobileCountry} ${userFormData.mobileNumber}`,
        department: userFormData.designation || (isAdminUser ? 'Administration' : isManager ? 'Management' : 'Sales'),
        status: 'Active',
      });
    }

    // Auto-sync profile to profiles list if not already existing
    if (profileName && profileName !== 'Select Profile') {
      try {
        const storedProfiles = localStorage.getItem('cezcon_crm_profiles_list');
        const profList: CezconProfileItem[] = storedProfiles ? JSON.parse(storedProfiles) : [];
        if (!profList.some((p) => p.name.toLowerCase() === profileName.toLowerCase())) {
          const newProf: CezconProfileItem = {
            id: Date.now() + 1,
            name: profileName,
            date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            sales: true,
            project: true,
            description: `Role profile for ${profileName}`,
            superAdminOnly: false,
          };
          const updatedProfs = [...profList, newProf];
          localStorage.setItem('cezcon_crm_profiles_list', JSON.stringify(updatedProfs));
          window.dispatchEvent(new Event('crm_profiles_updated'));
        }
      } catch (err) {
        console.error(err);
      }
    }

    setIsAddUserModalOpen(false);
    resetUserForm();

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAssignWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignWorkerUser) return;

    const updated = cezconUsersList.map((usr) =>
      usr.id === assignWorkerUser.id
        ? {
          ...usr,
          profileType: 'Worker',
          isWorker: true,
          workerCode: assignWorkerTab === 'NEW' ? (workerFormData.workerCode || `WRK-${String(usr.id).slice(-4)}`) : (workerFormData.existingWorker || usr.workerCode),
          grade: assignWorkerTab === 'NEW' ? workerFormData.grade : usr.grade,
          hourlyRate: assignWorkerTab === 'NEW' ? workerFormData.hourlyRate : usr.hourlyRate,
          joiningDate: assignWorkerTab === 'NEW' ? workerFormData.joiningDate : usr.joiningDate,
        }
        : usr
    );

    setCezconUsersList(updated);
    try {
      localStorage.setItem('cezcon_crm_users_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_users_updated'));
    } catch (err) {
      console.error(err);
    }

    setAssignWorkerUser(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    const targetId = String(userToDelete.id).toLowerCase();
    const targetEmail = (userToDelete.email || '').toLowerCase();
    const targetUsername = (userToDelete.username || '').toLowerCase();

    // 1. Update deleted registry in localStorage
    try {
      const deletedIdsRaw = localStorage.getItem('cezcon_crm_deleted_user_ids');
      const deletedList: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
      if (targetId && !deletedList.includes(targetId)) deletedList.push(targetId);
      if (targetEmail && !deletedList.includes(targetEmail)) deletedList.push(targetEmail);
      if (targetUsername && !deletedList.includes(targetUsername)) deletedList.push(targetUsername);
      localStorage.setItem('cezcon_crm_deleted_user_ids', JSON.stringify(deletedList));
    } catch (e) {
      console.error('Error saving deleted user registry:', e);
    }

    // 2. Remove from cezconUsersList
    const updated = cezconUsersList.filter(
      (u) =>
        String(u.id).toLowerCase() !== targetId &&
        (u.email ? u.email.toLowerCase() !== targetEmail : true) &&
        (u.username ? u.username.toLowerCase() !== targetUsername : true)
    );
    setCezconUsersList(updated);

    try {
      localStorage.setItem('cezcon_crm_users_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_users_updated'));
      window.dispatchEvent(new Event('crm_team_updated'));
      window.dispatchEvent(new Event('crm_data_updated'));
      window.dispatchEvent(new Event('storage'));

      // Also remove from crm_admin_accounts_list if it was an admin
      if (userToDelete.profileType === 'Admin' || userToDelete.isAdmin) {
        const rawAdmins = localStorage.getItem('crm_admin_accounts_list');
        if (rawAdmins) {
          const adminList: any[] = JSON.parse(rawAdmins);
          const filtered = adminList.filter(
            (a) =>
              String(a.id).toLowerCase() !== targetId &&
              (a.email ? a.email.toLowerCase() !== targetEmail : true)
          );
          localStorage.setItem('crm_admin_accounts_list', JSON.stringify(filtered));
          window.dispatchEvent(new Event('crm_admins_updated'));
        }
      }
    } catch (err) {
      console.error(err);
    }
    setUserToDelete(null);
    setIsDeleteUserModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Changes saved successfully.
        </div>
      )}

      {isAddUserModalOpen ? (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-visible">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <User className="w-4 h-4 text-slate-700" />
              <span>Add User</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded text-xs font-bold transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <form onSubmit={handleCezconAddUser} autoComplete="off" className="p-4 sm:p-6 bg-white space-y-4">
            {/* Decoy fields to block Chrome autofill from hijacking new user email/password */}
            <input type="text" name="crm_decoy_usr" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="crm_decoy_pwd" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 text-xs">
              {/* Left Column */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="new_admin_user_fullname"
                    autoComplete="off"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                    Email ID <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 inline-flex items-center justify-center text-[9px] font-bold">i</span>
                  </label>
                  <input
                    type="email"
                    name="new_admin_user_email_id"
                    autoComplete="new-password"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded border border-slate-300 overflow-hidden focus-within:border-sky-500 bg-white">
                    <input
                      type="text"
                      required
                      name="new_admin_user_username_alias"
                      autoComplete="off"
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      placeholder="Allowed only (a-z, 0-9)"
                      className="flex-1 px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                    />
                    <span className="bg-[#F8FAFC] border-l border-slate-300 px-3 py-1.5 text-xs text-slate-600 select-none font-medium">
                      @cooltechuae.com
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Allowed only (a z, 0 9)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={userFormData.showPassword ? 'text' : 'password'}
                      required
                      name="new_admin_user_secure_key"
                      autoComplete="new-password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 pr-8 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setUserFormData({ ...userFormData, showPassword: !userFormData.showPassword })}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {userFormData.showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {(() => {
                    const pwd = userFormData.password || '';
                    const hasUpperAndLower = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);
                    const hasNumber = /[0-9]/.test(pwd);
                    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
                    const hasMin8 = pwd.length >= 8;
                    return (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Password Strength:</span>
                          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className={`h-full transition-all duration-300 ${hasUpperAndLower && hasNumber && hasSpecial && hasMin8
                                ? 'bg-emerald-500 w-full'
                                : [hasUpperAndLower, hasNumber, hasSpecial, hasMin8].filter(Boolean).length >= 2
                                  ? 'bg-amber-500 w-1/2'
                                  : pwd.length > 0
                                    ? 'bg-rose-400 w-1/4'
                                    : 'w-0'
                                }`}
                            />
                          </div>
                        </div>
                        <div className="text-[10px] space-y-0.5 pl-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-xs flex items-center justify-center text-[8px] font-bold ${hasUpperAndLower ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                                }`}
                            >
                              ✓
                            </span>
                            <span className={hasUpperAndLower ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                              1 lowercase &amp; 1 uppercase
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-xs flex items-center justify-center text-[8px] font-bold ${hasNumber ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                                }`}
                            >
                              ✓
                            </span>
                            <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                              1 number (0-9)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-xs flex items-center justify-center text-[8px] font-bold ${hasSpecial ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                                }`}
                            >
                              ✓
                            </span>
                            <span className={hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                              1 Special Character (!@#$%^&amp;*).
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-xs flex items-center justify-center text-[8px] font-bold ${hasMin8 ? 'bg-emerald-600 text-white' : 'border border-slate-300 text-transparent'
                                }`}
                            >
                              ✓
                            </span>
                            <span className={hasMin8 ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                              Atleast 8 Character
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 inline-flex items-center justify-center text-[9px] font-bold">i</span> Image
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 bg-[#F8FAFC] border border-slate-300 rounded flex items-center justify-center text-slate-400 overflow-hidden">
                      {userFormData.avatarImage ? (
                        <img src={userFormData.avatarImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <User className="w-6 h-6 mx-auto text-slate-300" />
                          <span className="text-[9px] text-slate-400 block font-bold">?</span>
                        </div>
                      )}
                    </div>
                    <label className="px-3 py-1.5 rounded bg-[#737373] hover:bg-[#525252] text-white text-xs font-medium cursor-pointer shadow-xs transition-colors">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setUserFormData((prev) => ({ ...prev, avatarImage: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Mobile Number with Interactive Country Code & Real-Time Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Mobile Number
                    </label>
                    {userFormData.mobileNumber && (
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${isMobileValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isMobileValid ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 font-bold" />
                            <span>Valid Mobile</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            <span>Requires {selectedCountry.minDigits} digits</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 relative">
                    {/* Country Code Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryCodeDropdownOpen(!isCountryCodeDropdownOpen)}
                        className="h-full border border-slate-300 rounded bg-white px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
                      >
                        <span className="text-sm">{selectedCountry.flag}</span>
                        <span className="font-semibold">{selectedCountry.code}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      {isCountryCodeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsCountryCodeDropdownOpen(false)}
                          />
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-300 rounded shadow-xl z-50 p-2 text-xs animate-in fade-in duration-100">
                            <div className="relative mb-2">
                              <input
                                type="text"
                                autoFocus
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                placeholder="Search country or code..."
                                className="w-full border border-slate-300 rounded pl-7 pr-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                              />
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-0.5 divide-y divide-slate-100">
                              {filteredCountryCodes.map((c) => (
                                <button
                                  key={c.code + c.country}
                                  type="button"
                                  onClick={() => {
                                    setUserFormData((prev) => ({ ...prev, mobileCountry: c.code }));
                                    setIsCountryCodeDropdownOpen(false);
                                    setCountrySearchQuery('');
                                  }}
                                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-sky-50 transition-colors cursor-pointer ${userFormData.mobileCountry === c.code ? 'bg-sky-50/80 font-bold text-sky-700' : 'text-slate-700'
                                    }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-sm">{c.flag}</span>
                                    <span className="truncate max-w-[120px]">{c.country}</span>
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-500">{c.code}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Numeric Input with Clean Real-Time Formatting */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={userFormData.mobileNumber}
                        placeholder={selectedCountry.placeholder}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.maxDigits);
                          setUserFormData({ ...userFormData, mobileNumber: digitsOnly });
                        }}
                        className={`w-full bg-white border rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none transition-colors ${userFormData.mobileNumber && isMobileValid === false
                          ? 'border-amber-400 focus:border-amber-500'
                          : userFormData.mobileNumber && isMobileValid === true
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : 'border-slate-300 focus:border-sky-500'
                          }`}
                      />
                      {userFormData.mobileNumber && (
                        <button
                          type="button"
                          onClick={() => setUserFormData({ ...userFormData, mobileNumber: '' })}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                          title="Clear Mobile Number"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* DOB with Custom Interactive Calendar Popover, Fast Year Jumpers & Age Badge */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      DOB
                    </label>
                    {currentAge !== null && !isDobInFuture && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${currentAge >= 18 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        Age: {currentAge} yrs {currentAge < 18 ? '(Minor)' : ''}
                      </span>
                    )}
                    {isDobInFuture && (
                      <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>Invalid Future Date</span>
                      </span>
                    )}
                  </div>
                  <DatePicker
                    value={userFormData.dob}
                    onChange={(dateStr) => setUserFormData({ ...userFormData, dob: dateStr })}
                    isDob={true}
                    maxDate={new Date().toISOString().split('T')[0]}
                    placeholder="DD-MM-YYYY"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Select date of birth (Format: DD-MM-YYYY)</p>
                </div>


              </div>

              {/* Right Column */}
              <div className="space-y-3.5">
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Profile <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewProfile(true);
                        setNewProfileInput('');
                      }}
                      className="text-xs text-[#1677FF] hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                    >
                      + Add New
                    </button>
                  </div>

                  {isAddingNewProfile && (
                    <div className="mb-2 p-2 bg-slate-50 border border-slate-300 rounded text-xs space-y-1.5 animate-in fade-in">
                      <span className="text-[11px] font-semibold text-slate-700">Add New Profile:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newProfileInput}
                          onChange={(e) => setNewProfileInput(e.target.value)}
                          placeholder="e.g. Finance Specialist"
                          className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newProfileInput.trim()) {
                                const val = newProfileInput.trim();
                                if (!profileOptionsList.includes(val)) {
                                  setProfileOptionsList([...profileOptionsList, val]);
                                }
                                setUserFormData({ ...userFormData, profile: val });
                                setIsAddingNewProfile(false);
                                setNewProfileInput('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newProfileInput.trim()) {
                              const val = newProfileInput.trim();
                              if (!profileOptionsList.includes(val)) {
                                setProfileOptionsList([...profileOptionsList, val]);
                              }
                              setUserFormData({ ...userFormData, profile: val });
                              setIsAddingNewProfile(false);
                              setNewProfileInput('');
                            }
                          }}
                          className="px-2.5 py-1 bg-[#1677FF] hover:bg-[#0958d9] text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewProfile(false);
                            setNewProfileInput('');
                          }}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      setProfileSearchQuery('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-left text-slate-800 flex items-center justify-between focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span>{userFormData.profile || 'Select Profile'}</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {isProfileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-300 rounded shadow-lg z-50 p-1.5 animate-in fade-in duration-100">
                        <input
                          type="text"
                          autoFocus
                          value={profileSearchQuery}
                          onChange={(e) => setProfileSearchQuery(e.target.value)}
                          placeholder=""
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:border-sky-500"
                        />
                        <div className="max-h-48 overflow-y-auto text-xs border-t border-slate-100 pt-1">
                          {filteredProfileOptions.map((opt) => {
                            const isSelected = (userFormData.profile || 'Select Profile') === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const isMgr = opt === 'Manager' || opt.toLowerCase().includes('manager');
                                  const isEmp = opt === 'Employee' || opt.toLowerCase().includes('employee');
                                  const defaults = resolveDefaultPermissions(
                                    opt,
                                    isMgr ? 'manager' : isEmp ? 'employee' : undefined,
                                    isMgr ? userFormData.managerType : isEmp ? userFormData.employeeType : undefined
                                  );
                                  setUserFormData({
                                    ...userFormData,
                                    profile: opt,
                                    designation: isMgr
                                      ? userFormData.managerType
                                      : isEmp
                                        ? userFormData.employeeType
                                        : opt,
                                    dataScope: defaults.dataScope,
                                    modulePermissions: defaults.modulePermissions,
                                    actionPermissions: defaults.actionPermissions,
                                  });
                                  setIsProfileDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors block ${isSelected
                                  ? 'bg-[#337AB7] text-white font-medium'
                                  : 'text-slate-800 hover:bg-[#F1F5F9]'
                                  }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Dynamic Manager Type Field */}
                {(userFormData.profile === 'Manager' || userFormData.profile.toLowerCase().includes('manager')) && (
                  <div className="bg-blue-50/50 border border-blue-200/80 rounded p-2.5 space-y-1">
                    <label className="block text-xs font-semibold text-blue-900 mb-1">
                      Manager Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={userFormData.managerType}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        const defaults = resolveDefaultPermissions('Manager', 'manager', selectedType);
                        setUserFormData({
                          ...userFormData,
                          managerType: selectedType,
                          designation: selectedType,
                          dataScope: defaults.dataScope,
                          modulePermissions: defaults.modulePermissions,
                          actionPermissions: defaults.actionPermissions,
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      {MANAGER_TYPE_OPTIONS.map((mType) => (
                        <option key={mType} value={mType}>
                          {mType}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-blue-700">Pre-populates default permissions for {userFormData.managerType}.</p>
                  </div>
                )}

                {/* Dynamic Employee Type & Reporting Manager Fields */}
                {(userFormData.profile === 'Employee' || userFormData.profile.toLowerCase().includes('employee')) && (
                  <div className="bg-emerald-50/50 border border-emerald-200/80 rounded p-2.5 space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">
                        Employee Type <span className="text-red-500">*</span>
                        {isManagerSession && managerDeptType && (
                          <span className="ml-2 text-[10px] text-emerald-600 font-normal">(restricted to your department)</span>
                        )}
                      </label>
                      <select
                        value={isManagerSession && managerDeptType ? managerDeptType : userFormData.employeeType}
                        onChange={(e) => {
                          if (isManagerSession && managerDeptType) return; // locked for managers
                          const selectedType = e.target.value;
                          const defaults = resolveDefaultPermissions('Employee', 'employee', selectedType);
                          setUserFormData({
                            ...userFormData,
                            employeeType: selectedType,
                            designation: selectedType,
                            dataScope: defaults.dataScope,
                            modulePermissions: defaults.modulePermissions,
                            actionPermissions: defaults.actionPermissions,
                          });
                        }}
                        disabled={isManagerSession && !!managerDeptType}
                        className={`w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 ${isManagerSession && managerDeptType
                          ? 'cursor-not-allowed opacity-75 bg-slate-50'
                          : 'cursor-pointer'
                          }`}
                      >
                        {allowedEmployeeTypes.map((eType) => (
                          <option key={eType} value={eType}>
                            {eType}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">
                        Reporting Manager <span className="text-red-500">*</span>
                        {isManagerSession && (
                          <span className="ml-2 text-[10px] text-emerald-600 font-normal">(auto-assigned to you)</span>
                        )}
                      </label>
                      {isManagerSession ? (
                        // Manager sees a locked read-only field — employee reports to them
                        <div className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-700 cursor-not-allowed select-none">
                          {loggedInUser?.name || 'You'} ({loggedInUser?.designation || loggedInUser?.managerType || 'Manager'})
                        </div>
                      ) : (
                        <select
                          value={userFormData.assignedManagerId}
                          onChange={(e) => setUserFormData({ ...userFormData, assignedManagerId: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="">Select Manager</option>
                          {availableManagers.map((mgr) => (
                            <option key={mgr.id} value={mgr.id}>
                              {mgr.name} ({mgr.managerType}) — {mgr.email}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-[10px] text-emerald-700 mt-1">Assigns this employee dynamically to the manager&apos;s team roster.</p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Business Opportunity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewOpportunity(true);
                          setNewOpportunityInput('');
                        }}
                        className="text-xs text-[#1677FF] hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                      >
                        + Add New
                      </button>
                      <label className="text-xs text-slate-600 flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={userFormData.businessOpportunityAll}
                          onChange={(e) => setUserFormData({ ...userFormData, businessOpportunityAll: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600"
                        />
                        <span>All</span>
                      </label>
                    </div>
                  </div>

                  {isAddingNewOpportunity && (
                    <div className="mb-2 p-2 bg-slate-50 border border-slate-300 rounded text-xs space-y-1.5 animate-in fade-in">
                      <span className="text-[11px] font-semibold text-slate-700">Add New Business Opportunity:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newOpportunityInput}
                          onChange={(e) => setNewOpportunityInput(e.target.value)}
                          placeholder="e.g. Fire Fighting Systems"
                          className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newOpportunityInput.trim()) {
                                const val = newOpportunityInput.trim();
                                if (!businessOpportunitiesList.includes(val)) {
                                  setBusinessOpportunitiesList([...businessOpportunitiesList, val]);
                                }
                                setUserFormData({ ...userFormData, businessOpportunity: val });
                                setIsAddingNewOpportunity(false);
                                setNewOpportunityInput('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newOpportunityInput.trim()) {
                              const val = newOpportunityInput.trim();
                              if (!businessOpportunitiesList.includes(val)) {
                                setBusinessOpportunitiesList([...businessOpportunitiesList, val]);
                              }
                              setUserFormData({ ...userFormData, businessOpportunity: val });
                              setIsAddingNewOpportunity(false);
                              setNewOpportunityInput('');
                            }
                          }}
                          className="px-2.5 py-1 bg-[#1677FF] hover:bg-[#0958d9] text-white rounded font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewOpportunity(false);
                            setNewOpportunityInput('');
                          }}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={userFormData.businessOpportunity}
                    onChange={(e) => setUserFormData({ ...userFormData, businessOpportunity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 cursor-pointer"
                  >
                    {businessOpportunitiesList.map((opp) => (
                      <option key={opp} value={opp}>
                        {opp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Designation</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewDesignation(true);
                        setNewDesignationInput('');
                      }}
                      className="text-xs text-[#1677FF] hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                    >
                      + Add New
                    </button>
                  </div>

                  {isAddingNewDesignation && (
                    <div className="mb-2 p-2 bg-slate-50 border border-slate-300 rounded text-xs space-y-1.5 animate-in fade-in">
                      <span className="text-[11px] font-semibold text-slate-700">Add New Designation:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newDesignationInput}
                          onChange={(e) => setNewDesignationInput(e.target.value)}
                          placeholder="e.g. Chief Technical Officer"
                          className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newDesignationInput.trim()) {
                                const val = newDesignationInput.trim();
                                if (!designationsList.includes(val)) {
                                  setDesignationsList([...designationsList, val]);
                                }
                                setUserFormData({ ...userFormData, designation: val });
                                setIsAddingNewDesignation(false);
                                setNewDesignationInput('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newDesignationInput.trim()) {
                              const val = newDesignationInput.trim();
                              if (!designationsList.includes(val)) {
                                setDesignationsList([...designationsList, val]);
                              }
                              setUserFormData({ ...userFormData, designation: val });
                              setIsAddingNewDesignation(false);
                              setNewDesignationInput('');
                            }
                          }}
                          className="px-2.5 py-1 bg-[#002B49] text-white rounded text-[11px] font-bold hover:bg-[#001D33] cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewDesignation(false)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-medium hover:bg-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsDesignationDropdownOpen(!isDesignationDropdownOpen);
                      setDesignationSearchQuery('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-left text-slate-800 flex items-center justify-between focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <span>{userFormData.designation || 'Select'}</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {isDesignationDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDesignationDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-300 rounded shadow-lg z-50 p-1.5 animate-in fade-in duration-100">
                        <input
                          type="text"
                          autoFocus
                          value={designationSearchQuery}
                          onChange={(e) => setDesignationSearchQuery(e.target.value)}
                          placeholder=""
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:border-sky-500"
                        />
                        <div className="max-h-48 overflow-y-auto text-xs border-t border-slate-100 pt-1">
                          {filteredDesignationOptions.map((opt) => {
                            const isSelected = (userFormData.designation || 'Select') === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setUserFormData({ ...userFormData, designation: opt });
                                  setIsDesignationDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors block ${isSelected
                                  ? 'bg-[#337AB7] text-white font-medium'
                                  : 'text-slate-800 hover:bg-[#F1F5F9]'
                                  }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                          {filteredDesignationOptions.length === 0 && (
                            <div className="p-2 text-center text-slate-400 text-xs">
                              No designations found
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>



                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-700">Sales Visit Add Permission</span>
                  <input
                    type="checkbox"
                    checked={userFormData.salesVisitPermission}
                    onChange={(e) => setUserFormData({ ...userFormData, salesVisitPermission: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Store</span>
                    <label className="text-xs text-slate-600 flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={userFormData.storeAll}
                        onChange={(e) => setUserFormData({ ...userFormData, storeAll: e.target.checked })}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600"
                      />
                      <span>All</span>
                    </label>
                  </div>
                  <select
                    value={userFormData.store}
                    onChange={(e) => setUserFormData({ ...userFormData, store: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 cursor-pointer"
                  >
                    <option value="None">None selected</option>
                    <option value="All Stores">All Stores</option>
                    <option value="Dubai Main Warehouse">Dubai Main Warehouse</option>
                    <option value="Abu Dhabi Branch Store">Abu Dhabi Branch Store</option>
                  </select>
                </div>
              </div>

              {/* Expandable Section: Access Control, Permissions & Reporting Manager */}
              <div className="col-span-1 lg:col-span-2 border border-slate-200 rounded-md overflow-hidden bg-white mt-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsPermissionsExpanded(!isPermissionsExpanded)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-bold text-slate-800 transition-colors cursor-pointer border-b border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00838F]" />
                    <span className="font-bold text-slate-800">Access Control, Granular Permissions &amp; Reporting Manager</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#1677FF] hover:text-[#0958d9] flex items-center gap-1">
                    {isPermissionsExpanded ? 'Hide Controls ▲' : 'Configure Permissions & Manager ▼'}
                  </span>
                </button>

                {isPermissionsExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 bg-white text-xs animate-in fade-in duration-150">
                    {/* Row 1: Reporting Manager & Data Scope */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Reporting Manager Email
                        </label>
                        <input
                          type="text"
                          value={userFormData.assignedManagerId}
                          onChange={(e) => setUserFormData({ ...userFormData, assignedManagerId: e.target.value })}
                          placeholder="e.g. manager@gmail.com"
                          autoComplete="off"
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]/20"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Type the manager&apos;s email address to assign them as the direct reporting supervisor</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            Data Visibility Scope
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsAddingCustomScope(!isAddingCustomScope)}
                            className="text-[11px] text-[#00838F] hover:text-[#006064] hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                          >
                            + Add Scope
                          </button>
                        </div>

                        {isAddingCustomScope && (
                          <div className="mb-2 p-2.5 bg-sky-50/70 border border-sky-200 rounded-md flex items-center gap-2 animate-in fade-in">
                            <input
                              type="text"
                              value={customScopeInput}
                              onChange={(e) => setCustomScopeInput(e.target.value)}
                              placeholder="Type custom scope (e.g. GCC Region, Level-2 Leads)..."
                              className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#1677FF]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomScope();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomScope}
                              className="px-3 py-1 rounded bg-[#1677FF] hover:bg-[#0958d9] text-white text-xs font-semibold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingCustomScope(false);
                                setCustomScopeInput('');
                              }}
                              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 text-xs font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        <select
                          value={userFormData.dataScope}
                          onChange={(e) => setUserFormData({ ...userFormData, dataScope: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]/20"
                        >
                          {dataScopeList.map((scope) => (
                            <option key={scope.value} value={scope.value}>
                              {scope.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Controls which records this user can view across dashboards</p>
                      </div>
                    </div>

                    {/* Row 2: Module Permissions */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="block text-xs font-bold text-slate-800">
                            Permitted CRM Modules:
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                            {moduleOptionsList.filter((m) => !!userFormData.modulePermissions[m.key]).length}/{moduleOptionsList.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingCustomModule(!isAddingCustomModule)}
                            className="text-[11px] text-[#00838F] hover:text-[#006064] hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                          >
                            + Add Option
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllModules(true)}
                            className="text-[11px] text-[#1677FF] hover:underline font-medium cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllModules(false)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 hover:underline font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {isAddingCustomModule && (
                        <div className="mb-2 p-2.5 bg-sky-50/70 border border-sky-200 rounded-md flex items-center gap-2 animate-in fade-in">
                          <input
                            type="text"
                            value={customModuleInput}
                            onChange={(e) => setCustomModuleInput(e.target.value)}
                            placeholder="Type new module name (e.g. Warranty & Claims)..."
                            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#1677FF]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomModule();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomModule}
                            className="px-3 py-1 rounded bg-[#1677FF] hover:bg-[#0958d9] text-white text-xs font-semibold cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCustomModule(false);
                              setCustomModuleInput('');
                            }}
                            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-[#F8FAFC] p-3 rounded-md border border-slate-200 max-h-56 overflow-y-auto">
                        {moduleOptionsList.map((mod) => (
                          <label
                            key={mod.key}
                            className="flex items-center gap-2 p-1 rounded hover:bg-white transition-colors cursor-pointer select-none text-slate-700 hover:text-slate-900 font-medium text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={!!userFormData.modulePermissions[mod.key]}
                              onChange={(e) =>
                                setUserFormData({
                                  ...userFormData,
                                  modulePermissions: {
                                    ...userFormData.modulePermissions,
                                    [mod.key]: e.target.checked,
                                  },
                                })
                              }
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677FF] accent-[#1677FF] focus:ring-0 cursor-pointer"
                            />
                            <span className="truncate" title={mod.label}>{mod.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Row 3: Action Permissions */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="block text-xs font-bold text-slate-800">
                            Action &amp; Modification Permissions:
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                            {actionOptionsList.filter((a) => !!userFormData.actionPermissions[a.key]).length}/{actionOptionsList.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingCustomAction(!isAddingCustomAction)}
                            className="text-[11px] text-[#00838F] hover:text-[#006064] hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                          >
                            + Add Option
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllActions(true)}
                            className="text-[11px] text-[#1677FF] hover:underline font-medium cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllActions(false)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 hover:underline font-medium cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {isAddingCustomAction && (
                        <div className="mb-2 p-2.5 bg-sky-50/70 border border-sky-200 rounded-md flex items-center gap-2 animate-in fade-in">
                          <input
                            type="text"
                            value={customActionInput}
                            onChange={(e) => setCustomActionInput(e.target.value)}
                            placeholder="Type new action name (e.g. Approve Discounts, Void Invoices)..."
                            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#1677FF]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomAction();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomAction}
                            className="px-3 py-1 rounded bg-[#1677FF] hover:bg-[#0958d9] text-white text-xs font-semibold cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCustomAction(false);
                              setCustomActionInput('');
                            }}
                            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 bg-[#F8FAFC] p-3 rounded-md border border-slate-200 max-h-56 overflow-y-auto">
                        {actionOptionsList.map((act) => (
                          <label
                            key={act.key}
                            className="flex items-center gap-2 p-1 rounded hover:bg-white transition-colors cursor-pointer select-none text-slate-700 hover:text-slate-900 font-medium text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={!!userFormData.actionPermissions[act.key]}
                              onChange={(e) =>
                                setUserFormData({
                                  ...userFormData,
                                  actionPermissions: {
                                    ...userFormData.actionPermissions,
                                    [act.key]: e.target.checked,
                                  },
                                })
                              }
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#1677FF] accent-[#1677FF] focus:ring-0 cursor-pointer"
                            />
                            <span className="truncate" title={act.label}>{act.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 col-span-1 lg:col-span-2">
                <button
                  type="submit"
                  disabled={isCreatingFirebaseUser}
                  className={`px-5 py-1.5 rounded bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isCreatingFirebaseUser ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isCreatingFirebaseUser ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving & Registering in Firebase...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>←</span> Back
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : activeViewUser ? (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          {/* Top Bar with Red Close Button */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <User className="w-4 h-4 text-slate-700" />
              <span>User Details</span>
            </div>
            <button
              type="button"
              onClick={handleCloseUserDetails}
              className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded text-xs font-bold transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 bg-white">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 border-b-2 border-[#D9534F] text-[#D9534F] font-bold text-xs bg-white cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>User</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs bg-transparent cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>User Expense</span>
            </button>
          </div>

          {/* Inner Panel */}
          <div className="p-4 sm:p-6 bg-[#FAFBFD] space-y-4">
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <div className="px-4 py-2 bg-[#F1F5F9] border-b border-slate-200 flex items-center gap-2 font-bold text-xs text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-700" />
                <span>User Details</span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 text-xs text-slate-800">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Name</span>
                    <span className="col-span-2 font-bold text-slate-900 uppercase">{activeViewUser.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Username</span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.username}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <span className="text-amber-500">📱</span> Mobile Number
                    </span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.phone || '+971554853829'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">DOB</span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.dob || '20-05-1968'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className="col-span-2 font-bold text-emerald-600">{activeViewUser.status}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Sales Visit Add Permission</span>
                    <span className="col-span-2 text-emerald-600 font-bold">
                      <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-[10px]">✓</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Assigned Stores</span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.store || 'All Stores'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Login Permission</span>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-base" title="Web">🖥️</span>
                      <span className="text-base" title="Mobile">📱</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Reporting Manager</span>
                    <span className="col-span-2 font-semibold text-slate-800 text-xs">
                      {activeViewUser.managerId || activeViewUser.reportingManagerId || 'manager@gmail.com'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Data Scope</span>
                    <span className="col-span-2 font-semibold text-slate-800 text-xs capitalize">
                      {activeViewUser.dataScope === 'all'
                        ? 'All Company Records'
                        : activeViewUser.dataScope === 'own'
                          ? 'Own Assigned Only'
                          : 'Team / Department'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">ESS Account</span>
                    <div className="col-span-2">
                      <button
                        type="button"
                        className="px-2.5 py-0.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        + Assign
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Email ID</span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Designation</span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.designation || activeViewUser.profileType || 'COO'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-start">
                    <span className="text-slate-500 font-medium pt-1">Image</span>
                    <div className="col-span-2">
                      {activeViewUser.avatarImage ? (
                        <img src={activeViewUser.avatarImage} alt="" className="w-12 h-14 object-cover border border-slate-200 rounded" />
                      ) : (
                        <div className="w-12 h-14 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-400">
                          <User className="w-7 h-7 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Business Opportunity</span>
                    <span className="col-span-2 font-bold text-slate-900">{activeViewUser.businessOpportunity || 'All Works'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-start">
                    <span className="text-slate-500 font-medium pt-1">User Seal &amp; Signature</span>
                    <div className="col-span-2">
                      {activeViewUser.signatureImage ? (
                        <img src={activeViewUser.signatureImage} alt="" className="h-14 border border-slate-200 rounded p-1" />
                      ) : (
                        <div className="w-20 h-14 bg-white border border-slate-200 rounded flex items-center justify-center p-1 text-center">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-900/40 flex items-center justify-center text-[8px] font-bold text-blue-900 uppercase">
                            Cooltech
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 items-center">
                    <span className="text-slate-500 font-medium">Two Factor Authentication</span>
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded bg-[#D9534F] text-white text-[10px] font-bold tracking-wide">
                        Disabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCloseUserDetails}
                className="px-4 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>←</span> Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Users Directory</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUserFormData({
                  name: '',
                  email: '',
                  username: '',
                  password: '',
                  showPassword: false,
                  mobileCountry: '+971',
                  mobileNumber: '',
                  dob: '',
                  profile: '',
                  managerType: 'Sales Manager',
                  employeeType: 'Sales Employee',
                  assignedManagerId: '',
                  businessOpportunity: 'None',
                  businessOpportunityAll: false,
                  designation: '',
                  signatureImage: null,
                  avatarImage: null,
                  loginPermission: 'Web & Mobile',
                  salesVisitPermission: false,
                  store: 'None',
                  storeAll: false,
                  isWorker: false,
                  monthlyTargets: false,
                  dataScope: 'team',
                  modulePermissions: {
                    dashboard: true,
                    tasks: true,
                    leads: true,
                    customers: true,
                    sales: true,
                    invoices: true,
                    purchase: false,
                    manufacturing: false,
                    service: false,
                    materials: false,
                    timesheet: false,
                    marketing: false,
                    whatsapp: false,
                    financials: false,
                    reports: true,
                    fileManager: true,
                    users: false,
                    settings: false,
                  },
                  actionPermissions: {
                    canView: true,
                    canCreate: true,
                    canEdit: true,
                    canDelete: false,
                    canExport: true,
                    canPrint: true,
                    canApprove: false,
                    canImport: false,
                    canReassign: false,
                    canViewFinancials: false,
                  },
                });
                setIsAddUserModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + USER
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 text-xs bg-white">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Show</span>
                <select
                  value={userRowsPerPage}
                  onChange={(e) => setUserRowsPerPage(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-slate-600">Rows</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600">Profile:</span>
                <select
                  value={userProfileFilter}
                  onChange={(e) => setUserProfileFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                >
                  <option value="All">All Profiles</option>
                  {isSuperAdminSession && <option value="Admin">Admin</option>}
                  <option value="Manager">Manager</option>
                  <option value="Worker">Worker</option>
                  <option value="Employee">Employee</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>

            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search user..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[280px] pb-20">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">SL.No</th>
                  <th className="py-2.5 px-4 min-w-[140px]">Name</th>
                  <th className="py-2.5 px-4 min-w-[160px]">Email ID</th>
                  <th className="py-2.5 px-4 min-w-[160px]">Username</th>
                  <th className="py-2.5 px-3 text-center min-w-[110px]">Profile Type</th>
                  <th className="py-2.5 px-3 text-center min-w-[100px]">Login Permission</th>
                  <th className="py-2.5 px-3 text-center min-w-[90px]">Status</th>
                  <th className="py-2.5 px-3 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCezconUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-500 bg-white">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No users found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Click &quot;+ USER&quot; above to create accounts.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCezconUsers.slice(0, userRowsPerPage).map((u, idx) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 text-slate-700">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.username}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                          {u.managerType || u.employeeType || u.profileType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{u.loginPermission || 'Web & Mobile'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionUserId((prev) => (prev === u.id ? null : u.id));
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[3px] bg-[#005B60] hover:bg-[#00474B] text-white text-xs font-bold transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <SettingsIcon className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 stroke-[2.5]" />
                          </button>

                          {openActionUserId === u.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenActionUserId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-[155px] bg-white border border-slate-200 rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-50 py-1 text-slate-800 animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionUserId(null);
                                    window.open(`/settings?tab=users&userId=${u.id}`, '_blank');
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                >
                                  <svg className="w-3.5 h-3.5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 3h10v2H7V5zm0 4h10v2H7V9zm0 4h7v2H7v-2z" />
                                  </svg>
                                  <span>Open in new tab</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionUserId(null);
                                    setViewUserModalData(u);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                >
                                  <svg className="w-3.5 h-3.5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 3h10v2H7V5zm0 4h10v2H7V9zm0 4h7v2H7v-2z" />
                                  </svg>
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionUserId(null);
                                    handleEditUser(u);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                >
                                  <svg className="w-3.5 h-3.5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                  </svg>
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionUserId(null);
                                    setAssignWorkerUser(u);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                >
                                  <svg className="w-3.5 h-3.5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                  <span>Make Worker</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionUserId(null);
                                    setUserToDelete(u);
                                    setIsDeleteUserModalOpen(true);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-50 text-[13px] text-rose-600 cursor-pointer font-normal border-t border-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
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

      {/* Assign Worker Modal */}
      {assignWorkerUser && (
        <Modal
          isOpen={!!assignWorkerUser}
          onClose={() => setAssignWorkerUser(null)}
          title="Assign Worker"
        >
          <form onSubmit={handleAssignWorkerSubmit} className="space-y-4 text-xs">
            {/* NEW vs EXISTING tabs */}
            <div className="flex justify-center mb-2">
              <div className="inline-flex rounded border border-slate-200 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setAssignWorkerTab('NEW')}
                  className={`px-6 py-1.5 font-bold transition-colors cursor-pointer ${assignWorkerTab === 'NEW'
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  NEW
                </button>
                <button
                  type="button"
                  onClick={() => setAssignWorkerTab('EXISTING')}
                  className={`px-6 py-1.5 font-bold transition-colors cursor-pointer border-l border-slate-200 ${assignWorkerTab === 'EXISTING'
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  EXISTING
                </button>
              </div>
            </div>

            {assignWorkerTab === 'NEW' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Worker Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={workerFormData.workerCode}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, workerCode: e.target.value })}
                    placeholder=""
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={workerFormData.grade}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, grade: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500"
                  >
                    <option value="Select">Select</option>
                    <option value="Senior Technician">Senior Technician</option>
                    <option value="HVAC Specialist">HVAC Specialist</option>
                    <option value="Junior Worker">Junior Worker</option>
                    <option value="Electrician">Electrician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                    Hourly Rate <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 inline-flex items-center justify-center text-[9px] font-bold">i</span>
                  </label>
                  <input
                    type="number"
                    value={workerFormData.hourlyRate}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, hourlyRate: e.target.value })}
                    placeholder=""
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Joining Date
                  </label>
                  <DatePicker
                    value={workerFormData.joiningDate}
                    onChange={(dateStr) => setWorkerFormData({ ...workerFormData, joiningDate: dateStr })}
                    placeholder="DD-MM-YYYY"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Existing Worker <span className="text-red-500">*</span>
                </label>
                <select
                  value={workerFormData.existingWorker}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, existingWorker: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 cursor-pointer"
                >
                  <option value="">Select Existing Worker</option>
                  <option value="WRK-1001">WRK-1001 - Muhammed Shemin</option>
                  <option value="WRK-1002">WRK-1002 - Rashid Al Nuaimi</option>
                </select>
              </div>
            )}

            <p className="text-[11px] text-amber-600 italic mt-2">
              * Once a worker is assigned, the user will be automatically logged out of the web application and needs to log in again.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignWorkerUser(null)}
                className="px-4 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Modal */}
      {isDeleteUserModalOpen && userToDelete && (
        <Modal
          isOpen={isDeleteUserModalOpen}
          onClose={() => setIsDeleteUserModalOpen(false)}
          title="Confirm Delete User"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700">
              Are you sure you want to delete user <span className="font-bold text-slate-900">{userToDelete.name}</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteUserModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
