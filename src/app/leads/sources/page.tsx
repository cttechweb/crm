'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  X,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  Radio,
  Sliders,
  Check,
  Pencil,
  RotateCcw,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface LeadSourceItem {
  id: string;
  name: string;
  channelType: 'Website Inbound' | 'Directory Portal' | 'Paid Ads (PPC)' | 'Social Media' | 'Direct Referral' | 'Cold Outbound';
  category: 'Digital Inbound' | 'B2B Portal' | 'Paid Campaign' | 'Field & Referral';
  leadsGenerated?: number;
  activeDeals?: number;
  convertedCount?: number;
  conversionRate?: string;
  costPerLead: number;
  status: 'Active' | 'Paused' | 'Archived';
  trackingParam: string;
}

const DEFAULT_STANDARD_SOURCES: LeadSourceItem[] = [
  {
    id: 'SRC-01',
    name: 'Direct Website Inquiry',
    channelType: 'Website Inbound',
    category: 'Digital Inbound',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=direct_web&utm_medium=organic',
  },
  {
    id: 'SRC-02',
    name: 'LinkedIn Campaign / InMail',
    channelType: 'Social Media',
    category: 'Paid Campaign',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=linkedin&utm_campaign=b2b_cooling',
  },
  {
    id: 'SRC-03',
    name: 'WhatsApp Inbound',
    channelType: 'Website Inbound',
    category: 'Digital Inbound',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=whatsapp_chat_widget',
  },
  {
    id: 'SRC-04',
    name: 'Existing Customer Referral',
    channelType: 'Direct Referral',
    category: 'Field & Referral',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=client_referral_program',
  },
  {
    id: 'SRC-05',
    name: 'Google Ads / Search SEM',
    channelType: 'Paid Ads (PPC)',
    category: 'Paid Campaign',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=google_ads&utm_medium=cpc',
  },
  {
    id: 'SRC-06',
    name: 'Trade Show / Gitex Expo',
    channelType: 'Direct Referral',
    category: 'Field & Referral',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=gitex_expo_2026',
  },
  {
    id: 'SRC-07',
    name: 'Cold Call / Outreach',
    channelType: 'Cold Outbound',
    category: 'Field & Referral',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=telemarketing_outbound',
  },
  {
    id: 'SRC-08',
    name: 'Partner / Reseller Channel',
    channelType: 'Directory Portal',
    category: 'B2B Portal',
    costPerLead: 0,
    status: 'Active',
    trackingParam: 'utm_source=reseller_portal',
  },
];

function LeadSourcesContent() {
  const { leads, customers, salesOpportunities, campaigns } = useEnterpriseCrm();

  const [rawSources, setRawSources] = useState<LeadSourceItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_lead_sources_config_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_STANDARD_SOURCES;
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSourceItem | null>(null);
  const [viewingSource, setViewingSource] = useState<LeadSourceItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    channelType: 'Website Inbound' | 'Directory Portal' | 'Paid Ads (PPC)' | 'Social Media' | 'Direct Referral' | 'Cold Outbound';
    category: 'Digital Inbound' | 'B2B Portal' | 'Paid Campaign' | 'Field & Referral';
    trackingParam: string;
    costPerLead: number;
  }>({
    name: '',
    channelType: 'Website Inbound',
    category: 'Digital Inbound',
    trackingParam: 'utm_source=custom',
    costPerLead: 0,
  });

  const saveSources = (updated: LeadSourceItem[]) => {
    setRawSources(updated);
    try {
      localStorage.setItem('cezcon_lead_sources_config_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Dynamically compute live metrics for each source from leads & customers
  const computedSources = useMemo(() => {
    return rawSources.map((source) => {
      // Leads matching this specific source name exactly
      const matchedLeads = leads.filter((l) => {
        if (!l.source) return false;
        return l.source.trim().toLowerCase() === source.name.trim().toLowerCase();
      });

      // Converted leads for this source
      const convertedLeads = matchedLeads.filter(
        (l) => l.status === 'Converted' || l.status === 'Won'
      );

      // Active deals matching this source
      const matchedDeals = salesOpportunities.filter((opp) => {
        if (!opp.source) return false;
        return opp.source.trim().toLowerCase() === source.name.trim().toLowerCase();
      });

      const leadsGenerated = matchedLeads.length;
      const convertedCount = convertedLeads.length;
      const activeDeals = matchedDeals.length;
      const conversionRate =
        leadsGenerated > 0 ? `${((convertedCount / leadsGenerated) * 100).toFixed(1)}%` : '0.0%';

      // Live CPA calculation from actual campaign budget or custom configured rate
      const relatedCampaign = campaigns?.find(
        (c) => c.channel?.toLowerCase() === source.name.toLowerCase() || c.name?.toLowerCase() === source.name.toLowerCase()
      );
      const liveCpa = relatedCampaign && relatedCampaign.budget && leadsGenerated > 0 
        ? Math.round(relatedCampaign.budget / leadsGenerated) 
        : (source.costPerLead || 0);

      return {
        ...source,
        costPerLead: liveCpa,
        leadsGenerated,
        activeDeals,
        convertedCount,
        conversionRate,
      };
    });
  }, [rawSources, leads, salesOpportunities, campaigns]);

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingSource) {
      const updated = rawSources.map((s) =>
        s.id === editingSource.id
          ? {
              ...s,
              name: formData.name,
              channelType: formData.channelType,
              category: formData.category,
              trackingParam: formData.trackingParam,
              costPerLead: Number(formData.costPerLead),
            }
          : s
      );
      saveSources(updated);
      showToast(`Lead Source "${formData.name}" updated successfully!`);
    } else {
      const newSource: LeadSourceItem = {
        id: `SRC-0${rawSources.length + 1}`,
        name: formData.name,
        channelType: formData.channelType,
        category: formData.category,
        costPerLead: Number(formData.costPerLead),
        status: 'Active',
        trackingParam: formData.trackingParam,
      };
      saveSources([newSource, ...rawSources]);
      showToast(`Lead Source "${newSource.name}" created successfully!`);
    }

    setIsAddModalOpen(false);
    setEditingSource(null);
    setFormData({
      name: '',
      channelType: 'Website Inbound',
      category: 'Digital Inbound',
      trackingParam: 'utm_source=custom',
      costPerLead: 50,
    });
  };

  const handleOpenEdit = (s: LeadSourceItem) => {
    setEditingSource(s);
    setFormData({
      name: s.name,
      channelType: s.channelType,
      category: s.category,
      trackingParam: s.trackingParam,
      costPerLead: s.costPerLead,
    });
    setIsAddModalOpen(true);
  };

  const toggleSourceStatus = (id: string) => {
    const updated = rawSources.map((s) => {
      if (s.id === id) {
        const next = s.status === 'Active' ? 'Paused' : 'Active';
        showToast(`Source "${s.name}" is now ${next}`);
        return { ...s, status: next as any };
      }
      return s;
    });
    saveSources(updated);
  };

  const deleteSource = (id: string) => {
    const updated = rawSources.filter((s) => s.id !== id);
    saveSources(updated);
    showToast('Lead source deleted');
  };

  const handleResetDefaults = () => {
    saveSources(DEFAULT_STANDARD_SOURCES);
    showToast('Reset lead sources to standard defaults.');
  };

  const filtered = useMemo(() => {
    return computedSources.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.channelType.toLowerCase().includes(search.toLowerCase()) ||
        s.trackingParam.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'All' || s.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [computedSources, search, categoryFilter, statusFilter]);

  // Dynamic KPI Totals (Ensuring converted lead by manager is counted!)
  const totalLeads = leads.length > 0 ? leads.length : computedSources.reduce((sum, s) => sum + (s.leadsGenerated || 0), 0);
  const totalConverted = leads.filter((l) => l.status === 'Converted' || l.status === 'Won').length;
  const activeSourcesCount = computedSources.filter((s) => s.status === 'Active').length;
  const avgConversion = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '100.0';

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Globe className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lead Sources &amp; Channels</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Track inbound lead provenance, marketing channel efficacy, conversion rates, and acquisition costs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingSource(null);
              setFormData({
                name: '',
                channelType: 'Website Inbound',
                category: 'Digital Inbound',
                trackingParam: 'utm_source=custom',
                costPerLead: 50,
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Lead Source</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Active Lead Sources</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeSourcesCount}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-0.5">
            <Radio className="w-3 h-3" />
            <span>Digital, B2B &amp; Direct</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Total Leads Sourced</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalLeads.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Multi-channel intake</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Converted Customers</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalConverted}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Deals Won (incl. Manager Conversion)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-600">Avg. Conversion Rate</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{avgConversion}%</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>Above UAE CRM index</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs min-w-[150px] cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Digital Inbound">Digital Inbound</option>
              <option value="B2B Portal">B2B Portal</option>
              <option value="Paid Campaign">Paid Campaign</option>
              <option value="Field & Referral">Field &amp; Referral</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs min-w-[120px] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search source name, UTM tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Lead Sources Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Lead Provenance Directory</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">{filtered.length} Sources</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Leads Sourced</th>
                <th className="py-3 px-4 text-center">Active Deals</th>
                <th className="py-3 px-4 text-center">Converted</th>
                <th className="py-3 px-4 text-center">Win Rate %</th>
                <th className="py-3 px-4 text-right">Avg. CPA (AED)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No lead sources found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Click "+ Add Lead Source" or "Reset Defaults"</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {s.convertedCount && s.convertedCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ★ Converted
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono truncate block max-w-xs">{s.trackingParam}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 font-mono">
                      {s.leadsGenerated || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600 font-mono">
                      {s.activeDeals || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 font-mono">
                      {s.convertedCount || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                      {s.conversionRate || '0.0%'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                      AED {s.costPerLead.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSourceStatus(s.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {s.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingSource(s)}
                          className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Source Analytics"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Source"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSource(s.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT LEAD SOURCE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1677FF]" />
                <h3 className="font-bold text-sm text-slate-900">
                  {editingSource ? 'Edit Lead Source' : 'Add Inbound Lead Source'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSource(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source / Channel Name *</label>
                <input
                  type="text"
                  placeholder="e.g. TikTok Ads / Video Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Channel Medium</label>
                  <select
                    value={formData.channelType}
                    onChange={(e) => setFormData({ ...formData, channelType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="Website Inbound">Website Inbound</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Paid Ads (PPC)">Paid Ads (PPC)</option>
                    <option value="Directory Portal">Directory Portal</option>
                    <option value="Direct Referral">Direct Referral</option>
                    <option value="Cold Outbound">Cold Outbound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="Digital Inbound">Digital Inbound</option>
                    <option value="Paid Campaign">Paid Campaign</option>
                    <option value="B2B Portal">B2B Portal</option>
                    <option value="Field & Referral">Field & Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default UTM Tracking Query</label>
                <input
                  type="text"
                  placeholder="utm_source=my_campaign"
                  value={formData.trackingParam}
                  onChange={(e) => setFormData({ ...formData, trackingParam: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Cost Per Lead (AED)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.costPerLead}
                  onChange={(e) => setFormData({ ...formData, costPerLead: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSource(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold shadow-xs"
                >
                  {editingSource ? 'Save Changes' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SOURCE ANALYTICS */}
      {viewingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1677FF]" />
                <h3 className="font-bold text-sm text-slate-900">{viewingSource.name} — Attribution Details</h3>
              </div>
              <button onClick={() => setViewingSource(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Leads</span>
                <p className="text-lg font-black text-slate-900 mt-1">{viewingSource.leadsGenerated || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-500">Active Deals</span>
                <p className="text-lg font-black text-blue-700 mt-1">{viewingSource.activeDeals || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-500">Converted</span>
                <p className="text-lg font-black text-emerald-700 mt-1">{viewingSource.convertedCount || 0}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Tracking Param</span>
                <code className="text-[11px] font-mono font-bold text-blue-600">{viewingSource.trackingParam}</code>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Channel Category</span>
                <span className="font-bold text-slate-800">{viewingSource.category}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Cost Per Lead (CPA)</span>
                <span className="font-mono font-bold text-slate-900">AED {viewingSource.costPerLead.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingSource(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadSourcesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading lead provenance data...</div>}>
      <LeadSourcesContent />
    </Suspense>
  );
}
