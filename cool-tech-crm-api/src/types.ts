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

