import {
  CezconProfileItem,
  CezconTag,
  CezconOpportunityStage,
  CezconLostReason,
  CezconSourceItem,
  CezconIndustryItem,
  CezconLanguageItem,
  CezconCustomFieldItem,
  PrintMatrixItem,
  ReportSettingItem,
  RegionItem,
  CustomerCreditItem,
  PoApproverItem,
  DesignationItem,
  CampaignTypeItem,
  ExpenseTypeItem,
  CampaignStatusItem,
  CampaignSettingItem,
  CostJobTypeItem,
  OrderTypeItem,
  OrderStatusItem,
  ProductSettingItem,
  ProductUnitItem,
  ProductBrandItem,
  ProductCategoryItem,
  TaskTypeItem,
} from '@/types/settings';

export const CEZCON_PROFILES_DATA: CezconProfileItem[] = [
  {
    id: 1,
    name: 'Employee',
    code: 'EMPLOYEE',
    date: '28-09-2026',
    sales: true,
    project: true,
    description: 'Standard employee profile with day-to-day operations access.',
    salesModule: true,
    projectModule: true,
    superAdminOnly: false,
    usersCount: 6,
    permissionsCount: 28,
  },
  {
    id: 2,
    name: 'Manager',
    code: 'MANAGER',
    date: '01-01-2026',
    sales: true,
    project: true,
    description: 'Departmental management, deal approvals, and operations oversight.',
    salesModule: true,
    projectModule: true,
    superAdminOnly: false,
    usersCount: 3,
    permissionsCount: 45,
  },
  {
    id: 3,
    name: 'Worker',
    code: 'WORKER',
    date: '29-09-2026',
    sales: false,
    project: true,
    description: 'Field worker execution, maintenance tasks, and service delivery.',
    salesModule: false,
    projectModule: true,
    superAdminOnly: false,
    usersCount: 8,
    permissionsCount: 24,
  },
];

export const CEZCON_TAGS_DATA: CezconTag[] = [
  { id: 1, name: 'Maintenance' },
  { id: 2, name: 'Inspection' },
  { id: 3, name: 'UWSR' },
  { id: 4, name: 'Ice Maker' },
  { id: 5, name: 'Vaccum Cleaner' },
  { id: 6, name: 'Installation' },
  { id: 7, name: 'Chiller' },
  { id: 8, name: 'PCB Board' },
  { id: 9, name: 'Compressor' },
  { id: 10, name: 'Fan Motor' },
  { id: 11, name: 'Thermostat' },
  { id: 12, name: 'Duct Cleaning' },
  { id: 13, name: 'Cooling Tower' },
  { id: 14, name: 'Condenser Coil' },
  { id: 15, name: 'Air Handling Unit (AHU)' },
  { id: 16, name: 'Fan Coil Unit (FCU)' },
  { id: 17, name: 'Refrigerant Leakage' },
  { id: 18, name: 'Annual Maintenance Contract' },
  { id: 19, name: 'Emergency Breakdown' },
  { id: 20, name: 'VIP Customer' },
];

export const CEZCON_OPPORTUNITY_STAGES_DATA: CezconOpportunityStage[] = [
  { id: 1, name: 'Prospecting / Discovery', abbreviation: 'DISC', color: '#64748b', textColor: '#64748b', probability: 10, order: 1 },
  { id: 2, name: 'Qualification & Needs Assessment', abbreviation: 'QUAL', color: '#3b82f6', textColor: '#3b82f6', probability: 25, order: 2 },
  { id: 3, name: 'Quotation / Proposal Sent', abbreviation: 'PROP', color: '#eab308', textColor: '#eab308', probability: 50, order: 3 },
  { id: 4, name: 'Commercial Negotiation', abbreviation: 'NEGO', color: '#f97316', textColor: '#f97316', probability: 75, order: 4 },
  { id: 5, name: 'Closed Won (Deal Signed)', abbreviation: 'WON', color: '#22c55e', textColor: '#22c55e', probability: 100, order: 5 },
  { id: 6, name: 'Closed Lost / Dropped', abbreviation: 'LOST', color: '#ef4444', textColor: '#ef4444', probability: 0, order: 6 },
];

export const CEZCON_LOST_REASONS_DATA: CezconLostReason[] = [
  { id: 1, reason: 'Competitor Price was significantly lower', active: true },
  { id: 2, reason: 'Budget constraint / Project canceled by client', active: true },
  { id: 3, reason: 'Feature / Specification mismatch', active: true },
  { id: 4, reason: 'Delivery timeline too long', active: true },
  { id: 5, reason: 'Client went with incumbent vendor', active: true },
  { id: 6, reason: 'Lack of executive sponsor / change of management', active: true },
];

export const CEZCON_SOURCES_DATA: CezconSourceItem[] = [
  { id: 1, name: 'Direct Website Inquiry', active: true },
  { id: 2, name: 'LinkedIn Campaign / InMail', active: true },
  { id: 3, name: 'Cold Call / Outreach', active: true },
  { id: 4, name: 'Existing Customer Referral', active: true },
  { id: 5, name: 'Trade Show / Gitex Expo', active: true },
  { id: 6, name: 'Google Ads / Search SEM', active: true },
  { id: 7, name: 'Partner / Reseller Channel', active: true },
];

export const CEZCON_INDUSTRIES_DATA: CezconIndustryItem[] = [
  { id: 1, name: 'Construction & Civil Engineering', active: true },
  { id: 2, name: 'Information Technology & Software', active: true },
  { id: 3, name: 'Oil & Gas / Petrochemicals', active: true },
  { id: 4, name: 'Hospitality & Luxury Hotels', active: true },
  { id: 5, name: 'Healthcare & Medical Devices', active: true },
  { id: 6, name: 'Retail & FMCG Distribution', active: true },
  { id: 7, name: 'Logistics & Marine Freight', active: true },
];

export const CEZCON_LANGUAGES_DATA: CezconLanguageItem[] = [
  { id: 1, name: 'English (UK / US)', code: 'EN', direction: 'LTR', status: 'Default', isDefault: true },
  { id: 2, name: 'Arabic (العربية)', code: 'AR', direction: 'RTL', status: 'Active', isDefault: false },
  { id: 3, name: 'Hindi (हिन्दी)', code: 'HI', direction: 'LTR', status: 'Active', isDefault: false },
  { id: 4, name: 'French (Français)', code: 'FR', direction: 'LTR', status: 'Active', isDefault: false },
];

export const CEZCON_FIELD_CUSTOMISATION_DATA: Record<string, CezconCustomFieldItem[]> = {
  lead: [
    { id: 1, name: 'Company Size / Employee Count', enabled: true, required: false },
    { id: 2, name: 'Annual Budget Estimation (AED)', enabled: true, required: true },
    { id: 3, name: 'Decision Maker LinkedIn URL', enabled: true, required: false },
    { id: 4, name: 'Secondary Contact Number', enabled: true, required: false },
    { id: 5, name: 'Current Solution / Incumbent Brand', enabled: false, required: false },
  ],
  customer: [
    { id: 6, name: 'Federal TRN Tax Number', enabled: true, required: true },
    { id: 7, name: 'Trade License Copy Attachment', enabled: true, required: false },
    { id: 8, name: 'Credit Limit Approval Tier', enabled: true, required: true },
    { id: 9, name: 'Payment Terms / Grace Period', enabled: true, required: true },
  ],
  opportunity: [
    { id: 10, name: 'Expected Close Date Milestone', enabled: true, required: true },
    { id: 11, name: 'Competitor Mentioned', enabled: true, required: false },
    { id: 12, name: 'Technical Site Survey Required', enabled: true, required: false },
  ],
  order: [
    { id: 13, name: 'Customer PO Reference Number', enabled: true, required: true },
    { id: 14, name: 'Delivery Warehouse Location', enabled: true, required: true },
    { id: 15, name: 'Installation Required Date', enabled: true, required: false },
  ],
  invoice: [
    { id: 16, name: 'Bank Payment Swift Code', enabled: true, required: true },
    { id: 17, name: 'Commercial Discount Approval Ref', enabled: true, required: false },
  ],
};

export const INITIAL_PRINT_MATRIX: PrintMatrixItem[] = [
  { id: 1, label: 'Quotation / Commercial Offer', itemCode: true, itemUnit: true, itemBrand: true, sealSign: true, termsHead: true },
  { id: 2, label: 'Proforma Invoice Voucher', itemCode: true, itemUnit: true, itemBrand: false, sealSign: true, termsHead: true },
  { id: 3, label: 'Standard Tax Invoice (FTA)', itemCode: true, itemUnit: true, itemBrand: true, sealSign: true, termsHead: true },
  { id: 4, label: 'Warehouse Delivery Note', itemCode: true, itemUnit: true, itemBrand: false, sealSign: true, termsHead: false },
  { id: 5, label: 'Payment Receipt / Official Slip', itemCode: false, itemUnit: false, itemBrand: false, sealSign: true, termsHead: true },
];

export const CEZCON_REPORT_SETTINGS_DATA: ReportSettingItem[] = [
  { id: 1, name: 'Daily Sales Executive Summary', description: 'Consolidated performance overview of inquiries, pipeline and won opportunities sent daily.' },
  { id: 2, name: 'Weekly Pipeline Velocity & Forecast', description: 'Weekly stage conversions, deal sizes, probability forecast and sales velocity by rep.' },
  { id: 3, name: 'Monthly Receivables Aging & Collection', description: '30/60/90+ days aging breakdown, payment collection progress, and credit threshold alerts.' },
  { id: 4, name: 'Quarterly Target vs Achievement', description: 'Quarterly executive board report measuring revenue targets versus actual closed sales.' },
];

export const CEZCON_REGIONS_DATA: RegionItem[] = [
  { id: 1, code: '+971', name: 'United Arab Emirates (UAE)', currency: 'AED', taxRate: '5.00%', status: 'Active' },
  { id: 2, code: '+966', name: 'Kingdom of Saudi Arabia (KSA)', currency: 'SAR', taxRate: '15.00%', status: 'Active' },
  { id: 3, code: '+974', name: 'State of Qatar (QAT)', currency: 'QAR', taxRate: '0.00%', status: 'Active' },
  { id: 4, code: '+968', name: 'Sultanate of Oman (OMN)', currency: 'OMR', taxRate: '5.00%', status: 'Active' },
];

export const CEZCON_CUSTOMER_CREDIT_DATA: CustomerCreditItem[] = [
  { id: 1, name: 'Al Futtaim Engineering LLC', owner: 'Rashid Khan', currentCredit: 'AED 184,500.00' },
  { id: 2, name: 'Emaar Hospitality Group', owner: 'Sarah Jenkins', currentCredit: 'AED 92,000.00' },
  { id: 3, name: 'Sobha Constructions LLC', owner: 'Vikram Mehta', currentCredit: 'AED 340,000.00' },
  { id: 4, name: 'Damac Properties Projects', owner: 'Sarah Jenkins', currentCredit: 'AED 15,200.00' },
];

export const CEZCON_PO_APPROVERS_DATA: PoApproverItem[] = [
  { id: 1, level: 'Level 1 Approval', role: 'Sales Team Leader / Branch Manager', user: 'Sarah Jenkins (Manager)', limit: 'AED 50,000.00' },
  { id: 2, level: 'Level 2 Approval', role: 'Commercial Operations Director', user: 'Mohammed Admin (Admin)', limit: 'AED 250,000.00' },
  { id: 3, level: 'Level 3 Approval', role: 'Managing Director & CEO', user: 'Super Admin Master', limit: 'AED 1,000,000.00+' },
];

export const CEZCON_DESIGNATIONS_DATA: DesignationItem[] = [
  { id: 1, name: 'Managing Director & CEO', department: 'Executive Management', count: 1 },
  { id: 2, name: 'Sales Manager', department: 'Commercial Sales', count: 3 },
  { id: 3, name: 'Senior Key Account Executive', department: 'Commercial Sales', count: 6 },
  { id: 4, name: 'Technical Support Specialist', department: 'Operations & Engineering', count: 8 },
  { id: 5, name: 'Finance Controller', department: 'Accounts & Finance', count: 2 },
];

export const CEZCON_CAMPAIGN_TYPES_DATA: CampaignTypeItem[] = [
  { id: 1, name: 'Email Newsletter / Drip' },
  { id: 2, name: 'LinkedIn B2B Sponsored Ad' },
  { id: 3, name: 'Trade Exhibition / Event' },
  { id: 4, name: 'Google Ads Search' },
  { id: 5, name: 'Direct Tele-Prospecting' },
];

export const CEZCON_EXPENSE_TYPES_DATA: ExpenseTypeItem[] = [
  { id: 1, name: 'Venue & Booth Rental' },
  { id: 2, name: 'Digital Ad Spend / Media Budget' },
  { id: 3, name: 'Creative Design & Copywriting' },
  { id: 4, name: 'Client Entertainment & Meals' },
  { id: 5, name: 'Collateral Printing & Swag' },
];

export const CEZCON_CAMPAIGN_STATUSES_DATA: CampaignStatusItem[] = [
  { id: 1, name: 'Draft / Planning', color: '#64748b' },
  { id: 2, name: 'Active / Running', color: '#2563eb' },
  { id: 3, name: 'Paused / Under Review', color: '#f59e0b' },
  { id: 4, name: 'Completed / Finalized', color: '#16a34a' },
  { id: 5, name: 'Cancelled', color: '#dc2626' },
];

export const CAMPAIGN_SETTINGS: CampaignSettingItem[] = [
  { id: 1, key: 'Default Campaign Currency', value: 'AED', type: 'text' },
  { id: 2, key: 'Attribution Lookback Window (Days)', value: '30', type: 'number' },
  { id: 3, key: 'Automatic Budget Alert Threshold (%)', value: '85', type: 'number' },
  { id: 4, key: 'Enable Multi-Touch Attribution Tracking', value: 'Yes', type: 'text' },
];

export const COST_JOB_TYPES: CostJobTypeItem[] = [
  { id: 1, name: 'Incentive', manpower: false },
  { id: 2, name: 'Salary', manpower: false },
  { id: 3, name: 'Transportation', manpower: false },
  { id: 4, name: 'Material Cost', manpower: true },
  { id: 5, name: 'Overtime Allowance', manpower: false },
  { id: 6, name: 'Subcontractor Technical Charges', manpower: true },
  { id: 7, name: 'Equipment Rental & Rigging', manpower: false },
];

export const CEZCON_ORDER_TYPES_DATA: OrderTypeItem[] = [
  { id: 1, name: 'Service – On Call', active: true, description: 'Single-instance on-demand technician visit and service call' },
  { id: 2, name: 'Service – Under Warranty', active: true, description: 'Manufacturer & SLA warranty coverage repairs and diagnostics' },
  { id: 3, name: 'Equipment Sales', active: true, description: 'Direct commercial hardware & equipment purchase order' },
  { id: 4, name: 'Projects', active: true, description: 'Multi-phase turnkey design, construction & integration project' },
  { id: 5, name: 'Spare Part Sales', active: true, description: 'Direct replacement components and consumables sales' },
  { id: 6, name: 'Supply And Installation', active: true, description: 'Hardware procurement bundled with on-site deployment & cabling' },
  { id: 7, name: 'Installation', active: true, description: 'Labor-only on-site installation, setup, and system testing' },
  { id: 8, name: 'Supply', active: true, description: 'Pure delivery and shipment fulfillment of products' },
  { id: 9, name: 'Service – Under AMC', active: true, description: 'Scheduled preventive & corrective maintenance contract' },
  { id: 10, name: 'Fit Out', active: true, description: 'Interior architectural and MEP architectural fit-out package' },
];

export const ORDER_STATUSES: OrderStatusItem[] = [
  { id: 1, name: 'Order Placed / Pending Confirmation', color: '#3b82f6' },
  { id: 2, name: 'Approved / Processing In Warehouse', color: '#8b5cf6' },
  { id: 3, name: 'Ready for Dispatch / In Transit', color: '#f59e0b' },
  { id: 4, name: 'Delivered / Awaiting Installation', color: '#06b6d4' },
  { id: 5, name: 'Completed & Signed Off', color: '#22c55e' },
  { id: 6, name: 'Cancelled / Returned', color: '#ef4444' },
];

export const CEZCON_PRODUCT_UNITS_DATA: ProductUnitItem[] = [
  { id: 1, name: 'Pieces', abbreviation: 'Pcs', active: true },
  { id: 2, name: 'Sets', abbreviation: 'Set', active: true },
  { id: 3, name: 'Boxes', abbreviation: 'Box', active: true },
  { id: 4, name: 'Meters', abbreviation: 'Mtr', active: true },
  { id: 5, name: 'Units', abbreviation: 'Unit', active: true },
  { id: 6, name: 'Pairs', abbreviation: 'Pair', active: true },
];

export const CEZCON_PRODUCT_BRANDS_DATA: ProductBrandItem[] = [
  { id: 1, name: 'MIDEA', code: 'MID', active: true },
  { id: 2, name: 'LG', code: 'LG', active: true },
  { id: 3, name: 'AKAI', code: 'AKAI', active: true },
  { id: 4, name: 'DAIKIN', code: 'DAIK', active: true },
  { id: 5, name: 'O GENERAL', code: 'OGEN', active: true },
  { id: 6, name: 'GREE', code: 'GREE', active: true },
  { id: 7, name: 'CARRIER', code: 'CARR', active: true },
  { id: 8, name: 'COOL TECH', code: 'CT', active: true },
];

export const CEZCON_PRODUCT_CATEGORIES_DATA: ProductCategoryItem[] = [
  { id: 1, name: 'CASSETTE AC', code: 'CAT-CAC', active: true },
  { id: 2, name: 'SPLIT AC', code: 'CAT-SAC', active: true },
  { id: 3, name: 'REFRIGERATOR', code: 'CAT-REF', active: true },
  { id: 4, name: 'DUCTED SPLIT AC', code: 'CAT-DAC', active: true },
  { id: 5, name: 'CHILLER', code: 'CAT-CHL', active: true },
  { id: 6, name: 'VRF / VRV SYSTEM', code: 'CAT-VRF', active: true },
  { id: 7, name: 'MAINTENANCE SERVICE', code: 'CAT-SVC', active: true },
  { id: 8, name: 'SPARE PARTS', code: 'CAT-SPR', active: true },
];

export const PRODUCTS_SETTINGS: ProductSettingItem[] = [];

export const TASK_TYPES: TaskTypeItem[] = [
  { id: 1, name: 'Fleet Maintenance RM', amount: 0, color: '#A3E635' },
  { id: 2, name: 'Fleet Maintenance DM', amount: 0, color: '#F87171' },
  { id: 3, name: 'Service', amount: 0, color: '#EF4444' },
  { id: 4, name: 'Followup', amount: 0, color: '#F59E0B' },
  { id: 5, name: 'Quotation', amount: 0, color: '#FB7185' },
  { id: 6, name: 'Payment Collection', amount: 0, color: '#22C55E' },
  { id: 7, name: 'Mail', amount: 0, color: '#38BDF8' },
  { id: 8, name: 'Other', amount: 0, color: '#15803D' },
  { id: 9, name: 'Meeting', amount: 0, color: '#9333EA' },
  { id: 10, name: 'Call', amount: 0, color: '#0D9488' },
];
