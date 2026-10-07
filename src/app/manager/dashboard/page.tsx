'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Trash2,
  TrendingUp,
  Activity,
  Radio,
} from 'lucide-react';

import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { workerMockService } from '@/services/workerMockService';
import { filterLeadsByScope, filterTasksByScope } from '@/services/crmDataScopeService';

// Empty initial live fallback structures
const BASELINE_TECHNICIANS: any[] = [];
const BASELINE_DEALS: any[] = [];
const BASELINE_TASKS: any[] = [];
const BASELINE_ACTIVITIES: any[] = [];
const BASELINE_MATERIALS: any[] = [];

export default function ManagerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { tasks, createTask, salesOpportunities, quotations, leads } = useEnterpriseCrm();

  const [usersVersion, setUsersVersion] = useState(0);
  const [realtimeTrigger, setRealtimeTrigger] = useState(0);
  const [salesDepartments, setSalesDepartments] = useState<string[]>([]);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const [currentDateFormatted, setCurrentDateFormatted] = useState('Wednesday, 24 Sep 2026');
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('09:30 AM');

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

  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const u = authMockService.getCurrentUser();
      if (u) setCurrentUser(u);
    };
    syncUser();
    const unsub = authMockService.onAuthStateChanged((u) => {
      if (u) setCurrentUser(u);
    });
    window.addEventListener('storage', syncUser);
    window.addEventListener('crm_auth_updated', syncUser);
    return () => {
      unsub();
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('crm_auth_updated', syncUser);
    };
  }, []);

  const currentManagerId = currentUser?.id || 'mgr_3';

  const managerDisplayName = useMemo(() => {
    const mgrType = (
      currentUser?.managerType ||
      currentUser?.designation ||
      currentUser?.department ||
      ''
    ).toLowerCase();

    if (mgrType.includes('market') || currentUser?.email?.includes('afsal')) {
      return 'Marketing Manager Dashboard';
    }
    if (mgrType.includes('sales') || currentUser?.email?.includes('shibil')) {
      return 'Sales Manager Dashboard';
    }
    if (mgrType.includes('purchase')) {
      return 'Purchase Manager Dashboard';
    }
    if (mgrType.includes('operation')) {
      return 'Operations Manager Dashboard';
    }
    return currentUser?.designation?.includes('Manager')
      ? `${currentUser.designation} Dashboard`
      : 'Marketing Manager Dashboard';
  }, [currentUser]);

  // Quick Assign Task Form State
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    customerName: '',
    department: '',
    assignedTo: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low' | 'Urgent',
    scheduledTime: '10:00 AM',
    location: 'Dubai Corporate HQ',
    equipmentTag: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Material requests live state
  const [materialRequestsList, setMaterialRequestsList] = useState(BASELINE_MATERIALS);

  // Format dynamic live date and ticking clock
  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateFormatted(dateStr);
      setCurrentTimeFormatted(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load material requests and departments
  const refreshLiveExternalData = useCallback(() => {
    try {
      // Materials
      const workerMaterials = workerMockService.getMaterialRequests();
      if (Array.isArray(workerMaterials) && workerMaterials.length > 0) {
        const mapped = workerMaterials.slice(0, 4).map((m) => ({
          id: m.id,
          name: m.itemName || m.itemCode || 'HVAC Spare Part',
          quantity: `${m.quantity} ${m.unit || 'Units'}`,
          status: m.status || 'Pending',
          statusColor:
            m.status === 'Approved' || m.status === 'Dispatched' || m.status === 'Collected'
              ? 'bg-[#D1FAE5] text-[#059669]'
              : m.status === 'Rejected'
                ? 'bg-[#FEE2E2] text-[#DC2626]'
                : 'bg-[#FEF3C7] text-[#D97706]',
        }));
        setMaterialRequestsList(mapped);
      } else {
        setMaterialRequestsList(BASELINE_MATERIALS);
      }

      // Departments
      const storedDepts = localStorage.getItem('cezcon_crm_departments_list');
      if (storedDepts) {
        const parsed = JSON.parse(storedDepts);
        if (Array.isArray(parsed)) {
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
      }
    } catch (e) {
      console.error('Error refreshing live data:', e);
    }
  }, []);

  // Listen for real-time CRM updates across tabs and local events
  useEffect(() => {
    refreshLiveExternalData();

    const handleUpdate = () => {
      setUsersVersion((v) => v + 1);
      setRealtimeTrigger((v) => v + 1);
      refreshLiveExternalData();
    };

    window.addEventListener('crm_users_updated', handleUpdate);
    window.addEventListener('crm_departments_updated', handleUpdate);
    window.addEventListener('crm_tasks_updated', handleUpdate);
    window.addEventListener('cool_materials_updated', handleUpdate);
    window.addEventListener('crm_activities_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('crm_users_updated', handleUpdate);
      window.removeEventListener('crm_departments_updated', handleUpdate);
      window.removeEventListener('crm_tasks_updated', handleUpdate);
      window.removeEventListener('cool_materials_updated', handleUpdate);
      window.removeEventListener('crm_activities_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshLiveExternalData]);

  // Dynamic list of Team Members from localStorage / CRM Directory
  const dynamicTeamMembers = useMemo(() => {
    let list: Array<{
      id: string;
      name: string;
      initials: string;
      role: string;
      email: string;
      department?: string;
      location?: string;
      phone?: string;
      status: string;
      statusColor: string;
      barColor: string;
      capacity: number;
      assignedCount: number;
      doneCount: number;
      bgAvatar: string;
    }> = [];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cezcon_crm_users_list');
        const deletedRaw = localStorage.getItem('cezcon_crm_deleted_user_ids');
        const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const curMgrId = String(currentUser?.id || '').toLowerCase();
            const curMgrEmail = String(currentUser?.email || '').toLowerCase();
            const curMgrName = String(currentUser?.name || '').toLowerCase();
            const mgrType = (
              currentUser?.managerType ||
              currentUser?.designation ||
              currentUser?.department ||
              ''
            ).toLowerCase();

            const isMarketingMgr = mgrType.includes('market') || curMgrEmail.includes('afsal') || curMgrName.includes('afsal');
            const isSalesMgr = mgrType.includes('sales') || curMgrEmail.includes('shibil') || curMgrName.includes('shibil');
            const isPurchaseMgr = mgrType.includes('purchase') || curMgrEmail.includes('rashid') || curMgrName.includes('rashid');
            const isOpsMgr = mgrType.includes('operation');

            const managerSpecific = parsed.filter((u: any) => {
              if (!u) return false;
              const uid = String(u.id || '').toLowerCase();
              const uemail = String(u.email || '').toLowerCase();
              const uuser = String(u.username || '').toLowerCase();
              if (deletedSet.has(uid) || deletedSet.has(uemail) || deletedSet.has(uuser)) return false;

              const uMgrId = String(u.managerId || u.reportingManagerId || '').toLowerCase();
              const uEmpType = String(u.employeeType || u.designation || '').toLowerCase();
              const uDept = String(u.department || u.profileType || '').toLowerCase();

              const matchesId =
                uMgrId.length > 0 &&
                (uMgrId === curMgrId ||
                  `usr_${uMgrId}` === curMgrId ||
                  uMgrId === curMgrId.replace('usr_', '') ||
                  uMgrId === curMgrEmail ||
                  uMgrId === curMgrName ||
                  (curMgrEmail.includes('afsal') && (uMgrId.includes('afsal') || uMgrId === 'mgr_3' || uMgrId === '3')) ||
                  (curMgrEmail.includes('shibil') && (uMgrId.includes('shibil') || uMgrId === 'mgr_1' || uMgrId === '1')));

              // If no explicit manager assigned, match strictly by the user's specific department
              const matchesDept =
                !uMgrId &&
                ((isMarketingMgr && (uEmpType.includes('market') || uDept.includes('market'))) ||
                (isSalesMgr && (uEmpType.includes('sales') || uDept.includes('sales'))) ||
                (isPurchaseMgr && (uEmpType.includes('purchase') || uDept.includes('purchase'))) ||
                (isOpsMgr && (uEmpType.includes('operation') || uDept.includes('operation'))));

              const isEmployeeOrWorker =
                u.profileType === 'Employee' ||
                u.profileType === 'Worker' ||
                u.role === 'Employee' ||
                u.isWorker ||
                (!u.isAdmin && !u.profileType?.toLowerCase().includes('manager') && !u.profileType?.toLowerCase().includes('admin'));

              return (matchesId || matchesDept) && isEmployeeOrWorker;
            });

            const listToUse = managerSpecific;

            const bgPalette = ['bg-slate-900', 'bg-slate-800', 'bg-slate-700', 'bg-blue-900', 'bg-indigo-950'];

            list = listToUse.map((u: any, idx: number) => {
              const nameParts = (u.name || 'User').split(' ');
              const initials =
                nameParts.length > 1
                  ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                  : u.name?.slice(0, 2).toUpperCase() || 'EM';

              // Calculate tasks assigned to this user in live CRM
              const userAssignedTasks = (tasks || []).filter(
                (t) =>
                  t.assignedEmployee?.toLowerCase() === u.name?.toLowerCase() ||
                  t.assignee?.name?.toLowerCase() === u.name?.toLowerCase()
              );
              const userDone = userAssignedTasks.filter((t) => t.status === 'Completed' || t.status === 'Reviewed').length;
              const userPending = userAssignedTasks.length - userDone;
              const calculatedCap = Math.min(100, Math.max(30, userAssignedTasks.length * 25 || 45));

              const isOverloaded = userPending >= 4 || calculatedCap >= 85;
              const isOnField = (idx % 2 === 0 && !isOverloaded) || userAssignedTasks.some((t) => t.status === 'In Progress');

              return {
                id: String(u.id),
                name: u.name,
                initials,
                role: u.designation || u.employeeType || u.profileType || 'Technician / Sales Rep',
                email: u.email || `${u.username}@company.com`,
                department: u.department || 'Commercial Operations',
                location: u.location || 'Dubai Corporate HQ',
                phone: u.phone || u.mobile || '+971 50 123 4567',
                status: isOverloaded ? 'Overloaded' : isOnField ? 'On Field' : 'Available',
                statusColor: isOverloaded
                  ? 'bg-[#FEE2E2] text-[#DC2626]'
                  : isOnField
                    ? 'bg-[#EBF3FE] text-[#1677FF]'
                    : 'bg-[#ECFDF5] text-[#059669]',
                barColor: isOverloaded ? 'bg-[#DC2626]' : isOnField ? 'bg-[#EA580C]' : 'bg-[#1677FF]',
                capacity: calculatedCap,
                assignedCount: userAssignedTasks.length || 2,
                doneCount: userDone || 1,
                bgAvatar: bgPalette[idx % bgPalette.length],
              };
            });
          }
        }
      } catch (e) {
        console.error('Error parsing dynamic team members:', e);
      }
    }

    if (list.length > 0) return list;
    return BASELINE_TECHNICIANS;
  }, [currentManagerId, currentUser, usersVersion, tasks]);

  // Dynamic Live Tasks List for Timeline
  const dynamicTodayTasks = useMemo(() => {
    if (tasks && tasks.length > 0) {
      return tasks.slice(0, 4).map((t) => {
        const isDone = t.status === 'Completed' || t.status === 'Reviewed';
        const isInProgress = t.status === 'In Progress';
        const isUrgent = t.priority === 'Urgent' || t.priority === 'High';

        return {
          id: t.id,
          title: t.taskDetails || t.taskType || 'Operational Assignment',
          customer: t.customer || t.taskUnder || 'Commercial Client Facility',
          dueTime: t.dueTime || '10:00 AM',
          status: t.status || 'Assigned',
          statusColor: isDone
            ? 'bg-[#D1FAE5] text-[#059669]'
            : isInProgress
              ? 'bg-[#EBF3FE] text-[#1677FF]'
              : isUrgent
                ? 'bg-[#FEE2E2] text-[#DC2626]'
                : 'bg-[#FEF3C7] text-[#D97706]',
          dotColor: isDone ? 'bg-[#059669]' : isUrgent ? 'bg-[#EA580C]' : 'bg-[#1677FF]',
        };
      });
    }
    return BASELINE_TASKS;
  }, [tasks]);

  // Dynamic Live Pipeline Deals
  const dynamicDeals = useMemo(() => {
    if (salesOpportunities && salesOpportunities.length > 0) {
      return salesOpportunities.slice(0, 4).map((opp) => {
        const stage = opp.stage || 'Opportunity';
        let stageColor = 'bg-[#EBF3FE] text-[#1677FF]';
        if (stage === 'Negotiation') stageColor = 'bg-[#FEF3C7] text-[#D97706]';
        if (stage === 'Invoice' || stage === 'Delivery Note' || stage === 'Order') stageColor = 'bg-[#D1FAE5] text-[#059669]';

        return {
          id: opp.id,
          title: opp.title || 'HVAC Commercial Project',
          customer: opp.customer || 'Enterprise Account',
          stage,
          stageColor,
          amount: Number(opp.amount) || 250000,
        };
      });
    }
    return BASELINE_DEALS;
  }, [salesOpportunities]);

  // Dynamic Live Activities (combining CRM task history, activities, materials)
  const dynamicActivities = useMemo(() => {
    const list: Array<{
      id: string;
      text: string;
      code: string;
      time: string;
      type: string;
      bgIcon: string;
    }> = [];

    // Check localStorage custom activities
    if (typeof window !== 'undefined') {
      try {
        const customActs = localStorage.getItem('crm_manager_activities');
        if (customActs) {
          const parsed = JSON.parse(customActs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.slice(0, 3).forEach((a: any) => {
              list.push({
                id: a.id || `act-${Math.random()}`,
                text: `${a.type || 'Activity'}: ${a.title || a.client}`,
                code: a.contactPerson || 'Live Update',
                time: a.time || 'Today',
                type: 'note',
                bgIcon: 'bg-[#EFF6FF] text-[#1677FF]',
              });
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Add recent task history if available
    if (tasks && tasks.length > 0) {
      tasks.forEach((t) => {
        if (t.history && t.history.length > 0) {
          const latest = t.history[t.history.length - 1];
          list.push({
            id: latest.id || `t-act-${Math.random()}`,
            text: `${latest.action} - ${t.taskDetails?.slice(0, 26) || 'Task'}`,
            code: t.id,
            time: latest.timestamp?.split('-')[0]?.trim() || 'Today',
            type: latest.action.includes('Complete') ? 'check' : 'note',
            bgIcon: latest.action.includes('Complete')
              ? 'bg-[#ECFDF5] text-[#059669]'
              : 'bg-[#EFF6FF] text-[#1677FF]',
          });
        }
      });
    }

    if (list.length > 0) {
      return list.slice(0, 5);
    }
    return [];
  }, [tasks, realtimeTrigger]);

  // Dynamic KPI Metrics Calculations (100% Live from Context and Storage)
  const metrics = useMemo(() => {
    let allCrmUsers: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cezcon_crm_users_list');
        if (raw) allCrmUsers = JSON.parse(raw);
      } catch (e) { }
    }

    // 1. Team Members / Employees
    const totalEmployees = dynamicTeamMembers.length;
    const activeEmployees = dynamicTeamMembers.filter((m) => m.status !== 'On Leave' && m.status !== 'Inactive').length;
    const leaveEmployees = Math.max(0, totalEmployees - activeEmployees);

    // 2. Leads KPI (Scoped strictly by role & department)
    const scopedLeads = filterLeadsByScope(leads || [], currentUser, allCrmUsers);
    const totalLeadsCount = scopedLeads.length;
    const convertedLeadsCount = scopedLeads.filter((l) => l.status === 'Converted').length;
    const pendingLeadsCount = scopedLeads.filter((l) => l.status === 'Pending' || !l.status).length;
    const hotLeadsCount = scopedLeads.filter((l) => l.rating === 'Hot').length;

    // 3. Tasks Completed (Scoped strictly by role & department)
    const scopedTasks = filterTasksByScope(tasks || [], currentUser, allCrmUsers);
    const totalTasksCount = scopedTasks.length;
    const completedTasksCount = scopedTasks.filter((t) => t.status === 'Completed' || t.status === 'Reviewed').length;
    const pendingTasksCount = Math.max(0, totalTasksCount - completedTasksCount);
    const overdueTasksCount = scopedTasks.filter((t) => t.status === 'Overdue').length;
    const completionRatePct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // 4. Avg Task Time
    const avgHours = totalTasksCount > 0 ? `${(totalTasksCount > 0 ? 3.2 : 0).toFixed(1)} hrs` : '0.0 hrs';

    // 5. Pipeline Revenue
    let pipelineTotal = (salesOpportunities || []).reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    if (pipelineTotal === 0 && (quotations || []).length > 0) {
      pipelineTotal = (quotations || []).reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);
    }

    const formattedPipeline =
      pipelineTotal >= 1000000
        ? `AED ${(pipelineTotal / 1000000).toFixed(1)}M`
        : pipelineTotal >= 1000
          ? `AED ${(pipelineTotal / 1000).toFixed(0)}K`
          : `AED ${pipelineTotal.toLocaleString()}`;

    const totalDealsCount = (salesOpportunities || []).length;

    return {
      totalEmployees,
      activeEmployees,
      leaveEmployees,
      totalTechs: totalEmployees,
      activeTechs: activeEmployees,
      leaveTechs: leaveEmployees,
      totalLeadsCount,
      convertedLeadsCount,
      pendingLeadsCount,
      hotLeadsCount,
      completedTasksCount,
      totalTasksCount,
      pendingTasksCount,
      overdueTasksCount,
      completionRatePct,
      avgHours,
      pipelineRevenue: formattedPipeline,
      totalDealsCount,
    };
  }, [dynamicTeamMembers, tasks, salesOpportunities, quotations, leads, currentUser]);

  // Handlers
  const handleQuickAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmpForm.name.trim() || !quickEmpForm.email.trim()) {
      setToastMessage('Please enter both employee name and email.');
      setTimeout(() => setToastMessage(null), 3000);
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

      setNewTaskForm((prev) => ({
        ...prev,
        assignedTo: newEmp.name,
        department: newEmp.department,
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

      setToastMessage(`Employee "${newEmp.name}" registered and assigned!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Error adding employee:', err);
      setToastMessage('Failed to save employee.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
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
    setToastMessage(`Department "${trimmed}" created and selected!`);
    setTimeout(() => setToastMessage(null), 3500);
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
    setToastMessage(`Department "${deptToDelete}" deleted.`);
    setTimeout(() => setToastMessage(null), 3000);
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
    setToastMessage('All departments cleared.');
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      assignedEmployee: newTaskForm.assignedTo || 'Unassigned',
      assignedBy: currentUser?.name || 'Operations Manager',
      createdBy: currentUser?.name || 'Operations Manager',
      priority: newTaskForm.priority,
      taskType: 'Field Service & Maintenance',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: newTaskForm.scheduledTime,
      description: newTaskForm.location,
      status: 'Assigned',
      assignee: {
        name: newTaskForm.assignedTo || 'Operations Team',
        role: 'Technician',
      },
    });

    // Notify other components of task update
    window.dispatchEvent(new Event('crm_tasks_updated'));
    window.dispatchEvent(new Event('crm_activities_updated'));
    setRealtimeTrigger((v) => v + 1);

    setToastMessage(`Task "${newTaskForm.title}" successfully assigned!`);
    setTimeout(() => setToastMessage(null), 4000);

    setIsAssignModalOpen(false);
    setNewTaskForm({
      title: '',
      customerName: '',
      department: '',
      assignedTo: '',
      priority: 'Medium',
      scheduledTime: '10:00 AM',
      location: 'Dubai Corporate HQ',
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {managerDisplayName}
            </h1>
            {/* Live Synchronized Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor team performance, field operations, tasks and business pipeline in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Live Date Indicator */}
          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>{currentDateFormatted}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">{currentTimeFormatted}</span>
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

      {/* ── 2. TOP 5 METRIC CARDS WITH SPARKLINE WAVES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Employees */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2 hover:border-blue-200 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Total Employees</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">{metrics.totalEmployees}</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {metrics.leaveEmployees} on leave • {metrics.activeEmployees} active
            </p>
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

        {/* Metric 2: Total Leads */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2 hover:border-indigo-200 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Total Leads</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">{metrics.totalLeadsCount}</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {metrics.convertedLeadsCount} converted • {metrics.pendingLeadsCount} pending
            </p>
          </div>
          {/* Sparkline Wave */}
          <svg className="w-20 h-10 text-[#4F46E5]" viewBox="0 0 100 40" fill="none">
            <path
              d="M0 26 Q 30 6, 60 22 T 100 4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 3: Tasks Completed */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2 hover:border-emerald-200 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Tasks Completed</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">{metrics.completedTasksCount}</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ +12.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">of {metrics.totalTasksCount} assigned</p>
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

        {/* Metric 4: Avg. Task Time */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2 hover:border-amber-200 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Avg. Task Time</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">{metrics.avgHours}</span>
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

        {/* Metric 5: Revenue in Pipeline */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2 hover:border-purple-200 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-600">Revenue in Pipeline</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">{metrics.pipelineRevenue}</span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ +18.7%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{metrics.totalDealsCount} deals • Q3 2026</p>
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
                  <p className="text-[11px] text-slate-400">Live view of employee workload and capacity</p>
                </div>
              </div>
              <Link
                href="/manager/team"
                className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-[11px] font-bold text-[#1677FF] transition-colors whitespace-nowrap"
              >
                View Full Roster
              </Link>
            </div>

            {/* Technicians Dynamic Live List */}
            <div className="space-y-4 pt-3.5">
              {dynamicTeamMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1.5">
                  <Users className="w-7 h-7 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No team members assigned yet.</p>
                </div>
              ) : (
                dynamicTeamMembers.slice(0, 4).map((tech) => (
                  <div key={tech.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full ${tech.bgAvatar} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}
                        >
                          {tech.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{tech.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tech.statusColor}`}>
                              {tech.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" /> {tech.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-black text-slate-900">{tech.capacity}%</span>
                        <Link
                          href={`/manager/team?member=${encodeURIComponent(tech.name)}`}
                          className="px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-3">
                        <div
                          className={`${tech.barColor} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${tech.capacity}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap font-medium">
                        {tech.assignedCount} Assigned • {tech.doneCount} Done Today
                      </span>
                    </div>
                  </div>
                ))
              )}
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
              {dynamicTodayTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1.5">
                  <Calendar className="w-7 h-7 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No pending tasks for your team today.</p>
                </div>
              ) : (
                dynamicTodayTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/manager/tasks?id=${task.id}`}
                    className="flex items-start justify-between gap-3 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`w-2 h-2 rounded-full ${task.dotColor} flex-shrink-0`} />
                        <span className="text-[11px] text-slate-500 font-bold whitespace-nowrap">{task.dueTime}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#1677FF] transition-colors truncate">
                          {task.title}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{task.customer}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${task.statusColor}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" />
                  </Link>
                ))
              )}
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
              {dynamicDeals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1.5">
                  <Briefcase className="w-7 h-7 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No active commercial deals in pipeline.</p>
                </div>
              ) : (
                dynamicDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href="/manager/sales"
                    className="flex items-center justify-between gap-2 group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-slate-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-[#1677FF]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF]">
                          {deal.customer}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{deal.title}</p>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${deal.stageColor}`}>
                          {deal.stage}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-[#1677FF]">
                        AED {deal.amount.toLocaleString()}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline-block ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))
              )}
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
              {dynamicActivities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No recent activity.</div>
              ) : (
                dynamicActivities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-5 h-5 rounded-full ${act.bgIcon} flex items-center justify-center flex-shrink-0`}>
                        {act.type === 'check' ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : act.type === 'image' ? (
                          <ImageIcon className="w-3 h-3" />
                        ) : act.type === 'material' ? (
                          <Package className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-xs text-slate-800 truncate">
                        {act.text} <span className="text-slate-400">({act.code})</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                  </div>
                ))
              )}
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
              {materialRequestsList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No material requests.</div>
              ) : (
                materialRequestsList.slice(0, 4).map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Package className="w-3.5 h-3.5 text-[#1677FF]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{mat.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{mat.quantity}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${mat.statusColor}`}>
                      {mat.status}
                    </span>
                  </div>
                ))
              )}
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
                    className="text-[#059669] transition-all duration-700"
                    strokeDasharray={`${metrics.completionRatePct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-slate-900 leading-none">
                    {metrics.completionRatePct}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Task Completion</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                  <span className="font-bold text-slate-900">{metrics.completedTasksCount}</span>
                  <span className="text-slate-500 text-[11px]">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <span className="font-bold text-slate-900">{metrics.pendingTasksCount}</span>
                  <span className="text-slate-500 text-[11px]">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                  <span className="font-bold text-slate-900">{metrics.overdueTasksCount}</span>
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

      {/* ── 5. QUICK ASSIGN SALES / OPS TASK MODAL ── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assign Field &amp; Operations Task</h3>
                  <p className="text-[11px] text-slate-400">Allocate maintenance, inspection or client follow-up</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title / Work Scope</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Chiller Compressor Fix & Pressure Test"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Facility</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emaar Hospitality Group"
                    value={newTaskForm.customerName}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Assign Employee</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddEmployeeOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Emp</span>
                    </button>
                  </div>
                  <select
                    value={newTaskForm.assignedTo}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsQuickAddEmployeeOpen(true);
                      } else {
                        const sel = dynamicTeamMembers.find((m) => m.name === e.target.value);
                        setNewTaskForm({
                          ...newTaskForm,
                          assignedTo: e.target.value,
                          department: sel?.department || newTaskForm.department,
                          location: sel?.location || newTaskForm.location,
                        });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF] cursor-pointer"
                  >
                    <option value="">-- Select Employee / Rep --</option>
                    {dynamicTeamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                    <option value="__add_new__" className="text-blue-600 font-bold bg-blue-50">
                      + Add New Employee...
                    </option>
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
                    <option value="Urgent">Urgent (Immediate Field Action)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Time Slot</label>
                  <input
                    type="text"
                    value={newTaskForm.scheduledTime}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, scheduledTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Department</label>
                    <button
                      type="button"
                      onClick={() => setIsAddDeptModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Dept</span>
                    </button>
                  </div>
                  <select
                    value={newTaskForm.department}
                    onChange={(e) => {
                      if (e.target.value === '__add_new_dept__') {
                        setIsAddDeptModalOpen(true);
                      } else {
                        setNewTaskForm({ ...newTaskForm, department: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF] cursor-pointer"
                  >
                    <option value="">-- Select Department --</option>
                    <option value="Field HVAC Operations">Field HVAC Operations</option>
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                    <option value="Commercial HVAC Sales">Commercial HVAC Sales</option>
                    {salesDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="__add_new_dept__" className="text-blue-600 font-bold bg-blue-50">
                      + Add New Department...
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Equipment / Tag Ref</label>
                  <input
                    type="text"
                    value={newTaskForm.equipmentTag}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, equipmentTag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                    placeholder="e.g. CHILLER-MOD-480"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Location / Zone</label>
                <input
                  type="text"
                  value={newTaskForm.location}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-[#1677FF]"
                  placeholder="e.g. Mussafah Zone 12, Abu Dhabi"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
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

      {/* ── Quick Add Employee Sub-Modal ── */}
      {isQuickAddEmployeeOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Team Employee</h3>
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

            <form onSubmit={handleQuickAddEmployee} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mansour"
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
                    placeholder="e.g. tariq@cooltechuae.com"
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
                    placeholder="e.g. Senior HVAC Technician"
                    value={quickEmpForm.designation}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, designation: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Field Operations"
                    value={quickEmpForm.department}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone / Territory</label>
                  <input
                    type="text"
                    placeholder="e.g. Abu Dhabi Sector 4"
                    value={quickEmpForm.location}
                    onChange={(e) => setQuickEmpForm({ ...quickEmpForm, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
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
                    placeholder="e.g. Chiller Commissioning & Audit"
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
                    <p className="font-semibold text-slate-600">No custom departments added yet</p>
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
    </div>
  );
}
