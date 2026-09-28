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
  Phone,
  Mail,
  Calendar,
  Wrench,
  FileText,
  UserCheck,
  Building,
  Clock,
  ArrowRight,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface CustomerActivityItem {
  id: string;
  company: string;
  contactPerson: string;
  type: 'Site Inspection' | 'Service Review Meeting' | 'Technical Audit' | 'AMC Contract Discussion' | 'Emergency Service Call' | 'Preventive Maintenance';
  timestamp: string;
  repName: string;
  summary: string;
  outcome: string;
  badgeColor: string;
}

const INITIAL_ACTIVITIES: CustomerActivityItem[] = [];

function CustomerActivitiesContent() {
  const [activities, setActivities] = useState<CustomerActivityItem[]>(INITIAL_ACTIVITIES);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    company: 'Al Futtaim Engineering',
    contactPerson: 'Eng. Tariq Al-Hashimi',
    type: 'Site Inspection' as const,
    summary: '',
    outcome: '',
    repName: 'Mohammed Rashid',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.summary) return;

    const newActivity: CustomerActivityItem = {
      id: `ACT-9${activities.length + 10}`,
      company: formData.company,
      contactPerson: formData.contactPerson,
      type: formData.type,
      timestamp: 'Just now',
      repName: formData.repName,
      summary: formData.summary,
      outcome: formData.outcome || 'Logged successfully into customer timeline.',
      badgeColor:
        formData.type === 'Site Inspection'
          ? 'bg-blue-100 text-blue-800 border-blue-200'
          : formData.type === 'Service Review Meeting'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
          : 'bg-purple-100 text-purple-800 border-purple-200',
    };

    setActivities([newActivity, ...activities]);
    setIsAddModalOpen(false);
    setFormData({
      company: 'Al Futtaim Engineering',
      contactPerson: 'Eng. Tariq Al-Hashimi',
      type: 'Site Inspection',
      summary: '',
      outcome: '',
      repName: 'Mohammed Rashid',
    });
    showToast(`Activity logged for ${newActivity.company}!`);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast('Activity record removed');
  };

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch =
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.outcome.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'All' || a.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [activities, search, typeFilter]);

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
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Activities &amp; Timeline</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Track on-site engineering audits, quarterly service reviews, preventive maintenance visits, and contract renewals.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log New Activity</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Logged Activities</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activities.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Interaction Touchpoints</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Site Inspections</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {activities.filter((a) => a.type === 'Site Inspection').length}
          </p>
          <span className="text-[11px] font-semibold text-blue-600">Field MEP Audits</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Quarterly Reviews</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {activities.filter((a) => a.type === 'Service Review Meeting').length}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600">Executive Engagement</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Customer Satisfaction</span>
          <p className="text-2xl font-black text-purple-600 mt-1">98.4%</p>
          <span className="text-[11px] font-semibold text-purple-600">Service CSAT Index</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Activity Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none shadow-2xs min-w-[170px] cursor-pointer"
            >
              <option value="All">All Activity Types</option>
              <option value="Site Inspection">Site Inspection</option>
              <option value="Service Review Meeting">Service Review Meeting</option>
              <option value="Technical Audit">Technical Audit</option>
              <option value="AMC Contract Discussion">AMC Contract Discussion</option>
              <option value="Preventive Maintenance">Preventive Maintenance</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, contact, notes, outcome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Chronological Activity Log</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{filtered.length} Activities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp &amp; Rep</th>
                <th className="py-3 px-3">Company &amp; Stakeholder</th>
                <th className="py-3 px-3">Activity Type</th>
                <th className="py-3 px-3">Discussion Summary</th>
                <th className="py-3 px-3">Outcome &amp; Next Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{item.timestamp}</p>
                    <p className="text-[11px] text-slate-400 font-medium">👤 {item.repName}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">{item.company}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{item.contactPerson}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border', item.badgeColor)}>
                      {item.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-700 max-w-xs text-[11px]">
                    {item.summary}
                  </td>

                  <td className="py-3.5 px-3 text-emerald-800 font-semibold max-w-xs text-[11px]">
                    {item.outcome}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteActivity(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Log New Activity */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Log Customer Activity</h2>
                <p className="text-xs text-slate-500">Record field visit, service review, or audit findings</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Account *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Site Inspection">Site Inspection</option>
                    <option value="Service Review Meeting">Service Review Meeting</option>
                    <option value="Technical Audit">Technical Audit</option>
                    <option value="AMC Contract Discussion">AMC Contract Discussion</option>
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Representative</label>
                  <input
                    type="text"
                    value={formData.repName}
                    onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Summary &amp; Discussion *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Details of the interaction, technical parameters tested..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Outcome / Agreed Next Step</label>
                <input
                  type="text"
                  placeholder="e.g. Approved quote, scheduled follow-up on 28th..."
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
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
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerActivitiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customer Activities...</div>}>
      <CustomerActivitiesContent />
    </Suspense>
  );
}
