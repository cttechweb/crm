'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Activity,
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
  Layers,
  ArrowRight,
  Flame,
  Phone,
  Mail,
  User,
  Clock,
  Check,
  Building,
  Kanban,
  Table as TableIcon,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface LeadStageItem {
  id: string;
  name: string;
  badgeColor: string;
  slaHours: number;
  leadsCount: number;
  totalValue: number;
  conversionRate: string;
  leads: Array<{
    id: string;
    contactName: string;
    company: string;
    phone: string;
    owner: string;
    value: number;
    rating: 'HOT' | 'WARM' | 'COLD';
    daysInStage: number;
  }>;
}

const INITIAL_STAGES: LeadStageItem[] = [
  {
    id: 'STG-01',
    name: 'New Inquiry',
    badgeColor: 'bg-blue-500',
    slaHours: 2,
    leadsCount: 0,
    totalValue: 0,
    conversionRate: '0%',
    leads: [],
  },
  {
    id: 'STG-02',
    name: 'Contacted / Qualifying',
    badgeColor: 'bg-indigo-500',
    slaHours: 12,
    leadsCount: 0,
    totalValue: 0,
    conversionRate: '0%',
    leads: [],
  },
  {
    id: 'STG-03',
    name: 'Site Survey Scheduled',
    badgeColor: 'bg-purple-500',
    slaHours: 24,
    leadsCount: 0,
    totalValue: 0,
    conversionRate: '0%',
    leads: [],
  },
  {
    id: 'STG-04',
    name: 'Proposal / Quotation Sent',
    badgeColor: 'bg-amber-500',
    slaHours: 48,
    leadsCount: 0,
    totalValue: 0,
    conversionRate: '0%',
    leads: [],
  },
  {
    id: 'STG-05',
    name: 'Negotiation / Contract Draft',
    badgeColor: 'bg-teal-500',
    slaHours: 72,
    leadsCount: 0,
    totalValue: 0,
    conversionRate: '0%',
    leads: [],
  },
  {
    id: 'STG-06',
    name: 'Won / Converted to AMC',
    badgeColor: 'bg-emerald-500',
    slaHours: 0,
    leadsCount: 0,
    totalValue: 0,
    conversionRate: '0%',
    leads: [],
  },
];

function LeadStatusContent() {
  const [stages, setStages] = useState<LeadStageItem[]>(INITIAL_STAGES);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slaHours: 24,
    badgeColor: 'bg-blue-500',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newStage: LeadStageItem = {
      id: `STG-0${stages.length + 1}`,
      name: formData.name,
      badgeColor: formData.badgeColor,
      slaHours: Number(formData.slaHours),
      leadsCount: 0,
      totalValue: 0,
      conversionRate: '0%',
      leads: [],
    };

    setStages([...stages, newStage]);
    setIsAddStageModalOpen(false);
    setFormData({ name: '', slaHours: 24, badgeColor: 'bg-blue-500' });
    showToast(`Pipeline stage "${newStage.name}" added successfully!`);
  };

  const totalPipelineLeads = stages.reduce((sum, s) => sum + s.leadsCount, 0);
  const totalPipelineValue = stages.reduce((sum, s) => sum + s.totalValue, 0);
  const hotDealsCount = stages.reduce((sum, s) => sum + s.leads.filter((l) => l.rating === 'HOT').length, 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {/* Toast */}
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
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lead Status &amp; Pipeline</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Monitor active deals across sales lifecycle stages, track response SLAs, and drive conversion velocity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddStageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Stage</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Pipeline Stages</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stages.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Lifecycle steps</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Total Leads in Pipeline</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalPipelineLeads}</p>
          <span className="text-[11px] font-semibold text-blue-600">Active opportunities</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Total Pipeline Value</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">AED {(totalPipelineValue / 1000).toFixed(0)}k</p>
          <span className="text-[11px] font-semibold text-emerald-600">Weighted forecast</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-rose-600">High Priority Hot Leads</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{hotDealsCount}</p>
          <span className="text-[11px] font-semibold text-rose-600">Needs immediate follow-up</span>
        </div>
      </div>

      {/* VIEW 1: Kanban Pipeline Board */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="w-80 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 flex flex-col justify-between"
              >
                {/* Column Header */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2.5 h-2.5 rounded-full', stage.badgeColor)} />
                      <h2 className="text-xs font-bold text-slate-900 truncate">{stage.name}</h2>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black">
                      {stage.leadsCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-1.5 px-0.5">
                    <span>SLA: {stage.slaHours > 0 ? `${stage.slaHours}h` : 'Instant'}</span>
                    <span>AED {(stage.totalValue / 1000).toFixed(0)}k</span>
                  </div>

                  {/* Lead Cards in Stage */}
                  <div className="space-y-2.5 mt-3">
                    {stage.leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-2 cursor-pointer"
                        onClick={() => showToast(`Selected Lead ${lead.contactName} (${lead.company})`)}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-xs text-slate-900 leading-tight">{lead.contactName}</p>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[9px] font-black uppercase',
                              lead.rating === 'HOT'
                                ? 'bg-rose-100 text-rose-700'
                                : lead.rating === 'WARM'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {lead.rating}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium truncate">{lead.company}</p>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                          <span className="font-bold text-emerald-700">AED {lead.value.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">{lead.daysInStage}d ago</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate">👤 {lead.owner}</span>
                          <span className="font-mono">{lead.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast(`Move or add lead to stage ${stage.name}`)}
                  className="w-full py-1.5 rounded-xl border border-dashed border-slate-300 hover:bg-white text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                >
                  + Add Lead to Stage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Stage Metrics Table */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Pipeline Stages Master Table</h2>
            <span className="text-xs text-slate-500">{stages.length} Stages</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Stage Name</th>
                  <th className="py-3 px-3 text-center">Target SLA</th>
                  <th className="py-3 px-3 text-center">Active Leads</th>
                  <th className="py-3 px-3 text-right">Stage Value (AED)</th>
                  <th className="py-3 px-3 text-center">Historical Win %</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {stages.map((stage) => (
                  <tr key={stage.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className={cn('w-3 h-3 rounded-full', stage.badgeColor)} />
                      <span>{stage.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                      {stage.slaHours > 0 ? `${stage.slaHours} Hours` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-blue-700">
                      {stage.leadsCount}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      AED {stage.totalValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                      {stage.conversionRate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Configuring SLA rules for ${stage.name}`)}
                        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                      >
                        Edit Stage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Stage */}
      {isAddStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add Pipeline Stage</h2>
                <p className="text-xs text-slate-500">Configure new sales pipeline lifecycle milestone</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStage} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stage Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Site Inspection Completed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SLA Target Turnaround (Hours)</label>
                <input
                  type="number"
                  value={formData.slaHours}
                  onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stage Theme Color</label>
                <select
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="bg-blue-500">Blue (Primary)</option>
                  <option value="bg-emerald-500">Emerald (Success)</option>
                  <option value="bg-purple-500">Purple (Evaluation)</option>
                  <option value="bg-amber-500">Amber (Pending Proposal)</option>
                  <option value="bg-rose-500">Rose (High Alert)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadStatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Lead Pipeline...</div>}>
      <LeadStatusContent />
    </Suspense>
  );
}
