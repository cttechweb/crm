'use client';

import React, { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  User,
  Users,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Building,
  Edit2,
  Trash2,
  UserCheck,
  Search,
  Plus,
  FileText,
  ShoppingCart,
  Receipt,
  FileCheck,
  History,
  TrendingUp,
  Award,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Calculator,
  ThumbsUp,
  Snowflake,
  Folder,
  Settings,
  List,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CrmCustomer } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    customers,
    updateCustomer,
    deleteCustomer,
    salesOpportunities,
    users,
  } = useEnterpriseCrm();

  const [activeSubTab, setActiveSubTab] = useState<string>('customer');
  const [activeActivityTab, setActiveActivityTab] = useState<'notes' | 'task' | 'files' | 'sales_visit'>('notes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUser, setAssignUser] = useState('Nafal');

  // Find customer by ID or slNo or name
  const customer = useMemo(() => {
    const rawId = decodeURIComponent(resolvedParams.id);
    return (
      customers.find(
        (c) =>
          c.id === rawId ||
          String(c.slNo) === rawId ||
          c.customerName.toLowerCase() === rawId.toLowerCase()
      ) ||
      customers[0] || {
        id: 'cust-fallback',
        slNo: 1,
        customerName: 'SOBHA UAQP CONSTRUCTIONS L.L.C',
        companyName: 'SOBHA UAQP CONSTRUCTIONS L.L.C',
        contactPerson: 'Mr. Puspak',
        phone: '+97150 281 0547',
        email: 'info@sobha.ae',
        owner: 'MUHAMMED AHSAN P V',
        status: 'Active' as const,
        type: 'Prospect' as const,
        createdDate: 'THU 01-10-2026 3:33:18 PM',
        industryType: 'Construction & Contracting',
        address: 'United Arab Emirates',
        lastOrder: 'No order till the date.',
        openEnquiries: 1,
        lastEnquiry: '1 day(s) ago',
        outstanding: 0,
        totalSpend: 0,
        lastActivity: 'Today',
        companyGroup: 'Enterprise',
        totalDeals: 1,
      }
    );
  }, [customers, resolvedParams.id]);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    customerName: customer?.customerName || '',
    contactPerson: customer?.contactPerson || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    owner: customer?.owner || 'Nafal',
    type: customer?.type || 'Prospect',
    address: customer?.address || 'United Arab Emirates',
    industryType: customer?.industryType || '',
    parentCustomer: customer?.parentCustomer || '',
    tags: Array.isArray(customer?.tags) ? customer.tags.join(', ') : (customer?.tags || ''),
    keyCustomer: customer?.keyCustomer || 'No',
    source: customer?.source || 'Email Marketing',
    sourceName: customer?.sourceName || '',
    campaign: customer?.campaign || 'INBOUND E-MAIL - 2025',
    employees: customer?.employees || '',
    website: customer?.website || '',
    country: customer?.country || 'United Arab Emirates',
    city: customer?.city || '',
    location: customer?.location || '',
    trn: customer?.trn || '',
    comments: customer?.comments || '',
    isSupplier: customer?.isSupplier || false,
  });

  // Keep edit form in sync when customer changes
  React.useEffect(() => {
    if (customer) {
      setEditFormData({
        customerName: customer.customerName || '',
        contactPerson: customer.contactPerson || '',
        phone: customer.phone || '',
        email: customer.email || '',
        owner: customer.owner || 'Nafal',
        type: customer.type || 'Prospect',
        address: customer.address || 'United Arab Emirates',
        industryType: customer.industryType || '',
        parentCustomer: customer.parentCustomer || '',
        tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : (customer.tags || ''),
        keyCustomer: customer.keyCustomer || 'No',
        source: customer.source || 'Email Marketing',
        sourceName: customer.sourceName || '',
        campaign: customer.campaign || 'INBOUND E-MAIL - 2025',
        employees: customer.employees || '',
        website: customer.website || '',
        country: customer.country || 'United Arab Emirates',
        city: customer.city || '',
        location: customer.location || '',
        trn: customer.trn || '',
        comments: customer.comments || '',
        isSupplier: customer.isSupplier || false,
      });
      setAssignUser(customer.owner || 'Nafal');
    }
  }, [customer]);

  // Customer opportunities
  const customerOpportunities = useMemo(() => {
    if (!customer) return [];
    return salesOpportunities.filter(
      (opp) =>
        opp.customer.toLowerCase().includes(customer.customerName.toLowerCase()) ||
        customer.customerName.toLowerCase().includes(opp.customer.toLowerCase())
    );
  }, [salesOpportunities, customer]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    updateCustomer(customer.id, {
      customerName: editFormData.customerName.toUpperCase(),
      contactPerson: editFormData.contactPerson,
      phone: editFormData.phone,
      email: editFormData.email,
      owner: editFormData.owner,
      type: editFormData.type as any,
      address: editFormData.address,
      industryType: editFormData.industryType,
      parentCustomer: editFormData.parentCustomer,
      tags: editFormData.tags ? editFormData.tags.split(',').map((t) => t.trim()) : [],
      keyCustomer: editFormData.keyCustomer,
      source: editFormData.source,
      sourceName: editFormData.sourceName,
      campaign: editFormData.campaign,
      employees: editFormData.employees,
      website: editFormData.website,
      country: editFormData.country,
      city: editFormData.city,
      location: editFormData.location,
      trn: editFormData.trn,
      comments: editFormData.comments,
      isSupplier: editFormData.isSupplier,
    });
    setIsEditModalOpen(false);
  };

  const handleAssign = () => {
    if (!customer) return;
    updateCustomer(customer.id, {
      owner: assignUser,
    });
    setIsAssignModalOpen(false);
  };

  const handleDelete = () => {
    if (!customer) return;
    if (confirm(`Are you sure you want to delete customer "${customer.customerName}"?`)) {
      deleteCustomer(customer.id);
      router.push('/customers');
    }
  };

  // Sub-tabs list matching Image 1
  const subTabs = [
    { id: 'customer', label: 'Customer', icon: Shield },
    { id: 'contacts', label: 'Contact Details', icon: User },
    { id: 'opportunity', label: 'Opportunity', icon: Search },
    { id: 'quotation', label: 'Quotation', icon: FileText },
    { id: 'order', label: 'Order', icon: ShoppingCart },
    { id: 'proforma', label: 'Proforma Invoice', icon: FileText },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'receipt', label: 'Receipt', icon: Receipt },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'statement', label: 'Statement', icon: FileCheck },
    { id: 'history', label: 'Owner Change History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 -mx-2.5 sm:-mx-6 lg:-mx-8 -my-3 sm:-my-4">
      {isEditModalOpen ? (
        /* ── CEZCON CRM FULL EDIT CUSTOMER SCREEN (EXACT IMAGE 1) ── */
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800 m-4">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Edit Customer</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleUpdate} className="p-6 text-xs text-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* ── ROW 1 ── */}
              {/* Left: Customer Owner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Customer Owner</label>
                <div className="flex-1">
                  <select
                    value={editFormData.owner}
                    onChange={(e) => setEditFormData({ ...editFormData, owner: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                    <option value="JISMON JOSE">JISMON JOSE</option>
                    <option value="MUHAMMED AHSAN P V">MUHAMMED AHSAN P V</option>
                    <option value="Muhammed Adhil">Muhammed Adhil</option>
                    <option value="shameem">shameem</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Right: Customer Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                  Customer Name <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    value={editFormData.customerName}
                    onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* ── ROW 2 ── */}
              {/* Left: Parent Customer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Parent Customer</label>
                <div className="flex-1">
                  <select
                    value={editFormData.parentCustomer}
                    onChange={(e) => setEditFormData({ ...editFormData, parentCustomer: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Parent Customer</option>
                    {customers
                      .filter((c) => c.id !== customer.id)
                      .map((c) => (
                        <option key={c.id} value={c.customerName}>
                          {c.customerName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Right: Customer Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Customer Tags</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Keywords attached to the customer"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 3 ── */}
              {/* Left: Key Customer? */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Key Customer?</label>
                <div className="flex-1 flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="keyCustomer"
                      value="Yes"
                      checked={editFormData.keyCustomer === 'Yes' || editFormData.keyCustomer === true}
                      onChange={() => setEditFormData({ ...editFormData, keyCustomer: 'Yes' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="keyCustomer"
                      value="No"
                      checked={editFormData.keyCustomer !== 'Yes' && editFormData.keyCustomer !== true}
                      onChange={() => setEditFormData({ ...editFormData, keyCustomer: 'No' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Right: Industry Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Industry Type</label>
                <div className="flex-1">
                  <select
                    value={editFormData.industryType}
                    onChange={(e) => setEditFormData({ ...editFormData, industryType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="General Contracting">General Contracting</option>
                    <option value="Landscape & Horticulture">Landscape & Horticulture</option>
                    <option value="Construction & Civil">Construction & Civil</option>
                    <option value="Fitout & Interior Design">Fitout & Interior Design</option>
                    <option value="Chemical & Manufacturing">Chemical & Manufacturing</option>
                    <option value="Commercial Engineering">Commercial Engineering</option>
                    <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                  </select>
                </div>
              </div>

              {/* ── ROW 4 ── */}
              {/* Left: Source */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                  Source <HelpCircle className="w-3.5 h-3.5 text-slate-700 inline" />
                </label>
                <div className="flex-1 relative">
                  <select
                    value={editFormData.source}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="Direct Inquiry">Direct Inquiry</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>
              </div>

              {/* Right: Source Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Source Name</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Name of the source. Eg Google, LinkedIn"
                    value={editFormData.sourceName}
                    onChange={(e) => setEditFormData({ ...editFormData, sourceName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 5 ── */}
              {/* Left: Campaign */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1">
                  Campaign <HelpCircle className="w-3.5 h-3.5 text-slate-700 inline" />
                </label>
                <div className="flex-1">
                  <select
                    value={editFormData.campaign}
                    onChange={(e) => setEditFormData({ ...editFormData, campaign: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="INBOUND E-MAIL - 2025">INBOUND E-MAIL - 2025</option>
                    <option value="HVAC Commercial 2026">HVAC Commercial 2026</option>
                    <option value="Google Ads Search">Google Ads Search</option>
                    <option value="Email Outreach">Email Outreach</option>
                  </select>
                </div>
              </div>

              {/* Right: No. of Employees */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">No.of Employees</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={editFormData.employees}
                    onChange={(e) => setEditFormData({ ...editFormData, employees: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 6 ── */}
              {/* Left: Tel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tel</span>
                </label>
                <div className="flex-1 flex items-center gap-2">
                  <span className="bg-slate-100 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 font-medium shrink-0">
                    🇦🇪 +971 ▾
                  </span>
                  <input
                    type="text"
                    placeholder="Landline"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: Website */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Website</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="https://www.example.com"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 7 ── */}
              {/* Left: Email */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>Email</span>
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Add multiple emails by pressing Tab button."
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: Address */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0 flex items-center gap-1.5 pt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Address</span>
                </label>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder="Office No, PO Box, Street, City etc..."
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* ── ROW 8 ── */}
              {/* Left: Country */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Country</label>
                <div className="flex-1">
                  <select
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Oman">Oman</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              {/* Right: State/Region */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">State/Region</label>
                <div className="flex-1">
                  <select
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                  </select>
                </div>
              </div>

              {/* ── ROW 9 ── */}
              {/* Left: Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Contact</label>
                <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2 py-1">
                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, contactPerson: '' })}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✖
                    </button>
                    <span>{editFormData.contactPerson || 'NIKHIL'}</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Type contact..."
                    value=""
                    onChange={() => {}}
                    className="flex-1 bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Right: Primary Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Primary Contact</label>
                <div className="flex-1">
                  <select
                    value={editFormData.contactPerson || 'NIKHIL'}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value={editFormData.contactPerson || 'NIKHIL'}>{editFormData.contactPerson || 'NIKHIL'}</option>
                    <option value="Mr. Puspak">Mr. Puspak</option>
                    <option value="Mr. Farhan">Mr. Farhan</option>
                    <option value="Bishoy George">Bishoy George</option>
                  </select>
                </div>
              </div>

              {/* ── ROW 10 ── */}
              {/* Left: Location */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Location</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search location"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right: TRN */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">TRN</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Tax Registration Number"
                    value={editFormData.trn}
                    onChange={(e) => setEditFormData({ ...editFormData, trn: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 11 ── */}
              {/* Left: Logo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Logo</label>
                <div className="flex-1 flex items-center gap-2">
                  <input type="file" className="text-xs text-slate-600" />
                </div>
              </div>

              {/* Right: Comments */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Comments</label>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Additional comments"
                    value={editFormData.comments}
                    onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ── ROW 12 ── */}
              {/* Left: Is Supplier? */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">Is Supplier?</label>
                <div className="flex-1">
                  <input
                    type="checkbox"
                    checked={Boolean(editFormData.isSupplier)}
                    onChange={(e) => setEditFormData({ ...editFormData, isSupplier: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit Footer */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* ── 1. AUDIT / STATUS BANNER BAR ── */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>
                CUSTOMER CREATED BY {(customer.owner || 'MUHAMMED AHSAN P V').toUpperCase()} ON{' '}
                {customer.createdDate || 'THU 01-10-2026 3:33:18 PM'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/customers')}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Close / Back to Customers"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

      {/* ── 2. SUB-TABS NAVIGATION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center overflow-x-auto shadow-xs z-10 scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs transition-all cursor-pointer whitespace-nowrap border-b-2',
                  isActive
                    ? 'border-slate-800 text-slate-900 font-bold bg-slate-100/60'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-slate-800' : 'text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. MAIN PAGE CANVAS ── */}
      <div className="flex-1 p-3 sm:p-5 w-full max-w-7xl mx-auto space-y-4">
        {/* BIG CENTERED CUSTOMER TITLE */}
        <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide text-center py-2 sm:py-3 uppercase">
          {customer.customerName}
        </h1>

        {/* ── TAB CONTENT: CUSTOMER DETAILS & OVERVIEW (MATCHING IMAGE 1) ── */}
        {activeSubTab === 'customer' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* ── LEFT COLUMN: DETAILS & CREDIT LIMIT (5 cols) ── */}
              <div className="lg:col-span-5 space-y-4">
                {/* DETAILS CARD */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                  <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 font-bold text-slate-700 text-xs tracking-tight">
                    Details
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {/* Owner */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>🧑</span> Owner
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-[9px] font-bold shadow-2xs overflow-hidden shrink-0">
                          {customer.ownerAvatar ? (
                            <img src={customer.ownerAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (customer.owner || 'NA').substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-slate-800 text-[11px] uppercase">
                          {customer.owner || 'MUHAMMED AHSAN P V'}
                        </span>
                      </div>
                    </div>

                    {/* Relationship */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>🤝</span> Relationship
                      </span>
                      <span className="bg-[#38BDF8] text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                        {customer.type || 'Prospect'}
                      </span>
                    </div>

                    {/* Source */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>🔗</span> Source
                      </span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {customer.source || 'Email Marketing'}
                      </span>
                    </div>

                    {/* Campaign */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>📢</span> Campaign
                      </span>
                      <span className="font-semibold text-blue-600 text-[11px]">
                        {customer.campaign || 'INBOUND E-MAIL - 2025'}
                      </span>
                    </div>

                    {/* No.of Employees */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>👥</span> No.of Employees
                      </span>
                      <span className="text-slate-700 font-semibold">—</span>
                    </div>

                    {/* Contacts */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>🗂</span> Contacts
                      </span>
                      <span className="font-bold text-blue-600 text-xs">1</span>
                    </div>

                    {/* Primary Contact */}
                    <div className="px-4 py-2 flex items-start justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0 pt-0.5">
                        <span>🏷</span> Primary Contact
                      </span>
                      <div className="text-right space-y-0.5">
                        <div className="font-semibold text-blue-600 text-xs flex items-center justify-end gap-1">
                          <span>{customer.contactPerson || 'Mr. Puspak'}</span>
                          <HelpCircle className="w-3 h-3 text-blue-400" />
                        </div>
                        {customer.phone && (
                          <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <MessageCircle className="w-3 h-3 text-white bg-emerald-500 rounded-full p-0.5" />
                            <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                              {customer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>📍</span> Address
                      </span>
                      <span className="font-semibold text-slate-800 text-right text-[11px]">
                        {customer.address || 'United Arab Emirates'}
                      </span>
                    </div>

                    {/* Last Order */}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-slate-600 font-medium flex items-center gap-1.5 shrink-0">
                        <span>🔥</span> Last Order
                      </span>
                      <span className="bg-[#38BDF8] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs whitespace-nowrap">
                        {customer.lastOrder || 'No order till the date.'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions Toolbar */}
                  <div className="p-2.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAssignModalOpen(true)}
                      className="bg-[#0B2A4A] hover:bg-[#071D33] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Customer Assign</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* CREDIT LIMIT CARD */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
                  <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 font-bold text-slate-700 text-xs tracking-tight">
                    Credit Limit
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Credit Days</span>
                      <span className="font-semibold text-slate-800">0</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Credit Limit</span>
                      <span className="font-semibold text-slate-800">0.00</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: OVERVIEW CARD WITH 14 METRIC BOXES (7 cols) ── */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2 font-bold text-slate-700 text-xs tracking-tight">
                  Overview
                </div>

                <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Row 1 */}
                  {/* 1. Total Enquiries */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Total Enquiries</span>
                      <span className="text-sm font-bold text-slate-900">
                        {customer.openEnquiries || customerOpportunities.length || 1}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <List className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 2. Open Enquiries */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Open Enquiries</span>
                      <span className="text-sm font-bold text-slate-900">{customer.openEnquiries ?? 1}</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 3. Last Enquiry */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Last Enquiry</span>
                      <span className="text-[11px] font-bold text-slate-900">{customer.lastEnquiry || '1 day(s) ago'}</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Row 2 */}
                  {/* 4. Total Order */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Total Order</span>
                      <span className="text-sm font-bold text-slate-900">0</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 5. Conversion Ratio */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Conversion Ratio</span>
                      <span className="text-[11px] font-bold text-slate-900">0.00%</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 6. Lost Opportunity */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Lost Opportunity</span>
                      <span className="text-sm font-bold text-slate-900">0</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Row 3 */}
                  {/* 7. Sale Amount */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Sale Amount</span>
                      <span className="text-[11px] font-bold text-slate-900">0.00</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 8. VAT */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">VAT</span>
                      <span className="text-[11px] font-bold text-slate-900">0.00</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                      <Calculator className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 9. Total */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Total</span>
                      <span className="text-[11px] font-bold text-slate-900">0.00</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Row 4 */}
                  {/* 10. Invoiced */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Invoiced</span>
                      <span className="text-[11px] font-bold text-slate-900">0.00</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 11. Total Collections */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Total Collections</span>
                      <div className="text-[10px] space-y-0.5">
                        <span className="font-bold text-slate-900 block">0.00</span>
                        <span className="text-red-500 font-semibold block">VAT 0.00</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 12. Receivable */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Receivable</span>
                      <div className="text-[10px] space-y-0.2">
                        <span className="font-bold text-red-600 block">0.00</span>
                        <span className="text-emerald-600 block">Billed 0.00</span>
                        <span className="text-blue-600 block">Unbilled 0.00</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                      <Snowflake className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Row 5 */}
                  {/* 13. Sale Expense */}
                  <div className="border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Sale Expense</span>
                      <span className="text-[11px] font-bold text-slate-900">0.00</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 14. Profit / Loss (spans 2 cols) */}
                  <div className="sm:col-span-2 border border-slate-200 rounded-sm p-2.5 flex items-center justify-between bg-white shadow-2xs min-h-[64px]">
                    <div>
                      <span className="text-[11px] font-medium text-slate-600 block">Profit / Loss</span>
                      <div className="flex items-center gap-3 text-[10px] mt-0.5">
                        <span className="text-slate-600">Payment Received ⓘ <strong className="text-emerald-600">0.00</strong></span>
                        <span className="text-slate-600">Order ⓘ <strong className="text-emerald-600">0.00</strong></span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM CARD: CUSTOMER ACTIVITIES (MATCHING IMAGE 1) ── */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Customer Activities</span>
                </div>
              </div>

              {/* Activities Inner Subtabs */}
              <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveActivityTab('notes')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                      activeActivityTab === 'notes'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <FileText className="w-3 h-3" /> Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveActivityTab('task')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                      activeActivityTab === 'task'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveActivityTab('files')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                      activeActivityTab === 'files'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <Folder className="w-3 h-3" /> Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveActivityTab('sales_visit')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer border',
                      activeActivityTab === 'sales_visit'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <MapPin className="w-3 h-3" /> Sales Visit
                  </button>
                  <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Activity Body */}
              <div className="p-4 text-xs text-slate-500 min-h-[60px]">
                No Notes.
              </div>

              {/* Activity Footer Toolbar */}
              <div className="p-2.5 bg-[#F8FAFC] border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/customers')}
                  className="px-3.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: CONTACT DETAILS ── */}
        {activeSubTab === 'contacts' && (
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800">Contact Persons</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{customer.contactPerson || 'Primary Contact'}</p>
                  <p className="text-slate-500">{customer.phone} | {customer.email}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Primary
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: OPPORTUNITIES ── */}
        {activeSubTab === 'opportunity' && (
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">Linked Sales Opportunities</h3>
              <Link
                href={`/sales?tab=opportunities&action=add`}
                className="bg-[#16A34A] text-white px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> New Opportunity
              </Link>
            </div>
            {customerOpportunities.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">No opportunities recorded for this customer yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {customerOpportunities.map((opp) => (
                  <div key={opp.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{opp.title} ({opp.opportunityCode})</p>
                      <p className="text-slate-500">Stage: {opp.stage} | Expected Close: {opp.expectedClose}</p>
                    </div>
                    <span className="font-black text-slate-900 text-xs">AED {opp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT: QUOTATIONS / ORDERS / INVOICES / TIMELINE (FALLBACK CONTAINER) ── */}
        {['quotation', 'order', 'proforma', 'invoice', 'receipt', 'timeline', 'statement', 'history'].includes(activeSubTab) && (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-xs text-slate-500 shadow-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 capitalize">{activeSubTab} Records</p>
            <p className="text-slate-400 mt-1">No past {activeSubTab} vouchers found for this customer account.</p>
          </div>
        )}
      </div>
    </>
  )}

      {/* ── ASSIGN CUSTOMER MODAL ── */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Customer: ${customer.customerName}`}
        >
          <div className="space-y-4 text-xs">
            <Select
              label="Select Assigned Account Executive"
              value={assignUser}
              onChange={(e) => setAssignUser(e.target.value)}
              options={[
                { label: 'MUHAMMED AHSAN P V', value: 'MUHAMMED AHSAN P V' },
                { label: 'Nafal', value: 'Nafal' },
                { label: 'Muhammed Shemin', value: 'Muhammed Shemin' },
                { label: 'Muhammed Shibil', value: 'Muhammed Shibil' },
                { label: 'Afsal', value: 'Afsal' },
                { label: 'Shaheer', value: 'Shaheer' },
                { label: 'Alex Rivera', value: 'Alex Rivera' },
              ]}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" className="bg-[#0B2A4A] text-white" onClick={handleAssign}>
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
