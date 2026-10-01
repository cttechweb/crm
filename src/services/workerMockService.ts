import {
  WorkerTask,
  WorkerShiftAttendance,
  WorkerMaterialRequest,
  WorkerTimesheetEntry,
  WorkerProfileData,
  WorkerTaskStatus,
} from '@/types/worker';

import { authMockService, MockAuthUser } from '@/services/authMockService';

const INITIAL_WORKER_TASKS: WorkerTask[] = [];

const INITIAL_MATERIAL_REQUESTS: WorkerMaterialRequest[] = [];

const INITIAL_TIMESHEET: WorkerTimesheetEntry[] = [];

export const WORKER_PROFILE_DEFAULT: WorkerProfileData = {
  id: 'usr_worker_001',
  workerCode: 'EMP-1049',
  name: 'Employee',
  email: 'employee@cooltechuae.com',
  phone: '+971 50 123 4567',
  role: 'Technician',
  skillLevel: 'Field Service Specialist',
  department: 'Field HVAC Operations & Maintenance',
  assignedManager: 'Operations Manager',
  assignedVehicle: 'Toyota HiAce Service Van #07 (DXB 48291)',
  driverLicenseNumber: 'UAE-DXB-994821',
  emergencyContact: {
    name: 'Emergency Contact',
    relationship: 'Family Member',
    phone: '+971 50 987 6543',
  },
  metrics: {
    completedJobs: 0,
    onTimeRate: 100,
    averageRating: 5.0,
    hoursThisMonth: 0,
    safetyScore: 100,
  },
};

export const workerMockService = {
  // ── TASKS ──
  getTasks(): WorkerTask[] {
    if (typeof window === 'undefined') return INITIAL_WORKER_TASKS;
    try {
      const crmTasksRaw = localStorage.getItem('crm_tasks_data');
      if (crmTasksRaw) {
        const parsed = JSON.parse(crmTasksRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => ({
            id: t.id,
            taskNumber: t.id,
            title: t.taskDetails || t.title || `Task #${t.id}`,
            serviceType: t.taskType || 'Service Order',
            priority: (t.priority === 'Urgent' ? 'Urgent' : t.priority === 'High' ? 'High' : 'Normal') as any,
            status: (t.status === 'In Progress' ? 'In Progress' : t.status === 'Accepted' ? 'Accepted' : t.status === 'Completed' ? 'Completed' : 'Pending') as any,
            clientName: t.customer || t.taskUnder || 'Client Facility',
            clientCompany: t.customer || t.taskUnder || 'Client Facility',
            clientPhone: t.workerContact || '+971 50 123 4567',
            clientEmail: 'service@cooltechuae.com',
            address: t.location || t.siteLocation || t.description || 'Job Site Location',
            cityArea: t.department || 'Operations Desk',
            scheduledDate: t.dueDate || 'Today',
            scheduledTime: t.dueTime || '04:00 PM',
            assignedTime: t.createdAt || 'Today',
            estimatedHours: 2.0,
            assignedManager: t.assignedBy || t.createdBy || 'Manager',
            department: t.department || 'Operations Desk',
            description: t.description || t.taskDetails || '',
            checklist: t.checklist || [],
            partsUsed: t.partsUsed || [],
            assignedWorkerName: t.assignedEmployee || t.assignee?.name || 'Assigned Employee',
          }));
        }
      }
      const stored = localStorage.getItem('cool_worker_tasks');
      if (stored) return JSON.parse(stored);
      return INITIAL_WORKER_TASKS;
    } catch {
      return INITIAL_WORKER_TASKS;
    }
  },

  getTaskById(id: string): WorkerTask | undefined {
    const tasks = this.getTasks();
    return tasks.find((t) => t.id === id || t.taskNumber === id);
  },

  updateTaskStatus(taskId: string, newStatus: WorkerTaskStatus, notes?: string): WorkerTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId || t.taskNumber === taskId);
    if (idx === -1) return null;

    tasks[idx].status = newStatus;
    if (notes !== undefined) {
      tasks[idx].technicianNotes = notes;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_tasks', JSON.stringify(tasks));
    }
    return tasks[idx];
  },

  updateTaskChecklist(taskId: string, checklistItemId: string, completed: boolean): WorkerTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId || t.taskNumber === taskId);
    if (idx === -1) return null;

    tasks[idx].checklist = tasks[idx].checklist.map((item) =>
      item.id === checklistItemId ? { ...item, completed } : item
    );

    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_tasks', JSON.stringify(tasks));
    }
    return tasks[idx];
  },

  addPartUsed(taskId: string, part: { partCode: string; partName: string; quantity: number; unitCost: number }): WorkerTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId || t.taskNumber === taskId);
    if (idx === -1) return null;

    const newPart = {
      id: `p_${Date.now()}`,
      ...part,
    };
    tasks[idx].partsUsed.push(newPart);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_tasks', JSON.stringify(tasks));
    }
    return tasks[idx];
  },

  completeTaskWithSignOff(
    taskId: string,
    data: {
      customerSignedBy: string;
      customerSignature: string;
      notes: string;
      rating?: number;
      actualHoursSpent?: number;
    }
  ): WorkerTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId || t.taskNumber === taskId);
    if (idx === -1) return null;

    tasks[idx].status = 'Completed';
    tasks[idx].customerSignedBy = data.customerSignedBy;
    tasks[idx].customerSignature = data.customerSignature;
    tasks[idx].technicianNotes = data.notes;
    tasks[idx].rating = data.rating || 5;
    tasks[idx].actualHoursSpent = data.actualHoursSpent || tasks[idx].estimatedHours;
    tasks[idx].signedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_tasks', JSON.stringify(tasks));
    }
    return tasks[idx];
  },

  // ── ATTENDANCE & LIVE CLOCK-IN ──
  getAttendance(): WorkerShiftAttendance {
    const defaultAttendance: WorkerShiftAttendance = {
      isClockedIn: true,
      clockInTime: '08:00 AM',
      activeDurationSeconds: 14400, // 4 hours
      currentLocation: 'Downtown Dubai Depot & Field Unit',
      todayDate: new Date().toLocaleDateString('en-GB'),
      breakDurationMinutes: 15,
    };
    if (typeof window === 'undefined') return defaultAttendance;
    try {
      const stored = localStorage.getItem('cool_worker_attendance');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('cool_worker_attendance', JSON.stringify(defaultAttendance));
      return defaultAttendance;
    } catch {
      return defaultAttendance;
    }
  },

  toggleClockIn(): WorkerShiftAttendance {
    const current = this.getAttendance();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated: WorkerShiftAttendance = {
      ...current,
      isClockedIn: !current.isClockedIn,
      clockInTime: !current.isClockedIn ? timeStr : current.clockInTime,
      clockOutTime: current.isClockedIn ? timeStr : undefined,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_attendance', JSON.stringify(updated));
    }
    return updated;
  },

  // ── MATERIAL REQUESTS ──
  getMaterialRequests(): WorkerMaterialRequest[] {
    if (typeof window === 'undefined') return INITIAL_MATERIAL_REQUESTS;
    try {
      const stored = localStorage.getItem('cool_worker_requests');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('cool_worker_requests', JSON.stringify(INITIAL_MATERIAL_REQUESTS));
      return INITIAL_MATERIAL_REQUESTS;
    } catch {
      return INITIAL_MATERIAL_REQUESTS;
    }
  },

  createMaterialRequest(request: Omit<WorkerMaterialRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>): WorkerMaterialRequest {
    const requests = this.getMaterialRequests();
    const newReq: WorkerMaterialRequest = {
      id: `req_${Date.now()}`,
      requestNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending Approval',
      ...request,
    };

    requests.unshift(newReq);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_requests', JSON.stringify(requests));
    }
    return newReq;
  },

  // ── TIMESHEET ──
  getTimesheet(): WorkerTimesheetEntry[] {
    if (typeof window === 'undefined') return INITIAL_TIMESHEET;
    try {
      const stored = localStorage.getItem('cool_worker_timesheet');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('cool_worker_timesheet', JSON.stringify(INITIAL_TIMESHEET));
      return INITIAL_TIMESHEET;
    } catch {
      return INITIAL_TIMESHEET;
    }
  },

  addTimesheetEntry(entry: Omit<WorkerTimesheetEntry, 'id' | 'status'>): WorkerTimesheetEntry {
    const entries = this.getTimesheet();
    const newEntry: WorkerTimesheetEntry = {
      id: `ts_${Date.now()}`,
      status: 'Submitted',
      ...entry,
    };
    entries.unshift(newEntry);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_timesheet', JSON.stringify(entries));
    }
    return newEntry;
  },

  deleteTimesheetEntry(id: string): void {
    const entries = this.getTimesheet().filter((e) => e.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cool_worker_timesheet', JSON.stringify(entries));
    }
  },

  // ── PROFILE ──
  getProfile(currentUser?: MockAuthUser | null): WorkerProfileData {
    const authUser = currentUser || (typeof window !== 'undefined' ? authMockService.getCurrentUser() : null);
    const userId = authUser?.id || 'default_worker';

    const defaultData: WorkerProfileData = {
      id: authUser?.id || 'usr_worker_001',
      workerCode: authUser?.id ? `EMP-${authUser.id.replace(/\D/g, '').slice(-4) || '1049'}` : 'EMP-1049',
      name: authUser?.name || 'Employee',
      email: authUser?.email || 'employee@cooltechuae.com',
      phone: '+971 50 123 4567',
      role: authUser?.role || 'Technician',
      skillLevel: authUser?.designation || 'Field Service Specialist',
      department: authUser?.department || 'Field HVAC Operations & Maintenance',
      assignedManager: authUser?.managerType || 'Operations Manager',
      assignedVehicle: 'Toyota HiAce Service Van #07 (DXB 48291)',
      driverLicenseNumber: 'UAE-DXB-994821',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family Member',
        phone: '+971 50 987 6543',
      },
      metrics: {
        completedJobs: 0,
        onTimeRate: 100,
        averageRating: 5.0,
        hoursThisMonth: 0,
        safetyScore: 100,
      },
    };

    if (typeof window === 'undefined') return defaultData;

    try {
      const key = `cool_worker_profile_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: WorkerProfileData = JSON.parse(stored);
        if (authUser?.name) parsed.name = authUser.name;
        if (authUser?.email) parsed.email = authUser.email;
        if (authUser?.designation) parsed.skillLevel = authUser.designation;
        if (authUser?.department) parsed.department = authUser.department;
        return parsed;
      }
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    } catch {
      return defaultData;
    }
  },

  updateProfile(updates: Partial<WorkerProfileData>, userId?: string): WorkerProfileData {
    const current = this.getProfile();
    const id = userId || current.id || 'default_worker';
    const updated: WorkerProfileData = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cool_worker_profile_${id}`, JSON.stringify(updated));
    }
    return updated;
  },
};
