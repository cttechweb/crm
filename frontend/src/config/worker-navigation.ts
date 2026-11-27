export interface WorkerNavItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  badge?: string | number;
  badgeColor?: string;
  subItems?: { title: string; href: string }[];
}

export interface WorkerNavSection {
  title?: string;
  items: WorkerNavItem[];
}

export const WORKER_NAVIGATION: WorkerNavSection[] = [
  {
    items: [
      {
        id: 'dashboard',
        title: 'Technician Dashboard',
        href: '/worker/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'Field Execution',
    items: [
      {
        id: 'tasks',
        title: 'Assigned Tasks',
        href: '/worker/tasks',
        iconName: 'Wrench',
        badge: '3',
        badgeColor: 'bg-blue-600',
        subItems: [
          { title: "Today's Schedule", href: '/worker/tasks' },
          { title: 'In Progress Job', href: '/worker/tasks/active' },
          { title: 'Pending Acceptance', href: '/worker/tasks?status=Pending' },
          { title: 'Completed History', href: '/worker/tasks?status=Completed' },
        ],
      },
      {
        id: 'active_job',
        title: 'Active Job Live Execution',
        href: '/worker/tasks/active',
        iconName: 'PlayCircle',
        badge: 'LIVE',
        badgeColor: 'bg-emerald-600',
      },
    ],
  },
  {
    title: 'Inventory & Requests',
    items: [
      {
        id: 'materials',
        title: 'Material Requests',
        href: '/worker/materials',
        iconName: 'Package',
        badge: '1 Approved',
        badgeColor: 'bg-emerald-600',
        subItems: [
          { title: 'My Requests', href: '/worker/materials' },
          { title: '+ New Requisition', href: '/worker/materials?action=new' },
        ],
      },
    ],
  },
  {
    title: 'Work Logs & Documentation',
    items: [
      {
        id: 'timesheet',
        title: 'Timesheet & Clock-In',
        href: '/worker/timesheet',
        iconName: 'Clock',
      },
      {
        id: 'reports',
        title: 'Service Reports & Sign-Offs',
        href: '/worker/reports',
        iconName: 'FileCheck',
      },
      {
        id: 'profile',
        title: 'Profile & Vehicle',
        href: '/worker/profile',
        iconName: 'UserCheck',
      },
    ],
  },
];
