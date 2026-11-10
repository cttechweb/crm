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
  leadNumber?: string;
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
  ownerId?: string;
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
  leadNumber?: string;
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
  | 'Sales Executive'
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
  quotationId?: string;
  opportunityRef?: string;
  leadNumber?: string;
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
  items?: CrmQuotationItem[];
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
  orderId?: string;
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
  openingStock?: number;
  minimumStock?: number;
  store?: string;
  status?: string;
  supplier?: string;
  supplierId?: string;
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
  status?: string;
  notes?: string;
}

export interface CrmSupplier {
  id: string;
  slNo: number;
  supplierName: string;
  name?: string;
  companyName?: string;
  trn?: string;
  contactPerson?: string;
  contact?: string;
  email?: string;
  phone: string;
  mobile?: string;
  address?: string;
  city?: string;
  stateRegion?: string;
  country?: string;
  paymentTerms?: string;
  status: 'Active' | 'Inactive' | 'Blocked' | string;
  customerId?: string;
  owner?: string;
  ownerAvatar?: string;
  outstanding?: number;
  createdBy?: string;
  remarks?: string;
}

export interface CrmStore {
  id: string;
  slNo: number;
  name: string;
  code?: string;
  location?: string;
  address?: string;
  managerName?: string;
  phone?: string;
  isActive: boolean;
}

export interface CrmPurchaseOrderItem {
  id: string;
  code?: string;
  description: string;
  unit?: string;
  brand?: string;
  qty: number;
  deliveryPending?: number;
  amount: number;
  total: number;
}

export interface CrmPurchaseOrder {
  id: string;
  slNo: number;
  poNumber: string;
  date: string;
  expectedDeliveryDate?: string;
  supplier: string;
  supplierId?: string;
  orderRef?: string;
  reference?: string;
  description?: string;
  opportunityOrder?: string;
  projectNumber?: string;
  projectName?: string;
  vatType?: string;
  vatRate?: number;
  attention?: string;
  preparedBy?: string;
  preparedByMobile?: string;
  preparedByEmail?: string;
  preparedByDesignation?: string;
  termsCondition?: string;
  termsConditionText?: string;
  amount: number;
  vat: number;
  discount: number;
  adjustment: number;
  totalAmount: number;
  invoiceReceived?: string;
  approval: 'Approved' | 'Reject' | 'Waiting for Final Approval' | string;
  deliveryStatus: 'Delivered' | 'Partially Delivered' | 'Pending' | string;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Due' | string;
  owner?: string;
  ownerAvatar?: string;
  items?: CrmPurchaseOrderItem[];
  evaluatedTotalValue?: number;
  requiredApprovalTier?: 'FINANCE_CONTROLLER' | 'CHIEF_OPERATING_OFFICER' | string;
  approvedByName?: string;
  approvedAt?: string;
  isAdhoc?: boolean;
  deliveryMode?: 'Warehouse_Receipt' | 'Direct_Site_Delivery' | string;
  msrfId?: string;
  salesOrderId?: string;
  approvals?: CrmPurchaseApproval[];
}

export interface CrmStockInItem {
  id: string;
  slNo?: number;
  code?: string;
  item: string;
  unit?: string;
  brand?: string;
  purchaseRate: number;
  sellingPrice: number;
  qty: number;
  currentStock?: number;
}

export interface CrmStockInRecord {
  id: string;
  slNo: number;
  stockInNo: string;
  date: string;
  supplier: string;
  purchaseInvoiceNumber?: string;
  deliveryNote?: string;
  lpoNumber?: string;
  store: string;
  totalAmount?: number;
  totalItems?: number;
  notes?: string;
  createdBy?: string;
  createdFormatted?: string;
  items?: CrmStockInItem[];
}

// ============================================================================
// PHASE 3 PROCUREMENT GOVERNANCE TYPES
// ============================================================================

export type MsrfPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type MsrfReportingStatus = 'Pending' | 'Approved' | 'Rejected' | 'More_Info_Required';
export type MsrfProcurementStatus =
  | 'Awaiting_Intake'
  | 'Intake_Accepted'
  | 'Stock_Verified'
  | 'Sourcing'
  | 'Recommendation_Prepared'
  | 'Closed'
  | 'Cancelled';
export type MsrfStockVerificationStatus =
  | 'Unverified'
  | 'Full_Stock_Available'
  | 'Partial_Stock_Available'
  | 'No_Stock_Available';

export interface CrmMsrfItem {
  id: string;
  msrfId?: string;
  itemCode?: string;
  description: string;
  unit?: string;
  brandPreference?: string;
  requestedQty: number;
  availableStockQty?: number;
  procureQty?: number;
  estimatedUnitRate: number;
  estimatedTotalAmount: number;
  sortOrder?: number;
}

export interface CrmMsrf {
  id: string;
  slNo?: number;
  msrfNumber: string;
  date: string;
  requestorId: string;
  requestorName: string;
  department: string;
  priority: MsrfPriority;
  purpose: string;
  requiredByDate: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  projectName?: string;
  estimatedTotalValue: number;
  reportingHeadId?: string;
  reportingHeadName?: string;
  reportingHeadStatus: MsrfReportingStatus;
  reportingHeadDecisionAt?: string;
  reportingHeadRemarks?: string;
  procurementStatus: MsrfProcurementStatus;
  assignedBuyerId?: string;
  assignedBuyerName?: string;
  stockVerificationStatus?: MsrfStockVerificationStatus;
  purchaseInstructions?: string;
  requestorConfirmedAt?: string;
  requestorFeedback?: string;
  isClosed?: boolean;
  closedAt?: string;
  closedById?: string;
  items?: CrmMsrfItem[];
  auditLogs?: CrmProcurementAuditLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmProcurementAuditLog {
  id: string;
  entityType?: string;
  entityId?: string;
  action: string;
  actorId?: string;
  actorName?: string;
  previousState?: string;
  newState?: string;
  metadata?: string | Record<string, any>;
  createdAt?: string;
}

export interface CrmSupplierQuotation {
  id: string;
  msrfId?: string;
  quotationRef: string;
  quotationDate: string;
  supplierId: string;
  supplierName: string;
  currency?: string;
  subtotal: number;
  taxAmount: number;
  shippingDeliveryCost: number;
  installationCost: number;
  otherAssociatedCosts: number;
  landedTotalValue: number;
  deliveryLeadTimeDays: number;
  paymentTerms?: string;
  validityDate?: string;
  isRecommended: boolean;
  recommendationReason?: string;
  quoteDocumentUrl?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmPurchaseApproval {
  id: string;
  purchaseOrderId: string;
  approvalTier: 'FINANCE_CONTROLLER' | 'CHIEF_OPERATING_OFFICER' | string;
  approverId: string;
  approverName: string;
  approverDesignation?: string;
  isDelegated: boolean;
  delegationId?: string;
  delegatorName?: string;
  decision: 'Approved' | 'Rejected';
  decisionAt: string;
  evaluatedAmount: number;
  remarks?: string;
  createdAt?: string;
}

export interface CrmApproverDelegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegatorDesignation: string;
  delegateId: string;
  delegateName: string;
  delegateDesignation?: string;
  approvalTier: 'FINANCE_CONTROLLER' | 'CHIEF_OPERATING_OFFICER';
  startDate: string;
  endDate: string;
  isActive: boolean;
  reason?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CrmMatchingStatus =
  | 'Pending_Audit'
  | 'Verified_Matching'
  | 'Price_Discrepancy'
  | 'Quantity_Discrepancy'
  | 'Approved';

export interface CrmSupplierInvoiceItem {
  id?: string;
  invoiceId?: string;
  purchaseOrderItemId?: string;
  code?: string;
  description: string;
  unit: string;
  invoicedQty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  sortOrder?: number;
}

export interface CrmMatchItemVariance {
  code?: string;
  description: string;
  poQty: number;
  grnQty: number;
  invoicedQty: number;
  poUnitPrice: number;
  invoicedUnitPrice: number;
  qtyDiscrepancy: boolean;
  priceDiscrepancy: boolean;
  notes?: string;
}

export interface CrmThreeWayMatchResult {
  overallStatus: CrmMatchingStatus;
  poId: string;
  poNumber: string;
  poStatus: string;
  grnId?: string | null;
  grnNumber?: string | null;
  isPoApproved: boolean;
  hasGrn: boolean;
  itemVariances: CrmMatchItemVariance[];
  subtotalVariance: number;
  taxVariance: number;
  totalVariance: number;
  reasons: string[];
}

export interface CrmSupplierInvoice {
  id: string;
  slNo?: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  grnId?: string;
  grnNumber?: string;
  subtotal: number;
  vatAmount: number;
  discountAmount?: number;
  adjustmentAmount?: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'Due' | 'Partially_Paid' | 'Paid';
  matchingStatus: CrmMatchingStatus;
  matchDetails?: CrmThreeWayMatchResult | string;
  discrepancyReason?: string;
  resolutionAction?: 'Accept_Difference' | 'Request_Credit_Note' | 'Adjust_Invoice' | string;
  resolutionNotes?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  paymentApprovedByName?: string;
  paymentApprovedAt?: string;
  notes?: string;
  invoiceFileUrl?: string;
  items?: CrmSupplierInvoiceItem[];
  allocations?: CrmSupplierPaymentAllocation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmSupplierPaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber?: string;
  allocatedAmount: number;
  notes?: string;
  createdAt?: string;
}

export interface CrmSupplierPayment {
  id: string;
  slNo?: number;
  voucherNumber: string;
  paymentDate: string;
  supplierId: string;
  supplierName: string;
  paymentMode: 'Bank_Transfer' | 'Cheque' | 'Cash' | 'Credit_Card';
  bankName?: string;
  referenceNo?: string;
  chequeNumber?: string;
  chequeDate?: string;
  amount: number;
  allocatedAmount?: number;
  unallocatedAmount?: number;
  notes?: string;
  status: 'Pending' | 'Completed' | 'Bounced' | 'Void';
  allocations?: CrmSupplierPaymentAllocation[];
  createdAt?: string;
  updatedAt?: string;
}export interface ProcurementDashboardSummary {
  spendBySupplier: Array<{
    supplier: string;
    po_count: number;
    total_spend: number;
    net_amount: number;
    total_vat: number;
  }>;
  openCommitments: {
    openOrdersCount: number;
    totalCommittedValue: number;
  };
  payables: {
    unpaidInvoiceCount: number;
    totalOutstandingBalance: number;
    totalPaidToDate: number;
    totalInvoicedValue: number;
    statusBreakdown: Array<{
      payment_status: string;
      count: number;
      total_amount: number;
      balance_due: number;
    }>;
  };
  matchingHealth: {
    totalInvoices: number;
    discrepanciesCount: number;
    discrepancyRate: number;
    breakdown: Array<{
      matching_status: string;
      count: number;
      total_amount: number;
    }>;
  };
  sourcing: {
    statusBreakdown: Array<{
      procurement_status: string;
      count: number;
      total_value: number;
    }>;
    largeRequisitionsCount: number;
    compliantQuoteCount: number;
    sourcingComplianceRate: number;
  };
  departmentalSpend: Array<{
    department: string;
    request_count: number;
    requested_value: number;
  }>;
  operationalQueues?: {
    msrfPendingApproval: { count: number; totalValue: number; items: any[] };
    procurementIntake: { count: number; totalValue: number; items: any[] };
    stockShortages: { inventoryShortageCount: number; msrfShortageCount: number; items: any[] };
    quotationsAwaitingReview: { count: number; totalValue: number; items: any[] };
    posAwaitingApproval: { count: number; totalValue: number; items: any[] };
    posAwaitingDelivery: { count: number; totalValue: number; items: any[] };
    goodsReceiptsAwaitingProcessing: { count: number; items: any[] };
    invoicesAwaitingMatching: { count: number; totalValue: number; items: any[] };
    outstandingPayments: { count: number; totalBalanceDue: number; items: any[] };
    requestsAwaitingConfirmation: { count: number; items: any[] };
    requestsAwaitingClosure: { count: number; items: any[] };
  };
}

export interface ApAgingBucket {
  label: string;
  count: number;
  totalAmount: number;
  invoices: Array<{
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date?: string;
    supplier_id: string;
    supplier_name: string;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    payment_status: string;
    matching_status: string;
    daysOverdue: number;
    isDueDateEstimated: boolean;
  }>;
}

export interface ApAgingReport {
  asOfDate: string;
  grandTotal: number;
  totalUnpaidInvoices: number;
  buckets: {
    current: ApAgingBucket;
    days31_60: ApAgingBucket;
    days61_90: ApAgingBucket;
    days90_plus: ApAgingBucket;
  };
  supplierSummary: Array<{
    supplierId: string;
    supplierName: string;
    totalBalance: number;
    count: number;
    current: number;
    days31_60: number;
    days61_90: number;
    days90_plus: number;
  }>;
}

export interface SupplierStatementEntry {
  statementInvoiceNo: string;
  date?: string;
  amount: number;
}

export interface SupplierStatementReconciliation {
  supplierId: string;
  supplierName: string;
  statementDate: string;
  statementClosingBalance: number;
  internalLedgerBalance: number;
  netVariance: number;
  isReconciled: boolean;
  summary: {
    totalStatementEntries: number;
    matchedCount: number;
    varianceCount: number;
    missingInCrmCount: number;
    missingInStatementCount: number;
    duplicateCount?: number;
    paymentCount?: number;
  };
  matchedEntries: Array<{
    statementInvoiceNo: string;
    date: string;
    statementAmount: number;
    crmAmount: number;
    amountPaid?: number;
    balanceDue: number;
    status: 'MATCHED';
    notes?: string;
  }>;
  varianceEntries: Array<{
    statementInvoiceNo: string;
    date: string;
    statementAmount: number;
    crmAmount: number;
    amountPaid?: number;
    balanceDue?: number;
    variance: number;
    status: 'PRICE_VARIANCE';
    notes: string;
  }>;
  missingInCrmEntries: Array<{
    statementInvoiceNo: string;
    date?: string;
    statementAmount: number;
    status: 'MISSING_IN_CRM';
    notes: string;
  }>;
  missingInStatementEntries: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    balanceDue: number;
    totalAmount: number;
    amountPaid?: number;
    status: 'MISSING_IN_STATEMENT';
    notes: string;
  }>;
  duplicateEntries?: Array<{
    statementInvoiceNo: string;
    date?: string;
    statementAmount: number;
    status: 'DUPLICATE_ON_STATEMENT';
    notes: string;
  }>;
  paymentEntries?: Array<{
    statementRef: string;
    date?: string;
    statementAmount: number;
    crmPaymentVoucher?: string;
    crmAmount?: number;
    status: 'PAYMENT_MATCHED' | 'PAYMENT_MISSING_IN_CRM';
    notes: string;
  }>;
}

export interface LegacyValidationRecord {
  index: number;
  type: string;
  poNumber: string;
  supplier: string;
  amount: number;
  date: string;
  deliveryMode: string;
  status: 'VALID' | 'DUPLICATE' | 'AMBIGUOUS';
  issues: string[];
  raw: any;
}

export interface LegacyValidationSummary {
  totalRecords: number;
  validCount: number;
  duplicateCount: number;
  ambiguousCount: number;
  canImport: boolean;
}

export interface LegacyMigrationReport {
  id: string;
  batchId: string;
  importedCount: number;
  skippedCount: number;
  executedBy: string;
  createdAt: string;
  details?: any;
}

