'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

  const { customers, addCustomer, updateCustomer, deleteCustomer, users, campaigns, globalSearch } =
    useEnterpriseCrm();

  // Top Tabs: 'All' | 'Customer' | 'Prospect'
  const [activeTab, setActiveTab] = useState<'All' | 'Customer' | 'Prospect'>('All');

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
                            onClick={() => setViewingCustomer(cust)}
                            className="font-bold text-[#1677FF] hover:text-[#0958d9] uppercase hover:underline text-left leading-snug"
                          >
                            {cust.customerName}
                          </button>
                          <button
                            onClick={() => setViewingCustomer(cust)}
                            title="View customer overview"
                            className="text-[#1677FF] hover:text-[#0958d9] shrink-0"
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
                                  window.open(`/customers?id=${cust.id}`, '_blank');
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
                                  setViewingCustomer(cust);
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

      {/* 8. CUSTOMER DETAILS MODAL */}
      {viewingCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setViewingCustomer(null)}
          title={viewingCustomer.customerName}
          description="Customer Profile &amp; Lifetime Account Summary"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {viewingCustomer.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Owner:</span>
                <span className="font-bold text-slate-800">{viewingCustomer.owner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Primary Contact:</span>
                <span className="font-bold text-[#1677FF]">{viewingCustomer.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone / WhatsApp:</span>
                <a
                  href={`tel:${viewingCustomer.phone}`}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  {viewingCustomer.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <a
                  href={`mailto:${viewingCustomer.email}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {viewingCustomer.email}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Industry Type:</span>
                <span className="font-semibold text-slate-700">{viewingCustomer.industryType || viewingCustomer.companyGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Outstanding Balance:</span>
                <span className="font-black text-rose-600">AED {(viewingCustomer.outstanding ?? 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setViewingCustomer(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-[#1677FF] text-white"
                onClick={() => {
                  const cust = viewingCustomer;
                  setViewingCustomer(null);
                  setEditingCustomer(cust);
                }}
              >
                Edit Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCustomer(null)}
          title={`Edit Customer: ${editingCustomer.customerName}`}
          description="Update account specifications, contact details, or assigned owner."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCustomer(editingCustomer.id, editingCustomer);
              setEditingCustomer(null);
            }}
            className="space-y-3.5 text-xs"
          >
            <Input
              label="Customer Name"
              required
              value={editingCustomer.customerName}
              onChange={(e) => setEditingCustomer({ ...editingCustomer, customerName: e.target.value.toUpperCase() })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Primary Contact Person"
                value={editingCustomer.contactPerson}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, contactPerson: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={editingCustomer.phone}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                value={editingCustomer.email}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
              />
              <Select
                label="Account Owner"
                value={editingCustomer.owner}
                onChange={(e) => setEditingCustomer({ ...editingCustomer, owner: e.target.value })}
                options={[
                  { label: 'Muhammed Adhil', value: 'Muhammed Adhil' },
                  { label: 'shameem', value: 'shameem' },
                  { label: 'JISMON JOSE', value: 'JISMON JOSE' },
                  { label: 'Alex Rivera', value: 'Alex Rivera' },
                  { label: 'Super Admin', value: 'Super Admin' },
                ]}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingCustomer(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#22C55E] text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
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
