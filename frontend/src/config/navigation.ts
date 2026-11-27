export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string | number;
  badgeColor?: string;
  subItems?: { title: string; href: string }[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const SUPER_ADMIN_NAVIGATION: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    title: 'Multi-Tenant Management',
    items: [
      {
        title: 'Organizations',
        href: '/organizations',
        iconName: 'Building2',
        subItems: [
          { title: 'All Organizations', href: '/organizations' },
          { title: 'Add Organization', href: '/organizations/new' },
          { title: 'Active', href: '/organizations?status=Active' },
          { title: 'Suspended', href: '/organizations?status=Suspended' },
          { title: 'Activity', href: '/organizations/activity' },
        ],
      },
      {
        title: 'Admin Management',
        href: '/super-admin/admins',
        iconName: 'ShieldCheck',
      },
      {
        title: 'Users',
        href: '/users',
        iconName: 'Users',
        subItems: [
          { title: 'All Users', href: '/users' },
          { title: 'Add User', href: '/users/new' },
          { title: 'Active Users', href: '/users?status=Active' },
          { title: 'Suspended Users', href: '/users?status=Suspended' },
        ],
      },
      {
        title: 'Roles & Permissions',
        href: '/roles-permissions',
        iconName: 'ShieldCheck',
      },
    ],
  },
  {
    title: 'CRM Modules (Tenant View)',
    items: [
      {
        title: 'Leads',
        href: '/crm/leads',
        iconName: 'Target',
      },
      {
        title: 'Customers',
        href: '/crm/customers',
        iconName: 'UserCheck',
      },
      {
        title: 'Marketing',
        href: '/crm/marketing',
        iconName: 'Megaphone',
      },
      {
        title: 'Sales',
        href: '/crm/sales',
        iconName: 'Briefcase',
      },
      {
        title: 'Purchase & Inventory',
        href: '/crm/inventory',
        iconName: 'Package',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Tasks & Activities',
        href: '/operations/tasks',
        iconName: 'CheckSquare',
        badge: '8',
        badgeColor: 'bg-amber-500',
      },
      {
        title: 'Calendar',
        href: '/operations/calendar',
        iconName: 'Calendar',
      },
    ],
  },
  {
    title: 'Governance & Monitoring',
    items: [
      {
        title: 'Reports & Analytics',
        href: '/analytics',
        iconName: 'BarChart3',
      },
      {
        title: 'Notifications',
        href: '/notifications',
        iconName: 'Bell',
        badge: '3',
        badgeColor: 'bg-rose-500',
      },
      {
        title: 'Audit Logs',
        href: '/audit-logs',
        iconName: 'FileText',
      },
    ],
  },
  {
    title: 'System Administration',
    items: [
      {
        title: 'Configuration',
        href: '/configuration',
        iconName: 'Sliders',
      },
      {
        title: 'Security & Settings',
        href: '/settings',
        iconName: 'Lock',
      },
    ],
  },
];
