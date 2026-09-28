export type WorkerTaskStatus =
  | 'Pending'
  | 'Accepted'
  | 'On The Way'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled';

export type WorkerTaskPriority = 'Urgent' | 'High' | 'Normal' | 'Low';

export interface TaskChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface TaskPartUsed {
  id: string;
  partCode: string;
  partName: string;
  quantity: number;
  unitCost: number;
}

export interface WorkerTask {
  id: string;
  taskNumber: string; // e.g. TSK-4091
  title: string;
  serviceType: string; // e.g. 'HVAC Preventative Maintenance', 'Chiller Compressor Repair'
  priority: WorkerTaskPriority;
  status: WorkerTaskStatus;
  clientName: string;
  clientCompany: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  cityArea: string; // e.g. 'Business Bay, Dubai'
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number;
  actualHoursSpent?: number;
  assignedManager: string;
  description: string;
  checklist: TaskChecklistItem[];
  partsUsed: TaskPartUsed[];
  technicianNotes?: string;
  customerSignature?: string; // base64 or signature string
  customerSignedBy?: string;
  signedAt?: string;
  completionPhotos?: string[];
  rating?: number; // 1-5 stars from customer
  customerFeedback?: string;
}

export interface WorkerShiftAttendance {
  isClockedIn: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  activeDurationSeconds: number;
  currentLocation?: string;
  todayDate: string;
  breakDurationMinutes: number;
}

export interface WorkerMaterialRequest {
  id: string;
  requestNumber: string; // e.g. REQ-7721
  taskNumber?: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string; // e.g. 'Pcs', 'Kg', 'Ltr', 'Meters'
  urgency: 'Standard' | 'Urgent' | 'Critical (Site Stopped)';
  status: 'Pending Approval' | 'Approved' | 'Dispatched' | 'Collected' | 'Rejected';
  requestedAt: string;
  approvedBy?: string;
  notes?: string;
}

export interface WorkerTimesheetEntry {
  id: string;
  date: string;
  taskNumber: string;
  taskTitle: string;
  clientName: string;
  regularHours: number;
  overtimeHours: number;
  status: 'Approved' | 'Pending Review' | 'Submitted';
  workSummary: string;
}

export interface WorkerProfileData {
  id: string;
  workerCode: string;
  name: string;
  email: string;
  phone: string;
  role: 'Technician' | 'Field Engineer' | 'Service Specialist' | 'Apprentice';
  skillLevel: 'Senior Master Tech' | 'Grade A Certified' | 'Grade B' | 'Junior Tech';
  department: string;
  assignedManager: string;
  assignedVehicle: string;
  driverLicenseNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  metrics: {
    completedJobs: number;
    onTimeRate: number; // e.g. 98.4%
    averageRating: number; // e.g. 4.9
    hoursThisMonth: number;
    safetyScore: number;
  };
}
