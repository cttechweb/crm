'use client';

import React, { useState, useMemo, Suspense } from 'react';
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
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface LeadSourceItem {
  id: string;
  name: string;
  channelType: 'Website Inbound' | 'Directory Portal' | 'Paid Ads (PPC)' | 'Social Media' | 'Direct Referral' | 'Cold Outbound';
  category: 'Digital Inbound' | 'B2B Portal' | 'Paid Campaign' | 'Field & Referral';
  leadsGenerated: number;
  activeDeals: number;
  convertedCount: number;
  conversionRate: string;
  costPerLead: number;
  status: 'Active' | 'Paused' | 'Archived';
  trackingParam: string;
}

const INITIAL_SOURCES: LeadSourceItem[] = [];

function LeadSourcesContent() {
  const [sources, setSources] = useState<LeadSourceItem[]>(INITIAL_SOURCES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingSource, setViewingSource] = useState<LeadSourceItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    channelType: 'Website Inbound' as const,
    category: 'Digital Inbound' as const,
    trackingParam: 'utm_source=custom',
    costPerLead: 50,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSource: LeadSourceItem = {
      id: `SRC-0${sources.length + 1}`,
      name: formData.name,
      channelType: formData.channelType,
      category: formData.category,
      leadsGenerated: 0,
      activeDeals: 0,
      convertedCount: 0,
      conversionRate: '0.0%',
      costPerLead: Number(formData.costPerLead),
      status: 'Active',
      trackingParam: formData.trackingParam,
    };

    setSources([newSource, ...sources]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      channelType: 'Website Inbound',
      category: 'Digital Inbound',
      trackingParam: 'utm_source=custom',
      costPerLead: 50,
    });
    showToast(`Lead Source "${newSource.name}" created successfully!`);
  };

  const toggleSourceStatus = (id: string) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = s.status === 'Active' ? 'Paused' : 'Active';
          showToast(`Source "${s.name}" is now ${next}`);
          return { ...s, status: next };
        }
        return s;
      })
    );
  };

  const deleteSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    showToast('Lead source deleted');
  };

  const filtered = useMemo(() => {
    return sources.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.channelType.toLowerCase().includes(search.toLowerCase()) ||
        s.trackingParam.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'All' || s.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [sources, search, categoryFilter, statusFilter]);

  const totalLeads = sources.reduce((sum, s) => sum + s.leadsGenerated, 0);
  const totalConverted = sources.reduce((sum, s) => sum + s.convertedCount, 0);
  const avgConversion = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '0';

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

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Lead Source</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Active Lead Sources</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{sources.filter((s) => s.status === 'Active').length}</p>
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
            <span>Deals Won</span>
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
          <span className="text-xs font-semibold text-slate-500">{filtered.length} Sources</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Leads Sourced</th>
                <th className="py-3 px-3 text-center">Active Deals</th>
                <th className="py-3 px-3 text-center">Converted</th>
                <th className="py-3 px-3 text-center">Win Rate %</th>
                <th className="py-3 px-3 text-right">Avg. CPA (AED)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p className="text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono font-normal mt-0.5">{item.trackingParam}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-blue-700">
                    {item.leadsGenerated}
                  </td>

                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {item.activeDeals}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                    {item.convertedCount}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                    <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {item.conversionRate}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                    {item.costPerLead > 0 ? `AED ${item.costPerLead.toFixed(1)}` : 'Organic (Free)'}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSourceStatus(item.id)}
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors',
                        item.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      )}
                    >
                      {item.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingSource(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="View Source Analytics"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSource(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add Lead Source */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add New Lead Source</h2>
                <p className="text-xs text-slate-500">Configure UTM tracking and marketing channel attribution</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai Big 5 HVAC Exhibition 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Channel Type</label>
                  <select
                    value={formData.channelType}
                    onChange={(e) => setFormData({ ...formData, channelType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Website Inbound">Website Inbound</option>
                    <option value="Directory Portal">Directory Portal</option>
                    <option value="Paid Ads (PPC)">Paid Ads (PPC)</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Direct Referral">Direct Referral</option>
                    <option value="Cold Outbound">Cold Outbound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Digital Inbound">Digital Inbound</option>
                    <option value="B2B Portal">B2B Portal</option>
                    <option value="Paid Campaign">Paid Campaign</option>
                    <option value="Field & Referral">Field &amp; Referral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UTM Tracking Parameter</label>
                  <input
                    type="text"
                    value={formData.trackingParam}
                    onChange={(e) => setFormData({ ...formData, trackingParam: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    placeholder="utm_source=expo2026"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. Cost Per Lead (AED)</label>
                  <input
                    type="number"
                    value={formData.costPerLead}
                    onChange={(e) => setFormData({ ...formData, costPerLead: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Lead Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Source Details */}
      {viewingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{viewingSource.name}</h2>
                <p className="text-xs text-slate-500">{viewingSource.channelType} • {viewingSource.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">Tracking String:</p>
                <p className="font-mono text-blue-600 font-semibold">{viewingSource.trackingParam}</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-700 uppercase">Leads Sourced</p>
                  <p className="text-lg font-black text-blue-900 mt-0.5">{viewingSource.leadsGenerated}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Converted</p>
                  <p className="text-lg font-black text-emerald-900 mt-0.5">{viewingSource.convertedCount}</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Win Rate</p>
                  <p className="text-lg font-black text-purple-900 mt-0.5">{viewingSource.conversionRate}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingSource(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadSourcesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Lead Sources...</div>}>
      <LeadSourcesContent />
    </Suspense>
  );
}
