export interface ManagerNavItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  badge?: string | number;
  badgeColor?: string;
  subItems?: { title: string; href: string }[];
}

export interface ManagerNavSection {
  title?: string;
  items: ManagerNavItem[];
}

export const MANAGER_NAVIGATION: ManagerNavSection[] = [
  {
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/manager/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'Customer & Lead Ops',
    items: [
      {
        id: 'customers',
        title: 'Customers',
        href: '/manager/customers',
        iconName: 'Building2',
        subItems: [
          { title: 'Customer List', href: '/manager/customers' },
          { title: 'Customer Details', href: '/manager/customers?view=details' },
        ],
      },
      {
        id: 'leads',
        title: 'Leads',
        href: '/manager/leads',
        iconName: 'Target',
        badge: '14',
        badgeColor: 'bg-blue-600',
        subItems: [
          { title: 'Lead List', href: '/manager/leads' },
          { title: 'Lead Details', href: '/manager/leads?view=details' },
          { title: 'Lead Assignment', href: '/manager/leads?view=assignment' },
        ],
      },
    ],
  },
  {
    title: 'Commercial & Sales',
    items: [
      {
        id: 'sales',
        title: 'Sales',
        href: '/manager/sales',
        iconName: 'Briefcase',
        subItems: [
          { title: 'Opportunities', href: '/manager/sales?tab=opportunities' },
          { title: 'Deals', href: '/manager/sales?tab=deals' },
          { title: 'Sales Pipeline', href: '/manager/sales?tab=pipeline' },
          { title: 'Quotations', href: '/manager/sales?tab=quotations' },
          { title: 'Orders', href: '/manager/sales?tab=orders' },
          { title: 'Invoices', href: '/manager/sales?tab=invoices' },
          { title: 'Sales Activities', href: '/manager/sales?tab=activities' },
        ],
      },
    ],
  },
  {
    title: 'Operations & Execution',
    items: [
      {
        id: 'tasks',
        title: 'Tasks',
        href: '/manager/tasks',
        iconName: 'CheckSquare',
        badge: '9',
        badgeColor: 'bg-amber-500',
        subItems: [
          { title: 'All Tasks', href: '/manager/tasks' },
          { title: 'Assign Task', href: '/manager/tasks?view=assign' },
          { title: 'Pending', href: '/manager/tasks?status=Pending' },
          { title: 'Completed', href: '/manager/tasks?status=Completed' },
          { title: 'Overdue', href: '/manager/tasks?status=Overdue' },
        ],
      },
      {
        id: 'activities',
        title: 'Activities',
        href: '/manager/activities',
        iconName: 'PhoneCall',
        subItems: [
          { title: 'Calls', href: '/manager/activities?type=Calls' },
          { title: 'Meetings', href: '/manager/activities?type=Meetings' },
          { title: 'Emails', href: '/manager/activities?type=Emails' },
          { title: 'Follow-ups', href: '/manager/activities?type=Follow-ups' },
        ],
      },
      {
        id: 'calendar',
        title: 'Calendar',
        href: '/manager/calendar',
        iconName: 'Calendar',
        subItems: [
          { title: 'Meetings', href: '/manager/calendar?view=meetings' },
          { title: 'Tasks', href: '/manager/calendar?view=tasks' },
          { title: 'Activities', href: '/manager/calendar?view=activities' },
        ],
      },
    ],
  },
  {
    title: 'Workforce & Capacity',
    items: [
      {
        id: 'team',
        title: 'Team Management',
        href: '/manager/team',
        iconName: 'Users',
        subItems: [
          { title: 'Team Members', href: '/manager/team?tab=members' },
          { title: 'Workload', href: '/manager/team?tab=workload' },
          { title: 'Assignments', href: '/manager/team?tab=assignments' },
        ],
      },
      {
        id: 'performance',
        title: 'Team Performance',
        href: '/manager/performance',
        iconName: 'TrendingUp',
        subItems: [
          { title: 'Task Performance', href: '/manager/performance?metric=tasks' },
          { title: 'Lead Performance', href: '/manager/performance?metric=leads' },
          { title: 'Sales Performance', href: '/manager/performance?metric=sales' },
          { title: 'Team Workload', href: '/manager/performance?metric=workload' },
          { title: 'Conversion', href: '/manager/performance?metric=conversion' },
        ],
      },
    ],
  },
  {
    title: 'Analytics & Admin',
    items: [
      {
        id: 'reports',
        title: 'Reports & Analytics',
        href: '/manager/reports',
        iconName: 'BarChart3',
        subItems: [
          { title: 'Sales Reports', href: '/manager/reports?type=sales' },
          { title: 'Lead Reports', href: '/manager/reports?type=leads' },
          { title: 'Customer Reports', href: '/manager/reports?type=customers' },
          { title: 'Task Reports', href: '/manager/reports?type=tasks' },
          { title: 'Team Reports', href: '/manager/reports?type=team' },
        ],
      },
      {
        id: 'notifications',
        title: 'Notifications',
        href: '/manager/notifications',
        iconName: 'Bell',
        badge: '5',
        badgeColor: 'bg-rose-500',
      },
      {
        id: 'settings',
        title: 'Settings',
        href: '/manager/settings',
        iconName: 'Sliders',
        subItems: [
          { title: 'Profile', href: '/manager/settings?tab=profile' },
          { title: 'Notifications', href: '/manager/settings?tab=notifications' },
          { title: 'Calendar', href: '/manager/settings?tab=calendar' },
          { title: 'Preferences', href: '/manager/settings?tab=preferences' },
        ],
      },
    ],
  },
];
