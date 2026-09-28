/**
 * Mock Authentication Service for Frontend-Only Development Phase
 * Designed with standard async method signatures for seamless 1:1 replacement
 * with real backend APIs in Phase 2/3.
 */

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee' | 'worker';

export interface UserModulePermissions {
  [key: string]: boolean | undefined;
  dashboard?: boolean;
  tasks?: boolean;
  marketing?: boolean;
  leads?: boolean;
  customers?: boolean;
  sales?: boolean;
  invoices?: boolean;
  purchase?: boolean;
  manufacturing?: boolean;
  reports?: boolean;
  financials?: boolean;
  service?: boolean;
  materials?: boolean;
  timesheet?: boolean;
  fileManager?: boolean;
  whatsapp?: boolean;
  settings?: boolean;
  users?: boolean;
}

export interface UserActionPermissions {
  [key: string]: boolean | undefined;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canView?: boolean;
  canPrint?: boolean;
  canApprove?: boolean;
  canImport?: boolean;
  canReassign?: boolean;
  canViewFinancials?: boolean;
}

export interface MockAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatar?: string;
  designation?: string;
  department?: string;
  profileType?: string;
  managerType?: string;
  employeeType?: string;
  managerId?: string | number | null;
  dataScope?: string;
  modulePermissions?: UserModulePermissions;
  actionPermissions?: UserActionPermissions;
}

export function resolveDefaultPermissions(
  profileType: string = 'Sales',
  role?: string,
  subType?: string
): {
  modulePermissions: Record<string, boolean>;
  actionPermissions: Record<string, boolean>;
  dataScope: string;
} {
  const p = (profileType || '').toLowerCase();
  const r = (role || '').toLowerCase();
  const s = (subType || '').toLowerCase();

  // Super Admin
  if (r === 'super_admin' || p.includes('super admin')) {
    return {
      modulePermissions: {
        dashboard: true,
        tasks: true,
        marketing: true,
        leads: true,
        customers: true,
        sales: true,
        invoices: true,
        purchase: true,
        manufacturing: true,
        service: true,
        materials: true,
        timesheet: true,
        whatsapp: true,
        financials: true,
        reports: true,
        fileManager: true,
        users: true,
        settings: true,
      },
      actionPermissions: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canView: true,
        canPrint: true,
        canApprove: true,
        canImport: true,
        canReassign: true,
        canViewFinancials: true,
      },
      dataScope: 'all' as const,
    };
  }

  // Admin
  if (r === 'admin' || p.includes('admin')) {
    return {
      modulePermissions: {
        dashboard: true,
        tasks: true,
        marketing: true,
        leads: true,
        customers: true,
        sales: true,
        invoices: true,
        purchase: true,
        manufacturing: true,
        service: true,
        materials: true,
        timesheet: true,
        whatsapp: true,
        financials: true,
        reports: true,
        fileManager: true,
        users: true,
        settings: true,
      },
      actionPermissions: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canView: true,
        canPrint: true,
        canApprove: true,
        canImport: true,
        canReassign: true,
        canViewFinancials: true,
      },
      dataScope: 'all' as const,
    };
  }

  // Manager Types
  if (r === 'manager' || p.includes('manager')) {
    const isSales = s.includes('sales') || p.includes('sales');
    const isPurchase = s.includes('purchase') || p.includes('purchase');
    const isMarketing = s.includes('marketing') || p.includes('marketing') || p.includes('market');
    const isOperations = s.includes('operation') || p.includes('operation');

    if (isPurchase) {
      return {
        modulePermissions: {
          dashboard: true,
          tasks: true,
          purchase: true,
          materials: true,
          invoices: true,
          reports: true,
          fileManager: true,
          leads: false,
          customers: false,
          sales: false,
          manufacturing: false,
          service: false,
          timesheet: false,
          marketing: false,
          whatsapp: false,
          financials: false,
          users: false,
          settings: false,
        },
        actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: true, canView: true, canPrint: true, canApprove: true },
        dataScope: 'team' as const,
      };
    }

    if (isMarketing) {
      return {
        modulePermissions: {
          dashboard: true,
          tasks: true,
          marketing: true,
          whatsapp: true,
          leads: true,
          customers: true,
          reports: true,
          fileManager: true,
          sales: false,
          invoices: false,
          purchase: false,
          manufacturing: false,
          service: false,
          materials: false,
          timesheet: false,
          financials: false,
          users: false,
          settings: false,
        },
        actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: true, canView: true, canPrint: true },
        dataScope: 'team' as const,
      };
    }

    if (isOperations) {
      return {
        modulePermissions: {
          dashboard: true,
          tasks: true,
          leads: true,
          customers: true,
          sales: true,
          purchase: true,
          manufacturing: true,
          service: true,
          materials: true,
          timesheet: true,
          reports: true,
          fileManager: true,
          invoices: true,
          marketing: false,
          whatsapp: false,
          financials: false,
          users: false,
          settings: false,
        },
        actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: true, canView: true, canPrint: true, canApprove: true },
        dataScope: 'team' as const,
      };
    }

    // Default / Sales Manager / Custom Manager
    return {
      modulePermissions: {
        dashboard: true,
        tasks: true,
        leads: true,
        customers: true,
        sales: true,
        invoices: true,
        reports: true,
        fileManager: true,
        marketing: false,
        purchase: false,
        manufacturing: false,
        service: false,
        materials: false,
        timesheet: false,
        whatsapp: false,
        financials: false,
        users: false,
        settings: false,
      },
      actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: true, canView: true, canPrint: true },
      dataScope: 'team' as const,
    };
  }

  // Employee Types
  const isEmpSales = s.includes('sales') || p.includes('sales');
  const isEmpPurchase = s.includes('purchase') || p.includes('purchase');
  const isEmpMarketing = s.includes('marketing') || p.includes('market');
  const isEmpOperations = s.includes('operation') || p.includes('service') || p.includes('worker');

  if (isEmpPurchase) {
    return {
      modulePermissions: {
        dashboard: true,
        tasks: true,
        purchase: true,
        materials: true,
        leads: false,
        customers: false,
        sales: false,
        invoices: false,
        reports: false,
        fileManager: false,
        settings: false,
      },
      actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: false, canView: true },
      dataScope: 'own' as const,
    };
  }

  if (isEmpMarketing) {
    return {
      modulePermissions: {
        dashboard: true,
        tasks: true,
        marketing: true,
        whatsapp: true,
        leads: true,
        customers: false,
        sales: false,
        purchase: false,
        reports: false,
        settings: false,
      },
      actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: false, canView: true },
      dataScope: 'own' as const,
    };
  }

  if (isEmpOperations) {
    return {
      modulePermissions: {
        dashboard: true,
        tasks: true,
        service: true,
        materials: true,
        timesheet: true,
        manufacturing: true,
        leads: false,
        customers: false,
        sales: false,
        purchase: false,
        reports: false,
        settings: false,
      },
      actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: false, canView: true },
      dataScope: 'own' as const,
    };
  }

  // Default Employee / Sales Employee
  return {
    modulePermissions: {
      dashboard: true,
      tasks: true,
      marketing: false,
      leads: true,
      customers: true,
      sales: true,
      purchase: false,
      reports: false,
      settings: false,
    },
    actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: false, canView: true },
    dataScope: 'own' as const,
  };
}

export interface MockLoginResult {
  success: boolean;
  user?: MockAuthUser;
  redirectUrl?: string;
  error?: string;
}

// Pre-configured mock user database for frontend authentication simulation
const MOCK_CREDENTIALS: Array<{
  email: string;
  password: string;
  user: MockAuthUser;
  redirectUrl: string;
}> = [
    {
      email: 'admin@gmail.com',
      password: 'admin@123',
      redirectUrl: '/admin/dashboard',
      user: {
        id: 'usr_admin_001',
        name: 'Cool Admin',
        email: 'admin@gmail.com',
        role: 'admin',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        designation: 'Managing Director / Business Admin',
      },
    },
    {
      email: 'superadmin@gmail.com',
      password: 'super@123',
      redirectUrl: '/dashboard',
      user: {
        id: 'usr_superadmin_001',
        name: 'System Super Admin',
        email: 'superadmin@gmail.com',
        role: 'super_admin',
        organizationId: 'org_platform_root',
        organizationName: 'Platform Central',
        designation: 'System Administrator',
      },
    },
    {
      email: 'cooladmin@gmail.com',
      password: 'cool@123',
      redirectUrl: '/admin/dashboard',
      user: {
        id: 'usr_admin_001',
        name: 'Cool Admin',
        email: 'cooladmin@gmail.com',
        role: 'admin',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        designation: 'Managing Director / Business Admin',
      },
    },
    {
      email: 'admin@cooltechuae.com',
      password: 'cool@123',
      redirectUrl: '/admin/dashboard',
      user: {
        id: 'usr_admin_002',
        name: 'Enterprise Admin',
        email: 'admin@cooltechuae.com',
        role: 'admin',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        designation: 'Chief Operating Officer',
      },
    },
    {
      email: 'superadmin@crmplatform.io',
      password: 'super@123',
      redirectUrl: '/dashboard',
      user: {
        id: 'usr_superadmin_001',
        name: 'System Super Admin',
        email: 'superadmin@crmplatform.io',
        role: 'super_admin',
        organizationId: 'org_platform_root',
        organizationName: 'Platform Central',
        designation: 'System Administrator',
      },
    },
  // --- Pre-configured Managers ---
  {
    email: 'manager1@company.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_1',
      name: 'Manager 1',
      email: 'manager1@company.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      designation: 'Sales Manager',
      profileType: 'Manager',
      managerType: 'Sales Manager',
    },
  },
  {
    email: 'manager1@test.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_1',
      name: 'Manager 1',
      email: 'manager1@test.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      designation: 'Sales Manager',
      profileType: 'Manager',
      managerType: 'Sales Manager',
    },
  },
  {
    email: 'manager2@company.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_2',
      name: 'Manager 2',
      email: 'manager2@company.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      designation: 'Purchase Manager',
      profileType: 'Manager',
      managerType: 'Purchase Manager',
    },
  },
  {
    email: 'manager2@test.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_2',
      name: 'Manager 2',
      email: 'manager2@test.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      designation: 'Purchase Manager',
      profileType: 'Manager',
      managerType: 'Purchase Manager',
    },
  },
  {
    email: 'manager3@company.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_3',
      name: 'Manager 3',
      email: 'manager3@company.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      designation: 'Marketing Manager',
      profileType: 'Manager',
      managerType: 'Marketing Manager',
    },
  },
  {
    email: 'manager3@test.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_3',
      name: 'Manager 3',
      email: 'manager3@test.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      designation: 'Marketing Manager',
      profileType: 'Manager',
      managerType: 'Marketing Manager',
    },
  },
  {
    email: 'manager4@company.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_4',
      name: 'Manager 4',
      email: 'manager4@company.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      designation: 'Operations Manager',
      profileType: 'Manager',
      managerType: 'Operations Manager',
    },
  },
  {
    email: 'manager4@test.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_4',
      name: 'Manager 4',
      email: 'manager4@test.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      designation: 'Operations Manager',
      profileType: 'Manager',
      managerType: 'Operations Manager',
    },
  },
  {
    email: 'manager@gmail.com',
    password: 'manager@123',
    redirectUrl: '/manager/dashboard',
    user: {
      id: 'mgr_1',
      name: 'Manager 1',
      email: 'manager@gmail.com',
      role: 'manager',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      designation: 'Sales Manager',
      profileType: 'Manager',
      managerType: 'Sales Manager',
    },
  },

  // --- Pre-configured Employees (10 distributed across 4 managers) ---
  {
    email: 'employee1@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_1',
      name: 'Employee 1',
      email: 'employee1@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
  {
    email: 'employee1@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_1',
      name: 'Employee 1',
      email: 'employee1@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
  {
    email: 'employee2@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_2',
      name: 'Employee 2',
      email: 'employee2@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
  {
    email: 'employee2@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_2',
      name: 'Employee 2',
      email: 'employee2@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
  {
    email: 'employee3@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_3',
      name: 'Employee 3',
      email: 'employee3@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
  {
    email: 'employee3@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_3',
      name: 'Employee 3',
      email: 'employee3@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
  {
    email: 'employee4@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_4',
      name: 'Employee 4',
      email: 'employee4@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Purchase Employee',
      profileType: 'Employee',
      employeeType: 'Purchase Employee',
      managerId: 'mgr_2',
    },
  },
  {
    email: 'employee4@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_4',
      name: 'Employee 4',
      email: 'employee4@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Purchase Employee',
      profileType: 'Employee',
      employeeType: 'Purchase Employee',
      managerId: 'mgr_2',
    },
  },
  {
    email: 'employee5@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_5',
      name: 'Employee 5',
      email: 'employee5@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Purchase Employee',
      profileType: 'Employee',
      employeeType: 'Purchase Employee',
      managerId: 'mgr_2',
    },
  },
  {
    email: 'employee5@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_5',
      name: 'Employee 5',
      email: 'employee5@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Purchase Employee',
      profileType: 'Employee',
      employeeType: 'Purchase Employee',
      managerId: 'mgr_2',
    },
  },
  {
    email: 'employee6@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_6',
      name: 'Employee 6',
      email: 'employee6@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Purchase Employee',
      profileType: 'Employee',
      employeeType: 'Purchase Employee',
      managerId: 'mgr_2',
    },
  },
  {
    email: 'employee6@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_6',
      name: 'Employee 6',
      email: 'employee6@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Purchase Employee',
      profileType: 'Employee',
      employeeType: 'Purchase Employee',
      managerId: 'mgr_2',
    },
  },
  {
    email: 'employee7@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_7',
      name: 'Employee 7',
      email: 'employee7@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Marketing Employee',
      profileType: 'Employee',
      employeeType: 'Marketing Employee',
      managerId: 'mgr_3',
    },
  },
  {
    email: 'employee7@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_7',
      name: 'Employee 7',
      email: 'employee7@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Marketing Employee',
      profileType: 'Employee',
      employeeType: 'Marketing Employee',
      managerId: 'mgr_3',
    },
  },
  {
    email: 'employee8@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_8',
      name: 'Employee 8',
      email: 'employee8@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Marketing Employee',
      profileType: 'Employee',
      employeeType: 'Marketing Employee',
      managerId: 'mgr_3',
    },
  },
  {
    email: 'employee8@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_8',
      name: 'Employee 8',
      email: 'employee8@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Marketing Employee',
      profileType: 'Employee',
      employeeType: 'Marketing Employee',
      managerId: 'mgr_3',
    },
  },
  {
    email: 'employee9@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_9',
      name: 'Employee 9',
      email: 'employee9@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Operations Employee',
      profileType: 'Employee',
      employeeType: 'Operations Employee',
      managerId: 'mgr_4',
    },
  },
  {
    email: 'employee9@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_9',
      name: 'Employee 9',
      email: 'employee9@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Operations Employee',
      profileType: 'Employee',
      employeeType: 'Operations Employee',
      managerId: 'mgr_4',
    },
  },
  {
    email: 'employee10@company.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_10',
      name: 'Employee 10',
      email: 'employee10@company.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Operations Employee',
      profileType: 'Employee',
      employeeType: 'Operations Employee',
      managerId: 'mgr_4',
    },
  },
  {
    email: 'employee10@test.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_10',
      name: 'Employee 10',
      email: 'employee10@test.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Operations Employee',
      profileType: 'Employee',
      employeeType: 'Operations Employee',
      managerId: 'mgr_4',
    },
  },
  {
    email: 'employee@gmail.com',
    password: 'employee@123',
    redirectUrl: '/worker/dashboard',
    user: {
      id: 'emp_1',
      name: 'Employee 1',
      email: 'employee@gmail.com',
      role: 'employee',
      organizationId: 'org_cool_tech_001',
      organizationName: 'Cool Technologies LLC',
      designation: 'Sales Employee',
      profileType: 'Employee',
      employeeType: 'Sales Employee',
      managerId: 'mgr_1',
    },
  },
];

export const authMockService = {
  /**
   * Simulates async user authentication and determines destination based on verified role
   */
  async login(email: string, password: string, rememberMe = true): Promise<MockLoginResult> {
    // Simulate brief network latency for realistic loading state
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check dynamically created Admins in localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
        if (storedAdminsRaw) {
          const storedAdmins = JSON.parse(storedAdminsRaw);
          if (Array.isArray(storedAdmins)) {
            const adminMatch = storedAdmins.find(
              (a: any) =>
                (a.email?.trim().toLowerCase() === normalizedEmail ||
                  a.username?.trim().toLowerCase() === normalizedEmail) &&
                (a.password === password || !a.password)
            );
            if (adminMatch) {
              if (adminMatch.status === 'Inactive') {
                return {
                  success: false,
                  error: 'This admin account has been deactivated. Please contact your Super Admin.',
                };
              }
              const mockUser: MockAuthUser = {
                id: adminMatch.id || `usr_${Date.now()}`,
                name: adminMatch.name,
                email: adminMatch.email,
                role: 'admin',
                organizationId: adminMatch.organizationId || 'org_cool_tech_001',
                organizationName: adminMatch.organizationName || 'Cool Technologies LLC',
                avatar: adminMatch.avatar,
                designation: adminMatch.designation || 'Admin',
              };
              const sessionData = {
                authenticated: true,
                user: mockUser,
                role: 'admin',
                rememberMe,
                timestamp: Date.now(),
              };
              localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
              if (rememberMe) {
                localStorage.setItem('cool_crm_remember_email', normalizedEmail);
              }
              return {
                success: true,
                user: mockUser,
                redirectUrl: '/admin/dashboard',
              };
            }
          }
        }
      } catch (e) {
        console.error('Error checking crm_admin_accounts_list during login:', e);
      }

      // 2. Check dynamically created Users in Settings (cezcon_crm_users_list)
      try {
        const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
        if (storedUsersRaw) {
          const storedUsers = JSON.parse(storedUsersRaw);
          if (Array.isArray(storedUsers)) {
            const userByIdentifier = storedUsers.find((u: any) => {
              const uEmail = u.email ? u.email.trim().toLowerCase() : '';
              const uUsername = u.username ? u.username.trim().toLowerCase() : '';
              const uPrefix = uUsername.split('@')[0];
              return (
                uEmail === normalizedEmail ||
                uUsername === normalizedEmail ||
                uPrefix === normalizedEmail
              );
            });

            if (userByIdentifier) {
              if (userByIdentifier.status === 'Inactive') {
                return {
                  success: false,
                  error: 'This account has been deactivated.',
                };
              }
              if (userByIdentifier.password && userByIdentifier.password !== password) {
                return {
                  success: false,
                  error: 'Invalid password. Please verify your credentials.',
                };
              }
              const isAdm =
                userByIdentifier.isAdmin ||
                (userByIdentifier.profileType &&
                  userByIdentifier.profileType.toLowerCase().includes('admin'));
              const isMgr =
                userByIdentifier.profileType &&
                (userByIdentifier.profileType.toLowerCase().includes('manager') ||
                  userByIdentifier.profileType.toLowerCase().includes('operation') ||
                  !!userByIdentifier.managerType);
              const userRole: UserRole = isAdm ? 'admin' : isMgr ? 'manager' : 'employee';
              const defaults = resolveDefaultPermissions(
                userByIdentifier.profileType || 'Sales',
                userRole,
                userByIdentifier.managerType || userByIdentifier.employeeType
              );

              const userIdStr = String(userByIdentifier.id || '');
              const normalizedId = userIdStr.startsWith('usr_') || userIdStr.startsWith('mgr_') || userIdStr.startsWith('emp_')
                ? userIdStr
                : `usr_${userIdStr}`;

              const mockUser: MockAuthUser = {
                id: normalizedId,
                name: userByIdentifier.name,
                email: userByIdentifier.email || normalizedEmail,
                role: userRole,
                organizationId: 'org_cool_tech_001',
                organizationName: 'Cool Technologies LLC',
                avatar: userByIdentifier.avatarImage,
                designation:
                  userByIdentifier.designation ||
                  userByIdentifier.managerType ||
                  userByIdentifier.employeeType ||
                  userByIdentifier.profileType ||
                  'Team Member',
                department: userByIdentifier.department || userByIdentifier.profileType || 'Sales',
                profileType: userByIdentifier.profileType || 'Sales',
                managerType: userByIdentifier.managerType,
                employeeType: userByIdentifier.employeeType,
                managerId: userByIdentifier.managerId || userByIdentifier.assignedManagerId || null,
                dataScope: userByIdentifier.dataScope || defaults.dataScope,
                modulePermissions: userByIdentifier.modulePermissions || defaults.modulePermissions,
                actionPermissions: userByIdentifier.actionPermissions || defaults.actionPermissions,
              };
              const sessionData = {
                authenticated: true,
                user: mockUser,
                role: userRole,
                rememberMe,
                timestamp: Date.now(),
              };
              localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
              if (rememberMe) {
                localStorage.setItem('cool_crm_remember_email', normalizedEmail);
              }
              return {
                success: true,
                user: mockUser,
                redirectUrl: isAdm
                  ? '/admin/dashboard'
                  : isMgr
                  ? '/manager/dashboard'
                  : '/worker/dashboard',
              };
            }
          }
        }
      } catch (e) {
        console.error('Error checking cezcon_crm_users_list during login:', e);
      }
    }

    // 3. Fallback to predefined static accounts
    const match = MOCK_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === normalizedEmail && c.password === password
    );

    if (!match) {
      return {
        success: false,
        error: 'Invalid email address or password. Please try again.',
      };
    }

    // Store active mock auth session
    if (typeof window !== 'undefined') {
      try {
        const sessionData = {
          authenticated: true,
          user: match.user,
          role: match.user.role,
          rememberMe,
          timestamp: Date.now(),
        };
        localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
        if (rememberMe) {
          localStorage.setItem('cool_crm_remember_email', normalizedEmail);
        } else {
          localStorage.removeItem('cool_crm_remember_email');
        }
      } catch (err) {
        console.error('Local storage error during authentication:', err);
      }
    }

    return {
      success: true,
      user: match.user,
      redirectUrl: match.redirectUrl,
    };
  },

  /**
   * Reads currently active mock session
   */
  getCurrentUser(): MockAuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('cool_crm_auth');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Clears mock session on logout
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cool_crm_auth');
      } catch (err) {
        console.error('Error during logout cleanup:', err);
      }
    }
  },
};
