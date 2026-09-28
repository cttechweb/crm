'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ListChecks,
  UserCheck,
  Users,
  UserPlus,
  Globe,
  Activity,
  Clock,
  Upload,
  FileText,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  X,
  Check,
  Trash2,
  Eye,
  ExternalLink,
  ChevronDown,
  Shield,
  Layers,
  ArrowRight,
  Flame,
  Kanban,
  FileSpreadsheet,
} from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { cn } from '@/lib/utils';

interface ManagerLead {
  id: string;
  leadName: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  source: 'Website Inbound' | 'Referral' | 'Direct Phone' | 'Field Campaign' | 'B2B Directory' | 'Google Ads';
  estimatedValue: number;
  assignedRep: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  rating: 'HOT' | 'WARM' | 'COLD';
  createdDate: string;
  nextFollowupDate?: string;
  notes?: string;
}

const INITIAL_MANAGER_LEADS: ManagerLead[] = [];

import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

const SALES_REPS = [
  { name: 'Alex Rivera (Ops Mgr)', role: 'Operations Manager', email: 'alex.rivera@cooltech.ae', capacity: '85%' },
  { name: 'Tariq Mansour', role: 'Senior HVAC Engineer', email: 'tariq.mansour@cooltech.ae', capacity: '70%' },
  { name: 'Zayed Al Qasimi', role: 'Commercial Sales Rep', email: 'zayed.qasimi@cooltech.ae', capacity: '90%' },
  { name: 'Bilal Ahmed', role: 'Industrial Cooling Specialist', email: 'bilal.ahmed@cooltech.ae', capacity: '60%' },
  { name: 'Sarah Al-Mansoor', role: 'Key Account Manager', email: 'sarah.mansoor@cooltech.ae', capacity: '75%' },
];

function ManagerLeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { leads: rawLeads, addLead, assignLead, deleteLead: removeLead } = useEnterpriseCrm();

  // Active view from URL query params (default to 'all')
  const viewParam = searchParams.get('view') || (searchParams.get('action') === 'assign' ? 'assign' : searchParams.get('action') === 'import' ? 'import' : 'all');

  const [activeTab, setActiveTab] = useState<string>(viewParam);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [repFilter, setRepFilter] = useState('All');
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);
  const [selectedRep, setSelectedRep] = useState('Tariq Mansour');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<ManagerLead | null>(null);

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(viewParam);
  }, [viewParam]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Convert rawLeads to ManagerLead format
  const leads: ManagerLead[] = useMemo(() => {
    return rawLeads.map((l) => ({
      id: l.id,
      leadName: l.leadSpecification || l.contactDetails?.name || 'Lead Inquiry',
      company: l.contactDetails?.company || 'N/A',
      contact: l.contactDetails?.name || 'N/A',
      phone: l.contactDetails?.phone || '',
      email: l.contactDetails?.email || '',
      source: (l.source || 'Website Inbound') as any,
      estimatedValue: l.value || 0,
      assignedRep: l.assignedEmployee || l.owner || l.leadAssigned?.name || 'Unassigned',
      status: (l.status || 'New') as any,
      rating: (l.rating || 'HOT') as any,
      createdDate: l.leadDate || new Date().toISOString().split('T')[0],
      notes: l.comments || '',
    }));
  }, [rawLeads]);

  // Form State for new lead
  const [formData, setFormData] = useState({
    leadName: '',
    company: '',
    contact: '',
    phone: '+971 50 ',
    email: '',
    source: 'Website Inbound' as const,
    estimatedValue: 150000,
    assignedRep: 'Tariq Mansour',
    rating: 'HOT' as const,
    notes: '',
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadName || !formData.company) return;

    addLead({
      leadDate: new Date().toISOString().split('T')[0],
      leadAssigned: { name: formData.assignedRep },
      assignedEmployee: formData.assignedRep,
      assignedManager: 'Alex Rivera (Operations Manager)',
      owner: formData.assignedRep,
      contactDetails: {
        name: formData.contact || formData.leadName,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
      },
      leadSpecification: formData.leadName,
      value: Number(formData.estimatedValue),
      rating: formData.rating,
      status: formData.assignedRep === 'Unassigned' ? 'New' : 'Qualified',
      source: formData.source,
      createdBy: 'Alex Rivera (Operations Manager)',
      lastActivity: 'Lead Created',
      comments: formData.notes,
    });

    setIsCreateModalOpen(false);
    setFormData({
      leadName: '',
      company: '',
      contact: '',
      phone: '+971 50 ',
      email: '',
      source: 'Website Inbound',
      estimatedValue: 150000,
      assignedRep: 'Tariq Mansour',
      rating: 'HOT',
      notes: '',
    });
    showToast(`Lead "${formData.leadName}" created successfully!`);
  };

  const handleAssignLead = (leadId: string, repName: string) => {
    assignLead(leadId, repName, 'Alex Rivera (Operations Manager)');
    setAssigningLeadId(null);
    showToast(`Lead assigned to ${repName}!`);
  };

  const deleteLead = (leadId: string) => {
    removeLead(leadId);
    showToast('Lead removed from CRM pipeline');
  };

  // Filtered Leads based on active tab & filters
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Tab based segregation
      if (activeTab === 'my') {
        if (!l.assignedRep.includes('Alex Rivera') && !l.assignedRep.includes('Ops Mgr')) return false;
      } else if (activeTab === 'team') {
        if (l.assignedRep === 'Unassigned') return false;
      } else if (activeTab === 'assign') {
        if (l.assignedRep !== 'Unassigned' && l.status !== 'New') return false;
      }

      // Search matching
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = l.leadName.toLowerCase().includes(q);
        const matchesCompany = l.company.toLowerCase().includes(q);
        const matchesContact = l.contact.toLowerCase().includes(q);
        const matchesRep = l.assignedRep.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesContact && !matchesRep) return false;
      }

      // Status Filter
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;

      // Source Filter
      if (sourceFilter !== 'All' && l.source !== sourceFilter) return false;

      // Rep Filter
      if (repFilter !== 'All' && l.assignedRep !== repFilter) return false;

      return true;
    });
  }, [leads, activeTab, search, statusFilter, sourceFilter, repFilter]);

  // Overall KPI Metrics
  const totalPipelineValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const myLeadsCount = leads.filter((l) => l.assignedRep.includes('Alex Rivera') || l.assignedRep.includes('Ops Mgr')).length;
  const myPipelineValue = leads
    .filter((l) => l.assignedRep.includes('Alex Rivera') || l.assignedRep.includes('Ops Mgr'))
    .reduce((sum, l) => sum + l.estimatedValue, 0);
  const unassignedCount = leads.filter((l) => l.assignedRep === 'Unassigned').length;
  const wonCount = leads.filter((l) => l.status === 'Won').length;

  return (
    <ManagerShell
      title="Lead Operations & Pipeline Hub"
      subtitle="Full operational oversight across all enterprise leads, sales engineer allocations, and deal conversion velocity."
    >
      <div className="w-full space-y-4 sm:space-y-6 pb-16">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ── 1. Top View Switcher Tabs ───────────────────────────────── */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Leads', icon: ListChecks, count: leads.length },
              { id: 'my', label: 'My Leads', icon: UserCheck, count: myLeadsCount },
              { id: 'team', label: 'Team Leads', icon: Users, count: leads.length - unassignedCount },
              { id: 'assign', label: 'Assign Queue', icon: UserPlus, count: unassignedCount, badgeColor: 'bg-rose-500 text-white' },
              { id: 'status', label: 'Pipeline Board', icon: Kanban },
              { id: 'sources', label: 'Lead Sources', icon: Globe },
              { id: 'followups', label: 'Follow-ups', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/manager/leads?view=${tab.id}`);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer select-none',
                    isActive
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-black',
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.badgeColor || 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Tailored KPI Metric Cards for Current View ─────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {activeTab === 'my' ? (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-slate-500">My Assigned Leads</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{myLeadsCount}</p>
                <span className="text-[11px] font-semibold text-blue-600">Operations Manager Portfolio</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-emerald-600">My Pipeline Value</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">AED {(myPipelineValue / 1000).toFixed(0)}k</p>
                <span className="text-[11px] font-semibold text-emerald-600">High-Probability Deals</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-purple-600">My Won Contracts</span>
                <p className="text-2xl font-black text-purple-600 mt-1">
                  {leads.filter((l) => (l.assignedRep.includes('Alex Rivera') || l.assignedRep.includes('Ops Mgr')) && l.status === 'Won').length}
                </p>
                <span className="text-[11px] font-semibold text-purple-600">Signed &amp; Onboarded</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-amber-600">Follow-up Tasks Due</span>
                <p className="text-2xl font-black text-amber-600 mt-1">2</p>
                <span className="text-[11px] font-semibold text-amber-600">Due Today</span>
              </div>
            </>
          ) : activeTab === 'team' ? (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-slate-500">Active Sales Engineers</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{SALES_REPS.length}</p>
                <span className="text-[11px] font-semibold text-slate-400">Field Technical Team</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-blue-600">Team Delegated Leads</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{leads.length - unassignedCount}</p>
                <span className="text-[11px] font-semibold text-blue-600">Active Allocations</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-emerald-600">Team Pipeline Value</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">AED {(totalPipelineValue / 1000).toFixed(0)}k</p>
                <span className="text-[11px] font-semibold text-emerald-600">Forecasted Revenue</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-purple-600">Avg. Team Conversion</span>
                <p className="text-2xl font-black text-purple-600 mt-1">34.2%</p>
                <span className="text-[11px] font-semibold text-purple-600">Above GCC CRM Index</span>
              </div>
            </>
          ) : activeTab === 'assign' ? (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-rose-600">Unassigned Lead Queue</span>
                <p className="text-2xl font-black text-rose-600 mt-1">{unassignedCount}</p>
                <span className="text-[11px] font-semibold text-rose-600">Needs Instant Allocation</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-slate-500">Available Sales Engineers</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{SALES_REPS.length}</p>
                <span className="text-[11px] font-semibold text-slate-400">Ready for Assignment</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-amber-600">Unassigned Deal Value</span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  AED {(leads.filter((l) => l.assignedRep === 'Unassigned').reduce((s, l) => s + l.estimatedValue, 0) / 1000).toFixed(0)}k
                </p>
                <span className="text-[11px] font-semibold text-amber-600">Pending Opportunity</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-emerald-600">Auto-Assign Assistant</span>
                <p className="text-xl font-black text-emerald-600 mt-1">Smart Match</p>
                <span className="text-[11px] font-semibold text-emerald-600">By territory &amp; capacity</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-slate-500">Total Leads in Pipeline</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{leads.length}</p>
                <span className="text-[11px] font-semibold text-slate-400">Commercial &amp; Industrial</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-blue-600">Total Estimated Value</span>
                <p className="text-2xl font-black text-blue-600 mt-1">AED {(totalPipelineValue / 1000).toFixed(0)}k</p>
                <span className="text-[11px] font-semibold text-blue-600">Forecasted Pipeline</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-emerald-600">Won Contracts</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{wonCount}</p>
                <span className="text-[11px] font-semibold text-emerald-600">Closed Deal Milestone</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs font-bold text-rose-600">Pending Assignment</span>
                <p className="text-2xl font-black text-rose-600 mt-1">{unassignedCount}</p>
                <span className="text-[11px] font-semibold text-rose-600">Unallocated Leads</span>
              </div>
            </>
          )}
        </div>

        {/* ── 3. Team Workload Breakdown Bar (Visible when activeTab === 'team') ── */}
        {activeTab === 'team' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1677FF]" />
              <span>Sales Engineers Workload &amp; Pipeline Distribution</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {SALES_REPS.map((rep, idx) => {
                const repLeads = leads.filter((l) => l.assignedRep.includes(rep.name.split(' ')[0]));
                const repValue = repLeads.reduce((s, l) => s + l.estimatedValue, 0);

                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-900 truncate">{rep.name.split(' ')[0]} {rep.name.split(' ')[1] || ''}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {rep.capacity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{rep.role}</p>
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-700">{repLeads.length} Leads</span>
                      <span className="font-bold text-emerald-700">AED {(repValue / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. Main Search & Filter Toolbar ─────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lead, company, contact, rep..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Sources</option>
                <option value="Website Inbound">Website Inbound</option>
                <option value="Referral">Referral</option>
                <option value="Direct Phone">Direct Phone</option>
                <option value="Field Campaign">Field Campaign</option>
                <option value="B2B Directory">B2B Directory</option>
                <option value="Google Ads">Google Ads</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Import CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Lead</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. Mobile Cards View (Screens < md) ────────────────────── */}
        <div className="block md:hidden space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
              No leads found in this view.
            </div>
          ) : (
            filteredLeads.map((l) => (
              <div
                key={l.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{l.leadName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{l.company}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-bold rounded-full uppercase',
                      l.status === 'New'
                        ? 'bg-rose-100 text-rose-800'
                        : l.status === 'Won'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {l.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Contact Person</span>
                    <span className="font-bold text-slate-800">{l.contact}</span>
                    <a href={`tel:${l.phone}`} className="text-[11px] text-blue-600 block mt-0.5">
                      {l.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Est. Deal Value</span>
                    <span className="font-black text-emerald-600 text-sm">
                      AED {l.estimatedValue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{l.source}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Engineer</span>
                    <span className="font-semibold text-slate-800">
                      {l.assignedRep === 'Unassigned' ? (
                        <span className="text-rose-600 font-bold">Unassigned</span>
                      ) : (
                        l.assignedRep
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingLead(l)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssigningLeadId(assigningLeadId === l.id ? null : l.id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Inline Re-assign dropdown for mobile */}
                {assigningLeadId === l.id && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <select
                      value={selectedRep}
                      onChange={(e) => setSelectedRep(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs flex-1"
                    >
                      {SALES_REPS.map((r, i) => (
                        <option key={i} value={r.name}>
                          {r.name} ({r.capacity})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAssignLead(l.id, selectedRep)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── 6. Desktop Leads Data Table (md and up) ──────────────────── */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#1677FF]" />
              <span>
                {activeTab === 'my'
                  ? 'My Assigned Operations Leads'
                  : activeTab === 'team'
                  ? 'Team Allocation Master Table'
                  : activeTab === 'assign'
                  ? 'Unassigned Leads Action Queue'
                  : 'Commercial Leads Directory'}
              </span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">{filteredLeads.length} Leads</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Opportunity Name &amp; ID</th>
                  <th className="py-3 px-3">Company / Client</th>
                  <th className="py-3 px-3 text-right">Est. Value (AED)</th>
                  <th className="py-3 px-3">Source Channel</th>
                  <th className="py-3 px-3">Assigned Rep</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <p className="text-slate-900">{l.leadName}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{l.id} • {l.createdDate}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{l.company}</p>
                      <p className="text-[11px] text-slate-400">{l.contact} ({l.phone})</p>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-emerald-700">
                      AED {l.estimatedValue.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {l.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {l.assignedRep === 'Unassigned' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          Unassigned
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900">{l.assignedRep}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                          l.status === 'New'
                            ? 'bg-rose-100 text-rose-800'
                            : l.status === 'Won'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {l.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {assigningLeadId === l.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={selectedRep}
                            onChange={(e) => setSelectedRep(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                          >
                            {SALES_REPS.map((r, i) => (
                              <option key={i} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAssignLead(l.id, selectedRep)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-xs"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssigningLeadId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingLead(l)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="View Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setAssigningLeadId(l.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteLead(l.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MODAL 1: Create New Lead ──────────────────────────────── */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create Commercial Lead</h2>
                  <p className="text-xs text-slate-500">Register incoming customer HVAC inquiry</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs text-slate-700">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 TR Chiller Plant Energy Retrofit"
                    value={formData.leadName}
                    onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company / Facility *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al Futtaim Engineering"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Eng. Tariq Al-Hashimi"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Direct Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimated Value (AED)</label>
                    <input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Source Channel</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="Website Inbound">Website Inbound</option>
                      <option value="Referral">Referral</option>
                      <option value="Direct Phone">Direct Phone</option>
                      <option value="Field Campaign">Field Campaign</option>
                      <option value="B2B Directory">B2B Directory</option>
                      <option value="Google Ads">Google Ads</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assign Sales Rep</label>
                    <select
                      value={formData.assignedRep}
                      onChange={(e) => setFormData({ ...formData, assignedRep: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="Unassigned">-- Leave in Assign Queue --</option>
                      {SALES_REPS.map((r, i) => (
                        <option key={i} value={r.name}>
                          {r.name}
                        </option>
                      ))}
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
                    className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                  >
                    Create Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL 2: Import CSV ───────────────────────────────────── */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Bulk Ingest Leads</h2>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 space-y-2 cursor-pointer">
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="font-bold text-xs text-slate-900">Drop your CSV or Excel file here</p>
                <p className="text-[10px] text-slate-400">Supports .CSV, .XLSX up to 25MB</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    showToast('Imported 45 leads into unassigned queue successfully!');
                  }}
                  className="w-full py-2 bg-[#1677FF] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Simulate Ingest &amp; Auto-Distribute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 3: View Details ─────────────────────────────────── */}
        {viewingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{viewingLead.leadName}</h2>
                  <p className="text-xs text-slate-500">{viewingLead.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingLead(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                  <p><strong>Contact:</strong> {viewingLead.contact}</p>
                  <p><strong>Phone:</strong> {viewingLead.phone}</p>
                  <p><strong>Email:</strong> {viewingLead.email}</p>
                  <p><strong>Assigned Engineer:</strong> {viewingLead.assignedRep}</p>
                  <p><strong>Est. Value:</strong> AED {viewingLead.estimatedValue.toLocaleString()}</p>
                </div>

                {viewingLead.notes && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900 mb-0.5">Operational Notes:</p>
                    <p className="text-blue-800 text-[11px]">{viewingLead.notes}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setViewingLead(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerShell>
  );
}

export default function ManagerLeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Manager Leads...</div>}>
      <ManagerLeadsContent />
    </Suspense>
  );
}
