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
  ArrowLeft,
  MessageCircle,
  CreditCard,
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

  const { customers, addCustomer, updateCustomer, deleteCustomer, users, campaigns, salesOpportunities, globalSearch } =
    useEnterpriseCrm();

  // Top Tabs: 'All' | 'Customer' | 'Prospect'
  const [activeTab, setActiveTab] = useState<'All' | 'Customer' | 'Prospect'>('All');
  const [activeCustomerSubTab, setActiveCustomerSubTab] = useState<string>('customer');
  const [activeActivityTab, setActiveActivityTab] = useState<'notes' | 'task' | 'files' | 'sales_visit'>('notes');
  const [assignUser, setAssignUser] = useState('Nafal');

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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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
      } catch (e) {}
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
    contactSalutation: 'Mr.',
    contactPerson: '',
    phoneCode: '+971',
    phone: '',
    email: '',
    owner: currentUser?.name || 'Alex Rivera',
    type: 'Customer' as 'Customer' | 'Prospect',
    status: 'Active' as 'Active' | 'Inactive' | 'Prospect',
    companyGroup: 'Commercial Engineering',
    industryType: 'General Contracting',
    keyCustomer: 'No',
    source: 'Direct Inquiry',
    campaign: '',
    tags: '',
    address: 'Dubai, UAE',
    city: 'Dubai',
    website: '',
    totalSpend: 0,
    outstanding: 0,
  });

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
    return (customers || []).map((c, idx) => ({
      ...c,
      slNo: idx + 1,
      date: c.date || (c.createdDate ? new Date(c.createdDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '30-09-2026'),
      lastEnquiry: c.lastEnquiry || (idx % 2 === 0 ? 'Today' : '1 day(s) ago'),
      openEnquiries: c.openEnquiries ?? 1,
      lastOrder: c.lastOrder || 'No order till the date.',
      outstanding: c.outstanding ?? 0.0,
    }));
  }, [customers]);

  // Combined Search & Filter Logic
  const query = (search || globalSearch || '').trim().toLowerCase();

  const filteredCustomers = useMemo(() => {
    let allCrmUsers: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) allCrmUsers = JSON.parse(raw);
      } catch (e) {}
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
    if (!formData.customerName.trim()) return;

    const fullContactName = formData.contactSalutation
      ? `${formData.contactSalutation} ${formData.contactPerson.trim()}`
      : formData.contactPerson.trim();

    const fullPhone = formData.phone ? `${formData.phoneCode} ${formData.phone.trim()}` : '';

    const newCust: Partial<CrmCustomer> = {
      customerName: formData.customerName.trim().toUpperCase(),
      contactPerson: fullContactName || 'Primary Contact',
      salutation: formData.contactSalutation,
      phone: fullPhone || '+971 50 000 0000',
      email: formData.email.trim() || 'contact@client.ae',
      owner: formData.owner || currentUser?.name || 'Alex Rivera',
      status: formData.status,
      type: formData.type,
      companyGroup: formData.companyGroup,
      industryType: formData.industryType,
      keyCustomer: formData.keyCustomer === 'Yes',
      source: formData.source,
      campaign: formData.campaign,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      address: formData.address,
      city: formData.city,
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
      contactSalutation: 'Mr.',
      contactPerson: '',
      phoneCode: '+971',
      phone: '',
      email: '',
      owner: currentUser?.name || 'Alex Rivera',
      type: 'Customer',
      status: 'Active',
      companyGroup: 'Commercial Engineering',
      industryType: 'General Contracting',
      keyCustomer: 'No',
      source: 'Direct Inquiry',
      campaign: '',
      tags: '',
      address: 'Dubai, UAE',
      city: 'Dubai',
      website: '',
      totalSpend: 0,
      outstanding: 0,
    });
  };

  return (
    <div className="space-y-3.5 pb-16 font-sans text-slate-800">
      {editingCustomer ? (
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
                    <option value="JISMON JOSE">JISMON JOSE</option>
                    <option value="MUHAMMED AHSAN P V">MUHAMMED AHSAN P V</option>
                    <option value="Muhammed Adhil">Muhammed Adhil</option>
                    <option value="shameem">shameem</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Super Admin">Super Admin</option>
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
                    onChange={() => {}}
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
                          <span className="text-sm font-bold text-slate-900">{activeCustomer.openEnquiries || 1}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <List className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 2. Open Enquiries */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Open Enquiries</span>
                          <span className="text-sm font-bold text-slate-900">{activeCustomer.openEnquiries ?? 1}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 3. Last Enquiry */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Last Enquiry</span>
                          <span className="text-[11px] font-bold text-slate-900">{activeCustomer.lastEnquiry || '1 day(s) ago'}</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 4. Total Order */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Total Order</span>
                          <span className="text-sm font-bold text-slate-900">0</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 5. Conversion Ratio */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Conversion Ratio</span>
                          <span className="text-[11px] font-bold text-slate-900">0.00%</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 6. Lost Opportunity */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Lost Opportunity</span>
                          <span className="text-sm font-bold text-slate-900">0</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 7. Sale Amount */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Sale Amount</span>
                          <span className="text-[11px] font-bold text-slate-900">0.00</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 8. VAT */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">VAT</span>
                          <span className="text-[11px] font-bold text-slate-900">0.00</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                          <Calculator className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 9. Total */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Total</span>
                          <span className="text-[11px] font-bold text-slate-900">0.00</span>
                        </div>
                        <div className="w-7 h-7 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* 10. Invoiced */}
                      <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                        <div>
                          <span className="text-[11px] font-medium text-slate-600 block">Invoiced</span>
                          <span className="text-[11px] font-bold text-slate-900">0.00</span>
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
                            <span className="font-bold text-slate-900 block">0.00</span>
                            <span className="text-red-500 font-semibold block">VAT 0.00</span>
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
                            <span className="font-bold text-red-600 block">0.00</span>
                            <span className="text-emerald-600 block">Billed 0.00</span>
                            <span className="text-blue-600 block">Unbilled 0.00</span>
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
                          <span className="text-[11px] font-bold text-slate-900">0.00</span>
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
                            <span className="text-slate-600">Payment Received ⓘ <strong className="text-emerald-600">0.00</strong></span>
                            <span className="text-slate-600">Order ⓘ <strong className="text-emerald-600">0.00</strong></span>
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
              <option value="Muhammed Adhil">Muhammed Adhil</option>
              <option value="shameem">shameem</option>
              <option value="JISMON JOSE">JISMON JOSE</option>
              <option value="Alex Rivera">Alex Rivera</option>
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
                <th className="py-2.5 px-4 min-w-[240px] border-r border-slate-100">Customer</th>
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
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => router.push(`/customers/${cust.id}`)}
                            className="font-bold text-[#1677FF] hover:text-[#0958d9] uppercase hover:underline text-left leading-snug cursor-pointer"
                          >
                            {cust.customerName}
                          </button>
                          <button
                            onClick={() => router.push(`/customers/${cust.id}`)}
                            title="View customer overview"
                            className="text-[#1677FF] hover:text-[#0958d9] shrink-0 cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 4. Owner */}
                      <td className="py-3 px-3 text-center border-r border-slate-100">
                        <div className="inline-block" title={`Account Owner: ${cust.owner || 'Alex Rivera'}`}>
                          {renderUserAvatar(cust.owner || 'Alex Rivera', cust.ownerAvatar, 'w-6 h-6')}
                        </div>
                      </td>

                      {/* 5. Primary Contact */}
                      <td className="py-3 px-4 border-r border-slate-100">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#1677FF]">{cust.contactPerson || 'Point of Contact'}</span>
                            <button
                              onClick={() => setViewingCustomer(cust)}
                              className="text-[#1677FF] hover:text-[#0958d9]"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </div>
                          {cust.phone && (
                            <div className="flex items-center gap-1 text-xs mt-0.5">
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
                                D
                              </span>
                              <a
                                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                              >
                                {cust.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. Last Enquiry */}
                      <td className="py-3 px-3 text-center border-r border-slate-100">
                        <span className="inline-block bg-[#38BDF8] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                          {cust.lastEnquiry || 'Today'}
                        </span>
                      </td>

                      {/* 7. Open Enquiries */}
                      <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-slate-100">
                        {cust.openEnquiries ?? 1}
                      </td>

                      {/* 8. Last Order */}
                      <td className="py-3 px-4 text-center border-r border-slate-100">
                        <span className="inline-block bg-[#F59E0B] text-white text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shadow-2xs">
                          {cust.lastOrder || 'No order till the date.'}
                        </span>
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
                            className="bg-[#008080] hover:bg-[#006666] text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
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
                                    deleteCustomer(cust.id);
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

      {/* 5. ADD CUSTOMER MODAL (+ CUSTOMER Button) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Enterprise Customer Account"
        description="Add a verified corporate customer or prospect to Cezcon CRM."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
          <Input
            label="Customer / Corporate Name"
            required
            placeholder="e.g. VILLA PARK AND LANDSCAPE LLC"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Salutation"
              value={formData.contactSalutation}
              onChange={(e) => setFormData({ ...formData, contactSalutation: e.target.value })}
              options={[
                { label: 'Mr.', value: 'Mr.' },
                { label: 'Ms.', value: 'Ms.' },
                { label: 'Mrs.', value: 'Mrs.' },
                { label: 'Dr.', value: 'Dr.' },
                { label: 'Eng.', value: 'Eng.' },
              ]}
            />
            <div className="sm:col-span-2">
              <Input
                label="Primary Contact Person"
                required
                placeholder="e.g. Bishoy George"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Phone / WhatsApp"
              placeholder="+971 56 881 1334"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="contact@company.ae"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Account Owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              options={[
                { label: 'Alex Rivera', value: 'Alex Rivera' },
                { label: 'Muhammed Adhil', value: 'Muhammed Adhil' },
                { label: 'shameem', value: 'shameem' },
                { label: 'JISMON JOSE', value: 'JISMON JOSE' },
                { label: 'Super Admin', value: 'Super Admin' },
              ]}
            />
            <Select
              label="Account Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { label: 'Customer', value: 'Customer' },
                { label: 'Prospect', value: 'Prospect' },
              ]}
            />
            <Select
              label="Industry Type"
              value={formData.industryType}
              onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
              options={[
                { label: 'General Contracting', value: 'General Contracting' },
                { label: 'Landscape & Horticulture', value: 'Landscape & Horticulture' },
                { label: 'Construction & Civil', value: 'Construction & Civil' },
                { label: 'Fitout & Interior Design', value: 'Fitout & Interior Design' },
                { label: 'Chemical & Manufacturing', value: 'Chemical & Manufacturing' },
                { label: 'Commercial Engineering', value: 'Commercial Engineering' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company Location / Address"
              placeholder="e.g. Al Quoz Industrial 3, Dubai"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Select
              label="Key Customer?"
              value={formData.keyCustomer}
              onChange={(e) => setFormData({ ...formData, keyCustomer: e.target.value })}
              options={[
                { label: 'No', value: 'No' },
                { label: 'Yes (VIP Priority)', value: 'Yes' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. ASSIGN CUSTOMER MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Customer / Prospect Accounts"
        description="Bulk re-assign customer accounts to dedicated sales managers and field engineers."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select the new account owner to allocate the customer directory accounts to:
          </p>
          <Select
            label="Assign To Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            options={[
              { label: 'Muhammed Adhil', value: 'Muhammed Adhil' },
              { label: 'shameem', value: 'shameem' },
              { label: 'JISMON JOSE', value: 'JISMON JOSE' },
              { label: 'Alex Rivera', value: 'Alex Rivera' },
              { label: 'Super Admin', value: 'Super Admin' },
            ]}
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-[#0F2844] hover:bg-[#1E3A8A] text-white"
              onClick={() => {
                alert(`Customers successfully allocated to ${formData.owner}`);
                setIsAssignModalOpen(false);
              }}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. UPLOAD CUSTOMER MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Bulk Import Customers (.CSV / .XLSX)"
        description="Import corporate client accounts directly from spreadsheet files."
      >
        <div className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Drag &amp; drop Excel or CSV file here</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports UTF-8 CSV, XLSX up to 10MB</p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
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
