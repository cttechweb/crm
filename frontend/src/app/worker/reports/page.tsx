'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Users,
  CheckSquare,
  Calendar,
  AlertCircle,
  Tag,
  Phone,
  Mail,
  Shield,
  Eye,
  Filter,
  X,
  UserCheck,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmTask, CrmLead } from '@/types/enterprise-crm';

type ReportTab = 'tasks' | 'leads' | 'summary';

function WorkerReportsContent() {
  const { tasks: crmTasks, leads: crmLeads } = useEnterpriseCrm();
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);

  const [activeTab, setActiveTab] = useState<ReportTab>('tasks');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected item for clean detail view modal
  const [viewingTask, setViewingTask] = useState<CrmTask | null>(null);
  const [viewingLead, setViewingLead] = useState<CrmLead | null>(null);

  useEffect(() => {
    const user = authMockService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  // Filter Tasks assigned to or relevant to this employee
  const employeeTasks = useMemo(() => {
    const userName = currentUser?.name?.trim().toLowerCase() || '';
    const role = String(currentUser?.role || '').toLowerCase();

    return crmTasks.filter((t) => {
      if (!userName || role.includes('admin')) return true;
      const assignee = (t.assignedEmployee || t.assignee?.name || '').trim().toLowerCase();
      const creator = (t.createdBy || t.assignedBy || '').trim().toLowerCase();
      return assignee.includes(userName) || userName.includes(assignee) || creator.includes(userName);
    });
  }, [crmTasks, currentUser]);

  // Filter Leads assigned to or relevant to this employee
  const employeeLeads = useMemo(() => {
    const userName = currentUser?.name?.trim().toLowerCase() || '';
    const role = String(currentUser?.role || '').toLowerCase();

    return crmLeads.filter((lead) => {
      if (!userName || role.includes('admin')) return true;
      const owner = (lead.owner || lead.leadAssigned?.name || '').trim().toLowerCase();
      const createdBy = (lead.createdBy || '').trim().toLowerCase();
      const assignedEmp = (lead.assignedEmployee || '').trim().toLowerCase();
      return (
        owner.includes(userName) ||
        userName.includes(owner) ||
        createdBy.includes(userName) ||
        assignedEmp.includes(userName)
      );
    });
  }, [crmLeads, currentUser]);

  // Filtered Tasks list
  const filteredTasks = useMemo(() => {
    return employeeTasks.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (dateFilter && !t.dueDate?.includes(dateFilter) && !t.createdAt?.includes(dateFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (t.title || t.taskDetails || '').toLowerCase().includes(q);
        const matchesCustomer = (t.customer || '').toLowerCase().includes(q);
        const matchesManager = (t.assignedBy || t.createdBy || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCustomer && !matchesManager) return false;
      }
      return true;
    });
  }, [employeeTasks, statusFilter, dateFilter, searchQuery]);

  // Filtered Leads list
  const filteredLeads = useMemo(() => {
    return employeeLeads.filter((l) => {
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (dateFilter && !l.leadDate?.includes(dateFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (l.contactDetails?.name || '').toLowerCase().includes(q);
        const matchesCompany = (l.contactDetails?.company || '').toLowerCase().includes(q);
        const matchesPhone = (l.contactDetails?.phone || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesPhone) return false;
      }
      return true;
    });
  }, [employeeLeads, statusFilter, dateFilter, searchQuery]);

  // Calculated Stats
  const totalTasks = employeeTasks.length;
  const completedTasks = employeeTasks.filter((t) => t.status === 'Completed' || t.progress === 100).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalLeads = employeeLeads.length;
  const convertedLeads = employeeLeads.filter((l) => l.status === 'Converted').length;

  // Export CSV
  const handleExportCsv = () => {
    if (activeTab === 'tasks') {
      const headers = 'SL,Task Title,Customer,Assigned By,Due Date,Time,Priority,Status\n';
      const rows = filteredTasks
        .map(
          (t, i) =>
            `"${i + 1}","${(t.title || t.taskDetails || '').replace(/"/g, '""')}","${t.customer || ''}","${t.assignedBy || t.createdBy || ''}","${t.dueDate || ''}","${t.dueTime || ''}","${t.priority || ''}","${t.status}"`
        )
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tasks_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = 'SL,Contact Name,Company,Phone,Email,Owner,Rating,Status,Lead Date\n';
      const rows = filteredLeads
        .map(
          (l, i) =>
            `"${i + 1}","${l.contactDetails?.name || ''}","${l.contactDetails?.company || ''}","${l.contactDetails?.phone || ''}","${l.contactDetails?.email || ''}","${l.owner || ''}","${l.rating}","${l.status}","${l.leadDate}"`
        )
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── 1. Top Summary Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalTasks}</div>
          <div className="text-xs text-slate-400 mt-0.5">Assigned to your profile</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{completedTasks}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-0.5">
            {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% Complete` : '100% On Track'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending / Open</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{pendingTasks}</div>
          <div className="text-xs text-slate-400 mt-0.5">Requires action or in progress</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Leads</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">{totalLeads}</div>
          <div className="text-xs text-indigo-600 font-semibold mt-0.5">
            {convertedLeads > 0 ? `${convertedLeads} Converted` : 'Active pipeline'}
          </div>
        </div>
      </div>

      {/* ── 2. Tab Navigation & Action Controls ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActiveTab('tasks');
              setStatusFilter('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks Report ({employeeTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('leads');
              setStatusFilter('ALL');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Leads Report ({employeeLeads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-[#002B49] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Performance Summary</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {activeTab !== 'summary' && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar (for Tasks & Leads) ── */}
      {activeTab !== 'summary' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'tasks' ? 'Search by task title, customer, or manager...' : 'Search by contact name, company, or phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-600 cursor-pointer w-full sm:w-44"
            >
              <option value="ALL">All Status</option>
              {activeTab === 'tasks' ? (
                <>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Pending">Pending</option>
                </>
              ) : (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* ── 4. TAB CONTENT: Tasks Report Table ── */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Assigned Tasks List ({filteredTasks.length})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time tasks assigned by Sales &amp; Marketing managers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F1F5F9] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Task Details / Title</th>
                  <th className="py-3 px-4">Client / Customer</th>
                  <th className="py-3 px-4">Assigned Manager</th>
                  <th className="py-3 px-4">Due Date &amp; Time</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                      No tasks found matching your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t, idx) => {
                    const isDone = t.status === 'Completed' || t.progress === 100;
                    const isInProgress = t.status === 'In Progress';
                    const managerName = t.assignedBy || t.createdBy || 'Manager';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-500">#{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 leading-snug">
                            {t.title || t.taskDetails}
                          </div>
                          {t.taskUnder && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{t.taskUnder}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t.customer || 'Enterprise Client'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{managerName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          <div>📅 {t.dueDate || 'Today'}</div>
                          {t.dueTime && <div className="text-slate-400">⏰ {t.dueTime}</div>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.priority === 'High' || t.priority === 'Urgent'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingTask(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. TAB CONTENT: Leads Report Table ── */}
      {activeTab === 'leads' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Assigned Leads List ({filteredLeads.length})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Live prospect pipeline assigned to your profile
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F1F5F9] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Contact Name &amp; Company</th>
                  <th className="py-3 px-4">Contact Numbers</th>
                  <th className="py-3 px-4">Lead Date</th>
                  <th className="py-3 px-4">Owner / Assigned</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                      No leads found matching your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-700 uppercase">
                          {l.contactDetails?.name || 'Prospect Contact'}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 mt-0.5">
                          <Shield className="w-3 h-3 text-red-600 shrink-0" />
                          <span>{l.contactDetails?.company || 'Enterprise Client'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        <div>{l.contactDetails?.phone || '—'}</div>
                        {l.contactDetails?.email && (
                          <div className="text-slate-400 text-[10px] truncate max-w-[160px] font-sans">
                            {l.contactDetails.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{l.leadDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{l.owner}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.rating === 'Hot'
                              ? 'bg-red-100 text-red-700'
                              : l.rating === 'Warm'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {l.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            l.status === 'Converted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'Contacted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingLead(l)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. TAB CONTENT: Summary & Performance Breakdown ── */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Tasks Execution Breakdown</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Completed Tasks</span>
                  <span className="text-emerald-600">{completedTasks} / {totalTasks}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Pending / In Progress Tasks</span>
                  <span className="text-amber-600">{pendingTasks} / {totalTasks}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Employee Account Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Employee Name</span>
                <span className="font-bold text-slate-900">{currentUser?.name || 'Employee Profile'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Department / Designation</span>
                <span className="font-bold text-slate-900">{currentUser?.designation || currentUser?.department || 'Operations Specialist'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Leads Assigned</span>
                <span className="font-bold text-indigo-600">{totalLeads} Prospects</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">System Status</span>
                <span className="font-bold text-emerald-600">Active &amp; Connected ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Clean Task Detail View ── */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-[#FAFBFD] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Task Summary Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Task Title / Action</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{viewingTask.title || viewingTask.taskDetails}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Client / Customer</span>
                  <span className="font-bold text-slate-800">{viewingTask.customer || 'Enterprise Client'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Assigned By</span>
                  <span className="font-bold text-blue-700">{viewingTask.assignedBy || viewingTask.createdBy || 'Manager'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Due Date</span>
                  <span className="font-semibold text-slate-800 font-mono">{viewingTask.dueDate || 'Today'} {viewingTask.dueTime && `(${viewingTask.dueTime})`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Status</span>
                  <span className="font-bold text-emerald-600">{viewingTask.status}</span>
                </div>
              </div>

              {viewingTask.description && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Instructions / Description</span>
                  <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    {viewingTask.description}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="px-4 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Clean Lead Detail View ── */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-[#FAFBFD] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lead Information Summary</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Name</span>
                <div className="font-bold text-slate-900 text-base mt-0.5">{viewingLead.contactDetails?.name}</div>
                <div className="font-semibold text-slate-600 mt-0.5">{viewingLead.contactDetails?.company}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone Number</span>
                  <span className="font-bold text-slate-800 font-mono">{viewingLead.contactDetails?.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email Address</span>
                  <span className="font-medium text-slate-700 truncate block">{viewingLead.contactDetails?.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Lead Rating</span>
                  <span className="font-bold text-blue-600">{viewingLead.rating}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Lead Status</span>
                  <span className="font-bold text-emerald-600">{viewingLead.status}</span>
                </div>
              </div>

              {viewingLead.leadSpecification && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Requirement / Specification</span>
                  <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    {viewingLead.leadSpecification}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold transition-colors cursor-pointer"
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

export default function WorkerReportsPage() {
  return (
    <WorkerShell
      title="CRM Activity & Performance Reports"
      subtitle="Real-time performance summary, assigned tasks, and lead progression"
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading reports...</div>}>
        <WorkerReportsContent />
      </Suspense>
    </WorkerShell>
  );
}
