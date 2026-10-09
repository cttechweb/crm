import { auth } from '@/firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Unsubscribe,
} from 'firebase/auth';

/**
 * Enterprise Authentication Service for Cool Tech CRM
 * Integrated with Firebase Authentication (Project: cool-tech-crm)
 * Connects Firebase User Identity to CRM Role-Based Permission Architecture.
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
  position?: string;
  department?: string;
  profileType?: string;
  managerType?: string;
  employeeType?: string;
  managerId?: string | number | null;
  reportsTo?: string | number | null;
  teamId?: string | null;
  dataScope?: string;
  modulePermissions?: UserModulePermissions;
  actionPermissions?: UserActionPermissions;
  firebaseUid?: string;
}

export const POSITION_HIERARCHY_CONFIG: Record<
  string,
  {
    crmRole: 'Super Admin' | 'Admin' | 'Manager' | 'Employee';
    department: 'Executive' | 'Management' | 'Sales' | 'Purchase';
    reportsToPositions: string[];
  }
> = {
  'CEO': {
    crmRole: 'Super Admin',
    department: 'Executive',
    reportsToPositions: [],
  },
  'COO': {
    crmRole: 'Admin',
    department: 'Management',
    reportsToPositions: ['CEO'],
  },
  'CSO': {
    crmRole: 'Manager',
    department: 'Sales',
    reportsToPositions: ['COO'],
  },
  'CPO': {
    crmRole: 'Manager',
    department: 'Purchase',
    reportsToPositions: ['COO'],
  },
  'Sales Manager': {
    crmRole: 'Manager',
    department: 'Sales',
    reportsToPositions: ['CSO'],
  },
  'Sales Executive': {
    crmRole: 'Employee',
    department: 'Sales',
    reportsToPositions: ['Sales Manager', 'CSO'],
  },
  'Sales Employee': {
    crmRole: 'Employee',
    department: 'Sales',
    reportsToPositions: ['Sales Manager', 'CSO'],
  },
  'Purchase Manager': {
    crmRole: 'Manager',
    department: 'Purchase',
    reportsToPositions: ['CPO'],
  },
  'Purchase Employee': {
    crmRole: 'Employee',
    department: 'Purchase',
    reportsToPositions: ['Purchase Manager', 'CPO'],
  },
};

/**
 * Final CRM Role Hierarchy & Authority Matrix
 * 
 *                    CREATE SUPER ADMIN   CREATE ADMIN   CREATE MANAGER   CREATE EMPLOYEE
 * SUPER ADMIN                YES                YES             YES              YES
 * ADMIN                       NO                 NO              YES              YES
 * MANAGER                     NO                 NO              NO               YES
 * EMPLOYEE                    NO                 NO              NO               NO
 */
export function canCreateRole(currentUserRole: UserRole | string, targetRole: UserRole | string): boolean {
  const cur = String(currentUserRole || '').toLowerCase().trim();
  const tgt = String(targetRole || '').toLowerCase().trim();

  if (cur === 'super_admin' || cur === 'super admin') {
    return true; // Super admin can create all roles
  }

  if (cur === 'admin') {
    // Admin can create Managers, Employees, Workers (CANNOT create Super Admin or Admin)
    return tgt === 'manager' || tgt === 'employee' || tgt === 'worker' || tgt === 'service_supervisor' || tgt === 'service supervisor';
  }

  if (cur === 'manager') {
    // Manager can only create Employees or Workers for their own team
    return tgt === 'employee' || tgt === 'worker';
  }

  // Employee cannot create users unless explicitly granted
  return false;
}

export function validateUserCreationAuthority(
  currentUser: MockAuthUser | null,
  targetProfile: string,
  targetRole?: string
): { allowed: boolean; error?: string } {
  if (!currentUser) {
    return { allowed: false, error: 'Authentication required: No active session found.' };
  }

  const curRole = currentUser.role;
  const p = (targetProfile || '').toLowerCase();
  const r = (targetRole || '').toLowerCase();

  const isTargetSuper = p.includes('super admin') || r === 'super_admin';
  const isTargetAdmin = !isTargetSuper && (p.includes('admin') || r === 'admin');
  const isTargetManager = !isTargetSuper && !isTargetAdmin && (p.includes('manager') || r === 'manager');
  const isTargetEmployee = !isTargetSuper && !isTargetAdmin && !isTargetManager;

  const resolvedTargetRole = isTargetSuper
    ? 'super_admin'
    : isTargetAdmin
      ? 'admin'
      : isTargetManager
        ? 'manager'
        : 'employee';

  if (!canCreateRole(curRole, resolvedTargetRole)) {
    return {
      allowed: false,
      error: `Authority Restriction: A user with role "${curRole}" cannot create a user with role "${resolvedTargetRole}".`,
    };
  }

  return { allowed: true };
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
          settings: true,
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
          settings: true,
        },
        actionPermissions: { canCreate: true, canEdit: true, canDelete: false, canExport: true, canView: true, canPrint: true, canApprove: true },
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
          settings: true,
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
        settings: true,
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
        name: 'Nafal',
        email: 'superadmin@gmail.com',
        role: 'super_admin',
        position: 'CEO',
        department: 'Executive',
        organizationId: 'org_platform_root',
        organizationName: 'Platform Central',
        designation: 'CEO / Super Admin',
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
        position: 'COO',
        department: 'Management',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        designation: 'COO / Admin',
      },
    },
    {
      email: 'shemin@gmail.com',
      password: 'cool@123',
      redirectUrl: '/admin/dashboard',
      user: {
        id: 'usr_shemin_001',
        name: 'Muhammed Shemin',
        email: 'shemin@gmail.com',
        role: 'admin',
        position: 'COO',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        designation: 'COO / Business Admin',
        profileType: 'Admin',
        department: 'Management',
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
        position: 'COO',
        department: 'Management',
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
        name: 'Nafal',
        email: 'superadmin@crmplatform.io',
        role: 'super_admin',
        position: 'CEO',
        department: 'Executive',
        organizationId: 'org_platform_root',
        organizationName: 'Platform Central',
        designation: 'CEO / Super Admin',
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
        position: 'CSO',
        department: 'Sales',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        designation: 'CSO / Sales Manager',
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
        name: 'Rashid Ali',
        email: 'manager2@test.com',
        role: 'manager',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        designation: 'Purchase Manager',
        profileType: 'Manager',
        managerType: 'Purchase Manager',
        department: 'Purchase',
      },
    },
    {
      email: 'purchasemanager@gmail.com',
      password: 'manager@123',
      redirectUrl: '/manager/dashboard',
      user: {
        id: 'usr_rashid_001',
        name: 'Rashid Ali',
        email: 'purchasemanager@gmail.com',
        role: 'manager',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        designation: 'Purchase Manager',
        profileType: 'Manager',
        managerType: 'Purchase Manager',
        department: 'Purchase',
      },
    },
    {
      email: 'purchase.manager@gmail.com',
      password: 'manager@123',
      redirectUrl: '/manager/dashboard',
      user: {
        id: 'usr_rashid_001',
        name: 'Rashid Ali',
        email: 'purchase.manager@gmail.com',
        role: 'manager',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        designation: 'Purchase Manager',
        profileType: 'Manager',
        managerType: 'Purchase Manager',
        department: 'Purchase',
      },
    },
    {
      email: 'shibil@gmail.com',
      password: 'shibil@123',
      redirectUrl: '/manager/dashboard',
      user: {
        id: 'mgr_1',
        name: 'Muhammed Shibil',
        email: 'shibil@gmail.com',
        role: 'manager',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        designation: 'Sales Manager',
        profileType: 'Manager',
        managerType: 'Sales Manager',
        department: 'Sales',
      },
    },
    {
      email: 'afsal@gmail.com',
      password: 'afsal@123',
      redirectUrl: '/manager/dashboard',
      user: {
        id: 'mgr_3',
        name: 'Afsal',
        email: 'afsal@gmail.com',
        role: 'manager',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        designation: 'Marketing Manager',
        profileType: 'Manager',
        managerType: 'Marketing Manager',
        department: 'Marketing',
      },
    },
    {
      email: 'afsakl@gmail.com',
      password: 'afsal@123',
      redirectUrl: '/manager/dashboard',
      user: {
        id: 'mgr_3',
        name: 'Afsal',
        email: 'afsal@gmail.com',
        role: 'manager',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        designation: 'Marketing Manager',
        profileType: 'Manager',
        managerType: 'Marketing Manager',
        department: 'Marketing',
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

    // --- Real Company Team Credentials ---
    {
      email: 'shaheer@gmail.com',
      password: 'cool@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_shaheer_001',
        name: 'shaheer',
        email: 'shaheer@gmail.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
        department: 'Sales',
        managerId: 'mgr_1',
      },
    },
    {
      email: 'adhil@gmail.com',
      password: 'cool@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_adhil_001',
        name: 'adhil',
        email: 'adhil@gmail.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
        department: 'Sales',
        managerId: 'mgr_1',
      },
    },
    {
      email: 'shameem@gmail.com',
      password: 'cool@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_shameem_001',
        name: 'shameem',
        email: 'shameem@gmail.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Marketing Executive',
        profileType: 'Employee',
        employeeType: 'Marketing Employee',
        department: 'Marketing',
        managerId: 'mgr_3',
      },
    },
    {
      email: 'purchaseemp@gmail.com',
      password: 'emp@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_faisal_001',
        name: 'Faisal Khan',
        email: 'purchaseemp@gmail.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Purchase Employee',
        profileType: 'Employee',
        employeeType: 'Purchase Employee',
        department: 'Purchase',
        managerId: 'usr_rashid_001',
      },
    },
    {
      email: 'purchase.emp@gmail.com',
      password: 'emp@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_faisal_001',
        name: 'Faisal Khan',
        email: 'purchase.emp@gmail.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Purchase Employee',
        profileType: 'Employee',
        employeeType: 'Purchase Employee',
        department: 'Purchase',
        managerId: 'usr_rashid_001',
      },
    },
    // --- Pre-configured Employees ---
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
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
      email: 'arun@gmail.com',
      password: 'arun@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_arun_001',
        name: 'Arun',
        email: 'arun@gmail.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Marketing Employee',
        profileType: 'Employee',
        employeeType: 'Marketing Employee',
        department: 'Marketing',
        managerId: 'mgr_3',
      },
    },
    {
      email: 'arun@company.com',
      password: 'arun@123',
      redirectUrl: '/worker/dashboard',
      user: {
        id: 'emp_arun_001',
        name: 'Arun',
        email: 'arun@company.com',
        role: 'employee',
        organizationId: 'org_cool_tech_001',
        organizationName: 'Cool Technologies LLC',
        designation: 'Marketing Employee',
        profileType: 'Employee',
        employeeType: 'Marketing Employee',
        department: 'Marketing',
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
        designation: 'Sales Executive',
        profileType: 'Employee',
        employeeType: 'Sales Executive',
        managerId: 'mgr_1',
      },
    },
  ];

export function resolveCrmUserByEmail(
  email: string,
  firebaseUid?: string
): { user: MockAuthUser; redirectUrl: string; isInactive?: boolean } {
  const normalizedEmail = (email || '').trim().toLowerCase();

  // 1. Check dynamically created Admins in localStorage (crm_admin_accounts_list)
  if (typeof window !== 'undefined') {
    try {
      const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
      if (storedAdminsRaw) {
        const storedAdmins = JSON.parse(storedAdminsRaw);
        if (Array.isArray(storedAdmins)) {
          const adminMatch = storedAdmins.find(
            (a: any) =>
            (a.email?.trim().toLowerCase() === normalizedEmail ||
              a.username?.trim().toLowerCase() === normalizedEmail)
          );
          if (adminMatch) {
            if (adminMatch.status === 'Inactive') {
              return {
                user: {
                  id: adminMatch.id || `usr_${Date.now()}`,
                  name: adminMatch.name,
                  email: adminMatch.email,
                  role: 'admin',
                  organizationId: adminMatch.organizationId || 'org_cool_tech_001',
                  organizationName: adminMatch.organizationName || 'Cool Technologies LLC',
                },
                redirectUrl: '/admin/dashboard',
                isInactive: true,
              };
            }
            const defaults = resolveDefaultPermissions('Admin', 'admin');
            const mockUser: MockAuthUser = {
              id: adminMatch.id || `usr_${Date.now()}`,
              name: adminMatch.name,
              email: adminMatch.email,
              role: 'admin',
              organizationId: adminMatch.organizationId || 'org_cool_tech_001',
              organizationName: adminMatch.organizationName || 'Cool Technologies LLC',
              avatar: adminMatch.avatar,
              designation: adminMatch.designation || 'Admin',
              department: 'Administration',
              profileType: 'Admin',
              dataScope: 'all',
              modulePermissions: defaults.modulePermissions,
              actionPermissions: defaults.actionPermissions,
              firebaseUid,
            };
            return {
              user: mockUser,
              redirectUrl: '/admin/dashboard',
            };
          }
        }
      }
    } catch (e) {
      console.error('Error checking crm_admin_accounts_list:', e);
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
            const isInactive = userByIdentifier.status === 'Inactive';
            const isSuper =
              userByIdentifier.profileType &&
              (userByIdentifier.profileType.toLowerCase().includes('super') ||
                userByIdentifier.role === 'super_admin');
            const isAdm =
              !isSuper &&
              (userByIdentifier.isAdmin ||
                (userByIdentifier.profileType &&
                  userByIdentifier.profileType.toLowerCase().includes('admin')));
            const isMgr =
              !isSuper &&
              !isAdm &&
              (userByIdentifier.profileType &&
                (userByIdentifier.profileType.toLowerCase().includes('manager') ||
                  userByIdentifier.profileType.toLowerCase().includes('operation') ||
                  !!userByIdentifier.managerType));
            const userRole: UserRole = isSuper
              ? 'super_admin'
              : isAdm
                ? 'admin'
                : isMgr
                  ? 'manager'
                  : 'employee';
            const defaults = resolveDefaultPermissions(
              userByIdentifier.profileType || 'Sales',
              userRole,
              userByIdentifier.managerType || userByIdentifier.employeeType
            );

            const userIdStr = String(userByIdentifier.id || '');
            const normalizedId =
              userIdStr.startsWith('usr_') ||
                userIdStr.startsWith('mgr_') ||
                userIdStr.startsWith('emp_')
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
              department:
                userByIdentifier.department ||
                userByIdentifier.profileType ||
                'Sales',
              profileType: userByIdentifier.profileType || 'Sales',
              managerType: userByIdentifier.managerType,
              employeeType: userByIdentifier.employeeType,
              managerId:
                userByIdentifier.managerId ||
                userByIdentifier.assignedManagerId ||
                userByIdentifier.reportingManagerId ||
                null,
              dataScope: userByIdentifier.dataScope || defaults.dataScope,
              modulePermissions:
                userByIdentifier.modulePermissions || defaults.modulePermissions,
              actionPermissions:
                userByIdentifier.actionPermissions || defaults.actionPermissions,
              firebaseUid,
            };

            return {
              user: mockUser,
              redirectUrl: isSuper
                ? '/dashboard'
                : isAdm
                  ? '/admin/dashboard'
                  : isMgr
                    ? '/manager/dashboard'
                    : '/worker/dashboard',
              isInactive,
            };
          }
        }
      }
    } catch (e) {
      console.error('Error checking cezcon_crm_users_list:', e);
    }
  }

  // 3. Match against pre-configured static accounts
  const staticMatch = MOCK_CREDENTIALS.find(
    (c) => c.email.toLowerCase() === normalizedEmail
  );

  if (staticMatch) {
    const defaults = resolveDefaultPermissions(
      staticMatch.user.profileType || 'Sales',
      staticMatch.user.role,
      staticMatch.user.managerType || staticMatch.user.employeeType
    );
    return {
      user: {
        ...staticMatch.user,
        modulePermissions: staticMatch.user.modulePermissions || defaults.modulePermissions,
        actionPermissions: staticMatch.user.actionPermissions || defaults.actionPermissions,
        dataScope: staticMatch.user.dataScope || defaults.dataScope,
        firebaseUid,
      },
      redirectUrl: staticMatch.redirectUrl,
    };
  }

  // 4. Fallback for any newly authenticated Firebase user
  const isSuper = normalizedEmail.includes('super');
  const isAdm = !isSuper && normalizedEmail.includes('admin');
  const isMgr = !isSuper && !isAdm && normalizedEmail.includes('manager');
  const fallbackRole: UserRole = isSuper
    ? 'super_admin'
    : isAdm
      ? 'admin'
      : isMgr
        ? 'manager'
        : 'employee';

  const defaultPerms = resolveDefaultPermissions(
    isSuper ? 'Super Admin' : isAdm ? 'Admin' : isMgr ? 'Manager' : 'Employee',
    fallbackRole
  );

  const displayName =
    normalizedEmail.split('@')[0]?.replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
    'CRM User';

  const fallbackUser: MockAuthUser = {
    id: `usr_${firebaseUid ? firebaseUid.slice(0, 8) : Date.now()}`,
    name: displayName,
    email: normalizedEmail,
    role: fallbackRole,
    organizationId: 'org_cool_tech_001',
    organizationName: 'Cool Technologies LLC',
    designation: isSuper
      ? 'System Super Admin'
      : isAdm
        ? 'Administrator'
        : isMgr
          ? 'Operations Manager'
          : 'Operations Employee',
    department: isSuper ? 'Executive' : isAdm ? 'Management' : 'Operations',
    profileType: isSuper ? 'Super Admin' : isAdm ? 'Admin' : isMgr ? 'Manager' : 'Employee',
    dataScope: defaultPerms.dataScope,
    modulePermissions: defaultPerms.modulePermissions,
    actionPermissions: defaultPerms.actionPermissions,
    firebaseUid,
  };

  return {
    user: fallbackUser,
    redirectUrl: isSuper
      ? '/dashboard'
      : isAdm
        ? '/admin/dashboard'
        : isMgr
          ? '/manager/dashboard'
          : '/worker/dashboard',
  };
}

export const authMockService = {
  /**
   * Authenticates user via Firebase Authentication signInWithEmailAndPassword
   * and maps authenticated identity to CRM roles, permissions, and data scopes.
   */
  async login(email: string, password: string, rememberMe = true): Promise<MockLoginResult> {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return {
        success: false,
        error: 'Please enter both your email address and password.',
      };
    }

    const normalizedEmail = trimmedEmail.toLowerCase();

    // 1. Direct match against pre-configured system credentials (e.g. afsal@gmail.com, shibil@gmail.com, superadmin@gmail.com)
    const staticMatch = MOCK_CREDENTIALS.find(
      (c) =>
        c.email.toLowerCase() === normalizedEmail ||
        (c.user.email && c.user.email.toLowerCase() === normalizedEmail)
    );

    if (staticMatch && staticMatch.password === trimmedPassword) {
      const resolved = resolveCrmUserByEmail(staticMatch.email);
      if (resolved.isInactive) {
        return {
          success: false,
          error: 'This account has been deactivated. Please contact your Super Admin.',
        };
      }

      // Try background Firebase Auth sign-in if credentials match Firebase account
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      } catch (fbErr) {
        // Non-blocking for verified system credentials
      }

      if (typeof window !== 'undefined') {
        try {
          const sessionData = {
            authenticated: true,
            user: resolved.user,
            role: resolved.user.role,
            firebaseUid: `mock_${resolved.user.id}`,
            rememberMe,
            timestamp: Date.now(),
          };
          localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
        } catch (err) {
          console.error('Session storage error:', err);
        }
      }

      return {
        success: true,
        user: resolved.user,
        redirectUrl: resolved.redirectUrl || staticMatch.redirectUrl,
      };
    }

    // 2. Check dynamically created users in localStorage (cezcon_crm_users_list)
    if (typeof window !== 'undefined') {
      try {
        const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
        if (storedUsersRaw) {
          const storedUsers = JSON.parse(storedUsersRaw);
          if (Array.isArray(storedUsers)) {
            const matchedUser = storedUsers.find((u: any) => {
              const uEmail = (u.email || '').trim().toLowerCase();
              const uUsername = (u.username || '').trim().toLowerCase();
              const uPrefix = uUsername.split('@')[0];
              return (
                uEmail === normalizedEmail ||
                uUsername === normalizedEmail ||
                uPrefix === normalizedEmail
              );
            });

            if (matchedUser) {
              if (matchedUser.status === 'Inactive') {
                return {
                  success: false,
                  error: 'This account has been deactivated. Please contact your Super Admin.',
                };
              }
              const storedPwd = (matchedUser.password || '').trim();
              if (storedPwd === trimmedPassword || !storedPwd) {
                const resolved = resolveCrmUserByEmail(matchedUser.email || trimmedEmail);
                const sessionData = {
                  authenticated: true,
                  user: resolved.user,
                  role: resolved.user.role,
                  firebaseUid: `crm_${resolved.user.id}`,
                  rememberMe,
                  timestamp: Date.now(),
                };
                localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
                return {
                  success: true,
                  user: resolved.user,
                  redirectUrl: resolved.redirectUrl,
                };
              }
            }
          }
        }

        // Check crm_admin_accounts_list
        const storedAdminsRaw = localStorage.getItem('crm_admin_accounts_list');
        if (storedAdminsRaw) {
          const storedAdmins = JSON.parse(storedAdminsRaw);
          if (Array.isArray(storedAdmins)) {
            const matchedAdmin = storedAdmins.find((a: any) => {
              const aEmail = (a.email || '').trim().toLowerCase();
              const aUsername = (a.username || '').trim().toLowerCase();
              return aEmail === normalizedEmail || aUsername === normalizedEmail;
            });

            if (matchedAdmin) {
              if (matchedAdmin.status === 'Inactive') {
                return {
                  success: false,
                  error: 'This account has been deactivated. Please contact your Super Admin.',
                };
              }
              const storedPwd = (matchedAdmin.password || '').trim();
              if (storedPwd === trimmedPassword || !storedPwd) {
                const resolved = resolveCrmUserByEmail(matchedAdmin.email || trimmedEmail);
                const sessionData = {
                  authenticated: true,
                  user: resolved.user,
                  role: resolved.user.role,
                  firebaseUid: `crm_${resolved.user.id}`,
                  rememberMe,
                  timestamp: Date.now(),
                };
                localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
                return {
                  success: true,
                  user: resolved.user,
                  redirectUrl: resolved.redirectUrl,
                };
              }
            }
          }
        }
      } catch (storageErr) {
        console.error('Error checking local storage auth:', storageErr);
      }
    }

    // 3. Fallback to Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const fbUser = userCredential.user;

      const resolved = resolveCrmUserByEmail(fbUser.email || trimmedEmail, fbUser.uid);

      if (resolved.isInactive) {
        await signOut(auth);
        return {
          success: false,
          error: 'This account has been deactivated. Please contact your Super Admin.',
        };
      }

      if (typeof window !== 'undefined') {
        try {
          const sessionData = {
            authenticated: true,
            user: resolved.user,
            role: resolved.user.role,
            firebaseUid: fbUser.uid,
            rememberMe,
            timestamp: Date.now(),
          };
          localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
        } catch (err) {
          console.error('Session storage error:', err);
        }
      }

      return {
        success: true,
        user: resolved.user,
        redirectUrl: resolved.redirectUrl,
      };
    } catch (err: any) {
      const errorCode = err?.code || '';
      let message = 'Invalid email address or password. Please verify your credentials.';

      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          message = 'Invalid email address or password. Please verify your credentials.';
          break;
        case 'auth/user-not-found':
          message = 'No registered account found with this email address.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address format.';
          break;
        case 'auth/user-disabled':
          message = 'This user account has been disabled. Please contact your administrator.';
          break;
        case 'auth/too-many-requests':
          message = 'Access temporarily disabled due to multiple failed login attempts. Please try again later.';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password under Authentication > Sign-in method.';
          break;
        case 'auth/network-request-failed':
          message = 'Network connection error. Please check your internet connection and try again.';
          break;
        default:
          if (err?.message) {
            message = err.message.replace(/^Firebase:\s*/i, '').replace(/\s*\([^)]+\)$/, '');
          }
          break;
      }

      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * Reads currently active authenticated session
   */
  getCurrentUser(): MockAuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('cool_crm_auth');
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && parsed.user) {
        const u = parsed.user;
        if (u.name === 'System Super Admin' || (u.role === 'super_admin' && (!u.name || u.name === 'System Super Admin'))) {
          u.name = 'Nafal';
        }
        if (!u.position) {
          const r = String(u.role || '').toLowerCase();
          if (r === 'super_admin' || r.includes('super')) u.position = 'CEO';
          else if (r === 'admin') u.position = 'COO';
          else if (r === 'manager') {
            const s = (u.managerType || u.designation || u.department || '').toLowerCase();
            u.position = s.includes('purchase') ? 'CPO' : 'CSO';
          } else if (r === 'employee' || r === 'worker') {
            const s = (u.employeeType || u.designation || u.department || '').toLowerCase();
            u.position = s.includes('purchase') ? 'Purchase Employee' : 'Sales Executive';
          }
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Listens to real-time Firebase Auth state changes
   */
  onAuthStateChanged(callback: (user: MockAuthUser | null, fbUser: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const existingSession = this.getCurrentUser();
        if (
          existingSession &&
          (existingSession.email.toLowerCase() === (fbUser.email || '').toLowerCase() ||
            existingSession.firebaseUid === fbUser.uid)
        ) {
          callback(existingSession, fbUser);
        } else {
          const resolved = resolveCrmUserByEmail(fbUser.email || '', fbUser.uid);
          if (typeof window !== 'undefined') {
            const sessionData = {
              authenticated: true,
              user: resolved.user,
              role: resolved.user.role,
              firebaseUid: fbUser.uid,
              timestamp: Date.now(),
            };
            try {
              localStorage.setItem('cool_crm_auth', JSON.stringify(sessionData));
            } catch (err) {}
          }
          callback(resolved.user, fbUser);
        }
      } else {
        // When Firebase emits null on initial load, preserve active local CRM session
        const localSession = this.getCurrentUser();
        if (localSession) {
          callback(localSession, null);
        } else {
          callback(null, null);
        }
      }
    });
  },

  /**
   * Signs out from Firebase Authentication and clears CRM local session
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase sign out error:', err);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cool_crm_auth');
      } catch (err) {
        console.error('Error during logout cleanup:', err);
      }
    }
  },
};

