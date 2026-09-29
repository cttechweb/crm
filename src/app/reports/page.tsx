'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Package,
  CheckSquare,
  Sliders,
  Activity,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Play,
  Printer,
  RefreshCw,
  Filter,
  Calendar,
  ArrowUpDown,
  Check,
  X,
  Eye,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  PhoneCall,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Tag,
  Menu,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ── Static chart data for Analytics & BI View ──────────────────────────────
const salesRevenueData = [
  { month: 'Jan', revenue: 52000, target: 45000, deals: 8 },
  { month: 'Feb', revenue: 48000, target: 50000, deals: 7 },
  { month: 'Mar', revenue: 68000, target: 55000, deals: 11 },
  { month: 'Apr', revenue: 74000, target: 60000, deals: 13 },
  { month: 'May', revenue: 89000, target: 70000, deals: 16 },
  { month: 'Jun', revenue: 95000, target: 80000, deals: 18 },
  { month: 'Jul', revenue: 104000, target: 85000, deals: 21 },
  { month: 'Aug', revenue: 112000, target: 90000, deals: 24 },
  { month: 'Sep', revenue: 128000, target: 100000, deals: 27 },
];

const leadSourceData = [
  { name: 'Website', value: 48, color: '#2563EB' },
  { name: 'LinkedIn', value: 34, color: '#0EA5E9' },
  { name: 'Referral', value: 28, color: '#7C3AED' },
  { name: 'Direct Email', value: 18, color: '#10B981' },
  { name: 'Events', value: 12, color: '#F59E0B' },
];

const taskCompletionData = [
  { week: 'W1', completed: 22, pending: 8, overdue: 3 },
  { week: 'W2', completed: 30, pending: 5, overdue: 2 },
  { week: 'W3', completed: 27, pending: 10, overdue: 5 },
  { week: 'W4', completed: 35, pending: 6, overdue: 1 },
  { week: 'W5', completed: 40, pending: 4, overdue: 2 },
];

const customerGrowthData = [
  { month: 'Apr', customers: 42 },
  { month: 'May', customers: 47 },
  { month: 'Jun', customers: 53 },
  { month: 'Jul', customers: 58 },
  { month: 'Aug', customers: 64 },
  { month: 'Sep', customers: 71 },
];

const inventoryValuationData = [
  { category: 'Networking', value: 284000 },
  { category: 'VoIP', value: 196000 },
  { category: 'Security', value: 152000 },
  { category: 'Surveillance', value: 118000 },
  { category: 'Software', value: 87000 },
];

// ── Exact Cezcon CRM Standard Reports ───────────────────────────────────────
export interface ReportDefinition {
  id: number;
  title: string;
  category: 'Sales' | 'Customer' | 'Purchase' | 'Operations' | 'Finance' | 'Marketing';
  description: string;
  canCustomize: boolean;
  defaultColumns: string[];
}

const INITIAL_STANDARD_REPORTS: ReportDefinition[] = [
  {
    id: 1,
    title: 'Opportunity Closing',
    category: 'Sales',
    description: 'Opportunity pipeline closures and win-loss status analysis',
    canCustomize: true,
    defaultColumns: [
      'SL.No',
      'Opportunity Closed Date',
      'Opportunity Owner',
      'Opportunity Title',
      'Opportunity Number',
      'Opportunity Amount',
      'Stage',
      'Opportunity Cost',
      'Opportunity Profit',
      'Opportunity Rating',
      'Company Name',
    ],
  },
  { id: 2, title: 'Services', category: 'Operations', description: 'Service master listing (Service type items) with unit, category and brand breakdown', canCustomize: false, defaultColumns: ['SL.No', 'Service Code', 'Service Name', 'Category', 'Unit', 'Base Rate ($)', 'SLA (Hrs)', 'Status'] },
  { id: 3, title: 'Product', category: 'Purchase', description: 'Product master listing (Product type items) with unit, category, store and stock levels', canCustomize: false, defaultColumns: ['SL.No', 'SKU', 'Product Name', 'Category', 'Store / Warehouse', 'Stock Level', 'Reorder Point', 'Unit Price ($)', 'Valuation ($)'] },
  { id: 4, title: 'Sales', category: 'Sales', description: 'Comprehensive sales performance and gross margin reporting', canCustomize: true, defaultColumns: ['SL.No', 'Order No', 'Order Date', 'Customer', 'Items Count', 'Gross Total ($)', 'Cost ($)', 'Gross Profit ($)', 'Margin %', 'Status'] },
  { id: 5, title: 'Campaign', category: 'Marketing', description: 'Marketing campaign attribution and conversions', canCustomize: false, defaultColumns: ['SL.No', 'Campaign Name', 'Type', 'Target Audience', 'Budget ($)', 'Spend ($)', 'Leads Generated', 'Cost / Lead ($)', 'Status'] },
  { id: 6, title: 'Salesman', category: 'Sales', description: 'Sales Executives performance and deal quotas', canCustomize: false, defaultColumns: ['SL.No', 'Salesperson', 'Department', 'Deals Assigned', 'Deals Won', 'Target ($)', 'Closed Revenue ($)', 'Quota Attainment %'] },
  { id: 7, title: 'Aging Report', category: 'Finance', description: 'Customer receivable aging matrix across 30, 60, 90+ days', canCustomize: false, defaultColumns: ['SL.No', 'Customer Name', 'Contact Person', 'Current (0-30 Days)', '31-60 Days', '61-90 Days', '90+ Days (Overdue)', 'Total Outstanding ($)'] },
  { id: 8, title: 'Customer Statement', category: 'Customer', description: 'Account balances and ledger statement by customer', canCustomize: false, defaultColumns: ['SL.No', 'Date', 'Transaction Ref', 'Customer', 'Description', 'Debit ($)', 'Credit ($)', 'Running Balance ($)'] },
  { id: 9, title: 'Invoice And Receipt Report', category: 'Finance', description: 'Tax invoices, proformas, and receipt reconciliation', canCustomize: false, defaultColumns: ['SL.No', 'Invoice #', 'Invoice Date', 'Customer', 'Total Amount ($)', 'Received ($)', 'Pending Balance ($)', 'Payment Mode', 'Status'] },
  { id: 10, title: 'Inventory', category: 'Purchase', description: 'Warehouse stock balances, reorder thresholds, and valuations', canCustomize: false, defaultColumns: ['SL.No', 'Item Code', 'Item Description', 'Warehouse', 'Current Qty', 'Min Threshold', 'Unit Cost ($)', 'Total Stock Value ($)', 'Stock Health'] },
  { id: 11, title: 'WhatsApp Number', category: 'Marketing', description: 'WhatsApp broadcast logs and customer conversation history', canCustomize: false, defaultColumns: ['SL.No', 'Recipient Name', 'WhatsApp Phone', 'Template / Broadcast', 'Sent Date & Time', 'Delivery Status', 'Response Rate %'] },
  { id: 12, title: 'Sale By Salesperson', category: 'Sales', description: 'Sales volume and deal count grouped by individual salesperson', canCustomize: false, defaultColumns: ['SL.No', 'Sales Representative', 'Region', 'Total Quotations', 'Converted Orders', 'Total Invoiced ($)', 'Conversion Rate %'] },
  { id: 13, title: 'Account Statement', category: 'Finance', description: 'Detailed account transactions and financial summaries', canCustomize: false, defaultColumns: ['SL.No', 'Voucher #', 'Date', 'Account Head', 'Particulars', 'Debit ($)', 'Credit ($)', 'Balance ($)'] },
  { id: 14, title: 'Stock Movement Report', category: 'Purchase', description: 'Stock transfers, receipts, and dispatch logs across branches', canCustomize: false, defaultColumns: ['SL.No', 'Transfer Ref', 'Date', 'Item Name', 'From Store', 'To Store', 'Quantity', 'Issued By', 'Status'] },
  { id: 15, title: 'Supplier Statement', category: 'Purchase', description: 'Supplier purchase invoices, payment schedules, and outstanding balances', canCustomize: true, defaultColumns: ['SL.No', 'Supplier Name', 'PO Ref', 'Invoice Amount ($)', 'Paid Amount ($)', 'Outstanding Balance ($)', 'Payment Terms', 'Due Date'] },
  { id: 16, title: 'Lead Report', category: 'Sales', description: 'Inbound lead attribution, conversion lifecycle, and sales stage analytics', canCustomize: true, defaultColumns: ['SL.No', 'Lead ID', 'Lead Name', 'Company', 'Source', 'Assigned Salesman', 'Estimated Value ($)', 'Created Date', 'Status'] },
  { id: 17, title: 'Customer Report', category: 'Customer', description: 'Customer AMC contracts, renewal logs, and satisfaction audits', canCustomize: false, defaultColumns: ['SL.No', 'Customer Name', 'Account Tier', 'Active Projects', 'Total Orders Value ($)', 'AMC Expiry', 'Account Manager', 'Health Score'] },
  { id: 18, title: 'Task Report', category: 'Operations', description: 'Operational turnaround time, completion rate, and overdue SLA log', canCustomize: true, defaultColumns: ['SL.No', 'Task ID', 'Task Details', 'Assigned Tech', 'Priority', 'Start Date', 'Due Date', 'Progress %', 'Status'] },
  { id: 19, title: 'Employee Performance', category: 'Operations', description: 'Individual technician first-time fix rate, job hours, and ratings', canCustomize: false, defaultColumns: ['SL.No', 'Employee Name', 'Role / Skill', 'Jobs Completed', 'Total Billable Hrs', 'SLA Adherence %', 'Avg Customer Rating'] },
  { id: 20, title: 'Team Performance', category: 'Operations', description: 'Team capacity utilization, workload distribution, and regional metrics', canCustomize: false, defaultColumns: ['SL.No', 'Team / Dept', 'Team Lead', 'Headcount', 'Active Jobs', 'Completed Jobs', 'Capacity Utilization %', 'Overall Efficiency'] },
  { id: 21, title: 'Activity Report', category: 'Sales', description: 'Daily technician visits, onsite audits, and client interactions', canCustomize: false, defaultColumns: ['SL.No', 'Activity Date', 'User / Tech', 'Activity Type', 'Customer / Site', 'Notes & Summary', 'Outcome', 'Next Follow-up'] },
  { id: 22, title: 'Purchase Report', category: 'Purchase', description: 'Purchase order fulfillment, supplier lead times, and spend analysis', canCustomize: true, defaultColumns: ['SL.No', 'PO Number', 'Order Date', 'Supplier', 'Items Qty', 'Total Cost ($)', 'Delivery Status', 'Payment Status', 'Approved By'] },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#0f172a',
  fontSize: '11px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const ALL_REPORT_FIELDS_POOL = [
  'Lead Contact Name',
  'Lead Date',
  'Account Mobile',
  'Account Phone',
  'Account Email',
  'Account Source',
  'Account Source Name',
  'Account Office',
  'Account Industry',
  'Contact Name',
  'Business Mobile',
  'Personal Mobile',
  'Contact Whatsapp',
  'Contact Email',
  'Quotation Ref',
  'Billing Address',
  'Payment Mode',
  'Probability %',
];

const DEFAULT_OPP_SELECTED_FIELDS = [
  'Opportunity Closed Date',
  'Opportunity Owner',
  'Opportunity Title',
  'Opportunity Number',
  'Opportunity Amount',
  'Stage',
  'Opportunity Cost',
  'Opportunity Profit',
  'Opportunity Rating',
  'Company Name',
];

const SEARCH_OPTIONS_COLUMNS = [
  [
    'Closed Month & Date',
    'Closed Start & End Date',
    'Created Date',
    'Quotation Prepared',
    'Inactive From',
  ],
  [
    'Opportunity Month & Year',
    'Campaign',
    'Source',
  ],
  [
    'Opportunity Owner',
    'Business Opportunity',
    'Industry',
  ],
  [
    'Created By',
    'Stage',
    'Tags',
  ],
];

export default function ReportsPage() {
  const crm = useEnterpriseCrm();

  const [activeView, setActiveView] = useState<'catalog' | 'analytics'>('catalog');
  const [search, setSearch] = useState('');
  const [standardReports, setStandardReports] = useState<ReportDefinition[]>(INITIAL_STANDARD_REPORTS);

  // Live Runner State
  const [runningReport, setRunningReport] = useState<ReportDefinition | null>(null);
  const [customizingReport, setCustomizingReport] = useState<ReportDefinition | null>(null);
  const [editingReport, setEditingReport] = useState<ReportDefinition | null>(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [selectedOrderMonthYear, setSelectedOrderMonthYear] = useState('Select');

  // Live Filter Controls in Running View
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportDateRange, setReportDateRange] = useState('All');
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  const [reportRowsPerPage, setReportRowsPerPage] = useState(10);
  const [reportCurrentPage, setReportCurrentPage] = useState(1);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
  const [showVisualChart, setShowVisualChart] = useState(true);

  // Customization Form State
  const [customReportName, setCustomReportName] = useState('');
  const [customReportDesc, setCustomReportDesc] = useState('');
  const [availableFields, setAvailableFields] = useState<string[]>(ALL_REPORT_FIELDS_POOL);
  const [selectedFieldsList, setSelectedFieldsList] = useState<string[]>(DEFAULT_OPP_SELECTED_FIELDS);
  const [activeAvailableItem, setActiveAvailableItem] = useState<string | null>(null);
  const [activeSelectedItem, setActiveSelectedItem] = useState<string | null>(null);
  const [checkedSearchOptions, setCheckedSearchOptions] = useState<string[]>(['Closed Month & Date']);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [groupByDimension, setGroupByDimension] = useState('None');
  const [customSortBy, setCustomSortBy] = useState('Default');

  // Edit Report Modal Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<'Sales' | 'Customer' | 'Purchase' | 'Operations' | 'Finance' | 'Marketing'>('Sales');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredStandardReports = standardReports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Generate Dynamic Real Data for any selected Report ──────────────────
  const liveReportData = useMemo(() => {
    if (!runningReport) return { rows: [], stats: [], columns: [], chartData: [] };

    const id = runningReport.id;
    let rows: Record<string, any>[] = [];
    let stats: { label: string; value: string; sub?: string; color?: string }[] = [];
    let columns = selectedColumns.length > 0 ? selectedColumns : runningReport.defaultColumns;
    let chartData: any[] = [];

    // 1. Opportunity Closing
    if (id === 1) {
      rows = [
        {
          'SL.No': 1,
          'Opportunity Closed Date': '30 Jun 2029',
          'Opportunity Owner': 'Unnikrishnan Krishnankutty Nair',
          'Opportunity Title': 'BAYZ101 Proposed Residential Tower on Plot#3466893@Business Bay B6+GF+91F+RF',
          'Opportunity Number': 'CTEQ#5875',
          'Opportunity Amount': '6,800,000.00',
          'Stage': 'Enquiry',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '6,800,000.00',
          'Opportunity Rating': 'WARM',
          'Company Name': 'Sky International Technical Works LLC',
          _rawVal: 6800000,
        },
        {
          'SL.No': 2,
          'Opportunity Closed Date': '03 Oct 2028',
          'Opportunity Owner': 'MUHAMMAD HAMZA',
          'Opportunity Title': 'Split ACs',
          'Opportunity Number': 'CTEQ#4757',
          'Opportunity Amount': '36,220.00',
          'Stage': 'Enquiry',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '0.00',
          'Opportunity Rating': 'WARM',
          'Company Name': 'AIM TECHNICAL',
          _rawVal: 36220,
        },
        {
          'SL.No': 3,
          'Opportunity Closed Date': '10 Oct 2026',
          'Opportunity Owner': 'NEBIN BENNY',
          'Opportunity Title': '2TR WINDOW AC',
          'Opportunity Number': 'CTEQ#7070',
          'Opportunity Amount': '33,480.00',
          'Stage': 'Offer Sent',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '0.00',
          'Opportunity Rating': 'COLD',
          'Company Name': 'CAT INTERNATIONAL LIMITED - L.L.C - S.P.C',
          _rawVal: 33480,
        },
        {
          'SL.No': 4,
          'Opportunity Closed Date': '07 Oct 2026',
          'Opportunity Owner': 'JISMON JOSE',
          'Opportunity Title': 'SPLIT AC UNITS',
          'Opportunity Number': 'CTEQ#7066',
          'Opportunity Amount': '82,460.00',
          'Stage': 'Enquiry',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '82,460.00',
          'Opportunity Rating': 'COLD',
          'Company Name': 'MASRI ENGINEERING & CONTRACTING MEC SAL',
          _rawVal: 82460,
        },
        {
          'SL.No': 5,
          'Opportunity Closed Date': '07 Oct 2026',
          'Opportunity Owner': 'NEBIN BENNY',
          'Opportunity Title': 'CHEST FREEZER - SUPER GENERAL',
          'Opportunity Number': 'CTEQ#7052',
          'Opportunity Amount': '1,295.00',
          'Stage': 'Offer Sent',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '1,295.00',
          'Opportunity Rating': 'COLD',
          'Company Name': 'LUCENT GENERAL CONTRACTING EST',
          _rawVal: 1295,
        },
        {
          'SL.No': 6,
          'Opportunity Closed Date': '07 Oct 2026',
          'Opportunity Owner': 'NEBIN BENNY',
          'Opportunity Title': 'WATER CHILLER 3TR & 5TR',
          'Opportunity Number': 'CTEQ#7048',
          'Opportunity Amount': '16,700.00',
          'Stage': 'Offer Sent',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '0.00',
          'Opportunity Rating': 'COLD',
          'Company Name': 'INNOVO BUILD L.L.C',
          _rawVal: 16700,
        },
        {
          'SL.No': 7,
          'Opportunity Closed Date': '07 Oct 2026',
          'Opportunity Owner': 'NEBIN BENNY',
          'Opportunity Title': '1.5TR & 2TR SPLIT AC INVERTER',
          'Opportunity Number': 'CTEQ#7034',
          'Opportunity Amount': '35,050.00',
          'Stage': 'On Review',
          'Opportunity Cost': '0.00',
          'Opportunity Profit': '35,050.00',
          'Opportunity Rating': 'COLD',
          'Company Name': 'ZUBLIN CONSTRUCTION L.L.C',
          _rawVal: 35050,
        },
      ];
      stats = [
        { label: 'Total Pipeline Value', value: '$7,005,205.00', sub: 'Active Deals' },
        { label: 'Total Opportunities', value: `${rows.length}`, sub: 'Logged Deals' },
        { label: 'Closing Deals', value: '7', sub: 'Pipeline Active', color: 'text-emerald-600' },
        { label: 'Avg Ticket Size', value: '$1,000,743.00', sub: 'High Value' },
      ];
      chartData = [
        { name: 'Enquiry', value: 3 },
        { name: 'Offer Sent', value: 3 },
        { name: 'On Review', value: 1 },
      ];
    }
    // 2. Services
    else if (id === 2) {
      rows = [
        { 'SL.No': 1, 'Service Code': 'SRV-NET-01', 'Service Name': 'Cisco SD-WAN Router Deployment', 'Category': 'Networking', 'Unit': 'Site', 'Base Rate ($)': '$1,200', 'SLA (Hrs)': '4 Hrs', 'Status': 'Active', _rawVal: 1200 },
        { 'SL.No': 2, 'Service Code': 'SRV-VOIP-02', 'Service Name': 'Avaya IP Office Voice Trunk Config', 'Category': 'Telephony', 'Unit': 'System', 'Base Rate ($)': '$850', 'SLA (Hrs)': '8 Hrs', 'Status': 'Active', _rawVal: 850 },
        { 'SL.No': 3, 'Service Code': 'SRV-SEC-03', 'Service Name': 'FortiGate UTM Firewall Hardening', 'Category': 'Security', 'Unit': 'Appliance', 'Base Rate ($)': '$950', 'SLA (Hrs)': '2 Hrs', 'Status': 'Active', _rawVal: 950 },
        { 'SL.No': 4, 'Service Code': 'SRV-CCTV-04', 'Service Name': 'Hikvision IP NVR Camera Setup & Cabling', 'Category': 'Surveillance', 'Unit': 'Camera', 'Base Rate ($)': '$180', 'SLA (Hrs)': '24 Hrs', 'Status': 'Active', _rawVal: 180 },
        { 'SL.No': 5, 'Service Code': 'SRV-AMC-05', 'Service Name': 'Enterprise 24x7 Annual AMC Support', 'Category': 'Maintenance', 'Unit': 'Annual', 'Base Rate ($)': '$4,500', 'SLA (Hrs)': '1 Hr', 'Status': 'Active', _rawVal: 4500 },
        { 'SL.No': 6, 'Service Code': 'SRV-SRV-06', 'Service Name': 'Dell PowerEdge Hyper-V Server Virtualization', 'Category': 'Servers', 'Unit': 'Host', 'Base Rate ($)': '$1,650', 'SLA (Hrs)': '12 Hrs', 'Status': 'Active', _rawVal: 1650 },
      ];
      stats = [
        { label: 'Active Services', value: `${rows.length}`, sub: 'Catalog Items' },
        { label: 'Avg Hourly / Base Rate', value: '$1,555', sub: 'Standard Margin' },
        { label: 'Fastest SLA', value: '1 Hr', sub: 'Priority AMC', color: 'text-emerald-600' },
        { label: 'Service Categories', value: '6 Types', sub: 'Infrastructure' },
      ];
      chartData = rows.map((r) => ({ name: r['Category'], value: r._rawVal }));
    }
    // 3. Product Master
    else if (id === 3) {
      rows = (crm.purchaseStocks || []).map((prod, idx) => ({
        'SL.No': idx + 1,
        'SKU': prod.sku,
        'Product Name': prod.productName,
        'Category': 'Networking & Hardware',
        'Store / Warehouse': prod.store || 'Main Hub - Warehouse A',
        'Stock Level': `${prod.quantity} Units`,
        'Reorder Point': `${prod.reorderLevel || 10} Units`,
        'Unit Price ($)': `$${prod.unitPrice.toLocaleString()}`,
        'Valuation ($)': `$${(prod.totalValue || prod.quantity * prod.unitPrice).toLocaleString()}`,
        '_rawVal': prod.totalValue || prod.quantity * prod.unitPrice,
      }));
      const totalVal = rows.reduce((acc, r) => acc + (r._rawVal || 0), 0);
      stats = [
        { label: 'Total Catalog Products', value: `${rows.length}`, sub: 'Active SKUs' },
        { label: 'Total Stock Valuation', value: `$${totalVal.toLocaleString()}`, sub: 'Inventory Worth', color: 'text-blue-600' },
        { label: 'Warehouses', value: '3 Hubs', sub: 'Dubai, Sharjah, Abu Dhabi' },
        { label: 'Low Stock Warnings', value: `${rows.filter(r => parseInt(r['Stock Level']) <= parseInt(r['Reorder Point'])).length}`, sub: 'Need Reorder', color: 'text-amber-600' },
      ];
      chartData = rows.slice(0, 5).map(r => ({ name: r['SKU'], value: r._rawVal }));
    }
    // 4. Sales Orders
    else if (id === 4) {
      rows = (crm.salesOrders || []).map((ord, idx) => {
        const gross = ord.totalAmount || ord.amount || 12500;
        const cost = Math.round(gross * 0.68);
        const margin = ord.profit || (gross - cost);
        const marginPct = Math.round((margin / gross) * 100);
        return {
          'SL.No': idx + 1,
          'Order No': ord.orderNumber,
          'Order Date': ord.orderDate || '28-09-2026',
          'Customer': ord.customer,
          'Items Count': `3 Items`,
          'Gross Total ($)': `$${gross.toLocaleString()}`,
          'Cost ($)': `$${cost.toLocaleString()}`,
          'Gross Profit ($)': `$${margin.toLocaleString()}`,
          'Margin %': `${marginPct}%`,
          'Status': ord.status || 'Confirmed',
          '_rawVal': gross,
          '_rawMargin': margin,
        };
      });
      const totalGross = rows.reduce((acc, r) => acc + (r._rawVal || 0), 0);
      const totalMargin = rows.reduce((acc, r) => acc + (r._rawMargin || 0), 0);
      stats = [
        { label: 'Total Booked Orders', value: `${rows.length}`, sub: 'Confirmed Volume' },
        { label: 'Gross Sales Revenue', value: `$${totalGross.toLocaleString()}`, sub: 'Total Invoiced' },
        { label: 'Gross Margin ($)', value: `$${totalMargin.toLocaleString()}`, sub: 'Net Spread', color: 'text-emerald-600' },
        { label: 'Average Margin', value: `${rows.length ? Math.round((totalMargin / totalGross) * 100) : 32}%`, sub: 'Healthy Return' },
      ];
      chartData = rows.slice(0, 6).map(r => ({ name: r['Order No'], value: r._rawVal }));
    }
    // 5. Campaign
    else if (id === 5) {
      rows = (crm.campaigns || []).map((camp, idx) => {
        const budget = camp.budget || 5000;
        const spend = Math.round(budget * 0.85);
        const leads = camp.leadsGenerated || 24;
        const costPerLead = leads > 0 ? Math.round(spend / leads) : 0;
        return {
          'SL.No': idx + 1,
          'Campaign Name': camp.name,
          'Type': camp.type || camp.channel || 'Digital',
          'Target Audience': 'Enterprise IT Managers',
          'Budget ($)': `$${budget.toLocaleString()}`,
          'Spend ($)': `$${spend.toLocaleString()}`,
          'Leads Generated': `${leads} Leads`,
          'Cost / Lead ($)': `$${costPerLead}`,
          'Status': camp.status,
          '_rawVal': spend,
        };
      });
      stats = [
        { label: 'Active Campaigns', value: `${rows.length}`, sub: 'Channels' },
        { label: 'Total Marketing Spend', value: `$${rows.reduce((acc, r) => acc + (r._rawVal || 0), 0).toLocaleString()}`, sub: 'Allocated' },
        { label: 'Leads Sourced', value: `${rows.reduce((acc, r) => acc + parseInt(r['Leads Generated']), 0)} Leads`, sub: 'Direct Inbound', color: 'text-emerald-600' },
        { label: 'Avg Cost per Lead', value: '$112', sub: 'Target < $150' },
      ];
      chartData = rows.map(r => ({ name: r['Campaign Name'].slice(0, 12), value: r._rawVal }));
    }
    // 6. Salesman Performance
    else if (id === 6 || id === 12) {
      const salesmen = ['Ahmed Al-Maktoum', 'Rajesh Patel', 'Sara Al-Mansoor', 'Tariq Siddiqui', 'Michael Scott'];
      rows = salesmen.map((rep, idx) => {
        const target = 150000;
        const closed = [168000, 142000, 155000, 128000, 95000][idx];
        const pct = Math.round((closed / target) * 100);
        return {
          'SL.No': idx + 1,
          'Salesperson': rep,
          'Department': 'Enterprise Commercial',
          'Deals Assigned': `${18 + idx * 2}`,
          'Deals Won': `${11 + idx}`,
          'Target ($)': `$${target.toLocaleString()}`,
          'Closed Revenue ($)': `$${closed.toLocaleString()}`,
          'Quota Attainment %': `${pct}%`,
          '_rawVal': closed,
        };
      });
      stats = [
        { label: 'Total Sales Reps', value: `${rows.length}`, sub: 'Direct Field Force' },
        { label: 'Total Closed Quota', value: `$${rows.reduce((acc, r) => acc + r._rawVal, 0).toLocaleString()}`, sub: 'Cumulative Sales' },
        { label: 'Top Performer', value: 'Ahmed Al-Maktoum', sub: '112% Attainment', color: 'text-emerald-600' },
        { label: 'Team Avg Attainment', value: '98.5%', sub: 'Target > 90%' },
      ];
      chartData = rows.map(r => ({ name: r['Salesperson'].split(' ')[0], value: r._rawVal }));
    }
    // 7. Aging Report
    else if (id === 7) {
      rows = (crm.customers || []).map((cust, idx) => {
        const c30 = idx % 2 === 0 ? 3200 : 0;
        const c60 = idx % 3 === 0 ? 4500 : 0;
        const c90 = idx === 1 ? 7800 : 0;
        const c90p = idx === 2 ? 12000 : 0;
        const total = c30 + c60 + c90 + c90p;
        return {
          'SL.No': idx + 1,
          'Customer Name': cust.companyName || cust.customerName,
          'Contact Person': cust.contactPerson,
          'Current (0-30 Days)': `$${c30.toLocaleString()}`,
          '31-60 Days': `$${c60.toLocaleString()}`,
          '61-90 Days': `$${c90.toLocaleString()}`,
          '90+ Days (Overdue)': `$${c90p.toLocaleString()}`,
          'Total Outstanding ($)': `$${total.toLocaleString()}`,
          '_rawVal': total,
          '_raw90p': c90p,
        };
      });
      const totalAR = rows.reduce((acc, r) => acc + r._rawVal, 0);
      const totalOverdue = rows.reduce((acc, r) => acc + r._raw90p, 0);
      stats = [
        { label: 'Total A/R Outstanding', value: `$${totalAR.toLocaleString()}`, sub: 'Receivables' },
        { label: '0-30 Days Current', value: `$${rows.reduce((acc, r) => acc + parseInt(r['Current (0-30 Days)'].replace(/\D/g, '') || '0'), 0).toLocaleString()}`, sub: 'Standard Terms' },
        { label: '90+ Days Overdue', value: `$${totalOverdue.toLocaleString()}`, sub: 'Action Required', color: 'text-rose-600' },
        { label: 'Accounts with Balance', value: `${rows.filter(r => r._rawVal > 0).length}`, sub: 'Active Debtors' },
      ];
      chartData = [
        { name: '0-30 Days', value: 18500 },
        { name: '31-60 Days', value: 9200 },
        { name: '61-90 Days', value: 7800 },
        { name: '90+ Days', value: 12000 },
      ];
    }
    // 8. Customer Statement
    else if (id === 8 || id === 13) {
      rows = [
        { 'SL.No': 1, 'Date': '01-09-2026', 'Transaction Ref': 'INV-2026-081', 'Customer': 'Burj Al Arab Hospitality', 'Description': 'Quarterly Maintenance AMC Invoice', 'Debit ($)': '$12,500', 'Credit ($)': '$0', 'Running Balance ($)': '$12,500', _rawVal: 12500 },
        { 'SL.No': 2, 'Date': '08-09-2026', 'Transaction Ref': 'RCT-2026-042', 'Customer': 'Burj Al Arab Hospitality', 'Description': 'Wire Transfer Payment Receipt', 'Debit ($)': '$0', 'Credit ($)': '$12,500', 'Running Balance ($)': '$0', _rawVal: 0 },
        { 'SL.No': 3, 'Date': '15-09-2026', 'Transaction Ref': 'INV-2026-094', 'Customer': 'Emirates Flight Catering', 'Description': 'VoIP PBX Switch Upgrade Pack', 'Debit ($)': '$8,900', 'Credit ($)': '$0', 'Running Balance ($)': '$8,900', _rawVal: 8900 },
        { 'SL.No': 4, 'Date': '22-09-2026', 'Transaction Ref': 'INV-2026-102', 'Customer': 'Al Futtaim Logistics', 'Description': 'Warehouse CCTV Installation', 'Debit ($)': '$14,200', 'Credit ($)': '$0', 'Running Balance ($)': '$23,100', _rawVal: 23100 },
        { 'SL.No': 5, 'Date': '25-09-2026', 'Transaction Ref': 'RCT-2026-059', 'Customer': 'Al Futtaim Logistics', 'Description': 'Cheque Clearance #89201', 'Debit ($)': '$0', 'Credit ($)': '$7,100', 'Running Balance ($)': '$16,000', _rawVal: 16000 },
      ];
      stats = [
        { label: 'Total Invoiced (Debits)', value: '$35,600', sub: 'Period Billings' },
        { label: 'Total Received (Credits)', value: '$19,600', sub: 'Realized Cash' },
        { label: 'Net Running Balance', value: '$16,000', sub: 'Current Ledger AR', color: 'text-blue-600' },
        { label: 'Statement Transactions', value: `${rows.length}`, sub: 'Reconciled Vouchers' },
      ];
      chartData = rows.map(r => ({ name: r['Transaction Ref'], value: parseInt(r['Debit ($)'].replace(/\D/g, '') || '0') || parseInt(r['Credit ($)'].replace(/\D/g, '') || '0') }));
    }
    // 9. Invoice and Receipt Report
    else if (id === 9) {
      rows = (crm.invoices || []).map((inv, idx) => {
        const total = inv.totalAmount || inv.amount || 14800;
        const rec = inv.status === 'Paid' ? total : inv.status === 'Partially Paid' ? Math.round(total * 0.5) : 0;
        const bal = inv.balanceAmount !== undefined ? inv.balanceAmount : (total - rec);
        return {
          'SL.No': idx + 1,
          'Invoice #': inv.invoiceNumber,
          'Invoice Date': inv.issueDate || '28-09-2026',
          'Customer': inv.customer,
          'Total Amount ($)': `$${total.toLocaleString()}`,
          'Received ($)': `$${rec.toLocaleString()}`,
          'Pending Balance ($)': `$${bal.toLocaleString()}`,
          'Payment Mode': idx % 2 === 0 ? 'Bank Transfer' : 'Cheque',
          'Status': inv.status || 'Paid',
          '_rawVal': total,
        };
      });
      const totalInv = rows.reduce((acc, r) => acc + (r._rawVal || 0), 0);
      stats = [
        { label: 'Total Invoices', value: `${rows.length}`, sub: 'Generated Bills' },
        { label: 'Total Billed Amount', value: `$${totalInv.toLocaleString()}`, sub: 'Tax Invoices' },
        { label: 'Paid Ratio', value: '84.2%', sub: 'Healthy Collection', color: 'text-emerald-600' },
        { label: 'Pending Collections', value: '$24,500', sub: 'Due This Month' },
      ];
      chartData = rows.slice(0, 5).map(r => ({ name: r['Invoice #'], value: r._rawVal }));
    }
    // 10. Inventory & Stock Valuation
    else if (id === 10 || id === 14) {
      rows = (crm.purchaseStocks || []).map((stk, idx) => ({
        'SL.No': idx + 1,
        'Item Code': stk.sku,
        'Item Description': stk.productName,
        'Warehouse': stk.store || 'Main Hub - Warehouse A',
        'Current Qty': `${stk.quantity} Units`,
        'Min Threshold': `${stk.reorderLevel || 10} Units`,
        'Unit Cost ($)': `$${stk.unitPrice.toLocaleString()}`,
        'Total Stock Value ($)': `$${(stk.totalValue || stk.quantity * stk.unitPrice).toLocaleString()}`,
        'Stock Health': stk.quantity > (stk.reorderLevel || 10) ? 'Optimal' : 'Low Stock',
        '_rawVal': stk.totalValue || stk.quantity * stk.unitPrice,
      }));
      const totalVal = rows.reduce((acc, r) => acc + (r._rawVal || 0), 0);
      stats = [
        { label: 'Total Tracked SKUs', value: `${rows.length}`, sub: 'Stocked Items' },
        { label: 'Cumulative Valuation', value: `$${totalVal.toLocaleString()}`, sub: 'Asset Value', color: 'text-blue-600' },
        { label: 'Stock Health Index', value: '92.4%', sub: 'Above Safety Stock', color: 'text-emerald-600' },
        { label: 'Primary Facility', value: 'Main Hub', sub: 'Air-Conditioned Central Store' },
      ];
      chartData = rows.slice(0, 5).map(r => ({ name: r['Item Code'], value: r._rawVal }));
    }
    // 11. WhatsApp Number
    else if (id === 11) {
      rows = [
        { 'SL.No': 1, 'Recipient Name': 'Dr. Tariq Al-Hashimi', 'WhatsApp Phone': '+971 50 123 4567', 'Template / Broadcast': 'AMC Service Expiry Alert', 'Sent Date & Time': '28-09-2026 10:15 AM', 'Delivery Status': 'Read', 'Response Rate %': '100%', _rawVal: 1 },
        { 'SL.No': 2, 'Recipient Name': 'Kareem Mansour', 'WhatsApp Phone': '+971 55 987 6543', 'Template / Broadcast': 'Quotation Delivery #QT-892', 'Sent Date & Time': '28-09-2026 11:30 AM', 'Delivery Status': 'Delivered', 'Response Rate %': '85%', _rawVal: 1 },
        { 'SL.No': 3, 'Recipient Name': 'Fatima Al-Zaabi', 'WhatsApp Phone': '+971 52 456 7890', 'Template / Broadcast': 'Technician Dispatched Notice', 'Sent Date & Time': '28-09-2026 12:05 PM', 'Delivery Status': 'Read', 'Response Rate %': '100%', _rawVal: 1 },
        { 'SL.No': 4, 'Recipient Name': 'Johnathan Reynolds', 'WhatsApp Phone': '+971 54 321 0987', 'Template / Broadcast': 'Invoice Receipt #INV-102', 'Sent Date & Time': '28-09-2026 01:20 PM', 'Delivery Status': 'Delivered', 'Response Rate %': '90%', _rawVal: 1 },
      ];
      stats = [
        { label: 'Total WhatsApp Broadcasts', value: '1,420', sub: 'Verified Business API' },
        { label: 'Delivery Rate', value: '98.8%', sub: 'Instant Delivery', color: 'text-emerald-600' },
        { label: 'Read & Engagement', value: '87.4%', sub: 'High Client Response' },
        { label: 'Avg Reply Latency', value: '< 4 Mins', sub: 'Customer Support SLA' },
      ];
      chartData = [
        { name: 'Read', value: 87 },
        { name: 'Delivered', value: 11 },
        { name: 'Failed', value: 2 },
      ];
    }
    // 16. Leads Report
    else if (id === 16) {
      rows = (crm.leads || []).map((lead, idx) => ({
        'SL.No': idx + 1,
        'Lead ID': `LED-${lead.id.slice(-5).toUpperCase()}`,
        'Lead Name': lead.contactDetails?.name || lead.leadSpecification || 'Inbound Prospect',
        'Company': lead.contactDetails?.company || 'Enterprise Corp',
        'Source': lead.source || 'Website Inbound',
        'Assigned Salesman': lead.owner || lead.assignedEmployee || 'Ahmed Al-Maktoum',
        'Estimated Value ($)': `$${(lead.value || 18500).toLocaleString()}`,
        'Created Date': lead.leadDate || '28-09-2026',
        'Status': lead.status,
        '_rawVal': lead.value || 18500,
      }));
      const totalVal = rows.reduce((acc, r) => acc + (r._rawVal || 0), 0);
      stats = [
        { label: 'Total Inbound Leads', value: `${rows.length}`, sub: 'Active Pipeline' },
        { label: 'Total Potential Value', value: `$${totalVal.toLocaleString()}`, sub: 'Lead Pipeline', color: 'text-blue-600' },
        { label: 'Conversion Rate', value: '44.8%', sub: 'MQL to SQL', color: 'text-emerald-600' },
        { label: 'Top Lead Source', value: 'Website & LinkedIn', sub: 'Organic Channels' },
      ];
      chartData = rows.slice(0, 5).map(r => ({ name: r['Lead Name'], value: r._rawVal }));
    }
    // 17. Customer Report
    else if (id === 17) {
      rows = (crm.customers || []).map((cust, idx) => ({
        'SL.No': idx + 1,
        'Customer Name': cust.companyName || cust.customerName,
        'Account Tier': idx % 2 === 0 ? 'Tier-1 Platinum' : 'Tier-2 Gold',
        'Active Projects': `${3 + (idx % 3)} Projects`,
        'Total Orders Value ($)': `$${(cust.totalSpend || 48000 + idx * 12500).toLocaleString()}`,
        'AMC Expiry': '31-12-2026',
        'Account Manager': cust.owner || 'Sara Al-Mansoor',
        'Health Score': '98/100',
        '_rawVal': cust.totalSpend || 48000 + idx * 12500,
      }));
      stats = [
        { label: 'Total Enterprise Accounts', value: `${rows.length}`, sub: 'Active Portfolios' },
        { label: 'Combined Lifetime Value', value: `$${rows.reduce((acc, r) => acc + r._rawVal, 0).toLocaleString()}`, sub: 'Contracted Revenue' },
        { label: 'Retention Rate', value: '96.2%', sub: 'Annual Renewals', color: 'text-emerald-600' },
        { label: 'Average NPS', value: '74', sub: 'World-Class Rating' },
      ];
      chartData = rows.slice(0, 5).map(r => ({ name: r['Customer Name'].split(' ')[0], value: r._rawVal }));
    }
    // 18. Task Report
    else if (id === 18) {
      rows = (crm.tasks || []).map((tsk, idx) => ({
        'SL.No': idx + 1,
        'Task ID': `TSK-${tsk.id.slice(-5).toUpperCase()}`,
        'Task Details': tsk.taskDetails,
        'Assigned Tech': tsk.assignedEmployee || tsk.assignee?.name || 'Hamad Al-Kaabi',
        'Priority': tsk.priority,
        'Start Date': tsk.dueDate || '28-09-2026',
        'Due Date': tsk.dueDate || '30-09-2026',
        'Progress %': `${tsk.progress || (tsk.status === 'Completed' ? 100 : 45)}%`,
        'Status': tsk.status,
        '_rawVal': tsk.progress || 50,
      }));
      const completed = rows.filter(r => r['Status'] === 'Completed').length;
      stats = [
        { label: 'Total Field Tasks', value: `${rows.length}`, sub: 'Scheduled Tickets' },
        { label: 'Completed Tasks', value: `${completed}`, sub: `${rows.length ? Math.round((completed / rows.length) * 100) : 0}% Completion`, color: 'text-emerald-600' },
        { label: 'High Priority SLA', value: `${rows.filter(r => r['Priority'] === 'High' || r['Priority'] === 'Urgent').length} Tasks`, sub: 'Escalated' },
        { label: 'Avg Turnaround', value: '4.8 Hrs', sub: 'Within 8h Target' },
      ];
      chartData = [
        { name: 'Completed', value: completed || 8 },
        { name: 'In Progress', value: 6 },
        { name: 'Pending Review', value: 3 },
      ];
    }
    // Generic fallback for any other report
    else {
      rows = Array.from({ length: 8 }).map((_, idx) => ({
        'SL.No': idx + 1,
        'Record Code': `REC-2026-0${idx + 1}`,
        'Entity / Subject': `Standard Operation Audit #${idx + 1}`,
        'Department': runningReport.category,
        'Assigned Manager': 'Operations Lead',
        'Status': idx % 3 === 0 ? 'Completed' : 'Active',
        'Processed Date': '28-09-2026',
        'Valuation ($)': `$${(12000 + idx * 3400).toLocaleString()}`,
        '_rawVal': 12000 + idx * 3400,
      }));
      columns = ['SL.No', 'Record Code', 'Entity / Subject', 'Department', 'Assigned Manager', 'Status', 'Processed Date', 'Valuation ($)'];
      stats = [
        { label: 'Total Reconciled Records', value: `${rows.length}`, sub: 'Database Entries' },
        { label: 'Report Status', value: 'Live & Synchronized', sub: 'Active CRM Engine', color: 'text-emerald-600' },
        { label: 'Data Freshness', value: 'Just Now', sub: 'Real-time WebSocket' },
        { label: 'Audit Security', value: 'Verified', sub: 'Compliance Certified' },
      ];
      chartData = rows.map(r => ({ name: r['Record Code'], value: r._rawVal }));
    }

    return { rows, stats, columns, chartData };
  }, [runningReport, crm, selectedColumns]);

  // Filtered rows for active running report based on search & filter
  const filteredLiveRows = useMemo(() => {
    return liveReportData.rows.filter((r) => {
      const matchSearch = Object.values(r).some((v) =>
        String(v).toLowerCase().includes(reportSearchQuery.toLowerCase())
      );
      const matchStatus =
        reportStatusFilter === 'All'
          ? true
          : String(r['Status'] || r['Stage'] || '').toLowerCase() === reportStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [liveReportData.rows, reportSearchQuery, reportStatusFilter]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!runningReport || filteredLiveRows.length === 0) return;
    const headers = liveReportData.columns.filter((c) => !c.startsWith('_'));
    const csvRows = [
      headers.join(','),
      ...filteredLiveRows.map((r) =>
        headers.map((h) => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runningReport.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Report exported successfully as ${a.download}`);
  };

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  // Live Refresh
  const handleRefreshData = () => {
    setIsLiveRefreshing(true);
    setTimeout(() => {
      setIsLiveRefreshing(false);
      showToast('Live report data refreshed with latest CRM state');
    }, 600);
  };

  // Open Runner
  const handleRunReport = (report: ReportDefinition) => {
    setRunningReport(report);
    setSelectedColumns(report.defaultColumns);
    setReportSearchQuery('');
    setReportStatusFilter('All');
    setReportCurrentPage(1);
  };

  // Open Customize
  const handleOpenCustomize = (report: ReportDefinition) => {
    setCustomizingReport(report);
    setCustomReportName(report.title);
    setCustomReportDesc(report.description);
    const initialSelected =
      report.defaultColumns && report.defaultColumns.length > 0
        ? report.defaultColumns
        : DEFAULT_OPP_SELECTED_FIELDS;
    setSelectedFieldsList(initialSelected);
    setAvailableFields(ALL_REPORT_FIELDS_POOL.filter((f) => !initialSelected.includes(f)));
    setActiveAvailableItem(null);
    setActiveSelectedItem(null);
    setCheckedSearchOptions(['Closed Month & Date']);
  };

  const handleMoveFieldRight = () => {
    if (!activeAvailableItem) return;
    setSelectedFieldsList((prev) => [...prev, activeAvailableItem]);
    setAvailableFields((prev) => prev.filter((f) => f !== activeAvailableItem));
    setActiveAvailableItem(null);
  };

  const handleMoveFieldLeft = () => {
    if (!activeSelectedItem) return;
    setAvailableFields((prev) => [...prev, activeSelectedItem]);
    setSelectedFieldsList((prev) => prev.filter((f) => f !== activeSelectedItem));
    setActiveSelectedItem(null);
  };

  const handleMoveFieldUp = () => {
    if (!activeSelectedItem) return;
    const idx = selectedFieldsList.indexOf(activeSelectedItem);
    if (idx <= 0) return;
    const next = [...selectedFieldsList];
    const [removed] = next.splice(idx, 1);
    next.splice(idx - 1, 0, removed);
    setSelectedFieldsList(next);
  };

  const handleMoveFieldDown = () => {
    if (!activeSelectedItem) return;
    const idx = selectedFieldsList.indexOf(activeSelectedItem);
    if (idx < 0 || idx >= selectedFieldsList.length - 1) return;
    const next = [...selectedFieldsList];
    const [removed] = next.splice(idx, 1);
    next.splice(idx + 1, 0, removed);
    setSelectedFieldsList(next);
  };

  const handleCheckAllSearchOptions = () => {
    const allOpts = SEARCH_OPTIONS_COLUMNS.flat();
    if (checkedSearchOptions.length === allOpts.length) {
      setCheckedSearchOptions([]);
    } else {
      setCheckedSearchOptions(allOpts);
    }
  };

  const handleToggleSearchOption = (opt: string) => {
    if (checkedSearchOptions.includes(opt)) {
      setCheckedSearchOptions((prev) => prev.filter((o) => o !== opt));
    } else {
      setCheckedSearchOptions((prev) => [...prev, opt]);
    }
  };

  const handleApplyCustomizationAndRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizingReport) return;
    const updatedReport: ReportDefinition = {
      ...customizingReport,
      title: customReportName.trim() || customizingReport.title,
      description: customReportDesc.trim(),
      defaultColumns: selectedFieldsList.length > 0 ? selectedFieldsList : customizingReport.defaultColumns,
    };
    setStandardReports((prev) =>
      prev.map((r) => (r.id === customizingReport.id ? updatedReport : r))
    );
    setSelectedColumns(selectedFieldsList.length > 0 ? selectedFieldsList : customizingReport.defaultColumns);
    setRunningReport(updatedReport);
    setCustomizingReport(null);
    showToast(`Custom view applied and report generated`);
  };

  // Open Edit
  const handleOpenEdit = (report: ReportDefinition) => {
    setEditingReport(report);
    setEditTitle(report.title);
    setEditDesc(report.description);
    setEditCategory(report.category);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    const updated = standardReports.map((r) =>
      r.id === editingReport.id
        ? { ...r, title: editTitle.trim(), description: editDesc.trim(), category: editCategory }
        : r
    );
    setStandardReports(updated);
    setEditingReport(null);
    showToast(`Report "${editTitle.trim()}" updated successfully`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW MODE 1: CEZCON CRM REPORT CUSTOMIZATION VIEW */}
      {customizingReport ? (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden animate-in fade-in duration-150">
          {/* Top Bar matching Cezcon */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
                {customizingReport.title} Report Customization
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCustomizingReport(null)}
              className="w-5 h-5 bg-[#d9534f] hover:bg-red-600 text-white rounded text-xs flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleApplyCustomizationAndRun} className="p-5 space-y-6 text-xs text-slate-700">
            {/* Top Form Row: Left Name/Desc + Right Dual List Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Report Name & Description */}
              <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-slate-700 font-medium flex items-center gap-1">
                    <span>Report Name</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      required
                      value={customReportName}
                      onChange={(e) => setCustomReportName(e.target.value)}
                      className="w-full bg-white border border-emerald-600 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 items-start">
                  <label className="text-slate-700 font-medium pt-1.5">
                    Description
                  </label>
                  <div className="col-span-2">
                    <textarea
                      rows={5}
                      value={customReportDesc}
                      onChange={(e) => setCustomReportDesc(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Dual Listbox (Report Fields vs Selected Fields) */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-3">
                {/* Available Report Fields Listbox */}
                <div className="flex-1 w-full space-y-1">
                  <label className="font-semibold text-slate-700 block">Report Fields</label>
                  <div className="border border-slate-300 rounded bg-white h-48 overflow-y-auto p-1 text-[11.5px]">
                    {availableFields.map((field) => (
                      <div
                        key={field}
                        onClick={() => setActiveAvailableItem(field)}
                        onDoubleClick={() => {
                          setSelectedFieldsList((prev) => [...prev, field]);
                          setAvailableFields((prev) => prev.filter((f) => f !== field));
                          setActiveAvailableItem(null);
                        }}
                        className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                          activeAvailableItem === field
                            ? 'bg-blue-600 text-white font-medium'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Navigation Buttons Stack */}
                <div className="flex sm:flex-col gap-1.5 py-2">
                  <button
                    type="button"
                    onClick={handleMoveFieldRight}
                    title="Move to Selected"
                    className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMoveFieldLeft}
                    title="Remove from Selected"
                    className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMoveFieldUp}
                    title="Move Up"
                    className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMoveFieldDown}
                    title="Move Down"
                    className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Selected Fields Listbox */}
                <div className="flex-1 w-full space-y-1">
                  <label className="font-semibold text-slate-700 block">Selected Fields</label>
                  <div className="border border-slate-300 rounded bg-white h-48 overflow-y-auto p-1 text-[11.5px]">
                    {selectedFieldsList.map((field) => (
                      <div
                        key={field}
                        onClick={() => setActiveSelectedItem(field)}
                        onDoubleClick={() => {
                          setAvailableFields((prev) => [...prev, field]);
                          setSelectedFieldsList((prev) => prev.filter((f) => f !== field));
                          setActiveSelectedItem(null);
                        }}
                        className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                          activeSelectedItem === field
                            ? 'bg-blue-600 text-white font-medium'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Search Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Search Options</h3>
              <button
                type="button"
                onClick={handleCheckAllSearchOptions}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer block"
              >
                Check All
              </button>

              {/* 4-column Bordered Grid matching Screenshot */}
              <div className="border border-slate-200 rounded overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-white">
                {SEARCH_OPTIONS_COLUMNS.map((colItems, colIdx) => (
                  <div key={colIdx} className="p-3.5 space-y-2.5">
                    {colItems.map((opt) => {
                      const isChecked = checkedSearchOptions.includes(opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-2 cursor-pointer hover:text-blue-600 text-xs text-slate-700 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSearchOption(opt)}
                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update &amp; Run</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomizingReport(null)}
                className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      ) : runningReport ? (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden animate-in fade-in duration-150">
          {/* Top Header Bar matching Screenshot */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs sm:text-sm font-semibold text-slate-800">
                {runningReport.title} Report
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setRunningReport(null)}
              className="w-5 h-5 bg-[#d9534f] hover:bg-red-600 text-white rounded text-xs flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Main Workspace Body */}
          <div className="p-4 flex flex-col lg:flex-row gap-4 items-start">
            {/* Filter Sidebar (State 1 - Open) */}
            {isFilterSidebarOpen && (
              <div className="w-full lg:w-72 bg-[#fbfbfb] border border-slate-200 rounded p-3.5 space-y-4 shrink-0 transition-all">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFilterSidebarOpen(false)}
                    className="w-4 h-4 bg-[#d9534f] hover:bg-red-600 text-white rounded-xs text-[10px] flex items-center justify-center cursor-pointer"
                    title="Collapse Filters"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-700 font-medium block">
                    Order Month &amp; Year
                  </label>
                  <select
                    value={selectedOrderMonthYear}
                    onChange={(e) => setSelectedOrderMonthYear(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Select">Select</option>
                    <option value="Jan 2026">Jan 2026</option>
                    <option value="Feb 2026">Feb 2026</option>
                    <option value="Mar 2026">Mar 2026</option>
                    <option value="Apr 2026">Apr 2026</option>
                    <option value="May 2026">May 2026</option>
                    <option value="Jun 2026">Jun 2026</option>
                    <option value="Jul 2026">Jul 2026</option>
                    <option value="Aug 2026">Aug 2026</option>
                    <option value="Sep 2026">Sep 2026</option>
                    <option value="Oct 2026">Oct 2026</option>
                    <option value="Nov 2026">Nov 2026</option>
                    <option value="Dec 2026">Dec 2026</option>
                    <option value="2027">All 2027</option>
                    <option value="2028">All 2028</option>
                    <option value="2029">All 2029</option>
                  </select>
                </div>

                {/* Sidebar Action Buttons matching Screenshot */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {runningReport.canCustomize && (
                    <button
                      type="button"
                      onClick={() => handleOpenCustomize(runningReport)}
                      className="px-3 py-1.5 rounded bg-[#f0ad4e] hover:bg-[#ec971f] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRefreshData}
                    className="px-3.5 py-1.5 rounded bg-[#002D4A] hover:bg-[#001E33] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Report Table Section */}
            <div className="flex-1 w-full space-y-3 overflow-hidden">
              {/* Header Bar with Toggle Hamburger, Title & Export Button */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {!isFilterSidebarOpen && (
                    <button
                      type="button"
                      onClick={() => setIsFilterSidebarOpen(true)}
                      className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer shadow-2xs transition-colors"
                      title="Open Search Filter"
                    >
                      <Menu className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-xs font-medium text-slate-700">
                    {runningReport.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 rounded bg-[#5cb85c] hover:bg-[#449d44] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              {/* Thin border line underneath title bar */}
              <div className="h-4 border-t border-b border-slate-200 bg-white"></div>

              {/* Authentic Cezcon CRM Blue Header Table */}
              <div className="border border-slate-200 rounded overflow-x-auto shadow-2xs bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#2196f3] text-white text-[11.5px] font-semibold border-b border-blue-400">
                      {liveReportData.columns.filter((c) => !c.startsWith('_')).map((col) => (
                        <th
                          key={col}
                          className={`py-3 px-3.5 whitespace-nowrap border-r border-blue-400/50 last:border-r-0 ${
                            col === 'SL.No' ? 'text-center w-14' : ''
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 text-[11.5px]">
                    {filteredLiveRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={liveReportData.columns.length}
                          className="py-12 text-center text-slate-500 bg-white"
                        >
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      filteredLiveRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-blue-50/20 transition-colors odd:bg-white even:bg-slate-50/40"
                        >
                          {liveReportData.columns.filter((c) => !c.startsWith('_')).map((col) => {
                            const val = row[col];
                            const isLink =
                              col.toLowerCase().includes('title') ||
                              col.toLowerCase().includes('number') ||
                              col.toLowerCase().includes('id');
                            const isAmount =
                              col.toLowerCase().includes('amount') ||
                              col.toLowerCase().includes('cost') ||
                              col.toLowerCase().includes('profit') ||
                              col.toLowerCase().includes('valuation') ||
                              col.toLowerCase().includes('$');
                            const isRating = col.toLowerCase().includes('rating');

                            return (
                              <td
                                key={col}
                                className={`py-3 px-3.5 whitespace-nowrap border-r border-slate-200 last:border-r-0 ${
                                  col === 'SL.No' ? 'text-center font-normal text-slate-800' : ''
                                } ${isAmount ? 'text-right font-normal text-slate-800' : ''}`}
                              >
                                {isLink ? (
                                  <span className="text-blue-600 hover:underline cursor-pointer font-normal">
                                    {val}
                                  </span>
                                ) : isRating ? (
                                  <span
                                    className={`font-semibold ${
                                      val === 'HOT'
                                        ? 'text-rose-600'
                                        : val === 'WARM'
                                        ? 'text-amber-600'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                ) : (
                                  <span>{val !== undefined ? String(val) : '-'}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: MAIN REPORTS CATALOG & ANALYTICS */
        <div className="space-y-4">
          {/* Top Header / View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-100 text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Report
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border border-slate-200 bg-white text-xs overflow-hidden">
                <button
                  onClick={() => setActiveView('catalog')}
                  className={`px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                    activeView === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Report List
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                    activeView === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Analytics & BI Charts
                </button>
              </div>
            </div>
          </div>

          {/* ── Cezcon CRM Standard Report List ─────────────────────────────────── */}
          {activeView === 'catalog' && (
            <div className="space-y-3">
              {/* Search bar matching Image */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search report..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md pl-3 pr-10 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              {/* Clean Table matching Image */}
              <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    {filteredStandardReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Index Column */}
                        <td className="py-3.5 px-4 w-12 font-bold text-slate-900 text-center">
                          {report.id}
                        </td>

                        {/* Report Title */}
                        <td className="py-3.5 px-4 font-bold text-blue-600 w-60">
                          <button
                            type="button"
                            onClick={() => handleRunReport(report)}
                            className="cursor-pointer hover:underline text-left"
                          >
                            {report.title}
                          </button>
                        </td>

                        {/* Report Description */}
                        <td className="py-3.5 px-4 text-slate-600 text-[11.5px] leading-snug">
                          {report.description}
                        </td>

                        {/* Action Buttons matching Image: [Customize] [Edit] [Run] */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {report.canCustomize && (
                              <button
                                type="button"
                                onClick={() => handleOpenCustomize(report)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f0ad4e] hover:bg-[#ec971f] text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Customize</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(report)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#5bc0de] hover:bg-[#31b0d5] text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRunReport(report)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#5cb85c] hover:bg-[#449d44] text-white text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Run</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Analytics View ─────────────────────────────────────────────────── */}
          {activeView === 'analytics' && (
            <div className="space-y-5">
              {/* KPI Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Revenue YTD', value: '$770K', change: '+18.5%', positive: true },
                  { label: 'Total Leads', value: '140', change: '+14.2%', positive: true },
                  { label: 'Win Rate', value: '64.5%', change: '+3.2%', positive: true },
                  { label: 'Avg Deal Size', value: '$28.5K', change: '-2.1%', positive: false },
                ].map((kpi) => (
                  <Card key={kpi.label} className="p-4 bg-white border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kpi.change} vs last year
                    </p>
                  </Card>
                ))}
              </div>

              {/* Row 1: Sales Revenue + Lead Source Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2 border-slate-200 bg-white">
                  <CardHeader className="border-b border-slate-100 py-3">
                    <div>
                      <CardTitle>Sales Revenue vs Target (Monthly)</CardTitle>
                      <p className="text-xs text-slate-400">Actual revenue achieved against monthly sales targets</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                          <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']} contentStyle={TOOLTIP_STYLE} />
                          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" />
                          <Area type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} fill="none" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader className="border-b border-slate-100 py-3">
                    <div>
                      <CardTitle>Lead Source Breakdown</CardTitle>
                      <p className="text-xs text-slate-400">Acquisition channel distribution</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leadSourceData}
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {leadSourceData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => <span className="text-[11px] text-slate-700">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Task Completion + Customer Growth + Inventory */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="border-slate-200 bg-white">
                  <CardHeader className="border-b border-slate-100 py-3">
                    <div>
                      <CardTitle>Task Completion Matrix</CardTitle>
                      <p className="text-xs text-slate-400">Weekly task execution breakdown</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskCompletionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[3, 3, 0, 0]} stackId="a" />
                          <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                          <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[3, 3, 0, 0]} stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader className="border-b border-slate-100 py-3">
                    <div>
                      <CardTitle>Customer Growth Trend</CardTitle>
                      <p className="text-xs text-slate-400">Active customer account expansion</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={customerGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Line type="monotone" dataKey="customers" name="Customers" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader className="border-b border-slate-100 py-3">
                    <div>
                      <CardTitle>Inventory Valuation</CardTitle>
                      <p className="text-xs text-slate-400">Stock value by product category</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryValuationData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                          <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                          <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={72} />
                          <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Value']} contentStyle={TOOLTIP_STYLE} />
                          <Bar dataKey="value" name="Value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CEZCON CRM CHANGE REPORT DETAILS MODAL ────────────────────────── */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-md shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                Change Report Details
              </h2>
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-lg leading-none p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingReport) return;
                const updatedReport: ReportDefinition = {
                  ...editingReport,
                  title: editTitle.trim(),
                  description: editDesc.trim(),
                };
                setStandardReports((prev) =>
                  prev.map((r) => (r.id === editingReport.id ? updatedReport : r))
                );
                setEditingReport(null);
                handleRunReport(updatedReport);
                showToast(`Report "${editTitle.trim()}" updated and generated`);
              }}
              className="p-6 space-y-5 text-xs text-slate-700"
            >
              {/* Report Name Field (Side by Side / Clean Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 sm:items-center">
                <label className="sm:col-span-1 font-medium text-slate-700">
                  Report Name <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Description Field */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 sm:items-start">
                <label className="sm:col-span-1 font-medium text-slate-700 pt-1.5">
                  Description
                </label>
                <div className="sm:col-span-3">
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update &amp; Run</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
