'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  Clock,
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  BarChart2,
  FileText,
  Image as ImageIcon,
  Package,
  Building2,
  Zap,
  UserCheck,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';

import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';

export default function ManagerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { tasks, createTask, salesOpportunities, leads } = useEnterpriseCrm();

  const currentUser = authMockService.getCurrentUser();
  const currentManagerId = currentUser?.id || 'mgr_1';

  const dynamicTeamMembers = React.useMemo(() => {
    let list: Array<{ id: string; name: string; role: string; email: string }> = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cezcon_crm_users_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const curMgrId = String(currentManagerId || '').toLowerCase();
            const curMgrEmail = String(currentUser?.email || '').toLowerCase();

            list = parsed
              .filter((u: any) => {
                const uMgrId = String(u.managerId || u.reportingManagerId || '').toLowerCase();
                const matchesMgr =
                  uMgrId.length > 0 &&
                  (uMgrId === curMgrId ||
                    `usr_${uMgrId}` === curMgrId ||
                    uMgrId === curMgrId.replace('usr_', '') ||
                    uMgrId === curMgrEmail ||
                    (curMgrEmail.startsWith('manager') && uMgrId === curMgrId.replace('mgr_', '')));
                const isEmployeeOrWorker =
                  u.profileType === 'Employee' ||
                  u.profileType === 'Worker' ||
                  u.isWorker ||
                  (!u.isAdmin && !u.profileType?.toLowerCase().includes('manager') && !u.profileType?.toLowerCase().includes('admin'));
                return matchesMgr && isEmployeeOrWorker;
              })
              .map((u: any) => ({
                id: String(u.id),
                name: u.name,
                role: u.designation || u.employeeType || u.profileType || 'Sales Representative',
                email: u.email || `${u.username}@company.com`,
              }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (list.length > 0) return list;
    if (currentManagerId === 'mgr_2' || currentManagerId === 'usr_mgr_2') {
      return [
        { id: 'emp_4', name: 'Employee 4', role: 'Purchase Representative', email: 'employee4@company.com' },
        { id: 'emp_5', name: 'Employee 5', role: 'Purchase Representative', email: 'employee5@company.com' },
        { id: 'emp_6', name: 'Employee 6', role: 'Purchase Representative', email: 'employee6@company.com' },
      ];
    }
    if (currentManagerId === 'mgr_3' || currentManagerId === 'usr_mgr_3') {
      return [
        { id: 'emp_7', name: 'Employee 7', role: 'Marketing Specialist', email: 'employee7@company.com' },
        { id: 'emp_8', name: 'Employee 8', role: 'Marketing Specialist', email: 'employee8@company.com' },
      ];
    }
    if (currentManagerId === 'mgr_4' || currentManagerId === 'usr_mgr_4') {
      return [
        { id: 'emp_9', name: 'Employee 9', role: 'Operations Officer', email: 'employee9@company.com' },
        { id: 'emp_10', name: 'Employee 10', role: 'Operations Officer', email: 'employee10@company.com' },
      ];
    }
    return [
      { id: 'emp_1', name: 'Employee 1', role: 'Sales Representative', email: 'employee1@company.com' },
      { id: 'emp_2', name: 'Employee 2', role: 'Sales Representative', email: 'employee2@company.com' },
      { id: 'emp_3', name: 'Employee 3', role: 'Sales Representative', email: 'employee3@company.com' },
    ];
  }, [currentManagerId, currentUser]);

  // Quick Assign Task Form State
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    customerName: '',
    department: 'Chiller & HVAC Operations',
    assignedTo: 'Alex Rivera',
    priority: 'High' as 'High' | 'Medium' | 'Low' | 'Urgent',
    scheduledTime: '09:00 AM - 12:00 PM',
    location: 'Downtown, Dubai',
    equipmentTag: 'Chiller Plant Unit #1',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.customerName) return;

    createTask({
      taskDetails: newTaskForm.title,
      customer: newTaskForm.customerName,
      taskUnder: newTaskForm.customerName,
      department: newTaskForm.department,
      location: newTaskForm.location,
      siteLocation: newTaskForm.location,
      equipmentTag: newTaskForm.equipmentTag,
      assignedEmployee: newTaskForm.assignedTo,
      assignedBy: 'Alex Rivera (Sales Manager)',
      createdBy: 'Alex Rivera (Sales Manager)',
      priority: newTaskForm.priority,
      taskType: 'Follow-up',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: newTaskForm.scheduledTime,
      description: newTaskForm.location,
      status: 'Assigned',
      assignee: {
        name: newTaskForm.assignedTo,
        role: 'Sales Representative',
      },
    });

    setToastMessage(`Task "${newTaskForm.title}" successfully assigned to ${newTaskForm.assignedTo}!`);
    setTimeout(() => setToastMessage(null), 4000);

    setIsAssignModalOpen(false);
    setNewTaskForm({
      title: '',
      customerName: '',
      department: 'Enterprise Key Accounts',
      assignedTo: 'Alex Rivera',
      priority: 'High',
      scheduledTime: '04:00 PM',
      location: 'Dubai Corporate HQ (Main Sales Desk)',
      equipmentTag: '',
    });
  };

  if (!mounted) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center text-slate-400 text-xs">
        Loading Operations Manager Dashboard...
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-12 overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER & TOP CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Operations Manager Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor team performance, field operations, tasks and business pipeline in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Date Indicator */}
          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>Wednesday, 24 Sep 2026</span>
          </div>

          {/* Period Dropdown */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
          </select>

          {/* Primary Action: Assign Task */}
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Assign Task</span>
          </button>
        </div>
      </div>

      {/* ── 2. TOP 4 METRIC CARDS WITH SPARKLINE WAVES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Technicians */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Total Technicians</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">12</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ +2.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">2 on leave • 10 active</p>
          </div>
          {/* Sparkline Wave */}
          <svg className="w-20 h-10 text-[#1677FF]" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 30 Q 25 10, 50 25 T 100 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 2: Tasks Completed */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Tasks Completed</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">48</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ +12.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">of 60 assigned</p>
          </div>
          {/* Sparkline Wave */}
          <svg className="w-20 h-10 text-[#059669]" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 32 Q 25 30, 50 18 T 100 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 3: Avg. Task Time */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Avg. Task Time</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">3.4 hrs</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↓ -18%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Target: 4.0 hrs</p>
          </div>
          {/* Sparkline Wave */}
          <svg className="w-20 h-10 text-[#D97706]" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 15 Q 25 30, 50 12 T 100 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 4: Revenue in Pipeline */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Revenue in Pipeline</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">AED 950K</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ +18.7%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">12 deals • Q3 2026</p>
          </div>
          {/* Sparkline Wave */}
          <svg className="w-20 h-10 text-[#7C3AED]" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 28 Q 25 24, 50 16 T 100 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION (3 COLUMNS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Column 1 (5 cols on desktop): Team & Field Status */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Team &amp; Field Status</h3>
                  <p className="text-[11px] text-slate-400">Live view of technician workload and capacity</p>
                </div>
              </div>
              <Link
                href="/manager/team"
                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-[11px] font-bold text-[#1677FF] transition-colors whitespace-nowrap"
              >
                View Full Roster
              </Link>
            </div>

            {/* Technicians List */}
            <div className="space-y-4 pt-3.5">
              {/* Tech 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      TM
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">Tariq Mansour</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3FE] text-[#1677FF]">
                          On Field
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> Mussafah Zone 12, Abu Dhabi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-slate-900">85%</span>
                    <Link
                      href="/manager/team"
                      className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-3">
                    <div className="bg-[#EA580C] h-1.5 rounded-full w-[85%]" />
                  </div>
                  <span className="whitespace-nowrap font-medium">4 Assigned • 2 Done Today</span>
                </div>
              </div>

              {/* Tech 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ZQ
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">Zayed Al Qasimi</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                          Available
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> Khalidiya Hub, Abu Dhabi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-slate-900">45%</span>
                    <Link
                      href="/manager/team"
                      className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-3">
                    <div className="bg-[#1677FF] h-1.5 rounded-full w-[45%]" />
                  </div>
                  <span className="whitespace-nowrap font-medium">2 Assigned • 3 Done Today</span>
                </div>
              </div>

              {/* Tech 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      BA
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">Bilal Ahmed</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                          Overloaded
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> Al Reem Island, Sector 4
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-slate-900">98%</span>
                    <Link
                      href="/manager/team"
                      className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-3">
                    <div className="bg-[#DC2626] h-1.5 rounded-full w-[98%]" />
                  </div>
                  <span className="whitespace-nowrap font-medium">6 Assigned • 1 Done Today</span>
                </div>
              </div>

              {/* Tech 4 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      IS
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">Imran Shah</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                          Available
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> Hamdan Street Centre
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-slate-900">30%</span>
                    <Link
                      href="/manager/team"
                      className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-3">
                    <div className="bg-[#0D9488] h-1.5 rounded-full w-[30%]" />
                  </div>
                  <span className="whitespace-nowrap font-medium">1 Assigned • 4 Done Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 (4 cols): Today's Tasks Timeline */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Tasks</h3>
              </div>
              <Link href="/manager/tasks" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            {/* Task Timeline List */}
            <div className="space-y-4 pt-3.5">
              {/* Task 1 */}
              <Link
                href="/manager/tasks"
                className="flex items-start justify-between gap-3 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#1677FF] flex-shrink-0" />
                    <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">09:00 AM</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF] transition-colors truncate">
                      Emergency Chiller Compressor Fix
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Emaar Hospitality Group</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBF3FE] text-[#1677FF]">
                      In Progress
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" />
              </Link>

              {/* Task 2 */}
              <Link
                href="/manager/tasks"
                className="flex items-start justify-between gap-3 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#1677FF] flex-shrink-0" />
                    <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">01:00 PM</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF] transition-colors truncate">
                      AC Unit Preventive Maintenance
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Al Naboodah MEP</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                      Pending
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" />
              </Link>

              {/* Task 3 */}
              <Link
                href="/manager/tasks"
                className="flex items-start justify-between gap-3 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#EA580C] flex-shrink-0" />
                    <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">03:30 PM</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF] transition-colors truncate">
                      Split AC Gas Refill
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Luxury Castle Contracting</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                      Pending
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" />
              </Link>

              {/* Task 4 */}
              <Link
                href="/manager/tasks"
                className="flex items-start justify-between gap-3 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#059669] flex-shrink-0" />
                    <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">05:30 PM</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF] transition-colors truncate">
                      Site Inspection
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Golden Saif Construction</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D1FAE5] text-[#059669]">
                      Completed
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Column 3 (3 cols): Commercial Pipeline */}
        <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Commercial Pipeline</h3>
              </div>
              <Link href="/manager/sales" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            {/* Pipeline Deals List */}
            <div className="space-y-3.5 pt-3.5">
              {/* Deal 1 */}
              <Link
                href="/manager/sales"
                className="flex items-center justify-between gap-2 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF]">
                      Al Ain Hospital Group
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">Annual HVAC Maintenance 2026-27</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EBF3FE] text-[#1677FF]">
                      Under Approval
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-[#1677FF]">AED 480,000</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline-block ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Deal 2 */}
              <Link
                href="/manager/sales"
                className="flex items-center justify-between gap-2 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF]">
                      Etihad Warehousing Hub
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">Industrial VRF Air Filtration Retrofit</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EBF3FE] text-[#1677FF]">
                      Quotation Sent
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-[#1677FF]">AED 295,000</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline-block ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Deal 3 */}
              <Link
                href="/manager/sales"
                className="flex items-center justify-between gap-2 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF]">
                      Yas Marina Residential Towers
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">Smart Thermostat &amp; Energy Saving</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FEF3C7] text-[#D97706]">
                      Negotiation
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-[#1677FF]">AED 175,000</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline-block ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Deal 4 */}
              <Link
                href="/manager/sales"
                className="flex items-center justify-between gap-2 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF]">
                      Abu Dhabi Mall
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">HVAC Upgrade</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-[#1677FF]">AED 220,000</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline-block ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM SECTION (4 CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Recent Activities */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
              </div>
              <Link href="/manager/activities" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3.5 pt-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-800 truncate">
                    Checked in at site <span className="text-slate-400">(TSK-8921)</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">08:05 AM</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#EFF6FF] text-[#1677FF] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 truncate">
                    Added service note <span className="text-slate-400">(TSK-8920)</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">10:20 AM</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 truncate">
                    Uploaded images <span className="text-slate-400">(TSK-8920)</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">02:15 PM</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center flex-shrink-0">
                    <Package className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 truncate">
                    Requested material <span className="text-slate-400">(TSK-8918)</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">03:40 PM</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-800 truncate">
                    Completed job <span className="text-slate-400">(TSK-8891)</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Material Requests */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Material Requests</h3>
              </div>
              <Link href="/worker/materials" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">R410A Refrigerant</div>
                    <div className="text-[10px] text-slate-400 font-medium">2 Cylinders</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Compressor Oil</div>
                    <div className="text-[10px] text-slate-400 font-medium">1 Bottle</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D1FAE5] text-[#059669]">
                  Approved
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Filter Drier</div>
                    <div className="text-[10px] text-slate-400 font-medium">3 Units</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Copper Pipe</div>
                    <div className="text-[10px] text-slate-400 font-medium">5 Meters</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Team Performance Donut */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Team Performance</h3>
              </div>
              <Link href="/manager/performance" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View Report
              </Link>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#059669]"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-slate-900 leading-none">75%</span>
                  <span className="text-[9px] text-slate-400 font-medium">Task Completion</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                  <span className="font-bold text-slate-900">48</span>
                  <span className="text-slate-500 text-[11px]">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <span className="font-bold text-slate-900">12</span>
                  <span className="text-slate-500 text-[11px]">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                  <span className="font-bold text-slate-900">3</span>
                  <span className="text-slate-500 text-[11px]">Overdue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Quick Actions */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3.5 border-b border-[#F1F5F9]">
              <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3.5">
              {/* Tile 1: Assign Task */}
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="p-3 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#1677FF] border border-[#BFDBFE] flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-bold">Assign Task</span>
              </button>

              {/* Tile 2: Request Material */}
              <Link
                href="/worker/materials?action=new"
                className="p-3 rounded-xl bg-[#ECFDF5] hover:bg-emerald-100 text-[#059669] border border-[#A7F3D0] flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
              >
                <Package className="w-4 h-4" />
                <span className="text-xs font-bold">Request Material</span>
              </Link>

              {/* Tile 3: Generate Report */}
              <Link
                href="/manager/reports"
                className="p-3 rounded-xl bg-[#F5F3FF] hover:bg-purple-100 text-[#7C3AED] border border-[#DDD6FE] flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold">Generate Report</span>
              </Link>

              {/* Tile 4: Open Calendar */}
              <Link
                href="/manager/calendar"
                className="p-3 rounded-xl bg-[#FFFBEB] hover:bg-amber-100 text-[#D97706] border border-[#FDE68A] flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold">Open Calendar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. QUICK ASSIGN SALES TASK MODAL ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assign Sales Task to Employee</h3>
                  <p className="text-[11px] text-slate-400">Allocate client follow-up, meeting or deal action</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commercial Task / Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Present Commercial Ice Machine Quotation to Focus EMC"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Account</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Focus EMC Kitchens LLC"
                    value={newTaskForm.customerName}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Sales Rep / Employee</label>
                  <select
                    value={newTaskForm.assignedTo}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  >
                    {dynamicTeamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  >
                    <option value="Urgent">Urgent (Immediate Follow-up)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Due Slot</label>
                  <input
                    type="text"
                    value={newTaskForm.scheduledTime}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, scheduledTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sales Department</label>
                  <select
                    value={newTaskForm.department}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  >
                    <option value="Enterprise Key Accounts">Enterprise Key Accounts</option>
                    <option value="Inside Sales & Follow-up">Inside Sales &amp; Follow-up</option>
                    <option value="Direct Sales & Client Acquisition">Direct Sales &amp; Client Acquisition</option>
                    <option value="Customer Success & Retention">Customer Success &amp; Retention</option>
                    <option value="Inbound Lead Development">Inbound Lead Development</option>
                    <option value="Commercial Quotations & Proposals">Commercial Quotations &amp; Proposals</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opportunity / Deal Ref</label>
                  <input
                    type="text"
                    value={newTaskForm.equipmentTag}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, equipmentTag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                    placeholder="e.g. CTEQ#1041 770KG ICE MACHINE"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sales Territory / Office Desk</label>
                <input
                  type="text"
                  value={newTaskForm.location}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save &amp; Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
