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
  UserCheck,
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
  Trash2,
} from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';

const EMPLOYEE_ROSTER: any[] = [];

const SALES_DEPARTMENTS: string[] = [];

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
  const [usersVersion, setUsersVersion] = useState(0);

  // Departments State - Strictly user created
  const [salesDepartments, setSalesDepartments] = useState<string[]>([]);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Quick Add Employee sub-modal state
  const [isQuickAddEmployeeOpen, setIsQuickAddEmployeeOpen] = useState(false);
  const [quickEmpForm, setQuickEmpForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    designation: 'Sales Representative',
    department: '',
    location: 'Dubai Corporate HQ (Main Sales Desk)',
    password: 'employee123',
  });

  const currentUser = authMockService.getCurrentUser();
  const currentManagerId = currentUser?.id || 'mgr_1';

  // Listen for real-time user database and department updates
  React.useEffect(() => {
    const handleUpdate = () => {
      setUsersVersion((v) => v + 1);
      try {
        const storedDepts = localStorage.getItem('cezcon_crm_departments_list');
        if (storedDepts) {
          const parsed = JSON.parse(storedDepts);
          if (Array.isArray(parsed)) {
            // Filter out old mock hardcoded items
            const cleaned = parsed.filter(
              (d: string) =>
                ![
                  'Enterprise Key Accounts',
                  'Inside Sales & Follow-up',
                  'Direct Sales & Client Acquisition',
                  'Customer Success & Retention',
                  'Inbound Lead Development',
                  'Commercial Quotations & Proposals',
                  'Corporate Tenders & Government Sales',
                ].includes(d)
            );
            setSalesDepartments(cleaned);
          }
        } else {
          setSalesDepartments([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    handleUpdate();
    window.addEventListener('crm_users_updated', handleUpdate);
    window.addEventListener('crm_departments_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('crm_users_updated', handleUpdate);
      window.removeEventListener('crm_departments_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Form state for sales employee task assignment
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    customerName: '',
    dealReference: '',
    department: '',
    assignedTo: '',
    employeePhone: '',
    employeeRole: '',
    location: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low' | 'Urgent',
    category: '',
    dueDate: '',
    dueTime: '',
    instructions: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) {
      showToast('Please enter a department name.');
      return;
    }
    const updated = Array.from(new Set([...salesDepartments, trimmed]));
    setSalesDepartments(updated);
    try {
      localStorage.setItem('cezcon_crm_departments_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_departments_updated'));
      window.dispatchEvent(new Event('crm_users_updated'));
    } catch (err) {
      console.error(err);
    }
    setNewTaskForm((prev) => ({ ...prev, department: trimmed }));
    setIsAddDeptModalOpen(false);
    setNewDeptName('');
    showToast(`Department "${trimmed}" created and selected!`);
  };

  const handleDeleteDepartment = (deptToDelete: string) => {
    const updated = salesDepartments.filter((d) => d !== deptToDelete);
    setSalesDepartments(updated);
    try {
      localStorage.setItem('cezcon_crm_departments_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_departments_updated'));
      window.dispatchEvent(new Event('crm_users_updated'));
    } catch (err) {
      console.error(err);
    }
    if (newTaskForm.department === deptToDelete) {
      setNewTaskForm((prev) => ({ ...prev, department: '' }));
    }
    showToast(`Department "${deptToDelete}" deleted.`);
  };

  const handleClearAllDepartments = () => {
    setSalesDepartments([]);
    try {
      localStorage.setItem('cezcon_crm_departments_list', JSON.stringify([]));
      window.dispatchEvent(new Event('crm_departments_updated'));
      window.dispatchEvent(new Event('crm_users_updated'));
    } catch (err) {
      console.error(err);
    }
    setNewTaskForm((prev) => ({ ...prev, department: '' }));
    showToast('All departments cleared.');
  };

  // Dynamic Employee List - Strictly from registered employees in the system
  const availableEmployees = useMemo(() => {
    let dynamicList: Array<{
      id?: string | number;
      name: string;
      role: string;
      department: string;
      territory: string;
      phone: string;
      avatar?: string;
    }> = [];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cezcon_crm_users_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const curMgrId = String(currentManagerId || '').toLowerCase();
            const curMgrEmail = String(currentUser?.email || '').toLowerCase();

            // First try to find employees specifically assigned to this manager
            const managerSpecific = parsed.filter((u: any) => {
              const uMgrId = String(u.managerId || u.reportingManagerId || '').toLowerCase();
              const isEmp =
                u.profileType === 'Employee' ||
                u.profileType === 'Worker' ||
                u.role === 'Employee' ||
                u.isWorker ||
                (!u.isAdmin && !u.profileType?.toLowerCase().includes('manager') && !u.profileType?.toLowerCase().includes('admin'));

              const matchesManager =
                uMgrId.length > 0 &&
                (uMgrId === curMgrId ||
                  `usr_${uMgrId}` === curMgrId ||
                  uMgrId === curMgrId.replace('usr_', '') ||
                  uMgrId === curMgrEmail ||
                  (curMgrEmail.startsWith('manager') && uMgrId === curMgrId.replace('mgr_', '')));

              return isEmp && matchesManager;
            });

            // If manager-specific employees exist, use those; otherwise find all registered employees/workers in the CRM
            const listToUse = managerSpecific.length > 0 
              ? managerSpecific 
              : parsed.filter((u: any) => {
                  const isEmp =
                    u.profileType === 'Employee' ||
                    u.profileType === 'Worker' ||
                    u.role === 'Employee' ||
                    u.isWorker ||
                    (!u.isAdmin && !u.profileType?.toLowerCase().includes('manager') && !u.profileType?.toLowerCase().includes('admin'));
                  return isEmp;
                });

            dynamicList = listToUse.map((u: any) => ({
              id: u.id,
              name: u.name,
              role: u.designation || u.employeeType || 'Sales Representative',
              department: u.department || 'Enterprise Key Accounts',
              territory: u.location || 'Dubai Corporate HQ (Main Sales Desk)',
              phone: u.phone || u.mobile || '+971 50 123 4567',
              avatar: u.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            }));
          }
        }
      } catch (e) {
        console.error('Error parsing cezcon_crm_users_list:', e);
      }
    }

    return dynamicList;
  }, [currentManagerId, currentUser, usersVersion]);

  const handleEmployeeSelect = (empName: string) => {
    if (empName === '__add_new__') {
      setIsQuickAddEmployeeOpen(true);
      return;
    }
    const selected = availableEmployees.find((w) => w.name === empName);
    if (selected) {
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: selected.name,
        department: selected.department || prev.department,
        employeePhone: selected.phone,
        employeeRole: selected.role,
        location: selected.territory || prev.location,
      }));
    } else {
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: empName,
      }));
    }
  };

  const handleQuickAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmpForm.name.trim() || !quickEmpForm.email.trim()) {
      showToast('Please enter both employee name and email.');
      return;
    }

    try {
      const stored = localStorage.getItem('cezcon_crm_users_list');
      let currentList: any[] = [];
      if (stored) {
        currentList = JSON.parse(stored);
        if (!Array.isArray(currentList)) currentList = [];
      }

      const newId = `usr_${Date.now()}`;
      const newEmp = {
        id: newId,
        name: quickEmpForm.name.trim(),
        username: quickEmpForm.username.trim() || quickEmpForm.email.trim().split('@')[0],
        email: quickEmpForm.email.trim(),
        phone: quickEmpForm.phone.trim() || '+971 50 000 0000',
        mobile: quickEmpForm.phone.trim() || '+971 50 000 0000',
        designation: quickEmpForm.designation.trim() || 'Sales Representative',
        department: quickEmpForm.department || 'Enterprise Key Accounts',
        location: quickEmpForm.location || 'Dubai Corporate HQ (Main Sales Desk)',
        profileType: 'Employee',
        employeeType: 'Sales Employee',
        role: 'Employee',
        status: 'Active',
        password: quickEmpForm.password || 'employee123',
        managerId: String(currentManagerId),
        reportingManagerId: String(currentManagerId),
        managerName: currentUser?.name || 'Operations Manager',
        createdAt: new Date().toISOString(),
      };

      const updated = [newEmp, ...currentList];
      localStorage.setItem('cezcon_crm_users_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_users_updated'));
      setUsersVersion((v) => v + 1);

      // Immediately select newly added employee for current task form
      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: newEmp.name,
        department: newEmp.department,
        employeePhone: newEmp.phone,
        employeeRole: newEmp.designation,
        location: newEmp.location,
      }));

      setIsQuickAddEmployeeOpen(false);
      setQuickEmpForm({
        name: '',
        email: '',
        username: '',
        phone: '',
        designation: 'Sales Representative',
        department: 'Enterprise Key Accounts',
        location: 'Dubai Corporate HQ (Main Sales Desk)',
        password: 'employee123',
      });

      showToast(`Employee "${newEmp.name}" added successfully and selected!`);
    } catch (err) {
      console.error('Error adding employee:', err);
      showToast('Error saving new employee. Please try again.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.customerName) return;

    const employee = availableEmployees.find((w) => w.name === newTaskForm.assignedTo);
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
      assignedBy: currentUser?.name || 'Operations Manager',
      createdBy: currentUser?.name || 'Operations Manager',
      status: 'Assigned',
      assignee: {
        name: newTaskForm.assignedTo,
        role: newTaskForm.employeeRole || employee?.role || 'Sales Representative',
        avatar: employee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });

    setIsAssignModalOpen(false);
    showToast(`Task assigned to ${newTaskForm.assignedTo || 'employee'}!`);
    setNewTaskForm({
      title: '',
      customerName: '',
      dealReference: '',
      department: '',
      assignedTo: '',
      employeePhone: '',
      employeeRole: '',
      location: '',
      priority: 'Medium',
      category: '',
      dueDate: '',
      dueTime: '',
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

      {/* ── Professional Enterprise Assign Task Modal ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl sm:max-w-3xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Assign Commercial Task to Employee</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      Operations Manager
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Allocate client follow-up, quotation presentation, site survey or deal action
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateTask} className="p-6 sm:p-8 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Objective */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Commercial Objective & Task Scope <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all"
                  placeholder="e.g. Present Commercial Ice Machine & VRF Quotation to Focus EMC"
                />
              </div>

              {/* Section 2: Assignment & Department */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Team Assignment & Department
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-slate-700">
                        Assign Employee / Sales Rep <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsQuickAddEmployeeOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Employee</span>
                      </button>
                    </div>
                    <select
                      value={newTaskForm.assignedTo}
                      required
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <option value="">
                        {availableEmployees.length === 0 ? '-- No employees found. Click + Add Employee --' : '-- Select Employee --'}
                      </option>
                      {availableEmployees.map((w) => (
                        <option key={w.name} value={w.name}>
                          {w.name} — {w.role} ({w.department})
                        </option>
                      ))}
                      <option value="__add_new__" className="text-blue-600 font-bold bg-blue-50">
                        + Add New Employee...
                      </option>
                    </select>
                    {availableEmployees.length === 0 && (
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-[11px] text-amber-800">
                        <span>No employees found in your team roster.</span>
                        <button
                          type="button"
                          onClick={() => setIsQuickAddEmployeeOpen(true)}
                          className="font-bold underline text-amber-900 hover:text-blue-700 cursor-pointer ml-2"
                        >
                          + Add Employee Now
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-slate-700">
                        Sales Department <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddDeptModalOpen(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Department</span>
                      </button>
                    </div>
                    <select
                      value={newTaskForm.department}
                      required
                      onChange={(e) => {
                        if (e.target.value === '__add_new_dept__') {
                          setIsAddDeptModalOpen(true);
                        } else {
                          setNewTaskForm({ ...newTaskForm, department: e.target.value });
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <option value="">
                        {salesDepartments.length === 0 ? '-- No departments found. Click + Add Department --' : '-- Select Department --'}
                      </option>
                      {salesDepartments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="__add_new_dept__" className="text-blue-600 font-bold bg-blue-50">
                        + Add New Department...
                      </option>
                    </select>
                    {salesDepartments.length === 0 && (
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-[11px] text-amber-800">
                        <span>No departments created yet.</span>
                        <button
                          type="button"
                          onClick={() => setIsAddDeptModalOpen(true)}
                          className="font-bold underline text-amber-900 hover:text-blue-700 cursor-pointer ml-2"
                        >
                          + Add Department Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Customer / Client Account <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTaskForm.customerName}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all"
                      placeholder="e.g. Focus EMC Kitchens LLC"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Office Desk / Branch Territory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newTaskForm.location}
                      required
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <option value="">-- Select Location / Branch --</option>
                      {OFFICE_TERRITORIES.map((terr) => (
                        <option key={terr} value={terr}>
                          {terr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Priority & SLA Timeline */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Priority & SLA Timeline
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Priority Level</label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all cursor-pointer"
                    >
                      <option value="Urgent">🚨 Urgent (Immediate Follow-up)</option>
                      <option value="High">⚡ High Priority</option>
                      <option value="Medium">🔹 Medium Priority</option>
                      <option value="Low">⚪ Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Target Completion Due Date</label>
                    <input
                      type="date"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assign &amp; Dispatch Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Quick Add Employee Sub-Modal ── */}
      {isQuickAddEmployeeOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Employee / Sales Rep</h3>
                  <p className="text-[11px] text-slate-500">Register employee to your team and assign tasks immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddEmployeeOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleQuickAddEmployee} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammed Rashid"
                  value={quickEmpForm.name}
                  onChange={(e) => setQuickEmpForm({ ...quickEmpForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rashid@company.com"
                    value={quickEmpForm.email}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile / Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +971 50 123 4567"
                    value={quickEmpForm.phone}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Representative"
                    value={quickEmpForm.designation}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, designation: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Sales Department</label>
                    <button
                      type="button"
                      onClick={() => setIsAddDeptModalOpen(true)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={quickEmpForm.department}
                    onChange={(e) => {
                      if (e.target.value === '__add_new_dept__') {
                        setIsAddDeptModalOpen(true);
                      } else {
                        setQuickEmpForm({ ...quickEmpForm, department: e.target.value });
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                  >
                    <option value="">-- Select Department --</option>
                    {salesDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    <option value="__add_new_dept__" className="text-blue-600 font-bold bg-blue-50">
                      + Add New Department...
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office / Territory</label>
                  <select
                    value={quickEmpForm.location}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                  >
                    {OFFICE_TERRITORIES.map((terr) => (
                      <option key={terr} value={terr}>
                        {terr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Password</label>
                  <input
                    type="text"
                    value={quickEmpForm.password}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickAddEmployeeOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Create &amp; Assign Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add & Manage Departments Sub-Modal ── */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage &amp; Add Departments</h3>
                  <p className="text-[11px] text-slate-500">Create custom departments or delete existing ones</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddDeptModalOpen(false);
                  setNewDeptName('');
                }}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleAddDepartment} className="space-y-3">
                <label className="block font-semibold text-slate-700">
                  Create New Department <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Commercial HVAC Sales"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Department List Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Existing Organization Departments ({salesDepartments.length})
                  </span>
                  {salesDepartments.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllDepartments}
                      className="text-[10px] font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                    >
                      Delete All
                    </button>
                  )}
                </div>

                {salesDepartments.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                    <Building2 className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <p className="font-semibold text-slate-600">No departments added yet</p>
                    <p className="text-[11px] text-slate-400">Type a department name above to create your first department.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {salesDepartments.map((dept) => (
                      <div
                        key={dept}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-lg hover:bg-slate-100/70 transition-colors"
                      >
                        <span className="font-bold text-slate-800">{dept}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDepartment(dept)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
                          title={`Delete ${dept}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDeptModalOpen(false);
                    setNewDeptName('');
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
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
