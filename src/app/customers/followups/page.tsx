'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Clock,
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
  UserCheck,
  Check,
  Building,
  RotateCcw,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface CustomerFollowupItem {
  id: string;
  company: string;
  contactPerson: string;
  phone: string;
  purpose: 'AMC Contract Renewal' | 'Post-Service Satisfaction Check' | 'Invoice & Payment Follow-up' | 'Preventive Maintenance Audit' | 'Emergency Ticket Review';
  dueDate: string;
  dueTime: string;
  priority: 'Urgent' | 'High' | 'Normal';
  assignedRep: string;
  notes: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

const INITIAL_FOLLOWUPS: CustomerFollowupItem[] = [];

function CustomerFollowupsContent() {
  const [followups, setFollowups] = useState<CustomerFollowupItem[]>(INITIAL_FOLLOWUPS);
  const [filterTab, setFilterTab] = useState<'All' | 'Overdue' | 'Today' | 'Renewals' | 'Completed'>('All');
  const [search, setSearch] = useState('');
  const [repFilter, setRepFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    company: 'Al Futtaim Engineering',
    contactPerson: 'Eng. Tariq Al-Hashimi',
    phone: '+971 50 112 3344',
    purpose: 'AMC Contract Renewal' as const,
    dueDate: '2026-09-26',
    dueTime: '11:00 AM',
    priority: 'High' as const,
    assignedRep: 'Mohammed Rashid',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company) return;

    const newFollowup: CustomerFollowupItem = {
      id: `CFL-5${Math.floor(10 + Math.random() * 90)}`,
      company: formData.company,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      purpose: formData.purpose,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      priority: formData.priority,
      assignedRep: formData.assignedRep,
      notes: formData.notes || 'Scheduled customer retention check.',
      status: 'Pending',
    };

    setFollowups([newFollowup, ...followups]);
    setIsAddModalOpen(false);
    setFormData({
      company: 'Al Futtaim Engineering',
      contactPerson: 'Eng. Tariq Al-Hashimi',
      phone: '+971 50 112 3344',
      purpose: 'AMC Contract Renewal',
      dueDate: '2026-09-26',
      dueTime: '11:00 AM',
      priority: 'High',
      assignedRep: 'Mohammed Rashid',
      notes: '',
    });
    showToast(`Customer follow-up scheduled for ${newFollowup.company}!`);
  };

  const markCompleted = (id: string) => {
    setFollowups((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          showToast(`Follow-up with ${f.company} marked as Completed!`);
          return { ...f, status: 'Completed' };
        }
        return f;
      })
    );
  };

  const deleteFollowup = (id: string) => {
    setFollowups((prev) => prev.filter((f) => f.id !== id));
    showToast('Follow-up task deleted');
  };

  const filtered = useMemo(() => {
    return followups.filter((f) => {
      const matchSearch =
        f.company.toLowerCase().includes(search.toLowerCase()) ||
        f.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        f.notes.toLowerCase().includes(search.toLowerCase());

      const matchRep = repFilter === 'All' || f.assignedRep === repFilter;

      let matchTab = true;
      if (filterTab === 'Overdue') matchTab = f.status === 'Overdue';
      else if (filterTab === 'Today') matchTab = f.dueDate === '2026-09-25';
      else if (filterTab === 'Renewals') matchTab = f.purpose === 'AMC Contract Renewal' && f.status !== 'Completed';
      else if (filterTab === 'Completed') matchTab = f.status === 'Completed';

      return matchSearch && matchRep && matchTab;
    });
  }, [followups, search, repFilter, filterTab]);

  const totalOverdue = followups.filter((f) => f.status === 'Overdue').length;
  const todayDue = followups.filter((f) => f.dueDate === '2026-09-25' && f.status !== 'Completed').length;
  const amcRenewalsCount = followups.filter((f) => f.purpose === 'AMC Contract Renewal' && f.status !== 'Completed').length;

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
                <Clock className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Follow-ups &amp; Retention</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage proactive AMC contract renewals, post-service satisfaction calls, and client account health reviews.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Follow-up</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Follow-ups</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{followups.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Account Tasks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-rose-600">Overdue Retention</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{totalOverdue}</p>
          <span className="text-[11px] font-semibold text-rose-600">Immediate priority</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-600">Due Today</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{todayDue}</p>
          <span className="text-[11px] font-semibold text-amber-600">Scheduled touchpoints</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">AMC Renewals Due</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{amcRenewalsCount}</p>
          <span className="text-[11px] font-semibold text-purple-600">Key contract revenue</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Completed Follow-ups</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {followups.filter((f) => f.status === 'Completed').length}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600">Closed actions</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Overdue', 'Today', 'Renewals', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={cn(
                'flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                filterTab === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab === 'Today' ? 'Due Today' : tab === 'Renewals' ? 'AMC Renewals' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="All">All Account Reps</option>
            <option value="Mohammed Rashid">Mohammed Rashid</option>
            <option value="Alex Rivera">Alex Rivera</option>
            <option value="Sarah Al-Mansoor">Sarah Al-Mansoor</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Scheduled Customer Follow-up Pipeline</h2>
          <span className="text-xs text-slate-500">{filtered.length} Follow-ups</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer &amp; Contact</th>
                <th className="py-3 px-3">Follow-up Purpose</th>
                <th className="py-3 px-3">Scheduled Time</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3">Account Rep</th>
                <th className="py-3 px-3">Agenda &amp; Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{item.company}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{item.contactPerson} • {item.phone}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.purpose}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <p className="font-bold text-slate-800">{item.dueDate}</p>
                    <p className="text-[11px] text-slate-400">{item.dueTime}</p>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        item.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : item.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-medium text-slate-700">{item.assignedRep}</td>

                  <td className="py-3.5 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                    {item.notes}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'Completed' ? (
                        <button
                          type="button"
                          onClick={() => markCompleted(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 px-2">Completed</span>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteFollowup(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Follow-up"
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

      {/* MODAL: Schedule Customer Follow-up */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Schedule Customer Follow-up</h2>
                <p className="text-xs text-slate-500">Plan renewal review or post-service engagement</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-3.5 text-xs text-slate-700">
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
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Purpose</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="AMC Contract Renewal">AMC Contract Renewal</option>
                    <option value="Post-Service Satisfaction Check">Post-Service Satisfaction Check</option>
                    <option value="Invoice & Payment Follow-up">Invoice &amp; Payment Follow-up</option>
                    <option value="Preventive Maintenance Audit">Preventive Maintenance Audit</option>
                    <option value="Emergency Ticket Review">Emergency Ticket Review</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Urgent">Urgent (Renewal Overdue)</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Time</label>
                  <input
                    type="text"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agenda &amp; Discussion Points</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Note key talking points, proposal numbers, or contract clauses..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
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
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerFollowupsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customer Follow-ups...</div>}>
      <CustomerFollowupsContent />
    </Suspense>
  );
}
