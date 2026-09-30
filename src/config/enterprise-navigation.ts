export interface NavDropdownItem {
  label: string;
  href?: string;
  iconName?: string;
  badge?: string;
  children?: NavDropdownItem[];
}

export interface EnterpriseNavItem {
  id: string;
  label: string;
  path?: string;
  iconName: string;
  badge?: string;
  children?: NavDropdownItem[];
}

export const ENTERPRISE_NAV_ITEMS: EnterpriseNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    iconName: 'Home',
  },
  {
    id: 'tasks',
    label: 'Task',
    path: '/tasks',
    iconName: 'CheckSquare',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    path: '/marketing',
    iconName: 'Radio',
    children: [
      { label: 'Campaigns', href: '/marketing?tab=campaigns', iconName: 'Megaphone' },
      { label: 'Email Marketing', href: '/marketing?tab=email', iconName: 'Mail' },
      { label: 'WhatsApp Campaigns', href: '/marketing?tab=whatsapp', iconName: 'MessageSquare' },
      { label: 'SMS Campaigns', href: '/marketing?tab=sms', iconName: 'Smartphone' },
      { label: 'Customer Segments', href: '/marketing?tab=segments', iconName: 'Users' },
      { label: 'Templates', href: '/marketing?tab=templates', iconName: 'Copy' },
      { label: 'Campaign Reports', href: '/marketing?tab=reports', iconName: 'FileText' },
    ],
  },
  {
    id: 'leads',
    label: 'Lead',
    path: '/leads',
    iconName: 'ListChecks',
    children: [
      { label: 'All Leads', href: '/leads', iconName: 'ListChecks' },
      { label: 'Lead Sources', href: '/leads/sources', iconName: 'Globe' },
      { label: 'Lead Status', href: '/leads/status', iconName: 'Activity' },
      { label: 'Follow-ups', href: '/leads/followups', iconName: 'Clock' },
      { label: 'Import Leads', href: '/leads/import', iconName: 'Upload' },
      { label: 'Lead Reports', href: '/leads/reports', iconName: 'FileText' },
    ],
  },
  {
    id: 'customers',
    label: 'Customer',
    path: '/customers',
    iconName: 'Shield',
    children: [
      { label: 'Customer', href: '/customers', iconName: 'Shield' },
      { label: 'Contact', href: '/customers/contacts', iconName: 'Contact' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    path: '/sales',
    iconName: 'Hourglass',
    children: [
      { label: 'Opportunity', href: '/sales?tab=opportunities', iconName: 'Key' },
      { label: 'Quotation', href: '/sales?tab=quotations', iconName: 'FileText' },
      { label: 'Order', href: '/sales?tab=orders', iconName: 'ThumbsUp' },
      { label: 'Proforma Invoice', href: '/sales?tab=proforma', iconName: 'CreditCard' },
      { label: 'Invoice', href: '/sales?tab=invoice', iconName: 'FileSpreadsheet' },
      { label: 'Receipt', href: '/sales?tab=receipt', iconName: 'Receipt' },
      { label: 'Delivery Note', href: '/sales?tab=delivery', iconName: 'Table' },
    ],
  },
  {
    id: 'purchase',
    label: 'Purchase',
    iconName: 'Package',
    path: '/purchase',
    children: [
      { label: 'Stock', href: '/purchase?tab=stock', iconName: 'Boxes' },
      { label: 'Purchase Order', href: '/purchase?tab=po', iconName: 'FilePlus' },
      { label: 'Purchase Invoice', href: '/purchase?tab=invoice', iconName: 'FileCheck' },
      { label: 'Purchase Payment', href: '/purchase?tab=payment', iconName: 'DollarSign' },
      { label: 'Stock In', href: '/purchase?tab=stock-in', iconName: 'ArrowDownToLine' },
      { label: 'Supplier', href: '/purchase?tab=supplier', iconName: 'Truck' },
      { label: 'Products', href: '/purchase?tab=products', iconName: 'Tag' },
      { label: 'Store', href: '/purchase?tab=store', iconName: 'Store' },
      { label: 'Manufacturing', href: '/purchase?tab=manufacturing', iconName: 'Factory' },
    ],
  },
  {
    id: 'reports',
    label: 'Report',
    path: '/reports',
    iconName: 'FileText',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'Wrench',
    children: [
      {
        label: 'User',
        href: '/settings?tab=users',
        iconName: 'Users',
        children: [
          { label: 'User', href: '/settings?tab=users', iconName: 'Users' },
          { label: 'User Profile', href: '/settings?tab=profile', iconName: 'Contact' },
          { label: 'User Target', href: '/settings?tab=user-target', iconName: 'BarChart3' },
        ],
      },
      {
        label: 'Opportunity Settings',
        href: '/settings?tab=opportunity-settings',
        iconName: 'Key',
        children: [
          { label: 'Opportunity Stages', href: '/settings?tab=opportunity-settings', iconName: 'ListChecks' },
          { label: 'Opportunity Lost Reason', href: '/settings?tab=opportunity-lost-reason', iconName: 'Sliders' },
        ],
      },
      {
        label: 'Initial Settings',
        href: '/settings?tab=initial',
        iconName: 'Sliders',
        children: [
          { label: 'Industry', href: '/settings?tab=initial&sub=industry', iconName: 'Factory' },
          { label: 'Source', href: '/settings?tab=initial&sub=source', iconName: 'DollarSign' },
          { label: 'Language', href: '/settings?tab=initial&sub=language', iconName: 'Languages' },
          { label: 'Field Customisation', href: '/settings?tab=initial&sub=customisation', iconName: 'CheckCircle2' },
          { label: 'Print Settings', href: '/settings?tab=initial&sub=print', iconName: 'Printer' },
          { label: 'Report Settings', href: '/settings?tab=initial&sub=reports', iconName: 'FileText' },
          { label: 'Country / Region', href: '/settings?tab=initial&sub=region', iconName: 'Flag' },
          { label: 'Credit Limit', href: '/settings?tab=initial&sub=credit', iconName: 'CreditCard' },
          { label: 'Purchase Order', href: '/settings?tab=initial&sub=po', iconName: 'ShoppingCart' },
          { label: 'Designation', href: '/settings?tab=initial&sub=designation', iconName: 'Contact' },
        ],
      },
      {
        label: 'Campaign Settings',
        href: '/settings?tab=campaign',
        iconName: 'Megaphone',
        children: [
          { label: 'Campaign Type', href: '/settings?tab=campaign&sub=type', iconName: 'Megaphone' },
          { label: 'Expense Type', href: '/settings?tab=campaign&sub=expense', iconName: 'Receipt' },
          { label: 'Campaign Status', href: '/settings?tab=campaign&sub=status', iconName: 'Activity' },
        ],
      },
      {
        label: 'Order Settings',
        href: '/settings?tab=order',
        iconName: 'ShoppingCart',
        children: [
          { label: 'Order Status', href: '/settings?tab=order&sub=status', iconName: 'ShoppingCart' },
          { label: 'Order Type', href: '/settings?tab=order&sub=type', iconName: 'CreditCard' },
          { label: 'AMC Year', href: '/settings?tab=order&sub=amc', iconName: 'Calendar' },
          { label: 'Cancellation Reason', href: '/settings?tab=order&sub=cancellation', iconName: 'Ban' },
        ],
      },
      {
        label: 'Task Settings',
        href: '/settings?tab=task',
        iconName: 'CheckSquare',
        children: [
          { label: 'Task Type', href: '/settings?tab=task&sub=type', iconName: 'CheckSquare' },
          { label: 'Task Template', href: '/settings?tab=task&sub=template', iconName: 'FileText' },
        ],
      },
      { label: 'Business Opportunity', href: '/settings?tab=opportunity', iconName: 'Briefcase' },
      { label: 'Company Target', href: '/settings?tab=target', iconName: 'BarChart3' },
      { label: 'Cost/Job Type', href: '/settings?tab=cost-job', iconName: 'DollarSign' },
      { label: 'Business Tags', href: '/settings?tab=tags', iconName: 'Tag' },
      { label: 'Products', href: '/settings?tab=products', iconName: 'Box' },
    ],
  },
];

/**
 * ─────────────────────────────────────────────────────────────
 * OPERATIONS MANAGER CANONICAL NAVIGATION STRUCTURE
 * ─────────────────────────────────────────────────────────────
 */
export const MANAGER_NAV_ITEMS: EnterpriseNavItem[] = [
  {
    id: 'manager-dashboard',
    label: 'Dashboard',
    path: '/manager/dashboard',
    iconName: 'Home',
  },
  {
    id: 'manager-tasks',
    label: 'Task',
    iconName: 'CheckSquare',
    path: '/manager/tasks',
    children: [
      { label: 'All Tasks', href: '/manager/tasks?view=all', iconName: 'CheckSquare' },
      { label: 'My Tasks', href: '/manager/tasks?view=my', iconName: 'CheckCircle2' },
      { label: 'Team Tasks', href: '/manager/tasks?view=team', iconName: 'Users' },
      { label: 'Assign Task', href: '/manager/tasks?action=assign', iconName: 'UserPlus' },
      { label: 'Team Workload', href: '/manager/tasks?view=workload', iconName: 'Activity' },
      { label: 'Task Calendar', href: '/manager/calendar', iconName: 'Calendar' },
      { label: 'Task Categories', href: '/manager/tasks?view=categories', iconName: 'FolderTree' },
      { label: 'Task Priorities', href: '/manager/tasks?view=priorities', iconName: 'Flag' },
      { label: 'Recurring Tasks', href: '/manager/tasks?view=recurring', iconName: 'Clock' },
      { label: 'Task Reports', href: '/manager/reports?type=tasks', iconName: 'FileText' },
    ],
  },
  {
    id: 'manager-marketing',
    label: 'Marketing',
    iconName: 'Radio',
    path: '/manager/marketing',
    children: [
      { label: 'Campaigns', href: '/manager/marketing?tab=campaigns', iconName: 'Megaphone' },
      { label: 'Email Marketing', href: '/manager/marketing?tab=email', iconName: 'Mail' },
      { label: 'WhatsApp Campaigns', href: '/manager/marketing?tab=whatsapp', iconName: 'MessageSquare' },
      { label: 'SMS Campaigns', href: '/manager/marketing?tab=sms', iconName: 'Smartphone' },
      { label: 'Customer Segments', href: '/manager/marketing?tab=segments', iconName: 'Users' },
      { label: 'Templates', href: '/manager/marketing?tab=templates', iconName: 'Copy' },
      { label: 'Campaign Reports', href: '/manager/marketing?tab=reports', iconName: 'FileText' },
    ],
  },
  {
    id: 'manager-leads',
    label: 'Lead',
    iconName: 'ListChecks',
    path: '/manager/leads',
    children: [
      { label: 'All Leads', href: '/manager/leads?view=all', iconName: 'ListChecks' },
      { label: 'My Leads', href: '/manager/leads?view=my', iconName: 'UserCheck' },
      { label: 'Team Leads', href: '/manager/leads?view=team', iconName: 'Users' },
      { label: 'Assign Leads', href: '/manager/leads?action=assign', iconName: 'UserPlus' },
      { label: 'Lead Sources', href: '/manager/leads?view=sources', iconName: 'Globe' },
      { label: 'Lead Status', href: '/manager/leads?view=status', iconName: 'Activity' },
      { label: 'Follow-ups', href: '/manager/leads?view=followups', iconName: 'Clock' },
      { label: 'Import Leads', href: '/manager/leads?action=import', iconName: 'Upload' },
      { label: 'Lead Reports', href: '/manager/reports?type=leads', iconName: 'FileText' },
    ],
  },
  {
    id: 'manager-customers',
    label: 'Customer',
    iconName: 'Shield',
    path: '/manager/customers',
    children: [
      { label: 'All Customers', href: '/manager/customers?view=all', iconName: 'Shield' },
      { label: 'My Customers', href: '/manager/customers?view=my', iconName: 'UserCheck' },
      { label: 'Team Customers', href: '/manager/customers?view=team', iconName: 'Users' },
      { label: 'Add Customer', href: '/manager/customers?action=add', iconName: 'UserPlus' },
      { label: 'Contacts', href: '/manager/customers?view=contacts', iconName: 'Contact' },
      { label: 'Customer Groups', href: '/manager/customers?view=groups', iconName: 'FolderTree' },
      { label: 'Customer Activities', href: '/manager/customers?view=activities', iconName: 'Activity' },
      { label: 'Follow-ups', href: '/manager/customers?view=followups', iconName: 'Clock' },
      { label: 'Customer Reports', href: '/manager/reports?type=customers', iconName: 'FileText' },
    ],
  },
  {
    id: 'manager-sales',
    label: 'Sales',
    iconName: 'Hourglass',
    path: '/manager/sales',
    children: [
      { label: 'Opportunities', href: '/manager/sales?tab=opportunities', iconName: 'Key' },
      { label: 'Sales Pipeline', href: '/manager/sales?tab=pipeline', iconName: 'TrendingUp' },
      { label: 'Quotations', href: '/manager/sales?tab=quotations', iconName: 'FileText' },
      { label: 'Orders', href: '/manager/sales?tab=orders', iconName: 'ThumbsUp' },
      { label: 'Proforma Invoices', href: '/manager/sales?tab=proforma', iconName: 'CreditCard' },
      { label: 'Invoices', href: '/manager/sales?tab=invoices', iconName: 'FileSpreadsheet' },
      { label: 'Receipts / Payments', href: '/manager/sales?tab=receipts', iconName: 'Receipt' },
      { label: 'Delivery Notes', href: '/manager/sales?tab=delivery', iconName: 'Table' },
      { label: 'Sales Reports', href: '/manager/reports?type=sales', iconName: 'BarChart3' },
    ],
  },
  {
    id: 'manager-purchase',
    label: 'Purchase',
    iconName: 'Package',
    path: '/manager/purchase',
    children: [
      { label: 'Purchase Orders', href: '/manager/purchase?tab=orders', iconName: 'FilePlus' },
      { label: 'Purchase Invoices', href: '/manager/purchase?tab=invoices', iconName: 'FileCheck' },
      { label: 'Suppliers', href: '/manager/purchase?tab=suppliers', iconName: 'Truck' },
      { label: 'Products', href: '/manager/purchase?tab=products', iconName: 'Tag' },
      { label: 'Stock / Inventory', href: '/manager/purchase?tab=stock', iconName: 'Boxes' },
      { label: 'Stock In / Out', href: '/manager/purchase?tab=stock-in-out', iconName: 'ArrowDownToLine' },
      { label: 'Purchase Payments', href: '/manager/purchase?tab=payments', iconName: 'DollarSign' },
      { label: 'Request Material', href: '/manager/purchase?tab=request-material', iconName: 'Package' },
      { label: 'Purchase Reports', href: '/manager/reports?type=purchase', iconName: 'FileText' },
    ],
  },
  {
    id: 'manager-reports',
    label: 'Report',
    iconName: 'FileText',
    path: '/manager/reports',
    children: [
      { label: 'Sales', href: '/manager/reports?type=sales', iconName: 'DollarSign' },
      { label: 'Leads', href: '/manager/reports?type=leads', iconName: 'ListChecks' },
      { label: 'Customers', href: '/manager/reports?type=customers', iconName: 'Shield' },
      { label: 'Tasks', href: '/manager/reports?type=tasks', iconName: 'CheckSquare' },
      { label: 'Employee Performance', href: '/manager/reports?type=employee-performance', iconName: 'UserCheck' },
      { label: 'Team Performance', href: '/manager/reports?type=team-performance', iconName: 'Users' },
      { label: 'Activities', href: '/manager/reports?type=activities', iconName: 'Activity' },
      { label: 'Purchase', href: '/manager/reports?type=purchase', iconName: 'ShoppingCart' },
      { label: 'Inventory', href: '/manager/reports?type=inventory', iconName: 'Boxes' },
      { label: 'Campaign', href: '/manager/reports?type=campaign', iconName: 'Megaphone' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'Wrench',
    children: [
      {
        label: 'User',
        href: '/settings?tab=users',
        iconName: 'Users',
        children: [
          { label: 'User', href: '/settings?tab=users', iconName: 'Users' },
          { label: 'User Profile', href: '/settings?tab=profile', iconName: 'Contact' },
          { label: 'User Target', href: '/settings?tab=user-target', iconName: 'BarChart3' },
        ],
      },
      {
        label: 'Opportunity Settings',
        href: '/settings?tab=opportunity-settings',
        iconName: 'Key',
        children: [
          { label: 'Opportunity Stages', href: '/settings?tab=opportunity-settings', iconName: 'ListChecks' },
          { label: 'Opportunity Lost Reason', href: '/settings?tab=opportunity-lost-reason', iconName: 'Sliders' },
        ],
      },
      {
        label: 'Initial Settings',
        href: '/settings?tab=initial',
        iconName: 'Sliders',
        children: [
          { label: 'Industry', href: '/settings?tab=initial&sub=industry', iconName: 'Factory' },
          { label: 'Source', href: '/settings?tab=initial&sub=source', iconName: 'DollarSign' },
          { label: 'Language', href: '/settings?tab=initial&sub=language', iconName: 'Languages' },
          { label: 'Field Customisation', href: '/settings?tab=initial&sub=customisation', iconName: 'CheckCircle2' },
          { label: 'Print Settings', href: '/settings?tab=initial&sub=print', iconName: 'Printer' },
          { label: 'Report Settings', href: '/settings?tab=initial&sub=reports', iconName: 'FileText' },
          { label: 'Country / Region', href: '/settings?tab=initial&sub=region', iconName: 'Flag' },
          { label: 'Credit Limit', href: '/settings?tab=initial&sub=credit', iconName: 'CreditCard' },
          { label: 'Purchase Order', href: '/settings?tab=initial&sub=po', iconName: 'ShoppingCart' },
          { label: 'Designation', href: '/settings?tab=initial&sub=designation', iconName: 'Contact' },
        ],
      },
      {
        label: 'Campaign Settings',
        href: '/settings?tab=campaign',
        iconName: 'Megaphone',
        children: [
          { label: 'Campaign Type', href: '/settings?tab=campaign&sub=type', iconName: 'Megaphone' },
          { label: 'Expense Type', href: '/settings?tab=campaign&sub=expense', iconName: 'Receipt' },
          { label: 'Campaign Status', href: '/settings?tab=campaign&sub=status', iconName: 'Activity' },
        ],
      },
      {
        label: 'Order Settings',
        href: '/settings?tab=order',
        iconName: 'ShoppingCart',
        children: [
          { label: 'Order Status', href: '/settings?tab=order&sub=status', iconName: 'ShoppingCart' },
          { label: 'Order Type', href: '/settings?tab=order&sub=type', iconName: 'CreditCard' },
          { label: 'AMC Year', href: '/settings?tab=order&sub=amc', iconName: 'Calendar' },
          { label: 'Cancellation Reason', href: '/settings?tab=order&sub=cancellation', iconName: 'Ban' },
        ],
      },
      {
        label: 'Task Settings',
        href: '/settings?tab=task',
        iconName: 'CheckSquare',
        children: [
          { label: 'Task Type', href: '/settings?tab=task&sub=type', iconName: 'CheckSquare' },
          { label: 'Task Template', href: '/settings?tab=task&sub=template', iconName: 'FileText' },
        ],
      },
      { label: 'Business Opportunity', href: '/settings?tab=opportunity', iconName: 'Briefcase' },
      { label: 'Company Target', href: '/settings?tab=target', iconName: 'BarChart3' },
      { label: 'Cost/Job Type', href: '/settings?tab=cost-job', iconName: 'DollarSign' },
      { label: 'Business Tags', href: '/settings?tab=tags', iconName: 'Tag' },
      { label: 'Products', href: '/settings?tab=products', iconName: 'Box' },
    ],
  },
];
