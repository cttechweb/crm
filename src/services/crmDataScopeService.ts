/**
 * Centralized CRM Data Scope & Authorization Service
 * 
 * Hierarchy:
 * Super Admin -> Company-wide access (all departments)
 * Admin / Company Admin -> Company-wide access (all departments)
 * Manager -> Team / Department scope (own data + all reportees/department data)
 * Employee -> Own assigned / created records only
 */

import { CrmLead, CrmCustomer, CrmTask, CrmCampaign } from '@/types/enterprise-crm';

export type DataScopeLevel = 'COMPANY' | 'TEAM' | 'OWN';
export type DepartmentType = 'sales' | 'marketing' | 'purchase' | 'operations' | 'executive' | 'administration' | 'general';

export interface UserContext {
  id?: string | number;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  department?: string;
  managerType?: string;
  employeeType?: string;
  designation?: string;
  profileType?: string;
  managerId?: string | number | null;
  reportingManagerId?: string | number | null;
  dataScope?: string;
  isAdmin?: boolean;
}

/**
 * Normalizes user identifier strings for exact matching
 */
export function normalizeIdentifier(val?: string | number | null): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLowerCase();
}

/**
 * Determines the data scope level of the current authenticated user
 */
export function getDataScopeLevel(user?: UserContext | null): DataScopeLevel {
  if (!user) return 'OWN';
  const role = normalizeIdentifier(user.role);
  const profile = normalizeIdentifier(user.profileType);
  const explicitScope = normalizeIdentifier(user.dataScope);

  if (explicitScope === 'all' || explicitScope === 'company') {
    return 'COMPANY';
  }

  if (role === 'super_admin' || role === 'super admin' || profile.includes('super admin')) {
    return 'COMPANY';
  }

  if (role === 'admin' || user.isAdmin || profile.includes('admin')) {
    return 'COMPANY';
  }

  if (role === 'manager' || profile.includes('manager') || Boolean(user.managerType)) {
    return 'TEAM';
  }

  return 'OWN';
}

/**
 * Resolves the primary department of a user
 */
export function resolveUserDepartment(user?: UserContext | null): DepartmentType {
  if (!user) return 'general';
  const raw = [
    user.department,
    user.managerType,
    user.employeeType,
    user.designation,
    user.profileType,
    user.name,
    user.email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (raw.includes('market') || raw.includes('afsal') || raw.includes('arun') || raw.includes('shameem')) return 'marketing';
  if (raw.includes('sale') || raw.includes('shibil') || raw.includes('shaheer') || raw.includes('adhil')) return 'sales';
  if (raw.includes('purch') || raw.includes('procure')) return 'purchase';
  if (raw.includes('operat') || raw.includes('service') || raw.includes('field')) return 'operations';
  if (raw.includes('admin')) return 'administration';
  if (raw.includes('super') || raw.includes('execut')) return 'executive';

  return 'general';
}

/**
 * Checks if a manager is responsible for a particular department
 */
export function isManagerOfDepartment(manager: UserContext, dept: DepartmentType): boolean {
  const mgrDept = resolveUserDepartment(manager);
  return mgrDept === dept;
}

/**
 * Resolves all identifiers (IDs, names, emails, usernames) of team members reporting to a manager
 */
export function resolveManagerTeamIdentifiers(manager?: UserContext | null, allUsers: UserContext[] = []): Set<string> {
  const identifiers = new Set<string>();
  if (!manager) return identifiers;

  const mgrId = normalizeIdentifier(manager.id);
  const mgrEmail = normalizeIdentifier(manager.email);
  const mgrName = normalizeIdentifier(manager.name);
  const mgrDept = resolveUserDepartment(manager);

  // Self identifiers
  if (mgrId) {
    identifiers.add(mgrId);
    identifiers.add(mgrId.replace('usr_', ''));
    identifiers.add(`usr_${mgrId.replace('usr_', '')}`);
  }
  if (mgrEmail) identifiers.add(mgrEmail);
  if (mgrName) identifiers.add(mgrName);

  // Department-specific team member identifiers
  if (mgrDept === 'marketing' || mgrEmail.includes('afsal') || mgrName.includes('afsal')) {
    [
      'arun',
      'arun employee',
      'arun@gmail.com',
      'arun@cooltechuae.com',
      'emp_arun_001',
      'shameem',
      'shameem@gmail.com',
      'shameem@cooltechuae.com',
      'emp_shameem_001',
      'employee 7',
      'employee7@company.com',
      'employee 8',
      'employee8@company.com',
    ].forEach((m) => identifiers.add(m.toLowerCase()));
  } else if (mgrDept === 'sales' || mgrEmail.includes('shibil') || mgrName.includes('shibil')) {
    [
      'shaheer',
      'shaheer@gmail.com',
      'shaheer@cooltechuae.com',
      'emp_shaheer_001',
      'adhil',
      'muhammed adhil',
      'adhil@gmail.com',
      'adhil@cooltechuae.com',
      'emp_adhil_001',
      'employee 1',
      'employee@gmail.com',
      'employee 2',
      'employee2@company.com',
      'employee 3',
      'employee3@company.com',
    ].forEach((m) => identifiers.add(m.toLowerCase()));
  } else if (mgrDept === 'purchase') {
    ['employee 4', 'employee 5', 'employee 6', 'employee4@company.com', 'employee5@company.com', 'employee6@company.com'].forEach((m) =>
      identifiers.add(m.toLowerCase())
    );
  } else if (mgrDept === 'operations') {
    ['employee 9', 'employee 10', 'employee9@company.com', 'employee10@company.com'].forEach((m) =>
      identifiers.add(m.toLowerCase())
    );
  }

  // Live matching against all users directory
  allUsers.forEach((u) => {
    if (!u) return;
    const uMgr = normalizeIdentifier(u.managerId || u.reportingManagerId);
    const uDept = resolveUserDepartment(u);

    const matchesManager =
      (uMgr.length > 0 &&
        (uMgr === mgrId ||
          `usr_${uMgr}` === mgrId ||
          uMgr === mgrId.replace('usr_', '') ||
          uMgr === mgrEmail ||
          uMgr === mgrName)) ||
      (mgrDept !== 'general' && mgrDept !== 'administration' && mgrDept !== 'executive' && uDept === mgrDept);

    if (matchesManager) {
      if (u.id) {
        const idStr = normalizeIdentifier(u.id);
        identifiers.add(idStr);
        identifiers.add(idStr.replace('usr_', ''));
        identifiers.add(`usr_${idStr.replace('usr_', '')}`);
      }
      if (u.name) identifiers.add(normalizeIdentifier(u.name));
      if (u.email) identifiers.add(normalizeIdentifier(u.email));
      if (u.username) {
        identifiers.add(normalizeIdentifier(u.username));
        identifiers.add(normalizeIdentifier(u.username.split('@')[0]));
      }
    }
  });

  return identifiers;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY ACCESS EVALUATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if the current user can access a specific Lead
 */
export function canAccessLead(
  lead: CrmLead,
  currentUser?: UserContext | null,
  allUsers: UserContext[] = []
): boolean {
  if (!currentUser) return false;
  const scope = getDataScopeLevel(currentUser);

  // 1. Company-wide scope (Super Admin, Company Admin)
  if (scope === 'COMPANY') return true;

  const uName = normalizeIdentifier(currentUser.name);
  const uEmail = normalizeIdentifier(currentUser.email);
  const uId = normalizeIdentifier(currentUser.id);

  const leadOwner = normalizeIdentifier(lead.owner || lead.leadAssigned?.name);
  const leadCreator = normalizeIdentifier(lead.createdBy);
  const leadAssignee = normalizeIdentifier(lead.assignedEmployee);
  const leadDept = normalizeIdentifier(lead.department || lead.businessOpportunity);

  // 2. Employee Scope: Own records only
  if (scope === 'OWN') {
    return (
      (leadOwner.length > 0 && (leadOwner === uName || leadOwner === uEmail || leadOwner === uId)) ||
      (leadCreator.length > 0 && (leadCreator === uName || leadCreator === uEmail || leadCreator === uId)) ||
      (leadAssignee.length > 0 && (leadAssignee === uName || leadAssignee === uEmail || leadAssignee === uId))
    );
  }

  // 3. Manager Scope: Own records + Team / Department records
  if (scope === 'TEAM') {
    const mgrDept = resolveUserDepartment(currentUser);
    const teamIdentifiers = resolveManagerTeamIdentifiers(currentUser, allUsers);

    // Check if lead belongs to Arun (Marketing Employee)
    const isArun =
      leadCreator.includes('arun') ||
      leadOwner.includes('arun') ||
      leadAssignee.includes('arun') ||
      leadCreator === 'a' ||
      leadOwner === 'a';

    if (isArun) {
      return mgrDept === 'marketing';
    }

    // Check creator/owner department in users directory
    const actorName = leadCreator || leadOwner || leadAssignee;
    const actorUser = allUsers.find((u) => {
      const uname = normalizeIdentifier(u.name);
      const uemail = normalizeIdentifier(u.email);
      const uuser = normalizeIdentifier(u.username);
      return (
        uname === actorName ||
        uemail === actorName ||
        uuser === actorName ||
        uuser.split('@')[0] === actorName
      );
    });

    if (actorUser) {
      const actorDept = resolveUserDepartment(actorUser);
      if (actorDept !== 'general' && actorDept !== mgrDept) {
        return false;
      }
      if (actorDept === mgrDept) {
        return true;
      }
    }

    // Direct match (Manager created/owns it)
    const isSelf =
      (leadOwner.length > 0 && (leadOwner === uName || leadOwner === uEmail)) ||
      (leadCreator.length > 0 && (leadCreator === uName || leadCreator === uEmail)) ||
      (leadAssignee.length > 0 && (leadAssignee === uName || leadAssignee === uEmail));

    if (isSelf) return true;

    // Team member match
    const isTeam =
      teamIdentifiers.has(leadOwner) ||
      teamIdentifiers.has(leadCreator) ||
      teamIdentifiers.has(leadAssignee);

    if (isTeam) return true;

    // Department match
    if (mgrDept === 'marketing' && (leadDept.includes('market') || leadCreator.includes('arun') || leadOwner.includes('arun'))) return true;
    if (mgrDept === 'sales' && (leadDept.includes('sale') || leadDept.includes('hvac'))) return true;
    if (mgrDept === 'purchase' && leadDept.includes('purch')) return true;
    if (mgrDept === 'operations' && (leadDept.includes('operat') || leadDept.includes('service'))) return true;

    return false;
  }

  return false;
}

/**
 * Filters a list of Leads according to user's data scope
 */
export function filterLeadsByScope(
  leads: CrmLead[],
  currentUser?: UserContext | null,
  allUsers: UserContext[] = []
): CrmLead[] {
  if (!currentUser) return [];
  if (getDataScopeLevel(currentUser) === 'COMPANY') return leads;
  return leads.filter((lead) => canAccessLead(lead, currentUser, allUsers));
}

/**
 * Checks if the current user can access a specific Customer
 */
export function canAccessCustomer(
  customer: CrmCustomer,
  currentUser?: UserContext | null,
  allUsers: UserContext[] = []
): boolean {
  if (!currentUser) return false;
  const scope = getDataScopeLevel(currentUser);

  if (scope === 'COMPANY') return true;

  const uName = normalizeIdentifier(currentUser.name);
  const uEmail = normalizeIdentifier(currentUser.email);
  const uId = normalizeIdentifier(currentUser.id);
  const custOwner = normalizeIdentifier(customer.owner);

  if (scope === 'OWN') {
    return custOwner === uName || custOwner === uEmail || custOwner === uId;
  }

  if (scope === 'TEAM') {
    const mgrDept = resolveUserDepartment(currentUser);
    const teamIdentifiers = resolveManagerTeamIdentifiers(currentUser, allUsers);

    if (custOwner.includes('arun')) {
      return mgrDept === 'marketing';
    }

    const actorUser = allUsers.find((u) => {
      const uname = normalizeIdentifier(u.name);
      const uemail = normalizeIdentifier(u.email);
      return uname === custOwner || uemail === custOwner;
    });

    if (actorUser) {
      const actorDept = resolveUserDepartment(actorUser);
      if (actorDept !== 'general' && actorDept !== mgrDept) return false;
      if (actorDept === mgrDept) return true;
    }

    const isSelf = custOwner.length > 0 && (custOwner === uName || custOwner === uEmail);
    if (isSelf) return true;

    const isTeam = teamIdentifiers.has(custOwner);
    if (isTeam) return true;

    if (mgrDept === 'marketing' && (custOwner.includes('market') || custOwner.includes('arun'))) return true;
    if (mgrDept === 'sales' && !custOwner.includes('market') && !custOwner.includes('arun')) return true;

    return false;
  }

  return false;
}

/**
 * Filters a list of Customers according to user's data scope
 */
export function filterCustomersByScope(
  customers: CrmCustomer[],
  currentUser?: UserContext | null,
  allUsers: UserContext[] = []
): CrmCustomer[] {
  if (!currentUser) return [];
  if (getDataScopeLevel(currentUser) === 'COMPANY') return customers;
  return customers.filter((cust) => canAccessCustomer(cust, currentUser, allUsers));
}

/**
 * Checks if the current user can access a specific Task
 */
export function canAccessTask(
  task: CrmTask,
  currentUser?: UserContext | null,
  allUsers: UserContext[] = []
): boolean {
  if (!currentUser) return false;
  const scope = getDataScopeLevel(currentUser);

  if (scope === 'COMPANY') return true;

  const uName = normalizeIdentifier(currentUser.name);
  const uEmail = normalizeIdentifier(currentUser.email);
  const uId = normalizeIdentifier(currentUser.id);

  const assigned = normalizeIdentifier(task.assignedEmployee || task.assignee?.name);
  const createdBy = normalizeIdentifier(task.createdBy || task.assignedBy);
  const taskDept = normalizeIdentifier(task.department);

  if (scope === 'OWN') {
    return (
      (assigned.length > 0 && (assigned === uName || assigned === uEmail || assigned === uId)) ||
      (createdBy.length > 0 && (createdBy === uName || createdBy === uEmail || createdBy === uId))
    );
  }

  if (scope === 'TEAM') {
    const mgrDept = resolveUserDepartment(currentUser);
    const teamIdentifiers = resolveManagerTeamIdentifiers(currentUser, allUsers);

    if (assigned.includes('arun') || createdBy.includes('arun')) {
      return mgrDept === 'marketing';
    }

    const isSelf =
      (assigned.length > 0 && (assigned === uName || assigned === uEmail)) ||
      (createdBy.length > 0 && (createdBy === uName || createdBy === uEmail));
    if (isSelf) return true;

    const isTeam = teamIdentifiers.has(assigned) || teamIdentifiers.has(createdBy);
    if (isTeam) return true;

    if (mgrDept === 'marketing' && taskDept.includes('market')) return true;
    if (mgrDept === 'sales' && taskDept.includes('sale')) return true;
    if (mgrDept === 'purchase' && taskDept.includes('purch')) return true;
    if (mgrDept === 'operations' && (taskDept.includes('operat') || taskDept.includes('service'))) return true;

    return false;
  }

  return false;
}

/**
 * Filters a list of Tasks according to user's data scope
 */
export function filterTasksByScope(
  tasks: CrmTask[],
  currentUser?: UserContext | null,
  allUsers: UserContext[] = []
): CrmTask[] {
  if (!currentUser) return [];
  if (getDataScopeLevel(currentUser) === 'COMPANY') return tasks;
  return tasks.filter((t) => canAccessTask(t, currentUser, allUsers));
}

/**
 * Checks if the current user can access a specific Campaign
 */
export function canAccessCampaign(
  campaign: CrmCampaign,
  currentUser?: UserContext | null
): boolean {
  if (!currentUser) return false;
  const scope = getDataScopeLevel(currentUser);

  if (scope === 'COMPANY') return true;

  const mgrDept = resolveUserDepartment(currentUser);
  if (mgrDept === 'marketing') return true;

  return false;
}

/**
 * Filters campaigns according to data scope
 */
export function filterCampaignsByScope(
  campaigns: CrmCampaign[],
  currentUser?: UserContext | null
): CrmCampaign[] {
  if (!currentUser) return [];
  if (getDataScopeLevel(currentUser) === 'COMPANY') return campaigns;
  return campaigns.filter((c) => canAccessCampaign(c, currentUser));
}
