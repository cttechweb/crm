export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Employee' | 'Operations Manager' | 'Worker';

export type TaskStatus =
  | 'Pending'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Waiting'
  | 'Completed'
  | 'Reviewed'
  | 'Overdue'
  | 'Upcoming'
  | 'Cancelled'
  | string;

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low' | string;
export type TaskType = 'Call' | 'Meeting' | 'Demo' | 'Email' | 'Follow-up' | 'Review' | 'Document' | 'Installation' | 'HVAC Repair' | 'Site Inspection' | string;

export type LeadStatus = 'New' | 'Pending' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Converted' | 'Won' | 'Lost' | string;
export type LeadRating = 'Hot' | 'Warm' | 'Cold' | 'HOT' | 'WARM' | 'COLD' | string;

export type DealStage =
  | 'Opportunity'
  | 'Quotation'
  | 'Offer Sent'
  | 'On Review'
  | 'Allocated To Inhouse'
  | 'Order'
  | 'Proforma Invoice'
  | 'Invoice'
  | 'Receipt'
  | 'Delivery Note'
  | string;

export interface TaskActivityLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  note?: string;
  progress?: number;
}

export interface TaskComment {
  id: string;
  author: string;
  role: string;
  avatar?: string;
  text: string;
  timestamp: string;
}

export interface CrmTask {
  id: string;
  slNo: number;
  title?: string;
  taskDetails: string;
  description?: string;
  department?: string;
  location?: string;
  siteLocation?: string;
  equipmentTag?: string;
  permitRequired?: boolean;
  slaDeadline?: string;
  workerContact?: string;
  customer?: string;
  assignedBy?: string;
  assignedEmployee?: string;
  assignee: {
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
  };
  taskUnder: string;
  taskType: TaskType;
  dueTime: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  history?: TaskActivityLog[];
  comments?: TaskComment[];
}

export interface CrmLead {
  id: string;
  slNo: number;
  leadDate: string;
  assignedDate?: string;
  leadAssigned: {
    name: string;
    avatar?: string;
  };
  contactDetails: {
    name: string;
    phone: string;
    email?: string;
    company: string;
    whatsapp?: string;
    salutation?: string;
    designation?: string;
    personalMobile?: string;
    nationality?: string;
    telephone?: string;
    website?: string;
  };
  leadSpecification: string;
  createdBy: string;
  createdByAvatar?: string;
  owner: string;
  ownerAvatar?: string;
  assignedEmployee?: string;
  assignedManager?: string;
  department?: string;
  rating: LeadRating;
  status: LeadStatus;
  lastActivity: string;
  lastActivityDate?: string;
  lastActivityTimeAgo?: string;
  value: number;
  source: string;
  sourceName?: string;
  campaign?: string;
  businessOpportunity?: string;
  location?: string;
  tags?: string[];
  comments?: string;
  notes?: Array<{ id: string; author: string; avatar?: string; date: string; content: string }>;
  files?: Array<{ id: string; name: string; size: string; uploadedBy: string; date: string }>;
  salesVisits?: Array<{ id: string; visitor: string; date: string; location: string; summary: string }>;
}

export interface CrmCustomer {
  id: string;
  slNo: number;
  customerName: string;
  companyName?: string;
  contactPerson: string;
  salutation?: string;
  phone: string;
  mobile?: string;
  email: string;
  owner: string;
  ownerAvatar?: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  type?: 'Customer' | 'Prospect';
  date?: string;
  createdDate?: string;
  assignedDate?: string;
  industryType?: string;
  keyCustomer?: boolean | string;
  source?: string;
  campaign?: string;
  tags?: string[];
  lastEnquiry?: string;
  openEnquiries?: number;
  lastOrder?: string;
  outstanding?: number;
  lastActivity: string;
  companyGroup: string;
  totalDeals: number;
  totalSpend: number;
  category?: string;
  address?: string;
  city?: string;
  website?: string;
  contractStatus?: string;
  lastVisitDate?: string;
  assignedEquipmentCount?: number;
  activeJobsCount?: number;
  slaLevel?: string;
  createdFromLeadId?: string;
  parentCustomer?: string;
  sourceName?: string;
  employees?: string | number;
  country?: string;
  stateRegion?: string;
  location?: string;
  trn?: string;
  comments?: string;
  isSupplier?: boolean;
  createdBy?: string;
}

export interface CrmSalesOpportunity {
  id: string;
  slNo?: number;
  opportunityCode?: string;
  createdFromLeadId?: string;
  title: string;
  subtitle?: string;
  starred?: boolean;
  customer: string;
  contactPerson?: string;
  phone?: string;
  whatsapp?: string;
  ownerBadge?: string;
  amount: number;
  stage: DealStage;
  probability: number;
  owner: string;
  ownerAvatar?: string;
  opportunityDate?: string;
  opportunityDateDaysAgo?: string;
  opportunityAssigned?: string;
  expectedClose: string;
  closeDateRemaining?: string;
  lastActivity?: string;
  lastActivityRelative?: string;
  classification?: string;
  rating?: string;
  businessOpportunity?: string;
  campaign?: string;
  source?: string;
  sourceName?: string;
  discount?: number | string;
  vatType?: string;
  vatRate?: number | string;
  adjustment?: number | string;
  deliveryDate?: string;
  lpoNumber?: string;
  lpoDate?: string;
  nextAction?: string;
  competitorsDetails?: string;
  type?: string;
  comments?: string;
  location?: string;
  reference?: string;
  deliveryMethod?: string;
  enquiryForm?: boolean;
  createdBy?: string;
  tags?: string[];
  createdAt: string;
}

export interface CrmPurchaseStock {
  id: string;
  slNo: number;
  productName: string;
  sku: string;
  store: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  reorderLevel: number;
}

export interface CrmCampaign {
  id: string;
  slNo?: number;
  name: string;
  owner?: {
    name: string;
    avatar?: string;
  };
  channel?: string;
  type?: string;
  budget?: number;
  leadsGenerated?: number;
  conversionRate?: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'Draft' | 'Paused';
  startDate?: string;
  endDate?: string;
  listing?: boolean;
}

export type UserPosition =
  | 'CEO'
  | 'COO'
  | 'CSO'
  | 'CPO'
  | 'Sales Manager'
  | 'Sales Employee'
  | 'Purchase Manager'
  | 'Purchase Employee'
  | string;

export type UserDepartment = 'Executive' | 'Management' | 'Sales' | 'Purchase' | string;

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position?: UserPosition;
  department: UserDepartment;
  managerId?: string | null;
  reportsTo?: string | null;
  teamId?: string | null;
  phone: string;
  designation?: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

export interface PermissionRule {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  assign: boolean;
  approve: boolean;
  export: boolean;
}

export interface CrmQuotationItem {
  id: string;
  productId?: string;
  itemCode?: string;
  sku?: string;
  name?: string;
  productName?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  total?: number;
  lineTotal?: number;
  totalAmount?: number;
}

export interface CrmQuotationHistoryEntry {
  id?: string;
  date?: string;
  action: string;
  user?: string;
  role?: string;
  remarks?: string;
  performedBy?: string;
  performedByRole?: string;
  timestamp?: string;
  notes?: string;
}

export interface CrmQuotation {
  id: string;
  slNo?: number;
  quotationNumber: string;
  customerId?: string;
  customer: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  opportunityId?: string;
  opportunityCode?: string;
  subject: string;
  quoteDate: string;
  validUntil: string;
  createdDate?: string;
  currency?: string;
  items?: CrmQuotationItem[];
  itemsCount?: number;
  grossAmount?: number;
  subtotal: number;
  discountTotal?: number;
  discountAmount?: number;
  taxableAmount?: number;
  vatRate?: number;
  vatAmount: number;
  shippingCharges?: number;
  totalAmount: number;
  status:
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Sent'
  | 'Viewed'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Cancelled'
  | 'Converted';
  owner?: string;
  ownerId?: string;
  assignedTo?: string;
  assignedEmployeeId?: string;
  managerId?: string;
  departmentId?: string;
  department?: string;
  createdBy?: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  warranty?: string;
  warrantyTerms?: string;
  validityTerms?: string;
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  convertedOrderId?: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  convertedAt?: string;
  history?: CrmQuotationHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmSalesOrder {
  id: string;
  slNo?: number;
  orderNumber: string;
  quotationRef?: string;
  opportunityRef?: string;
  subject?: string;
  customer: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  poReference?: string;
  orderDate: string;
  deliveryDueDate?: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  profit?: number;
  receivable?: number;
  status: string;
  assignedTo?: string;
  owner?: string;
  ownerAvatar?: string;
  category?: string;
  notes?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
}

export interface CrmProformaInvoice {
  id: string;
  slNo: number;
  piNumber: string;
  quotationRef?: string;
  opportunityTitle?: string;
  customer: string;
  issueDate: string;
  paymentTerms?: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  preparedBy?: string;
  preparedByMobile?: string;
  owner?: string;
  ownerAvatar?: string;
  items?: CrmInvoiceLineItem[];
  adjustment?: number;
  remarks?: string;
  phone?: string;
  location?: string;
  attention?: string;
  trnNumber?: string;
  lpoNumber?: string;
  lpoDate?: string;
}

export interface CrmInvoiceLineItem {
  id: string;
  description: string;
  code?: string;
  unit?: string;
  brand?: string;
  qty: number;
  price: number;
  total?: number;
}

export interface CrmInvoice {
  id: string;
  slNo: number;
  invoiceNumber: string;
  orderRef?: string;
  opportunityOrderRef?: string;
  customer: string;
  contactPerson?: string;
  phone?: string;
  owner?: string;
  ownerAvatar?: string;
  trnNumber?: string;
  issueDate: string;
  dueDate?: string;
  nextFollowup?: string;
  amount: number;
  subtotal?: number;
  vatAmount?: number;
  vatRate?: number | string;
  vatType?: string;
  totalAmount?: number;
  paidAmount: number;
  balanceAmount: number;
  lpoNumber?: string;
  lpoDate?: string;
  referenceNumber?: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid' | 'Due' | string;
  location?: string;
  attention?: string;
  description?: string;
  discount?: number | string;
  discountPercent?: number | string;
  adjustment?: number | string;
  termsConditions?: string;
  items?: CrmInvoiceLineItem[];
}

export interface CrmReceipt {
  id: string;
  slNo: number;
  receiptNumber: string;
  invoiceRef?: string;
  customer: string;
  contactPerson?: string;
  phone?: string;
  createdBy?: string;
  createdByAvatar?: string;
  receiptType?: string;
  tags?: string[];
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'Cash' | string;
  receiptDate: string;
  amount: number;
  referenceNumber?: string;
  status: 'Cleared' | 'Pending Clearance' | 'Bounced' | 'Cancelled' | string;
}

export interface CrmDeliveryNote {
  id: string;
  slNo: number;
  deliveryNoteNumber: string;
  owner?: string;
  ownerAvatar?: string;
  orderRef?: string;
  orderDescription?: string;
  customer: string;
  invoiceRef?: string;
  dnType?: string;
  location?: string;
  receivedBy?: string;
  receivedPhone?: string;
  costUpdated?: boolean;
  siteLocation?: string;
  driverName?: string;
  vehicleNumber?: string;
  dispatchDate: string;
  itemsCount?: number;
  status: 'Scheduled' | 'Out for Delivery' | 'Delivered' | 'Returned' | string;
}

export interface CrmCezconStock {
  id: string;
  slNo: number;
  serialNo?: string;
  code: string;
  name: string;
  image?: string;
  unit: string;
  brand: string;
  category: string;
  type: string;
  purchaseRate: number;
  sellingPrice: number;
  minStock?: string;
  stock: number;
  currentStock?: number;
  minimumStock?: number;
  store?: string;
  status?: string;
  createdBy?: string;
  createdByRole?: string;
  createdById?: string;
  createdByEmail?: string;
  owner?: string;
}

export interface CrmStockTransfer {
  id: string;
  slNo: number;
  transferNo: string;
  date: string;
  owner: string;
  ownerAvatar?: string;
  transferFrom: string;
  transferTo: string;
}

