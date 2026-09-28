export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: LeadStatus;
  source: string;
  value: number;
  assignedTo: {
    name: string;
    avatar: string;
    email: string;
  };
  tags: string[];
  createdAt: string;
  lastContacted: string;
  notesCount: number;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  priority: Priority;
  assignedTo: {
    name: string;
    avatar: string;
  };
  tags: string[];
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  annualRevenue: string;
  activeDealsCount: number;
  totalDealsValue: number;
  contactsCount: number;
  logo: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  priority: Priority;
  type: ActivityType;
  completed: boolean;
  assignedTo: string;
  relatedTo: {
    type: 'lead' | 'deal' | 'company';
    name: string;
  };
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  relatedEntity: string;
}
