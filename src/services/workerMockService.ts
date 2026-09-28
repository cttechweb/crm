import {
  WorkerTask,
  WorkerShiftAttendance,
  WorkerMaterialRequest,
  WorkerTimesheetEntry,
  WorkerProfileData,
  WorkerTaskStatus,
} from '@/types/worker';

const INITIAL_WORKER_TASKS: WorkerTask[] = [];

const INITIAL_MATERIAL_REQUESTS: WorkerMaterialRequest[] = [];

const INITIAL_TIMESHEET: WorkerTimesheetEntry[] = [];

export const WORKER_PROFILE_DEFAULT: WorkerProfileData = {
  id: 'usr_worker_001',
  workerCode: 'WRK-2049',
  name: 'Jordan Hayes',
  email: 'worker@cooltechuae.com',
  phone: '+971 54 812 9901',
  role: 'Technician',
  skillLevel: 'Senior Master Tech',
  department: 'Field HVAC Operations & Heavy Chillers',
  assignedManager: 'Alex Rivera (Operations Manager)',
  assignedVehicle: 'Toyota HiAce Service Van #07 (DXB 48291)',
  driverLicenseNumber: 'UAE-DXB-994821',
  emergencyContact: {
    name: 'Elena Hayes',
    relationship: 'Spouse',
    phone: '+971 55 981 3320',
  },
  metrics: {
    completedJobs: 142,
    onTimeRate: 98.6,
    averageRating: 4.95,
    hoursThisMonth: 168,
    safetyScore: 100,
  },
};

export const workerMockService = {
  // ── TASKS ──
  getTasks(): WorkerTask[] {
    if (typeof window === 'undefined') return INITIAL_WORKER_TASKS;
    try {
      const stored = localStorage.getItem('cool_worker_tasks');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('cool_worker_tasks', JSON.stringify(INITIAL_WORKER_TASKS));
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

  // ── PROFILE ──
  getProfile(): WorkerProfileData {
    return WORKER_PROFILE_DEFAULT;
  },
};
