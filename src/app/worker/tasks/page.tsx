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
  ArrowRight,
  AlertTriangle,
  PlayCircle,
  Package,
  Calendar,
  Search,
  Filter,
  CheckSquare,
  Square,
  FileCheck,
  Plus,
  X,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { WorkerTask, WorkerTaskStatus } from '@/types/worker';

function WorkerTasksContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';
  const initialSelectedId = searchParams.get('selected');

  const { tasks: rawTasks, acceptTask, startTask, completeTask, updateTaskStatusWorkflow } = useEnterpriseCrm();
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Convert rawTasks to WorkerTask format
  const tasks: WorkerTask[] = useMemo(() => {
    return rawTasks.map((t) => ({
      id: t.id,
      taskNumber: t.id,
      title: t.taskDetails || t.title || 'Sales Task & Commercial Milestone',
      serviceType: t.taskType || 'Deal Follow-up',
      priority: (t.priority === 'Urgent' ? 'Urgent' : t.priority === 'High' ? 'High' : 'Normal') as any,
      status: (t.status === 'In Progress' ? 'In Progress' : t.status === 'Accepted' ? 'Accepted' : t.status === 'Completed' ? 'Completed' : 'Pending') as any,
      clientName: t.customer || t.taskUnder || 'Client Account',
      clientCompany: t.customer || 'Enterprise Account',
      clientPhone: t.workerContact || '+971 50 123 4567',
      clientEmail: 'sales@cooltechuae.com',
      address: t.location || t.description || 'Dubai Corporate HQ (Main Sales Desk)',
      cityArea: t.department || 'Enterprise Key Accounts',
      scheduledDate: t.dueDate || new Date().toISOString().split('T')[0],
      scheduledTime: t.dueTime || '04:00 PM',
      estimatedHours: 2.0,
      actualHoursSpent: 1.0,
      assignedManager: t.assignedBy || 'Alex Rivera (Sales Manager)',
      description: t.description || t.taskDetails || '',
      checklist: [
        { id: 'chk_1', label: 'Review deal history & client requirements', completed: t.status === 'In Progress' || t.status === 'Completed', required: true },
        { id: 'chk_2', label: 'Conduct client discussion / commercial presentation', completed: t.status === 'Completed', required: true },
        { id: 'chk_3', label: 'Log outcome in CRM & dispatch revised proposal', completed: t.status === 'Completed', required: true },
      ],
      partsUsed: [],
      technicianNotes: t.comments?.[0]?.text || '',
    }));
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
    if (newStatus === 'Accepted') {
      acceptTask(taskId, 'Jordan Hayes');
    } else if (newStatus === 'In Progress') {
      startTask(taskId, 'Jordan Hayes');
    } else if (newStatus === 'Completed') {
      completeTask(taskId, 'Jordan Hayes', 'Service completed successfully on site.');
    } else {
      updateTaskStatusWorkflow(taskId, newStatus, 'Jordan Hayes', 'Employee', 'Status updated by technician');
    }
  };

  const handleToggleChecklist = (taskId: string, checkId: string, currentVal: boolean) => {
    // Keep local toggle interaction responsive
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        checklist: selectedTask.checklist?.map((c) =>
          c.id === checkId ? { ...c, completed: !currentVal } : c
        ),
      });
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
      task.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* ── Filter & Search Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {['All', 'Today', 'In Progress', 'Accepted', 'Pending', 'Completed'].map((tab) => {
            const count =
              tab === 'All'
                ? tasks.length
                : tab === 'Today'
                ? tasks.filter((t) => t.status !== 'Completed').length
                : tasks.filter((t) => t.status.toLowerCase() === tab.toLowerCase()).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    statusFilter === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Priority Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by task #, client, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700 hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Task Grid List ── */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-2">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No tasks found matching filter</h3>
          <p className="text-xs text-slate-400">Try changing status or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isCurrentActive = task.status === 'In Progress';
            const isCompleted = task.status === 'Completed';
            const completedChecklistCount = task.checklist.filter((c) => c.completed).length;

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                  isCurrentActive
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/5'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Priority + Status */}
                  <div className="flex items-center justify-between gap-2">
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

                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCurrentActive
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Task Number & Title */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span>{task.taskNumber}</span>
                      <span>•</span>
                      <span>{task.serviceType}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug line-clamp-2">
                      {task.title}
                    </h3>
                  </div>

                  {/* Client & Location */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{task.clientCompany}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{task.address}</span>
                    </div>
                  </div>

                  {/* Checklist & Schedule Indicators */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.scheduledTime}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <CheckSquare className="w-3 h-3 text-blue-600" />
                      {completedChecklistCount}/{task.checklist.length} Steps
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
                  >
                    Details &rarr;
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isCurrentActive ? (
                      <Link
                        href="/worker/tasks/active"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition-colors shadow-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Execute Now</span>
                      </Link>
                    ) : isCompleted ? (
                      <Link
                        href={`/worker/reports?id=${task.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Certificate</span>
                      </Link>
                    ) : task.status === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(task.id, 'Accepted')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                      >
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Task Details Modal ── */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedTask.taskNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{selectedTask.serviceType}</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg sm:text-xl mt-1 leading-snug">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 text-xs text-slate-700">
              {/* Client & Address Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedTask.clientCompany}</div>
                  <div className="text-slate-600 mt-0.5">Contact: {selectedTask.clientName}</div>
                  <a
                    href={`tel:${selectedTask.clientPhone}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline mt-1"
                  >
                    <Phone className="w-3 h-3" />
                    {selectedTask.clientPhone}
                  </a>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Site Location</span>
                  <div className="font-medium text-slate-800 mt-0.5">{selectedTask.address}</div>
                  <div className="text-slate-500 text-[11px] mt-1">Area: {selectedTask.cityArea}</div>
                  <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-1 font-semibold text-blue-700">
                    <Clock className="w-3 h-3" />
                    Schedule: {selectedTask.scheduledTime}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Work Order Instructions:</h4>
                <p className="bg-white border border-slate-200 p-3 rounded-lg leading-relaxed text-slate-700">
                  {selectedTask.description}
                </p>
              </div>

              {/* Checklist Items */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Standard Operating Checklist ({selectedTask.checklist.length} items):</span>
                  <span className="text-blue-600 font-semibold text-[11px]">
                    {selectedTask.checklist.filter((c) => c.completed).length} Done
                  </span>
                </h4>
                <div className="space-y-2">
                  {selectedTask.checklist.map((chk) => (
                    <label
                      key={chk.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        chk.completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={chk.completed}
                        onChange={() => handleToggleChecklist(selectedTask.id, chk.id, chk.completed)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs ${chk.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {chk.label}
                      </span>
                      {chk.required && (
                        <span className="ml-auto text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                          Mandatory
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Controls */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Update Status:</span>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value as WorkerTaskStatus)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="On The Way">On The Way</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <Link
                  href="/worker/tasks/active"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-colors"
                >
                  <PlayCircle className="w-4 h-4 fill-current" />
                  <span>Launch Live Job Runner</span>
                </Link>
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
    <WorkerShell
      title="My Assigned Tasks &amp; Work Orders"
      subtitle="View, accept, update, and log completion proofs for HVAC and chiller service orders"
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading work orders...</div>}>
        <WorkerTasksContent />
      </Suspense>
    </WorkerShell>
  );
}
