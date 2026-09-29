'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  PlayCircle,
  Package,
  Calendar,
  Search,
  CheckSquare,
  FileCheck,
  X,
  Building2,
  ExternalLink,
  Trash2,
  LayoutList,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { WorkerTask, WorkerTaskStatus } from '@/types/worker';
import { authMockService, MockAuthUser } from '@/services/authMockService';

function WorkerTasksContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';
  const initialSelectedId = searchParams.get('selected');

  const { tasks: rawTasks, acceptTask, startTask, completeTask, updateTaskStatusWorkflow, deleteTask } = useEnterpriseCrm();
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const user = authMockService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Purge any legacy dummy/test records from localStorage
  const handlePurgeDummyTasks = () => {
    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const genuineOnly = parsed.filter((t: any) => {
            const title = (t.taskDetails || t.title || '').trim().toLowerCase();
            const isGibberish =
              title.includes('qewrty') ||
              title.includes('efwregv') ||
              title.includes('asdf') ||
              title.length < 3;
            const isFakeAlex =
              (t.assignedBy === 'Alex Rivera (Sales Manager)' ||
                t.assignedBy === 'Alex Rivera (Operations Manager)') &&
              (title.includes('qewrty') || title.includes('efwregv'));

            return !isGibberish && !isFakeAlex;
          });

          localStorage.setItem('crm_tasks_data', JSON.stringify(genuineOnly));
          window.location.reload();
        }
      }
      showToast('Cleaned dummy records.');
    } catch (e) {
      console.error(e);
    }
  };

  // Convert rawTasks strictly using genuine manager data
  const tasks: WorkerTask[] = useMemo(() => {
    const validRaw = rawTasks.filter((t) => {
      const title = (t.taskDetails || t.title || '').trim().toLowerCase();
      const isGibberish =
        title.includes('qewrty') ||
        title.includes('efwregv') ||
        (t.assignedBy?.includes('Alex Rivera') && (title.includes('qewrty') || title.includes('efwregv')));
      return !isGibberish;
    });

    return validRaw.map((t) => {
      const managerName = t.assignedBy || t.createdBy || 'Operations Manager';
      const scheduledTime = t.dueTime || '04:00 PM';
      const assignedTime = t.createdAt || 'Today';
      const scheduledDate = t.dueDate || 'Today';
      const deptName = t.department || 'Operations Desk';
      const taskTitle = t.taskDetails || t.title || `Task #${t.id}`;
      const client = t.customer || t.taskUnder || 'Client Facility';
      const location = t.location || t.siteLocation || t.description || 'Job Site Location';

      return {
        id: t.id,
        taskNumber: t.id,
        title: taskTitle,
        serviceType: t.taskType || 'Service Order',
        priority: (t.priority === 'Urgent' ? 'Urgent' : t.priority === 'High' ? 'High' : 'Normal') as any,
        status: (t.status === 'In Progress' ? 'In Progress' : t.status === 'Accepted' ? 'Accepted' : t.status === 'Completed' ? 'Completed' : 'Pending') as any,
        clientName: t.customer || t.taskUnder || client,
        clientCompany: client,
        clientPhone: t.workerContact || '+971 50 123 4567',
        clientEmail: 'service@cooltechuae.com',
        address: location,
        cityArea: deptName,
        scheduledDate,
        scheduledTime,
        assignedTime,
        estimatedHours: 2.0,
        actualHoursSpent: 1.0,
        assignedManager: managerName,
        assignedManagerRole: 'Manager',
        department: deptName,
        description: t.description || t.taskDetails || taskTitle,
        checklist: [
          { id: 'chk_1', label: 'Verify work requirements & safety parameters', completed: t.status === 'In Progress' || t.status === 'Completed', required: true },
          { id: 'chk_2', label: 'Execute inspection & assigned operational service', completed: t.status === 'Completed', required: true },
          { id: 'chk_3', label: 'Record completion proof & obtain sign-off', completed: t.status === 'Completed', required: true },
        ],
        partsUsed: [],
        technicianNotes: t.comments?.[0]?.text || '',
      };
    });
  }, [rawTasks]);

  useEffect(() => {
    if (initialSelectedId) {
      const match = tasks.find((t) => t.id === initialSelectedId || t.taskNumber === initialSelectedId);
      if (match) {
        setSelectedTask(match);
        setIsDetailModalOpen(true);
      }
    }
  }, [initialSelectedId, tasks]);

  const handleStatusChange = (taskId: string, newStatus: WorkerTaskStatus) => {
    const actorName = currentUser?.name || 'Employee';
    if (newStatus === 'Accepted') {
      acceptTask(taskId, actorName);
      showToast(`Task accepted! Added to active queue.`);
    } else if (newStatus === 'In Progress') {
      startTask(taskId, actorName);
      showToast(`Task started. Status updated to In Progress.`);
    } else if (newStatus === 'Completed') {
      completeTask(taskId, actorName, 'Service completed successfully.');
      showToast(`Task marked as Completed!`);
    } else {
      updateTaskStatusWorkflow(taskId, newStatus, actorName, 'Employee', 'Status updated by technician');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Today'
        ? task.status !== 'Completed'
        : task.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === 'All' ? true : task.priority.toLowerCase() === priorityFilter.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedManager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const acceptedCount = tasks.filter((t) => t.status === 'Accepted').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const urgentCount = tasks.filter((t) => t.priority === 'Urgent' || t.priority === 'High').length;

  return (
    <div className="space-y-4 w-full">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#002B49] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── 1. Clean Professional Page Header ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              My Assigned Tasks & Work Orders
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[11px] font-bold border border-blue-200">
              Manager Certified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational tasks and service orders assigned by your department manager.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePurgeDummyTasks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Clean dummy / test data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clean Data</span>
          </button>

          <Link
            href="/worker/materials"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>+ Request Material</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Sleek KPI Metrics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{tasks.length}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High / Urgent</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">{urgentCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Action</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{pendingCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="text-xl font-black text-blue-700 mt-0.5">{inProgressCount + acceptedCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <PlayCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{completedCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── 3. Clean Search & Filter Control Bar ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Today', 'Pending', 'Accepted', 'In Progress', 'Completed'].map((tab) => {
            const count =
              tab === 'All'
                ? tasks.length
                : tab === 'Today'
                ? tasks.filter((t) => t.status !== 'Completed').length
                : tasks.filter((t) => t.status.toLowerCase() === tab.toLowerCase()).length;

            const isSelected = statusFilter === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Priority Selector & Layout Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, manager, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all h-8.5"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium h-8.5"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent Priority</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal Priority</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Main Tasks Presentation (Table List by Default / Clean Cards) ── */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-2.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">No tasks found matching filter</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tasks assigned by your manager will appear here in real-time.
            </p>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* ── DENSE ENTERPRISE TABLE VIEW (Clean & Simple) ── */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Task Info</th>
                  <th className="py-3 px-4">Assigned by Manager</th>
                  <th className="py-3 px-4">Due Date & Time</th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTasks.map((task) => {
                  const isCurrentActive = task.status === 'In Progress';
                  const isCompleted = task.status === 'Completed';
                  const isPending = task.status === 'Pending';

                  const managerInitials = task.assignedManager
                    .replace(/\(.*?\)/g, '')
                    .trim()
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isCurrentActive ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Task Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-200">
                              #{task.taskNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                task.priority === 'Urgent'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : task.priority === 'High'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {task.serviceType}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                            {task.title}
                          </div>
                        </div>
                      </td>

                      {/* Assigned by Manager */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                            {managerInitials || 'MG'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight flex items-center gap-1">
                              <span>{task.assignedManager}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">
                              {task.department || 'Operations'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Schedule & Time */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#2563EB] flex items-center gap-1 text-xs">
                            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>{task.scheduledTime}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{task.scheduledDate}</span>
                          </div>
                        </div>
                      </td>

                      {/* Client & Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="font-bold text-slate-900 truncate">
                            {task.clientCompany}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{task.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isCurrentActive
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : isPending
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isCurrentActive
                                ? 'bg-amber-500 animate-pulse'
                                : isPending
                                ? 'bg-blue-600'
                                : 'bg-slate-400'
                            }`}
                          />
                          {task.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {isCurrentActive ? (
                            <Link
                              href="/worker/tasks/active"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition-colors shadow-2xs"
                            >
                              <PlayCircle className="w-3.5 h-3.5 fill-current" />
                              <span>Execute</span>
                            </Link>
                          ) : isCompleted ? (
                            <Link
                              href={`/worker/reports?id=${task.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </Link>
                          ) : isPending ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task.id, 'Accepted')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Job</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task.id, 'In Progress')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Start Work</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete work order #${task.taskNumber}?`)) {
                                deleteTask(task.id);
                                showToast(`Task #${task.taskNumber} removed.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── CLEAN PROFESSIONAL CARDS GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isCurrentActive = task.status === 'In Progress';
            const isCompleted = task.status === 'Completed';
            const isPending = task.status === 'Pending';

            const managerInitials = task.assignedManager
              .replace(/\(.*?\)/g, '')
              .trim()
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl p-4.5 shadow-xs transition-all flex flex-col justify-between hover:shadow-md ${
                  isCurrentActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : isPending
                    ? 'border-blue-200 hover:border-blue-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Task #, Priority, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#002B49] text-white text-[10px] font-black">
                        #{task.taskNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isCurrentActive
                          ? 'bg-amber-50 text-amber-900 border border-amber-300'
                          : isPending
                          ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isCurrentActive
                            ? 'bg-amber-500 animate-pulse'
                            : isPending
                            ? 'bg-blue-600'
                            : 'bg-slate-400'
                        }`}
                      />
                      {task.status}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider block">
                      {task.serviceType}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug line-clamp-2">
                      {task.title}
                    </h3>
                  </div>

                  {/* Manager Attribution Row */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#002B49] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        {managerInitials || 'MG'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Assigned by Manager
                        </span>
                        <div className="text-xs font-bold text-slate-900 truncate leading-tight flex items-center gap-1">
                          <span>{task.assignedManager}</span>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex-shrink-0">
                      {task.department || 'Operations'}
                    </span>
                  </div>

                  {/* Schedule & Client */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#2563EB]" />
                        Due Time
                      </span>
                      <span className="font-black text-[#2563EB] text-xs block truncate">
                        {task.scheduledTime}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {task.scheduledDate}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        Account
                      </span>
                      <span className="font-bold text-slate-900 text-xs block truncate">
                        {task.clientCompany}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        {task.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-[#2563EB] cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isCurrentActive ? (
                      <Link
                        href="/worker/tasks/active"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition-colors shadow-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Execute</span>
                      </Link>
                    ) : isCompleted ? (
                      <Link
                        href={`/worker/reports?id=${task.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Certificate</span>
                      </Link>
                    ) : isPending ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(task.id, 'Accepted')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Job</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(task.id, 'In Progress')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete work order #${task.taskNumber}?`)) {
                          deleteTask(task.id);
                          showToast(`Task #${task.taskNumber} removed.`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Simple Professional Task Details Modal ── */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-[#2563EB] border border-blue-200">
                    #{selectedTask.taskNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedTask.serviceType}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg mt-1 leading-snug">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 text-xs text-slate-700">
              {/* Manager & Timeline Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned by Manager</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{selectedTask.assignedManager}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Department: {selectedTask.department || 'Operations'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule & Timeline</span>
                  <div className="font-bold text-[#2563EB] text-sm mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedTask.scheduledDate} at {selectedTask.scheduledTime}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Est. Duration: {selectedTask.estimatedHours} hrs
                  </div>
                </div>
              </div>

              {/* Customer & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Account</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedTask.clientCompany}</div>
                  <div className="text-slate-600 mt-0.5">Contact: {selectedTask.clientName}</div>
                  <a
                    href={`tel:${selectedTask.clientPhone}`}
                    className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline mt-1"
                  >
                    <Phone className="w-3 h-3" />
                    {selectedTask.clientPhone}
                  </a>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Job Site Location</span>
                  <div className="font-medium text-slate-800 mt-0.5">{selectedTask.address}</div>
                  <div className="text-slate-500 text-[11px] mt-1">Territory Desk: {selectedTask.cityArea}</div>
                </div>
              </div>

              {/* Work Order Instructions */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Work Order Instructions:</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description}
                </div>
              </div>

              {/* Milestone Checklist */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Milestone Checklist:</h4>
                <div className="space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          item.completed
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {item.completed && <CheckSquare className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`flex-1 text-xs ${
                          item.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedTask.status === 'Pending' ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusChange(selectedTask.id, 'Accepted');
                      setIsDetailModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Work Order</span>
                  </button>
                ) : selectedTask.status === 'Accepted' ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleStatusChange(selectedTask.id, 'In Progress');
                      setIsDetailModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Start Work</span>
                  </button>
                ) : (
                  <Link
                    href="/worker/tasks/active"
                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4 fill-current" />
                    <span>Go to Active Job</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkerTasksPage() {
  return (
    <WorkerShell>
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            <span>Loading Assigned Tasks...</span>
          </div>
        }
      >
        <WorkerTasksContent />
      </Suspense>
    </WorkerShell>
  );
}
