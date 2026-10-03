'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Sun,
  ClipboardList,
  CheckCircle2,
  Clock,
  BarChart2,
  ChevronRight,
  Play,
  Check,
  FileText,
  Building2,
  MapPin,
  Truck,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { filterQuotationsByScope } from '@/services/crmDataScopeService';
import { CrmTask, CrmLead, CrmCustomer, CrmQuotation } from '@/types/enterprise-crm';

export default function EmployeeDashboardPage() {
  const {
    tasks: allTasks,
    leads: allLeads,
    customers: allCustomers,
    salesOpportunities: allDeals,
    quotations: allQuotations,
    users,
    updateTask,
  } = useEnterpriseCrm();

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [userName, setUserName] = useState('Employee');
  const [currentTimeStr, setCurrentTimeStr] = useState('08:00 AM');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    setMounted(true);
    const user = authMockService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.name) setUserName(user.name);
    }

    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours();
      if (hrs < 12) setGreeting('Good Morning');
      else if (hrs < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
      setCurrentDateStr(now.toLocaleDateString('en-US', options));

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTimeStr(now.toLocaleTimeString('en-US', timeOptions));
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center text-slate-400 text-xs">
        Loading Live Dashboard...
      </div>
    );
  }

  // Filter tasks assigned to current user
  const userTasks = (allTasks || []).filter(
    (t: CrmTask) =>
      !currentUser?.name ||
      t.assignee?.name?.toLowerCase() === currentUser.name.toLowerCase()
  );

  const completedTasks = userTasks.filter(
    (t) => t.status === 'Completed' || t.status === 'Done'
  );
  const inProgressTasks = userTasks.filter(
    (t) => t.status === 'In Progress' || t.status === 'Accepted'
  );
  const pendingTasks = userTasks.filter(
    (t) => t.status === 'Pending' || t.status === 'Assigned' || !t.status
  );

  const totalCount = userTasks.length;
  const completedCount = completedTasks.length;
  const inProgressCount = inProgressTasks.length;
  const pendingCount = pendingTasks.length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Active task: first in progress task, or first pending task
  const activeTask = inProgressTasks[0] || pendingTasks[0] || userTasks[0] || null;

  // Filter assigned leads & customers
  const userLeads = (allLeads || []).filter(
    (l: CrmLead) =>
      !currentUser?.name ||
      l.leadAssigned?.name?.toLowerCase() === currentUser.name.toLowerCase() ||
      l.owner?.toLowerCase() === currentUser.name.toLowerCase() ||
      l.assignedEmployee?.toLowerCase() === currentUser.name.toLowerCase()
  );

  const userCustomers = (allCustomers || []).slice(0, 4);
  const userQuotations = filterQuotationsByScope(allQuotations || [], currentUser, users);

  const handleStartTask = (taskId: string) => {
    updateTask(taskId, { status: 'In Progress', progress: 30 });
  };

  const handleCompleteTask = (taskId: string) => {
    updateTask(taskId, { status: 'Completed', progress: 100 });
  };

  const initialLetter = userName.charAt(0).toUpperCase() || 'E';

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-12 overflow-x-hidden">
      {/* ── 1. TOP GREETING BANNER ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: User Avatar & Greeting */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#002B49] to-[#0284C7] text-white font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-2xs">
            {initialLetter}
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>{greeting}, {userName}!</span>
              <span className="text-amber-500">☀️</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              You have <span className="font-bold text-slate-800">{pendingCount + inProgressCount} active tasks</span> scheduled. Keep going — you&apos;re doing great!
            </p>
          </div>
        </div>

        {/* Right: Live Date/Time & Status Badges */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="flex-1 sm:flex-initial flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <div className="text-blue-600">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-xs font-bold text-slate-900 whitespace-nowrap">{currentDateStr}</div>
              <div className="text-[11px] text-slate-400 font-medium">{currentTimeStr}</div>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <div className="text-amber-500">
              <Sun className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-xs font-bold text-slate-900 whitespace-nowrap">Dubai, UAE</div>
              <div className="text-[11px] text-slate-400 font-medium">31°C • Sunny</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TOP 4 LIVE KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: My Tasks */}
        <Link
          href="/worker/tasks"
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all flex items-start gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Tasks</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              {pendingCount} pending • {inProgressCount} active
            </p>
          </div>
        </Link>

        {/* Metric 2: Completed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Completed</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : '100%'}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">of {totalCount} total</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Pending */}
        <Link
          href="/worker/tasks?status=Pending"
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all flex items-start gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Pending</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">tasks remaining</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full"
                style={{ width: `${totalCount > 0 ? (pendingCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Link>

        {/* Metric 4: My Performance / Completion Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-start gap-3.5 group">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Completion Rate</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{completionRate}%</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {completedCount} of {totalCount} completed
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION: LIVE TODAY'S TASKS TABLE + CURRENT ACTIVE TASK CARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column (8 cols): Live Assigned Tasks Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Assigned Tasks</h2>
                  <p className="text-xs text-slate-400">Live task queue from your operations schedule</p>
                </div>
              </div>
              <Link
                href="/worker/tasks"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All ({userTasks.length})
              </Link>
            </div>

            {/* Table Container */}
            {userTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No tasks currently assigned to you.</p>
                <p className="text-slate-400">New assignments from your manager will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-2 -mx-4 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[580px] sm:min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                      <th className="py-2.5 px-3 sm:px-4">Time / Due</th>
                      <th className="py-2.5 px-3 sm:px-4">Task Details</th>
                      <th className="py-2.5 px-3 sm:px-4">Customer / Site</th>
                      <th className="py-2.5 px-3 sm:px-4">Status</th>
                      <th className="py-2.5 px-3 sm:px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {userTasks.slice(0, 5).map((task) => {
                      const isDone = task.status === 'Completed' || task.status === 'Done';
                      const isInProg = task.status === 'In Progress' || task.status === 'Accepted';

                      return (
                        <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 sm:px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                            {task.dueDate || 'Today'} {task.dueTime ? `• ${task.dueTime}` : ''}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="font-bold text-slate-900 block">{task.taskDetails || task.taskType || 'Task'}</span>
                            {task.priority && (
                              <span className="text-[10px] text-slate-400">Priority: {task.priority}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-600">
                            {task.customer || task.location || 'Cool Tech Customer'}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isInProg
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {task.status || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                            {isDone ? (
                              <Link
                                href={`/worker/tasks`}
                                className="inline-flex items-center justify-center px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                              >
                                View
                              </Link>
                            ) : isInProg ? (
                              <button
                                type="button"
                                onClick={() => handleCompleteTask(task.id)}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartTask(task.id)}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-[#002B49] hover:bg-[#001E33] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Start</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Live Current / Active Task Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          {activeTask ? (
            <div className="space-y-3.5">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Current Task</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    activeTask.status === 'Completed' || activeTask.status === 'Done'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : activeTask.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {activeTask.status || 'ACTIVE'}
                </span>
              </div>

              {/* Task Title & Details */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {activeTask.taskDetails || activeTask.taskType || 'Field Operation Milestone'}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {activeTask.customer || activeTask.location || 'Cool Tech Operations'}
                    </span>
                  </div>
                  {activeTask.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{activeTask.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Due: {activeTask.dueDate || 'Today'} {activeTask.dueTime ? `at ${activeTask.dueTime}` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Progress</span>
                  <span className="font-bold text-blue-600">
                    {activeTask.status === 'Completed' ? '100%' : activeTask.status === 'In Progress' ? '50%' : '10%'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width:
                        activeTask.status === 'Completed'
                          ? '100%'
                          : activeTask.status === 'In Progress'
                          ? '50%'
                          : '10%',
                    }}
                  />
                </div>
              </div>

              {/* Description Box */}
              {activeTask.description && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {activeTask.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {activeTask.status === 'Completed' || activeTask.status === 'Done' ? (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Task Completed</span>
                  </div>
                ) : activeTask.status === 'In Progress' ? (
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(activeTask.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartTask(activeTask.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#001E33] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start This Task</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">All tasks completed!</p>
              <p className="text-slate-400">Great work today.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. BOTTOM LIVE WIDGETS ROW (LEADS, CUSTOMERS, DEALS, QUOTATIONS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Widget 1: Assigned Leads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">My Leads</h3>
              </div>
              <Link href="/worker/leads" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3.5">
              {userLeads.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active leads assigned.
                </div>
              ) : (
                userLeads.slice(0, 4).map((lead) => (
                  <Link
                    key={lead.id}
                    href="/worker/leads"
                    className="flex items-center justify-between group hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {lead.contactDetails?.name || lead.leadSpecification || 'Lead Record'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium truncate">
                        {lead.contactDetails?.company || lead.source || 'Direct Lead'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {lead.status || 'New'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Widget 2: Assigned Customers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Customers</h3>
              </div>
              <Link href="/worker/customers" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3.5">
              {userCustomers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No customer records found.
                </div>
              ) : (
                userCustomers.map((cust) => (
                  <Link
                    key={cust.id}
                    href="/worker/customers"
                    className="flex items-center justify-between group hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {cust.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium truncate">
                        {cust.companyName || cust.companyGroup || cust.category || 'Client Account'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Widget 3: Active Deals & Opportunities */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Opportunities</h3>
              </div>
              <Link href="/worker/deals" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3.5">
              {(allDeals || []).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active opportunities logged.
                </div>
              ) : (
                (allDeals || []).slice(0, 4).map((deal) => (
                  <Link
                    key={deal.id}
                    href="/worker/deals"
                    className="flex items-center justify-between group hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {deal.title || deal.customer}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        AED {Number(deal.amount || 0).toLocaleString()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {deal.stage || 'Open'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Widget 4: My Commercial Quotations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">My Quotations</h3>
              </div>
              <Link href="/worker/quotations" className="text-xs font-bold text-purple-600 hover:text-purple-700">
                View All ({userQuotations.length})
              </Link>
            </div>

            <div className="space-y-3 pt-3.5">
              {userQuotations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  <p>No quotations created yet.</p>
                  <Link
                    href="/worker/quotations?create=true"
                    className="inline-block mt-2 text-[11px] font-bold text-purple-600 hover:underline"
                  >
                    + Create Quotation
                  </Link>
                </div>
              ) : (
                userQuotations.slice(0, 4).map((q: CrmQuotation) => (
                  <Link
                    key={q.id}
                    href="/worker/quotations"
                    className="flex items-center justify-between group hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                        {q.quotationNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium truncate">
                        {q.customer} • AED {(q.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        q.status === 'Approved' || q.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : q.status === 'Pending Approval'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {q.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
