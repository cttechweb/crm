'use client';

import React, { useState } from 'react';
import {
  ListChecks,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Search,
  Filter,
  MessageSquare,
  FileText,
  User,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';

interface ActivityItem {
  id: string;
  type: 'Call' | 'Site Visit' | 'Inspection' | 'Service Note';
  title: string;
  client: string;
  timestamp: string;
  notes: string;
  outcome: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [];

export default function EmployeeActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [formData, setFormData] = useState({
    type: 'Site Visit' as ActivityItem['type'],
    title: '',
    client: '',
    notes: '',
    outcome: 'Completed',
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.client) return;

    const newAct: ActivityItem = {
      id: `act_${Date.now()}`,
      type: formData.type,
      title: formData.title,
      client: formData.client,
      timestamp: 'Just now',
      notes: formData.notes,
      outcome: formData.outcome,
    };

    setActivities([newAct, ...activities]);
    setShowAddModal(false);
    setFormData({
      type: 'Site Visit',
      title: '',
      client: '',
      notes: '',
      outcome: 'Completed',
    });
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'All' || act.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <WorkerShell
      title="My Activities"
      subtitle="Log site visits, diagnostic recordings, client communications, and maintenance progress"
    >
      <div className="space-y-4">
        {/* Top Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity notes, client, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Types</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Inspection">Inspection</option>
              <option value="Call">Call</option>
              <option value="Service Note">Service Note</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Activity</span>
            </button>
          </div>
        </div>

        {/* Activities Timeline List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No activity logs found.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    act.type === 'Site Visit'
                      ? 'bg-blue-50 text-[#2563EB]'
                      : act.type === 'Inspection'
                      ? 'bg-purple-50 text-purple-600'
                      : act.type === 'Call'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {act.type === 'Site Visit' && <MapPin className="w-4 h-4" />}
                  {act.type === 'Inspection' && <ListChecks className="w-4 h-4" />}
                  {act.type === 'Call' && <Phone className="w-4 h-4" />}
                  {act.type === 'Service Note' && <FileText className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{act.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {act.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {act.client}
                  </p>

                  <p className="text-xs text-slate-600 pt-0.5 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    {act.notes}
                  </p>

                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Outcome: {act.outcome}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Activity Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Log New Activity</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Site Visit">Site Visit</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Call">Phone Call</option>
                    <option value="Service Note">Service Note</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Title / Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Completed AHU Blower Belt Inspection"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Facility Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Futtaim Logistics Hub"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Notes & Observations</label>
                  <textarea
                    rows={3}
                    placeholder="Record key findings, parts used, or client feedback..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Outcome Status</label>
                  <input
                    type="text"
                    placeholder="e.g. Completed, Follow-up Required, Approved"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-blue-700"
                  >
                    Submit Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
