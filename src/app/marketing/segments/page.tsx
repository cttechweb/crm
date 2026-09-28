'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  X,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface CustomerSegmentItem {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  customerCount: number;
  lastUpdated: string;
  status: 'Active' | 'Syncing' | 'Paused';
  members: Array<{ name: string; company: string; phone: string; email: string; emirate: string }>;
}

const INITIAL_SEGMENTS: CustomerSegmentItem[] = [];

function CustomerSegmentsContent() {
  const [segments, setSegments] = useState<CustomerSegmentItem[]>(INITIAL_SEGMENTS);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewSegment, setViewSegment] = useState<CustomerSegmentItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: 'Commercial Towers',
    emirate: 'Dubai',
    spendThreshold: 'AED 50,000+',
    contractStatus: 'Active AMC',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSeg: CustomerSegmentItem = {
      id: `SEG-0${segments.length + 1}`,
      name: formData.name,
      description: formData.description || 'Custom filtered customer group for targeted outreach.',
      criteria: [formData.industry, formData.emirate, formData.spendThreshold, formData.contractStatus],
      customerCount: Math.floor(45 + Math.random() * 120),
      lastUpdated: 'Just now',
      status: 'Active',
      members: [
        { name: 'Sample Dubai Partner LLC', company: 'Dubai Holdings Group', phone: '+971 4 300 0000', email: 'contact@dubaiholdings.ae', emirate: formData.emirate },
      ],
    };

    setSegments([newSeg, ...segments]);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      description: '',
      industry: 'Commercial Towers',
      emirate: 'Dubai',
      spendThreshold: 'AED 50,000+',
      contractStatus: 'Active AMC',
    });
    showToast(`Segment "${newSeg.name}" created with ${newSeg.customerCount} auto-matched customers!`);
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
    showToast('Customer segment deleted');
  };

  const filtered = useMemo(() => {
    return segments.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.criteria.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [segments, search]);

  const totalTargeted = segments.reduce((sum, s) => sum + s.customerCount, 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Segments</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Create intelligent customer cohorts by industry, location, annual HVAC spend, and service history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Segment</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Segments</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{segments.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Dynamic criteria rules</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-indigo-600">Targeted Customers</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{totalTargeted.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-indigo-600">Across all segments</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Auto-Sync Status</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">Real-time</p>
          <span className="text-[11px] font-semibold text-emerald-600">Linked to CRM Customers</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Avg. Campaign Response</span>
          <p className="text-2xl font-black text-blue-600 mt-1">32.4%</p>
          <span className="text-[11px] font-semibold text-blue-600">Higher conversion</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search segments, tags, criteria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs">
                    {item.id}
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{item.name}</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.criteria.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold">Audience: </span>
                <span className="font-bold text-slate-900">{item.customerCount} Customers</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewSegment(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Members</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteSegment(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Segment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Create Segment */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Target Customer Segment</h2>
                <p className="text-xs text-slate-500">Define criteria to segment Cool Technologies CRM accounts</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Segment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Chiller Clients with Expiring AMC"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the purpose of this target customer cohort..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Industry / Facility Type</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Commercial Towers">Commercial Towers</option>
                    <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                    <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                    <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                    <option value="Educational Campuses">Educational Campuses</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emirate / Location</label>
                  <select
                    value={formData.emirate}
                    onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah & Northern Emirates">Sharjah & Northern Emirates</option>
                    <option value="All UAE Emirates">All UAE Emirates</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual Spend Threshold</label>
                  <select
                    value={formData.spendThreshold}
                    onChange={(e) => setFormData({ ...formData, spendThreshold: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="AED 50,000+">AED 50,000+</option>
                    <option value="AED 100,000+ (Tier-1)">AED 100,000+ (Tier-1)</option>
                    <option value="AED 250,000+ (Enterprise)">AED 250,000+ (Enterprise)</option>
                    <option value="All Spend Levels">All Spend Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Status</label>
                  <select
                    value={formData.contractStatus}
                    onChange={(e) => setFormData({ ...formData, contractStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Active AMC">Active AMC</option>
                    <option value="AMC Expiring within 60 Days">AMC Expiring within 60 Days</option>
                    <option value="Prospect / In Negotiation">Prospect / In Negotiation</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  Build Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Segment Members */}
      {viewSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{viewSegment.name}</h2>
                <p className="text-xs text-slate-500">{viewSegment.customerCount} Segment Members</p>
              </div>
              <button
                type="button"
                onClick={() => setViewSegment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
              {viewSegment.members.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.company} • {m.emirate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-slate-700 font-semibold">{m.phone}</p>
                    <p className="text-[11px] text-blue-600">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  showToast('Exported segment members to CSV');
                  setViewSegment(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setViewSegment(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
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

export default function CustomerSegmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customer Segments...</div>}>
      <CustomerSegmentsContent />
    </Suspense>
  );
}
