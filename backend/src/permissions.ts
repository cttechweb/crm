/**
 * Role-Based Access Control (RBAC) & Dynamic Permissions Engine
 * cool-tech-crm-api
 *
 * Supports 12 granular modules:
 * - dashboard, leads, customers, sales, quotations, invoices,
 *   procurement, inventory, tasks, reports, settings, users
 *
 * Configurable actions:
 * - canView, canCreate, canEdit, canDelete
 */

import type { MiddlewareHandler } from 'hono';
import type { Env, AppVariables, CrmUserProfile, CrmRole } from './types.ts';

export type ModuleKey =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'sales'
  | 'quotations'
  | 'invoices'
  | 'procurement'
  | 'inventory'
  | 'tasks'
  | 'reports'
  | 'settings'
  | 'users';

export type ActionKey = 'canView' | 'canCreate' | 'canEdit' | 'canDelete';

export interface UserPermissions {
  modulePermissions: Record<ModuleKey, boolean>;
  actionPermissions: Record<ActionKey, boolean>;
}

export const ALL_MODULES: readonly ModuleKey[] = [
  'dashboard',
  'leads',
  'customers',
  'sales',
  'quotations',
  'invoices',
  'procurement',
  'inventory',
  'tasks',
  'reports',
  'settings',
  'users',
] as const;

export const ALL_ACTIONS: readonly ActionKey[] = [
  'canView',
  'canCreate',
  'canEdit',
  'canDelete',
] as const;

/**
 * Returns default module and action permissions for a given CRM role.
 */
export function getDefaultRolePermissions(role: CrmRole): UserPermissions {
  if (role === 'SUPER_ADMIN') {
    return {
      modulePermissions: {
        dashboard: true,
        leads: true,
        customers: true,
        sales: true,
        quotations: true,
        invoices: true,
        procurement: true,
        inventory: true,
        tasks: true,
        reports: true,
        settings: true,
        users: true,
      },
      actionPermissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    };
  }

  if (role === 'ADMIN') {
    return {
      modulePermissions: {
        dashboard: true,
        leads: true,
        customers: true,
        sales: true,
        quotations: true,
        invoices: true,
        procurement: true,
        inventory: true,
        tasks: true,
        reports: true,
        settings: true,
        users: true,
      },
      actionPermissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    };
  }

  if (role === 'MANAGER') {
    return {
      modulePermissions: {
        dashboard: true,
        leads: true,
        customers: true,
        sales: true,
        quotations: true,
        invoices: true,
        procurement: true,
        inventory: true,
        tasks: true,
        reports: true,
        settings: false,
        users: true,
      },
      actionPermissions: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
      },
    };
  }

  // EMPLOYEE
  return {
    modulePermissions: {
      dashboard: true,
      leads: true,
      customers: true,
      sales: true,
      quotations: true,
      invoices: false,
      procurement: false,
      inventory: true,
      tasks: true,
      reports: false,
      settings: false,
      users: false,
    },
    actionPermissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
  };
}

/**
 * Resolves permissions for a user profile, respecting custom permissions stored in D1.
 * Super Admins can never have their permissions restricted.
 */
export function resolveUserPermissions(user: CrmUserProfile): UserPermissions {
  const defaults = getDefaultRolePermissions(user.role);

  // Super Admin permissions are immutable (always full access)
  if (user.role === 'SUPER_ADMIN') {
    return defaults;
  }

  if (!user.permissions) {
    return defaults;
  }

  try {
    const parsed = typeof user.permissions === 'string'
      ? JSON.parse(user.permissions)
      : user.permissions;

    if (parsed && typeof parsed === 'object') {
      const customModules = parsed.modulePermissions || {};
      const customActions = parsed.actionPermissions || {};

      const resolvedModules = { ...defaults.modulePermissions };
      for (const mod of ALL_MODULES) {
        if (typeof customModules[mod] === 'boolean') {
          resolvedModules[mod] = customModules[mod];
        }
      }

      const resolvedActions = { ...defaults.actionPermissions };
      for (const act of ALL_ACTIONS) {
        if (typeof customActions[act] === 'boolean') {
          resolvedActions[act] = customActions[act];
        }
      }

      return {
        modulePermissions: resolvedModules,
        actionPermissions: resolvedActions,
      };
    }
  } catch {
    // If malformed, fall back to role defaults safely
  }

  return defaults;
}

/**
 * Evaluates whether a user has permission to perform an action on a specific module.
 */
export function hasPermission(
  user: CrmUserProfile,
  module: ModuleKey,
  action: ActionKey = 'canView'
): boolean {
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  const perms = resolveUserPermissions(user);
  const moduleAllowed = perms.modulePermissions[module] ?? false;
  const actionAllowed = perms.actionPermissions[action] ?? false;

  return moduleAllowed && actionAllowed;
}

/**
 * Middleware that strictly enforces dynamic module and action permissions.
 */
export function requirePermission(
  module: ModuleKey,
  action: ActionKey = 'canView'
): MiddlewareHandler<{ Bindings: Env; Variables: AppVariables }> {
  return async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        { success: false, code: 'UNAUTHORIZED', message: 'Authentication required.' },
        401
      );
    }

    if (!hasPermission(user, module, action)) {
      return c.json(
        {
          success: false,
          code: 'FORBIDDEN',
          message: `Permission denied: ${action} access to "${module}" module is not permitted for your account.`,
        },
        403
      );
    }

    await next();
  };
}
