'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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

// Import all sub-module UIs
import { EmailMarketingContent } from '@/app/marketing/email/page';
import { WhatsAppContent } from '@/app/marketing/whatsapp/page';
import { SmsContent } from '@/app/marketing/sms/page';
import { CustomerSegmentsContent } from '@/app/marketing/segments/page';
import { TemplatesContent } from '@/app/marketing/templates/page';
import { CampaignReportsContent } from '@/app/marketing/reports/page';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

function ManagerCampaignsTabContent() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useEnterpriseCrm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isFbImportModalOpen, setIsFbImportModalOpen] = useState(false);
  const [isFbIntegrateModalOpen, setIsFbIntegrateModalOpen] = useState(false);
  const [activeGearMenuId, setActiveGearMenuId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [fbIntegration] = useState({
    pageId: '108492039281920',
    pageName: 'Cool Technologies LLC - Dubai HQ',
    connected: true,
    syncLeads: true,
    pixelId: 'PIX-99482018',
    status: 'Connected & Active',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const toggleListing = (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;
    const updatedVal = !target.listing;
    updateCampaign(id, { listing: updatedVal });
    showToast(`Campaign listing ${updatedVal ? 'activated' : 'paused'}`);
  };

  const toggleStatus = (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Paused' : 'Active';
    updateCampaign(id, { status: nextStatus });
    showToast(`Campaign "${target.name}" status changed to ${nextStatus}`);
    setActiveGearMenuId(null);
  };

  const duplicateCampaign = (item: CrmCampaign) => {
    addCampaign({
      name: `${item.name} (Copy)`,
      channel: item.channel,
      type: item.type,
      budget: item.budget,
      leadsGenerated: 0,
      conversionRate: '0.0%',
      startDate: new Date().toISOString().split('T')[0],
      endDate: item.endDate,
      status: 'Active',
      listing: item.listing,
      owner: item.owner || { name: 'Manager' },
    });
    showToast(`Duplicated campaign as "${item.name} (Copy)"`);
    setActiveGearMenuId(null);
  };

  const handleDeleteCampaign = (id: string) => {
    deleteCampaign(id);
    showToast('Campaign removed successfully');
    setActiveGearMenuId(null);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const cType = c.type || '';
      const cChannel = c.channel || '';
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        cType.toLowerCase().includes(search.toLowerCase()) ||
        cChannel.toLowerCase().includes(search.toLowerCase()) ||
        (c.owner?.name && c.owner.name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchType = typeFilter === 'All' || cType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [campaigns, search, statusFilter, typeFilter]);

  const totalCount = campaigns.length;
  const activeCount = campaigns.filter((c) => c.status === 'Active').length;
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. TOP BANNER HEADER */}
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
            href="/manager/marketing/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ CAMPAIGN</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI STAT CARDS */}
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
            <span>Real-time conversion sync</span>
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

      {/* 3. FILTER AND CONTROL TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs min-w-[120px] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs min-w-[140px] cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Service Promotion">Service Promotion</option>
                <option value="Inbound Portal">Inbound Portal</option>
                <option value="Directory Listing">Directory Listing</option>
                <option value="Industrial Media">Industrial Media</option>
                <option value="Telephony PBX">Telephony PBX</option>
                <option value="Email Routing">Email Routing</option>
                <option value="PPC Search Ads">PPC Search Ads</option>
                <option value="Social Media Ads">Social Media Ads</option>
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
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, channel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. MAIN CAMPAIGN DIRECTORY TABLE */}
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
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 mt-2">No campaigns found</p>
                      <p className="text-xs text-slate-400 text-center">
                        {search
                          ? 'No campaigns match your search query.'
                          : 'There are currently no active campaigns registered. Click below to launch your outreach campaign.'}
                      </p>
                      {!search && (
                        <Link
                          href="/manager/marketing/create"
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Create Campaign</span>
                        </Link>
                      )}
                    </div>
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
                            {c.owner?.name?.charAt(0) || 'M'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1677FF] uppercase tracking-wide block">
                        {c.name}
                      </span>
                      {c.channel && (
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">{c.channel}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.type || 'Standard Outreach'}
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
                            : c.status === 'Draft'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">{c.startDate || '—'}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">{c.endDate || '—'}</td>
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
                                onClick={() => handleDeleteCampaign(c.id)}
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

      {/* MODAL: Import Lead From Facebook */}
      {isFbImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Import Leads from Facebook Ads</h2>
                  <p className="text-xs text-slate-500">Sync Instant Form submissions into CRM leads</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFbImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Facebook Page Connected</span>
                </div>
                <p className="text-emerald-700 text-[11px]">{fbIntegration.pageName} (ID: {fbIntegration.pageId})</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Lead Form</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none">
                  <option>UAE Commercial HVAC Maintenance Lead Form (Active - 42 New Leads)</option>
                  <option>Emergency Chiller Repair Dubai Form (Active - 19 New Leads)</option>
                  <option>Residential Villa AC AMC Annual Campaign Form (11 New Leads)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Auto-Assign Imported Leads To</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none">
                  <option>Muhammed Shibil (Manager)</option>
                  <option>Mohammed Rashid (Lead Exec)</option>
                  <option>Round Robin Distribution</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFbImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFbImportModalOpen(false);
                  showToast('Successfully synchronized 42 new leads from Facebook Ads Form!');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Sync &amp; Import Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Integrate With Facebook */}
      {isFbIntegrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-50 text-[#1877F2]">
                  <FacebookIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Meta / Facebook Pixel &amp; Ads</h2>
                  <p className="text-xs text-slate-500">Configure OAuth Webhook and Conversion API</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFbIntegrateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Access Token</label>
                <input
                  type="password"
                  defaultValue="EAAGm0PX4ZCpsBAK7ZCZAZB9uN4JkL5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meta Pixel ID</label>
                <input
                  type="text"
                  defaultValue={fbIntegration.pixelId}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="syncCheck"
                  defaultChecked
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="syncCheck" className="text-xs font-bold text-slate-800">
                  Real-time webhook sync for Instant Forms &amp; Messenger ads
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFbIntegrateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFbIntegrateModalOpen(false);
                  showToast('Facebook Ads integration settings updated and verified!');
                }}
                className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Save Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagerMarketingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'campaigns';

  const { campaigns } = useEnterpriseCrm();

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: campaigns.length > 0 ? String(campaigns.length) : undefined },
    { id: 'email', label: 'Email Marketing', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Campaigns', icon: MessageSquare },
    { id: 'sms', label: 'SMS Campaigns', icon: Smartphone },
    { id: 'segments', label: 'Customer Segments', icon: Users },
    { id: 'templates', label: 'Templates', icon: Copy },
    { id: 'reports', label: 'Campaign Reports', icon: FileText },
  ];

  const handleTabChange = (tabId: string) => {
    router.push(`/manager/marketing?tab=${tabId}`);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16 font-sans text-slate-800">
      {/* 1. MARKETING MODULE TOP-LEVEL SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 bg-white/70 backdrop-blur-xs p-2 rounded-2xl border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
            </button>
          );
        })}
      </div>

      {/* 2. DYNAMIC TAB CONTENT VIEW */}
      <div>
        {currentTab === 'campaigns' && <ManagerCampaignsTabContent />}
        {currentTab === 'email' && <EmailMarketingContent />}
        {currentTab === 'whatsapp' && <WhatsAppContent />}
        {currentTab === 'sms' && <SmsContent />}
        {currentTab === 'segments' && <CustomerSegmentsContent />}
        {currentTab === 'templates' && <TemplatesContent />}
        {currentTab === 'reports' && <CampaignReportsContent />}
      </div>
    </div>
  );
}

export default function ManagerMarketingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Marketing Module...</div>}>
      <ManagerMarketingContent />
    </Suspense>
  );
}
