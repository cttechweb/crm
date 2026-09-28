export type PlanType = 'Starter' | 'Professional' | 'Enterprise' | 'Custom';
export type OrgStatus = 'Active' | 'Suspended' | 'Trial' | 'Pending';
export type UserStatus = 'Active' | 'Suspended' | 'Invited' | 'Inactive';
export type UserRole = 'Super Admin' | 'Org Admin' | 'Sales Manager' | 'Sales Rep' | 'Auditor' | 'Support';
export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  plan: PlanType;
  status: OrgStatus;
  adminName: string;
  adminEmail: string;
  seatsTotal: number;
  seatsUsed: number;
  storageUsedGb: number;
  storageLimitGb: number;
  monthlyRevenue: number;
  createdAt: string;
  renewalDate: string;
  activeLeadsCount: number;
  activeDealsCount: number;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  orgId: string;
  orgName: string;
  status: UserStatus;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  location?: string;
}

export interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface RoleDefinition {
  id: string;
  name: UserRole;
  description: string;
  usersCount: number;
  isSystem: boolean;
  permissions: Permission[];
}

export interface ConfigItem {
  id: string;
  name: string;
  category: 'lead-sources' | 'lead-status' | 'deal-stages' | 'customer-types' | 'industries' | 'activity-types' | 'task-priorities' | 'tags';
  color?: string;
  description?: string;
  order?: number;
  isActive: boolean;
  count?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  action: string;
  entityType: 'Organization' | 'User' | 'Role' | 'Configuration' | 'Security' | 'Billing' | 'Data';
  entityName: string;
  ipAddress: string;
  severity: SeverityLevel;
  details: string;
  payload?: Record<string, unknown>;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'system' | 'security' | 'billing' | 'tenant';
  severity: SeverityLevel;
  read: boolean;
  targetOrg?: string;
}

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  avgRevenuePerOrg: number;
  platformUptime: string;
  storageUsedTotalGb: number;
}
