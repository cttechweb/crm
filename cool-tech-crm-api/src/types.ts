/**
 * Type definitions for cool-tech-crm-api Cloudflare Worker
 * 
 * Aligned strictly with cool-tech-crm-db users schema:
 * id, firebase_uid, email, full_name, role, position, department, team_id, reports_to, is_active
 */

export type CrmRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface CrmUserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  role: CrmRole;
  is_active: number | boolean;
  position?: string;
  department?: string;
  team_id?: string;
  reports_to?: string;
  phone?: string;
  username?: string;
  avatar_image?: string;
  dob?: string;
  designation?: string;
  business_opportunity?: string;
  store?: string;
  sales_visit_permission?: number | boolean;
  permissions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Env {
  DB: D1Database;
  FIREBASE_PROJECT_ID?: string;
  ALLOWED_ORIGIN?: string;
  ECOMMERCE_SERVICE?: Fetcher;
  ECOMMERCE_API_URL?: string;
}

export interface CrmProductItem {
  id: string;
  code: string;
  sku: string;
  name: string;
  slug?: string;
  category: string;
  categoryId?: string;
  brand: string;
  sellingPrice: number;
  purchaseRate?: number;
  basePrice: number;
  thumbnailImage: string;
  images: string[];
  inStock: boolean;
  currentStock: number;
  minOrderQty: number;
  rating: number;
  status: boolean;
  additionalDescription: string;
  modelId?: string;
  serialNo?: string;
  badge?: string;
  isFeatured?: boolean;
  specifications?: Record<string, unknown>;
  features?: string[];
  tags?: string[];
  documents?: unknown[];
  unit?: string;
  type?: string;
}

export interface AppVariables {
  user: CrmUserProfile;
  firebaseUid: string;
}

export type CustomerStatus = 'Active' | 'Inactive' | 'Prospect';
export type CustomerType = 'Customer' | 'Prospect';

export interface CustomerRow {
  id: string;
  sl_no: number;
  customer_name: string;
  company_name: string | null;
  trn: string | null;
  company_group: string | null;
  industry_type: string | null;
  category: string | null;
  parent_customer_id: string | null;
  parent_customer_name: string | null;
  contact_person: string;
  salutation: string | null;
  email: string | null;
  phone: string;
  mobile: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  location: string | null;
  status: CustomerStatus;
  type: CustomerType;
  key_customer: number;
  is_supplier: number;
  no_of_employees: string | null;
  source: string | null;
  source_name: string | null;
  campaign: string | null;
  tags: string | null;
  comments: string | null;
  contract_status: string | null;
  last_visit_date: string | null;
  assigned_equipment_count: number;
  active_jobs_count: number;
  sla_level: string | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_avatar: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  created_from_lead_id: string | null;
  assigned_date: string | null;
  date: string | null;
  total_spend: number;
  outstanding: number;
  total_deals: number;
  open_enquiries: number;
  last_enquiry: string | null;
  last_order: string | null;
  last_activity: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerContactRow {
  id: string;
  customer_id: string;
  salutation: string | null;
  name: string;
  designation: string | null;
  email: string | null;
  business_mobile: string | null;
  personal_mobile: string | null;
  spoken_language: string | null;
  nationality: string | null;
  is_primary: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export type LeadRatingType = 'Hot' | 'Warm' | 'Cold' | string;
export type LeadStatusType =
  | 'New'
  | 'Pending'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Converted'
  | 'Won'
  | 'Lost'
  | 'Disqualified'
  | string;

export interface LeadRow {
  id: string;
  sl_no: number;
  lead_date: string;
  assigned_date: string | null;
  lead_specification: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  contact_company: string;
  contact_whatsapp: string | null;
  contact_salutation: string | null;
  contact_designation: string | null;
  contact_personal_mobile: string | null;
  contact_nationality: string | null;
  contact_telephone: string | null;
  contact_website: string | null;
  rating: LeadRatingType;
  status: LeadStatusType;
  value: number;
  source: string | null;
  source_name: string | null;
  campaign: string | null;
  business_opportunity: string | null;
  location: string | null;
  tags: string | null;
  comments: string | null;
  last_activity: string | null;
  last_activity_date: string | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_avatar: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  assigned_employee: string | null;
  assigned_manager: string | null;
  department: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNoteRow {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

export interface LeadActivityLogRow {
  id: string;
  lead_id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  note: string | null;
  old_status: string | null;
  new_status: string | null;
  old_rating: string | null;
  new_rating: string | null;
  created_at: string;
}

export interface OpportunityRow {
  id: string;
  sl_no: number | null;
  opportunity_code: string | null;
  created_from_lead_id: string | null;
  title: string;
  customer: string;
  contact_person: string | null;
  phone: string | null;
  whatsapp: string | null;
  amount: number;
  stage: string;
  probability: number;
  expected_close: string | null;
  owner: string | null;
  owner_id: string | null;
  campaign: string | null;
  source: string | null;
  vat_type: string | null;
  vat_rate: number | null;
  adjustment: number | null;
  lpo_number: string | null;
  lpo_date: string | null;
  location: string | null;
  reference: string | null;
  comments: string | null;
  tags: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationRow {
  id: string;
  sl_no: number | null;
  quotation_number: string;
  customer: string;
  customer_id: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  opportunity_id: string | null;
  opportunity_code: string | null;
  subject: string;
  quote_date: string;
  valid_until: string | null;
  subtotal: number;
  discount_total: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  status: string;
  owner: string | null;
  owner_id: string | null;
  assigned_to: string | null;
  payment_terms: string | null;
  delivery_terms: string | null;
  customer_notes: string | null;
  converted_order_id: string | null;
  sales_order_number: string | null;
  converted_at: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItemRow {
  id: string;
  quotation_id: string;
  product_id: string | null;
  item_code: string | null;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  discount: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  sort_order: number;
}

export interface SalesOrderRow {
  id: string;
  sl_no: number | null;
  order_number: string;
  quotation_ref: string | null;
  quotation_id: string | null;
  opportunity_ref: string | null;
  customer: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  billing_address: string | null;
  shipping_address: string | null;
  order_date: string;
  delivery_due_date: string | null;
  po_reference: string | null;
  amount: number;
  vat_amount: number;
  total_amount: number;
  profit: number;
  receivable: number;
  status: string;
  owner: string | null;
  owner_id: string | null;
  assigned_to: string | null;
  subject: string | null;
  notes: string | null;
  payment_terms: string | null;
  delivery_terms: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  item_code: string | null;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  discount: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  sort_order: number;
}

export interface InvoiceRow {
  id: string;
  sl_no: number | null;
  invoice_number: string;
  order_ref: string | null;
  order_id: string | null;
  opportunity_order_ref: string | null;
  customer: string;
  contact_person: string | null;
  phone: string | null;
  attention: string | null;
  location: string | null;
  trn_number: string | null;
  lpo_number: string | null;
  lpo_date: string | null;
  reference_number: string | null;
  description: string | null;
  issue_date: string;
  due_date: string | null;
  amount: number;
  subtotal: number;
  discount: number;
  adjustment: number;
  vat_type: string | null;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
  terms_conditions: string | null;
  owner: string | null;
  owner_id: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItemRow {
  id: string;
  invoice_id: string;
  code: string | null;
  description: string;
  brand: string | null;
  unit: string | null;
  qty: number;
  price: number;
  total: number;
  sort_order: number;
}

export interface TaskRow {
  id: string;
  sl_no: number | null;
  title: string | null;
  task_details: string;
  description: string | null;
  department: string | null;
  location: string | null;
  site_location: string | null;
  equipment_tag: string | null;
  permit_required: number;
  sla_deadline: string | null;
  worker_contact: string | null;
  customer_id: string | null;
  customer_name: string | null;
  task_under: string | null;
  task_type: string;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  status: string;
  progress: number;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  assignee_role: string | null;
  assignee_avatar: string | null;
  assigned_by_id: string | null;
  assigned_by_name: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  updated_by_id: string | null;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  service_type: string | null;
  estimated_hours: number | null;
  actual_hours_spent: number | null;
  technician_notes: string | null;
  customer_signature: string | null;
  customer_signed_by: string | null;
  signed_at: string | null;
  completion_rating: number | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskChecklistRow {
  id: string;
  task_id: string;
  label: string;
  is_completed: number;
  is_required: number;
  sort_order: number;
  created_at: string;
}

export interface TaskPartUsedRow {
  id: string;
  task_id: string;
  part_code: string;
  part_name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
}

export interface TaskActivityLogRow {
  id: string;
  task_id: string;
  user_id: string | null;
  user_name: string;
  user_role: string | null;
  action: string;
  note: string | null;
  progress: number | null;
  created_at: string;
}

export interface TaskCommentRow {
  id: string;
  task_id: string;
  author_id: string | null;
  author_name: string;
  author_role: string | null;
  author_avatar: string | null;
  comment_text: string;
  created_at: string;
}

export interface WorkerAttendanceRow {
  id: string;
  worker_id: string;
  worker_name: string;
  date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  active_duration_seconds: number;
  break_duration_minutes: number;
  current_location: string | null;
  is_clocked_in: number;
  created_at: string;
  updated_at: string;
}

export interface WorkerTimesheetRow {
  id: string;
  worker_id: string;
  worker_name: string;
  task_id: string | null;
  task_number: string | null;
  task_title: string | null;
  client_name: string | null;
  date: string;
  regular_hours: number;
  overtime_hours: number;
  work_summary: string | null;
  status: string;
  approved_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialRequestRow {
  id: string;
  request_number: string;
  worker_id: string | null;
  worker_name: string;
  task_id: string | null;
  task_number: string | null;
  item_code: string;
  item_name: string;
  category: string | null;
  quantity: number;
  unit: string;
  urgency: string;
  status: string;
  notes: string | null;
  approved_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProformaInvoiceRow {
  id: string;
  sl_no: number | null;
  pi_number: string;
  quotation_ref: string | null;
  quotation_id: string | null;
  opportunity_id: string | null;
  opportunity_title: string | null;
  customer: string;
  customer_id: string | null;
  issue_date: string;
  payment_terms: string | null;
  amount: number;
  vat_type: string | null;
  vat_rate: number | null;
  vat_amount: number;
  total_amount: number;
  discount: number;
  adjustment: number;
  status: string;
  prepared_by: string | null;
  prepared_by_mobile: string | null;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  phone: string | null;
  location: string | null;
  attention: string | null;
  trn_number: string | null;
  lpo_number: string | null;
  lpo_date: string | null;
  remarks: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProformaInvoiceItemRow {
  id: string;
  proforma_id: string;
  code: string | null;
  description: string;
  brand: string | null;
  unit: string | null;
  qty: number;
  price: number;
  total: number;
  sort_order: number;
}

export interface ReceiptRow {
  id: string;
  sl_no: number | null;
  receipt_number: string;
  invoice_ref: string | null;
  invoice_id: string | null;
  customer: string;
  customer_id: string | null;
  contact_person: string | null;
  phone: string | null;
  created_by: string | null;
  created_by_id: string | null;
  created_by_avatar: string | null;
  receipt_type: string | null;
  tags: string | null;
  payment_method: string;
  receipt_date: string;
  amount: number;
  reference_number: string | null;
  status: string;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNoteRow {
  id: string;
  sl_no: number | null;
  delivery_note_number: string;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  order_ref: string | null;
  order_id: string | null;
  order_description: string | null;
  customer: string;
  customer_id: string | null;
  invoice_ref: string | null;
  invoice_id: string | null;
  dn_type: string | null;
  location: string | null;
  received_by: string | null;
  received_phone: string | null;
  cost_updated: number;
  site_location: string | null;
  driver_name: string | null;
  vehicle_number: string | null;
  dispatch_date: string;
  items_count: number;
  status: string;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNoteItemRow {
  id: string;
  delivery_note_id: string;
  item_code: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  sort_order: number;
}

export interface SupplierRow {
  id: string;
  sl_no: number | null;
  supplier_name: string;
  company_name: string | null;
  trn: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  payment_terms: string | null;
  status: string;
  customer_id: string | null;
  owner: string | null;
  owner_id: string | null;
  created_by: string | null;
  created_by_id: string | null;
  remarks: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreRow {
  id: string;
  sl_no: number | null;
  name: string;
  code: string | null;
  location: string | null;
  address: string | null;
  manager_name: string | null;
  manager_id: string | null;
  phone: string | null;
  is_active: number;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmInventoryRow {
  id: string;
  sl_no: number | null;
  code: string;
  name: string;
  image: string | null;
  unit: string | null;
  brand: string | null;
  category: string | null;
  type: string | null;
  purchase_rate: number;
  selling_price: number;
  min_stock: string | null;
  stock: number;
  current_stock: number;
  minimum_stock: number;
  store: string | null;
  store_id: string | null;
  supplier: string | null;
  supplier_id: string | null;
  status: string | null;
  serial_no: string | null;
  owner: string | null;
  owner_id: string | null;
  created_by: string | null;
  created_by_id: string | null;
  created_by_role: string | null;
  created_by_email: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderRow {
  id: string;
  sl_no: number | null;
  po_number: string;
  date: string;
  expected_delivery_date: string | null;
  supplier: string;
  supplier_id: string | null;
  order_ref: string | null;
  reference: string | null;
  description: string | null;
  opportunity_order: string | null;
  project_number: string | null;
  project_name: string | null;
  vat_type: string | null;
  vat_rate: number | null;
  attention: string | null;
  prepared_by: string | null;
  prepared_by_mobile: string | null;
  prepared_by_email: string | null;
  prepared_by_designation: string | null;
  terms_condition: string | null;
  terms_condition_text: string | null;
  amount: number;
  vat: number;
  discount: number;
  adjustment: number;
  total_amount: number;
  invoice_received: string | null;
  approval: string;
  delivery_status: string;
  payment_status: string;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItemRow {
  id: string;
  purchase_order_id: string;
  code: string | null;
  description: string;
  unit: string | null;
  brand: string | null;
  qty: number;
  delivery_pending: number;
  amount: number;
  total: number;
  sort_order: number;
}

export interface StockInRecordRow {
  id: string;
  sl_no: number | null;
  stock_in_no: string;
  date: string;
  supplier: string;
  supplier_id?: string | null;
  purchase_invoice_number?: string | null;
  delivery_note?: string | null;
  do_file_name?: string | null;
  lpo_number?: string | null;
  order_name?: string | null;
  purchase_order_id?: string | null;
  store: string | null;
  store_id?: string | null;
  total_items?: number | null;
  total_amount?: number;
  status?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_by_id?: string | null;
  created_formatted?: string | null;
  is_deleted: number;
  deleted_at?: string | null;
  deleted_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockInItemRow {
  id: string;
  voucher_id?: string;
  stock_in_id?: string;
  sl_no: number | null;
  code: string | null;
  item?: string;
  item_name?: string;
  unit: string | null;
  brand: string | null;
  purchase_rate: number;
  selling_price: number;
  qty: number;
  current_stock: number;
  sort_order?: number;
}

export interface StockTransferRow {
  id: string;
  sl_no: number | null;
  transfer_no: string;
  date: string;
  owner: string | null;
  owner_id: string | null;
  owner_avatar: string | null;
  transfer_from: string;
  transfer_from_id: string | null;
  transfer_to: string;
  transfer_to_id: string | null;
  status: string;
  notes: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockTransferItemRow {
  id: string;
  stock_transfer_id: string;
  code: string | null;
  item_name: string;
  unit: string | null;
  qty: number;
  sort_order: number;
}

export interface CompanySettingsRow {
  id: string;
  company_name: string;
  legal_entity: string;
  trn: string | null;
  operating_region: string | null;
  primary_email: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  vat_rate: number;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingRow {
  key: string;
  value: string;
  category: string;
  updated_by: string | null;
  updated_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadSourceRow {
  id: string;
  name: string;
  is_active: number;
  sort_order: number;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TargetIndustryRow {
  id: string;
  name: string;
  is_active: number;
  sort_order: number;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTargetRow {
  id: string;
  user_id: string | null;
  user_name: string;
  role: string | null;
  period: string | null;
  year: number;
  month: number | null;
  quarter: number | null;
  deals: number;
  target_rev: number;
  closed_rev: number;
  notes: string | null;
  created_by: string | null;
  created_by_id: string | null;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyTargetRow {
  id: string;
  month: string;
  sale_target: number;
  profit_target: number | null;
  invoice_target: number | null;
  collection_target: number | null;
  year: number | null;
  created_by: string | null;
  created_by_id: string | null;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityStageRow {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  text_color: string | null;
  probability: number;
  stage_order: number;
  is_system: number;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityLostReasonRow {
  id: string;
  reason: string;
  description: string | null;
  is_active: number;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
