'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Organization,
  PlatformUser,
  RoleDefinition,
  ConfigItem,
  AuditLog,
  SystemNotification,
  PlatformMetrics,
  OrgStatus,
  UserStatus,
  UserRole,
} from '@/types/super-admin';
import {
  mockOrganizations,
  mockPlatformUsers,
  mockRoles,
  mockConfigItems,
  mockAuditLogs,
  mockNotifications,
  mockPlatformMetrics,
} from '@/data/mockSuperAdminData';

interface SuperAdminContextType {
  organizations: Organization[];
  users: PlatformUser[];
  roles: RoleDefinition[];
  configItems: ConfigItem[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  metrics: PlatformMetrics;

  // Organization Actions
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'activeLeadsCount' | 'activeDealsCount' | 'seatsUsed' | 'storageUsedGb'>) => void;
  toggleOrgStatus: (id: string) => void;
  deleteOrganization: (id: string) => void;

  // User Actions
  addUser: (user: Omit<PlatformUser, 'id' | 'createdAt' | 'lastLogin'>) => void;
  toggleUserStatus: (id: string) => void;
  updateUserRole: (id: string, newRole: UserRole) => void;
  deleteUser: (id: string) => void;

  // Role Actions
  updateRolePermission: (roleId: string, module: string, field: 'view' | 'create' | 'edit' | 'delete' | 'export', value: boolean) => void;

  // Config Actions
  addConfigItem: (item: Omit<ConfigItem, 'id' | 'count'>) => void;
  updateConfigItem: (id: string, updates: Partial<ConfigItem>) => void;
  deleteConfigItem: (id: string) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Search & Global filter
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [users, setUsers] = useState<PlatformUser[]>(mockPlatformUsers);
  const [roles, setRoles] = useState<RoleDefinition[]>(mockRoles);
  const [configItems, setConfigItems] = useState<ConfigItem[]>(mockConfigItems);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Recompute live metrics based on state
  const metrics: PlatformMetrics = {
    ...mockPlatformMetrics,
    totalOrganizations: organizations.length,
    activeOrganizations: organizations.filter((o) => o.status === 'Active').length,
    suspendedOrganizations: organizations.filter((o) => o.status === 'Suspended').length,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'Active').length,
    monthlyRecurringRevenue: organizations.reduce((acc, org) => acc + (org.status === 'Active' ? org.monthlyRevenue : 0), 0),
  };

  const addAuditEntry = (action: string, entityType: AuditLog['entityType'], entityName: string, details: string, severity: AuditLog['severity'] = 'info') => {
    const newEntry: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Antigravity SuperAdmin',
      userEmail: 'superadmin@crmplatform.io',
      action,
      entityType,
      entityName,
      ipAddress: '192.168.1.1',
      severity,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const addOrganization = (orgData: Omit<Organization, 'id' | 'createdAt' | 'activeLeadsCount' | 'activeDealsCount' | 'seatsUsed' | 'storageUsedGb'>) => {
    const newOrg: Organization = {
      ...orgData,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      seatsUsed: 1,
      storageUsedGb: 2,
      activeLeadsCount: 0,
      activeDealsCount: 0,
    };
    setOrganizations((prev) => [newOrg, ...prev]);
    addAuditEntry('ORGANIZATION_CREATED', 'Organization', newOrg.name, `New organization registered with plan ${newOrg.plan}`);
  };

  const toggleOrgStatus = (id: string) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === id) {
          const newStatus: OrgStatus = org.status === 'Active' ? 'Suspended' : 'Active';
          addAuditEntry(
            newStatus === 'Active' ? 'ORGANIZATION_REACTIVATED' : 'ORGANIZATION_SUSPENDED',
            'Organization',
            org.name,
            `Status changed from ${org.status} to ${newStatus}`,
            newStatus === 'Suspended' ? 'warning' : 'info'
          );
          return { ...org, status: newStatus };
        }
        return org;
      })
    );
  };

  const deleteOrganization = (id: string) => {
    const target = organizations.find((o) => o.id === id);
    if (target) {
      setOrganizations((prev) => prev.filter((o) => o.id !== id));
      addAuditEntry('ORGANIZATION_DELETED', 'Organization', target.name, `Organization deleted from platform`, 'critical');
    }
  };

  const addUser = (userData: Omit<PlatformUser, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser: PlatformUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
    };
    setUsers((prev) => [newUser, ...prev]);
    addAuditEntry('USER_INVITED', 'User', newUser.name, `Invited user ${newUser.email} with role ${newUser.role}`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus: UserStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          addAuditEntry('USER_STATUS_UPDATED', 'User', u.name, `User status changed to ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const updateUserRole = (id: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          addAuditEntry('USER_ROLE_CHANGED', 'User', u.name, `Role updated from ${u.role} to ${newRole}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addAuditEntry('USER_DELETED', 'User', target.name, `User ${target.email} removed from platform`, 'warning');
    }
  };

  const updateRolePermission = (roleId: string, module: string, field: 'view' | 'create' | 'edit' | 'delete' | 'export', value: boolean) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          const updatedPermissions = role.permissions.map((p) => {
            if (p.module === module) {
              return { ...p, [field]: value };
            }
            return p;
          });
          return { ...role, permissions: updatedPermissions };
        }
        return role;
      })
    );
    addAuditEntry('ROLE_PERMISSIONS_UPDATED', 'Role', roleId, `Updated ${module} ${field} permission to ${value}`);
  };

  const addConfigItem = (itemData: Omit<ConfigItem, 'id' | 'count'>) => {
    const newItem: ConfigItem = {
      ...itemData,
      id: `cfg-${Date.now()}`,
      count: 0,
    };
    setConfigItems((prev) => [...prev, newItem]);
    addAuditEntry('CONFIG_ITEM_ADDED', 'Configuration', newItem.name, `Added new ${newItem.category} item`);
  };

  const updateConfigItem = (id: string, updates: Partial<ConfigItem>) => {
    setConfigItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    addAuditEntry('CONFIG_ITEM_UPDATED', 'Configuration', id, `Updated configuration settings`);
  };

  const deleteConfigItem = (id: string) => {
    const target = configItems.find((c) => c.id === id);
    if (target) {
      setConfigItems((prev) => prev.filter((c) => c.id !== id));
      addAuditEntry('CONFIG_ITEM_DELETED', 'Configuration', target.name, `Removed ${target.name} from ${target.category}`);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notifData: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <SuperAdminContext.Provider
      value={{
        organizations,
        users,
        roles,
        configItems,
        auditLogs,
        notifications,
        metrics,
        addOrganization,
        toggleOrgStatus,
        deleteOrganization,
        addUser,
        toggleUserStatus,
        updateUserRole,
        deleteUser,
        updateRolePermission,
        addConfigItem,
        updateConfigItem,
        deleteConfigItem,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        globalSearchQuery,
        setGlobalSearchQuery,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
}
