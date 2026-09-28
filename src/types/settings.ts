export interface CezconUserItem {
  id: number | string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role?: string;
  department?: string;
  branch?: string;
  phone?: string;
  dob?: string;
  profileId?: string;
  profileName?: string;
  profileType: string;
  isAdmin?: boolean;
  isWorker?: boolean;
  hasTarget?: boolean;
  salesPermission?: string;
  projectPermission?: string;
  status: string;
  isActive?: boolean;
  canAccessWeb?: boolean;
  canAccessMobile?: boolean;
  loginPermission?: string;
  avatarBg?: string;
  avatarImage?: string | null;
  signatureImage?: string | null;
  designation?: string;
  businessOpportunity?: string;
  salesVisitPermission?: boolean;
  store?: string;
  workerCode?: string;
  grade?: string;
  hourlyRate?: string | number;
  joiningDate?: string;
  monthlyTargetAED?: number;
  currentQuarterSalesAED?: number;
  assignedSupervisors?: string[];
  lastActive?: string;
  avatarUrl?: string;
  managerId?: string | number | null;
  reportingManagerId?: string | number | null;
  managerType?: string;
  employeeType?: string;
  dataScope?: string;
  modulePermissions?: {
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
  };
  actionPermissions?: {
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
  };
}

export interface CezconProfileItem {
  id: number | string;
  name: string;
  code?: string;
  date?: string;
  sales?: boolean;
  project?: boolean;
  description?: string;
  salesModule?: boolean;
  projectModule?: boolean;
  superAdminOnly?: boolean;
  usersCount?: number;
  permissionsCount?: number;
  permissions?: string[];
  avatarImage?: string | null;
  avatarUrl?: string | null;
}

export interface CezconTag {
  id: number | string;
  name: string;
  color?: string;
}

export interface CezconOpportunityStage {
  id: number | string;
  name: string;
  abbreviation: string;
  color: string;
  textColor?: string;
  probability?: number;
  order?: number;
}

export interface CezconLostReason {
  id: number | string;
  reason: string;
  description?: string;
  active?: boolean;
}

export interface CezconSourceItem {
  id: number | string;
  name: string;
  active?: boolean;
}

export interface CezconIndustryItem {
  id: number | string;
  name: string;
  active?: boolean;
}

export interface CezconLanguageItem {
  id: number | string;
  name: string;
  code: string;
  direction?: string;
  status?: string;
  isDefault?: boolean;
}

export interface CezconCustomFieldItem {
  id: number | string;
  name: string;
  enabled: boolean;
  required: boolean;
}

export interface CezconFieldCustomisationItem {
  id: number | string;
  module: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  isVisible: boolean;
}

export interface PrintMatrixItem {
  id: number | string;
  label: string;
  documentType?: string;
  templateName?: string;
  itemCode?: boolean;
  itemUnit?: boolean;
  itemBrand?: boolean;
  sealSign?: boolean;
  termsHead?: boolean;
  headerFooterEnabled?: boolean;
  showSignature?: boolean;
  copies?: number;
}

export interface ReportSettingItem {
  id: number | string;
  name: string;
  description?: string;
  frequency?: string;
  recipients?: string;
  enabled?: boolean;
}

export interface RegionItem {
  id: number | string;
  code: string;
  name: string;
  country?: string;
  currency?: string;
  taxRate?: string;
  status?: string;
}

export interface CustomerCreditItem {
  id: number | string;
  name?: string;
  owner?: string;
  currentCredit?: string;
  tier?: string;
  maxCreditDays?: number;
  maxLimitAED?: number;
}

export interface PoApproverItem {
  id: number | string;
  level?: string;
  role?: string;
  user?: string;
  limit?: string;
  maxApprovalLimitAED?: number;
  requiresSecondApproval?: boolean;
}

export interface DesignationItem {
  id: number | string;
  name?: string;
  title?: string;
  department: string;
  level?: string;
  count?: number;
}

export interface CampaignTypeItem {
  id: number | string;
  name: string;
}

export interface ExpenseTypeItem {
  id: number | string;
  name: string;
}

export interface CampaignStatusItem {
  id: number | string;
  name: string;
  color: string;
}

export interface CampaignSettingItem {
  id: number | string;
  key: string;
  value: string;
  type: string;
}

export interface CostJobTypeItem {
  id: number | string;
  name: string;
  costPerHour: number;
  estimatedHours: number;
}

export interface OrderStatusItem {
  id: number | string;
  name: string;
  color: string;
}

export interface ProductSettingItem {
  id: number | string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
}

export interface TaskTypeItem {
  id: number | string;
  name: string;
  icon: string;
  color: string;
}
