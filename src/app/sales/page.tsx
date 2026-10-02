'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  Plus,
  Upload,
  UserCheck,
  Shield,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  SlidersHorizontal,
  X,
  RotateCcw,
  Edit2,
  Eye,
  CheckCircle2,
  Trash2,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  FileText,
  ShoppingCart,
  Receipt as ReceiptIcon,
  DollarSign,
  FileCheck,
  Truck,
  Download,
  Send,
  Printer,
  FilePlus,
  ArrowRight,
  Check,
  AlertCircle,
  TrendingUp,
  Settings,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import {
  CrmSalesOpportunity,
  DealStage,
  CrmQuotation,
  CrmSalesOrder,
  CrmProformaInvoice,
  CrmInvoice,
  CrmReceipt,
  CrmDeliveryNote,
} from '@/types/enterprise-crm';
import {
  mockQuotations,
  mockSalesOrders,
  mockProformaInvoices,
  mockInvoices,
  mockReceipts,
  mockDeliveryNotes,
} from '@/data/mockEnterpriseData';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

function SalesPipelineInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Pipeline Tab
  const rawTab = searchParams.get('tab') || 'opportunities';
  const activeTab =
    rawTab === 'quotation' || rawTab === 'quotations'
      ? 'quotations'
      : rawTab === 'order' || rawTab === 'orders'
        ? 'orders'
        : rawTab === 'opportunity' || rawTab === 'opportunities'
          ? 'opportunities'
          : rawTab === 'invoices' || rawTab === 'invoice'
            ? 'invoice'
            : rawTab === 'receipts' || rawTab === 'receipt'
              ? 'receipt'
              : rawTab === 'proformas' || rawTab === 'proforma'
                ? 'proforma'
                : rawTab === 'deliveries' || rawTab === 'delivery_notes' || rawTab === 'delivery'
                  ? 'delivery'
                  : rawTab;

  const { salesOpportunities, addOpportunity, customers, campaigns, users } = useEnterpriseCrm();

  // Mobile Filter Accordion States
  const [showQuoteFiltersMobile, setShowQuoteFiltersMobile] = useState(false);
  const [showOrderFiltersMobile, setShowOrderFiltersMobile] = useState(false);
  const [showProformaFiltersMobile, setShowProformaFiltersMobile] = useState(false);
  const [showInvoiceFiltersMobile, setShowInvoiceFiltersMobile] = useState(false);
  const [showReceiptFiltersMobile, setShowReceiptFiltersMobile] = useState(false);
  const [showDeliveryFiltersMobile, setShowDeliveryFiltersMobile] = useState(false);

  // Quotation State
  const [quotations, setQuotations] = useState<CrmQuotation[]>(mockQuotations);
  const [quotationFilterStatus, setQuotationFilterStatus] = useState<string>('All');
  const [quotationSearch, setQuotationSearch] = useState<string>('');
  const [isCreateQuoteModalOpen, setIsCreateQuoteModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<CrmQuotation | null>(null);

  // Orders State
  const [orders, setOrders] = useState<CrmSalesOrder[]>(mockSalesOrders);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CrmSalesOrder | null>(null);

  // Proforma State
  const [proformas, setProformas] = useState<CrmProformaInvoice[]>(mockProformaInvoices);
  const [proformaSearch, setProformaSearch] = useState<string>('');
  const [isCreateProformaModalOpen, setIsCreateProformaModalOpen] = useState(false);

  // Invoice State
  const [invoices, setInvoices] = useState<CrmInvoice[]>(mockInvoices);
  const [invoiceSubTab, setInvoiceSubTab] = useState<'invoice' | 'followup'>('invoice');
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CrmInvoice | null>(null);
  const [filterInvoiceOwner, setFilterInvoiceOwner] = useState<string>('All');
  const [filterInvoiceCustomer, setFilterInvoiceCustomer] = useState<string>('');
  const [filterInvoiceOppOrder, setFilterInvoiceOppOrder] = useState<string>('');
  const [filterInvoiceBizOpp, setFilterInvoiceBizOpp] = useState<string>('');
  const [filterInvoiceProductService, setFilterInvoiceProductService] = useState<string>('');
  const [filterInvoicePaymentStatus, setFilterInvoicePaymentStatus] = useState<string>('Due');
  const [filterInvoiceType, setFilterInvoiceType] = useState<string>('');
  const [filterInvoiceOrderType, setFilterInvoiceOrderType] = useState<string>('All');
  const [invoiceFormData, setInvoiceFormData] = useState({
    invoiceNumber: 'CTINV#' + Math.floor(1600 + Math.random() * 100),
    opportunityOrderRef: 'CTSO#3854 / SUPER GENERAL AC UNITS WITH INST',
    customer: 'OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN',
    contactPerson: 'Mr. Mohammad Hattab',
    phone: '+971 0506693043',
    issueDate: '18-09-2026',
    amount: 12432.0,
    paidAmount: 0.0,
    balanceAmount: 12432.0,
    status: 'Due',
  });

  // Receipt State
  const [receipts, setReceipts] = useState<CrmReceipt[]>(mockReceipts);
  const [receiptSearch, setReceiptSearch] = useState<string>('');
  const [isCreateReceiptModalOpen, setIsCreateReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CrmReceipt | null>(null);
  const [filterReceiptCreatedBy, setFilterReceiptCreatedBy] = useState<string>('All');
  const [filterReceiptType, setFilterReceiptType] = useState<string>('All');
  const [filterReceiptCustomer, setFilterReceiptCustomer] = useState<string>('');
  const [filterReceiptTags, setFilterReceiptTags] = useState<string>('');
  const [receiptFormData, setReceiptFormData] = useState({
    receiptNumber: 'REC-2026-' + Math.floor(800 + Math.random() * 99),
    invoiceRef: 'CTINV#1630',
    customer: 'OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN',
    contactPerson: 'Mr. Mohammad Hattab',
    phone: '+971 0506693043',
    receiptType: 'Against Invoice',
    paymentMethod: 'Bank Transfer',
    receiptDate: '23-09-2026',
    amount: 12432.0,
    tags: 'Direct Transfer',
    status: 'Cleared',
  });

  // Delivery Note State
  const [deliveryNotes, setDeliveryNotes] = useState<CrmDeliveryNote[]>(mockDeliveryNotes);
  const [deliverySearch, setDeliverySearch] = useState<string>('');
  const [isCreateDeliveryModalOpen, setIsCreateDeliveryModalOpen] = useState(false);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<CrmDeliveryNote[] | null | CrmDeliveryNote>(null);
  const [filterDeliveryOwner, setFilterDeliveryOwner] = useState<string>('All');
  const [filterDeliveryOrder, setFilterDeliveryOrder] = useState<string>('');
  const [filterDeliveryInvoice, setFilterDeliveryInvoice] = useState<string>('');
  const [filterDeliveryType, setFilterDeliveryType] = useState<string>('All');
  const [filterDeliveryCostUpdate, setFilterDeliveryCostUpdate] = useState<string>('All');
  const [deliveryFormData, setDeliveryFormData] = useState({
    deliveryNoteNumber: 'CTDN#' + Math.floor(1000 + Math.random() * 50),
    orderRef: 'CTSO#2653',
    orderDescription: 'AIR COOLER NOBEL 100LTR - 4134',
    customer: 'SECURA SAFETY WEAR - SOLEPROPRIETORSHIP L.L.C.',
    invoiceRef: '—',
    dnType: 'Customer DN',
    location: 'MUSSAFAH Abu Dhabi',
    receivedBy: 'SECURA SAFETY WEAR - SOLEPROPRIETORSHIP L.L.C.',
    receivedPhone: '+971563036405',
    dispatchDate: '28-07-2025',
    costUpdated: true,
    status: 'Delivered',
  });

  // --- OPPORTUNITIES STATE ---
  const [activeSubTab, setActiveSubTab] = useState<string>('open');
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterClassification, setFilterClassification] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [filterRating, setFilterRating] = useState('All');
  const [filterBizOpp, setFilterBizOpp] = useState('All');
  const [filterOwner, setFilterOwner] = useState('All');
  const [filterCampaign, setFilterCampaign] = useState('All');
  const [filterCreatedBy, setFilterCreatedBy] = useState('All');
  const [filterCreatedDate, setFilterCreatedDate] = useState('');
  const [filterOppDate, setFilterOppDate] = useState('');
  const [filterAssignedDate, setFilterAssignedDate] = useState('');
  const [filterCloseDate, setFilterCloseDate] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrmSalesOpportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form State for Add Opportunity (Matching Cezcon CRM spec)
  const [oppFormData, setOppFormData] = useState({
    opportunityCode: 'CTEQ#' + Math.floor(7100 + Math.random() * 800),
    opportunityDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    customer: '',
    contactPerson: '',
    phone: '',
    owner: 'Nafal',
    title: '',
    source: '',
    sourceName: '',
    rating: 'COLD' as 'COLD' | 'WARM' | 'HOT',
    stage: 'Enquiry' as DealStage,
    expectedClose: '',
    amount: '' as any,
    discount: '' as any,
    vatType: 'With VAT' as 'With VAT' | 'Without VAT' | 'Zero VAT',
    vatRate: 5,
    adjustment: '' as any,
    campaign: '',
    businessOpportunity: '',
    tags: '',
    deliveryDate: '',
    lpoNumber: '',
    lpoDate: '',
    nextAction: '',
    competitorsDetails: '',
    probability: 10,
    type: '',
    comments: '',
    location: '',
    enquiryForm: false,
    subtitle: '',
    classification: 'Corporate',
    createdBy: 'Super Admin',
  });

  // Form State for Quotation
  const [quoteFormData, setQuoteFormData] = useState({
    quotationNumber: 'QTN#' + Math.floor(7000 + Math.random() * 900) + '-A',
    opportunityCode: 'CTEQ#7016',
    customer: '',
    contactPerson: '',
    phone: '',
    subject: '',
    quoteDate: '23-09-2026',
    validUntil: '30-10-2026',
    subtotal: 5000,
    vatAmount: 250,
    totalAmount: 5250,
    status: 'Sent' as const,
    owner: 'Alex Rivera',
    itemsCount: 1,
  });

  // Switch Tab Helper
  const handleTabChange = (tabId: string) => {
    router.push(`/sales?tab=${tabId}`);
  };

  const subTabs = [
    { id: 'all', label: 'All', count: 6846, icon: Search },
    { id: 'unread', label: 'Unread', count: 27, icon: Info },
    { id: 'open', label: 'Open', count: 2691, icon: Star, highlight: true },
    { id: 'today', label: 'Today', count: 3, icon: Clock },
    { id: 'overdue', label: 'Overdue', count: 2607, icon: Clock },
    { id: 'upcoming', label: 'Upcoming', count: 81, icon: Calendar },
    { id: 'lost', label: 'Lost', count: 459, icon: X },
    { id: 'order', label: 'Order', count: 2696, icon: Sparkles },
    { id: 'overview', label: 'Overview', icon: Layers },
  ];

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    return salesOpportunities.filter((opp) => {
      if (activeSubTab === 'lost' && opp.stage !== 'Lost') return false;
      if (activeSubTab === 'order' && opp.stage !== 'Order') return false;

      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchCode = (opp.opportunityCode || '').toLowerCase().includes(q);
        const matchCustomer = opp.customer.toLowerCase().includes(q);
        const matchContact = (opp.contactPerson || '').toLowerCase().includes(q);
        const matchPhone = (opp.phone || '').includes(q);
        if (!matchTitle && !matchCode && !matchCustomer && !matchContact && !matchPhone) {
          return false;
        }
      }

      if (filterCustomer && !opp.customer.toLowerCase().includes(filterCustomer.toLowerCase())) return false;
      if (filterClassification !== 'All' && opp.classification !== filterClassification) return false;
      if (filterStage !== 'All' && opp.stage !== filterStage) return false;
      if (filterRating !== 'All' && opp.rating !== filterRating) return false;
      if (filterBizOpp !== 'All' && opp.businessOpportunity !== filterBizOpp) return false;
      if (filterOwner !== 'All' && opp.owner !== filterOwner) return false;
      if (filterCampaign !== 'All' && opp.campaign !== filterCampaign) return false;
      if (filterCreatedBy !== 'All' && opp.createdBy !== filterCreatedBy) return false;
      if (filterTags && !opp.tags?.some((t) => t.toLowerCase().includes(filterTags.toLowerCase()))) return false;

      return true;
    });
  }, [
    salesOpportunities,
    activeSubTab,
    tableSearch,
    filterCustomer,
    filterClassification,
    filterStage,
    filterRating,
    filterBizOpp,
    filterOwner,
    filterCampaign,
    filterCreatedBy,
    filterTags,
  ]);

  const totalPages = Math.ceil(filteredOpportunities.length / rowsPerPage) || 1;
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedOpportunities.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppFormData.title || !oppFormData.customer) return;

    const amt = Number(oppFormData.amount) || 0;
    const disc = Number(oppFormData.discount) || 0;
    const subtotal = Math.max(0, amt - disc);
    const vatVal = oppFormData.vatType === 'With VAT' ? Math.round(subtotal * (Number(oppFormData.vatRate) / 100)) : 0;
    const finalAmount = subtotal + vatVal + (Number(oppFormData.adjustment) || 0);

    addOpportunity({
      opportunityCode: oppFormData.opportunityCode,
      title: oppFormData.title,
      subtitle: oppFormData.businessOpportunity || oppFormData.type || '',
      customer: oppFormData.customer,
      contactPerson: oppFormData.contactPerson,
      phone: oppFormData.phone,
      amount: finalAmount > 0 ? finalAmount : amt,
      stage: oppFormData.stage,
      probability: Number(oppFormData.probability) || 10,
      owner: oppFormData.owner || 'Nafal',
      opportunityDate: oppFormData.opportunityDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      opportunityDateDaysAgo: '0 days',
      expectedClose: oppFormData.expectedClose || 'Pending',
      closeDateRemaining: '7 days',
      lastActivity: `${oppFormData.opportunityDate} 12:00:00 PM`,
      lastActivityRelative: 'Today',
      classification: oppFormData.classification || 'Corporate',
      rating: oppFormData.rating === 'COLD' ? 'Cold' : oppFormData.rating === 'WARM' ? 'Warm' : 'Hot',
      businessOpportunity: oppFormData.businessOpportunity,
      campaign: oppFormData.campaign,
      createdBy: oppFormData.createdBy,
      tags: oppFormData.tags ? oppFormData.tags.split(',').map((t) => t.trim()) : [],
    });

    closeAddOpportunity();
  };

  const isAddOpen = isAddModalOpen || searchParams.get('action') === 'add';
  const closeAddOpportunity = () => {
    setIsAddModalOpen(false);
    if (searchParams.get('action') === 'add') {
      router.push('/sales?tab=opportunities');
    }
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteFormData.customer || !quoteFormData.subject) return;

    const sub = Number(quoteFormData.subtotal);
    const vat = sub * 0.05;
    const total = sub + vat;

    const newQuote: CrmQuotation = {
      id: `qtn-${Date.now()}`,
      slNo: quotations.length + 1,
      quotationNumber: quoteFormData.quotationNumber,
      opportunityCode: quoteFormData.opportunityCode,
      customer: quoteFormData.customer,
      contactPerson: quoteFormData.contactPerson,
      phone: quoteFormData.phone,
      subject: quoteFormData.subject,
      quoteDate: quoteFormData.quoteDate,
      validUntil: quoteFormData.validUntil,
      subtotal: sub,
      vatAmount: vat,
      totalAmount: total,
      status: quoteFormData.status,
      owner: quoteFormData.owner,
      itemsCount: Number(quoteFormData.itemsCount),
    };

    setQuotations([newQuote, ...quotations]);
    setIsCreateQuoteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* VIEW 1: OPPORTUNITY TAB (Cezcon CRM Open Opportunities UI & Full Page Add Opportunity) */}
      {/* ========================================================================= */}
      {activeTab === 'opportunities' && (
        <div className="flex flex-col flex-1">
          {isAddOpen ? (
            /* ── FULL PAGE ADD OPPORTUNITY VIEW (EXACT CEZCON CRM IMAGE 1) ── */
            <div className="p-2 sm:p-4 flex-1 flex flex-col min-w-0 w-full">
              <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col flex-1 text-xs font-sans">
                {/* 1. Header Bar with Search/Add Opportunity title and + Customer / X buttons */}
                <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-800 text-[13px]">Add Opportunity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/customers"
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Customer
                    </Link>
                    <button
                      type="button"
                      onClick={closeAddOpportunity}
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Main Form Body (2-Column Grid) */}
                <form onSubmit={handleCreateOpportunity} className="p-4 sm:p-6 flex-1 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-3.5 text-[11px]">
                    {/* ── LEFT COLUMN ── */}
                    <div className="space-y-3.5">
                      {/* Customer Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={oppFormData.customer}
                          onChange={(e) => {
                            const custName = e.target.value;
                            const found = customers.find(
                              (c) => (c.customerName || c.companyName) === custName
                            );
                            setOppFormData({
                              ...oppFormData,
                              customer: custName,
                              contactPerson: found?.contactPerson || oppFormData.contactPerson,
                              phone: found?.phone || oppFormData.phone,
                            });
                          }}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Customer</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.customerName || c.companyName}>
                              {c.customerName || c.companyName}
                            </option>
                          ))}
                          <option value="AL HABTOOR ENGINEERING">AL HABTOOR ENGINEERING</option>
                          <option value="EMAAR PROPERTIES">EMAAR PROPERTIES</option>
                          <option value="SMART GROUP OF COMPANIES">SMART GROUP OF COMPANIES</option>
                        </select>
                      </div>

                      {/* Opportunity Owner */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                          Opportunity Owner <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 relative">
                          <select
                            required
                            value={oppFormData.owner}
                            onChange={(e) => setOppFormData({ ...oppFormData, owner: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded pl-7 pr-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Nafal">Nafal</option>
                            <option value="Muhammed Shemin">Muhammed Shemin</option>
                            <option value="Muhammed Shibil">Muhammed Shibil</option>
                            <option value="Afsal">Afsal</option>
                            <option value="Shaheer">Shaheer</option>
                            <option value="Muhammed Adhil">Muhammed Adhil</option>
                            <option value="shameem">shameem</option>
                            <option value="Arun">Arun</option>
                            <option value="System Super Admin">System Super Admin</option>
                          </select>
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Opportunity Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                          Opportunity Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={oppFormData.title}
                          onChange={(e) => setOppFormData({ ...oppFormData, title: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Source */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                          Source <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
                        </label>
                        <select
                          value={oppFormData.source}
                          onChange={(e) => setOppFormData({ ...oppFormData, source: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Source</option>
                          <option value="Direct Inquiry">Direct Inquiry</option>
                          <option value="Google">Google</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Referral">Referral</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Website">Website</option>
                          <option value="Exhibition">Exhibition</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </div>

                      {/* Rating */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                          Rating <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
                        </label>
                        <div className="flex-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setOppFormData({ ...oppFormData, rating: 'COLD' })}
                            className={cn(
                              'px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors',
                              oppFormData.rating === 'COLD'
                                ? 'bg-[#0284C7] text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                            )}
                          >
                            COLD
                          </button>
                          <button
                            type="button"
                            onClick={() => setOppFormData({ ...oppFormData, rating: 'WARM' })}
                            className={cn(
                              'px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors',
                              oppFormData.rating === 'WARM'
                                ? 'bg-[#F59E0B] text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                            )}
                          >
                            WARM
                          </button>
                          <button
                            type="button"
                            onClick={() => setOppFormData({ ...oppFormData, rating: 'HOT' })}
                            className={cn(
                              'px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors',
                              oppFormData.rating === 'HOT'
                                ? 'bg-[#DC2626] text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                            )}
                          >
                            HOT
                          </button>
                        </div>
                      </div>

                      {/* Close Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                          Close Date <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            required
                            placeholder="Expected Closing Date"
                            value={oppFormData.expectedClose}
                            onChange={(e) => setOppFormData({ ...oppFormData, expectedClose: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Discount</label>
                        <input
                          type="number"
                          value={oppFormData.discount}
                          onChange={(e) => setOppFormData({ ...oppFormData, discount: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* VAT */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">VAT</label>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                            <input
                              type="number"
                              value={oppFormData.vatRate}
                              onChange={(e) => setOppFormData({ ...oppFormData, vatRate: Number(e.target.value) })}
                              className="w-full px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                            />
                            <span className="px-2 text-xs text-slate-500 font-semibold bg-slate-100 border-l border-slate-300 py-1.5">
                              %
                            </span>
                          </div>
                          <input
                            type="text"
                            readOnly
                            placeholder="VAT Amount"
                            value={
                              oppFormData.vatType === 'With VAT' && oppFormData.amount
                                ? `AED ${Math.round(
                                    Math.max(0, (Number(oppFormData.amount) || 0) - (Number(oppFormData.discount) || 0)) *
                                      ((Number(oppFormData.vatRate) || 5) / 100)
                                  ).toLocaleString()}`
                                : ''
                            }
                            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Total Amount</label>
                        <input
                          type="text"
                          readOnly
                          value={
                            oppFormData.amount
                              ? `AED ${(
                                  Math.max(0, (Number(oppFormData.amount) || 0) - (Number(oppFormData.discount) || 0)) +
                                  (oppFormData.vatType === 'With VAT'
                                    ? Math.round(
                                        Math.max(0, (Number(oppFormData.amount) || 0) - (Number(oppFormData.discount) || 0)) *
                                          ((Number(oppFormData.vatRate) || 5) / 100)
                                      )
                                    : 0) +
                                  (Number(oppFormData.adjustment) || 0)
                                ).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                              : ''
                          }
                          className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                        />
                      </div>

                      {/* Business Opportunity */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Business Opportunity</label>
                        <select
                          value={oppFormData.businessOpportunity}
                          onChange={(e) => setOppFormData({ ...oppFormData, businessOpportunity: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Business Opportunity</option>
                          <option value="Water Coolers">Water Coolers</option>
                          <option value="HVAC Units">HVAC Units</option>
                          <option value="Chillers & VRF">Chillers & VRF</option>
                          <option value="Cold Storage">Cold Storage</option>
                          <option value="Duct Cleaning">Duct Cleaning</option>
                          <option value="Maintenance AMC">Maintenance AMC</option>
                          <option value="Spare Parts">Spare Parts</option>
                          <option value="Commercial Contracting">Commercial Contracting</option>
                        </select>
                      </div>

                      {/* Delivery Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Delivery Date</label>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={oppFormData.deliveryDate}
                            onChange={(e) => setOppFormData({ ...oppFormData, deliveryDate: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* LPO Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">LPO Date</label>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={oppFormData.lpoDate}
                            onChange={(e) => setOppFormData({ ...oppFormData, lpoDate: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Competitors Details */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0 pt-1.5">Competitors Details</label>
                        <textarea
                          rows={2}
                          value={oppFormData.competitorsDetails}
                          onChange={(e) => setOppFormData({ ...oppFormData, competitorsDetails: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                        />
                      </div>

                      {/* Type */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Type</label>
                        <select
                          value={oppFormData.type}
                          onChange={(e) => setOppFormData({ ...oppFormData, type: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Type</option>
                          <option value="New Business">New Business</option>
                          <option value="Existing Customer">Existing Customer</option>
                          <option value="Renewal">Renewal</option>
                          <option value="Project Tender">Project Tender</option>
                          <option value="AMC">AMC</option>
                        </select>
                      </div>

                      {/* Location */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Location</label>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Search location"
                            value={oppFormData.location}
                            onChange={(e) => setOppFormData({ ...oppFormData, location: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          {oppFormData.location ? (
                            <button
                              type="button"
                              onClick={() => setOppFormData({ ...oppFormData, location: '' })}
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="space-y-3.5">
                      {/* Opportunity Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                          Opportunity Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            required
                            value={oppFormData.opportunityCode}
                            onChange={(e) => setOppFormData({ ...oppFormData, opportunityCode: e.target.value })}
                            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            title="Opportunity Number Settings"
                            onClick={() =>
                              setOppFormData({
                                ...oppFormData,
                                opportunityCode: 'CTEQ#' + Math.floor(7100 + Math.random() * 800),
                              })
                            }
                            className="p-1.5 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded hover:bg-cyan-100 transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Opportunity Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Opportunity Date</label>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={oppFormData.opportunityDate}
                            onChange={(e) => setOppFormData({ ...oppFormData, opportunityDate: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Point of Contact */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Point of Contact</label>
                        <select
                          value={oppFormData.contactPerson}
                          onChange={(e) => setOppFormData({ ...oppFormData, contactPerson: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">{oppFormData.customer ? 'Select Point of Contact' : 'Select Customer First'}</option>
                          {oppFormData.contactPerson && (
                            <option value={oppFormData.contactPerson}>{oppFormData.contactPerson}</option>
                          )}
                          <option value="Primary Contact">Primary Contact</option>
                          <option value="Managing Director">Managing Director</option>
                          <option value="Procurement Head">Procurement Head</option>
                          <option value="Facility Manager">Facility Manager</option>
                        </select>
                      </div>

                      {/* Source Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Source Name</label>
                        <input
                          type="text"
                          placeholder="Name of the source. Eg Google, LinkedIn"
                          value={oppFormData.sourceName}
                          onChange={(e) => setOppFormData({ ...oppFormData, sourceName: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Stage */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Stage</label>
                        <select
                          value={oppFormData.stage}
                          onChange={(e) => setOppFormData({ ...oppFormData, stage: e.target.value as DealStage })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Enquiry">Enquiry</option>
                          <option value="Qualification">Qualification</option>
                          <option value="Offer Sent">Offer Sent</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Amount</label>
                        <input
                          type="number"
                          placeholder="Proposed Amount"
                          value={oppFormData.amount}
                          onChange={(e) => setOppFormData({ ...oppFormData, amount: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* VAT Type */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">VAT Type</label>
                        <select
                          value={oppFormData.vatType}
                          onChange={(e) => setOppFormData({ ...oppFormData, vatType: e.target.value as any })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="With VAT">With VAT</option>
                          <option value="Without VAT">Without VAT</option>
                          <option value="Zero VAT">Zero VAT</option>
                        </select>
                      </div>

                      {/* Adjustment */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Adjustment</label>
                        <input
                          type="number"
                          value={oppFormData.adjustment}
                          onChange={(e) => setOppFormData({ ...oppFormData, adjustment: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Campaign */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                          Campaign <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
                        </label>
                        <select
                          value={oppFormData.campaign}
                          onChange={(e) => setOppFormData({ ...oppFormData, campaign: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Campaign</option>
                          {campaigns.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          <option value="HVAC Commercial 2026">HVAC Commercial 2026</option>
                          <option value="Google Ads Search">Google Ads Search</option>
                          <option value="Email Outreach">Email Outreach</option>
                        </select>
                      </div>

                      {/* Opportunity Tags */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Opportunity Tags</label>
                        <input
                          type="text"
                          placeholder="Keywords attached to the opportunity"
                          value={oppFormData.tags}
                          onChange={(e) => setOppFormData({ ...oppFormData, tags: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* LPO Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">LPO Number</label>
                        <input
                          type="text"
                          value={oppFormData.lpoNumber}
                          onChange={(e) => setOppFormData({ ...oppFormData, lpoNumber: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Next Action */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0 pt-1.5">Next Action</label>
                        <textarea
                          rows={2}
                          value={oppFormData.nextAction}
                          onChange={(e) => setOppFormData({ ...oppFormData, nextAction: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                        />
                      </div>

                      {/* Win Probability */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Win Probability</label>
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={oppFormData.probability}
                            onChange={(e) => setOppFormData({ ...oppFormData, probability: Number(e.target.value) })}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
                          />
                          <span className="px-2.5 py-0.5 bg-[#F97316] text-white text-[11px] font-bold rounded min-w-[42px] text-center shadow-2xs">
                            {oppFormData.probability}%
                          </span>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0 pt-1.5">Comments</label>
                        <textarea
                          rows={2}
                          value={oppFormData.comments}
                          onChange={(e) => setOppFormData({ ...oppFormData, comments: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Bottom Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setOppFormData({ ...oppFormData, enquiryForm: !oppFormData.enquiryForm })}
                        className={cn(
                          'w-9 h-5 rounded-full transition-colors relative cursor-pointer',
                          oppFormData.enquiryForm ? 'bg-blue-600' : 'bg-slate-300'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-2xs',
                            oppFormData.enquiryForm ? 'left-4.5' : 'left-0.5'
                          )}
                        />
                      </button>
                      <span className="text-xs font-bold text-blue-600">Enquiry Form</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-6 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-semibold rounded shadow-xs cursor-pointer transition-colors"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={closeAddOpportunity}
                        className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* ── NORMAL OPPORTUNITY LIST VIEW ── */
            <>
              {/* Sub-Tabs Pills */}
              <div className="bg-white border-b border-[#E2E8F0] px-4 py-2 flex items-center justify-between shadow-xs sticky top-0 z-30 overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                  {subTabs.map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveSubTab(tab.id);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border',
                          isActive
                            ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        )}
                      >
                        <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-slate-500')} />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content with Filter Sidebar */}
              <div className="flex flex-col lg:flex-row flex-1 p-3 sm:p-4 gap-4 items-start w-full min-w-0">
            {/* Left Collapsible Filter Panel */}
            {showFilterPanel && (
              <aside className="w-full lg:w-64 shrink-0 bg-white border border-[#E2E8F0] rounded-sm p-3 shadow-xs text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Filter Criteria
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterPanel(false)}
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                    title="Close Filter"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Customer/ Prospect</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Customer/Prospect"
                      value={filterCustomer}
                      onChange={(e) => setFilterCustomer(e.target.value)}
                      className="w-full pl-2 pr-6 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Classification</label>
                  <select
                    value={filterClassification}
                    onChange={(e) => setFilterClassification(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Classification</option>
                    <option value="Direct">Direct</option>
                    <option value="Partner">Partner</option>
                    <option value="Government">Government</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Stage</label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Stages</option>
                    <option value="Offer Sent">Offer Sent</option>
                    <option value="On Review">On Review</option>
                    <option value="Allocated To Inhouse">Allocated To Inhouse</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Order">Order</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Rating</label>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Business Opportunity</label>
                  <select
                    value={filterBizOpp}
                    onChange={(e) => setFilterBizOpp(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">Select Type</option>
                    <option value="Water Coolers">Water Coolers</option>
                    <option value="Industrial Coolers">Industrial Coolers</option>
                    <option value="HVAC Split AC">HVAC Split AC</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Opportunity Owner</label>
                  <select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Owners</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                    <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                    <option value="COOL TECH">COOL TECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Campaign</label>
                  <select
                    value={filterCampaign}
                    onChange={(e) => setFilterCampaign(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">Select Campaign</option>
                    <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                    <option value="Summer Cooling Promo 2026">Summer Cooling Promo 2026</option>
                    <option value="UAE Industrial Cooling Expo">UAE Industrial Cooling Expo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Created By</label>
                  <select
                    value={filterCreatedBy}
                    onChange={(e) => setFilterCreatedBy(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Worker">Worker</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Tags</label>
                  <input
                    type="text"
                    placeholder="Select tags"
                    value={filterTags}
                    onChange={(e) => setFilterTags(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </aside>
            )}

            {/* Opportunities Table & Cards Card */}
            <div className="flex-1 w-full min-w-0 bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
              <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-white">
                <div className="flex items-center gap-2">
                  {!showFilterPanel && (
                    <button
                      type="button"
                      onClick={() => setShowFilterPanel(true)}
                      className="p-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                      title="Show Filters"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Open Opportunities
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload Opportunity</span>
                    <span className="sm:hidden">Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Assign Opportunity</span>
                    <span className="sm:hidden">Assign</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(true);
                      router.push('/sales?tab=opportunities&action=add');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ OPPORTUNITY</span>
                  </button>
                </div>
              </div>

              {/* Table Controls */}
              <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Shows</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>Rows</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search Opportunity"
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                </div>
              </div>

              {/* ── Mobile Card View (Phones & Tablets < lg) ── */}
              <div className="block lg:hidden space-y-3 p-3">
                {paginatedOpportunities.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-white rounded border border-slate-200">
                    No opportunities found matching your criteria.
                  </div>
                ) : (
                  paginatedOpportunities.map((opp, idx) => {
                    const isSelected = selectedIds.includes(opp.id);
                    const slNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                    return (
                      <div
                        key={opp.id}
                        className={cn(
                          'bg-white border rounded-lg p-3.5 shadow-sm space-y-2.5 transition',
                          isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200'
                        )}
                      >
                        {/* Top row: Checkbox, Star, Code, Stage */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(opp.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                            />
                            <Star className={cn('w-4 h-4', opp.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300')} />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOpportunity(opp);
                                setIsDetailModalOpen(true);
                              }}
                              className="text-[#2563EB] hover:underline font-bold text-xs"
                            >
                              {opp.opportunityCode || 'CTEQ#7016'}
                            </button>
                          </div>
                          <span className="px-2 py-0.5 bg-[#2563EB] text-white rounded text-[10px] font-bold">
                            {opp.stage}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h4 className="font-bold text-slate-800 uppercase text-xs">{opp.title}</h4>
                          {opp.subtitle && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Package className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{opp.subtitle}</span>
                            </p>
                          )}
                        </div>

                        {/* Customer Box */}
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                            <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                            <span className="truncate">{opp.customer}</span>
                          </div>
                          {opp.contactPerson && (
                            <div className="text-[11px] text-slate-600 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{opp.contactPerson}</span>
                            </div>
                          )}
                          {opp.phone && (
                            <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <span>🟢</span>
                              <a href={`tel:${opp.phone}`} className="hover:underline">{opp.phone}</a>
                            </div>
                          )}
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-medium block">Amount</span>
                            <span className="font-bold text-slate-900 text-sm">
                              AED {opp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-medium block">Win Probability</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${opp.probability}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">{opp.probability}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer row: Dates & Owner */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-[#06B6D4] text-white rounded text-[10px] font-bold">
                              {opp.opportunityDateDaysAgo || '0 days'}
                            </span>
                            <span>Close: {opp.expectedClose || '30-09-2026'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {opp.ownerBadge === 'COOL' ? (
                              <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded text-[9px] font-bold">
                                COOL
                              </span>
                            ) : (
                              <img
                                src={opp.ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                                alt={opp.owner}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200"
                              />
                            )}
                            <span className="font-medium text-slate-700 text-xs">{opp.owner}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── Desktop Table View (lg and up) ── */}
              <div className="hidden lg:block overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                      <th className="p-2.5 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={
                            paginatedOpportunities.length > 0 &&
                            selectedIds.length === paginatedOpportunities.length
                          }
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-2.5 w-12 text-slate-600 text-center">SL.No</th>
                      <th className="p-2.5 w-16 text-slate-600 text-center">Owner</th>
                      <th className="p-2.5 w-28 text-slate-600">Opportunity Date</th>
                      <th className="p-2.5 w-24 text-slate-600">Opportunity Assigned</th>
                      <th className="p-2.5 min-w-[190px] text-slate-600">Opportunity</th>
                      <th className="p-2.5 min-w-[220px] text-slate-600">Customer</th>
                      <th className="p-2.5 w-28 text-slate-600">Last Activity</th>
                      <th className="p-2.5 w-24 text-slate-600">Close Date</th>
                      <th className="p-2.5 w-32 text-slate-600">Stage & Win Probability</th>
                      <th className="p-2.5 w-28 text-right text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {paginatedOpportunities.map((opp, idx) => {
                      const isSelected = selectedIds.includes(opp.id);
                      const slNumber = (currentPage - 1) * rowsPerPage + idx + 1;

                      return (
                        <tr
                          key={opp.id}
                          className={cn(
                            'hover:bg-[#F0FDF4]/40 transition-colors',
                            isSelected ? 'bg-blue-50/50' : ''
                          )}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectOne(opp.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 text-slate-600 font-medium text-center">
                            {opp.slNo || slNumber}
                          </td>
                          <td className="p-2.5 text-center">
                            {opp.ownerBadge === 'COOL' ? (
                              <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded text-[10px] font-bold">
                                COOL
                              </span>
                            ) : (
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 mx-auto">
                                <img
                                  src={
                                    opp.ownerAvatar ||
                                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                                  }
                                  alt={opp.owner}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <div className="text-slate-800 font-medium">{opp.opportunityDate || '23-09-2026'}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">
                              {opp.opportunityDateDaysAgo || '0 days'}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {opp.opportunityAssigned ? (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                                {opp.opportunityAssigned}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Star className={cn('w-3.5 h-3.5', opp.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300')} />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOpportunity(opp);
                                    setIsDetailModalOpen(true);
                                  }}
                                  className="text-[#2563EB] hover:underline font-bold text-xs"
                                >
                                  {opp.opportunityCode || 'CTEQ#7016'}
                                </button>
                                <span className="font-bold text-slate-800 uppercase text-[11px]">{opp.title}</span>
                                <Info
                                  className="w-3.5 h-3.5 text-blue-500 cursor-pointer"
                                  onClick={() => {
                                    setSelectedOpportunity(opp);
                                    setIsDetailModalOpen(true);
                                  }}
                                />
                              </div>
                              {opp.subtitle && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Package className="w-3 h-3 text-amber-600" />
                                  <span>{opp.subtitle}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                                <span className="text-[#2563EB] font-bold text-xs">{opp.customer}</span>
                              </div>
                              {opp.contactPerson && (
                                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>{opp.contactPerson}</span>
                                </div>
                              )}
                              {opp.phone && (
                                <div className="text-[11px] text-emerald-600 font-medium">
                                  🟢 {opp.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <div className="text-slate-700 text-[11px]">{opp.lastActivity || '23-09-2026'}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">
                              {opp.lastActivityRelative || 'Today'}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <div className="text-slate-700 text-[11px]">{opp.expectedClose || '30-09-2026'}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">
                              {opp.closeDateRemaining || '7 days'}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 bg-[#2563EB] text-white rounded text-[10px] font-bold inline-block">
                                {opp.stage}
                              </span>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${opp.probability}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600">{opp.probability}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            <span className="font-bold text-slate-900 text-xs">
                              {opp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 bg-white">
                <div>Showing 1 to {paginatedOpportunities.length} of {filteredOpportunities.length} entries (Total: 2,691)</div>
                <div className="flex items-center gap-1">
                  <button type="button" className="px-2.5 py-1 border border-slate-300 rounded font-semibold bg-[#008080] text-white">
                    1
                  </button>
                  <button type="button" className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-50">2</button>
                  <button type="button" className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-50">3</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* ========================================================================= */}
      {/* VIEW 2: QUOTATIONS TAB (Exact Cezcon CRM Quotation Layout) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* VIEW 2: QUOTATIONS TAB (Exact Cezcon CRM Quotation Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'quotations' && (
        <div className="flex-1 p-3 sm:p-4 space-y-3 w-full font-sans">
          {/* TOP FILTER CRITERIA CARD */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-3 sm:p-4 shadow-xs space-y-3 text-xs">
            {/* Mobile Filter Header Toggle Button */}
            <div className="flex md:hidden items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQuoteFiltersMobile(!showQuoteFiltersMobile)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
              >
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Quotations</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                    {showQuoteFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showQuoteFiltersMobile ? 'rotate-180' : '')} />
              </button>
            </div>

            <div className={cn('space-y-3', showQuoteFiltersMobile ? 'block' : 'hidden md:block')}>
              {/* Filter Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Select Owner</label>
                  <select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Owners</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                    <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                    <option value="COOL TECH">COOL TECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Quotation Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="25-08-2026 - 23-09-2026"
                      className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 font-medium"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer absolute right-2.5 top-2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Select Quotation Type</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Quotation Type</option>
                    <option value="standard">Standard Proposal</option>
                    <option value="project">Project Tender</option>
                    <option value="maintenance">Maintenance Contract</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Status</label>
                  <select
                    value={quotationFilterStatus}
                    onChange={(e) => setQuotationFilterStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Sent">Sent</option>
                    <option value="Draft">Draft</option>
                    <option value="Expired">Expired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Filter Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Business Opportunity</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select</option>
                    <option value="Water Coolers">Water Coolers</option>
                    <option value="Industrial Coolers">Industrial Coolers</option>
                    <option value="HVAC Split AC">HVAC Split AC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Customer</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Customer</option>
                    <option value="SMART GROUP OF CAPANIES">SMART GROUP OF CAPANIES</option>
                    <option value="ZUBLIN CONSTRUCTION L.L.C">ZUBLIN CONSTRUCTION L.L.C</option>
                    <option value="DESERT MAN TRANSPORTING">DESERT MAN TRANSPORTING</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Select Opportunity</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Opportunity</option>
                    <option value="WATER COOLERS">WATER COOLERS</option>
                    <option value="WATER DISPENSER">WATER DISPENSER</option>
                    <option value="2TR SPLIT AC">2TR SPLIT AC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Product/Service</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Product/Service</option>
                    <option value="Water Cooler 500L">Water Cooler 500L</option>
                    <option value="Split AC 2 Ton">Split AC 2 Ton</option>
                  </select>
                </div>
              </div>

              {/* Filter Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Opportunity Stage</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="All Stages">All Stages</option>
                    <option value="Offer Sent">Offer Sent</option>
                    <option value="On Review">On Review</option>
                    <option value="Allocated To Inhouse">Allocated To Inhouse</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN QUOTATION TABLE SECTION */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
            {/* Header with Title and + QUOTATION Button */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> Quotation
              </h2>

              <button
                type="button"
                onClick={() => setIsCreateQuoteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>QUOTATION</span>
              </button>
            </div>

            {/* Table Controls (Rows and Search) */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search Quotation"
                  value={quotationSearch}
                  onChange={(e) => setQuotationSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            {/* Native Mobile Quotations Cards (Phone Viewports) */}
            <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
              {quotations
                .filter((q) => {
                  if (quotationFilterStatus !== 'All' && q.status !== quotationFilterStatus) return false;
                  if (quotationSearch) {
                    const s = quotationSearch.toLowerCase();
                    return (
                      q.quotationNumber.toLowerCase().includes(s) ||
                      q.customer.toLowerCase().includes(s) ||
                      q.subject.toLowerCase().includes(s) ||
                      (q.opportunityCode || '').toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
                .map((q) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                          📄
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedQuote(q)}
                          className="text-[#2563EB] font-bold text-xs hover:underline text-left"
                        >
                          {q.quotationNumber}
                        </button>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0284C7] text-white rounded text-[10px] font-bold">
                        Approved
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-900 uppercase">
                        {q.subject}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Date: {q.quoteDate}</div>
                    </div>

                    <div className="bg-slate-50 rounded p-2 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                        <span className="text-[#2563EB] font-bold text-xs">{q.customer}</span>
                      </div>
                      {q.contactPerson && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{q.contactPerson}</span>
                        </div>
                      )}
                      {q.phone && (
                        <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          <span>{q.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Amount</div>
                        <div className="font-semibold text-slate-700">
                          {q.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">VAT (5%)</div>
                        <div className="font-semibold text-slate-600">
                          {q.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Total</div>
                        <div className="font-bold text-slate-900">
                          {q.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                            alt="Alex Rivera"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">Alex Rivera</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedQuote(q)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Cezcon Quotations Table (Desktop Viewports) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="p-2.5 w-12 text-center text-slate-600">SL.No</th>
                    <th className="p-2.5 min-w-[120px] text-slate-600">Quotation#</th>
                    <th className="p-2.5 w-16 text-slate-600">Owner</th>
                    <th className="p-2.5 w-28 text-slate-600">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                        <span>Date</span>
                        <ChevronDown className="w-3 h-3 text-blue-600" />
                      </div>
                    </th>
                    <th className="p-2.5 min-w-[200px] text-slate-600">Opportunity</th>
                    <th className="p-2.5 min-w-[240px] text-slate-600">Customer</th>
                    <th className="p-2.5 w-24 text-right text-slate-600">Amount</th>
                    <th className="p-2.5 w-20 text-right text-slate-600">VAT</th>
                    <th className="p-2.5 w-24 text-right text-slate-600">Total</th>
                    <th className="p-2.5 w-24 text-center text-slate-600">Status</th>
                    <th className="p-2.5 w-20 text-center text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {quotations
                    .filter((q) => {
                      if (quotationFilterStatus !== 'All' && q.status !== quotationFilterStatus) return false;
                      if (quotationSearch) {
                        const s = quotationSearch.toLowerCase();
                        return (
                          q.quotationNumber.toLowerCase().includes(s) ||
                          q.customer.toLowerCase().includes(s) ||
                          q.subject.toLowerCase().includes(s) ||
                          (q.opportunityCode || '').toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map((q) => (
                      <tr key={q.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                        {/* SL.No */}
                        <td className="p-2.5 text-center text-slate-600 font-medium">
                          {q.slNo}
                        </td>

                        {/* Quotation# */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                              📄
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedQuote(q)}
                              className="text-[#2563EB] hover:underline font-bold text-xs"
                            >
                              {q.quotationNumber}
                            </button>
                          </div>
                        </td>

                        {/* Owner Avatar */}
                        <td className="p-2.5">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                              alt="Alex Rivera"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                          {q.quoteDate}
                        </td>

                        {/* Opportunity */}
                        <td className="p-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#2563EB] font-bold text-xs uppercase hover:underline cursor-pointer">
                                {q.subject}
                              </span>
                              <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                            </div>
                            <span
                              className={cn(
                                'inline-block px-2 py-0.2 rounded text-[10px] font-bold text-white',
                                q.subject.includes('WATERCOOLER') || q.subject.includes('1.5TR')
                                  ? 'bg-[#0284C7]'
                                  : 'bg-[#2563EB]'
                              )}
                            >
                              {q.subject.includes('WATERCOOLER') || q.subject.includes('1.5TR')
                                ? 'On Review'
                                : 'Offer Sent'}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                              <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                                {q.customer}
                              </span>
                              <Info className="w-3 h-3 text-blue-500 cursor-pointer shrink-0" />
                            </div>

                            {q.contactPerson && (
                              <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{q.contactPerson}</span>
                                <Info className="w-2.5 h-2.5 text-blue-400 cursor-pointer" />
                              </div>
                            )}

                            {q.phone && (
                              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>{q.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Amount (Subtotal) */}
                        <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                          {q.subtotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* VAT (5%) */}
                        <td className="p-2.5 text-right font-medium text-slate-600 whitespace-nowrap">
                          {q.vatAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Total */}
                        <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                          {q.totalAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Status (Approved Pill Button) */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded text-[10px] font-bold shadow-xs cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Approved</span>
                          </button>
                        </td>

                        {/* Actions (Eye + Dropdown) */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedQuote(q)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="View Quotation"
                          >
                            <Eye className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <div>Showing 1 to 8 of 237 entries</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-semibold bg-[#008080] text-white cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  3
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  4
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  5
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ORDERS TAB (Exact Cezcon CRM Orders Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="flex-1 flex flex-col font-sans w-full">
          {/* 1. TOP SUB-TABS BOX BAR FOR ORDERS */}
          <div className="bg-white border-b border-[#E2E8F0] px-4 py-0 flex items-center justify-between shadow-xs sticky top-0 z-30 overflow-x-auto">
            <div className="flex items-stretch min-w-max border-l border-slate-200">
              {[
                { id: 'all', label: 'All' },
                { id: 'fitout', label: 'Fit Out' },
                { id: 'supply', label: 'Supply' },
                { id: 'installation', label: 'Installation' },
                { id: 'supply-install', label: 'Supply And Installation' },
                { id: 'spare-parts', label: 'Spare Part Sales' },
                { id: 'projects', label: 'Projects' },
                { id: 'warranty', label: 'Service – Under Warranty' },
                { id: 'on-call', label: 'Service – On Call' },
                { id: 'other', label: 'Other' },
                { id: 'overview', label: 'Overview', icon: true },
              ].map((tab) => {
                const isActive =
                  (orderFilterStatus === 'All' && tab.id === 'all') ||
                  orderFilterStatus === tab.label;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOrderFilterStatus(tab.id === 'all' ? 'All' : tab.label)}
                    className={cn(
                      'px-3.5 py-2.5 text-xs transition-colors cursor-pointer border-r border-slate-200 border-t-2 select-none flex items-center gap-1',
                      isActive
                        ? 'border-t-[#E11D48] bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'border-t-transparent bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal'
                    )}
                  >
                    {tab.icon && <span className="mr-1 text-xs">📊</span>}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="shrink-0 py-1.5 ml-3">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Order</span>
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            {orderFilterStatus === 'Overview' ? (
              /* ========================================================= */
              /* OVERVIEW SUB-VIEW (Exact Cezcon CRM Overview Layout)     */
              /* ========================================================= */
              <div className="space-y-3">
                {/* 1. TOP OVERVIEW FILTER CRITERIA CARD */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm p-4 shadow-xs text-xs">
                  <div className="flex flex-wrap items-end gap-3">
                    {/* Filter By */}
                    <div className="space-y-1 w-28">
                      <label className="text-slate-600 font-medium block">Filter By</label>
                      <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    {/* Month */}
                    <div className="space-y-1 w-44">
                      <label className="text-slate-600 font-medium block">Month</label>
                      <input
                        type="text"
                        defaultValue="Sep 2026"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 font-medium"
                      />
                    </div>

                    {/* Owner */}
                    <div className="space-y-1 w-48">
                      <label className="text-slate-600 font-medium block">Owner</label>
                      <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                        <option value="All Owners">All Owners</option>
                        <option value="Alex Rivera">Alex Rivera</option>
                        <option value="SUPER ADMIN">SUPER ADMIN</option>
                        <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                        <option value="COOL TECH">COOL TECH</option>
                      </select>
                    </div>

                    {/* Campaign */}
                    <div className="space-y-1 flex-1 min-w-[180px]">
                      <label className="text-slate-600 font-medium block">Campaign</label>
                      <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                        <option value="">Select Campaign</option>
                        <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                        <option value="Summer Cooling Promo 2026">Summer Cooling Promo 2026</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1 flex-1 min-w-[180px]">
                      <label className="text-slate-600 font-medium block">Tags</label>
                      <input
                        type="text"
                        placeholder="Select tags"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Load Button */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Load</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. OVERVIEW TABLE CARD */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
                  {/* Card Header */}
                  <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Order Overview by Business Opportunity and Order Type</span>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xs text-xs font-bold cursor-pointer shadow-xs transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-[#F8FAFC]">
                          <th className="p-3 font-bold text-slate-800 border-r border-slate-200">
                            Business Opportunity / Order Type
                          </th>
                          <th className="p-3 font-bold text-slate-800 text-right w-64">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        <tr className="bg-slate-50/50 font-bold text-slate-800">
                          <td className="p-3 border-r border-slate-200 font-bold">Total</td>
                          <td className="p-3 text-right font-bold text-slate-900">0 (0.00)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Navigation Arrows at bottom */}
                  <div className="p-2 border-t border-slate-200 bg-white flex items-center justify-between text-slate-400 text-xs">
                    <button type="button" className="hover:text-slate-600 p-1 cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button type="button" className="hover:text-slate-600 p-1 cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 2. TOP FILTER CRITERIA CARD */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm p-3 sm:p-4 shadow-xs space-y-3 text-xs">
                  {/* Mobile Filter Header Toggle Button */}
                  <div className="flex md:hidden items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowOrderFiltersMobile(!showOrderFiltersMobile)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filter Orders</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                          {showOrderFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
                        </span>
                      </div>
                      <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showOrderFiltersMobile ? 'rotate-180' : '')} />
                    </button>
                  </div>

                  <div className={cn('space-y-3', showOrderFiltersMobile ? 'block' : 'hidden md:block')}>
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Order Date</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="All Month & Year"
                            className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer absolute right-2.5 top-2" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Order Owner</label>
                        <select
                          value={filterOwner}
                          onChange={(e) => setFilterOwner(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="All">All Owners</option>
                          <option value="Alex Rivera">Alex Rivera</option>
                          <option value="SUPER ADMIN">SUPER ADMIN</option>
                          <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                          <option value="COOL TECH">COOL TECH</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Business Opportunity</label>
                        <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                          <option value="">Select</option>
                          <option value="Water Coolers">Water Coolers</option>
                          <option value="Industrial Coolers">Industrial Coolers</option>
                          <option value="HVAC Split AC">HVAC Split AC</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Campaign</label>
                        <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                          <option value="">Select Campaign</option>
                          <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                          <option value="Summer Cooling Promo 2026">Summer Cooling Promo 2026</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Customer</label>
                        <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                          <option value="">Select Customer</option>
                          <option value="INNOVO BUILD L.L.C">INNOVO BUILD L.L.C</option>
                          <option value="ZUBLIN CONSTRUCTION L.L.C">ZUBLIN CONSTRUCTION L.L.C</option>
                          <option value="SHAPOORJI PALLONJI MIDEAST">SHAPOORJI PALLONJI MIDEAST</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Tags</label>
                        <input
                          type="text"
                          placeholder="Select tags"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Order Status</label>
                        <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                          <option value="All">All</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="In Production">In Production</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Order Type</label>
                        <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                          <option value="All">All</option>
                          <option value="Supply">Supply</option>
                          <option value="Installation">Installation</option>
                          <option value="Supply & Installation">Supply & Installation</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Invoice Status</label>
                        <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                          <option value="All">All</option>
                          <option value="Invoiced">Invoiced</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. MAIN ORDERS DATA TABLE SECTION */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
                  {/* Header with Title and + ORDER Button */}
                  <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-slate-500" /> Order
                    </h2>

                    <button
                      type="button"
                      onClick={() => setIsCreateOrderModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ORDER</span>
                    </button>
                  </div>

                  {/* Table Controls (Rows and Search) */}
                  <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>Shows</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span>Rows</span>
                    </div>

                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search Order"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                    </div>
                  </div>

                  {/* Native Mobile Orders Cards (Phone Viewports) */}
                  <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                    {orders
                      .filter((o) => {
                        if (
                          orderFilterStatus !== 'All' &&
                          o.category !== orderFilterStatus &&
                          o.status !== orderFilterStatus
                        )
                          return false;
                        if (orderSearch) {
                          const s = orderSearch.toLowerCase();
                          return (
                            o.orderNumber.toLowerCase().includes(s) ||
                            o.customer.toLowerCase().includes(s) ||
                            (o.subject || '').toLowerCase().includes(s) ||
                            (o.opportunityRef || '').toLowerCase().includes(s)
                          );
                        }
                        return true;
                      })
                      .map((o) => (
                        <div key={o.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="space-y-0.5">
                              <div className="text-[#2563EB] font-bold text-xs flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(o)}
                                  className="hover:underline"
                                >
                                  {o.orderNumber}
                                </button>
                                {o.opportunityRef && (
                                  <>
                                    <span className="text-slate-400">/</span>
                                    <span className="text-slate-600 font-medium text-[11px]">
                                      {o.opportunityRef}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">{o.orderDate}</div>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              {o.status || 'Confirmed'}
                            </span>
                          </div>

                          <div className="font-bold text-slate-800 uppercase text-[11px]">
                            {o.subject}
                          </div>

                          <div className="bg-slate-50 rounded p-2 border border-slate-100 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                              <span className="text-[#2563EB] font-bold text-xs">{o.customer}</span>
                            </div>
                            {o.contactPerson && (
                              <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{o.contactPerson}</span>
                              </div>
                            )}
                            {o.phone && (
                              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>{o.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100 text-center">
                            <div>
                              <div className="text-[10px] text-slate-500">Amount</div>
                              <div className="font-semibold text-slate-700">
                                {o.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500">VAT</div>
                              <div className="font-semibold text-slate-600">
                                {o.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500">Total</div>
                              <div className="font-bold text-slate-900">
                                {o.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <img
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                                  alt="Alex Rivera"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[11px] text-slate-600 font-medium">Alex Rivera</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Order</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Cezcon Orders Table (Desktop Viewports) */}
                  <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                          <th className="p-2.5 w-12 text-center text-slate-600">SL.No</th>
                          <th className="p-2.5 w-16 text-slate-600">Owner</th>
                          <th className="p-2.5 w-32 text-slate-600">
                            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                              <span>Order Date</span>
                              <ChevronDown className="w-3 h-3 text-blue-600" />
                            </div>
                          </th>
                          <th className="p-2.5 min-w-[220px] text-slate-600">Order Details</th>
                          <th className="p-2.5 min-w-[240px] text-slate-600">Customer</th>
                          <th className="p-2.5 w-24 text-slate-600">Order Status</th>
                          <th className="p-2.5 w-24 text-right text-slate-600">Amount</th>
                          <th className="p-2.5 w-20 text-right text-slate-600">VAT</th>
                          <th className="p-2.5 w-24 text-right text-slate-600">Total</th>
                          <th className="p-2.5 w-28 text-right text-slate-600">Profit</th>
                          <th className="p-2.5 w-24 text-right text-slate-600">Receivable</th>
                          <th className="p-2.5 w-20 text-center text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {orders
                          .filter((o) => {
                            if (
                              orderFilterStatus !== 'All' &&
                              o.category !== orderFilterStatus &&
                              o.status !== orderFilterStatus
                            )
                              return false;
                            if (orderSearch) {
                              const s = orderSearch.toLowerCase();
                              return (
                                o.orderNumber.toLowerCase().includes(s) ||
                                o.customer.toLowerCase().includes(s) ||
                                (o.subject || '').toLowerCase().includes(s) ||
                                (o.opportunityRef || '').toLowerCase().includes(s)
                              );
                            }
                            return true;
                          })
                          .map((o) => (
                            <tr key={o.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                              {/* SL.No */}
                              <td className="p-2.5 text-center text-slate-600 font-medium">
                                {o.slNo}
                              </td>

                              {/* Owner Avatar */}
                              <td className="p-2.5">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                  <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                                    alt="Alex Rivera"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>

                              {/* Order Date */}
                              <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                                {o.orderDate}
                              </td>

                              {/* Order Details */}
                              <td className="p-2.5">
                                <div className="space-y-0.5">
                                  <div className="text-[#2563EB] font-bold text-xs flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrder(o)}
                                      className="hover:underline"
                                    >
                                      {o.orderNumber}
                                    </button>
                                    {o.opportunityRef && (
                                      <>
                                        <span className="text-slate-400">/</span>
                                        <span className="text-slate-600 font-medium">
                                          {o.opportunityRef}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-800 uppercase text-[11px]">
                                      {o.subject}
                                    </span>
                                    <Info
                                      className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0"
                                      onClick={() => setSelectedOrder(o)}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Customer */}
                              <td className="p-2.5">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                                    <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                                      {o.customer}
                                    </span>
                                    <Info className="w-3 h-3 text-blue-500 cursor-pointer shrink-0" />
                                  </div>

                                  {o.contactPerson && (
                                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                      <User className="w-3 h-3 text-slate-400" />
                                      <span>{o.contactPerson}</span>
                                      <Info className="w-2.5 h-2.5 text-blue-400 cursor-pointer" />
                                    </div>
                                  )}

                                  {o.phone && (
                                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                      <span>{o.phone}</span>
                                    </div>
                                  )}

                                  {o.email && (
                                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                      ✉️ {o.email}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Order Status */}
                              <td className="p-2.5 text-slate-400">
                                {o.status === 'Confirmed' ? '—' : o.status}
                              </td>

                              {/* Amount */}
                              <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                                {o.amount.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>

                              {/* VAT */}
                              <td className="p-2.5 text-right font-medium text-slate-600 whitespace-nowrap">
                                {o.vatAmount.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>

                              {/* Total */}
                              <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                {o.totalAmount.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>

                              {/* Profit */}
                              <td className="p-2.5 text-right font-bold text-[#16A34A] whitespace-nowrap">
                                {(o.profit || o.amount).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{' '}
                                <span className="text-[10px] font-normal text-slate-600">(100%)</span>
                              </td>

                              {/* Receivable */}
                              <td className="p-2.5 text-right font-bold text-[#E11D48] whitespace-nowrap">
                                {(o.receivable || o.totalAmount).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>

                              {/* Actions (Eye + Dropdown) */}
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(o)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                                  title="View Order"
                                >
                                  <Eye className="w-3 h-3" />
                                  <ChevronDown className="w-2.5 h-2.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer / Pagination */}
                  <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                    <div>Showing 1 to 10 of 2,695 entries</div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded font-semibold bg-[#008080] text-white cursor-pointer"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        4
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        5
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: PROFORMA INVOICE TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* VIEW 4: PROFORMA INVOICE TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'proforma' && (
        <div className="flex-1 p-3 sm:p-4 space-y-3 w-full font-sans">
          {/* TOP FILTER CRITERIA CARD */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-3 sm:p-4 shadow-xs space-y-3 text-xs">
            {/* Mobile Filter Header Toggle Button */}
            <div className="flex md:hidden items-center justify-between">
              <button
                type="button"
                onClick={() => setShowProformaFiltersMobile(!showProformaFiltersMobile)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
              >
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Proforma Invoices</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                    {showProformaFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showProformaFiltersMobile ? 'rotate-180' : '')} />
              </button>
            </div>

            <div className={cn('space-y-3', showProformaFiltersMobile ? 'block' : 'hidden md:block')}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Select Owner</label>
                  <select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Owners</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                    <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                    <option value="COOL TECH">COOL TECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Proforma Invoice Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="All Month & Year"
                      className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer absolute right-2.5 top-2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Customer</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Customer</option>
                    <option value="Brightlight">Brightlight</option>
                    <option value="SMART GROUP OF CAPANIES">SMART GROUP OF CAPANIES</option>
                    <option value="DESERT MAN TRANSPORTING">DESERT MAN TRANSPORTING</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Opportunity</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Opportunity</option>
                    <option value="EQ 2 Supply of AC and Water Cooler">EQ 2 Supply of AC and Water Cooler</option>
                    <option value="WATER COOLERS">WATER COOLERS</option>
                    <option value="WATER DISPENSER">WATER DISPENSER</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Proforma Invoice Type</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Invoice Type</option>
                    <option value="advance">Advance Proforma</option>
                    <option value="interim">Interim Payment</option>
                    <option value="final">Final Balance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Product/Service</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                    <option value="">Select Product/Service</option>
                    <option value="AC Units">AC Units</option>
                    <option value="Water Cooler">Water Cooler</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN PROFORMA INVOICE TABLE SECTION */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
            {/* Header with Title and + PROFORMA INVOICE Button */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ReceiptIcon className="w-4 h-4 text-slate-500" /> Proforma Invoice
              </h2>

              <button
                type="button"
                onClick={() => setIsCreateProformaModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>PROFORMA INVOICE</span>
              </button>
            </div>

            {/* Table Controls */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={proformaSearch}
                  onChange={(e) => setProformaSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            {/* Native Mobile Proforma Cards (Phone Viewports) */}
            <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
              {proformas
                .filter((p) => {
                  if (proformaSearch) {
                    const s = proformaSearch.toLowerCase();
                    return (
                      p.piNumber.toLowerCase().includes(s) ||
                      p.customer.toLowerCase().includes(s) ||
                      (p.opportunityTitle || '').toLowerCase().includes(s) ||
                      (p.quotationRef || '').toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
                .map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                          📄
                        </span>
                        <span className="text-[#2563EB] font-bold text-xs">
                          {p.piNumber}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{p.issueDate}</span>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-800">
                        {p.opportunityTitle || 'EQ 2 Supply of AC and Water Cooler'}
                      </div>
                      {p.quotationRef && (
                        <div className="text-[10px] text-blue-600 mt-0.5 font-medium">
                          Quotation: {p.quotationRef}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded p-2 border border-slate-100">
                      <div className="text-slate-500 text-[10px]">Customer</div>
                      <div className="text-[#2563EB] font-bold text-xs">{p.customer}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Amount</div>
                        <div className="font-semibold text-slate-700">
                          {p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">VAT</div>
                        <div className="font-semibold text-slate-600">
                          {p.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Total</div>
                        <div className="font-bold text-slate-900">
                          {p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                            alt="Alex Rivera"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">Alex Rivera</span>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Table (Desktop Viewports) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="p-2.5 w-12 text-center text-slate-600">SL.No</th>
                    <th className="p-2.5 min-w-[130px] text-slate-600">Proforma Invoice</th>
                    <th className="p-2.5 w-28 text-slate-600">Date</th>
                    <th className="p-2.5 w-16 text-slate-600">Owner</th>
                    <th className="p-2.5 min-w-[140px] text-slate-600">Customer</th>
                    <th className="p-2.5 min-w-[240px] text-slate-600">Opportunity</th>
                    <th className="p-2.5 w-24 text-slate-600">Quotation</th>
                    <th className="p-2.5 w-28 text-right text-slate-600">Amount</th>
                    <th className="p-2.5 w-20 text-right text-slate-600">VAT</th>
                    <th className="p-2.5 w-28 text-right text-slate-600">Total</th>
                    <th className="p-2.5 w-20 text-center text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {proformas
                    .filter((p) => {
                      if (proformaSearch) {
                        const s = proformaSearch.toLowerCase();
                        return (
                          p.piNumber.toLowerCase().includes(s) ||
                          p.customer.toLowerCase().includes(s) ||
                          (p.opportunityTitle || '').toLowerCase().includes(s) ||
                          (p.quotationRef || '').toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                        {/* SL.No */}
                        <td className="p-2.5 text-center text-slate-600 font-medium">{p.slNo}</td>

                        {/* Proforma Invoice Link */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                              📄
                            </span>
                            <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                              {p.piNumber}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                          {p.issueDate}
                        </td>

                        {/* Owner */}
                        <td className="p-2.5">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                              alt="Alex Rivera"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                              {p.customer}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </td>

                        {/* Opportunity */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#2563EB] font-medium text-xs hover:underline cursor-pointer">
                              {p.opportunityTitle || 'EQ 2 Supply of AC and Water Cooler'}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </td>

                        {/* Quotation */}
                        <td className="p-2.5">
                          <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                            {p.quotationRef || '—'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                          {p.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* VAT */}
                        <td className="p-2.5 text-right font-medium text-slate-600 whitespace-nowrap">
                          {p.vatAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Total */}
                        <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                          {p.totalAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="View Proforma Invoice"
                          >
                            <Eye className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <div>Showing 1 to {proformas.length} of {proformas.length} entries</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-semibold bg-[#008080] text-white cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: INVOICE TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* VIEW 5: INVOICE TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'invoice' && (
        <div className="flex-1 p-3 sm:p-4 space-y-3 w-full font-sans">
          {/* TOP FILTER CARD WITH SUB-TABS */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
            {/* Sub-tabs inside Card Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-3 pt-2 bg-[#FAFAFA]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setInvoiceSubTab('invoice')}
                  className={cn(
                    'px-3 sm:px-4 py-2 text-xs font-semibold flex items-center gap-2 border-t-2 transition cursor-pointer',
                    invoiceSubTab === 'invoice'
                      ? 'border-[#E11D48] text-slate-900 bg-white border-l border-r border-slate-200 -mb-px rounded-t'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceSubTab('followup')}
                  className={cn(
                    'px-3 sm:px-4 py-2 text-xs font-semibold flex items-center gap-2 border-t-2 transition cursor-pointer',
                    invoiceSubTab === 'followup'
                      ? 'border-[#E11D48] text-slate-900 bg-white border-l border-r border-slate-200 -mb-px rounded-t'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  <ReceiptIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payment Followup</span>
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setShowInvoiceFiltersMobile(!showInvoiceFiltersMobile)}
                className="flex md:hidden items-center gap-1 text-[11px] font-bold text-blue-600 px-2 py-1 rounded bg-blue-50 cursor-pointer mb-1.5"
              >
                <Filter className="w-3 h-3" />
                <span>{showInvoiceFiltersMobile ? 'Hide Filters' : 'Filter'}</span>
              </button>
            </div>

            {/* Filter Criteria Grid */}
            <div className={cn('p-3 sm:p-4 space-y-3 text-xs bg-white', showInvoiceFiltersMobile ? 'block' : 'hidden md:block')}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Select Owner</label>
                  <select
                    value={filterInvoiceOwner}
                    onChange={(e) => setFilterInvoiceOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Owners</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                    <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                    <option value="COOL TECH">COOL TECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Invoice Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="All Month & Year"
                      className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer absolute right-2.5 top-2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Customer</label>
                  <select
                    value={filterInvoiceCustomer}
                    onChange={(e) => setFilterInvoiceCustomer(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Customer</option>
                    <option value="OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN">OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN</option>
                    <option value="BURJEEL HOLDINGS">BURJEEL HOLDINGS</option>
                    <option value="YORK GENERAL CONTRACTING LLC">YORK GENERAL CONTRACTING LLC</option>
                    <option value="SAEED AL ZAABI GENERAL TRADING">SAEED AL ZAABI GENERAL TRADING</option>
                    <option value="APTIVE GENERAL TRADING">APTIVE GENERAL TRADING</option>
                    <option value="SPECTRA TECH TRADING LLC">SPECTRA TECH TRADING LLC</option>
                    <option value="REEM EMIRATES ALUMINIUM">REEM EMIRATES ALUMINIUM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Opportunity/Order</label>
                  <select
                    value={filterInvoiceOppOrder}
                    onChange={(e) => setFilterInvoiceOppOrder(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Opportunity/Order</option>
                    <option value="CTSO#3854">CTSO#3854 / SUPER GENERAL AC UNITS</option>
                    <option value="CTSO#3798">CTSO#3798 / CASETTE AC</option>
                    <option value="CTSO#3796">CTSO#3796 / INV-6654</option>
                    <option value="CTSO#3789">CTSO#3789 / SUPPLY OF COMPRESSOR</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Business Opportunity</label>
                  <select
                    value={filterInvoiceBizOpp}
                    onChange={(e) => setFilterInvoiceBizOpp(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select</option>
                    <option value="Water Coolers">Water Coolers</option>
                    <option value="HVAC">HVAC Services</option>
                    <option value="Split AC">Split AC Units</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Product/Service</label>
                  <select
                    value={filterInvoiceProductService}
                    onChange={(e) => setFilterInvoiceProductService(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Product/Service</option>
                    <option value="Split AC Units">Split AC Units</option>
                    <option value="Water Dispenser">Water Dispenser</option>
                    <option value="Compressor">Compressor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Payment Status</label>
                  <select
                    value={filterInvoicePaymentStatus}
                    onChange={(e) => setFilterInvoicePaymentStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Due">Due</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Invoice Type</label>
                  <select
                    value={filterInvoiceType}
                    onChange={(e) => setFilterInvoiceType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Invoice Type</option>
                    <option value="Tax Invoice">Tax Invoice</option>
                    <option value="Commercial">Commercial Invoice</option>
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Order Type</label>
                  <select
                    value={filterInvoiceOrderType}
                    onChange={(e) => setFilterInvoiceOrderType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Fit Out">Fit Out</option>
                    <option value="Supply">Supply</option>
                    <option value="Installation">Installation</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN INVOICE TABLE SECTION */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
            {/* Header with Title and + INVOICE Button */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> Invoice
              </h2>

              <button
                type="button"
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>INVOICE</span>
              </button>
            </div>

            {/* Table Controls */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search Invoice"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            {/* Native Mobile Invoices Cards (Phone Viewports) */}
            <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
              {invoices
                .filter((inv) => {
                  if (filterInvoicePaymentStatus !== 'All' && inv.status !== filterInvoicePaymentStatus) {
                    return false;
                  }
                  if (filterInvoiceCustomer && !inv.customer.toLowerCase().includes(filterInvoiceCustomer.toLowerCase())) {
                    return false;
                  }
                  if (invoiceSearch) {
                    const s = invoiceSearch.toLowerCase();
                    return (
                      inv.invoiceNumber.toLowerCase().includes(s) ||
                      inv.customer.toLowerCase().includes(s) ||
                      (inv.opportunityOrderRef || '').toLowerCase().includes(s) ||
                      (inv.contactPerson || '').toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
                .map((inv) => (
                  <div key={inv.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                            📄
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer text-left"
                          >
                            {inv.invoiceNumber}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">Date: {inv.issueDate}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B] text-white">
                        {inv.status}
                      </span>
                    </div>

                    {inv.opportunityOrderRef && (
                      <div className="text-[11px] font-medium text-slate-800">
                        {inv.opportunityOrderRef}
                      </div>
                    )}

                    <div className="bg-slate-50 rounded p-2 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                        <span className="text-[#2563EB] font-bold text-xs">{inv.customer}</span>
                      </div>
                      {inv.contactPerson && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{inv.contactPerson}</span>
                        </div>
                      )}
                      {inv.phone && (
                        <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          <span>{inv.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Amount</div>
                        <div className="font-semibold text-slate-700">
                          {inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Paid</div>
                        <div className="font-semibold text-slate-600">
                          {inv.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Balance</div>
                        <div className="font-bold text-[#E11D48]">
                          {inv.balanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={
                              inv.ownerAvatar ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={inv.owner || 'Alex Rivera'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">{inv.owner || 'Alex Rivera'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Table (Desktop Viewports) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="p-2.5 w-12 text-center text-slate-600">Sl No.</th>
                    <th className="p-2.5 w-28 text-slate-600">
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ChevronDown className="w-3 h-3 text-blue-500" />
                      </div>
                    </th>
                    <th className="p-2.5 w-14 text-slate-600">Owner</th>
                    <th className="p-2.5 min-w-[130px] text-slate-600">Invoice No.</th>
                    <th className="p-2.5 min-w-[240px] text-slate-600">Opportunity/Order</th>
                    <th className="p-2.5 min-w-[260px] text-slate-600">Customer</th>
                    <th className="p-2.5 w-28 text-slate-600">Next Followup</th>
                    <th className="p-2.5 w-24 text-right text-slate-600">Amount</th>
                    <th className="p-2.5 w-20 text-right text-slate-600">Paid</th>
                    <th className="p-2.5 w-24 text-right text-slate-600">Balance</th>
                    <th className="p-2.5 w-20 text-center text-slate-600">Status</th>
                    <th className="p-2.5 w-20 text-center text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {invoices
                    .filter((inv) => {
                      if (filterInvoicePaymentStatus !== 'All' && inv.status !== filterInvoicePaymentStatus) {
                        return false;
                      }
                      if (filterInvoiceCustomer && !inv.customer.toLowerCase().includes(filterInvoiceCustomer.toLowerCase())) {
                        return false;
                      }
                      if (invoiceSearch) {
                        const s = invoiceSearch.toLowerCase();
                        return (
                          inv.invoiceNumber.toLowerCase().includes(s) ||
                          inv.customer.toLowerCase().includes(s) ||
                          (inv.opportunityOrderRef || '').toLowerCase().includes(s) ||
                          (inv.contactPerson || '').toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                        {/* Sl No. */}
                        <td className="p-2.5 text-center text-slate-600 font-medium">
                          {inv.slNo}
                        </td>

                        {/* Date */}
                        <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                          {inv.issueDate}
                        </td>

                        {/* Owner Avatar */}
                        <td className="p-2.5">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            <img
                              src={
                                inv.ownerAvatar ||
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={inv.owner || 'Alex Rivera'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Invoice No. */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                              📄
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
                            >
                              {inv.invoiceNumber}
                            </button>
                            <Info
                              className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0"
                              onClick={() => setSelectedInvoice(inv)}
                            />
                          </div>
                        </td>

                        {/* Opportunity / Order */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-amber-500 shrink-0 text-xs">🔥</span>
                            <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                              {inv.opportunityOrderRef || '—'}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                              <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                                {inv.customer}
                              </span>
                              <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                            </div>

                            {inv.contactPerson && (
                              <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{inv.contactPerson}</span>
                                <Info className="w-2.5 h-2.5 text-blue-400 cursor-pointer shrink-0" />
                              </div>
                            )}

                            {inv.phone && (
                              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>{inv.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Next Followup */}
                        <td className="p-2.5 text-slate-400">
                          {inv.nextFollowup || '—'}
                        </td>

                        {/* Amount */}
                        <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                          {inv.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Paid */}
                        <td className="p-2.5 text-right font-medium text-slate-600 whitespace-nowrap">
                          {inv.paidAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Balance */}
                        <td className="p-2.5 text-right font-bold text-[#E11D48] whitespace-nowrap">
                          {inv.balanceAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Status */}
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B] text-white">
                            {inv.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="Action"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <div>Showing 1 to 10 of 484 entries</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &laquo;
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-semibold bg-[#008080] text-white cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  3
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  4
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  5
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: RECEIPT TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* VIEW 6: RECEIPT TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'receipt' && (
        <div className="flex-1 p-3 sm:p-4 space-y-3 w-full font-sans">
          {/* TOP FILTER CRITERIA CARD */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-3 sm:p-4 shadow-xs space-y-3 text-xs">
            {/* Mobile Filter Header Toggle Button */}
            <div className="flex md:hidden items-center justify-between">
              <button
                type="button"
                onClick={() => setShowReceiptFiltersMobile(!showReceiptFiltersMobile)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
              >
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Receipts</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                    {showReceiptFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showReceiptFiltersMobile ? 'rotate-180' : '')} />
              </button>
            </div>

            <div className={cn('space-y-3', showReceiptFiltersMobile ? 'block' : 'hidden md:block')}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Created By</label>
                  <select
                    value={filterReceiptCreatedBy}
                    onChange={(e) => setFilterReceiptCreatedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                    <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                    <option value="COOL TECH">COOL TECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Receipt Type</label>
                  <select
                    value={filterReceiptType}
                    onChange={(e) => setFilterReceiptType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Against Invoice">Against Invoice</option>
                    <option value="Advance">Advance</option>
                    <option value="PDC Clearance">PDC Clearance</option>
                    <option value="Settlement">Settlement</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Receipt Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="01-09-2026 - 30-09-2026"
                      className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 font-medium"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer absolute right-2.5 top-2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Customer</label>
                  <select
                    value={filterReceiptCustomer}
                    onChange={(e) => setFilterReceiptCustomer(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Customer</option>
                    <option value="OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN">OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN</option>
                    <option value="BURJEEL HOLDINGS">BURJEEL HOLDINGS</option>
                    <option value="EMAAR HOSPITALITY GROUP">EMAAR HOSPITALITY GROUP</option>
                    <option value="NATIONAL INNOVATIVE GENERAL MAINTENANCE L.L.C.">NATIONAL INNOVATIVE GENERAL MAINTENANCE L.L.C.</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Receipt Tags</label>
                  <input
                    type="text"
                    placeholder="Select tags"
                    value={filterReceiptTags}
                    onChange={(e) => setFilterReceiptTags(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MAIN RECEIPT TABLE SECTION */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
            {/* Header with Title and + RECEIPT Button */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ReceiptIcon className="w-4 h-4 text-slate-500" /> Receipt
              </h2>

              <button
                type="button"
                onClick={() => setIsCreateReceiptModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>RECEIPT</span>
              </button>
            </div>

            {/* Table Controls */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search Receipt"
                  value={receiptSearch}
                  onChange={(e) => setReceiptSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            {/* Native Mobile Receipts Cards (Phone Viewports) */}
            <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
              {receipts
                .filter((r) => {
                  if (filterReceiptCreatedBy !== 'All' && r.createdBy !== filterReceiptCreatedBy) {
                    return false;
                  }
                  if (filterReceiptType !== 'All' && r.receiptType !== filterReceiptType) {
                    return false;
                  }
                  if (filterReceiptCustomer && !r.customer.toLowerCase().includes(filterReceiptCustomer.toLowerCase())) {
                    return false;
                  }
                  if (filterReceiptTags && !r.tags?.some((t) => t.toLowerCase().includes(filterReceiptTags.toLowerCase()))) {
                    return false;
                  }
                  if (receiptSearch) {
                    const s = receiptSearch.toLowerCase();
                    return (
                      r.receiptNumber.toLowerCase().includes(s) ||
                      r.customer.toLowerCase().includes(s) ||
                      (r.invoiceRef || '').toLowerCase().includes(s) ||
                      (r.contactPerson || '').toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
                .map((r) => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                            📄
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer text-left"
                          >
                            {r.receiptNumber}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">Date: {r.receiptDate}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {r.receiptType || 'Against Invoice'}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded p-2 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                        <span className="text-[#2563EB] font-bold text-xs">{r.customer}</span>
                      </div>
                      {r.contactPerson && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{r.contactPerson}</span>
                        </div>
                      )}
                      {r.phone && (
                        <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          <span>{r.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Payment Method</span>
                        <span className="font-medium text-slate-700">{r.paymentMethod || 'Bank Transfer'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Amount</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={
                              r.createdByAvatar ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={r.createdBy || 'Alex Rivera'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">{r.createdBy || 'Alex Rivera'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Table (Desktop Viewports) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="p-2.5 w-12 text-center text-slate-600">Sl No.</th>
                    <th className="p-2.5 w-28 text-slate-600">Date</th>
                    <th className="p-2.5 min-w-[140px] text-slate-600">Created By</th>
                    <th className="p-2.5 min-w-[140px] text-slate-600">Receipt No.</th>
                    <th className="p-2.5 min-w-[260px] text-slate-600">Customer</th>
                    <th className="p-2.5 w-28 text-slate-600">Type</th>
                    <th className="p-2.5 w-28 text-slate-600">Tags</th>
                    <th className="p-2.5 w-28 text-right text-slate-600">Amount</th>
                    <th className="p-2.5 w-20 text-center text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {(() => {
                    const filtered = receipts.filter((r) => {
                      if (filterReceiptCreatedBy !== 'All' && r.createdBy !== filterReceiptCreatedBy) {
                        return false;
                      }
                      if (filterReceiptType !== 'All' && r.receiptType !== filterReceiptType) {
                        return false;
                      }
                      if (filterReceiptCustomer && !r.customer.toLowerCase().includes(filterReceiptCustomer.toLowerCase())) {
                        return false;
                      }
                      if (filterReceiptTags && !r.tags?.some((t) => t.toLowerCase().includes(filterReceiptTags.toLowerCase()))) {
                        return false;
                      }
                      if (receiptSearch) {
                        const s = receiptSearch.toLowerCase();
                        return (
                          r.receiptNumber.toLowerCase().includes(s) ||
                          r.customer.toLowerCase().includes(s) ||
                          (r.invoiceRef || '').toLowerCase().includes(s) ||
                          (r.contactPerson || '').toLowerCase().includes(s)
                        );
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-slate-500 text-xs">
                            No records found.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                        {/* Sl No. */}
                        <td className="p-2.5 text-center text-slate-600 font-medium">
                          {r.slNo}
                        </td>

                        {/* Date */}
                        <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                          {r.receiptDate}
                        </td>

                        {/* Created By */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                              <img
                                src={
                                  r.createdByAvatar ||
                                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                                }
                                alt={r.createdBy || 'Alex Rivera'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-slate-800 font-medium text-xs">
                              {r.createdBy || 'Alex Rivera'}
                            </span>
                          </div>
                        </td>

                        {/* Receipt No. */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                              📄
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(r)}
                              className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
                            >
                              {r.receiptNumber}
                            </button>
                            <Info
                              className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0"
                              onClick={() => setSelectedReceipt(r)}
                            />
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                              <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                                {r.customer}
                              </span>
                              <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                            </div>

                            {r.contactPerson && (
                              <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{r.contactPerson}</span>
                                <Info className="w-2.5 h-2.5 text-blue-400 cursor-pointer shrink-0" />
                              </div>
                            )}

                            {r.phone && (
                              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>{r.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="p-2.5 text-slate-700 font-medium">
                          {r.receiptType || 'Against Invoice'}
                        </td>

                        {/* Tags */}
                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1">
                            {r.tags?.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                              >
                                {t}
                              </span>
                            )) || <span className="text-slate-400">—</span>}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                          {r.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Action */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="Action"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <div>Showing 1 to {receipts.length} of {receipts.length} entries</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &laquo;
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-semibold bg-[#008080] text-white cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 7: DELIVERY NOTE TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* VIEW 7: DELIVERY NOTE TAB (Exact Cezcon CRM Layout) */}
      {/* ========================================================================= */}
      {activeTab === 'delivery' && (
        <div className="flex-1 p-3 sm:p-4 space-y-3 w-full font-sans">
          {/* TOP FILTER CRITERIA CARD */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-3 sm:p-4 shadow-xs space-y-3 text-xs">
            {/* Mobile Filter Header Toggle Button */}
            <div className="flex md:hidden items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeliveryFiltersMobile(!showDeliveryFiltersMobile)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
              >
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Delivery Notes</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                    {showDeliveryFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
                  </span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showDeliveryFiltersMobile ? 'rotate-180' : '')} />
              </button>
            </div>

            <div className={cn('space-y-3', showDeliveryFiltersMobile ? 'block' : 'hidden md:block')}>
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Select Owner</label>
                  <select
                    value={filterDeliveryOwner}
                    onChange={(e) => setFilterDeliveryOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All Owners</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="SUPER ADMIN">SUPER ADMIN</option>
                    <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                    <option value="COOL TECH">COOL TECH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Order</label>
                  <select
                    value={filterDeliveryOrder}
                    onChange={(e) => setFilterDeliveryOrder(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Order</option>
                    <option value="CTSO#2653">CTSO#2653 | AIR COOLER NOBEL</option>
                    <option value="CTSO#2697">CTSO#2697 | POD-KM1-2025-3135</option>
                    <option value="CTSO#2661">CTSO#2661 | NIKAI AC 1.5 TON</option>
                    <option value="CTSO#2700">CTSO#2700 | 005250125004484</option>
                    <option value="CTSO#2417">CTSO#2417 | 65USG WATER COOLER</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Invoice</label>
                  <select
                    value={filterDeliveryInvoice}
                    onChange={(e) => setFilterDeliveryInvoice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Invoice</option>
                    <option value="CTINV#1630">CTINV#1630</option>
                    <option value="CTINV#1627">CTINV#1627</option>
                    <option value="CTINV#1625">CTINV#1625</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Type</label>
                  <select
                    value={filterDeliveryType}
                    onChange={(e) => setFilterDeliveryType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Customer DN">Customer DN</option>
                    <option value="Vendor DN">Vendor DN</option>
                    <option value="Internal Transfer">Internal Transfer</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Cost Update</label>
                  <select
                    value={filterDeliveryCostUpdate}
                    onChange={(e) => setFilterDeliveryCostUpdate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All">All</option>
                    <option value="Updated">Updated</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN DELIVERY NOTE TABLE SECTION */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
            {/* Header with Title and + DELIVERY NOTE Button */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-500" /> Delivery Note
              </h2>

              <button
                type="button"
                onClick={() => setIsCreateDeliveryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>DELIVERY NOTE</span>
              </button>
            </div>

            {/* Table Controls */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search Delivery Note"
                  value={deliverySearch}
                  onChange={(e) => setDeliverySearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              </div>
            </div>

            {/* Native Mobile Delivery Note Cards (Phone Viewports) */}
            <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
              {deliveryNotes
                .filter((dn) => {
                  if (filterDeliveryOwner !== 'All' && dn.owner !== filterDeliveryOwner) {
                    return false;
                  }
                  if (filterDeliveryType !== 'All' && dn.dnType !== filterDeliveryType) {
                    return false;
                  }
                  if (deliverySearch) {
                    const s = deliverySearch.toLowerCase();
                    return (
                      dn.deliveryNoteNumber.toLowerCase().includes(s) ||
                      dn.customer.toLowerCase().includes(s) ||
                      (dn.orderRef || '').toLowerCase().includes(s) ||
                      (dn.orderDescription || '').toLowerCase().includes(s) ||
                      (dn.receivedBy || '').toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
                .map((dn) => (
                  <div key={dn.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] font-bold shrink-0">
                            🚚
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedDeliveryNote(dn)}
                            className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer text-left"
                          >
                            {dn.deliveryNoteNumber}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">Date: {dn.dispatchDate}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#22C55E] text-white">
                        {dn.dnType || 'Customer DN'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-[#2563EB]">
                        {dn.orderRef} {dn.orderDescription ? `| ${dn.orderDescription}` : ''}
                      </div>
                      {dn.invoiceRef && dn.invoiceRef !== '—' && (
                        <div className="text-[10px] text-slate-500">
                          Invoice Ref: <span className="font-medium text-slate-700">{dn.invoiceRef}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded p-2 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                        <span className="text-[#2563EB] font-bold text-xs">{dn.customer}</span>
                      </div>
                      {dn.receivedBy && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Received by: {dn.receivedBy}</span>
                        </div>
                      )}
                      {dn.receivedPhone && (
                        <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          <span>{dn.receivedPhone}</span>
                        </div>
                      )}
                      {dn.location && (
                        <div className="text-[10px] text-slate-500">
                          📍 {dn.location}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={
                              dn.ownerAvatar ||
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={dn.owner || 'Alex Rivera'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">{dn.owner || 'Alex Rivera'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDeliveryNote(dn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Table (Desktop Viewports) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="p-2.5 w-12 text-center text-slate-600">SL.No</th>
                    <th className="p-2.5 w-12 text-center text-slate-600">Owner</th>
                    <th className="p-2.5 w-24 text-slate-600">Number</th>
                    <th className="p-2.5 w-24 text-slate-600 whitespace-nowrap">Date</th>
                    <th className="p-2.5 min-w-[170px] max-w-[210px] text-slate-600">Customer</th>
                    <th className="p-2.5 min-w-[180px] max-w-[220px] text-slate-600">Order</th>
                    <th className="p-2.5 w-16 text-center text-slate-600">Invoice</th>
                    <th className="p-2.5 w-24 text-center text-slate-600">Type</th>
                    <th className="p-2.5 min-w-[130px] max-w-[170px] text-slate-600">Location</th>
                    <th className="p-2.5 min-w-[170px] max-w-[210px] text-slate-600">Received By</th>
                    <th className="p-2.5 w-12 text-center text-slate-600">Cost</th>
                    <th className="p-2.5 w-20 text-center text-slate-600 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {deliveryNotes
                    .filter((dn) => {
                      if (filterDeliveryOwner !== 'All' && dn.owner !== filterDeliveryOwner) {
                        return false;
                      }
                      if (filterDeliveryType !== 'All' && dn.dnType !== filterDeliveryType) {
                        return false;
                      }
                      if (deliverySearch) {
                        const s = deliverySearch.toLowerCase();
                        return (
                          dn.deliveryNoteNumber.toLowerCase().includes(s) ||
                          dn.customer.toLowerCase().includes(s) ||
                          (dn.orderRef || '').toLowerCase().includes(s) ||
                          (dn.orderDescription || '').toLowerCase().includes(s) ||
                          (dn.receivedBy || '').toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map((dn) => (
                      <tr key={dn.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                        {/* SL.No */}
                        <td className="p-2.5 text-center text-slate-600 font-medium">
                          {dn.slNo}
                        </td>

                        {/* Owner Avatar */}
                        <td className="p-2.5 text-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 inline-block">
                            <img
                              src={
                                dn.ownerAvatar ||
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={dn.owner || 'Alex Rivera'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Number */}
                        <td className="p-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDeliveryNote(dn)}
                            className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
                          >
                            {dn.deliveryNoteNumber}
                          </button>
                        </td>

                        {/* Date */}
                        <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                          {dn.dispatchDate}
                        </td>

                        {/* Customer */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                              {dn.customer}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </td>

                        {/* Order */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#2563EB] font-medium text-xs hover:underline cursor-pointer">
                              {dn.orderRef} {dn.orderDescription ? `| ${dn.orderDescription}` : ''}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </td>

                        {/* Invoice */}
                        <td className="p-2.5 text-slate-400 text-center">
                          {dn.invoiceRef || '—'}
                        </td>

                        {/* Type */}
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#22C55E] text-white whitespace-nowrap inline-block">
                            {dn.dnType || 'Customer DN'}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="p-2.5 text-slate-600 text-[11px]">
                          {dn.location ? (
                            <div className="flex items-center gap-1">
                              <span>{dn.location}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Received By */}
                        <td className="p-2.5">
                          <div className="space-y-0.5">
                            <div className="text-slate-800 font-medium text-xs">
                              {dn.receivedBy || dn.customer}
                            </div>
                            {dn.receivedPhone && (
                              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>{dn.receivedPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Cost */}
                        <td className="p-2.5 text-center">
                          <Check className="w-4 h-4 text-[#16A34A] mx-auto stroke-[3]" />
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center pr-3">
                          <button
                            type="button"
                            onClick={() => setSelectedDeliveryNote(dn)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="Actions"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <div>Showing 1 to {deliveryNotes.length} of 36 entries</div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &laquo;
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-semibold bg-[#008080] text-white cursor-pointer"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  3
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  4
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE QUOTATION */}
      <Modal
        isOpen={isCreateQuoteModalOpen}
        onClose={() => setIsCreateQuoteModalOpen(false)}
        title="Create New Commercial Quotation"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Quotation Number</label>
              <input
                type="text"
                value={quoteFormData.quotationNumber}
                disabled
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-slate-100 text-slate-600 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Opportunity Code</label>
              <input
                type="text"
                value={quoteFormData.opportunityCode}
                onChange={(e) => setQuoteFormData({ ...quoteFormData, opportunityCode: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. SMART GROUP OF COMPANIES"
                value={quoteFormData.customer}
                onChange={(e) => setQuoteFormData({ ...quoteFormData, customer: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Ms. SUSHMITA"
                value={quoteFormData.contactPerson}
                onChange={(e) => setQuoteFormData({ ...quoteFormData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Subject / Specification *</label>
            <input
              type="text"
              required
              placeholder="e.g. Supply & Installation of 500L Industrial Water Coolers"
              value={quoteFormData.subject}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, subject: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subtotal (AED) *</label>
              <input
                type="number"
                required
                value={quoteFormData.subtotal}
                onChange={(e) => {
                  const sub = Number(e.target.value);
                  setQuoteFormData({
                    ...quoteFormData,
                    subtotal: sub,
                    vatAmount: sub * 0.05,
                    totalAmount: sub * 1.05,
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">VAT 5% (AED)</label>
              <input
                type="number"
                disabled
                value={quoteFormData.vatAmount}
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-slate-100 text-slate-600 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Grand Total (AED)</label>
              <input
                type="number"
                disabled
                value={quoteFormData.totalAmount}
                className="w-full px-3 py-1.5 border border-slate-300 rounded bg-slate-100 text-blue-700 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateQuoteModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-bold cursor-pointer shadow-xs"
            >
              Save Quotation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW QUOTATION DETAILS */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Quotation Preview: ${selectedQuote.quotationNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedQuote.quotationNumber}</h3>
                  <p className="text-slate-500">{selectedQuote.subject}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                  {selectedQuote.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-bold block">Customer Details</span>
                  <p className="font-bold text-slate-800">{selectedQuote.customer}</p>
                  <p className="text-slate-600">Contact: {selectedQuote.contactPerson}</p>
                  <p className="text-emerald-600 font-medium">{selectedQuote.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block">Financial Summary</span>
                  <p className="text-slate-600">Subtotal: AED {selectedQuote.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-slate-600">VAT (5%): AED {selectedQuote.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="font-bold text-slate-900 text-sm mt-1">
                    Grand Total: AED {selectedQuote.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: CREATE INVOICE */}
      <Modal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        title="Generate Tax Invoice (FTA Compliant)"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newInv: CrmInvoice = {
              id: 'inv-' + Date.now(),
              slNo: invoices.length + 1,
              invoiceNumber: invoiceFormData.invoiceNumber,
              opportunityOrderRef: invoiceFormData.opportunityOrderRef,
              customer: invoiceFormData.customer,
              contactPerson: invoiceFormData.contactPerson,
              phone: invoiceFormData.phone,
              owner: 'Alex Rivera',
              ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              issueDate: invoiceFormData.issueDate,
              amount: invoiceFormData.amount,
              paidAmount: invoiceFormData.paidAmount,
              balanceAmount: invoiceFormData.balanceAmount,
              status: invoiceFormData.status,
            };
            setInvoices([newInv, ...invoices]);
            setIsCreateInvoiceModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceFormData.invoiceNumber}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-blue-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Opportunity / Order Ref</label>
              <input
                type="text"
                value={invoiceFormData.opportunityOrderRef}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, opportunityOrderRef: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={invoiceFormData.customer}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customer: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={invoiceFormData.contactPerson}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                value={invoiceFormData.phone}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, phone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Invoice Amount (AED) *</label>
              <input
                type="number"
                required
                value={invoiceFormData.amount}
                onChange={(e) => {
                  const amt = Number(e.target.value);
                  setInvoiceFormData({
                    ...invoiceFormData,
                    amount: amt,
                    balanceAmount: amt - invoiceFormData.paidAmount,
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Status</label>
              <select
                value={invoiceFormData.status}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, status: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateInvoiceModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded font-bold cursor-pointer shadow-xs"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW INVOICE DETAILS */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice Preview: ${selectedInvoice.invoiceNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-blue-600">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-slate-600 font-medium">{selectedInvoice.opportunityOrderRef}</p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#F59E0B] text-white">
                  {selectedInvoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Customer Information</span>
                  <p className="font-bold text-slate-800">{selectedInvoice.customer}</p>
                  {selectedInvoice.contactPerson && (
                    <p className="text-slate-600">Contact: {selectedInvoice.contactPerson}</p>
                  )}
                  {selectedInvoice.phone && (
                    <p className="text-emerald-600 font-medium">{selectedInvoice.phone}</p>
                  )}
                  <p className="text-slate-500 mt-1">Issue Date: {selectedInvoice.issueDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block mb-1">Financial Breakdown</span>
                  <p className="text-slate-700">
                    Total Amount: AED{' '}
                    {selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-slate-600">
                    Paid: AED{' '}
                    {selectedInvoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="font-bold text-[#E11D48] text-sm mt-1">
                    Balance Due: AED{' '}
                    {selectedInvoice.balanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: CREATE RECEIPT */}
      <Modal
        isOpen={isCreateReceiptModalOpen}
        onClose={() => setIsCreateReceiptModalOpen(false)}
        title="Record Payment Receipt Voucher"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newRec: CrmReceipt = {
              id: 'rec-' + Date.now(),
              slNo: receipts.length + 1,
              receiptNumber: receiptFormData.receiptNumber,
              invoiceRef: receiptFormData.invoiceRef,
              customer: receiptFormData.customer,
              contactPerson: receiptFormData.contactPerson,
              phone: receiptFormData.phone,
              createdBy: 'Alex Rivera',
              createdByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              receiptType: receiptFormData.receiptType,
              tags: receiptFormData.tags ? [receiptFormData.tags] : ['Direct Transfer'],
              paymentMethod: receiptFormData.paymentMethod,
              receiptDate: receiptFormData.receiptDate,
              amount: receiptFormData.amount,
              referenceNumber: 'REF-' + Math.floor(100000 + Math.random() * 900000),
              status: receiptFormData.status,
            };
            setReceipts([newRec, ...receipts]);
            setIsCreateReceiptModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Receipt Number *</label>
              <input
                type="text"
                required
                value={receiptFormData.receiptNumber}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, receiptNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-blue-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Invoice / Reference *</label>
              <input
                type="text"
                required
                value={receiptFormData.invoiceRef}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, invoiceRef: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={receiptFormData.customer}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, customer: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={receiptFormData.contactPerson}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Receipt Type</label>
              <select
                value={receiptFormData.receiptType}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, receiptType: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="Against Invoice">Against Invoice</option>
                <option value="Advance">Advance</option>
                <option value="PDC Clearance">PDC Clearance</option>
                <option value="Settlement">Settlement</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={receiptFormData.paymentMethod}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, paymentMethod: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Amount (AED) *</label>
              <input
                type="number"
                required
                value={receiptFormData.amount}
                onChange={(e) => setReceiptFormData({ ...receiptFormData, amount: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateReceiptModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded font-bold cursor-pointer shadow-xs"
            >
              Save Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW RECEIPT DETAILS */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Receipt Voucher: ${selectedReceipt.receiptNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-blue-600">{selectedReceipt.receiptNumber}</h3>
                  <p className="text-slate-600 font-medium">Against: {selectedReceipt.invoiceRef || 'N/A'}</p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                  {selectedReceipt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Customer Details</span>
                  <p className="font-bold text-slate-800">{selectedReceipt.customer}</p>
                  {selectedReceipt.contactPerson && (
                    <p className="text-slate-600">Contact: {selectedReceipt.contactPerson}</p>
                  )}
                  {selectedReceipt.phone && (
                    <p className="text-emerald-600 font-medium">{selectedReceipt.phone}</p>
                  )}
                  <p className="text-slate-500 mt-1">Receipt Date: {selectedReceipt.receiptDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block mb-1">Payment Method & Amount</span>
                  <p className="text-slate-700">Method: {selectedReceipt.paymentMethod}</p>
                  <p className="text-slate-500">Ref: {selectedReceipt.referenceNumber}</p>
                  <p className="font-bold text-emerald-600 text-base mt-1">
                    AED {selectedReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 cursor-pointer"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: CREATE DELIVERY NOTE */}
      <Modal
        isOpen={isCreateDeliveryModalOpen}
        onClose={() => setIsCreateDeliveryModalOpen(false)}
        title="Create Delivery Note Voucher"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const newDn: CrmDeliveryNote = {
              id: 'dn-' + Date.now(),
              slNo: deliveryNotes.length + 1,
              deliveryNoteNumber: deliveryFormData.deliveryNoteNumber,
              orderRef: deliveryFormData.orderRef,
              orderDescription: deliveryFormData.orderDescription,
              customer: deliveryFormData.customer,
              invoiceRef: deliveryFormData.invoiceRef,
              dnType: deliveryFormData.dnType,
              location: deliveryFormData.location,
              receivedBy: deliveryFormData.receivedBy,
              receivedPhone: deliveryFormData.receivedPhone,
              owner: 'Alex Rivera',
              ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              dispatchDate: deliveryFormData.dispatchDate,
              costUpdated: deliveryFormData.costUpdated,
              status: 'Delivered',
            };
            setDeliveryNotes([newDn, ...deliveryNotes]);
            setIsCreateDeliveryModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DN Number *</label>
              <input
                type="text"
                required
                value={deliveryFormData.deliveryNoteNumber}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, deliveryNoteNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-bold text-blue-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Order Ref & Description *</label>
              <input
                type="text"
                required
                value={deliveryFormData.orderDescription}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, orderDescription: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer / Consignee *</label>
              <input
                type="text"
                required
                value={deliveryFormData.customer}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, customer: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Delivery Location</label>
              <input
                type="text"
                value={deliveryFormData.location}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, location: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Received By</label>
              <input
                type="text"
                value={deliveryFormData.receivedBy}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, receivedBy: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone</label>
              <input
                type="text"
                value={deliveryFormData.receivedPhone}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, receivedPhone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dispatch Date</label>
              <input
                type="text"
                value={deliveryFormData.dispatchDate}
                onChange={(e) => setDeliveryFormData({ ...deliveryFormData, dispatchDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateDeliveryModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded font-bold cursor-pointer shadow-xs"
            >
              Save Delivery Note
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW DELIVERY NOTE DETAILS */}
      {selectedDeliveryNote && !Array.isArray(selectedDeliveryNote) && (
        <Modal
          isOpen={!!selectedDeliveryNote}
          onClose={() => setSelectedDeliveryNote(null)}
          title={`Delivery Note: ${selectedDeliveryNote.deliveryNoteNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-blue-600">{selectedDeliveryNote.deliveryNoteNumber}</h3>
                  <p className="text-slate-600 font-medium">{selectedDeliveryNote.orderRef} | {selectedDeliveryNote.orderDescription}</p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#22C55E] text-white">
                  {selectedDeliveryNote.dnType || 'Customer DN'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Customer / Consignee</span>
                  <p className="font-bold text-slate-800">{selectedDeliveryNote.customer}</p>
                  <p className="text-slate-600">Location: {selectedDeliveryNote.location || '—'}</p>
                  <p className="text-slate-500 mt-1">Dispatch Date: {selectedDeliveryNote.dispatchDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block mb-1">Receiver Details</span>
                  <p className="text-slate-800 font-medium">{selectedDeliveryNote.receivedBy || selectedDeliveryNote.customer}</p>
                  {selectedDeliveryNote.receivedPhone && (
                    <p className="text-emerald-600 font-medium">{selectedDeliveryNote.receivedPhone}</p>
                  )}
                  <p className="text-slate-500 mt-1">Cost Updated: ✔ Confirmed</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDeliveryNote(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 cursor-pointer"
              >
                Close Delivery Note
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading pipeline workspace...
        </div>
      }
    >
      <SalesPipelineInner />
    </Suspense>
  );
}
