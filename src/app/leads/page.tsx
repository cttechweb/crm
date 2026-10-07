'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ListChecks,
  Plus,
  Search,
  Filter,
  Trash2,
  Phone,
  Mail,
  Building,
  Download,
  Flame,
  User,
  Shield,
  MessageCircle,
  Edit,
  Edit2,
  Book,
  Settings,
  ChevronDown,
  Calendar,
  X,
  Upload,
  UserCheck,
  Info,
  ExternalLink,
  MapPin,
  Check,
  ArrowUpRight,
  CornerUpRight,
  Smartphone,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ChangeLeadStatusModal,
  getRatingBadgeClass,
  getStatusBadgeClass,
} from '@/components/leads/ChangeLeadStatusModal';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { canAccessLead } from '@/services/crmDataScopeService';
import { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';

export function LeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect legacy query parameters to dedicated pages
  useEffect(() => {
    const view = searchParams.get('view');
    const action = searchParams.get('action');
    const tab = searchParams.get('tab');

    if (view === 'sources' || tab === 'sources') {
      router.replace('/leads/sources');
    } else if (view === 'status' || tab === 'status') {
      router.replace('/leads/status');
    } else if (view === 'followups' || tab === 'followups') {
      router.replace('/leads/followups');
    } else if (action === 'import' || view === 'import' || tab === 'import') {
      router.replace('/leads/import');
    } else if (view === 'reports' || tab === 'reports') {
      router.replace('/leads/reports');
    }
  }, [searchParams, router]);

  const { leads, addLead, updateLead, deleteLead, addCustomer, addOpportunity, users, campaigns } =
    useEnterpriseCrm();

  // Top Filter Grid State
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [createdByFilter, setCreatedByFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [opportunityFilter, setOpportunityFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [inactiveFromDate, setInactiveFromDate] = useState('');
  const [leadDateFilter, setLeadDateFilter] = useState('');
  const [leadCreatedDateFilter, setLeadCreatedDateFilter] = useState('');
  const [leadAssignedDateFilter, setLeadAssignedDateFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [tagsFilter, setTagsFilter] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Table Controls & Pagination
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [viewingLead, setViewingLead] = useState<CrmLead | null>(null);
  const [assigningLead, setAssigningLead] = useState<CrmLead | null>(null);
  const [assignToOwner, setAssignToOwner] = useState('');
  const [convertingLead, setConvertingLead] = useState<CrmLead | null>(null);
  const [statusModifyingLead, setStatusModifyingLead] = useState<CrmLead | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const handleUpdateStatusAndRating = (data: {
    status: LeadStatus;
    rating: LeadRating;
    comments: string;
    addNote: boolean;
  }) => {
    if (!statusModifyingLead) return;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB').replace(/\//g, '-')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    let updatedNotes = statusModifyingLead.notes || [];
    if (data.addNote) {
      const noteContent = data.comments.trim()
        ? `Status changed to ${data.status} (${String(data.rating).toUpperCase()}). Comment: ${data.comments.trim()}`
        : `Status changed to ${data.status} (${String(data.rating).toUpperCase()}).`;

      const newNote = {
        id: `note-${Date.now()}`,
        author: currentUser?.name || statusModifyingLead.owner || 'Admin',
        avatar: currentUser?.avatar || statusModifyingLead.ownerAvatar || '',
        date: formattedDate,
        content: noteContent,
      };
      updatedNotes = [newNote, ...updatedNotes];
    }

    updateLead(statusModifyingLead.id, {
      status: data.status,
      rating: data.rating,
      comments: data.comments,
      lastActivity: `Status updated to ${data.status}`,
      lastActivityDate: formattedDate,
      lastActivityTimeAgo: 'Just now',
      notes: updatedNotes,
    });

    setStatusModifyingLead(null);
  };

  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const u = authMockService.getCurrentUser();
      if (u) {
        setCurrentUser(u);
        setAssignToOwner((prev) => prev || u.name || 'shaheer');
      }
    };
    syncUser();
    const unsub = authMockService.onAuthStateChanged((u) => {
      if (u) {
        setCurrentUser(u);
        setAssignToOwner((prev) => prev || u.name || 'shaheer');
      }
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

    // Seed defaults per manager type
    if (isMktMgr) {
      ['arun', 'arun employee', 'a', 'arun@gmail.com', 'arun@company.com', 'employee 7', 'employee7@company.com', 'employee 8', 'employee8@company.com'].forEach((m) =>
        memberIdentifiers.add(m.toLowerCase())
      );
    } else if (isSalesMgr) {
      ['employee 1', 'employee@gmail.com', 'employee 2', 'employee2@company.com', 'employee 3', 'employee3@company.com'].forEach((m) =>
        memberIdentifiers.add(m.toLowerCase())
      );
    }

    return Array.from(memberIdentifiers);
  }, [currentUser]);

  // Comprehensive list of all active registered CRM users for assignment
  const assignableUsers = useMemo(() => {
    let deletedIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const delRaw = localStorage.getItem('cezcon_crm_deleted_user_ids');
        if (delRaw) deletedIds = JSON.parse(delRaw);
      } catch (e) {}
    }

    const userMap = new Map<string, { id: string; name: string; role: string; department?: string; avatar?: string; email?: string }>();

    // 1. Dynamic users from localStorage (Settings > Users)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: any) => {
              const uId = String(u.id || '');
              if (deletedIds.includes(uId) || deletedIds.includes(`usr_${uId}`) || deletedIds.includes(uId.replace('usr_', ''))) {
                return;
              }
              const name = u.name?.trim() || u.username?.trim();
              if (name && !userMap.has(name.toLowerCase())) {
                userMap.set(name.toLowerCase(), {
                  id: uId || `usr_${name.toLowerCase()}`,
                  name,
                  role: u.profileType || u.employeeType || u.designation || 'Staff',
                  department: u.department || u.managerType || '',
                  avatar: u.avatarImage || u.avatarUrl || u.avatar,
                  email: u.email,
                });
              }
            });
          }
        }
      } catch (e) {}
    }

    // 2. Users from EnterpriseCrmContext
    users.forEach((u) => {
      if (u.name && !userMap.has(u.name.toLowerCase())) {
        userMap.set(u.name.toLowerCase(), {
          id: u.id,
          name: u.name,
          role: u.role || 'Sales Representative',
          department: u.department,
          avatar: u.avatar,
          email: u.email,
        });
      }
    });

    // 3. Fallback standard enterprise representatives
    const fallbacks = [
      { id: 'usr_shaheer', name: 'Shaheer', role: 'Sales Executive', department: 'Sales' },
      { id: 'usr_shibil', name: 'Muhammed Shibil', role: 'Sales Manager', department: 'Sales' },
      { id: 'usr_jismon', name: 'JISMON JOSE', role: 'Sales Executive', department: 'Sales' },
      { id: 'usr_ahsan', name: 'MUHAMMED AHSAN P V', role: 'Sales Executive', department: 'Sales' },
      { id: 'usr_adhil', name: 'Muhammed Adhil', role: 'Sales Executive', department: 'Sales' },
      { id: 'usr_afsal', name: 'Afsal', role: 'Marketing Manager', department: 'Marketing' },
      { id: 'usr_arun', name: 'Arun', role: 'Marketing Executive', department: 'Marketing' },
      { id: 'usr_shameem', name: 'Shameem', role: 'Marketing Executive', department: 'Marketing' },
      { id: 'usr_rashid', name: 'Mohammed Rashid', role: 'Purchase Manager', department: 'Purchase' },
    ];

    fallbacks.forEach((f) => {
      if (!userMap.has(f.name.toLowerCase())) {
        userMap.set(f.name.toLowerCase(), f);
      }
    });

    return Array.from(userMap.values());
  }, [users]);

  // Country Phone Rules & Validation Schemas
  const COUNTRY_DIAL_RULES: Record<string, { minDigits: number; maxDigits: number; label: string; placeholder: string }> = {
    '+971': { minDigits: 9, maxDigits: 9, label: 'UAE', placeholder: '50 123 4567' },
    '+966': { minDigits: 9, maxDigits: 9, label: 'Saudi Arabia', placeholder: '50 123 4567' },
    '+968': { minDigits: 8, maxDigits: 8, label: 'Oman', placeholder: '9123 4567' },
    '+974': { minDigits: 8, maxDigits: 8, label: 'Qatar', placeholder: '3312 3456' },
    '+965': { minDigits: 8, maxDigits: 8, label: 'Kuwait', placeholder: '9123 4567' },
    '+973': { minDigits: 8, maxDigits: 8, label: 'Bahrain', placeholder: '3612 3456' },
    '+91': { minDigits: 10, maxDigits: 10, label: 'India', placeholder: '98765 43210' },
    '+92': { minDigits: 10, maxDigits: 10, label: 'Pakistan', placeholder: '300 1234567' },
    '+44': { minDigits: 10, maxDigits: 11, label: 'UK', placeholder: '7123 456789' },
    '+1': { minDigits: 10, maxDigits: 10, label: 'USA', placeholder: '555 123 4567' },
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // New Lead Form State (Full Cezcon CRM Compatibility)
  const [newLead, setNewLead] = useState({
    owner: currentUser?.name || 'shaheer',
    assignedTo: currentUser?.name || 'shaheer',
    leadDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    contactPrefix: 'Mr.',
    name: '',
    designation: '',
    businessMobileCode: '+971',
    businessMobile: '',
    personalMobileCode: '+971',
    personalMobile: '',
    email: '',
    nationality: '',
    customerName: '',
    telCode: '+971',
    tel: '',
    website: '',
    leadTags: '',
    campaign: '',
    source: '',
    sourceName: '',
    rating: 'Cold' as LeadRating,
    status: 'Pending' as LeadStatus,
    businessOpportunity: '',
    location: '',
    comments: '',
  });

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    let allCrmUsers: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) allCrmUsers = JSON.parse(raw);
      } catch (e) {}
    }

    return leads.filter((lead) => {
      // 🛡️ Centralized Role Hierarchy & Department Scope Enforcement
      if (!canAccessLead(lead, currentUser, allCrmUsers)) {
        return false;
      }

      // Owner Filter
      if (ownerFilter !== 'All' && lead.owner !== ownerFilter) return false;
      // Created By Filter
      if (createdByFilter !== 'All' && lead.createdBy !== createdByFilter) return false;
      // Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pending/Contacted') {
          if (lead.status !== 'Pending' && lead.status !== 'Contacted') return false;
        } else if (lead.status !== statusFilter) {
          return false;
        }
      }
      // Rating Filter
      if (ratingFilter !== 'All' && lead.rating !== ratingFilter) return false;
      // Campaign Filter
      if (campaignFilter !== 'All' && lead.campaign !== campaignFilter) return false;
      // Source Filter
      if (sourceFilter !== 'All' && lead.source !== sourceFilter) return false;
      // Tags Filter
      if (tagsFilter.trim() && !lead.tags?.some((t) => t.toLowerCase().includes(tagsFilter.toLowerCase()))) {
        return false;
      }
      // Search Box
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = lead.contactDetails.name.toLowerCase().includes(q);
        const matchesCompany = lead.contactDetails.company.toLowerCase().includes(q);
        const matchesPhone = lead.contactDetails.phone.toLowerCase().includes(q);
        const matchesSpec = lead.leadSpecification.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesPhone && !matchesSpec) return false;
      }
      return true;
    });
  }, [
    leads,
    isEmployee,
    isManager,
    managerTeamMembers,
    currentUser,
    ownerFilter,
    createdByFilter,
    statusFilter,
    ratingFilter,
    campaignFilter,
    sourceFilter,
    tagsFilter,
    search,
  ]);

  const totalEntries = filteredLeads.length;
  const displayLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

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

  const validateLeadForm = () => {
    const errors: Record<string, string> = {};

    if (!newLead.name.trim()) {
      errors.name = 'Contact Name is required';
    } else if (newLead.name.trim().length < 2) {
      errors.name = 'Contact Name must be at least 2 characters';
    }

    if (newLead.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newLead.email.trim())) {
        errors.email = 'Please enter a valid email address (e.g. name@domain.com)';
      }
    }

    if (newLead.businessMobile.trim()) {
      const cleanDigits = newLead.businessMobile.replace(/\D/g, '');
      const rule = COUNTRY_DIAL_RULES[newLead.businessMobileCode] || { minDigits: 7, maxDigits: 15, label: 'Selected Country', placeholder: '' };
      if (cleanDigits.length < rule.minDigits || cleanDigits.length > rule.maxDigits) {
        errors.businessMobile = `${rule.label} (${newLead.businessMobileCode}) requires ${rule.minDigits === rule.maxDigits ? `${rule.minDigits} digits` : `${rule.minDigits}-${rule.maxDigits} digits`} (entered: ${cleanDigits.length})`;
      }
    }

    if (newLead.personalMobile.trim()) {
      const cleanDigits = newLead.personalMobile.replace(/\D/g, '');
      const rule = COUNTRY_DIAL_RULES[newLead.personalMobileCode] || { minDigits: 7, maxDigits: 15, label: 'Selected Country', placeholder: '' };
      if (cleanDigits.length < rule.minDigits || cleanDigits.length > rule.maxDigits) {
        errors.personalMobile = `${rule.label} (${newLead.personalMobileCode}) requires ${rule.minDigits === rule.maxDigits ? `${rule.minDigits} digits` : `${rule.minDigits}-${rule.maxDigits} digits`} (entered: ${cleanDigits.length})`;
      }
    }

    if (newLead.tel.trim()) {
      const cleanDigits = newLead.tel.replace(/\D/g, '');
      if (cleanDigits.length < 6 || cleanDigits.length > 12) {
        errors.tel = `Landline requires between 6 and 12 digits (entered: ${cleanDigits.length})`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLeadForm()) {
      return;
    }

    const contactDisplayName = newLead.name.trim() ? `${newLead.contactPrefix} ${newLead.name.trim()}` : (newLead.customerName || 'Point of contact');
    const companyDisplayName = newLead.customerName.trim() || newLead.name.trim() || 'New Enterprise Client';

    const enteredOwner = newLead.owner.trim() || currentUser?.name || 'shaheer';
    const enteredAssignee = newLead.assignedTo.trim() || enteredOwner;
    const effectiveCreatedBy = currentUser?.name || 'Super Admin';
    const effectiveAssignedEmployee = enteredAssignee;

    const assigneeAvatarImg = getEmployeePhoto(effectiveAssignedEmployee) || '';
    const ownerAvatarImg = getEmployeePhoto(enteredOwner) || currentUser?.avatar || '';
    const createdByAvatarImg = getEmployeePhoto(effectiveCreatedBy) || currentUser?.avatar || '';

    const cleanBiz = newLead.businessMobile.replace(/\D/g, '');
    const cleanPersonal = newLead.personalMobile.replace(/\D/g, '');
    const mainPhone = cleanBiz ? `${newLead.businessMobileCode} ${cleanBiz}` : (cleanPersonal ? `${newLead.personalMobileCode} ${cleanPersonal}` : '+971 50 123 4567');

    addLead({
      leadDate: newLead.leadDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      assignedDate: newLead.leadDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      leadAssigned: {
        name: effectiveAssignedEmployee,
        avatar: assigneeAvatarImg,
      },
      contactDetails: {
        name: contactDisplayName,
        company: companyDisplayName,
        phone: mainPhone,
        email: newLead.email.trim(),
        whatsapp: cleanPersonal ? `${newLead.personalMobileCode} ${cleanPersonal}` : mainPhone,
      },
      leadSpecification: newLead.comments || newLead.businessOpportunity || 'Commercial client HVAC specification',
      createdBy: effectiveCreatedBy,
      createdByAvatar: createdByAvatarImg,
      owner: enteredOwner,
      ownerAvatar: ownerAvatarImg,
      assignedEmployee: effectiveAssignedEmployee,
      department: currentUser?.department || currentUser?.managerType || currentUser?.employeeType || (currentUser?.name?.toLowerCase().includes('arun') ? 'Marketing' : 'Sales'),
      rating: newLead.rating,
      status: newLead.status,
      lastActivity: 'Just created',
      lastActivityDate: `${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      lastActivityTimeAgo: 'Just now',
      value: 0,
      source: newLead.source || 'Website Inbound',
      campaign: newLead.campaign || 'SIMPLE LIFE - 2025',
      businessOpportunity: newLead.businessOpportunity || 'HVAC Installation',
      tags: newLead.leadTags ? newLead.leadTags.split(',').map((t) => t.trim()) : ['New Lead'],
    });

    setFormErrors({});
    setIsAddModalOpen(false);
    setNewLead({
      owner: currentUser?.name || 'shaheer',
      assignedTo: currentUser?.name || 'shaheer',
      leadDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      contactPrefix: 'Mr.',
      name: '',
      designation: '',
      businessMobileCode: '+971',
      businessMobile: '',
      personalMobileCode: '+971',
      personalMobile: '',
      email: '',
      nationality: '',
      customerName: '',
      telCode: '+971',
      tel: '',
      website: '',
      leadTags: '',
      campaign: '',
      source: '',
      sourceName: '',
      rating: 'Cold',
      status: 'Pending',
      businessOpportunity: '',
      location: '',
      comments: '',
    });
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    updateLead(editingLead.id, editingLead);
    setEditingLead(null);
  };

  if (isAddModalOpen) {
    const bizRule = COUNTRY_DIAL_RULES[newLead.businessMobileCode] || { maxDigits: 15, placeholder: '50 123 4567' };
    const persRule = COUNTRY_DIAL_RULES[newLead.personalMobileCode] || { maxDigits: 15, placeholder: '50 123 4567' };

    return (
      <div className="space-y-3 pb-8 text-[#212529] animate-in fade-in duration-150">
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          {/* Top Header Bar */}
          <div className="px-4 py-2 bg-[#FAFBFD] border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-bold text-sm">≡</span>
              <span className="font-bold text-slate-800 text-xs">Add Lead</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormErrors({});
                setIsAddModalOpen(false);
              }}
              className="w-5 h-5 rounded bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors cursor-pointer font-black text-xs shadow-2xs"
              title="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* 2-Column Cezcon Form */}
          <form onSubmit={handleCreateLead} noValidate className="p-5 sm:p-7 space-y-4 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-3.5">
                {/* 1. Lead Owner */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Lead Owner
                  </label>
                  <div className="sm:col-span-9 relative flex items-center border border-slate-300 rounded bg-white px-2.5 py-1 focus-within:border-blue-500 shadow-2xs">
                    {renderUserAvatar(newLead.owner, undefined, 'w-5 h-5 mr-2 shrink-0')}
                    <select
                      value={newLead.owner}
                      onChange={(e) => setNewLead({ ...newLead, owner: e.target.value })}
                      className="w-full bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer pr-4 appearance-none"
                    >
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} {u.role ? `(${u.role})` : ''}
                        </option>
                      ))}
                      {newLead.owner && !assignableUsers.some((u) => u.name === newLead.owner) && (
                        <option value={newLead.owner}>{newLead.owner}</option>
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Assign Lead / Assigned To */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center bg-blue-50/40 p-2 rounded border border-blue-100/70">
                  <label className="sm:col-span-3 text-xs font-semibold text-blue-900 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Assign To</span>
                  </label>
                  <div className="sm:col-span-9 relative flex items-center border border-blue-300 rounded bg-white px-2.5 py-1 focus-within:border-blue-600 shadow-2xs">
                    {renderUserAvatar(newLead.assignedTo, undefined, 'w-5 h-5 mr-2 shrink-0')}
                    <select
                      value={newLead.assignedTo}
                      onChange={(e) => setNewLead({ ...newLead, assignedTo: e.target.value })}
                      className="w-full bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer pr-4 appearance-none"
                    >
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} {u.role ? `(${u.role})` : ''}
                        </option>
                      ))}
                      {newLead.assignedTo && !assignableUsers.some((u) => u.name === newLead.assignedTo) && (
                        <option value={newLead.assignedTo}>{newLead.assignedTo}</option>
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Contact Name * */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 pt-1.5">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-9">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newLead.contactPrefix}
                        onChange={(e) => setNewLead({ ...newLead, contactPrefix: e.target.value })}
                        className="w-20 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs shrink-0 cursor-pointer"
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
                        value={newLead.name}
                        onChange={(e) => {
                          setNewLead({ ...newLead, name: e.target.value });
                          if (formErrors.name) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.name;
                              return copy;
                            });
                          }
                        }}
                        className={cn(
                          "flex-1 bg-white border rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none shadow-2xs transition-colors",
                          formErrors.name
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                            : "border-slate-300 focus:border-blue-500"
                        )}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in flex items-center gap-1">
                        <span>⚠️</span> {formErrors.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Business Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                    <span>Business Mobile</span>
                  </label>
                  <div className="sm:col-span-9">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newLead.businessMobileCode}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          const rule = COUNTRY_DIAL_RULES[newCode] || { maxDigits: 15 };
                          setNewLead({
                            ...newLead,
                            businessMobileCode: newCode,
                            businessMobile: newLead.businessMobile.replace(/\D/g, '').slice(0, rule.maxDigits),
                          });
                          if (formErrors.businessMobile) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.businessMobile;
                              return copy;
                            });
                          }
                        }}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs shrink-0 cursor-pointer"
                      >
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={bizRule.maxDigits}
                        placeholder={bizRule.placeholder || 'e.g. 501234567'}
                        value={newLead.businessMobile}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, bizRule.maxDigits);
                          setNewLead({ ...newLead, businessMobile: digitsOnly });
                          if (formErrors.businessMobile) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.businessMobile;
                              return copy;
                            });
                          }
                        }}
                        className={cn(
                          "flex-1 bg-white border rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none shadow-2xs font-mono transition-colors",
                          formErrors.businessMobile
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                            : "border-slate-300 focus:border-blue-500"
                        )}
                      />
                    </div>
                    {formErrors.businessMobile && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in flex items-center gap-1">
                        <span>⚠️</span> {formErrors.businessMobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Email */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                    <span>Email</span>
                  </label>
                  <div className="sm:col-span-9">
                    <input
                      type="email"
                      placeholder="Add email e.g. client@company.com"
                      value={newLead.email}
                      onChange={(e) => {
                        setNewLead({ ...newLead, email: e.target.value });
                        if (formErrors.email) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.email;
                            return copy;
                          });
                        }
                      }}
                      className={cn(
                        "w-full bg-white border rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none shadow-2xs transition-colors",
                        formErrors.email
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                          : "border-slate-300 focus:border-blue-500"
                      )}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in flex items-center gap-1">
                        <span>⚠️</span> {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* 5. Customer Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Customer Name
                  </label>
                  <div className="sm:col-span-9">
                    <input
                      type="text"
                      placeholder="Company or Organization Name"
                      value={newLead.customerName}
                      onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* 6. Website */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Website
                  </label>
                  <div className="sm:col-span-9">
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={newLead.website}
                      onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* 7. Campaign */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Campaign</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-black">?</span>
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={newLead.campaign}
                      onChange={(e) => setNewLead({ ...newLead, campaign: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none shadow-2xs cursor-pointer pr-8"
                    >
                      <option value="">Select Campaign</option>
                      <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                      <option value="REACHUAE - 2025">REACHUAE - 2025</option>
                      <option value="ATN - 2025">ATN - 2025</option>
                      <option value="YELLOW PAGES-UAE.COM - 2025">YELLOW PAGES-UAE.COM - 2025</option>
                      <option value="INBOUND PHONE CALLS - 2025">INBOUND PHONE CALLS - 2025</option>
                      <option value="GOOGLE AD 2025">GOOGLE AD 2025</option>
                      <option value="META AD - 2025">META AD - 2025</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 8. Source Name */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Source Name
                  </label>
                  <div className="sm:col-span-9">
                    <input
                      type="text"
                      placeholder="Name of the source. Eg Google, LinkedIn"
                      value={newLead.sourceName}
                      onChange={(e) => setNewLead({ ...newLead, sourceName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* 9. Status */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={newLead.status}
                      onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none shadow-2xs cursor-pointer pr-8"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Converted">Converted</option>
                      <option value="Lost">Lost</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 10. Location */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                    <span>Location</span>
                  </label>
                  <div className="sm:col-span-9 relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search location"
                      value={newLead.location}
                      onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs pr-7"
                    />
                    {newLead.location && (
                      <button
                        type="button"
                        onClick={() => setNewLead({ ...newLead, location: '' })}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-3.5">
                {/* 1. Lead Date */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Lead Date
                  </label>
                  <div className="sm:col-span-9">
                    <DatePicker
                      value={newLead.leadDate}
                      onChange={(val) => setNewLead({ ...newLead, leadDate: val })}
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                </div>

                {/* 2. Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Designation
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={newLead.designation}
                      onChange={(e) => setNewLead({ ...newLead, designation: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none shadow-2xs cursor-pointer pr-8"
                    >
                      <option value="">Select</option>
                      <option value="Managing Director">Managing Director</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Procurement Manager">Procurement Manager</option>
                      <option value="Chief Engineer">Chief Engineer</option>
                      <option value="Project Engineer">Project Engineer</option>
                      <option value="Facility Manager">Facility Manager</option>
                      <option value="Owner / Executive">Owner / Executive</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Personal Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                    <span>Personal Mobile</span>
                  </label>
                  <div className="sm:col-span-9">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newLead.personalMobileCode}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          const rule = COUNTRY_DIAL_RULES[newCode] || { maxDigits: 15 };
                          setNewLead({
                            ...newLead,
                            personalMobileCode: newCode,
                            personalMobile: newLead.personalMobile.replace(/\D/g, '').slice(0, rule.maxDigits),
                          });
                          if (formErrors.personalMobile) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.personalMobile;
                              return copy;
                            });
                          }
                        }}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs shrink-0 cursor-pointer"
                      >
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={persRule.maxDigits}
                        placeholder={persRule.placeholder || 'e.g. 501234567'}
                        value={newLead.personalMobile}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, persRule.maxDigits);
                          setNewLead({ ...newLead, personalMobile: digitsOnly });
                          if (formErrors.personalMobile) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.personalMobile;
                              return copy;
                            });
                          }
                        }}
                        className={cn(
                          "flex-1 bg-white border rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none shadow-2xs font-mono transition-colors",
                          formErrors.personalMobile
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                            : "border-slate-300 focus:border-blue-500"
                        )}
                      />
                    </div>
                    {formErrors.personalMobile && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in flex items-center gap-1">
                        <span>⚠️</span> {formErrors.personalMobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Nationality
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={newLead.nationality}
                      onChange={(e) => setNewLead({ ...newLead, nationality: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none shadow-2xs cursor-pointer pr-8"
                    >
                      <option value="">Select Nationality</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Oman">Oman</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Egypt">Egypt</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 5. Tel */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                    <span>Tel</span>
                  </label>
                  <div className="sm:col-span-9">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newLead.telCode}
                        onChange={(e) => setNewLead({ ...newLead, telCode: e.target.value })}
                        className="w-24 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs shrink-0 cursor-pointer"
                      >
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="Landline number"
                        value={newLead.tel}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
                          setNewLead({ ...newLead, tel: digitsOnly });
                          if (formErrors.tel) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.tel;
                              return copy;
                            });
                          }
                        }}
                        className={cn(
                          "flex-1 bg-white border rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none shadow-2xs font-mono transition-colors",
                          formErrors.tel
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                            : "border-slate-300 focus:border-blue-500"
                        )}
                      />
                    </div>
                    {formErrors.tel && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 animate-in fade-in flex items-center gap-1">
                        <span>⚠️</span> {formErrors.tel}
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. Lead Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Lead Tags
                  </label>
                  <div className="sm:col-span-9">
                    <input
                      type="text"
                      placeholder="e.g. VIP, Priority, Chiller"
                      value={newLead.leadTags}
                      onChange={(e) => setNewLead({ ...newLead, leadTags: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* 7. Source */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Source</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-black">?</span>
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none shadow-2xs cursor-pointer pr-8"
                    >
                      <option value="">Select Source</option>
                      <option value="Website Inbound">Website Inbound</option>
                      <option value="Direct Inbound Call">Direct Inbound Call</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Meta Ads">Meta Ads</option>
                      <option value="Yellow Pages UAE">Yellow Pages UAE</option>
                      <option value="Referral Client">Referral Client</option>
                      <option value="Trade Exhibition">Trade Exhibition</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 8. Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>Rating</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-black">?</span>
                  </label>
                  <div className="sm:col-span-9 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNewLead({ ...newLead, rating: 'Cold' })}
                      className={cn(
                        'px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer shadow-2xs',
                        newLead.rating === 'Cold'
                          ? 'bg-[#0284C7] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      COLD
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewLead({ ...newLead, rating: 'Warm' })}
                      className={cn(
                        'px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer shadow-2xs',
                        newLead.rating === 'Warm'
                          ? 'bg-[#F59E0B] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      WARM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewLead({ ...newLead, rating: 'Hot' })}
                      className={cn(
                        'px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer shadow-2xs',
                        newLead.rating === 'Hot'
                          ? 'bg-[#E11D48] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      HOT
                    </button>
                  </div>
                </div>

                {/* 9. Business Opportunity */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Business Opportunity
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={newLead.businessOpportunity}
                      onChange={(e) => setNewLead({ ...newLead, businessOpportunity: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none shadow-2xs cursor-pointer pr-8"
                    >
                      <option value="">Select Business Opportunity</option>
                      <option value="HVAC Installation">HVAC Installation</option>
                      <option value="Commercial Construction">Commercial Construction</option>
                      <option value="Industrial Cooling">Industrial Cooling</option>
                      <option value="Facility Maintenance">Facility Maintenance</option>
                      <option value="Chiller Overhaul">Chiller Overhaul</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 10. Comments */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 pt-1">
                    Comments
                  </label>
                  <div className="sm:col-span-9">
                    <textarea
                      rows={3}
                      value={newLead.comments}
                      onChange={(e) => setNewLead({ ...newLead, comments: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-[#0F2844] hover:bg-[#0A1D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormErrors({});
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                ← Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8 text-[#212529]">
      {/* ── 1. Top Filter Grid Card ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded p-3 sm:p-4 shadow-2xs">
        {/* Mobile Filter Header Toggle Button */}
        <div className="flex md:hidden items-center justify-between">
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
          >
            <div className="flex items-center gap-1.5 text-blue-600">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Leads</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                {showFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
              </span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showFiltersMobile ? 'rotate-180' : '')} />
          </button>
        </div>

        {/* Filter Grid: always visible on desktop (md:grid), toggleable on mobile */}
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs', showFiltersMobile ? 'mt-3 grid' : 'hidden md:grid')}>
          {/* Row 1 - Col 1: Select Owner */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Select Owner</label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Owners</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1 - Col 2: Created By */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Created By</label>
            <select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              {assignableUsers.map((u) => (
                <option key={`cb-${u.id}`} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1 - Col 3: Status */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Disqualified">Disqualified</option>
            </select>
          </div>

          {/* Row 1 - Col 4: Rating */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All</option>
              <option value="Cold">Cold</option>
              <option value="Warm">Warm</option>
              <option value="Hot">Hot</option>
            </select>
          </div>

          {/* Row 2 - Col 1: Business Opportunity */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Business Opportunity</label>
            <select
              value={opportunityFilter}
              onChange={(e) => setOpportunityFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">Select Type</option>
              <option value="HVAC Installation">HVAC Installation</option>
              <option value="Commercial Construction">Commercial Construction</option>
              <option value="Industrial HVAC">Industrial HVAC</option>
              <option value="Facility Maintenance">Facility Maintenance</option>
              <option value="Contracting">Contracting</option>
              <option value="Chillers">Chillers</option>
            </select>
          </div>

          {/* Row 2 - Col 2: Campaign */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Campaign</label>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">Select Campaign</option>
              <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
              <option value="REACHUAE - 2025">REACHUAE - 2025</option>
              <option value="ATN - 2025">ATN - 2025</option>
              <option value="YELLOW PAGES-UAE.COM - 2025">YELLOW PAGES-UAE.COM - 2025</option>
              <option value="INBOUND PHONE CALLS - 2025">INBOUND PHONE CALLS - 2025</option>
              <option value="INBOUND E-MAIL - 2025">INBOUND E-MAIL - 2025</option>
              <option value="GOOGLE AD 2025">GOOGLE AD 2025</option>
              <option value="META AD - 2025">META AD - 2025</option>
            </select>
          </div>

          {/* Row 2 - Col 3: Inactive From */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Inactive From</label>
            <DatePicker
              value={inactiveFromDate}
              onChange={(val) => setInactiveFromDate(val)}
              placeholder="Select Date"
            />
          </div>

          {/* Row 2 - Col 4: Lead Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Lead Date</label>
            <DatePicker
              value={leadDateFilter}
              onChange={(val) => setLeadDateFilter(val)}
              placeholder="All Month & Year"
            />
          </div>

          {/* Row 3 - Col 1: Lead Created Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Lead Created Date</label>
            <DatePicker
              value={leadCreatedDateFilter}
              onChange={(val) => setLeadCreatedDateFilter(val)}
              placeholder="All Month & Year"
            />
          </div>

          {/* Row 3 - Col 2: Lead Assigned Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Lead Assigned Date</label>
            <DatePicker
              value={leadAssignedDateFilter}
              onChange={(val) => setLeadAssignedDateFilter(val)}
              placeholder="All Month & Year"
            />
          </div>

          {/* Row 3 - Col 3: Source */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="All">Select Source</option>
              <option value="Website Inbound">Website Inbound</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Directory">Directory</option>
              <option value="Phone Inbound">Phone Inbound</option>
              <option value="Inbound Email">Inbound Email</option>
            </select>
          </div>

          {/* Row 3 - Col 4: Tags */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Tags</label>
            <input
              type="text"
              placeholder="Select tags"
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Lead List Card ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
        {/* Card Header Bar */}
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          {/* Left Title with Red Pin Badge */}
          <div className="flex items-center gap-2">
            {filteredLeads.length > 0 && (
              <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-200">
                <MapPin className="w-3 h-3 fill-red-500 text-red-500" />
                <span>{filteredLeads.length}</span>
              </div>
            )}
            <span className="font-semibold text-slate-800 text-sm">Lead List</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Selected Leads Counter / Clear */}
            {selectedLeadIds.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold animate-in fade-in">
                <span>{selectedLeadIds.length} Selected</span>
                <button
                  type="button"
                  onClick={() => setSelectedLeadIds([])}
                  className="text-blue-500 hover:text-blue-700 p-0.5 cursor-pointer"
                  title="Deselect All"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 1 Duplicate Lead(s) */}
            <button
              type="button"
              onClick={() => setIsDuplicateModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#0F2844] hover:bg-[#1E3A5F] text-white text-xs font-medium cursor-pointer transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Duplicate Lead(s)</span>
            </button>

            {/* Assign Lead */}
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0F2844] hover:bg-[#1E3A5F] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Assign Lead{selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ''}</span>
            </button>

            {/* Upload Lead */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#0F2844] hover:bg-[#1E3A5F] text-white text-xs font-medium cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Lead</span>
            </button>

            {/* + LEAD */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>LEAD</span>
            </button>
          </div>
        </div>

        {/* Controls Bar: Show Rows & Search */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Shows</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>Rows</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Lead"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-slate-300 rounded px-3 py-1 text-xs pr-7 bg-white text-slate-700 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Mobile View: Lead Cards (Screens < md) ── */}
        <div className="block md:hidden space-y-3 p-3">
          {displayLeads.length === 0 ? (
            <div className="py-8 text-center text-slate-400 italic text-xs bg-white rounded border border-slate-200">
              No leads found matching current filter criteria.
            </div>
          ) : (
            displayLeads.map((lead, idx) => {
              const slNo = lead.slNo || (currentPage - 1) * pageSize + idx + 1;
              const isPending = lead.status === 'Pending';
              const isContacted = lead.status === 'Contacted';
              const isSelected = selectedLeadIds.includes(lead.id);

              return (
                <div
                  key={lead.id}
                  className={cn(
                    "bg-white border rounded-lg p-3.5 shadow-xs space-y-2.5 transition-all text-xs",
                    isSelected ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/20" : "border-slate-200"
                  )}
                >
                  {/* Top row: Checkbox, SL.No, Name, Rating, Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedLeadIds((prev) =>
                            prev.includes(lead.id) ? prev.filter((x) => x !== lead.id) : [...prev, lead.id]
                          );
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4 mt-0.5 shrink-0"
                      />
                      <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        #{slNo}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setViewingLead(lead)}
                            className="font-bold text-[#1877F2] hover:underline cursor-pointer text-left text-xs uppercase"
                          >
                            {lead.contactDetails.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingLead(lead)}
                            className="text-[#1877F2] hover:text-blue-800 p-0.5"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 mt-0.5">
                          <Shield className="w-3.5 h-3.5 text-[#B91C1C] flex-shrink-0 fill-[#B91C1C]/10" />
                          <span className="truncate">{lead.contactDetails.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setStatusModifyingLead(lead)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform active:scale-95 text-white',
                          getRatingBadgeClass(lead.rating)
                        )}
                        title="Click to change status & rating"
                      >
                        {lead.rating}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusModifyingLead(lead)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform active:scale-95 text-white',
                          getStatusBadgeClass(lead.status)
                        )}
                        title="Click to change status & rating"
                      >
                        {lead.status}
                      </button>
                    </div>
                  </div>

                  {/* Contact pills */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                        B
                      </span>
                      <a
                        href={`tel:${lead.contactDetails.phone}`}
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        {lead.contactDetails.phone}
                      </a>
                    </div>
                    {lead.contactDetails.email && (
                      <a
                        href={`mailto:${lead.contactDetails.email}`}
                        className="text-blue-600 hover:underline truncate max-w-[170px] text-[11px]"
                      >
                        {lead.contactDetails.email}
                      </a>
                    )}
                  </div>

                  {/* Lead Assignment & Creator Info Chip */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2 rounded border border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">Created:</span>
                      {renderUserAvatar(lead.createdBy || 'Super Admin', lead.createdByAvatar, 'w-4 h-4')}
                      <span className="font-semibold text-slate-700 truncate">{lead.createdBy || 'Super Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-600 font-semibold">Assigned:</span>
                      {renderUserAvatar(lead.assignedEmployee || lead.leadAssigned?.name || lead.owner, lead.leadAssigned?.avatar || lead.ownerAvatar, 'w-4 h-4')}
                      <span className="font-bold text-slate-800 truncate">{lead.assignedEmployee || lead.leadAssigned?.name || lead.owner}</span>
                    </div>
                  </div>

                  {/* Footer: Date, Assigned, Owner, Action menu */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>📅 {lead.leadDate}</span>
                      {lead.assignedDate && <span className="text-slate-400">• {lead.assignedDate}</span>}
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignToOwner(lead.assignedEmployee || lead.owner || currentUser?.name || 'shaheer');
                          setAssigningLead(lead);
                        }}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                      >
                        Assign
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActionMenuId(actionMenuId === lead.id ? null : lead.id)
                        }
                        className="flex items-center gap-1 px-2 py-1 rounded bg-[#006f8e] text-white text-[10px] font-medium cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {/* Dropdown Menu matching Cezcon CRM */}
                      {actionMenuId === lead.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActionMenuId(null)}
                          />
                          <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200 rounded-[4px] shadow-lg z-50 py-1 text-left text-[13px] text-[#212529]">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingLead(lead);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                            >
                              <Book className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingLead(lead);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                            >
                              <Edit className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                              <span>Edit Lead</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setStatusModifyingLead(lead);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                            >
                              <Edit2 className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                              <span>Change Status & Rating</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAssignToOwner(lead.assignedEmployee || lead.owner || currentUser?.name || 'shaheer');
                                setAssigningLead(lead);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                            >
                              <ArrowUpRight className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[2] p-0.5 border border-slate-700 rounded-[2px]" />
                              <span>Assign Lead</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                deleteLead(lead.id);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-rose-50 transition-colors text-rose-600 cursor-pointer text-left font-normal"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600 flex-shrink-0 stroke-[1.75]" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── 3. Desktop Data Table matching Cezcon CRM Screenshot ─────── */}
        <div className="hidden md:block overflow-x-auto min-h-[420px] w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2.5 px-3 text-center w-14 border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={displayLeads.length > 0 && displayLeads.every((l) => selectedLeadIds.includes(l.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeadIds(Array.from(new Set([...selectedLeadIds, ...displayLeads.map((l) => l.id)])));
                        } else {
                          setSelectedLeadIds(selectedLeadIds.filter((id) => !displayLeads.some((l) => l.id === id)));
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                      title="Select all on this page"
                    />
                    <span>SL.No</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-28 border-r border-slate-200">
                  <div className="flex items-center gap-1">
                    <span>Lead Date</span>
                    <ChevronDown className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th className="py-2.5 px-3 w-36 border-r border-slate-200">Lead Assigned</th>
                <th className="py-2.5 px-3 w-64 border-r border-slate-200">Contact Details</th>
                <th className="py-2.5 px-3 w-52 border-r border-slate-200">Lead Spec</th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Created By</th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Owner</th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Rating</th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Status</th>
                <th className="py-2.5 px-3 w-36 border-r border-slate-200">Last Activity</th>
                <th className="py-2.5 px-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                    No leads found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                displayLeads.map((lead, idx) => {
                  const slNo = lead.slNo || (currentPage - 1) * pageSize + idx + 1;
                  const isPending = lead.status === 'Pending';
                  const isContacted = lead.status === 'Contacted';
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr key={lead.id} className={cn("hover:bg-slate-50/80 transition-colors", isSelected && "bg-blue-50/40")}>
                      {/* Checkbox + SL.No */}
                      <td className="py-3 px-3 text-center font-medium text-slate-600 border-r border-slate-200">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedLeadIds((prev) =>
                                prev.includes(lead.id) ? prev.filter((x) => x !== lead.id) : [...prev, lead.id]
                              );
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                          />
                          <span>{slNo}</span>
                        </div>
                      </td>

                      {/* Lead Date */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap border-r border-slate-200 font-mono text-[11px]">
                        {lead.leadDate}
                      </td>

                      {/* Lead Assigned (Date + Assigned Member Avatar & Name) */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono text-slate-700">
                            {lead.assignedDate || lead.leadDate}
                          </div>
                          <div
                            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800"
                            title={`Assigned to: ${lead.assignedEmployee || lead.leadAssigned?.name || lead.owner}`}
                          >
                            {renderUserAvatar(
                              lead.assignedEmployee || lead.leadAssigned?.name || lead.owner,
                              lead.leadAssigned?.avatar || lead.ownerAvatar,
                              'w-4 h-4 shrink-0'
                            )}
                            <span className="truncate max-w-[100px] text-blue-700 font-semibold">
                              {lead.assignedEmployee || lead.leadAssigned?.name || lead.owner}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details (Name + Info Icon + Shield Company + WhatsApp/Phone) */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="space-y-1">
                          {/* Line 1: Name + Info Icon */}
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`/leads/${lead.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#1877F2] hover:underline cursor-pointer text-left text-xs uppercase"
                            >
                              {lead.contactDetails.name}
                            </a>
                            <a
                              href={`/leads/${lead.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1877F2] hover:text-blue-800 cursor-pointer inline-flex items-center justify-center"
                              title="View details in new tab"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {/* Line 2: Company with Shield */}
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                            <Shield className="w-3.5 h-3.5 text-[#B91C1C] flex-shrink-0 fill-[#B91C1C]/10" />
                            <span className="truncate max-w-[210px]">{lead.contactDetails.company}</span>
                          </div>

                          {/* Line 3: Phone with WhatsApp Icon */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                              B
                            </span>
                            <a
                              href={`https://wa.me/${(lead.contactDetails.whatsapp || lead.contactDetails.phone).replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-emerald-600 hover:underline"
                            >
                              {lead.contactDetails.phone}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Lead Spec */}
                      <td className="py-3 px-3 text-slate-600 border-r border-slate-200">
                        <span className="line-clamp-2 text-[11px]">
                          {lead.leadSpecification || '—'}
                        </span>
                      </td>

                      {/* Created By (Avatar + Name) */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        <div className="flex flex-col items-center justify-center" title={`Created by: ${lead.createdBy || 'Super Admin'}`}>
                          {renderUserAvatar(lead.createdBy || 'Super Admin', lead.createdByAvatar, 'w-6 h-6')}
                          <span className="text-[10px] text-slate-600 font-medium truncate max-w-[80px] mt-0.5">
                            {lead.createdBy || 'Super Admin'}
                          </span>
                        </div>
                      </td>

                      {/* Owner (Avatar + Name) */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        <div className="flex flex-col items-center justify-center" title={`Lead Owner: ${lead.owner}`}>
                          {renderUserAvatar(lead.owner, lead.ownerAvatar, 'w-6 h-6')}
                          <span className="text-[10px] text-slate-600 font-medium truncate max-w-[80px] mt-0.5">
                            {lead.owner}
                          </span>
                        </div>
                      </td>

                      {/* Rating (✏ COLD / ✏ WARM / ✏ HOT) */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setStatusModifyingLead(lead)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 shadow-2xs transition-all text-white',
                            getRatingBadgeClass(lead.rating)
                          )}
                          title="Click to change status & rating"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>{lead.rating}</span>
                        </button>
                      </td>

                      {/* Status (✏ Pending / ✏ Inprocess / ✏ Completed / etc.) */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setStatusModifyingLead(lead)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:opacity-90 shadow-2xs transition-all text-white',
                            getStatusBadgeClass(lead.status)
                          )}
                          title="Click to change status & rating"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>{lead.status}</span>
                        </button>
                      </td>

                      {/* Last Activity (Timestamp + Cyan Relative Time Pill) */}
                      <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono text-slate-700">
                            {lead.lastActivityDate || lead.lastActivity}
                          </div>
                          <div>
                            <span className="inline-block px-3 py-0.5 rounded-full bg-[#38BDF8] text-white font-medium text-[10px]">
                              {lead.lastActivityTimeAgo || '2 days'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions: Gear Dropdown Menu */}
                      <td className="py-3 px-3 text-center whitespace-nowrap relative">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setActionMenuId(actionMenuId === lead.id ? null : lead.id)
                            }
                            className="flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-[#006f8e] hover:bg-[#005f7a] text-white transition-colors cursor-pointer shadow-xs text-[11px] font-medium"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Dropdown Menu matching exact Cezcon CRM */}
                          {actionMenuId === lead.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActionMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-[4px] shadow-lg z-50 py-1 text-left text-[13px] text-[#212529]">
                                {/* 1. Open in new tab */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.open(`/leads/${lead.id}`, '_blank');
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Book className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                                  <span>Open in new tab</span>
                                </button>

                                {/* 2. View */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.open(`/leads/${lead.id}`, '_blank');
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Book className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                                  <span>View</span>
                                </button>

                                {/* 3. Edit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.location.href = `/leads/${lead.id}/edit`;
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Edit className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                                  <span>Edit</span>
                                </button>

                                {/* 3b. Change Status & Rating */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStatusModifyingLead(lead);
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Edit2 className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
                                  <span>Change Status & Rating</span>
                                </button>

                                {/* 4. Assign Lead */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssignToOwner(lead.assignedEmployee || lead.owner || currentUser?.name || 'shaheer');
                                    setAssigningLead(lead);
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <ArrowUpRight className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[2] p-0.5 border border-slate-700 rounded-[2px]" />
                                  <span>Assign Lead</span>
                                </button>

                                {/* 5. Convert Lead */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.location.href = `/leads/${lead.id}/convert`;
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <CornerUpRight className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[2]" />
                                  <span>Convert Lead</span>
                                </button>

                                {/* 6. Delete */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Are you sure you want to delete lead "${lead.contactDetails.name}"?`
                                      )
                                    ) {
                                      deleteLead(lead.id);
                                    }
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-rose-50 transition-colors text-rose-600 cursor-pointer text-left font-normal"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-600 flex-shrink-0 stroke-[1.75]" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
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

        {/* ── 4. Table Footer (Showing entries & Pagination) ───────────── */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600 bg-white">
          <div>
            Showing 1 to {Math.min(pageSize, displayLeads.length)} of {totalEntries} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer font-medium"
            >
              «
            </button>

            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer border ${currentPage === p
                  ? 'bg-[#006f8e] text-white border-[#006f8e]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer font-medium"
            >
              »
            </button>
          </div>
        </div>
      </div>



      {/* ── MODAL 2: View Lead Details ───────────────────────────────── */}
      {viewingLead && (
        <Modal
          isOpen={!!viewingLead}
          onClose={() => setViewingLead(null)}
          title={`Lead Details: ${viewingLead.contactDetails.name}`}
          description={`Registered on ${viewingLead.leadDate} | Associated with ${viewingLead.contactDetails.company}`}
        >
          <div className="space-y-4 text-xs">
            {/* Metadata Summary Banner with Created By & Assigned To */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Contact Name</span>
                <span className="text-slate-800 font-bold">{viewingLead.contactDetails.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Company</span>
                <span className="text-slate-800 font-semibold">{viewingLead.contactDetails.company}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Phone Number</span>
                <span className="text-blue-600 font-mono font-medium">{viewingLead.contactDetails.phone}</span>
              </div>
              
              {/* Created By */}
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Created By</span>
                <div className="flex items-center gap-1.5">
                  {renderUserAvatar(viewingLead.createdBy || 'Super Admin', viewingLead.createdByAvatar, 'w-5 h-5')}
                  <div>
                    <span className="text-slate-800 font-bold block">{viewingLead.createdBy || 'Super Admin'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{viewingLead.leadDate}</span>
                  </div>
                </div>
              </div>

              {/* Lead Assigned / Assigned To */}
              <div className="bg-blue-50/60 p-2 rounded border border-blue-200">
                <span className="text-[10px] text-blue-600 block uppercase font-bold mb-1">Assigned To</span>
                <div className="flex items-center gap-1.5">
                  {renderUserAvatar(
                    viewingLead.assignedEmployee || viewingLead.leadAssigned?.name || viewingLead.owner,
                    viewingLead.leadAssigned?.avatar || viewingLead.ownerAvatar,
                    'w-5 h-5'
                  )}
                  <div>
                    <span className="text-blue-900 font-bold block">
                      {viewingLead.assignedEmployee || viewingLead.leadAssigned?.name || viewingLead.owner}
                    </span>
                    <span className="text-[10px] text-blue-500 font-mono">
                      {viewingLead.assignedDate || viewingLead.leadDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner */}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Lead Owner</span>
                <div className="flex items-center gap-1.5">
                  {renderUserAvatar(viewingLead.owner, viewingLead.ownerAvatar, 'w-5 h-5')}
                  <span className="text-slate-800 font-medium">{viewingLead.owner}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating & Status</span>
                <span className="text-slate-800">
                  {viewingLead.rating} / <strong>{viewingLead.status}</strong>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Campaign Source</span>
                <span className="text-slate-800">{viewingLead.campaign || viewingLead.source}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Last Activity</span>
                <span className="text-slate-800">{viewingLead.lastActivityDate || viewingLead.lastActivity}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Lead Technical Specification
              </span>
              <p className="p-3 bg-white border border-slate-200 rounded text-slate-700 leading-relaxed">
                {viewingLead.leadSpecification || 'No technical specification recorded.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAssignToOwner(viewingLead.assignedEmployee || viewingLead.owner || currentUser?.name || 'shaheer');
                  setAssigningLead(viewingLead);
                }}
              >
                Assign Lead
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingLead(viewingLead);
                  setViewingLead(null);
                }}
              >
                Edit Lead
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setViewingLead(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 3: Edit Lead ───────────────────────────────────────── */}
      {editingLead && (
        <Modal
          isOpen={!!editingLead}
          onClose={() => setEditingLead(null)}
          title={`Edit Lead: ${editingLead.contactDetails.name}`}
          description="Update lead classification, stage, contact info, and assigned representative."
        >
          <form onSubmit={handleUpdateLead} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Name *"
                value={editingLead.contactDetails.name}
                onChange={(e) =>
                  setEditingLead({
                    ...editingLead,
                    contactDetails: { ...editingLead.contactDetails, name: e.target.value },
                  })
                }
                required
              />
              <Input
                label="Company Name *"
                value={editingLead.contactDetails.company}
                onChange={(e) =>
                  setEditingLead({
                    ...editingLead,
                    contactDetails: { ...editingLead.contactDetails, company: e.target.value },
                  })
                }
                required
              />
            </div>

            {/* Assigned To & Lead Owner Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                  Assigned Representative
                </label>
                <div className="flex items-center border border-blue-300 rounded bg-white px-2.5 py-1.5 focus-within:border-blue-600 shadow-2xs">
                  {renderUserAvatar(editingLead.assignedEmployee || editingLead.owner, undefined, 'w-4 h-4 mr-2 shrink-0')}
                  <select
                    value={editingLead.assignedEmployee || editingLead.owner}
                    onChange={(e) => {
                      const newAssignee = e.target.value;
                      setEditingLead({
                        ...editingLead,
                        assignedEmployee: newAssignee,
                        leadAssigned: {
                          name: newAssignee,
                          avatar: getEmployeePhoto(newAssignee) || '',
                        },
                        assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
                      });
                    }}
                    className="w-full bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Lead Owner
                </label>
                <div className="flex items-center border border-slate-300 rounded bg-white px-2.5 py-1.5 focus-within:border-blue-500 shadow-2xs">
                  {renderUserAvatar(editingLead.owner, undefined, 'w-4 h-4 mr-2 shrink-0')}
                  <select
                    value={editingLead.owner}
                    onChange={(e) => setEditingLead({ ...editingLead, owner: e.target.value })}
                    className="w-full bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                value={editingLead.contactDetails.phone}
                onChange={(e) =>
                  setEditingLead({
                    ...editingLead,
                    contactDetails: { ...editingLead.contactDetails, phone: e.target.value },
                  })
                }
              />
              <Select
                label="Rating"
                value={editingLead.rating}
                onChange={(e) =>
                  setEditingLead({ ...editingLead, rating: e.target.value as LeadRating })
                }
                options={[
                  { label: 'Cold', value: 'Cold' },
                  { label: 'Warm', value: 'Warm' },
                  { label: 'Hot', value: 'Hot' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Status"
                value={editingLead.status}
                onChange={(e) =>
                  setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })
                }
                options={[
                  { label: 'Contacted', value: 'Contacted' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Qualified', value: 'Qualified' },
                  { label: 'Proposal Sent', value: 'Proposal Sent' },
                  { label: 'Converted', value: 'Converted' },
                  { label: 'Lost', value: 'Lost' },
                ]}
              />
              <Input
                label="Business Opportunity"
                value={editingLead.businessOpportunity || ''}
                onChange={(e) =>
                  setEditingLead({ ...editingLead, businessOpportunity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Specification / Notes
              </label>
              <textarea
                rows={3}
                value={editingLead.leadSpecification}
                onChange={(e) =>
                  setEditingLead({ ...editingLead, leadSpecification: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingLead(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 4: Upload Leads ────────────────────────────────────── */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Bulk Upload Leads"
          description="Upload CSV or XLSX file to batch import prospect contacts."
        >
          <div className="space-y-3 text-xs">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Drag and drop CSV or Excel file here</p>
              <p className="text-slate-400 text-[11px] mt-1">Supports UTF-8 CSV, .xls, .xlsx up to 25MB</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px]">
              Tip: Download the standard <strong>Lead Import Template</strong> with headers for Name, Company, Phone, WhatsApp, and Specification.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  alert('Leads file parsed successfully! 14 leads queued for import.');
                  setIsUploadModalOpen(false);
                }}
              >
                Import Leads
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 5: Batch Assign Leads ──────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-[#FAFBFD]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Assign Lead(s)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Selected Target Summary */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-950">
                <div className="flex items-center justify-between font-semibold">
                  <span>Scope:</span>
                  <span className="font-bold text-blue-700">
                    {selectedLeadIds.length > 0
                      ? `${selectedLeadIds.length} Selected Lead(s)`
                      : `All ${filteredLeads.length} Filtered Leads`}
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  Choose the sales representative or employee to assign responsibility to.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 text-xs sm:text-[13px]">
                <label className="sm:col-span-3 text-slate-700 font-semibold">
                  Assign To
                </label>
                <div className="sm:col-span-9 relative flex items-center border border-slate-300 rounded bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                  {renderUserAvatar(assignToOwner, undefined, 'w-5 h-5 mr-2 shrink-0')}
                  <select
                    value={assignToOwner}
                    onChange={(e) => setAssignToOwner(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                    {assignToOwner && !assignableUsers.some((u) => u.name === assignToOwner) && (
                      <option value={assignToOwner}>{assignToOwner}</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#edf0f5] px-4 py-2.5 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3.5 py-1.5 rounded-[3px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetIds = selectedLeadIds.length > 0 ? selectedLeadIds : filteredLeads.map((l) => l.id);
                  const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                  const assigneePhoto = getEmployeePhoto(assignToOwner) || '';

                  targetIds.forEach((id) => {
                    updateLead(id, {
                      assignedEmployee: assignToOwner,
                      leadAssigned: { name: assignToOwner, avatar: assigneePhoto },
                      assignedDate: todayDate,
                      owner: assignToOwner,
                    });
                  });

                  alert(`Successfully assigned ${targetIds.length} lead(s) to ${assignToOwner}!`);
                  setSelectedLeadIds([]);
                  setIsAssignModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-[3px] bg-[#004b6e] hover:bg-[#003b57] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: Duplicate Leads ─────────────────────────────────── */}
      {isDuplicateModalOpen && (
        <Modal
          isOpen={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          title="Duplicate Leads Management"
          description="Detected 1 duplicate lead based on matching phone and company records."
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 border border-amber-200 bg-amber-50 rounded text-amber-900 text-[11px]">
              <strong>Conflict Found:</strong> Lead #1 (Mr. WAQUAR - URUGUAY GENERAL TRADING) matches phone number +971 58 194 1460 in Inbound Web Form.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDuplicateModalOpen(false)}>
                Dismiss
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  alert('Duplicate record merged with existing master lead.');
                  setIsDuplicateModalOpen(false);
                }}
              >
                Merge Duplicate
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 7: Assign Single Lead ──────────────────────────────── */}
      {assigningLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-[#FAFBFD]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Assign Lead: {assigningLead.contactDetails.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningLead(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                <div className="text-slate-800 font-bold">{assigningLead.contactDetails.name}</div>
                <div className="text-slate-500 text-[11px]">{assigningLead.contactDetails.company} • {assigningLead.contactDetails.phone}</div>
                <div className="text-slate-400 text-[10px] mt-1 font-mono">Created on: {assigningLead.leadDate} by {assigningLead.createdBy || 'Super Admin'}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 text-xs sm:text-[13px]">
                <label className="sm:col-span-3 text-slate-700 font-semibold">
                  Assign To
                </label>
                <div className="sm:col-span-9 relative flex items-center border border-slate-300 rounded bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                  {renderUserAvatar(assignToOwner, undefined, 'w-5 h-5 mr-2 shrink-0')}
                  <select
                    value={assignToOwner}
                    onChange={(e) => setAssignToOwner(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                    {assignToOwner && !assignableUsers.some((u) => u.name === assignToOwner) && (
                      <option value={assignToOwner}>{assignToOwner}</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#edf0f5] px-4 py-2.5 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssigningLead(null)}
                className="px-3.5 py-1.5 rounded-[3px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                  const assigneePhoto = getEmployeePhoto(assignToOwner) || '';
                  updateLead(assigningLead.id, {
                    assignedEmployee: assignToOwner,
                    leadAssigned: { name: assignToOwner, avatar: assigneePhoto },
                    assignedDate: todayDate,
                    owner: assignToOwner,
                  });
                  alert(`Lead "${assigningLead.contactDetails.name}" assigned successfully to ${assignToOwner}!`);
                  setAssigningLead(null);
                }}
                className="px-4 py-1.5 rounded-[3px] bg-[#004b6e] hover:bg-[#003b57] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 8: Convert Lead ────────────────────────────────────── */}
      {convertingLead && (
        <Modal
          isOpen={!!convertingLead}
          onClose={() => setConvertingLead(null)}
          title={`Convert Lead: ${convertingLead.contactDetails.name}`}
          description={`Convert ${convertingLead.contactDetails.company} into an Active Account and Opportunity.`}
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] sm:text-xs space-y-1.5 leading-relaxed">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Conversion Summary:</span>
              </p>
              <div className="space-y-1 pl-1">
                <p className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="text-emerald-700 font-medium">• Account Name:</span>
                  <strong className="text-emerald-950 break-words">{convertingLead.contactDetails.company}</strong>
                </p>
                <p className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="text-emerald-700 font-medium">• Contact Person:</span>
                  <strong className="text-emerald-950 break-words">{convertingLead.contactDetails.name}</strong>
                </p>
                <p className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="text-emerald-700 font-medium">• Deal Pipeline Stage:</span>
                  <strong className="text-emerald-950">Opportunity / Quotation</strong>
                </p>
                <p className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span className="text-emerald-700 font-medium">• Estimated Value:</span>
                  <strong className="text-emerald-950 font-bold">AED {convertingLead.value.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            {/* Link to Full Form */}
            <div className="text-right">
              <a
                href={`/leads/${convertingLead.id}/convert`}
                className="text-[11px] text-[#006f8e] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>Open Advanced Convert Form</span>
                <span>↗</span>
              </a>
            </div>

            {/* Responsive Actions Bar */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs py-2 sm:py-1.5"
                onClick={() => setConvertingLead(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold py-2 sm:py-1.5 shadow-xs"
                onClick={() => {
                  updateLead(convertingLead.id, { status: 'Converted' });
                  addCustomer({
                    customerName: convertingLead.contactDetails.company,
                    contactPerson: convertingLead.contactDetails.name,
                    phone: convertingLead.contactDetails.phone,
                    email: convertingLead.contactDetails.email || '',
                    owner: convertingLead.owner,
                    status: 'Active',
                    lastActivity: 'Just converted from Lead',
                    companyGroup: 'Key Corporate Accounts',
                    totalDeals: 1,
                    totalSpend: convertingLead.value,
                    createdFromLeadId: convertingLead.id,
                  });
                  addOpportunity({
                    title: `CTEQ#${Math.floor(1000 + Math.random() * 9000)} ${convertingLead.leadSpecification.toUpperCase()} / ${convertingLead.contactDetails.company.toUpperCase()}`,
                    customer: convertingLead.contactDetails.company,
                    amount: convertingLead.value,
                    stage: 'Opportunity',
                    owner: convertingLead.owner,
                    probability: 75,
                    expectedClose: '2026-10-15',
                    createdFromLeadId: convertingLead.id,
                    campaign: convertingLead.campaign,
                    source: convertingLead.source,
                  });
                  alert(`Lead "${convertingLead.contactDetails.name}" converted successfully into Customer & Sales Opportunity!`);
                  setConvertingLead(null);
                }}
              >
                Confirm Conversion
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Lead Status and Rating Modal */}
      <ChangeLeadStatusModal
        isOpen={!!statusModifyingLead}
        lead={statusModifyingLead}
        onClose={() => setStatusModifyingLead(null)}
        onUpdate={handleUpdateStatusAndRating}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Leads...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
