export type ManagerRole = 'Operations Manager' | 'Sales Manager' | 'General Manager';

export interface ManagerAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  phone: string;
  role: ManagerRole;
  organizationId: string;
  organizationName: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  designation: string;
  department: string;
  teamSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianWorkload {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Available' | 'On Field' | 'Overloaded' | 'Off Duty';
  assignedTasks: number;
  completedToday: number;
  capacityPercentage: number;
  currentLocation?: string;
  specialization: string;
  phone: string;
}

export interface ManagerTask {
  id: string;
  title: string;
  customerName: string;
  assignedTo: string;
  assignedToAvatar?: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  dueDate: string;
  slaDeadline: string;
  category: 'HVAC Repair' | 'Maintenance' | 'Site Inspection' | 'Installation' | 'Quotation Review';
  location: string;
}

export interface LeadAssignmentItem {
  id: string;
  leadName: string;
  company: string;
  value: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Assigned' | 'Proposal Sent';
  assignedRep: string;
  source: string;
  createdDate: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface OpportunityItem {
  id: string;
  title: string;
  client: string;
  stage: 'Discovery' | 'Quotation Sent' | 'Negotiation' | 'Under Approval' | 'Won' | 'Lost';
  value: number;
  probability: number;
  owner: string;
  expectedCloseDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'Call' | 'Meeting' | 'Email' | 'Follow-up' | 'Site Visit';
  title: string;
  contactPerson: string;
  time: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Overdue';
  notes?: string;
}

export interface PerformanceMetric {
  title: string;
  value: string | number;
  target: string | number;
  growth: string;
  isPositive: boolean;
  period: string;
}
