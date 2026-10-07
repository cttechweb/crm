'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Search,
  Trash2,
  Phone,
  Mail,
  User,
  ExternalLink,
  Calendar,
  X,
  Upload,
  UserCheck,
  Info,
  Settings,
  ChevronDown,
  Building,
  Tag,
  Eye,
  Edit2,
  BookOpen,
  FileText,
  ShoppingCart,
  MapPin,
  Globe,
  DollarSign,
  Briefcase,
  Layers,
  Award,
  Calculator,
  ThumbsUp,
  Snowflake,
  Folder,
  List,
  Clock,
  Receipt,
  FileCheck,
  History,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  Check,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  CreditCard,
  Download,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { canAccessCustomer } from '@/services/crmDataScopeService';
import { CrmCustomer } from '@/types/enterprise-crm';
import { cn, formatCurrency } from '@/lib/utils';

// Country dial codes with flags and validation rules
const COUNTRY_CODES_LIST = [
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE', minDigits: 7, maxDigits: 10, placeholder: '04 123 4567 / 50 123 4567' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA', minDigits: 9, maxDigits: 9, placeholder: '50 123 4567' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA', minDigits: 8, maxDigits: 8, placeholder: '33 123 456' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM', minDigits: 8, maxDigits: 8, placeholder: '91 123 456' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH', minDigits: 8, maxDigits: 8, placeholder: '39 123 456' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW', minDigits: 8, maxDigits: 8, placeholder: '91 234 567' },
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN', minDigits: 10, maxDigits: 10, placeholder: '98765 43210' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB', minDigits: 10, maxDigits: 10, placeholder: '7911 123456' },
  { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US', minDigits: 10, maxDigits: 10, placeholder: '202 555 0123' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE', minDigits: 10, maxDigits: 11, placeholder: '151 1234567' },
  { code: '+86', country: 'China', flag: '🇨🇳', iso: 'CN', minDigits: 11, maxDigits: 11, placeholder: '138 0013 8000' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG', minDigits: 10, maxDigits: 10, placeholder: '10 1234 5678' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK', minDigits: 10, maxDigits: 10, placeholder: '300 1234567' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', iso: 'JO', minDigits: 9, maxDigits: 9, placeholder: '7 9012 3456' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', iso: 'LB', minDigits: 7, maxDigits: 8, placeholder: '70 123 456' },
];

const COUNTRY_OPTIONS_LIST = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Bahrain',
  'Kuwait',
  'India',
  'Pakistan',
  'Egypt',
  'Jordan',
  'Lebanon',
  'United Kingdom',
  'United States',
  'Germany',
  'China',
  'Singapore',
  'Turkey',
  'Canada',
  'Australia',
  'Philippines',
  'Malaysia',
  'South Africa',
  'Other',
];

const REGION_OPTIONS_MAP: Record<string, string[]> = {
  'United Arab Emirates': [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
    'Al Ain',
  ],
  'Saudi Arabia': [
    'Riyadh',
    'Jeddah',
    'Dammam',
    'Mecca',
    'Medina',
    'Khobar',
    'Dhahran',
    'Tabuk',
    'Jubail',
  ],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Seeb'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Al Ahmadi', 'Farwaniya'],
  'India': ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Gujarat', 'Telangana', 'Uttar Pradesh', 'West Bengal'],
};

const POPULAR_LOCATIONS_LIST = [
  'Mussafah Industrial Area, Abu Dhabi',
  'Mussafah Zone M-42, Abu Dhabi',
  'Mussafah Zone M-12, Abu Dhabi',
  'Industrial City of Abu Dhabi (ICAD)',
  'Khalifa Industrial Zone Abu Dhabi (KIZAD)',
  'Mohamed Bin Zayed City (MBZ), Abu Dhabi',
  'Mina Zayed, Abu Dhabi',
  'Al Ain Industrial Area',
  'Business Bay, Dubai',
  'Al Quoz Industrial Area 1-4, Dubai',
  'JAFZA (Jebel Ali Free Zone), Dubai',
  'Dubai Investment Park (DIP 1 & 2)',
  'Dubai Silicon Oasis (DSO)',
  'Ras Al Khor Industrial Area, Dubai',
  'Deira, Dubai',
  'Bur Dubai, Dubai',
  'Al Barsha, Dubai',
  'Dubai South (DWC)',
  'Sharjah Industrial Area 1-18',
  'Hamriyah Free Zone, Sharjah',
  'Saif Zone, Sharjah',
  'Ajman Free Zone',
  'Ajman Industrial Area',
  'Ras Al Khaimah Free Trade Zone (RAKEZ)',
  'Fujairah Free Zone',
];

const validatePhoneNumber = (val: string, code: string = '+971'): { isValid: boolean; message?: string } => {
  if (!val || !val.trim()) return { isValid: true };
  const digitsOnly = val.replace(/\D/g, '');
  if (!/^[0-9\s\-+()]+$/.test(val)) {
    return { isValid: false, message: 'Please enter numbers, spaces, and hyphens only.' };
  }
  if (digitsOnly.length < 7) {
    return { isValid: false, message: 'Contact number is too short (min 7 digits required).' };
  }
  if (code === '+971' && digitsOnly.length > 10) {
    return { isValid: false, message: 'UAE contact numbers cannot exceed 10 digits.' };
  }
  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Contact number cannot exceed 15 digits.' };
  }
  return { isValid: true };
};

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect legacy query parameters if any
  useEffect(() => {
    const view = searchParams.get('view');
    const tab = searchParams.get('tab');

    if (view === 'contacts' || tab === 'contacts') {
      router.replace('/customers/contacts');
    } else if (view === 'groups' || tab === 'groups') {
      router.replace('/customers/groups');
    } else if (view === 'activities' || tab === 'activities') {
      router.replace('/customers/activities');
    } else if (view === 'followups' || tab === 'followups') {
      router.replace('/customers/followups');
    } else if (view === 'reports' || tab === 'reports') {
      router.replace('/customers/reports');
    }
  }, [searchParams, router]);

  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    users,
    campaigns,
    salesOpportunities,
    quotations,
    salesOrders,
    invoices,
    receipts,
    globalSearch,
  } = useEnterpriseCrm();

  // Top Tabs: 'All' | 'Customer' | 'Prospect'
  const [activeTab, setActiveTab] = useState<'All' | 'Customer' | 'Prospect'>('All');
  const [activeCustomerSubTab, setActiveCustomerSubTab] = useState<string>('customer');
  const [activeActivityTab, setActiveActivityTab] = useState<'notes' | 'task' | 'files' | 'sales_visit'>('notes');
  const [assignUser, setAssignUser] = useState('');

  // Top Filter Grid State
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [keyCustomerFilter, setKeyCustomerFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [tagsFilter, setTagsFilter] = useState('');
  const [assignedDateFilter, setAssignedDateFilter] = useState('');
  const [noOrdersAfterDate, setNoOrdersAfterDate] = useState('');

  // Table Controls & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Action Menus
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadOwner, setUploadOwner] = useState('');
  const [uploadDateFormat, setUploadDateFormat] = useState('MM/DD/YYYY');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddParentModalOpen, setIsAddParentModalOpen] = useState(false);
  const [newParentCustomerName, setNewParentCustomerName] = useState('');
  const [customParentOptions, setCustomParentOptions] = useState<string[]>([]);
  const [viewingCustomer, setViewingCustomer] = useState<CrmCustomer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CrmCustomer | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const customerParamId = searchParams.get('id');
  const activeCustomer =
    viewingCustomer ||
    (customerParamId
      ? customers.find((c) => c.id === customerParamId || String(c.slNo) === customerParamId)
      : null);

  const closeCustomerView = () => {
    setViewingCustomer(null);
    if (customerParamId) {
      router.push('/customers');
    }
  };

  // Live linked data for active viewing customer
  const activeCustomerOpportunities = useMemo(() => {
    if (!activeCustomer) return [];
    const name = (activeCustomer.customerName || '').trim().toLowerCase();
    const id = (activeCustomer.id || '').trim().toLowerCase();
    return (salesOpportunities || []).filter((opp) => {
      const oppCust = (opp.customer || '').trim().toLowerCase();
      const oppCustId = String((opp as any).customerId || '').trim().toLowerCase();
      return (name && (oppCust === name || oppCust.includes(name) || name.includes(oppCust))) ||
        (id && (oppCustId === id || oppCustId.includes(id)));
    });
  }, [salesOpportunities, activeCustomer]);

  const activeCustomerOrders = useMemo(() => {
    if (!activeCustomer) return [];
    const name = (activeCustomer.customerName || '').trim().toLowerCase();
    const id = (activeCustomer.id || '').trim().toLowerCase();
    return (salesOrders || []).filter((ord) => {
      const ordCust = (ord.customer || '').trim().toLowerCase();
      const ordCustId = String((ord as any).customerId || '').trim().toLowerCase();
      return (name && (ordCust === name || ordCust.includes(name) || name.includes(ordCust))) ||
        (id && (ordCustId === id || ordCustId.includes(id)));
    });
  }, [salesOrders, activeCustomer]);

  const activeCustomerInvoices = useMemo(() => {
    if (!activeCustomer) return [];
    const name = (activeCustomer.customerName || '').trim().toLowerCase();
    const id = (activeCustomer.id || '').trim().toLowerCase();
    return (invoices || []).filter((inv) => {
      const invCust = (inv.customer || '').trim().toLowerCase();
      const invCustId = String((inv as any).customerId || '').trim().toLowerCase();
      return (name && (invCust === name || invCust.includes(name) || name.includes(invCust))) ||
        (id && (invCustId === id || invCustId.includes(id)));
    });
  }, [invoices, activeCustomer]);

  const activeCustomerReceipts = useMemo(() => {
    if (!activeCustomer) return [];
    const name = (activeCustomer.customerName || '').trim().toLowerCase();
    const id = (activeCustomer.id || '').trim().toLowerCase();
    return (receipts || []).filter((rec) => {
      const recCust = (rec.customer || '').trim().toLowerCase();
      const recCustId = String((rec as any).customerId || '').trim().toLowerCase();
      return (name && (recCust === name || recCust.includes(name) || name.includes(recCust))) ||
        (id && (recCustId === id || recCustId.includes(id)));
    });
  }, [receipts, activeCustomer]);

  const activeCustomerOverviewMetrics = useMemo(() => {
    if (!activeCustomer) return null;
    const totalEnquiries = activeCustomerOpportunities.length || activeCustomer.openEnquiries || 1;
    const openEnquiries = activeCustomerOpportunities.filter((o) => !['Won', 'Lost', 'Closed Lost'].includes(o.stage)).length || activeCustomer.openEnquiries || (activeCustomerOpportunities.length > 0 ? activeCustomerOpportunities.length : 1);
    const lastEnquiry = activeCustomer.lastEnquiry || (activeCustomerOpportunities[0]?.opportunityDate ? `${activeCustomerOpportunities[0].opportunityDate}` : 'Today');

    const totalOrders = activeCustomerOrders.length || activeCustomerOpportunities.filter((o) => o.stage === 'Order' || o.stage === 'Won').length;
    const conversionRatio = totalEnquiries > 0 ? `${((totalOrders / totalEnquiries) * 100).toFixed(2)}%` : '0.00%';
    const lostOpportunities = activeCustomerOpportunities.filter((o) => o.stage === 'Lost' || o.stage === 'Closed Lost').length;

    const saleAmount =
      activeCustomerOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0) ||
      activeCustomerInvoices.reduce((sum, i) => sum + (Number(i.subtotal) || Number(i.amount) || 0), 0) ||
      activeCustomerOpportunities.reduce((sum, o) => sum + (Number(o.amount) || 0), 0) ||
      (Number(activeCustomer.totalSpend) || 0);

    const vatAmount =
      activeCustomerOrders.reduce((sum, o) => sum + (Number(o.vatAmount) || 0), 0) ||
      activeCustomerInvoices.reduce((sum, i) => sum + (Number(i.vatAmount) || 0), 0) ||
      activeCustomerOpportunities.reduce((sum, o) => sum + (Number((o as any).vatAmount) || 0), 0) ||
      (saleAmount > 0 ? saleAmount * 0.05 : 0);

    const totalAmount =
      activeCustomerOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || (Number(o.amount) || 0) + (Number(o.vatAmount) || 0)), 0) ||
      activeCustomerInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0) ||
      activeCustomerOpportunities.reduce((sum, o) => sum + (Number((o as any).totalAmount) || (Number(o.amount) || 0) + (Number((o as any).vatAmount) || 0)), 0) ||
      (saleAmount + vatAmount);

    const invoicedAmount =
      activeCustomerInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || Number(i.amount) || 0), 0) ||
      activeCustomerOpportunities.filter((o) => o.stage === 'Invoice').reduce((sum, o) => sum + (Number((o as any).totalAmount) || Number(o.amount) || 0), 0);

    const collectionsAmount =
      activeCustomerReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) ||
      activeCustomerInvoices.reduce((sum, i) => sum + (Number((i as any).paidAmount) || 0), 0);

    const collectionsVat =
      activeCustomerReceipts.reduce((sum, r) => sum + (Number((r as any).vatAmount) || 0), 0) ||
      (collectionsAmount > 0 ? collectionsAmount * 0.05 : 0);

    const billedReceivable = Math.max(0, invoicedAmount - collectionsAmount);
    const unbilledReceivable = Math.max(0, totalAmount - invoicedAmount);
    const totalReceivable = (Number(activeCustomer.outstanding) || 0) > 0
      ? Number(activeCustomer.outstanding)
      : (billedReceivable + unbilledReceivable);

    const saleExpense = activeCustomerOrders.reduce((sum, o) => sum + (Number((o as any).expense) || 0), 0);
    const profitPaymentReceived = collectionsAmount;
    const profitOrder = Math.max(0, totalAmount - saleExpense);

    return {
      totalEnquiries,
      openEnquiries,
      lastEnquiry,
      totalOrders,
      conversionRatio,
      lostOpportunities,
      saleAmount,
      vatAmount,
      totalAmount,
      invoicedAmount,
      collectionsAmount,
      collectionsVat,
      billedReceivable,
      unbilledReceivable,
      totalReceivable,
      saleExpense,
      profitPaymentReceived,
      profitOrder,
    };
  }, [activeCustomer, activeCustomerOpportunities, activeCustomerOrders, activeCustomerInvoices, activeCustomerReceipts]);

  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);

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
    return () => {
      unsub();
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('crm_auth_updated', syncUser);
    };
  }, []);

  // Sync form owner / upload owner / assign user whenever currentUser resolves
  useEffect(() => {
    if (currentUser?.name) {
      setFormData((prev) => ({
        ...prev,
        owner: prev.owner || currentUser.name || '',
      }));
      setAssignUser((prev) => prev || currentUser.name || '');
      setUploadOwner((prev) => prev || currentUser.name || '');
    }
  }, [currentUser]);

  const isEmployee = currentUser?.role === 'employee' || currentUser?.role === 'worker';
  const isManager = currentUser?.role === 'manager';

  // Compute team members reporting to this manager
  const managerTeamMembers = useMemo(() => {
    if (!currentUser || currentUser.role !== 'manager') return [];
    const mgrId = String(currentUser.id || '').toLowerCase();
    const mgrEmail = String(currentUser.email || '').toLowerCase();
    const mgrName = String(currentUser.name || '').toLowerCase();
    const mgrType = (
      currentUser.managerType ||
      currentUser.designation ||
      currentUser.department ||
      ''
    ).toLowerCase();

    const isMktMgr = mgrType.includes('market') || mgrEmail.includes('afsal') || mgrName.includes('afsal') || mgrId.includes('3');
    const isSalesMgr = mgrType.includes('sales') || mgrEmail.includes('shibil') || mgrName.includes('shibil') || mgrId.includes('1');
    const isPurchMgr = mgrType.includes('purchase') || mgrId.includes('2');
    const isOpsMgr = mgrType.includes('operation') || mgrId.includes('4');

    let allCrmUsers: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) allCrmUsers = JSON.parse(raw);
      } catch (e) { }
    }

    const team = allCrmUsers.filter((u) => {
      const uMgr = String(u.managerId || u.reportingManagerId || '').toLowerCase();
      const uEmpType = String(u.employeeType || u.designation || '').toLowerCase();
      const uDept = String(u.department || u.profileType || '').toLowerCase();

      const matchesId =
        uMgr.length > 0 &&
        (uMgr === mgrId ||
          `usr_${uMgr}` === mgrId ||
          uMgr === mgrId.replace('usr_', '') ||
          uMgr === mgrEmail ||
          uMgr === mgrName ||
          (isMktMgr && (uMgr.includes('afsal') || uMgr === 'mgr_3' || uMgr === '3')) ||
          (isSalesMgr && (uMgr.includes('shibil') || uMgr === 'mgr_1' || uMgr === '1')));

      const matchesDept =
        (isMktMgr && (uEmpType.includes('market') || uDept.includes('market'))) ||
        (isSalesMgr && (uEmpType.includes('sales') || uDept.includes('sales'))) ||
        (isPurchMgr && (uEmpType.includes('purchase') || uDept.includes('purchase'))) ||
        (isOpsMgr && (uEmpType.includes('operation') || uDept.includes('operation')));

      return matchesId || matchesDept;
    });

    const memberIdentifiers = new Set<string>();
    team.forEach((u) => {
      if (u.name) memberIdentifiers.add(u.name.trim().toLowerCase());
      if (u.email) memberIdentifiers.add(u.email.trim().toLowerCase());
      if (u.username) {
        memberIdentifiers.add(u.username.trim().toLowerCase());
        memberIdentifiers.add(u.username.split('@')[0].trim().toLowerCase());
      }
      if (u.id) memberIdentifiers.add(String(u.id).trim().toLowerCase());
    });

    if (isMktMgr) {
      ['arun', 'arun@gmail.com', 'arun@company.com', 'employee 7', 'employee7@company.com', 'employee 8', 'employee8@company.com'].forEach((m) =>
        memberIdentifiers.add(m.toLowerCase())
      );
    } else if (isSalesMgr) {
      ['employee 1', 'employee@gmail.com', 'employee 2', 'employee2@company.com', 'employee 3', 'employee3@company.com'].forEach((m) =>
        memberIdentifiers.add(m.toLowerCase())
      );
    }

    return Array.from(memberIdentifiers);
  }, [currentUser]);

  // New Customer Form State (Cezcon CRM Spec)
  const [formData, setFormData] = useState({
    customerName: '',
    parentCustomer: '',
    existingContact: '',
    contactDesignation: '',
    contactSalutation: 'Mr.',
    contactPerson: '',
    phoneCode: '+971',
    phone: '',
    personalMobile: '',
    businessMobile: '',
    spokenLanguage: '',
    nationality: '',
    isPrimaryContact: true,
    contactEmail: '',
    contactAddress: '',
    contactComments: '',
    email: '',
    owner: '',
    type: 'Customer' as 'Customer' | 'Prospect',
    status: 'Active' as 'Active' | 'Inactive' | 'Prospect',
    companyGroup: 'Commercial Engineering',
    industryType: '',
    keyCustomer: 'No',
    source: '',
    sourceName: '',
    campaign: '',
    noOfEmployees: '',
    tags: '',
    address: '',
    country: 'United Arab Emirates',
    stateRegion: '',
    city: 'Dubai',
    location: '',
    comments: '',
    website: '',
    trn: '',
    isSupplier: false,
    addContactDetails: true,
    totalSpend: 0,
    outstanding: 0,
  });

  // Contact validation & dropdown states
  const [businessMobileCode, setBusinessMobileCode] = useState('+971');
  const [personalMobileCode, setPersonalMobileCode] = useState('+971');
  const [isPhoneCodeDropdownOpen, setIsPhoneCodeDropdownOpen] = useState(false);
  const [isBusinessCodeDropdownOpen, setIsBusinessCodeDropdownOpen] = useState(false);
  const [isPersonalCodeDropdownOpen, setIsPersonalCodeDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [businessMobileTouched, setBusinessMobileTouched] = useState(false);
  const [personalMobileTouched, setPersonalMobileTouched] = useState(false);

  // Close action menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuId(null);
    if (actionMenuId) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [actionMenuId]);

  // Helper to retrieve actual user avatars dynamically
  const getEmployeePhoto = (name?: string): string | null => {
    if (!name) return null;
    const clean = name.trim().toLowerCase();

    // 1. Check in context users
    const matchedUser = users.find((u) => u.name && u.name.trim().toLowerCase() === clean);
    if (matchedUser?.avatar && !matchedUser.avatar.includes('photo-1507003211169-0a1dd7228f2d')) {
      return matchedUser.avatar;
    }

    // 2. Direct read from localStorage (cezcon_crm_users_list)
    if (typeof window !== 'undefined') {
      try {
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
            if (found && (found.avatarImage || found.avatarUrl || found.avatar)) {
              return found.avatarImage || found.avatarUrl || found.avatar;
            }
          }
        }

        // 3. Check crm_admin_accounts_list
        const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
        if (storedAdminsRaw) {
          const parsedAdmins = JSON.parse(storedAdminsRaw);
          if (Array.isArray(parsedAdmins)) {
            const foundAdmin = parsedAdmins.find(
              (a: any) =>
                (a.name && a.name.trim().toLowerCase() === clean) ||
                (a.email && a.email.trim().toLowerCase() === clean)
            );
            if (foundAdmin && (foundAdmin.avatar || foundAdmin.avatarUrl || foundAdmin.avatarImage)) {
              return foundAdmin.avatar || foundAdmin.avatarUrl || foundAdmin.avatarImage;
            }
          }
        }

        // 4. Check cool_crm_auth
        const authRaw = localStorage.getItem('cool_crm_auth');
        if (authRaw) {
          const authUser = JSON.parse(authRaw);
          if (
            authUser &&
            (authUser.name?.trim().toLowerCase() === clean || authUser.email?.trim().toLowerCase() === clean)
          ) {
            if (authUser.avatar || authUser.avatarImage) {
              return authUser.avatar || authUser.avatarImage;
            }
          }
        }
      } catch (e) {
        console.error('getEmployeePhoto error:', e);
      }
    }
    return null;
  };

  const renderUserAvatar = (name: string, explicitAvatar?: string, size = 'w-7 h-7') => {
    const isMockMan = explicitAvatar?.includes('photo-1507003211169-0a1dd7228f2d');
    const photo = (!isMockMan && explicitAvatar) || getEmployeePhoto(name);

    if (photo) {
      return (
        <img
          src={photo}
          alt={name}
          title={name}
          className={`${size} rounded-full object-cover mx-auto border border-slate-200 shadow-2xs`}
        />
      );
    }

    const initials = (name || 'U')
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

    return (
      <div
        title={name}
        className={`${size} rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[10px] mx-auto shadow-2xs border border-slate-200`}
      >
        {initials}
      </div>
    );
  };

  // Live Cezcon customer records from Enterprise CRM state
  const effectiveCustomers: CrmCustomer[] = useMemo(() => {
    return (customers || []).map((c, idx) => {
      const cName = (c.customerName || '').trim().toLowerCase();
      const cId = (c.id || '').trim().toLowerCase();

      const opps = (salesOpportunities || []).filter((opp) => {
        const oCust = (opp.customer || '').trim().toLowerCase();
        const oCustId = String((opp as any).customerId || '').trim().toLowerCase();
        return (cName && (oCust === cName || oCust.includes(cName) || cName.includes(oCust))) ||
          (cId && (oCustId === cId || oCustId.includes(cId)));
      });

      const ords = (salesOrders || []).filter((ord) => {
        const ordCust = (ord.customer || '').trim().toLowerCase();
        const ordCustId = String((ord as any).customerId || '').trim().toLowerCase();
        return (cName && (ordCust === cName || ordCust.includes(cName) || cName.includes(ordCust))) ||
          (cId && (ordCustId === cId || ordCustId.includes(cId)));
      });

      const openEnq = opps.length > 0
        ? opps.filter((o) => !['Won', 'Lost', 'Closed Lost'].includes(o.stage)).length
        : (c.openEnquiries ?? 1);

      const latestOpp = opps[0];
      const lastEnq = latestOpp?.opportunityDate || c.lastEnquiry || 'Today';

      const lastOrd = ords.length > 0
        ? (ords[0].orderDate || '1 day(s) ago')
        : (c.lastOrder || 'No order till the date.');

      return {
        ...c,
        slNo: idx + 1,
        date: c.date || (c.createdDate ? new Date(c.createdDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '05-10-2026'),
        lastEnquiry: lastEnq,
        openEnquiries: openEnq,
        lastOrder: lastOrd,
        outstanding: c.outstanding ?? 0.0,
      };
    });
  }, [customers, salesOpportunities, salesOrders]);

  // Combined Search & Filter Logic
  const query = (search || globalSearch || '').trim().toLowerCase();

  const filteredCustomers = useMemo(() => {
    let allCrmUsers: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) allCrmUsers = JSON.parse(raw);
      } catch (e) { }
    }

    return effectiveCustomers.filter((cust) => {
      // 🛡️ Centralized Role Hierarchy & Department Scope Enforcement
      if (!canAccessCustomer(cust, currentUser, allCrmUsers)) {
        return false;
      }

      // Tab filter: 'All' | 'Customer' | 'Prospect'
      if (activeTab === 'Customer' && cust.status === 'Prospect') return false;
      if (activeTab === 'Prospect' && cust.status !== 'Prospect') return false;

      // Dropdown Filters
      if (ownerFilter !== 'All' && cust.owner !== ownerFilter) return false;
      if (campaignFilter !== 'All' && cust.campaign !== campaignFilter) return false;
      if (industryFilter !== 'All' && cust.industryType !== industryFilter && cust.companyGroup !== industryFilter) return false;
      if (keyCustomerFilter !== 'All') {
        const isKey = Boolean(cust.keyCustomer === true || cust.keyCustomer === 'Yes');
        if (keyCustomerFilter === 'Yes' && !isKey) return false;
        if (keyCustomerFilter === 'No' && isKey) return false;
      }
      if (sourceFilter !== 'All' && cust.source !== sourceFilter) return false;
      if (assignedDateFilter && cust.date && !cust.date.includes(assignedDateFilter)) return false;

      // Text search
      if (query) {
        const matchesName = cust.customerName?.toLowerCase().includes(query);
        const matchesContact = cust.contactPerson?.toLowerCase().includes(query);
        const matchesPhone = cust.phone?.toLowerCase().includes(query);
        const matchesEmail = cust.email?.toLowerCase().includes(query);
        const matchesGroup = cust.companyGroup?.toLowerCase().includes(query);
        const matchesOwner = cust.owner?.toLowerCase().includes(query);

        if (!matchesName && !matchesContact && !matchesPhone && !matchesEmail && !matchesGroup && !matchesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [
    effectiveCustomers,
    isEmployee,
    isManager,
    managerTeamMembers,
    currentUser,
    activeTab,
    ownerFilter,
    campaignFilter,
    industryFilter,
    keyCustomerFilter,
    sourceFilter,
    assignedDateFilter,
    query,
  ]);

  const displayCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;

  // Handle Add Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      alert('Please enter a Customer Name.');
      return;
    }

    // Validate Tel phone number if provided
    if (formData.phone.trim()) {
      const v = validatePhoneNumber(formData.phone, formData.phoneCode);
      if (!v.isValid) {
        setPhoneTouched(true);
        alert(`Invalid Tel: ${v.message}`);
        return;
      }
    }

    // Validate Business Mobile if provided
    if (formData.businessMobile?.trim()) {
      const v = validatePhoneNumber(formData.businessMobile, businessMobileCode);
      if (!v.isValid) {
        setBusinessMobileTouched(true);
        alert(`Invalid Business Mobile: ${v.message}`);
        return;
      }
    }

    // Validate Personal Mobile if provided
    if (formData.personalMobile?.trim()) {
      const v = validatePhoneNumber(formData.personalMobile, personalMobileCode);
      if (!v.isValid) {
        setPersonalMobileTouched(true);
        alert(`Invalid Personal Mobile: ${v.message}`);
        return;
      }
    }

    const fullContactName = formData.contactPerson.trim()
      ? (formData.contactSalutation ? `${formData.contactSalutation} ${formData.contactPerson.trim()}` : formData.contactPerson.trim())
      : 'Primary Contact';

    const fullPhone = formData.businessMobile
      ? `${businessMobileCode} ${formData.businessMobile.trim()}`
      : formData.phone
        ? `${formData.phoneCode} ${formData.phone.trim()}`
        : '+971 50 000 0000';

    const resolvedOwner = formData.owner || currentUser?.name || '';
    const newCust: Partial<CrmCustomer> = {
      customerName: formData.customerName.trim().toUpperCase(),
      contactPerson: fullContactName,
      salutation: formData.contactSalutation,
      phone: fullPhone,
      email: formData.contactEmail.trim() || formData.email.trim() || 'contact@client.ae',
      owner: resolvedOwner,
      // createdBy stamps the actual logged-in user so OWN-scope employees always see their records
      createdBy: currentUser?.name || resolvedOwner,
      status: formData.status,
      type: formData.type,
      companyGroup: formData.companyGroup,
      industryType: formData.industryType,
      keyCustomer: formData.keyCustomer === 'Yes',
      source: formData.source,
      campaign: formData.campaign,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      address: formData.contactAddress || formData.address,
      country: formData.country || 'United Arab Emirates',
      stateRegion: formData.stateRegion || formData.city || 'Dubai',
      city: formData.stateRegion || formData.city || 'Dubai',
      location: formData.location || '',
      website: formData.website,
      totalSpend: Number(formData.totalSpend) || 0,
      outstanding: Number(formData.outstanding) || 0,
      totalDeals: 1,
      lastActivity: 'Added directly to Customer Directory',
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      lastEnquiry: 'Today',
      openEnquiries: 1,
      lastOrder: 'No order till the date.',
    };

    addCustomer(newCust as any);
    setIsAddModalOpen(false);

    // Reset Form
    setFormData({
      customerName: '',
      parentCustomer: '',
      existingContact: '',
      contactDesignation: '',
      contactSalutation: 'Mr.',
      contactPerson: '',
      phoneCode: '+971',
      phone: '',
      personalMobile: '',
      businessMobile: '',
      spokenLanguage: '',
      nationality: '',
      isPrimaryContact: true,
      contactEmail: '',
      contactAddress: '',
      contactComments: '',
      email: '',
      owner: currentUser?.name || '',
      type: 'Customer',
      status: 'Active',
      companyGroup: 'Commercial Engineering',
      industryType: '',
      keyCustomer: 'No',
      source: '',
      sourceName: '',
      campaign: '',
      noOfEmployees: '',
      tags: '',
      address: '',
      country: 'United Arab Emirates',
      stateRegion: '',
      city: 'Dubai',
      location: '',
      comments: '',
      website: '',
      trn: '',
      isSupplier: false,
      addContactDetails: true,
      totalSpend: 0,
      outstanding: 0,
    });
  };

  const handleDownloadSampleFormat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Customer Name,Owner,Phone,Email,Industry,City,Country,Website,Date\n' +
      'ACME GENERAL TRADING LLC,Nafal,+971 4 123 4567,info@acme.ae,General Contracting,Dubai,United Arab Emirates,https://acme.ae,10/02/2026\n' +
      'AL FAJER CONTRACTING,JISMON JOSE,+971 4 987 6543,contact@alfajer.ae,Fitout & Interior Design,Abu Dhabi,United Arab Emirates,https://alfajer.ae,10/02/2026\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'cezcon_customer_upload_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      alert('Please choose a file to upload.');
      return;
    }
    const cleanName = selectedUploadFile.name.replace(/\.[^/.]+$/, '').toUpperCase();
    addCustomer({
      customerName: cleanName.includes('CUSTOMER') ? cleanName : `${cleanName} (UPLOADED)`,
      contactPerson: 'Lead Contact',
      companyGroup: 'Commercial Engineering',
      owner: uploadOwner,
      industryType: 'General Contracting',
      type: 'Customer',
      status: 'Active',
      phone: '+971 4 555 0199',
      email: 'sales@importedcompany.ae',
      city: 'Dubai',
      country: 'United Arab Emirates',
      website: 'https://importedcompany.ae',
      totalSpend: 0,
      outstanding: 0,
      lastActivity: 'Just now',
      totalDeals: 0,
      createdDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    });
    alert('Customers uploaded successfully!');
    setSelectedUploadFile(null);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-3.5 pb-16 font-sans text-slate-800">
      {isAddModalOpen ? (
        /* ── CEZCON CRM FULL ADD CUSTOMER SCREEN (EXACT IMAGE 2) ── */
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Customer</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleCreateCustomer} className="text-xs text-slate-700">
            {/* Sub-Header: Customer Details */}
            <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 flex items-center gap-2 font-bold text-slate-700 text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Customer Details</span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
                {/* ── ROW 1 ── */}
                {/* Left: Customer Owner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Customer Owner</label>
                  <div className="flex-1">
                    <select
                      value={formData.owner || 'Nafal'}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: Customer Name * */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">
                    Customer Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-white border border-blue-400 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* ── ROW 2 ── */}
                {/* Left: Parent Customer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Parent Customer</label>
                  <div className="flex-1 flex items-center gap-1.5">
                    <select
                      value={formData.parentCustomer || ''}
                      onChange={(e) => setFormData({ ...formData, parentCustomer: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Parent Customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.customerName}>
                          {c.customerName}
                        </option>
                      ))}
                      {customParentOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setNewParentCustomerName('');
                        setIsAddParentModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-[#0088CC] hover:bg-[#0077b3] text-white text-xs font-semibold rounded flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                      title="Add New Parent Customer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New
                    </button>
                  </div>
                </div>

                {/* Right: Customer Tags */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Customer Tags</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Keywords attached to the company"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ── ROW 3 ── */}
                {/* Left: Key Customer? */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Key Customer?</label>
                  <div className="flex-1 flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="addKeyCustomer"
                        value="Yes"
                        checked={formData.keyCustomer === 'Yes'}
                        onChange={() => setFormData({ ...formData, keyCustomer: 'Yes' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="addKeyCustomer"
                        value="No"
                        checked={formData.keyCustomer !== 'Yes'}
                        onChange={() => setFormData({ ...formData, keyCustomer: 'No' })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Right: Industry Type */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Industry Type</label>
                  <div className="flex-1">
                    <select
                      value={formData.industryType}
                      onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="General Contracting">General Contracting</option>
                      <option value="Landscape & Horticulture">Landscape & Horticulture</option>
                      <option value="Construction & Civil">Construction & Civil</option>
                      <option value="Fitout & Interior Design">Fitout & Interior Design</option>
                      <option value="Chemical & Manufacturing">Chemical & Manufacturing</option>
                      <option value="Commercial Engineering">Commercial Engineering</option>
                      <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                    </select>
                  </div>
                </div>

                {/* ── ROW 4 ── */}
                {/* Left: Source */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                    Source <HelpCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                  </label>
                  <div className="flex-1">
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Direct Inquiry">Direct Inquiry</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Exhibition">Exhibition</option>
                    </select>
                  </div>
                </div>

                {/* Right: Source Name */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Source Name</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name of the source. Eg Google, LinkedIn"
                      value={formData.sourceName || ''}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ── ROW 5 ── */}
                {/* Left: Campaign */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                    Campaign <HelpCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                  </label>
                  <div className="flex-1">
                    <select
                      value={formData.campaign}
                      onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="HVAC Commercial 2026">HVAC Commercial 2026</option>
                      <option value="Google Ads Search">Google Ads Search</option>
                      <option value="Email Outreach">Email Outreach</option>
                    </select>
                  </div>
                </div>

                {/* Right: No of Employees */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">No of Employees</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.noOfEmployees || ''}
                      onChange={(e) => setFormData({ ...formData, noOfEmployees: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ── ROW 6 ── */}
                {/* Left: Tel */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1 text-teal-700 pt-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600 inline" /> Tel
                  </label>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center relative">
                      {/* Country Code Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPhoneCodeDropdownOpen(!isPhoneCodeDropdownOpen);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-r-0 border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 rounded-l flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        title="Select Country Dial Code"
                      >
                        <span>
                          {COUNTRY_CODES_LIST.find((c) => c.code === (formData.phoneCode || '+971'))?.flag || '🇦🇪'}
                        </span>
                        <span className="font-mono text-xs">{formData.phoneCode || '+971'}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                      </button>

                      {/* Country Code Picker Dropdown */}
                      {isPhoneCodeDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[120]"
                            onClick={() => setIsPhoneCodeDropdownOpen(false)}
                          />
                          <div
                            className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-xl py-1 z-[121] max-h-56 overflow-y-auto w-64 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {COUNTRY_CODES_LIST.map((item) => (
                              <button
                                key={item.code + item.country}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, phoneCode: item.code });
                                  setIsPhoneCodeDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors ${
                                  formData.phoneCode === item.code ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{item.flag}</span>
                                  <span className="truncate">{item.country}</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 shrink-0">{item.code}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Phone Input */}
                      <input
                        type="text"
                        placeholder="e.g. 04 123 4567 or 1234567"
                        value={formData.phone}
                        onBlur={() => setPhoneTouched(true)}
                        onChange={(e) => {
                          // Allow only digits, spaces, hyphens, and parentheses
                          const cleanVal = e.target.value.replace(/[^0-9\s\-+()]/g, '');
                          setFormData({ ...formData, phone: cleanVal });
                          setPhoneTouched(true);
                        }}
                        className={`flex-1 bg-white border rounded-r px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                          phoneTouched && formData.phone.trim() && !validatePhoneNumber(formData.phone, formData.phoneCode).isValid
                            ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                            : phoneTouched && formData.phone.trim() && validatePhoneNumber(formData.phone, formData.phoneCode).isValid
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />

                      {/* Validation Status Icon */}
                      {phoneTouched && formData.phone.trim() && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {validatePhoneNumber(formData.phone, formData.phoneCode).isValid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Validation Helper */}
                    {phoneTouched && formData.phone.trim() && !validatePhoneNumber(formData.phone, formData.phoneCode).isValid && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {validatePhoneNumber(formData.phone, formData.phoneCode).message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Website */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Website</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="https://www.example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ── ROW 7 ── */}
                {/* Left: Email */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1 text-red-600 pt-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-500 inline" /> Email
                  </label>
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Add multiple emails by pressing Tab button."
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Right: Address */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1 text-blue-600 pt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 inline" /> Address
                  </label>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      placeholder="Office No, PO Box, Street, City etc..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                </div>

                {/* ── ROW 8 ── */}
                {/* Left: Country (Dropdown) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Country</label>
                  <div className="flex-1">
                    <select
                      value={formData.country || 'United Arab Emirates'}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        const regions = REGION_OPTIONS_MAP[newCountry] || [];
                        setFormData({
                          ...formData,
                          country: newCountry,
                          stateRegion: regions[0] || '',
                          city: regions[0] || '',
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {COUNTRY_OPTIONS_LIST.map((countryName) => (
                        <option key={countryName} value={countryName}>
                          {countryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right: State/Region (Dynamic based on Country) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">State/Region</label>
                  <div className="flex-1">
                    <select
                      value={formData.stateRegion || formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value, city: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select State/Region</option>
                      {(REGION_OPTIONS_MAP[formData.country || 'United Arab Emirates'] || REGION_OPTIONS_MAP['United Arab Emirates']).map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── ROW 9 ── */}
                {/* Left: Location (Smart Searchable Combobox) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 pt-1.5">Location</label>
                  <div className="flex-1 relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Search or enter location (e.g. Mussafah, Business Bay, Al Quoz...)"
                        value={formData.location || ''}
                        onFocus={() => {
                          setIsLocationDropdownOpen(true);
                          setLocationSearchQuery(formData.location || '');
                        }}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          setLocationSearchQuery(e.target.value);
                          setIsLocationDropdownOpen(true);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pr-8 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      {formData.location ? (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, location: '' });
                            setLocationSearchQuery('');
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                          title="Clear Location"
                        >
                          ×
                        </button>
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>

                    {/* Location Autocomplete / Suggestions Dropdown */}
                    {isLocationDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[110]"
                          onClick={() => setIsLocationDropdownOpen(false)}
                        />
                        <div
                          className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-xl py-1 z-[111] max-h-56 overflow-y-auto w-full text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <span>Popular Commercial &amp; Industrial Zones</span>
                            <span>{POPULAR_LOCATIONS_LIST.length} Locations</span>
                          </div>
                          {POPULAR_LOCATIONS_LIST
                            .filter((loc) =>
                              !locationSearchQuery.trim() ||
                              loc.toLowerCase().includes(locationSearchQuery.toLowerCase())
                            )
                            .map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, location: loc });
                                  setIsLocationDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer transition-colors ${
                                  formData.location === loc ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                }`}
                              >
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{loc}</span>
                              </button>
                            ))}
                          {POPULAR_LOCATIONS_LIST.filter((loc) =>
                            loc.toLowerCase().includes(locationSearchQuery.toLowerCase())
                          ).length === 0 && (
                            <div className="px-3 py-2 text-slate-400 italic text-[11px]">
                              No matching preset zone. &quot;{formData.location}&quot; will be saved as custom location.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Comments */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 pt-1.5">Comments</label>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      placeholder=""
                      value={formData.comments || ''}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                </div>

                {/* ── ROW 10 ── */}
                {/* Left: Logo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Logo</label>
                  <div className="flex-1 flex items-center gap-2">
                    <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs px-2.5 py-1 rounded cursor-pointer transition-colors">
                      Choose file
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                    <span className="text-xs text-slate-500">No file chosen</span>
                  </div>
                </div>

                {/* Right: TRN */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">TRN</label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.trn || ''}
                      onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ── ROW 11 ── */}
                {/* Left: Is Supplier? */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Is Supplier?</label>
                  <div className="flex-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isSupplier || false}
                      onChange={(e) => setFormData({ ...formData, isSupplier: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Switch: Add contact details */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.addContactDetails || false}
                    onChange={(e) => setFormData({ ...formData, addContactDetails: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22C55E] relative"></div>
                  <span className="text-xs font-semibold text-slate-700">Add contact details</span>
                </label>

                {formData.addContactDetails && (
                  <div className="mt-4 border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs">
                    {/* Sub-Header: Contact Details */}
                    <div className="bg-[#EEF2F6] border-b border-slate-200 px-4 py-2 flex items-center gap-2 font-bold text-slate-700 text-xs">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Contact Details</span>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
                        {/* ── ROW 1 ── */}
                        {/* Left: Existing Contact */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Existing Contact</label>
                          <div className="flex-1">
                            <select
                              value={formData.existingContact || ''}
                              onChange={(e) => setFormData({ ...formData, existingContact: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select contact</option>
                              <option value="Bishoy George">Bishoy George</option>
                              <option value="Mr. Puspak">Mr. Puspak</option>
                              <option value="Mr. Farhan">Mr. Farhan</option>
                              <option value="NIKHIL">NIKHIL</option>
                              <option value="Nafal">Nafal</option>
                            </select>
                          </div>
                        </div>

                        {/* Right: Contact Name * */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">
                            Contact Name <span className="text-red-600 font-bold">*</span>
                          </label>
                          <div className="flex-1 flex items-center">
                            <select
                              value={formData.contactSalutation || 'Mr.'}
                              onChange={(e) => setFormData({ ...formData, contactSalutation: e.target.value })}
                              className="bg-slate-50 border border-r-0 border-slate-300 rounded-l px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none shrink-0"
                            >
                              <option value="Mr.">Mr.</option>
                              <option value="Ms.">Ms.</option>
                              <option value="Mrs.">Mrs.</option>
                              <option value="Dr.">Dr.</option>
                              <option value="Eng.">Eng.</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Point of contact"
                              value={formData.contactPerson || ''}
                              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                              className="flex-1 bg-white border border-blue-400 rounded-r px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* ── ROW 2 ── */}
                        {/* Left: Designation */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Designation</label>
                          <div className="flex-1">
                            <select
                              value={formData.contactDesignation || ''}
                              onChange={(e) => setFormData({ ...formData, contactDesignation: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select Designation</option>
                              <option value="Managing Director">Managing Director</option>
                              <option value="General Manager">General Manager</option>
                              <option value="Procurement Manager">Procurement Manager</option>
                              <option value="Project Manager">Project Manager</option>
                              <option value="Purchase Officer">Purchase Officer</option>
                              <option value="Operations Head">Operations Head</option>
                              <option value="Sales Director">Sales Director</option>
                              <option value="Site Engineer">Site Engineer</option>
                            </select>
                          </div>
                        </div>

                        {/* Right: Business Mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 text-amber-700 pt-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-600 inline" /> Business Mobile
                          </label>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsBusinessCodeDropdownOpen(!isBusinessCodeDropdownOpen);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 border border-r-0 border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 rounded-l flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                title="Select Country Dial Code"
                              >
                                <span>{COUNTRY_CODES_LIST.find((c) => c.code === businessMobileCode)?.flag || '🇦🇪'}</span>
                                <span className="font-mono text-xs">{businessMobileCode}</span>
                                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                              </button>

                              {isBusinessCodeDropdownOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-[120]"
                                    onClick={() => setIsBusinessCodeDropdownOpen(false)}
                                  />
                                  <div
                                    className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-xl py-1 z-[121] max-h-56 overflow-y-auto w-64 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {COUNTRY_CODES_LIST.map((item) => (
                                      <button
                                        key={item.code + item.country}
                                        type="button"
                                        onClick={() => {
                                          setBusinessMobileCode(item.code);
                                          setIsBusinessCodeDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors ${
                                          businessMobileCode === item.code ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                        }`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span>{item.flag}</span>
                                          <span className="truncate">{item.country}</span>
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-500 shrink-0">{item.code}</span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}

                              <input
                                type="text"
                                placeholder="e.g. 50 123 4567"
                                value={formData.businessMobile || ''}
                                onBlur={() => setBusinessMobileTouched(true)}
                                onChange={(e) => {
                                  const cleanVal = e.target.value.replace(/[^0-9\s\-+()]/g, '');
                                  setFormData({ ...formData, businessMobile: cleanVal });
                                  setBusinessMobileTouched(true);
                                }}
                                className={`flex-1 bg-white border rounded-r px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                                  businessMobileTouched && formData.businessMobile?.trim() && !validatePhoneNumber(formData.businessMobile, businessMobileCode).isValid
                                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                                    : businessMobileTouched && formData.businessMobile?.trim() && validatePhoneNumber(formData.businessMobile, businessMobileCode).isValid
                                    ? 'border-emerald-400 focus:border-emerald-500'
                                    : 'border-slate-300 focus:border-blue-500'
                                }`}
                              />

                              {businessMobileTouched && formData.businessMobile?.trim() && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                  {validatePhoneNumber(formData.businessMobile, businessMobileCode).isValid ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>

                            {businessMobileTouched && formData.businessMobile?.trim() && !validatePhoneNumber(formData.businessMobile, businessMobileCode).isValid && (
                              <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {validatePhoneNumber(formData.businessMobile, businessMobileCode).message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ── ROW 3 ── */}
                        {/* Left: Personal Mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 text-amber-700 pt-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-600 inline" /> Personal Mobile
                          </label>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsPersonalCodeDropdownOpen(!isPersonalCodeDropdownOpen);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 border border-r-0 border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 rounded-l flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                title="Select Country Dial Code"
                              >
                                <span>{COUNTRY_CODES_LIST.find((c) => c.code === personalMobileCode)?.flag || '🇦🇪'}</span>
                                <span className="font-mono text-xs">{personalMobileCode}</span>
                                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                              </button>

                              {isPersonalCodeDropdownOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-[120]"
                                    onClick={() => setIsPersonalCodeDropdownOpen(false)}
                                  />
                                  <div
                                    className="absolute left-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-xl py-1 z-[121] max-h-56 overflow-y-auto w-64 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {COUNTRY_CODES_LIST.map((item) => (
                                      <button
                                        key={item.code + item.country}
                                        type="button"
                                        onClick={() => {
                                          setPersonalMobileCode(item.code);
                                          setIsPersonalCodeDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors ${
                                          personalMobileCode === item.code ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                        }`}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span>{item.flag}</span>
                                          <span className="truncate">{item.country}</span>
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-500 shrink-0">{item.code}</span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}

                              <input
                                type="text"
                                placeholder="e.g. 55 987 6543"
                                value={formData.personalMobile || ''}
                                onBlur={() => setPersonalMobileTouched(true)}
                                onChange={(e) => {
                                  const cleanVal = e.target.value.replace(/[^0-9\s\-+()]/g, '');
                                  setFormData({ ...formData, personalMobile: cleanVal });
                                  setPersonalMobileTouched(true);
                                }}
                                className={`flex-1 bg-white border rounded-r px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                                  personalMobileTouched && formData.personalMobile?.trim() && !validatePhoneNumber(formData.personalMobile, personalMobileCode).isValid
                                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                                    : personalMobileTouched && formData.personalMobile?.trim() && validatePhoneNumber(formData.personalMobile, personalMobileCode).isValid
                                    ? 'border-emerald-400 focus:border-emerald-500'
                                    : 'border-slate-300 focus:border-blue-500'
                                }`}
                              />

                              {personalMobileTouched && formData.personalMobile?.trim() && (
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                  {validatePhoneNumber(formData.personalMobile, personalMobileCode).isValid ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>

                            {personalMobileTouched && formData.personalMobile?.trim() && !validatePhoneNumber(formData.personalMobile, personalMobileCode).isValid && (
                              <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {validatePhoneNumber(formData.personalMobile, personalMobileCode).message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Email */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 text-red-600 pt-1.5">
                            <Mail className="w-3.5 h-3.5 text-red-500 inline" /> Email
                          </label>
                          <div className="flex-1">
                            <input
                              type="email"
                              placeholder="Add multiple emails by pressing Tab button."
                              value={formData.contactEmail || ''}
                              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* ── ROW 4 ── */}
                        {/* Left: Spoken Language */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Spoken Language</label>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={formData.spokenLanguage || ''}
                              onChange={(e) => setFormData({ ...formData, spokenLanguage: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Right: Address */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 text-blue-600 pt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 inline" /> Address
                          </label>
                          <div className="flex-1">
                            <textarea
                              rows={2}
                              placeholder="PO Box, Street, City etc..."
                              value={formData.contactAddress || ''}
                              onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-y"
                            />
                          </div>
                        </div>

                        {/* ── ROW 5 ── */}
                        {/* Left: Nationality */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Nationality</label>
                          <div className="flex-1">
                            <select
                              value={formData.nationality || ''}
                              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select Country</option>
                              <option value="United Arab Emirates">United Arab Emirates</option>
                              <option value="India">India</option>
                              <option value="Pakistan">Pakistan</option>
                              <option value="Egypt">Egypt</option>
                              <option value="Philippines">Philippines</option>
                              <option value="Saudi Arabia">Saudi Arabia</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="United States">United States</option>
                              <option value="Jordan">Jordan</option>
                              <option value="Lebanon">Lebanon</option>
                            </select>
                          </div>
                        </div>

                        {/* Right: Comments */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 pt-1.5">Comments</label>
                          <div className="flex-1">
                            <textarea
                              rows={2}
                              placeholder=""
                              value={formData.contactComments || ''}
                              onChange={(e) => setFormData({ ...formData, contactComments: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 resize-y"
                            />
                          </div>
                        </div>

                        {/* ── ROW 6 ── */}
                        {/* Left: Primary Contact? */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Primary Contact?</label>
                          <div className="flex-1 flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.isPrimaryContact ?? true}
                              onChange={(e) => setFormData({ ...formData, isPrimaryContact: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Actions */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  className="px-6 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : isUploadModalOpen ? (
        /* ── CEZCON CRM FULL UPLOAD CUSTOMER SCREEN (EXACT IMAGE 1) ── */
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Upload Customer</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleFormat}
                className="bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Format</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form & Tips Body */}
          <form onSubmit={handleUploadSubmit} className="p-6 text-xs text-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6 pt-2">
                {/* Customer Owner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="sm:w-32 text-xs font-medium text-slate-700 shrink-0">Customer Owner</label>
                  <div className="flex-1 relative">
                    <select
                      value={uploadOwner}
                      onChange={(e) => setUploadOwner(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload File */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <label className="sm:w-32 text-xs font-medium text-slate-700 shrink-0 pt-1.5">
                    Upload File<span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="bg-[#E0564C] hover:bg-[#D0453B] text-white text-xs font-medium px-3 py-1.5 rounded cursor-pointer transition-colors shadow-2xs shrink-0">
                        Choose file
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedUploadFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-600 truncate">
                        {selectedUploadFile ? selectedUploadFile.name : 'No file chosen'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Maximum Records: 100 | File Format: XLSX, XLS and CSV
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Upload Tips (7 cols) */}
              <div className="lg:col-span-7 bg-[#FAFAFA] lg:bg-transparent p-4 lg:p-0 rounded border lg:border-none border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-2.5">
                  <span className="text-amber-500">💡</span>
                  <span>Upload Tips</span>
                </div>
                <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-slate-700 list-disc list-outside pl-4">
                  <li>
                    Download{' '}
                    <button
                      type="button"
                      onClick={handleDownloadSampleFormat}
                      className="text-red-600 hover:underline font-medium inline cursor-pointer"
                    >
                      format of excel file
                    </button>
                  </li>
                  <li className="text-red-600">
                    Use a single date format uniformly throughout the Excel file. Enter the date in MM/DD/YYYY format.
                    If you used a different format, select the date column in the excel sheet and change its format
                    accordingly (Select Date Column and Change Format)
                  </li>
                  <li>Duplicate entry checks are performed for company name, phone number, and website.</li>
                  <li>Update telephone, business mobile, personal mobile and WhatsApp with country code.</li>
                  <li>Separate multiple tags and emails with commas in the Excel cell.</li>
                  <li>
                    If you have new industry type, source, country or state that are not yet added, please insert them
                    into the CRM software first (skip this step if they are already recorded), then ensure the same
                    data is entered into the Excel sheet as it appears in the CRM.
                  </li>
                  <li>Upload Excel file Using &apos;Choose file&apos; Button.</li>
                  <li>
                    Please ensure that the data you&apos;ve uploaded is accurate; if it&apos;s not, please take a
                    moment to edit it from the list.
                  </li>
                  <li>
                    Choose the correct date format if the uploaded Excel sheet does not use the default excel date
                    format (MM/DD/YYYY).
                  </li>
                  <li>Finally, click the submit button to insert the customer data.</li>
                  <li className="text-red-600">
                    Duplicate entries will be highlighted in red. Please review the company name, phone number, and
                    website. You can either update or delete them. If you do not need to add any information, simply
                    close the form.
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="mt-12 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Date Format Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-700 whitespace-nowrap">Date Format of Excel</label>
                <select
                  value={uploadDateFormat}
                  onChange={(e) => setUploadDateFormat(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-48"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-6 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : editingCustomer ? (
        /* ── CEZCON CRM FULL EDIT CUSTOMER SCREEN (EXACT IMAGE 1) ── */
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Edit Customer</span>
            </div>
            <button
              type="button"
              onClick={() => setEditingCustomer(null)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingCustomer) {
                updateCustomer(editingCustomer.id, editingCustomer);
                setEditingCustomer(null);
              }
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ── ROW 1 ── */}
              {/* Left: Customer Owner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Customer Owner</label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.owner || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, owner: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right: Customer Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                  Customer Name <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    value={editingCustomer.customerName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, customerName: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* ── ROW 2 ── */}
              {/* Left: Parent Customer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Parent Customer</label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.parentCustomer || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, parentCustomer: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Parent Customer</option>
                    {customers
                      .filter((c) => c.id !== editingCustomer.id)
                      .map((c) => (
                        <option key={c.id} value={c.customerName}>
                          {c.customerName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Right: Customer Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Customer Tags</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Keywords attached to the customer"
                    value={Array.isArray(editingCustomer.tags) ? editingCustomer.tags.join(', ') : (editingCustomer.tags || '')}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, tags: e.target.value ? e.target.value.split(',').map(t => t.trim()) : [] })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 3 ── */}
              {/* Left: Key Customer? */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Key Customer?</label>
                <div className="flex-1 flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="keyCustomer"
                      value="Yes"
                      checked={editingCustomer.keyCustomer === 'Yes' || editingCustomer.keyCustomer === true}
                      onChange={() => setEditingCustomer({ ...editingCustomer, keyCustomer: 'Yes' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="keyCustomer"
                      value="No"
                      checked={editingCustomer.keyCustomer !== 'Yes' && editingCustomer.keyCustomer !== true}
                      onChange={() => setEditingCustomer({ ...editingCustomer, keyCustomer: 'No' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Right: Industry Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Industry Type</label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.industryType || editingCustomer.companyGroup || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, industryType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="General Contracting">General Contracting</option>
                    <option value="Landscape & Horticulture">Landscape & Horticulture</option>
                    <option value="Construction & Civil">Construction & Civil</option>
                    <option value="Fitout & Interior Design">Fitout & Interior Design</option>
                    <option value="Chemical & Manufacturing">Chemical & Manufacturing</option>
                    <option value="Commercial Engineering">Commercial Engineering</option>
                    <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                  </select>
                </div>
              </div>

              {/* ── ROW 4 ── */}
              {/* Left: Source */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                  Source <HelpCircle className="w-3.5 h-3.5 text-slate-700 inline" />
                </label>
                <div className="flex-1 relative">
                  <select
                    value={editingCustomer.source || 'Email Marketing'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, source: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="Direct Inquiry">Direct Inquiry</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>
              </div>

              {/* Right: Source Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Source Name</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Name of the source. Eg Google, LinkedIn"
                    value={editingCustomer.sourceName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, sourceName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 5 ── */}
              {/* Left: Campaign */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                  Campaign <HelpCircle className="w-3.5 h-3.5 text-slate-700 inline" />
                </label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.campaign || 'INBOUND E-MAIL - 2025'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, campaign: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="INBOUND E-MAIL - 2025">INBOUND E-MAIL - 2025</option>
                    <option value="HVAC Commercial 2026">HVAC Commercial 2026</option>
                    <option value="Google Ads Search">Google Ads Search</option>
                    <option value="Email Outreach">Email Outreach</option>
                  </select>
                </div>
              </div>

              {/* Right: No. of Employees */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">No.of Employees</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={editingCustomer.employees || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, employees: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 6 ── */}
              {/* Left: Tel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tel</span>
                </label>
                <div className="flex-1 flex items-center gap-2">
                  <span className="bg-slate-100 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 font-medium shrink-0">
                    🇦🇪 +971 ▾
                  </span>
                  <input
                    type="text"
                    placeholder="Landline"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: Website */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Website</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="https://www.example.com"
                    value={editingCustomer.website || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, website: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 7 ── */}
              {/* Left: Email */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>Email</span>
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Add multiple emails by pressing Tab button."
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: Address */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 pt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Address</span>
                </label>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder="Office No, PO Box, Street, City etc..."
                    value={editingCustomer.address || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* ── ROW 8 ── */}
              {/* Left: Country */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Country</label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.country || 'United Arab Emirates'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, country: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Oman">Oman</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              {/* Right: State/Region */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">State/Region</label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                  </select>
                </div>
              </div>

              {/* ── ROW 9 ── */}
              {/* Left: Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Contact</label>
                <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2 py-1">
                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCustomer({ ...editingCustomer, contactPerson: '' })}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✖
                    </button>
                    <span>{editingCustomer.contactPerson || 'NIKHIL'}</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Type contact..."
                    value=""
                    onChange={() => { }}
                    className="flex-1 bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Right: Primary Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Primary Contact</label>
                <div className="flex-1">
                  <select
                    value={editingCustomer.contactPerson || 'NIKHIL'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, contactPerson: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value={editingCustomer.contactPerson || 'NIKHIL'}>{editingCustomer.contactPerson || 'NIKHIL'}</option>
                    <option value="Mr. Puspak">Mr. Puspak</option>
                    <option value="Mr. Farhan">Mr. Farhan</option>
                    <option value="Bishoy George">Bishoy George</option>
                  </select>
                </div>
              </div>

              {/* ── ROW 10 ── */}
              {/* Left: Location */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Location</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search location"
                    value={editingCustomer.location || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: TRN */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">TRN</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Tax Registration Number"
                    value={editingCustomer.trn || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, trn: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 11 ── */}
              {/* Left: Logo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Logo</label>
                <div className="flex-1 flex items-center gap-2">
                  <input type="file" className="text-xs text-slate-600" />
                </div>
              </div>

              {/* Right: Comments */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Comments</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Additional comments"
                    value={editingCustomer.comments || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, comments: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 12 ── */}
              {/* Left: Is Supplier? */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Is Supplier?</label>
                <div className="flex-1">
                  <input
                    type="checkbox"
                    checked={Boolean(editingCustomer.isSupplier)}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, isSupplier: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit Footer */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-4 py-2 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : activeCustomer ? (
        /* ── CEZCON CRM SINGLE CUSTOMER VIEW (EXACT IMAGE 1) ── */
        <div className="space-y-4 font-sans text-slate-800 -mx-2.5 sm:-mx-6 lg:-mx-8 -my-3 sm:-my-4">
          {/* 1. AUDIT BANNER */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>
                CUSTOMER CREATED BY {(activeCustomer.owner || 'MUHAMMED AHSAN P V').toUpperCase()} ON{' '}
                {activeCustomer.createdDate || 'THU 01-10-2026 3:33:18 PM'}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCustomerView}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Close / Back to Customers"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. SUB-TABS NAVIGATION BAR */}
          <div className="bg-white border-b border-slate-200 px-4 flex items-center overflow-x-auto shadow-xs z-10 scrollbar-none">
            <div className="flex items-center gap-1 min-w-max">
              {[
                { id: 'customer', label: 'Customer', icon: Shield },
                { id: 'contacts', label: 'Contact Details', icon: User },
                { id: 'opportunity', label: 'Opportunity', icon: Search },
                { id: 'quotation', label: 'Quotation', icon: FileText },
                { id: 'order', label: 'Order', icon: ShoppingCart },
                { id: 'proforma', label: 'Proforma Invoice', icon: FileText },
                { id: 'invoice', label: 'Invoice', icon: FileText },
                { id: 'receipt', label: 'Receipt', icon: Receipt },
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'statement', label: 'Statement', icon: FileCheck },
                { id: 'history', label: 'Owner Change History', icon: History },
              ].map((tab) => {
                const isActive = activeCustomerSubTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCustomerSubTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-xs transition-all cursor-pointer whitespace-nowrap border-b-2',
                      isActive
                        ? 'border-slate-800 text-slate-900 font-bold bg-slate-100/60'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-slate-800' : 'text-slate-400')} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MAIN CONTENT */}
          <div className="p-3 sm:p-5 w-full max-w-7xl mx-auto space-y-4">
            {/* BIG CENTERED CUSTOMER TITLE */}
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide text-center py-2 sm:py-3 uppercase">
              {activeCustomer.customerName}
            </h1>

            {/* TAB CONTENT: CUSTOMER (MATCHING IMAGE 1) */}
            {activeCustomerSubTab === 'customer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* LEFT COLUMN: DETAILS & CREDIT LIMIT (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* DETAILS CARD */}
                    <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 font-bold text-slate-700 text-xs tracking-tight">
                        Details
                      </div>

                      <div className="divide-y divide-slate-100 text-xs">
                        {/* Owner */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>🧑</span> Owner
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-bold shadow-2xs overflow-hidden shrink-0">
                              {activeCustomer.ownerAvatar ? (
                                <img src={activeCustomer.ownerAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (activeCustomer.owner || 'NA').substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="font-bold text-slate-800 text-[11px] uppercase">
                              {activeCustomer.owner || 'MUHAMMED AHSAN P V'}
                            </span>
                          </div>
                        </div>

                        {/* Relationship */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>🤝</span> Relationship
                          </span>
                          <span className="bg-[#38BDF8] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                            {activeCustomer.type || 'Prospect'}
                          </span>
                        </div>

                        {/* Source */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>🔗</span> Source
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {activeCustomer.source || 'Email Marketing'}
                          </span>
                        </div>

                        {/* Campaign */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>📢</span> Campaign
                          </span>
                          <span className="font-semibold text-blue-600 text-[11px]">
                            {activeCustomer.campaign || 'INBOUND E-MAIL - 2025'}
                          </span>
                        </div>

                        {/* No.of Employees */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>👥</span> No.of Employees
                          </span>
                          <span className="text-slate-700 font-semibold">—</span>
                        </div>

                        {/* Contacts */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>🗂</span> Contacts
                          </span>
                          <span className="font-bold text-blue-600 text-xs">1</span>
                        </div>

                        {/* Primary Contact */}
                        <div className="px-4 py-2 flex items-start justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0 pt-0.5">
                            <span>🏷</span> Primary Contact
                          </span>
                          <div className="text-right space-y-0.5">
                            <div className="font-semibold text-blue-600 text-xs flex items-center justify-end gap-1">
                              <span>{activeCustomer.contactPerson || 'Mr. Puspak'}</span>
                              <HelpCircle className="w-3 h-3 text-blue-400" />
                            </div>
                            {activeCustomer.phone && (
                              <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                <MessageCircle className="w-3 h-3 text-white bg-emerald-500 rounded-full p-0.5" />
                                <a href={`https://wa.me/${activeCustomer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                                  {activeCustomer.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>📍</span> Address
                          </span>
                          <span className="font-semibold text-slate-800 text-right text-[11px]">
                            {activeCustomer.address || 'United Arab Emirates'}
                          </span>
                        </div>

                        {/* Last Order */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                            <span>🔥</span> Last Order
                          </span>
                          <span className="bg-[#38BDF8] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                            {activeCustomer.lastOrder || 'No order till the date.'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions Toolbar */}
                      <div className="p-2.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsAssignModalOpen(true)}
                          className="bg-[#0B2A4A] hover:bg-[#071D33] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Customer Assign</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingCustomer(activeCustomer)}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete customer "${activeCustomer.customerName}"?`)) {
                              deleteCustomer(activeCustomer.id);
                              closeCustomerView();
                            }
                          }}
                          className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* CREDIT LIMIT CARD */}
                    <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
                      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 font-bold text-slate-700 text-xs tracking-tight">
                        Credit Limit
                      </div>
                      <div className="p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Credit Days</span>
                          <span className="font-semibold text-slate-800">0</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Credit Limit</span>
                          <span className="font-semibold text-slate-800">0.00</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingCustomer(activeCustomer)}
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: OVERVIEW CARD WITH 14 METRIC BOXES (7 cols) */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                    <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 font-bold text-slate-700 text-xs tracking-tight">
                      Overview
                    </div>

                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Total Enquiries */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Total Enquiries</span>
                          <span className="text-sm font-bold text-slate-900">{activeCustomerOverviewMetrics?.totalEnquiries ?? 1}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <List className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 2. Open Enquiries */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Open Enquiries</span>
                          <span className="text-sm font-bold text-slate-900">{activeCustomerOverviewMetrics?.openEnquiries ?? 1}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 3. Last Enquiry */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Last Enquiry</span>
                          <span className="text-[11px] font-bold text-slate-900">{activeCustomerOverviewMetrics?.lastEnquiry || '1 day(s) ago'}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 4. Total Order */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Total Order</span>
                          <span className="text-sm font-bold text-slate-900">{activeCustomerOverviewMetrics?.totalOrders ?? 0}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 5. Conversion Ratio */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Conversion Ratio</span>
                          <span className="text-[11px] font-bold text-slate-900">{activeCustomerOverviewMetrics?.conversionRatio || '0.00%'}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 6. Lost Opportunity */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Lost Opportunity</span>
                          <span className="text-sm font-bold text-slate-900">{activeCustomerOverviewMetrics?.lostOpportunities ?? 0}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 7. Sale Amount */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Sale Amount</span>
                          <span className="text-[11px] font-bold text-slate-900">{(activeCustomerOverviewMetrics?.saleAmount ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 8. VAT */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">VAT</span>
                          <span className="text-[11px] font-bold text-slate-900">{(activeCustomerOverviewMetrics?.vatAmount ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                          <Calculator className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 9. Total */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Total</span>
                          <span className="text-[11px] font-bold text-slate-900">{(activeCustomerOverviewMetrics?.totalAmount ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 10. Invoiced */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Invoiced</span>
                          <span className="text-[11px] font-bold text-slate-900">{(activeCustomerOverviewMetrics?.invoicedAmount ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 11. Total Collections */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Total Collections</span>
                          <div className="text-[10px] space-y-0.5">
                            <span className="font-bold text-slate-900 block">{(activeCustomerOverviewMetrics?.collectionsAmount ?? 0).toFixed(2)}</span>
                            <span className="text-red-500 font-semibold block">VAT {(activeCustomerOverviewMetrics?.collectionsVat ?? 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 12. Receivable */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Receivable</span>
                          <div className="text-[10px] space-y-0.2">
                            <span className="font-bold text-red-600 block">{(activeCustomerOverviewMetrics?.totalReceivable ?? 0).toFixed(2)}</span>
                            <span className="text-emerald-600 block">Billed {(activeCustomerOverviewMetrics?.billedReceivable ?? 0).toFixed(2)}</span>
                            <span className="text-blue-600 block">Unbilled {(activeCustomerOverviewMetrics?.unbilledReceivable ?? 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                          <Snowflake className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 13. Sale Expense */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Sale Expense</span>
                          <span className="text-[11px] font-bold text-slate-900">{(activeCustomerOverviewMetrics?.saleExpense ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 14. Profit / Loss */}
                      <div className="sm:col-span-2 border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Profit / Loss</span>
                          <div className="flex items-center gap-3 text-[10px] mt-0.5">
                            <span className="text-slate-600">Payment Received ⓘ <strong className="text-emerald-600">{(activeCustomerOverviewMetrics?.profitPaymentReceived ?? 0).toFixed(2)}</strong></span>
                            <span className="text-slate-600">Order ⓘ <strong className="text-emerald-600">{(activeCustomerOverviewMetrics?.profitOrder ?? 0).toFixed(2)}</strong></span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM CARD: CUSTOMER ACTIVITIES */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
                  <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span>Customer Activities</span>
                    </div>
                  </div>

                  <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveActivityTab('notes')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                          activeActivityTab === 'notes'
                            ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        <FileText className="w-3 h-3" /> Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActivityTab('task')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                          activeActivityTab === 'task'
                            ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActivityTab('files')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                          activeActivityTab === 'files'
                            ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        <Folder className="w-3 h-3" /> Files
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActivityTab('sales_visit')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                          activeActivityTab === 'sales_visit'
                            ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                            : 'border-transparent text-slate-500 hover:bg-slate-50'
                        )}
                      >
                        <MapPin className="w-3 h-3" /> Sales Visit
                      </button>
                      <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  <div className="p-4 text-xs text-slate-500 min-h-[60px]">
                    No Notes.
                  </div>

                  <div className="p-2.5 bg-[#F8FAFC] border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={closeCustomerView}
                      className="px-3.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CONTACT DETAILS */}
            {activeCustomerSubTab === 'contacts' && (
              <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-800">Contact Persons</h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{activeCustomer.contactPerson || 'Primary Contact'}</p>
                      <p className="text-slate-500">{activeCustomer.phone} | {activeCustomer.email}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Primary
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: OPPORTUNITIES */}
            {activeCustomerSubTab === 'opportunity' && (
              <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Linked Sales Opportunities</h3>
                  <Link
                    href={`/sales?tab=opportunities&action=add`}
                    className="bg-[#16A34A] text-white px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Opportunity
                  </Link>
                </div>
                {salesOpportunities.filter(opp => opp.customer.toLowerCase().includes(activeCustomer.customerName.toLowerCase())).length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">No opportunities recorded for this customer yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {salesOpportunities.filter(opp => opp.customer.toLowerCase().includes(activeCustomer.customerName.toLowerCase())).map((opp) => (
                      <div key={opp.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{opp.title} ({opp.opportunityCode})</p>
                          <p className="text-slate-500">Stage: {opp.stage} | Expected Close: {opp.expectedClose}</p>
                        </div>
                        <span className="font-black text-slate-900 text-xs">AED {opp.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FALLBACK TABS */}
            {['quotation', 'order', 'proforma', 'invoice', 'receipt', 'timeline', 'statement', 'history'].includes(activeCustomerSubTab) && (
              <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500 shadow-xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 capitalize">{activeCustomerSubTab} Records</p>
                <p className="text-slate-400 mt-1">No past {activeCustomerSubTab} vouchers found for this customer account.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── CUSTOMER DIRECTORY LIST VIEW ── */
        <>
          {/* 1. TOP TABS: All, Customer, Prospect (Exact Cezcon CRM Nav) */}
          <div className="bg-white border-b border-slate-200 px-4 pt-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('All')}
                className={cn(
                  'flex items-center gap-1.5 pb-2.5 transition-colors relative',
                  activeTab === 'All'
                    ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Shield className={cn('w-3.5 h-3.5', activeTab === 'All' ? 'text-[#DC2626]' : 'text-slate-400')} />
                <span>All</span>
              </button>

              <button
                onClick={() => setActiveTab('Customer')}
                className={cn(
                  'flex items-center gap-1.5 pb-2.5 transition-colors relative',
                  activeTab === 'Customer'
                    ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Customer</span>
              </button>

              <button
                onClick={() => setActiveTab('Prospect')}
                className={cn(
                  'flex items-center gap-1.5 pb-2.5 transition-colors relative',
                  activeTab === 'Prospect'
                    ? 'text-[#DC2626] font-bold border-b-2 border-[#DC2626]'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Prospect</span>
                <Info className="w-3 h-3 text-blue-500 ml-0.5" />
              </button>
            </div>
          </div>

          {/* 2. TOP FILTER GRID (2 Rows Multi-column Form Bordered Box) */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {/* Row 1 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Owner</label>
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Owners</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campaign</label>
                <select
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">Select</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="HVAC Commercial 2026">HVAC Commercial 2026</option>
                  <option value="Google Ads Search">Google Ads Search</option>
                  <option value="Email Outreach">Email Outreach</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Industry Type</label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Industry</option>
                  <option value="General Contracting">General Contracting</option>
                  <option value="Landscape & Horticulture">Landscape & Horticulture</option>
                  <option value="Construction & Civil">Construction & Civil</option>
                  <option value="Fitout & Interior Design">Fitout & Interior Design</option>
                  <option value="Chemical & Manufacturing">Chemical & Manufacturing</option>
                  <option value="Commercial Engineering">Commercial Engineering</option>
                  <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Key Customer?</label>
                <select
                  value={keyCustomerFilter}
                  onChange={(e) => setKeyCustomerFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">Select</option>
                  <option value="Direct Inquiry">Direct Inquiry</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Exhibition">Exhibition</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="Select tags"
                  value={tagsFilter}
                  onChange={(e) => setTagsFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Date</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Select Date"
                    value={assignedDateFilter}
                    onChange={(e) => setAssignedDateFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded pl-8 pr-7 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {assignedDateFilter && (
                    <button
                      onClick={() => setAssignedDateFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">No Orders After</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Select Date"
                    value={noOrdersAfterDate}
                    onChange={(e) => setNoOrdersAfterDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded pl-8 pr-7 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {noOrdersAfterDate && (
                    <button
                      onClick={() => setNoOrdersAfterDate('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. CUSTOMER LIST CARD CONTAINER */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
            {/* Card Header Bar with Actions */}
            <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-[#DC2626] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs min-w-[22px] text-center">
                  {filteredCustomers.length}
                </span>
                <span className="font-bold text-slate-800 text-sm">Customer List</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="bg-[#0F2844] hover:bg-[#1E3A8A] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Customer/Prospect</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-[#0F2844] hover:bg-[#1E3A8A] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Customer/Prospect</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ CUSTOMER</span>
                </button>
              </div>
            </div>

            {/* Table Controls (Shows 10 Rows, Search) */}
            <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Shows</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-slate-600 font-medium">Rows</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 pr-8 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. CEZCON DESKTOP DATA TABLE */}
            <div className="overflow-x-auto w-full min-h-[380px]">
              <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12 border-r border-slate-100">SL.No</th>
                    <th className="py-2.5 px-3 w-24 border-r border-slate-100">Date</th>
                    <th className="py-2.5 px-4 min-w-[240px] border-r border-slate-100">
                      <div className="flex items-center justify-between">
                        <span>Customer</span>
                        <span className="text-slate-400 text-[11px] select-none">⬍</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center w-20 border-r border-slate-100">Owner</th>
                    <th className="py-2.5 px-4 min-w-[190px] border-r border-slate-100">Primary Contact</th>
                    <th className="py-2.5 px-3 text-center w-28 border-r border-slate-100">Last Enquiry</th>
                    <th className="py-2.5 px-3 text-center w-24 border-r border-slate-100">Open Enquiries</th>
                    <th className="py-2.5 px-4 text-center w-36 border-r border-slate-100">Last Order</th>
                    <th className="py-2.5 px-3 text-right w-24 border-r border-slate-100">Outstanding</th>
                    <th className="py-2.5 px-3 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                        No customers found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    displayCustomers.map((cust, idx) => {
                      const sl = (currentPage - 1) * pageSize + idx + 1;
                      const dateStr = cust.date || '30-09-2026';
                      const isMenuOpen = actionMenuId === cust.id;

                      return (
                        <tr key={cust.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. SL.No */}
                          <td className="py-3 px-3 text-center font-medium text-slate-600 border-r border-slate-100">
                            {sl}
                          </td>

                          {/* 2. Date */}
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium border-r border-slate-100">
                            {dateStr}
                          </td>

                          {/* 3. Customer */}
                          <td className="py-3 px-4 border-r border-slate-100">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(cust.keyCustomer === true || cust.keyCustomer === 'Yes' || (cust as any).isKeyCustomer) && (
                                    <span className="text-amber-500 shrink-0 select-none">🤝</span>
                                  )}
                                  <button
                                    onClick={() => router.push(`/customers/${cust.id}`)}
                                    className="font-bold text-[#1677FF] hover:text-[#0958d9] uppercase hover:underline text-left leading-snug cursor-pointer"
                                  >
                                    {cust.customerName}
                                  </button>
                                </div>
                                {cust.phone && !cust.contactPerson && (
                                  <div className="flex items-center gap-1 text-xs mt-1">
                                    <Phone className="w-3 h-3 text-[#e11d48] shrink-0 fill-current" />
                                    <a
                                      href={`tel:${cust.phone}`}
                                      className="text-[#1677FF] hover:text-[#0958d9] hover:underline font-normal text-xs"
                                    >
                                      {cust.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => router.push(`/customers/${cust.id}`)}
                                title="View customer overview"
                                className="text-[#1677FF] hover:text-[#0958d9] shrink-0 cursor-pointer mt-0.5"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* 4. Owner */}
                          <td className="py-3 px-3 text-center border-r border-slate-100">
                            <div className="inline-block" title={`Account Owner: ${cust.owner || currentUser?.name || 'shaheer'}`}>
                              {renderUserAvatar(cust.owner || currentUser?.name || 'shaheer', cust.ownerAvatar, 'w-6 h-6')}
                            </div>
                          </td>

                          {/* 5. Primary Contact */}
                          <td className="py-3 px-4 border-r border-slate-100">
                            {cust.contactPerson ? (
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-[#1677FF]">{cust.contactPerson}</span>
                                  <button
                                    onClick={() => setViewingCustomer(cust)}
                                    className="text-[#1677FF] hover:text-[#0958d9] cursor-pointer"
                                    title="View contact details"
                                  >
                                    <Info className="w-3 h-3" />
                                  </button>
                                </div>
                                {cust.phone && (
                                  <div className="flex items-center gap-1.5 text-xs mt-0.5">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                                      <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.543zm6.26-4.089l.363.216c1.548.92 3.33 1.407 5.153 1.408 5.485 0 9.948-4.462 9.95-9.948.002-2.66-1.032-5.161-2.91-7.04-1.879-1.879-4.38-2.914-7.04-2.914-5.486 0-9.949 4.462-9.951 9.948-.001 1.877.514 3.707 1.492 5.297l.237.385-1.01 3.687 3.719-.993z" />
                                      </svg>
                                    </span>
                                    <a
                                      href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#1677FF] hover:text-[#0958d9] hover:underline font-semibold"
                                    >
                                      {cust.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </td>

                          {/* 6. Last Enquiry */}
                          <td className="py-3 px-3 text-center border-r border-slate-100">
                            <span className="inline-block bg-[#5bc0de] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                              {cust.lastEnquiry || '1 day(s) ago'}
                            </span>
                          </td>

                          {/* 7. Open Enquiries */}
                          <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                            {cust.openEnquiries ?? 1}
                          </td>

                          {/* 8. Last Order */}
                          <td className="py-3 px-4 text-center border-r border-slate-100">
                            {cust.lastOrder && !cust.lastOrder.toLowerCase().includes('no order') ? (
                              <span className="inline-block bg-[#5bc0de] text-white text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shadow-2xs">
                                {cust.lastOrder}
                              </span>
                            ) : (
                              <span className="inline-block bg-[#ea993c] text-white text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shadow-2xs">
                                {cust.lastOrder || 'No order till the date.'}
                              </span>
                            )}
                          </td>

                          {/* 9. Outstanding */}
                          <td className="py-3 px-3 text-right font-bold text-slate-800 border-r border-slate-100">
                            {(cust.outstanding ?? 0).toFixed(2)}
                          </td>

                          {/* 10. Actions Dropdown Menu */}
                          <td className="py-3 px-3 text-center relative">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuId(isMenuOpen ? null : cust.id);
                                }}
                                className="bg-[#113a5d] hover:bg-[#0c2b45] text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-56 bg-white rounded-md shadow-xl border border-slate-200 z-50 py-1.5 text-xs text-left"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuId(null);
                                      window.open(`/customers/${cust.id}`, '_blank');
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 text-slate-800 text-[13px] font-normal transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4 text-slate-800 shrink-0" />
                                    <span>Open in new tab</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuId(null);
                                      router.push(`/customers/${cust.id}`);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 text-slate-800 text-[13px] font-normal transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4 text-slate-800 shrink-0" />
                                    <span>View</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuId(null);
                                      setIsAssignModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 text-slate-800 text-[13px] font-normal transition-colors cursor-pointer"
                                  >
                                    <ExternalLink className="w-4 h-4 text-slate-800 shrink-0" />
                                    <span>Assign Customer/Prospect</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuId(null);
                                      setEditingCustomer(cust);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 text-slate-800 text-[13px] font-normal transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4 text-slate-800 shrink-0" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuId(null);
                                      if (confirm(`Are you sure you want to delete customer "${cust.customerName}"?`)) {
                                        deleteCustomer(cust.id || String(cust.slNo));
                                      }
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 text-slate-800 text-[13px] font-normal transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 text-slate-800 shrink-0" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination */}
            <div className="p-3 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} entries
              </span>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold"
                >
                  Previous
                </button>
                <span className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}



      {/* 6. ASSIGN CUSTOMER MODAL (EXACT CEZCON CRM IMAGE 1) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Assign Customer/Prospect
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-white">
              <div className="flex items-center gap-4 text-xs">
                <label className="w-24 text-xs font-semibold text-slate-700 shrink-0">
                  Assign To
                </label>
                <div className="flex-1 relative">
                  <select
                    value={assignUser}
                    onChange={(e) => setAssignUser(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeCustomer) {
                    updateCustomer(activeCustomer.id, { owner: assignUser });
                  } else {
                    customers.forEach((c) => updateCustomer(c.id, { owner: assignUser }));
                  }
                  setIsAssignModalOpen(false);
                }}
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW PARENT CUSTOMER ── */}
      {isAddParentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                <Building className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Add New Parent Customer</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddParentModalOpen(false)}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = newParentCustomerName.trim().toUpperCase();
                if (!name) return;

                if (!customParentOptions.includes(name)) {
                  setCustomParentOptions((prev) => [...prev, name]);
                }
                setFormData((prev) => ({ ...prev, parentCustomer: name }));
                setNewParentCustomerName('');
                setIsAddParentModalOpen(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Customer / Group Name <span className="text-red-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. AL FUTTAIM GROUP LLC"
                  value={newParentCustomerName}
                  onChange={(e) => setNewParentCustomerName(e.target.value)}
                  className="w-full bg-white border border-blue-400 rounded px-3 py-2 text-xs text-slate-800 font-semibold uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  This parent holding company will be added to your parent list and automatically selected.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddParentModalOpen(false)}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0088CC] hover:bg-[#0077b3] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Parent Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customers...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
