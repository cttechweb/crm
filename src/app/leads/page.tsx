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
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authMockService } from '@/services/authMockService';
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

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);
  const [viewingLead, setViewingLead] = useState<CrmLead | null>(null);
  const [assigningLead, setAssigningLead] = useState<CrmLead | null>(null);
  const [assignToOwner, setAssignToOwner] = useState('JISMON JOSE');
  const [convertingLead, setConvertingLead] = useState<CrmLead | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    whatsapp: '',
    specification: '',
    owner: 'Alex Rivera',
    createdBy: 'Alex Rivera',
    rating: 'Cold' as LeadRating,
    status: 'Contacted' as LeadStatus,
    source: 'Website Inbound',
    campaign: 'SIMPLE LIFE - 2025',
    businessOpportunity: 'HVAC Installation',
    value: 50000,
  });

  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;
  const isEmployee = currentUser?.role === 'employee' || currentUser?.role === 'worker';

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 🛡️ Strict Employee Data Isolation: Employees only see their own assigned/created leads
      if (isEmployee && currentUser?.name) {
        const userName = currentUser.name.trim().toLowerCase();
        const leadOwner = (lead.owner || lead.leadAssigned?.name || '').trim().toLowerCase();
        const leadCreatedBy = (lead.createdBy || '').trim().toLowerCase();
        const leadAssignedEmp = (lead.assignedEmployee || '').trim().toLowerCase();

        const isMatch =
          leadOwner === userName ||
          leadCreatedBy === userName ||
          leadAssignedEmp === userName ||
          leadOwner.includes(userName) ||
          userName.includes(leadOwner);

        if (!isMatch) {
          return false;
        }
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

  const totalEntries = 286; // Simulated full enterprise count as in Cezcon screenshot
  const displayLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(totalEntries / pageSize);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    const canAssignOthers = currentUser?.actionPermissions?.canReassign || !isEmployee;
    const effectiveOwner = canAssignOthers ? newLead.owner : (currentUser?.name || newLead.owner);
    const effectiveCreatedBy = currentUser?.name || newLead.createdBy;
    const effectiveAssignedEmployee = isEmployee ? (currentUser?.name || newLead.owner) : newLead.owner;

    addLead({
      leadDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      leadAssigned: {
        name: effectiveOwner,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      contactDetails: {
        name: newLead.name,
        company: newLead.company,
        phone: newLead.phone,
        email: newLead.email,
        whatsapp: newLead.whatsapp || newLead.phone,
      },
      leadSpecification: newLead.specification || 'New customer enterprise HVAC inquiry',
      createdBy: effectiveCreatedBy,
      createdByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      owner: effectiveOwner,
      ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      assignedEmployee: effectiveAssignedEmployee,
      rating: newLead.rating,
      status: newLead.status,
      lastActivity: 'Just created',
      lastActivityDate: `${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      lastActivityTimeAgo: 'Just now',
      value: newLead.value,
      source: newLead.source,
      campaign: newLead.campaign,
      businessOpportunity: newLead.businessOpportunity,
      tags: ['New Lead'],
    });

    setIsAddModalOpen(false);
    setNewLead({
      name: '',
      company: '',
      phone: '',
      email: '',
      whatsapp: '',
      specification: '',
      owner: currentUser?.name || 'Alex Rivera',
      createdBy: currentUser?.name || 'Alex Rivera',
      rating: 'Cold',
      status: 'Contacted',
      source: 'Website Inbound',
      campaign: 'SIMPLE LIFE - 2025',
      businessOpportunity: 'HVAC Installation',
      value: 50000,
    });
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    updateLead(editingLead.id, editingLead);
    setEditingLead(null);
  };

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
              <option value="Alex Rivera">Alex Rivera</option>
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="Jordan Hayes">Jordan Hayes</option>
              <option value="Mohammed Rashid">Mohammed Rashid</option>
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
              <option value="Alex Rivera">Alex Rivera</option>
              <option value="Elena Rostova">Elena Rostova</option>
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
              <option value="Pending/Contacted">Pending/Contacted</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
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
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Select Date"
                value={inactiveFromDate}
                onChange={(e) => setInactiveFromDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded pl-7 pr-7 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              {inactiveFromDate && (
                <button
                  type="button"
                  onClick={() => setInactiveFromDate('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2 - Col 4: Lead Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Lead Date</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="All Month & Year"
                value={leadDateFilter}
                onChange={(e) => setLeadDateFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded pl-7 pr-7 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              {leadDateFilter && (
                <button
                  type="button"
                  onClick={() => setLeadDateFilter('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Row 3 - Col 1: Lead Created Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Lead Created Date</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="All Month & Year"
                value={leadCreatedDateFilter}
                onChange={(e) => setLeadCreatedDateFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded pl-7 pr-7 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              {leadCreatedDateFilter && (
                <button
                  type="button"
                  onClick={() => setLeadCreatedDateFilter('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Row 3 - Col 2: Lead Assigned Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Lead Assigned Date</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="All Month & Year"
                value={leadAssignedDateFilter}
                onChange={(e) => setLeadAssignedDateFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded pl-7 pr-7 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              {leadAssignedDateFilter && (
                <button
                  type="button"
                  onClick={() => setLeadAssignedDateFilter('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
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
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-200">
              <MapPin className="w-3 h-3 fill-red-500 text-red-500" />
              <span>115</span>
            </div>
            <span className="font-semibold text-slate-800 text-sm">Lead List</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
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
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#0F2844] hover:bg-[#1E3A5F] text-white text-xs font-medium cursor-pointer transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Lead</span>
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
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
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

              return (
                <div
                  key={lead.id}
                  className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-2.5 transition-all text-xs"
                >
                  {/* Top row: SL.No, Name, Rating, Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-start gap-2 min-w-0">
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
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          lead.rating === 'Hot'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : lead.rating === 'Warm'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                        )}
                      >
                        {lead.rating}
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          isPending
                            ? 'bg-amber-500 text-white'
                            : isContacted
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-600 text-white'
                        )}
                      >
                        {lead.status}
                      </span>
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

                  {/* Lead Specification */}
                  {lead.leadSpecification && (
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {lead.leadSpecification}
                    </p>
                  )}

                  {/* Footer: Date, Assigned, Owner, Action menu */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>📅 {lead.leadDate}</span>
                      {lead.assignedDate && <span className="text-slate-400">• {lead.assignedDate}</span>}
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <div className="flex items-center gap-1">
                        <img
                          src={
                            lead.ownerAvatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={lead.owner}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-medium text-slate-700 text-xs">{lead.owner}</span>
                      </div>

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
          <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">SL.No</th>
                <th className="py-2.5 px-3 w-28 border-r border-slate-200">
                  <div className="flex items-center gap-1">
                    <span>Lead Date</span>
                    <ChevronDown className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th className="py-2.5 px-3 w-28 border-r border-slate-200">Lead Assigned</th>
                <th className="py-2.5 px-3 w-64 border-r border-slate-200">Contact Details</th>
                <th className="py-2.5 px-3 w-56 border-r border-slate-200">Lead Spec</th>
                <th className="py-2.5 px-3 text-center w-20 border-r border-slate-200">Created By</th>
                <th className="py-2.5 px-3 text-center w-20 border-r border-slate-200">Owner</th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Rating</th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Status</th>
                <th className="py-2.5 px-3 w-40 border-r border-slate-200">Last Activity</th>
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

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SL.No */}
                      <td className="py-3 px-3 text-center font-medium text-slate-600 border-r border-slate-200">
                        {slNo}
                      </td>

                      {/* Lead Date */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap border-r border-slate-200 font-mono text-[11px]">
                        {lead.leadDate}
                      </td>

                      {/* Lead Assigned */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap border-r border-slate-200 font-mono text-[11px]">
                        {lead.assignedDate || ''}
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

                      {/* Created By Avatar */}
                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        <img
                          src={
                            lead.createdByAvatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={lead.createdBy}
                          title={`Created by: ${lead.createdBy}`}
                          className="w-7 h-7 rounded-full object-cover mx-auto border border-slate-200"
                        />
                      </td>

                      {/* Owner Avatar */}
                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        <img
                          src={
                            lead.ownerAvatar ||
                            lead.leadAssigned?.avatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={lead.owner}
                          title={`Owner: ${lead.owner}`}
                          className="w-7 h-7 rounded-full object-cover mx-auto border border-slate-200"
                        />
                      </td>

                      {/* Rating (✏ COLD / ✏ WARM / ✏ HOT) */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#0284C7] text-white text-[10px] font-bold uppercase tracking-wider">
                          <Edit className="w-2.5 h-2.5" />
                          <span>{lead.rating}</span>
                        </span>
                      </td>

                      {/* Status (✏ Contacted / ✏ Pending / ✏ Converted) */}
                      <td className="py-3 px-3 text-center border-r border-slate-200 whitespace-nowrap">
                        {isContacted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#2563EB] text-white text-[10px] font-bold">
                            <Edit className="w-2.5 h-2.5" />
                            <span>Contacted</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#EAB308] text-white text-[10px] font-bold">
                            <Edit className="w-2.5 h-2.5" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#16A34A] text-white text-[10px] font-bold">
                            <Edit className="w-2.5 h-2.5" />
                            <span>{lead.status}</span>
                          </span>
                        )}
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

                                {/* 4. Assign Lead */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssignToOwner(lead.owner || 'JISMON JOSE');
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
                                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100/70 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Trash2 className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[1.75]" />
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

      {/* ── MODAL 1: + LEAD (Create Lead) ────────────────────────────── */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Lead"
          description="Register prospective customer inquiry and assign sales representative."
        >
          <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Person Name *"
                placeholder="e.g. Mr. WAQUAR"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                required
              />
              <Input
                label="Company Name *"
                placeholder="e.g. URUGUAY GENERAL TRADING"
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number *"
                placeholder="e.g. +971 58 194 1460"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                required
              />
              <Input
                label="WhatsApp Number"
                placeholder="e.g. +971581941460"
                value={newLead.whatsapp}
                onChange={(e) => setNewLead({ ...newLead, whatsapp: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="client@domain.ae"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              />
              <Select
                label="Lead Owner"
                value={newLead.owner}
                onChange={(e) => setNewLead({ ...newLead, owner: e.target.value })}
                options={[
                  { label: 'Alex Rivera', value: 'Alex Rivera' },
                  { label: 'Elena Rostova', value: 'Elena Rostova' },
                  { label: 'Jordan Hayes', value: 'Jordan Hayes' },
                  { label: 'Mohammed Rashid', value: 'Mohammed Rashid' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Rating"
                value={newLead.rating}
                onChange={(e) => setNewLead({ ...newLead, rating: e.target.value as LeadRating })}
                options={[
                  { label: 'Cold', value: 'Cold' },
                  { label: 'Warm', value: 'Warm' },
                  { label: 'Hot', value: 'Hot' },
                ]}
              />
              <Select
                label="Status"
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
                options={[
                  { label: 'Contacted', value: 'Contacted' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Qualified', value: 'Qualified' },
                  { label: 'Proposal Sent', value: 'Proposal Sent' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Campaign"
                value={newLead.campaign}
                onChange={(e) => setNewLead({ ...newLead, campaign: e.target.value })}
                options={[
                  { label: 'SIMPLE LIFE - 2025', value: 'SIMPLE LIFE - 2025' },
                  { label: 'REACHUAE - 2025', value: 'REACHUAE - 2025' },
                  { label: 'ATN - 2025', value: 'ATN - 2025' },
                  { label: 'GOOGLE AD 2025', value: 'GOOGLE AD 2025' },
                  { label: 'META AD - 2025', value: 'META AD - 2025' },
                ]}
              />
              <Select
                label="Business Opportunity"
                value={newLead.businessOpportunity}
                onChange={(e) => setNewLead({ ...newLead, businessOpportunity: e.target.value })}
                options={[
                  { label: 'HVAC Installation', value: 'HVAC Installation' },
                  { label: 'Commercial Construction', value: 'Commercial Construction' },
                  { label: 'Industrial HVAC', value: 'Industrial HVAC' },
                  { label: 'Facility Maintenance', value: 'Facility Maintenance' },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lead Specification / Requirements
              </label>
              <textarea
                rows={2}
                value={newLead.specification}
                onChange={(e) => setNewLead({ ...newLead, specification: e.target.value })}
                placeholder="Describe equipment capacity, project location, unit quantities..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#22C55E] hover:bg-[#16A34A] text-white">
                Save & Create Lead
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 2: View Lead Details ───────────────────────────────── */}
      {viewingLead && (
        <Modal
          isOpen={!!viewingLead}
          onClose={() => setViewingLead(null)}
          title={`Lead Details: ${viewingLead.contactDetails.name}`}
          description={`Registered on ${viewingLead.leadDate} | Associated with ${viewingLead.contactDetails.company}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Lead Owner</span>
                <span className="text-slate-800 font-medium">{viewingLead.owner}</span>
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
          description="Update lead classification, stage, contact info, and notes."
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
                label="Owner"
                value={editingLead.owner}
                onChange={(e) => setEditingLead({ ...editingLead, owner: e.target.value })}
                options={[
                  { label: 'Alex Rivera', value: 'Alex Rivera' },
                  { label: 'Elena Rostova', value: 'Elena Rostova' },
                  { label: 'Jordan Hayes', value: 'Jordan Hayes' },
                  { label: 'Mohammed Rashid', value: 'Mohammed Rashid' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Assign Lead</h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 text-xs sm:text-[13px]">
                <label className="sm:col-span-3 text-slate-700 font-normal">
                  Assign To
                </label>
                <div className="sm:col-span-9 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="avatar"
                    className="w-4 h-4 rounded-full object-cover mr-2 flex-shrink-0"
                  />
                  <select
                    value={assignToOwner}
                    onChange={(e) => setAssignToOwner(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    <option value="JISMON JOSE">JISMON JOSE</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Jordan Hayes">Jordan Hayes</option>
                    <option value="Mohammed Rashid">Mohammed Rashid</option>
                  </select>
                  <span className="absolute right-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
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
                  alert(`Selected leads successfully assigned to ${assignToOwner}!`);
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Assign Lead</h3>
              <button
                type="button"
                onClick={() => setAssigningLead(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 text-xs sm:text-[13px]">
                <label className="sm:col-span-3 text-slate-700 font-normal">
                  Assign To
                </label>
                <div className="sm:col-span-9 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="avatar"
                    className="w-4 h-4 rounded-full object-cover mr-2 flex-shrink-0"
                  />
                  <select
                    value={assignToOwner}
                    onChange={(e) => setAssignToOwner(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    <option value="JISMON JOSE">JISMON JOSE</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Jordan Hayes">Jordan Hayes</option>
                    <option value="Mohammed Rashid">Mohammed Rashid</option>
                  </select>
                  <span className="absolute right-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
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
                  updateLead(assigningLead.id, {
                    owner: assignToOwner,
                    leadAssigned: { name: assignToOwner },
                    assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
                  });
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
