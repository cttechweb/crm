'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PhoneCall, Calendar, Mail, MessageSquare, Plus, Search, CheckCircle2, Clock, X, Trash2 } from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  contactPerson: string;
  client: string;
  time: string;
  date: string;
  status: string;
  notes?: string;
}

export default function ManagerActivitiesPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'All';
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState(typeParam);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'Site Visit',
    title: '',
    client: '',
    contactPerson: '',
    time: '10:00 AM',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('crm_manager_activities');
      if (stored) {
        setActivities(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveActivities = (list: ActivityItem[]) => {
    setActivities(list);
    try {
      localStorage.setItem('crm_manager_activities', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.client) return;

    const newItem: ActivityItem = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      type: form.type,
      title: form.title,
      client: form.client,
      contactPerson: form.contactPerson || 'Facility Lead',
      time: form.time,
      date: form.date,
      status: 'Scheduled',
      notes: form.notes,
    };

    saveActivities([newItem, ...activities]);
    setIsAddModalOpen(false);
    showToast(`Activity "${form.title}" logged successfully!`);
    setForm({
      type: 'Site Visit',
      title: '',
      client: '',
      contactPerson: '',
      time: '10:00 AM',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleDeleteActivity = (id: string) => {
    saveActivities(activities.filter((a) => a.id !== id));
    showToast('Activity record removed');
  };

  const filtered = activities.filter((a) => {
    const matchType = filterType === 'All' || a.type.toLowerCase() === filterType.toLowerCase() || a.type === filterType;
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      a.client.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <ManagerShell
      title="Field Activities & Communication Hub"
      subtitle="Track customer calls, site visits, management meetings, and operational follow-ups"
    >
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search activities or contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Calls">Calls</option>
              <option value="Meetings">Meetings</option>
              <option value="Emails">Emails</option>
              <option value="Follow-ups">Follow-ups</option>
              <option value="Site Visit">Site Visits</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Activity</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No activity logs recorded. Click <strong>+ Log Activity</strong> to register a site visit, call, or meeting.
            </div>
          ) : (
            filtered.map((act) => (
              <div key={act.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                  {act.type === 'Calls' ? (
                    <PhoneCall className="w-4 h-4" />
                  ) : act.type === 'Emails' ? (
                    <Mail className="w-4 h-4" />
                  ) : act.type === 'Site Visit' ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{act.title}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          act.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {act.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(act.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {act.client} · <span className="text-slate-500">{act.contactPerson}</span>
                  </p>
                  {act.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                      {act.notes}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {act.time}
                    </span>
                    <span>{act.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Log Operational Activity</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  placeholder="e.g. Emergency Site Inspection for Chiller"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Site Visit">Site Visit</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Calls">Calls</option>
                    <option value="Emails">Emails</option>
                    <option value="Follow-ups">Follow-ups</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client / Facility *</label>
                  <input
                    type="text"
                    required
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="e.g. Yas Marina Commercial Center"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="Eng. Khalid Al Mazrouei"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="11:30 AM"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  placeholder="Key discussion points, findings, or next actions..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}
