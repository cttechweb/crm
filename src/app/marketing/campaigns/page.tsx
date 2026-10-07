'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Copy,
  PauseCircle,
  PlayCircle,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Radio,
  MessageSquare,
  Smartphone,
  X,
  TrendingUp,
  Download,
  Share2,
  Settings as SettingsIcon,
  ChevronDown,
  User,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink,
  Mail,
  Users,
  FileText,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmCampaign } from '@/types/enterprise-crm';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export interface ExtendedCampaign extends CrmCampaign {
  description?: string;
}

export function CampaignsContent() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign: ctxDeleteCampaign, toggleCampaignListing, users } = useEnterpriseCrm();

  const [localCampaigns, setLocalCampaigns] = useState<ExtendedCampaign[]>(() => {
    return campaigns.map((c) => ({
      ...c,
      description: `Optimized multi-channel campaign targeting ${c.channel || 'UAE Enterprise Sector'}.`,
    }));
  });

  useEffect(() => {
    if (campaigns) {
      setLocalCampaigns(
        campaigns.map((c) => ({
          ...c,
          description: `Optimized multi-channel campaign targeting ${c.channel || 'UAE Enterprise Sector'}.`,
        }))
      );
    }
  }, [campaigns]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFbImportModalOpen, setIsFbImportModalOpen] = useState(false);
  const [isFbIntegrateModalOpen, setIsFbIntegrateModalOpen] = useState(false);
  const [activeGearMenuId, setActiveGearMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [fbIntegration, setFbIntegration] = useState({
    pageId: '108492039281920',
    pageName: 'Cool Technologies LLC - Dubai HQ',
    connected: true,
    syncLeads: true,
    pixelId: 'PIX-99482018',
    status: 'Connected & Active',
  });

  const [formData, setFormData] = useState({
    name: '',
    type: 'Inbound Portal',
    channel: 'Website Inbound',
    budget: 10000,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'Active' as const,
    listing: true,
    ownerName: 'Mohammed Rashid',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCmp: ExtendedCampaign = {
      id: `cmp-${Date.now()}`,
      slNo: campaigns.length + 1,
      name: formData.name,
      owner: {
        name: formData.ownerName,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      type: formData.type,
      channel: formData.channel,
      budget: Number(formData.budget),
      leadsGenerated: 0,
      conversionRate: '0.0%',
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      listing: formData.listing,
      description: 'Standard UAE HVAC Enterprise Promotion',
    };

    addCampaign(newCmp);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      type: 'Inbound Portal',
      channel: 'Website Inbound',
      budget: 10000,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'Active',
      listing: true,
      ownerName: 'Mohammed Rashid',
    });
    showToast(`Campaign "${newCmp.name}" created successfully!`);
  };

  const toggleListing = (id: string) => {
    toggleCampaignListing(id);
    showToast('Campaign listing updated');
  };

  const toggleStatus = (id: string) => {
    const item = campaigns.find((c) => c.id === id);
    if (item) {
      const nextStatus = item.status === 'Active' ? 'Paused' : 'Active';
      updateCampaign(id, { status: nextStatus });
      showToast(`Campaign ${item.name} is now ${nextStatus}`);
    }
    setActiveGearMenuId(null);
  };

  const duplicateCampaign = (item: ExtendedCampaign) => {
    const copy: ExtendedCampaign = {
      ...item,
      id: `cmp-${Date.now()}`,
      slNo: campaigns.length + 1,
      name: `${item.name} (Copy)`,
      status: 'Active',
      leadsGenerated: 0,
    };
    addCampaign(copy);
    showToast(`Duplicated campaign as "${copy.name}"`);
    setActiveGearMenuId(null);
  };

  const deleteCampaign = (id: string) => {
    ctxDeleteCampaign(id);
    showToast('Campaign deleted successfully');
    setActiveGearMenuId(null);
  };

  const filteredCampaigns = useMemo(() => {
    return localCampaigns.filter((c) => {
      const cType = c.type || '';
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        cType.toLowerCase().includes(search.toLowerCase()) ||
        (c.owner?.name && c.owner.name.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchType = typeFilter === 'All' || cType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [localCampaigns, search, statusFilter, typeFilter]);

  const totalCount = localCampaigns.length;
  const activeCount = localCampaigns.filter((c) => c.status === 'Active').length;
  const totalLeads = localCampaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0);
  const totalBudget = localCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Megaphone className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Campaigns</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Create, manage, and optimize multi-channel inbound and outbound enterprise marketing campaigns.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFbImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Import Lead From Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFbIntegrateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <FacebookIcon className="w-3.5 h-3.5" />
            <span>Integrate With Facebook</span>
          </button>

          <Link
            href="/marketing/campaigns/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ CAMPAIGN</span>
          </Link>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 bg-white/70 backdrop-blur-xs p-2 rounded-2xl border shadow-2xs">
        {[
          { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: totalCount > 0 ? String(totalCount) : undefined, href: '/marketing?tab=campaigns' },
          { id: 'email', label: 'Email Marketing', icon: Mail, href: '/marketing?tab=email' },
          { id: 'whatsapp', label: 'WhatsApp Campaigns', icon: MessageSquare, href: '/marketing?tab=whatsapp' },
          { id: 'sms', label: 'SMS Campaigns', icon: Smartphone, href: '/marketing?tab=sms' },
          { id: 'segments', label: 'Customer Segments', icon: Users, href: '/marketing?tab=segments' },
          { id: 'templates', label: 'Templates', icon: Copy, href: '/marketing?tab=templates' },
          { id: 'reports', label: 'Campaign Reports', icon: FileText, href: '/marketing?tab=reports' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'campaigns';
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Campaigns</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-0.5">
            <Radio className="w-3 h-3" />
            <span>Multi-channel active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Active Campaigns</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Live &amp; receiving traffic</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Total Leads Generated</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalLeads.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-600">Total Budget Allocated</span>
          <p className="text-2xl font-black text-slate-900 mt-1">AED {totalBudget.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>FY 2025-2026 Cycle</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs min-w-[130px] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs min-w-[150px] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Inbound Portal">Inbound Portal</option>
              <option value="Directory Listing">Directory Listing</option>
              <option value="Industrial Media">Industrial Media</option>
              <option value="Telephony PBX">Telephony PBX</option>
              <option value="Email Routing">Email Routing</option>
              <option value="PPC Search Ads">PPC Search Ads</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs font-medium text-slate-600">Rows</span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Campaign Directory</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{filteredCampaigns.length} records found</span>
        </div>

        <div className="overflow-x-auto min-h-[360px] pb-28">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">SL.NO</th>
                <th className="py-3 px-4 w-20 text-center">OWNER</th>
                <th className="py-3 px-4">CAMPAIGN NAME</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4">START DATE</th>
                <th className="py-3 px-4">END DATE</th>
                <th className="py-3 px-4 text-center">LISTING</th>
                <th className="py-3 px-4 text-center w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No campaigns found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.slice(0, rowsPerPage).map((c, index) => (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-600">{index + 1}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {c.owner?.avatar ? (
                          <img
                            src={c.owner.avatar}
                            alt={c.owner.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                            {c.owner?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/marketing/reports?campaign=${c.id}`}
                        className="font-bold text-[#1677FF] hover:underline uppercase tracking-wide"
                      >
                        {c.name}
                      </Link>
                      {c.channel && (
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">{c.channel}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          c.status === 'Active'
                            ? 'bg-emerald-500 text-white'
                            : c.status === 'Paused'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-400 text-white'
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">{c.startDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">{c.endDate}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleListing(c.id)}
                        className={cn(
                          'relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          c.listing ? 'bg-emerald-500' : 'bg-slate-300'
                        )}
                        title={c.listing ? 'Listing is Enabled (click to disable)' : 'Listing is Disabled (click to enable)'}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            c.listing ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGearMenuId(activeGearMenuId === c.id ? null : c.id);
                          }}
                          className="p-1.5 rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors shadow-2xs flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <SettingsIcon className="w-3.5 h-3.5" />
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {activeGearMenuId === c.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveGearMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                              <Link
                                href={`/marketing/reports?campaign=${c.id}`}
                                onClick={() => setActiveGearMenuId(null)}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>View Leads &amp; ROI</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => toggleStatus(c.id)}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-left cursor-pointer transition-colors"
                              >
                                {c.status === 'Active' ? (
                                  <>
                                    <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Pause Campaign</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Resume Campaign</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => duplicateCampaign(c)}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-left cursor-pointer transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Duplicate Campaign</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1" />

                              <button
                                type="button"
                                onClick={() => deleteCampaign(c.id)}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-semibold cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Campaign</span>
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

      {/* MODAL 1: Create New Campaign */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create New Campaign</h2>
                <p className="text-xs text-slate-500">Configure multi-channel marketing details, dates, and budget</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER SPECIAL - 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Inbound Portal">Inbound Portal</option>
                    <option value="Directory Listing">Directory Listing</option>
                    <option value="Industrial Media">Industrial Media</option>
                    <option value="Telephony PBX">Telephony PBX</option>
                    <option value="Email Routing">Email Routing</option>
                    <option value="PPC Search Ads">PPC Search Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Channel / Source</label>
                  <input
                    type="text"
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    placeholder="e.g. Website Inbound"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner</label>
                  <select
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    {users && users.length > 0 ? (
                      users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Afsal">Afsal</option>
                        <option value="Shaheer">Shaheer</option>
                        <option value="Mohammed Rashid">Mohammed Rashid</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget (AED)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="listingToggle"
                  checked={formData.listing}
                  onChange={(e) => setFormData({ ...formData, listing: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="listingToggle" className="font-semibold text-xs text-slate-700 cursor-pointer">
                  Enable Public Listing &amp; Auto Lead Capture
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Save &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Facebook Lead Import */}
      {isFbImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Import Leads from Facebook</h2>
                  <p className="text-xs text-slate-500">Sync Instant Forms directly into Cool Technologies CRM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFbImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Meta Page</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none">
                  <option>Cool Technologies LLC - Dubai HQ</option>
                  <option>Cool Technologies - HVAC Commercial Division</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Lead Form</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none">
                  <option>UAE Summer Chiller Overhaul Offer 2026 (482 Leads)</option>
                  <option>Industrial HVAC AMC VIP Inquiry Form (193 Leads)</option>
                  <option>Commercial Facility Emergency Service (84 Leads)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Destination Campaign</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none">
                  <option>SIMPLE LIFE - 2025</option>
                  <option>REACHUAE - 2025</option>
                  <option>ATN - 2025</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Auto field mapping configured
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5">
                  Full Name, Phone Number, Business Email, and City are automatically mapped to CRM Leads.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFbImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFbImportModalOpen(false);
                    showToast('Imported 482 leads from Meta Instant Forms into CRM successfully!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Start Lead Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Facebook Ads & Page Integration */}
      {isFbIntegrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <FacebookIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Facebook Meta Integration</h2>
                  <p className="text-xs text-slate-500">Live webhook integration for instant lead capture</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFbIntegrateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-900">{fbIntegration.pageName}</p>
                  <p className="text-[11px] text-emerald-700">Page ID: {fbIntegration.pageId}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {fbIntegration.status}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meta Conversion Pixel ID</label>
                <input
                  type="text"
                  value={fbIntegration.pixelId}
                  onChange={(e) => setFbIntegration({ ...fbIntegration, pixelId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fbIntegration.syncLeads}
                    onChange={(e) => setFbIntegration({ ...fbIntegration, syncLeads: e.target.checked })}
                    className="rounded text-blue-600 h-4 w-4"
                  />
                  <span>Real-time Lead Webhook Dispatch (Instant CRM notification)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFbIntegrateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFbIntegrateModalOpen(false);
                    showToast('Meta Integration settings saved and validated.');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Campaigns...</div>}>
      <CampaignsContent />
    </Suspense>
  );
}
