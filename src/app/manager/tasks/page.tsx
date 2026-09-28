'use client';

import React, { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  User,
  Building2,
  Briefcase,
  ShieldCheck,
  Phone,
  Calendar,
  X,
  ChevronRight,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';

const EMPLOYEE_ROSTER = [
  {
    name: 'Alex Rivera',
    role: 'Senior Sales Executive',
    department: 'Enterprise Key Accounts',
    territory: 'Dubai Corporate HQ (Main Sales Desk)',
    phone: '+971 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sarah Connor',
    role: 'Key Account Manager',
    department: 'Enterprise Key Accounts',
    territory: 'Abu Dhabi Commercial Hub (Regional Desk)',
    phone: '+971 55 987 6543',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elena Rostova',
    role: 'Inside Sales Specialist',
    department: 'Inside Sales & Follow-up',
    territory: 'Dubai Corporate HQ (Main Sales Desk)',
    phone: '+971 52 456 7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marcus Vance',
    role: 'Lead Development & Telesales',
    department: 'Inbound Lead Development',
    territory: 'Northern Emirates Branch (Trade Center)',
    phone: '+971 56 345 6789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tariq Mansour',
    role: 'Commercial Deals Specialist',
    department: 'Direct Sales & Client Acquisition',
    territory: 'Abu Dhabi Commercial Hub (Regional Desk)',
    phone: '+971 54 876 5432',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Zayed Al Qasimi',
    role: 'Customer Success Manager',
    department: 'Customer Success & Retention',
    territory: 'Global Key Accounts (Executive Suite)',
    phone: '+971 50 998 1122',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
];

const SALES_DEPARTMENTS = [
  'Enterprise Key Accounts',
  'Inside Sales & Follow-up',
  'Direct Sales & Client Acquisition',
  'Customer Success & Retention',
  'Inbound Lead Development',
  'Commercial Quotations & Proposals',
  'Corporate Tenders & Government Sales',
];

const OFFICE_TERRITORIES = [
  'Dubai Corporate HQ (Main Sales Desk)',
  'Abu Dhabi Commercial Hub (Regional Desk)',
  'Northern Emirates Branch (Trade Center)',
  'Global Key Accounts (Executive Suite)',
  'Remote / Virtual Sales Desk',
];

const TASK_CATEGORIES = [
  'Deal Follow-up & Nurturing',
  'Client Meeting & Sales Pitch',
  'Product Demo & Presentation',
  'Commercial Quotation & Proposal',
  'Contract Negotiation & Closing',
  'Customer Discovery Call',
  'Account Review & Upsell',
];

function ManagerTasksContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') || 'All';
  const { tasks, createTask } = useEnterpriseCrm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [deptFilter, setDeptFilter] = useState('All');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentUser = authMockService.getCurrentUser();
  const currentManagerId = currentUser?.id || 'mgr_1';

  // Form state for sales employee task assignment
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    customerName: '',
    dealReference: '',
    department: 'Enterprise Key Accounts',
    assignedTo: 'Alex Rivera',
    employeePhone: '+971 50 123 4567',
    employeeRole: 'Senior Sales Executive',
    location: 'Dubai Corporate HQ (Main Sales Desk)',
    priority: 'High' as 'High' | 'Medium' | 'Low' | 'Urgent',
    category: 'Deal Follow-up & Nurturing',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '04:00 PM',
    instructions: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Dynamic Employee List
  const availableEmployees = useMemo(() => {
    let dynamicList: typeof EMPLOYEE_ROSTER = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cezcon_crm_users_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            dynamicList = parsed
              .filter((u: any) => {
                const isEmp = u.profileType === 'Employee' || u.role === 'Employee' || u.isWorker || (!u.isAdmin && !u.profileType?.toLowerCase().includes('manager'));
                const matchesManager =
                  !u.managerId ||
                  String(u.managerId) === String(currentManagerId) ||
                  `usr_${u.managerId}` === String(currentManagerId) ||
                  String(u.managerId) === String(currentManagerId).replace('usr_', '') ||
                  String(u.managerId) === String(currentUser?.email);
                return isEmp && matchesManager;
              })
              .map((u: any) => ({
                name: u.name,
                role: u.designation || 'Sales Representative',
                department: u.department || (u.designation?.includes('Account') ? 'Enterprise Key Accounts' : 'Direct Sales & Client Acquisition'),
                territory: 'Dubai Corporate HQ (Main Sales Desk)',
                phone: u.phone || '+971 50 123 4567',
                avatar: u.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    const combined = [...EMPLOYEE_ROSTER];
    dynamicList.forEach((d) => {
      if (!combined.some((c) => c.name.toLowerCase() === d.name.toLowerCase())) {
        combined.push(d);
      }
    });
    return combined;
  }, [currentManagerId, currentUser]);

  const handleEmployeeSelect = (empName: string) => {
    const selected = availableEmployees.find((w) => w.name === empName);
    if (selected) {
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: selected.name,
        department: selected.department,
        employeePhone: selected.phone,
        employeeRole: selected.role,
        location: selected.territory,
      }));
    } else {
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: empName,
      }));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.customerName) return;

    const employee = EMPLOYEE_ROSTER.find((w) => w.name === newTaskForm.assignedTo);
    const taskUnderDisplay = newTaskForm.dealReference
      ? `${newTaskForm.dealReference} / ${newTaskForm.customerName}`
      : newTaskForm.customerName;

    createTask({
      taskDetails: newTaskForm.title,
      description: newTaskForm.instructions || newTaskForm.location,
      department: newTaskForm.department,
      location: newTaskForm.location,
      siteLocation: newTaskForm.location,
      equipmentTag: newTaskForm.dealReference,
      workerContact: newTaskForm.employeePhone,
      customer: newTaskForm.customerName,
      taskUnder: taskUnderDisplay,
      taskType: newTaskForm.category,
      priority: newTaskForm.priority,
      dueDate: newTaskForm.dueDate,
      dueTime: newTaskForm.dueTime,
      assignedEmployee: newTaskForm.assignedTo,
      assignedBy: 'Alex Rivera (Sales Manager)',
      createdBy: 'Alex Rivera (Sales Manager)',
      status: 'Assigned',
      assignee: {
        name: newTaskForm.assignedTo,
        role: newTaskForm.employeeRole || employee?.role || 'Sales Representative',
        avatar: employee?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    });

    setIsAssignModalOpen(false);
    showToast(`Task assigned to ${newTaskForm.assignedTo} in ${newTaskForm.department}!`);
    setNewTaskForm({
      title: '',
      customerName: '',
      dealReference: '',
      department: 'Enterprise Key Accounts',
      assignedTo: 'Alex Rivera',
      employeePhone: '+971 50 123 4567',
      employeeRole: 'Senior Sales Executive',
      location: 'Dubai Corporate HQ (Main Sales Desk)',
      priority: 'High',
      category: 'Deal Follow-up & Nurturing',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '04:00 PM',
      instructions: '',
    });
  };

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const title = t.taskDetails || t.title || '';
      const cust = t.customer || t.taskUnder || '';
      const rep = t.assignedEmployee || t.assignee?.name || '';
      const dept = t.department || '';
      const loc = t.location || t.description || '';

      const matchSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        cust.toLowerCase().includes(search.toLowerCase()) ||
        rep.toLowerCase().includes(search.toLowerCase()) ||
        dept.toLowerCase().includes(search.toLowerCase()) ||
        loc.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || t.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDept = deptFilter === 'All' || dept.toLowerCase() === deptFilter.toLowerCase();

      return matchSearch && matchStatus && matchDept;
    });
  }, [tasks, search, statusFilter, deptFilter]);

  return (
    <ManagerShell
      title="Sales Team Tasks & Milestone Allocation"
      subtitle="Assign client follow-ups, demos, and deals to sales employees and monitor live pipeline progress"
    >
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search task, sales rep, dept, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Sales Departments</option>
              {SALES_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Assign Task to Employee</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Sales Task &amp; Scope</th>
                <th className="py-3 px-3">Department &amp; Type</th>
                <th className="py-3 px-3">Customer &amp; Territory</th>
                <th className="py-3 px-3">Assigned Sales Rep</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-4 text-right">Target Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700 mb-1">No sales tasks found</p>
                    <p className="text-xs text-slate-400">Click &quot;+ Assign Task to Employee&quot; above to allocate a new sales objective.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{t.taskDetails || t.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{t.id} · {t.taskType || 'Follow-up'}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {t.department || 'Enterprise Key Accounts'}
                      </span>
                      {t.equipmentTag && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px]">{t.equipmentTag}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{t.customer || t.taskUnder || 'Client Account'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{t.location || 'Dubai Corporate HQ'}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        {t.assignee?.avatar ? (
                          <img
                            src={t.assignee.avatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                            {(t.assignedEmployee || t.assignee?.name || 'E')[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {t.assignedEmployee || t.assignee?.name || 'Unassigned'}
                          </p>
                          <p className="text-[10px] text-slate-400">{t.assignee?.role || 'Sales Rep'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          t.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          t.status === 'Completed' || t.status === 'Reviewed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{t.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">{t.dueTime || '04:00 PM'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Clean & Simple Assign Task Modal ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign Task</h3>
                  <p className="text-xs text-slate-400">Assign task to employee with department &amp; location</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simple Form */}
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs text-slate-700">
              {/* Task Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  placeholder="e.g. Follow up on proposal with Focus EMC"
                />
              </div>

              {/* Row 1: Person Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Person Name *</label>
                  <select
                    value={newTaskForm.assignedTo}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    {availableEmployees.map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name} ({w.role.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={newTaskForm.department}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    {SALES_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Customer & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newTaskForm.customerName}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    placeholder="e.g. Focus EMC Kitchens LLC"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location *</label>
                  <select
                    value={newTaskForm.location}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    {OFFICE_TERRITORIES.map((terr) => (
                      <option key={terr} value={terr}>
                        {terr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assign Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}

export default function ManagerTasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Tasks...</div>}>
      <ManagerTasksContent />
    </Suspense>
  );
}
