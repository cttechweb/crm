'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  Flame,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  MessageSquare,
  Edit2,
  Tag,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';

export default function EmployeeLeadsPage() {
  const { leads, updateLead } = useEnterpriseCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState<LeadStatus>('Contacted');

  // Filter leads assigned to the employee or all operational leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.contactDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactDetails.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactDetails.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesRating = ratingFilter === 'All' || lead.rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [leads, searchQuery, statusFilter, ratingFilter]);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    updateLead(selectedLead.id, {
      status: newStatus,
      comments: statusNote
        ? `${selectedLead.comments || ''}\n[${new Date().toLocaleDateString()}] ${statusNote}`.trim()
        : selectedLead.comments,
    });

    setSelectedLead(null);
    setStatusNote('');
  };

  return (
    <WorkerShell
      title="My Leads"
      subtitle="View, track, and update your assigned sales leads and maintenance inquiries"
    >
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by contact name, company, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All Ratings</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
              No assigned leads found matching your criteria.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{lead.contactDetails.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {lead.contactDetails.company}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lead.rating === 'Hot'
                            ? 'bg-rose-100 text-rose-700'
                            : lead.rating === 'Warm'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {lead.rating}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {lead.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${lead.contactDetails.phone}`} className="font-semibold text-[#2563EB]">
                        {lead.contactDetails.phone}
                      </a>
                    </div>
                    {lead.contactDetails.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Email:</span>
                        <a href={`mailto:${lead.contactDetails.email}`} className="text-slate-700 truncate max-w-[160px]">
                          {lead.contactDetails.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lead Date:</span>
                      <span>{lead.leadDate}</span>
                    </div>
                  </div>

                  {lead.comments && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/60 border border-amber-100 rounded-lg p-2 line-clamp-2">
                      "{lead.comments}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${lead.contactDetails.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLead(lead);
                      setNewStatus(lead.status);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Update Lead Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Update Lead: {selectedLead.contactDetails.name}</h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Follow-up Note / Activity</label>
                  <textarea
                    rows={3}
                    placeholder="Log details of the phone call or site visit..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-blue-700"
                  >
                    Save Changes
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
