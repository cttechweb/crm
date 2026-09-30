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
  MessageSquare,
  Calendar,
  UserCheck,
  Check,
  Building,
  ArrowRight,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface LeadFollowupItem {
  id: string;
  leadId: string;
  contactName: string;
  company: string;
  phone: string;
  type: 'Phone Call' | 'Site Visit' | 'WhatsApp Chat' | 'Proposal Review' | 'AMC Contract Discussion';
  dueDate: string;
  dueTime: string;
  priority: 'Urgent' | 'High' | 'Normal';
  assignedRep: string;
  notes: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled';
}

const INITIAL_FOLLOWUPS: LeadFollowupItem[] = [];

function FollowupsContent() {
  const { users, leads } = useEnterpriseCrm();
  const [followups, setFollowups] = useState<LeadFollowupItem[]>(INITIAL_FOLLOWUPS);
  const [filterTab, setFilterTab] = useState<'All' | 'Overdue' | 'Today' | 'Upcoming' | 'Completed'>('All');
  const [search, setSearch] = useState('');
  const [repFilter, setRepFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    contactName: '',
    company: '',
    phone: '+971 50 ',
    type: 'Phone Call' as const,
    dueDate: '2026-09-29',
    dueTime: '10:00 AM',
    priority: 'High' as const,
    assignedRep: 'Manager',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName) return;

    const newFollowup: LeadFollowupItem = {
      id: `FLP-${Math.floor(100 + Math.random() * 900)}`,
      leadId: `LD-${Math.floor(100 + Math.random() * 900)}`,
      contactName: formData.contactName,
      company: formData.company,
      phone: formData.phone,
      type: formData.type,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      priority: formData.priority,
      assignedRep: formData.assignedRep,
      notes: formData.notes || 'Scheduled lead follow-up.',
      status: 'Pending',
    };

    setFollowups([newFollowup, ...followups]);
    setIsAddModalOpen(false);
    setFormData({
      contactName: '',
      company: '',
      phone: '+971 50 ',
      type: 'Phone Call',
      dueDate: '2026-09-26',
      dueTime: '10:00 AM',
      priority: 'High',
      assignedRep: 'Mohammed Rashid',
      notes: '',
    });
    showToast(`Follow-up scheduled with ${newFollowup.contactName}!`);
  };

  const markCompleted = (id: string) => {
    setFollowups((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          showToast(`Follow-up with ${f.contactName} marked as Completed!`);
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
        f.contactName.toLowerCase().includes(search.toLowerCase()) ||
        f.company.toLowerCase().includes(search.toLowerCase()) ||
        f.notes.toLowerCase().includes(search.toLowerCase());

      const matchRep = repFilter === 'All' || f.assignedRep === repFilter;

      let matchTab = true;
      if (filterTab === 'Overdue') matchTab = f.status === 'Overdue';
      else if (filterTab === 'Today') matchTab = f.dueDate === '2026-09-25';
      else if (filterTab === 'Upcoming') matchTab = f.dueDate > '2026-09-25' && f.status !== 'Completed';
      else if (filterTab === 'Completed') matchTab = f.status === 'Completed';

      return matchSearch && matchRep && matchTab;
    });
  }, [followups, search, repFilter, filterTab]);

  const totalOverdue = followups.filter((f) => f.status === 'Overdue').length;
  const todayDue = followups.filter((f) => f.dueDate === '2026-09-25' && f.status !== 'Completed').length;
  const completedCount = followups.filter((f) => f.status === 'Completed').length;

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
              <div className="p-1 rounded bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lead Follow-ups</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Schedule, track, and execute high-priority calls, site inspections, and proposal reviews.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
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
          <span className="text-[11px] font-semibold text-slate-400">Scheduled activities</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-rose-600">Overdue Alerts</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{totalOverdue}</p>
          <span className="text-[11px] font-semibold text-rose-600">Requires instant action</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-600">Due Today</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{todayDue}</p>
          <span className="text-[11px] font-semibold text-amber-600">Calls &amp; Site visits</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Upcoming This Week</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {followups.filter((f) => f.dueDate > '2026-09-25' && f.status !== 'Completed').length}
          </p>
          <span className="text-[11px] font-semibold text-blue-600">Pipeline tasks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Completed Follow-ups</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Successfully closed</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Overdue', 'Today', 'Upcoming', 'Completed'] as const).map((tab) => (
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
              {tab === 'Today' ? 'Due Today' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="All">All Representatives</option>
            {users.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name} ({u.role})
              </option>
            ))}
            <option value="Manager">Manager</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contact, company, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Follow-ups List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Scheduled Follow-up Tasks</h2>
          <span className="text-xs text-slate-500">{filtered.length} Tasks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Lead Contact &amp; Company</th>
                <th className="py-3 px-3">Follow-up Type</th>
                <th className="py-3 px-3">Scheduled Time</th>
                <th className="py-3 px-3 text-center">Priority</th>
                <th className="py-3 px-3">Assigned Rep</th>
                <th className="py-3 px-3">Agenda &amp; Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{item.contactName}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{item.company} • {item.phone}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.type}
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs"
                          title="Mark Done"
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

      {/* MODAL: Schedule Follow-up */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Schedule Lead Follow-up</h2>
                <p className="text-xs text-slate-500">Assign task, timing, and agenda for client engagement</p>
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eng. Tariq Al-Hashimi"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Facility</label>
                  <input
                    type="text"
                    placeholder="e.g. Al Futtaim Engineering"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="Site Visit">On-Site Inspection</option>
                    <option value="WhatsApp Chat">WhatsApp Chat</option>
                    <option value="Proposal Review">Proposal Review</option>
                    <option value="AMC Contract Discussion">AMC Contract Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Urgent">Urgent (Overdue Risk)</option>
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
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 03:30 PM"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Representative *</label>
                <select
                  value={formData.assignedRep}
                  onChange={(e) => setFormData({ ...formData, assignedRep: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="Manager">Manager (Sales Manager)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agenda / Discussion Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Note key talking points, technical parameters, or quotation items..."
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
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
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

export default function LeadFollowupsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Follow-ups...</div>}>
      <FollowupsContent />
    </Suspense>
  );
}
