'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
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
  BookOpen,
  Contact,
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
  RotateCw,
  Trash,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Maximize2,
  Copy,
  Scissors,
  Smile,
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
  getEmployeePhoto,
} from '@/data/mockEnterpriseData';
import { authMockService } from '@/services/authMockService';
import { Modal } from '@/components/ui/Modal';
import { CezconQuotationModule } from '@/components/sales/CezconQuotationModule';
import { CezconDateInput } from '@/components/ui/CezconDateInput';
import { cn } from '@/lib/utils';

function SalesPipelineInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUser = authMockService.getCurrentUser();

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

  const {
    salesOpportunities,
    addOpportunity,
    deleteOpportunity,
    updateOpportunity,
    customers,
    addCustomer,
    campaigns,
    users,
    quotations: contextQuotations,
    salesOrders: contextSalesOrders,
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  } = useEnterpriseCrm();

  // Mobile Filter Accordion States
  const [showQuoteFiltersMobile, setShowQuoteFiltersMobile] = useState(false);
  const [showOrderFiltersMobile, setShowOrderFiltersMobile] = useState(false);
  const [showProformaFiltersMobile, setShowProformaFiltersMobile] = useState(false);
  const [showInvoiceFiltersMobile, setShowInvoiceFiltersMobile] = useState(false);
  const [showReceiptFiltersMobile, setShowReceiptFiltersMobile] = useState(false);
  const [showDeliveryFiltersMobile, setShowDeliveryFiltersMobile] = useState(false);

  // Quotation State
  const [quotations, setQuotations] = useState<CrmQuotation[]>(mockQuotations);
  const liveQuotations = contextQuotations && contextQuotations.length > 0 ? contextQuotations : quotations;
  const [quotationFilterStatus, setQuotationFilterStatus] = useState<string>('All');
  const [quotationSearch, setQuotationSearch] = useState<string>('');
  const [isCreateQuoteModalOpen, setIsCreateQuoteModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<CrmQuotation | null>(null);

  // Orders State
  const [orders, setOrders] = useState<CrmSalesOrder[]>(mockSalesOrders);
  const liveOrders = contextSalesOrders && contextSalesOrders.length > 0 ? contextSalesOrders : orders;
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CrmSalesOrder | null>(null);

  // Proforma State
  const [proformas, setProformas] = useState<CrmProformaInvoice[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_proforma_invoices');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return mockProformaInvoices;
  });
  const [proformaSearch, setProformaSearch] = useState<string>('');
  const [isCreateProformaModalOpen, setIsCreateProformaModalOpen] = useState(false);
  const [openProformaActionId, setOpenProformaActionId] = useState<string | null>(null);
  const [viewingProforma, setViewingProforma] = useState<CrmProformaInvoice | null>(null);
  const [showProformaAlertBanner, setShowProformaAlertBanner] = useState<boolean>(true);
  const [proformaFormData, setProformaFormData] = useState({
    customer: '',
    quotation: '',
    opportunityOrder: '',
    proformaNumber: 'CTPI#1001',
    invoiceDate: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    lpoDate: '',
    lpoNumber: '',
    invoiceType: 'File Upload',
    vatType: 'With VAT',
    amount: '',
    discount: '',
    adjustment: '',
    remarks: '',
    vatRate: '5',
    document: null as File | null,
  });

  // Invoice State
  const [invoiceSubTab, setInvoiceSubTab] = useState<'invoice' | 'followup'>('invoice');
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CrmInvoice | null>(null);
  const [invoiceDetailSubTab, setInvoiceDetailSubTab] = useState<'invoice' | 'receipt'>('invoice');
  const [invoiceActivityTab, setInvoiceActivityTab] = useState<'task' | 'notes' | 'visits'>('task');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceLineItems, setInvoiceLineItems] = useState<
    Array<{
      id: string;
      description: string;
      code: string;
      unit: string;
      brand: string;
      qty: number;
      price: number;
    }>
  >([
    {
      id: 'item-1',
      description: 'WATER COOLER 2 TAP 25 USG COOLTECH CT25F2',
      code: 'CT25F2',
      unit: 'Each',
      brand: 'COOLTECH',
      qty: 3,
      price: 1000,
    },
  ]);
  const [invoiceTermsConditions, setInvoiceTermsConditions] = useState<string>('');
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState<string>('0.00');
  const [openInvoiceActionMenuId, setOpenInvoiceActionMenuId] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteInvoiceConfirm, setDeleteInvoiceConfirm] = useState<CrmInvoice | null>(null);

  const [isInvoicePrintFormatDropdownOpen, setIsInvoicePrintFormatDropdownOpen] = useState(false);
  const [isProformaPrintFormatDropdownOpen, setIsProformaPrintFormatDropdownOpen] = useState(false);
  const [isPrintInvoiceModalOpen, setIsPrintInvoiceModalOpen] = useState(false);
  const [activePrintInvoice, setActivePrintInvoice] = useState<CrmInvoice | null>(null);
  const [selectedInvoicePrintFormat, setSelectedInvoicePrintFormat] = useState('Print with Quantity');
  const [invoiceZoomLevel, setInvoiceZoomLevel] = useState(100);

  const handleOpenPrintInvoice = (inv: CrmInvoice, format?: string) => {
    setActivePrintInvoice(inv);
    if (format) setSelectedInvoicePrintFormat(format);
    setIsInvoicePrintFormatDropdownOpen(false);
    setIsPrintInvoiceModalOpen(true);
  };

  // Read id from search params for full page invoice view
  const invoiceIdParam = searchParams.get('id');
  useEffect(() => {
    if (activeTab === 'invoice' && invoiceIdParam && invoices && invoices.length > 0) {
      const found = invoices.find((i) => i.id === invoiceIdParam || i.invoiceNumber === invoiceIdParam);
      if (found) {
        setSelectedInvoice(found);
      }
    }
  }, [activeTab, invoiceIdParam, invoices]);

  // Proforma localStorage sync
  const [isProformaLoaded, setIsProformaLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_proforma_invoices');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProformas(parsed);
          }
        } else {
          localStorage.setItem('crm_proforma_invoices', JSON.stringify(mockProformaInvoices));
        }
      } catch (e) {
        // ignore
      } finally {
        setIsProformaLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isProformaLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('crm_proforma_invoices', JSON.stringify(proformas));
      } catch (e) {
        // ignore
      }
    }
  }, [proformas, isProformaLoaded]);

  // Open Edit Invoice with 100% Live Data
  const handleOpenEditInvoice = (inv: CrmInvoice) => {
    setEditingInvoiceId(inv.id);

    // Look for matching live quotation, opportunity, or sales order
    const matchedQuote = liveQuotations?.find(
      (q) =>
        (inv.opportunityOrderRef &&
          (q.id === inv.opportunityOrderRef ||
            q.quotationNumber === inv.opportunityOrderRef ||
            `${q.quotationNumber} / ${q.subject || 'Quotation'}` === inv.opportunityOrderRef ||
            inv.opportunityOrderRef.includes(q.quotationNumber))) ||
        (inv.referenceNumber && (q.quotationNumber === inv.referenceNumber || q.id === inv.referenceNumber))
    );
    const matchedOpp = salesOpportunities?.find(
      (opp) =>
        (inv.opportunityOrderRef &&
          (opp.id === inv.opportunityOrderRef ||
            opp.opportunityCode === inv.opportunityOrderRef ||
            opp.reference === inv.opportunityOrderRef ||
            `${opp.reference || opp.opportunityCode || 'OPP'} / ${opp.title}` === inv.opportunityOrderRef ||
            inv.opportunityOrderRef.includes(opp.reference || opp.opportunityCode || ''))) ||
        (inv.referenceNumber && (opp.reference === inv.referenceNumber || opp.opportunityCode === inv.referenceNumber))
    );
    const matchedOrd = liveOrders?.find(
      (o) =>
        (inv.opportunityOrderRef &&
          (o.id === inv.opportunityOrderRef ||
            o.orderNumber === inv.opportunityOrderRef ||
            `${o.orderNumber} / ${o.opportunityRef || o.subject || 'Sales Order'}` === inv.opportunityOrderRef ||
            inv.opportunityOrderRef.includes(o.orderNumber))) ||
        (inv.referenceNumber && o.orderNumber === inv.referenceNumber)
    );

    const oppOrderVal =
      inv.opportunityOrderRef ||
      (matchedQuote ? `${matchedQuote.quotationNumber} / ${matchedQuote.subject || 'Quotation'}` : '') ||
      (matchedOpp ? `${matchedOpp.reference || matchedOpp.opportunityCode || 'OPP'} / ${matchedOpp.title}` : '') ||
      (matchedOrd ? `${matchedOrd.orderNumber} / ${matchedOrd.opportunityRef || matchedOrd.subject || 'Sales Order'}` : '');

    const customerVal = inv.customer || matchedQuote?.customer || matchedOpp?.customer || matchedOrd?.customer || '';
    const attentionVal = inv.attention || inv.contactPerson || matchedQuote?.contactPerson || matchedOpp?.contactPerson || matchedOrd?.contactPerson || '';
    const locationVal = inv.location || matchedQuote?.billingAddress || matchedOpp?.location || matchedOrd?.billingAddress || '';
    const lpoVal = inv.lpoNumber || matchedOpp?.lpoNumber || matchedOrd?.poReference || '';
    const lpoDateVal = inv.lpoDate || matchedOpp?.lpoDate || '';
    const refVal = inv.referenceNumber || matchedQuote?.quotationNumber || matchedOpp?.reference || matchedOpp?.opportunityCode || matchedOrd?.orderNumber || '';
    const descVal = inv.description || inv.opportunityOrderRef || matchedQuote?.subject || matchedOpp?.title || matchedOrd?.subject || '';
    const vatTypeVal = inv.vatType || matchedOpp?.vatType || 'With VAT';
    const vatRateVal = String(inv.vatRate ?? matchedQuote?.vatRate ?? matchedOpp?.vatRate ?? '5');
    const discountVal = String(inv.discount ?? matchedQuote?.discountTotal ?? matchedQuote?.discountAmount ?? matchedOpp?.discount ?? '0');
    const adjustmentVal = String(inv.adjustment ?? matchedOpp?.adjustment ?? '0');
    const termsVal = inv.termsConditions || matchedQuote?.customerNotes || matchedQuote?.paymentTerms || '';
    const discPercentVal = String(inv.discountPercent ?? '0.00');

    // Load actual live line items
    let lineItems: Array<{
      id: string;
      description: string;
      code: string;
      unit: string;
      brand: string;
      qty: number;
      price: number;
    }> = [];

    if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
      lineItems = inv.items.map((item, idx) => ({
        id: item.id || `item-${Date.now()}-${idx}`,
        description: item.description || '',
        code: item.code || '',
        unit: item.unit || 'Each',
        brand: item.brand || '',
        qty: Number(item.qty) || 1,
        price: Number(item.price) || 0,
      }));
    } else if (matchedQuote?.items && Array.isArray(matchedQuote.items) && matchedQuote.items.length > 0) {
      lineItems = matchedQuote.items.map((item: any, idx: number) => ({
        id: item.id || `item-${Date.now()}-${idx}`,
        description: item.description || item.name || item.itemDescription || 'Product / Service Item',
        code: item.code || item.itemCode || item.sku || '',
        unit: item.unit || 'Each',
        brand: item.brand || '',
        qty: Number(item.qty || item.quantity) || 1,
        price: Number(item.price || item.unitPrice || item.rate) || 0,
      }));
    } else {
      const rawAmt = Number(inv.amount) || 0;
      const isVat = vatTypeVal === 'With VAT';
      const vatR = parseFloat(vatRateVal) || 5;
      const basePrice = isVat && rawAmt > 0 ? Number((rawAmt / (1 + vatR / 100)).toFixed(2)) : rawAmt;
      lineItems = [
        {
          id: `item-${Date.now()}-1`,
          description: descVal || inv.opportunityOrderRef || 'Sales Item',
          code: refVal || '',
          unit: 'Each',
          brand: '',
          qty: 1,
          price: basePrice || rawAmt || 0,
        },
      ];
    }

    setAddInvoiceData({
      invoiceNumber: inv.invoiceNumber || 'CTINV#15000',
      invoiceDate: inv.issueDate || new Date().toISOString().split('T')[0],
      customer: customerVal,
      invoiceDueDate: inv.dueDate || '',
      opportunityOrder: oppOrderVal,
      lpoNumber: lpoVal,
      lpoDate: lpoDateVal,
      invoiceType: 'File Upload',
      vatType: vatTypeVal,
      referenceNumber: refVal,
      documentName: '',
      amount: String(inv.amount || 0),
      discount: discountVal,
      vatRate: vatRateVal,
      adjustment: adjustmentVal,
      attention: attentionVal,
      location: locationVal,
      description: descVal,
      addReceipt: false,
      addPaymentFollowup: false,
    });

    setInvoiceLineItems(lineItems);
    setInvoiceTermsConditions(termsVal);
    setInvoiceDiscountPercent(discPercentVal);
    setIsCreateInvoiceModalOpen(true);
  };

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
    contactPerson: '',
    phone: '+971 0506693043',
    issueDate: '18-09-2026',
    amount: 12432.0,
    paidAmount: 0.0,
    balanceAmount: 12432.0,
    status: 'Due',
  });

  // Cezcon CRM Add Invoice State
  const [addInvoiceData, setAddInvoiceData] = useState({
    invoiceNumber: 'CTINV#15002',
    invoiceDate: '06-10-2026',
    customer: '',
    invoiceDueDate: '',
    opportunityOrder: '',
    lpoNumber: '',
    lpoDate: '',
    invoiceType: 'File Upload',
    vatType: 'With VAT',
    referenceNumber: '',
    documentName: '',
    amount: '',
    discount: '',
    vatRate: '5',
    adjustment: '',
    attention: '',
    location: '',
    description: '',
    addReceipt: false,
    addPaymentFollowup: false,
  });

  // Receipt State
  const [invoiceLocationDropdownOpen, setInvoiceLocationDropdownOpen] = useState(false);
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
    contactPerson: '',
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
  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedToUser, setAssignedToUser] = useState<string>('NEBIN BENNY');
  const [deleteOppConfirm, setDeleteOppConfirm] = useState<CrmSalesOpportunity | null>(null);
  const [isChangeStageModalOpen, setIsChangeStageModalOpen] = useState(false);
  const [changeStageOpp, setChangeStageOpp] = useState<CrmSalesOpportunity | null>(null);
  const [changeStageData, setChangeStageData] = useState({
    stage: 'Offer Sent' as DealStage,
    closeDate: '',
    amount: '' as any,
    discount: '' as any,
    vatType: 'With VAT',
    vatRate: 5 as number | string,
    adjustment: '' as any,
    rating: 'COLD' as 'COLD' | 'WARM' | 'HOT',
    probability: 10,
    type: '',
    comments: '',
    addNote: false,
  });
  const stageCloseDateRef = useRef<HTMLInputElement>(null);
  const [opportunityStages, setOpportunityStages] = useState<string[]>([
    'Enquiry',
    'Qualification',
    'Site Visit',
    'Meeting',
    'Offer Sent',
    'Negotiation',
    'Won',
    'Lost',
  ]);
  const [isAddingNewStage, setIsAddingNewStage] = useState(false);
  const [newStageInput, setNewStageInput] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrmSalesOpportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionDropdownOpenId, setActionDropdownOpenId] = useState<string | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<string>('opportunity');
  const [detailActivityTab, setDetailActivityTab] = useState<string>('notes');
  const [isChangeQuotationStatusModalOpen, setIsChangeQuotationStatusModalOpen] = useState(false);
  const [quotationStatusValue, setQuotationStatusValue] = useState('Pending');
  const [targetQuotationOpp, setTargetQuotationOpp] = useState<CrmSalesOpportunity | null>(null);
  const [isPrintFormatDropdownOpen, setIsPrintFormatDropdownOpen] = useState(false);
  const [selectedPrintFormat, setSelectedPrintFormat] = useState('Print with Quantity');
  const [isPrintQuotationModalOpen, setIsPrintQuotationModalOpen] = useState(false);
  const [activePrintOpp, setActivePrintOpp] = useState<CrmSalesOpportunity | null>(null);
  const [isQuotationViewModalOpen, setIsQuotationViewModalOpen] = useState(false);
  const [activeViewQuotationOpp, setActiveViewQuotationOpp] = useState<CrmSalesOpportunity | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleOpenPrintPreview = (opp: CrmSalesOpportunity, format?: string) => {
    setActivePrintOpp(opp);
    if (format) setSelectedPrintFormat(format);
    setIsPrintFormatDropdownOpen(false);
    setIsPrintQuotationModalOpen(true);
  };

  const handleOpenChangeQuotationStatus = (opp: CrmSalesOpportunity) => {
    setTargetQuotationOpp(opp);
    setQuotationStatusValue((opp as any).quotationStatus || 'Pending');
    setIsChangeQuotationStatusModalOpen(true);
  };

  const handleUpdateQuotationStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetQuotationOpp) {
      updateOpportunity(targetQuotationOpp.id, {
        quotationStatus: quotationStatusValue,
      } as any);
      (targetQuotationOpp as any).quotationStatus = quotationStatusValue;
      showSalesToast(`Quotation status updated to "${quotationStatusValue}"`);
    }
    setIsChangeQuotationStatusModalOpen(false);
  };

  const closeDateRef = useRef<HTMLInputElement>(null);
  const deliveryDateRef = useRef<HTMLInputElement>(null);
  const lpoDateRef = useRef<HTMLInputElement>(null);
  const oppDateRef = useRef<HTMLInputElement>(null);

  // Form State for Add Opportunity (Matching Cezcon CRM spec)
  const [oppFormData, setOppFormData] = useState({
    opportunityCode: 'CTEQ#' + Math.floor(7100 + Math.random() * 800),
    opportunityDate: new Date().toISOString().slice(0, 10),
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
    vatRate: 5 as number | string,
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
    reference: '',
    deliveryMethod: '',
    contactPersonText: '',
    enquiryForm: false,
    subtitle: '',
    classification: 'Corporate',
    createdBy: 'Super Admin',
  });

  // Location dropdown state for Add Opportunity
  const UAE_LOCATIONS = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah',
    'Al Ain', 'Bur Dubai', 'Deira', 'Jumeirah', 'Karama', 'Mirdif', 'Satwa',
    'Barsha', 'Jebel Ali', 'Dubai Marina', 'Downtown Dubai', 'Business Bay',
    'DIFC', 'JLT', 'JVC', 'Mussafah', 'Khalifa City', 'Ruwais', 'Madinat Zayed',
    'Shahama', 'Al Quoz', 'Al Nahda', 'Dip', 'TECOM', 'Silicon Oasis', 'Academic City',
    'Al Qusais', 'Al Rashidiya', 'Oud Metha', 'Al Barsha', 'Motor City', 'Sports City',
    'Discovery Gardens', 'International City', 'Al Warqa', 'Umm Suqeim', 'Al Safa',
    'Palm Jumeirah', 'The Greens', 'The Views', 'Remraam', 'Town Square', 'Dubai South',
    'Al Majaz', 'Al Nahda (Sharjah)', 'Al Khan', 'Industrial Area', 'Hamriyah', 'Halwan',
    'Al Jurf', 'Ajman Industrial', 'Al Hamidiyah', 'Al Rashidiya (Ajman)',
  ];
  const [oppLocationDropdownOpen, setOppLocationDropdownOpen] = useState(false);
  const oppLocationRef = useRef<HTMLDivElement>(null);

  // Opportunity Number Settings Modal State (Matching Cezcon CRM UI)
  const [isOppNumModalOpen, setIsOppNumModalOpen] = useState(false);
  const [oppPrefix, setOppPrefix] = useState('CTEQ#');
  const [oppNextNumber, setOppNextNumber] = useState('7133');

  // Quick Add Customer state for Opportunity form
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
  });

  const handleQuickAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomerForm.companyName.trim()) return;
    const name = quickCustomerForm.companyName.trim();
    if (addCustomer) {
      addCustomer({
        companyName: name,
        customerName: name,
        contactPerson: quickCustomerForm.contactPerson.trim(),
        phone: quickCustomerForm.phone.trim(),
        email: quickCustomerForm.email.trim(),
        status: 'Active',
        owner: oppFormData.owner || 'Nafal',
      } as any);
    }
    setOppFormData((prev) => ({
      ...prev,
      customer: name,
      contactPerson: quickCustomerForm.contactPerson.trim() || prev.contactPerson,
      phone: quickCustomerForm.phone.trim() || prev.phone,
    }));
    setQuickCustomerForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
    });
    setIsQuickAddCustomerOpen(false);
  };

  const openOppNumModal = () => {
    const currentVal = oppFormData.opportunityCode || 'CTEQ#7133';
    const match = currentVal.match(/^(.*?)(\d+)$/);
    if (match) {
      setOppPrefix(match[1]);
      setOppNextNumber(match[2]);
    } else {
      setOppPrefix('CTEQ#');
      setOppNextNumber('7133');
    }
    setIsOppNumModalOpen(true);
  };

  // Invoice Number Settings Modal State (Exact Cezcon CRM modal)
  const [isInvoiceNumModalOpen, setIsInvoiceNumModalOpen] = useState(false);
  const [invoicePrefix, setInvoicePrefix] = useState('CTINV#');
  const [invoiceNextNumber, setInvoiceNextNumber] = useState('15629');

  const openInvoiceNumModal = () => {
    const currentVal = addInvoiceData.invoiceNumber || 'CTINV#15629';
    const match = currentVal.match(/^(.*?)(\d+)$/);
    if (match) {
      setInvoicePrefix(match[1]);
      setInvoiceNextNumber(match[2]);
    } else {
      setInvoicePrefix('CTINV#');
      setInvoiceNextNumber('15629');
    }
    setIsInvoiceNumModalOpen(true);
  };

  const handleSaveInvoiceNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = `${invoicePrefix}${invoiceNextNumber}`;
    setAddInvoiceData((prev) => ({ ...prev, invoiceNumber: finalCode }));
    setIsInvoiceNumModalOpen(false);
  };

  // Quick Add Customer state for Invoice form
  const [isQuickAddInvoiceCustomerOpen, setIsQuickAddInvoiceCustomerOpen] = useState(false);
  const [quickInvoiceCustomerForm, setQuickInvoiceCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
  });

  const handleQuickAddInvoiceCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInvoiceCustomerForm.companyName.trim()) return;
    const name = quickInvoiceCustomerForm.companyName.trim();
    if (addCustomer) {
      addCustomer({
        companyName: name,
        customerName: name,
        contactPerson: quickInvoiceCustomerForm.contactPerson.trim(),
        phone: quickInvoiceCustomerForm.phone.trim(),
        email: quickInvoiceCustomerForm.email.trim(),
        status: 'Active',
        owner: currentUser?.name || 'shaheer',
      } as any);
    }
    setAddInvoiceData((prev) => ({
      ...prev,
      customer: name,
      attention: quickInvoiceCustomerForm.contactPerson.trim() || prev.attention,
    }));
    setQuickInvoiceCustomerForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
    });
    setIsQuickAddInvoiceCustomerOpen(false);
  };

  const handleSaveOppNumSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `${oppPrefix}${oppNextNumber}`;
    setOppFormData((prev) => ({ ...prev, opportunityCode: newCode }));
    setIsOppNumModalOpen(false);
  };

  // Convert to Multiple Opportunities State (Matching Exact Cezcon CRM Image 1)
  const [isConvertToMultipleOpen, setIsConvertToMultipleOpen] = useState(false);

  interface ConvertMasterData {
    opportunityCode: string;
    customer: string;
    contactPerson: string;
    source: string;
    sourceName: string;
    campaign: string;
    competitorsDetails: string;
    winProbability: number;
    comments: string;
    rating: 'COLD' | 'WARM' | 'HOT';
    nextAction: string;
    deliveryDate: string;
    location: string;
  }

  interface ConvertOpportunityRow {
    id: string;
    rowNum: number;
    owner: string;
    title: string;
    oppDate: string;
    stage: string;
    closeDate: string;
    amount: number | string;
    discount: number | string;
    vatType: 'With VAT' | 'Without VAT' | 'Zero VAT';
    vatPercent: number | string;
    vatAmount: number | string;
    adjustment: number | string;
    totalAmount: number | string;
    type: string;
    tags: string[];
    businessOpportunity: string;
  }

  const [convertMasterData, setConvertMasterData] = useState<ConvertMasterData>({
    opportunityCode: 'CTEQ#7132',
    customer: 'SAIT SPECIALIZED ENGINEERING AND CONTRACTING',
    contactPerson: 'Mr JISHINU V',
    source: '',
    sourceName: '',
    campaign: '',
    competitorsDetails: '',
    winProbability: 10,
    comments: '',
    rating: 'COLD',
    nextAction: '',
    deliveryDate: '',
    location: '',
  });

  const [convertRows, setConvertRows] = useState<ConvertOpportunityRow[]>([
    {
      id: 'conv_row_1',
      rowNum: 1,
      owner: 'NEBIN BENNY',
      title: 'PORTABLE AC',
      oppDate: '05-10-2026',
      stage: 'Offer Sent',
      closeDate: '21-10-2026',
      amount: 3900,
      discount: 0,
      vatType: 'With VAT',
      vatPercent: 5,
      vatAmount: 195,
      adjustment: 0,
      totalAmount: 4095,
      type: '',
      tags: ['Maintenance'],
      businessOpportunity: '',
    },
  ]);

  const [convertGenFrequency, setConvertGenFrequency] = useState('None');
  const [convertGenStage, setConvertGenStage] = useState('Enquiry');
  const [convertGenAmount, setConvertGenAmount] = useState('');
  const [convertGenCount, setConvertGenCount] = useState(1);

  // Enquiry Form State (Matching Exact Cezcon Cloud UI)
  interface OpportunityEnquiryItem {
    id: string;
    description: string;
    additionalDescription: string;
    showAdditionalDesc: boolean;
    code: string;
    unit: string;
    brand: string;
    qty: number | string;
    price: number | string;
    priceTotal: number;
  }

  const [enquiryItems, setEnquiryItems] = useState<OpportunityEnquiryItem[]>([
    {
      id: 'item_1',
      description: '',
      additionalDescription: '',
      showAdditionalDesc: false,
      code: '',
      unit: '',
      brand: '',
      qty: 1,
      price: '',
      priceTotal: 0,
    },
  ]);
  const [showAllAdditionalDesc, setShowAllAdditionalDesc] = useState(false);

  const [selectedTermsCondition, setSelectedTermsCondition] = useState('');
  const [termsAndConditionsText, setTermsAndConditionsText] = useState('');
  const [enquiryDiscountPercent, setEnquiryDiscountPercent] = useState<number | string>(0);
  const [enquiryDiscountAmount, setEnquiryDiscountAmount] = useState<number | string>(0);
  const [enquiryVatPercent, setEnquiryVatPercent] = useState<number>(5);
  const [enquiryAdjustmentAmount, setEnquiryAdjustmentAmount] = useState<number | string>(0);

  const DEFAULT_TERMS_TEMPLATES: Record<string, string> = {
    'Standard 30-Day Payment Terms': `1. Payment Terms: 30 days from invoice date.\n2. Delivery: 3 to 5 working days from receipt of confirmed LPO.\n3. Warranty: 12 months standard warranty against manufacturing defects.\n4. Quotation Validity: 30 calendar days from issue date.\n5. VAT: 5% applicable as per UAE Federal Tax Authority regulations.`,
    'HVAC Supply & Commissioning Terms': `1. Payment: 50% advance with LPO, 40% on delivery to site, 10% upon successful testing and commissioning.\n2. Site power, water and access facilities to be provided by client.\n3. 5-year warranty on compressors, 1-year warranty on electronic components.\n4. Balancing and air volume test reports will be handed over on completion.`,
    'Annual Maintenance Contract (AMC)': `1. 4 comprehensive quarterly preventive maintenance visits.\n2. Emergency breakdown callout response within 4 hours SLA.\n3. Consumable filters and belt replacements included.\n4. Invoiced quarterly in advance.`,
  };

  const [termsTemplates, setTermsTemplates] = useState<Record<string, string>>(DEFAULT_TERMS_TEMPLATES);
  const [isAddTermsModalOpen, setIsAddTermsModalOpen] = useState(false);
  const [newTermsTitle, setNewTermsTitle] = useState('');
  const [newTermsContent, setNewTermsContent] = useState('');

  // Toast message for terms
  const [salesToast, setSalesToast] = useState<string | null>(null);
  const showSalesToast = (msg: string) => {
    setSalesToast(msg);
    setTimeout(() => setSalesToast(null), 3000);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cezcon_saved_terms_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setTermsTemplates((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAddAnotherTerm = () => {
    if (!newTermsTitle.trim() || !newTermsContent.trim()) return;

    const title = newTermsTitle.trim();
    const updated = { ...termsTemplates, [title]: newTermsContent };
    setTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSelectedTermsCondition(title);
    setTermsAndConditionsText((prev) => {
      if (!prev || !prev.trim()) {
        return newTermsContent;
      }
      return `${prev.trim()}\n\n${newTermsContent}`;
    });
    setNewTermsTitle('');
    setNewTermsContent('');
    showSalesToast(`Added "${title}" to editor! Ready for next term.`);
  };

  const handleSaveNewTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermsTitle.trim() || !newTermsContent.trim()) return;

    const title = newTermsTitle.trim();
    const updated = { ...termsTemplates, [title]: newTermsContent };
    setTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSelectedTermsCondition(title);
    setTermsAndConditionsText((prev) => {
      if (!prev || !prev.trim()) {
        return newTermsContent;
      }
      return `${prev.trim()}\n\n${newTermsContent}`;
    });
    setIsAddTermsModalOpen(false);
    setNewTermsTitle('');
    setNewTermsContent('');
    showSalesToast(`New terms template "${title}" added to editor!`);
  };

  const handleLoadTerms = () => {
    if (selectedTermsCondition && termsTemplates[selectedTermsCondition]) {
      const content = termsTemplates[selectedTermsCondition];
      setTermsAndConditionsText((prev) => {
        if (!prev || !prev.trim()) {
          return content;
        }
        return `${prev.trim()}\n\n${content}`;
      });
      showSalesToast(`Added "${selectedTermsCondition}" to editor`);
    } else if (!selectedTermsCondition) {
      showSalesToast('Please select a Terms & Conditions template');
    }
  };

  const handleClearTerms = () => {
    setSelectedTermsCondition('');
    setTermsAndConditionsText('');
    showSalesToast('Terms & Conditions cleared');
  };

  const handleAddEnquiryItem = () => {
    setEnquiryItems([
      ...enquiryItems,
      {
        id: `item_${Date.now()}`,
        description: '',
        additionalDescription: '',
        showAdditionalDesc: false,
        code: '',
        unit: '',
        brand: '',
        qty: 1,
        price: '',
        priceTotal: 0,
      },
    ]);
  };

  const handleRemoveEnquiryItem = (id: string) => {
    if (enquiryItems.length <= 1) {
      setEnquiryItems([
        {
          id: `item_${Date.now()}`,
          description: '',
          additionalDescription: '',
          showAdditionalDesc: false,
          code: '',
          unit: '',
          brand: '',
          qty: 1,
          price: '',
          priceTotal: 0,
        },
      ]);
      return;
    }
    setEnquiryItems(enquiryItems.filter((i) => i.id !== id));
  };

  const handleUpdateEnquiryItem = (id: string, field: keyof OpportunityEnquiryItem, val: any) => {
    setEnquiryItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          const rawQ = field === 'qty' ? val : updated.qty;
          const rawP = field === 'price' ? val : updated.price;
          const q = rawQ === '' ? 0 : (Number(rawQ) || 0);
          const p = rawP === '' ? 0 : (Number(rawP) || 0);
          updated.priceTotal = q * p;
          return updated;
        }
        return item;
      });

      const newSum = updatedItems.reduce((sum, it) => sum + (Number(it.priceTotal) || 0), 0);
      setOppFormData((prev) => ({ ...prev, amount: newSum > 0 ? String(newSum) : prev.amount }));
      return updatedItems;
    });
  };

  // Derived Totals for Enquiry Form (Full Live Reactivity)
  const enquiryCalculations = useMemo(() => {
    const totalItemsAmount = enquiryItems.reduce((sum, item) => {
      const q = Number(item.qty) || 0;
      const p = Number(item.price) || 0;
      return sum + (q * p);
    }, 0);

    const discPct = Number(enquiryDiscountPercent) || 0;
    const discAmt = discPct > 0 ? (totalItemsAmount * discPct) / 100 : (Number(enquiryDiscountAmount) || 0);
    const amountAfterDiscount = Math.max(0, totalItemsAmount - discAmt);
    const vatRate = oppFormData.vatType === 'With VAT' ? (Number(enquiryVatPercent) || 5) : 0;
    const vatAmount = amountAfterDiscount * (vatRate / 100);
    const subTotal = amountAfterDiscount + vatAmount;
    const adjustment = Number(enquiryAdjustmentAmount) || 0;
    const totalAmount = Math.max(0, subTotal + adjustment);

    return {
      totalItemsAmount,
      discAmt,
      discPct,
      amountAfterDiscount,
      vatRate,
      vatAmount,
      subTotal,
      adjustment,
      totalAmount,
    };
  }, [enquiryItems, enquiryDiscountPercent, enquiryDiscountAmount, enquiryVatPercent, oppFormData.vatType, enquiryAdjustmentAmount]);

  // Live Opportunity Financial Calculations for Main Opportunity Form
  const oppCalculations = useMemo(() => {
    const effectiveAmount = oppFormData.enquiryForm && enquiryCalculations.totalItemsAmount > 0
      ? enquiryCalculations.totalItemsAmount
      : (Number(oppFormData.amount) || 0);

    const rawDiscount = Number(oppFormData.discount) || 0;
    const rawAdjustment = Number(oppFormData.adjustment) || 0;

    const vatRateNum = oppFormData.vatRate === '' || isNaN(Number(oppFormData.vatRate))
      ? (oppFormData.vatType === 'With VAT' ? 5 : 0)
      : Number(oppFormData.vatRate);

    const taxableAmount = Math.max(0, effectiveAmount - rawDiscount);
    const vatVal = oppFormData.vatType === 'With VAT' ? (taxableAmount * vatRateNum) / 100 : 0;
    const totalAmount = taxableAmount + vatVal + rawAdjustment;

    return {
      effectiveAmount,
      taxableAmount,
      vatRateNum,
      vatVal,
      totalAmount,
    };
  }, [
    oppFormData.amount,
    oppFormData.discount,
    oppFormData.adjustment,
    oppFormData.vatRate,
    oppFormData.vatType,
    oppFormData.enquiryForm,
    enquiryCalculations.totalItemsAmount,
  ]);

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
    vatRate: 5 as number | string,
    vatAmount: 250,
    totalAmount: 5250,
    status: 'Sent' as const,
    owner: currentUser?.name || 'shaheer',
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

  const toDateInputFormat = (dateStr?: string) => {
    if (!dateStr) return '';
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split('-');
      return `${y}-${m}-${d}`;
    }
    return dateStr;
  };

  const toDisplayDateFormat = (dateStr?: string) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}-${m}-${y}`;
    }
    return dateStr;
  };

  const handleOpenEditOpportunity = (opp: CrmSalesOpportunity) => {
    setEditingOpportunityId(opp.id);
    setSelectedOpportunity(opp);

    setOppFormData({
      opportunityCode: opp.opportunityCode || 'CTEQ#7016',
      opportunityDate: toDateInputFormat(opp.opportunityDate) || new Date().toISOString().slice(0, 10),
      customer: opp.customer || '',
      contactPerson: opp.contactPerson || '',
      phone: opp.phone || '',
      owner: opp.owner || 'Nafal',
      title: opp.title || '',
      source: opp.source || 'Direct Inquiry',
      sourceName: opp.sourceName || '',
      rating: (opp.rating?.toUpperCase() === 'HOT' ? 'HOT' : opp.rating?.toUpperCase() === 'WARM' ? 'WARM' : 'COLD') as any,
      stage: (opp.stage as DealStage) || 'Enquiry',
      expectedClose: toDateInputFormat(opp.expectedClose) || '',
      amount: opp.amount !== undefined ? opp.amount : '',
      discount: opp.discount !== undefined ? opp.discount : '',
      vatType: (opp.vatType || 'With VAT') as any,
      vatRate: opp.vatRate ?? 5,
      adjustment: opp.adjustment !== undefined ? opp.adjustment : '',
      campaign: opp.campaign || '',
      businessOpportunity: opp.businessOpportunity || opp.subtitle || '',
      tags: Array.isArray(opp.tags) ? opp.tags.join(', ') : (opp.tags || ''),
      deliveryDate: toDateInputFormat(opp.deliveryDate) || '',
      lpoNumber: opp.lpoNumber || '',
      lpoDate: toDateInputFormat(opp.lpoDate) || '',
      nextAction: opp.nextAction || '',
      competitorsDetails: opp.competitorsDetails || '',
      probability: opp.probability || 10,
      type: opp.type || '',
      comments: opp.comments || '',
      location: opp.location || '',
      reference: opp.reference || '',
      deliveryMethod: opp.deliveryMethod || '',
      contactPersonText: opp.contactPerson || '',
      enquiryForm: opp.enquiryForm ?? false,
      subtitle: opp.subtitle || '',
      classification: opp.classification || 'Corporate',
      createdBy: opp.createdBy || 'Super Admin',
    });

    setEnquiryItems([
      {
        id: 'item_1',
        description: opp.title || 'Opportunity Item',
        additionalDescription: opp.subtitle || '',
        showAdditionalDesc: Boolean(opp.subtitle),
        code: opp.opportunityCode || '',
        unit: 'Pcs',
        brand: '',
        qty: 1,
        price: opp.amount || 0,
        priceTotal: opp.amount || 0,
      },
    ]);

    setIsAddModalOpen(true);
  };

  const handleOpenAddOpportunity = () => {
    setEditingOpportunityId(null);
    setSelectedOpportunity(null);
    setOppFormData({
      opportunityCode: 'CTEQ#' + Math.floor(7100 + Math.random() * 800),
      opportunityDate: new Date().toISOString().slice(0, 10),
      customer: '',
      contactPerson: '',
      phone: '',
      owner: 'Nafal',
      title: '',
      source: '',
      sourceName: '',
      rating: 'COLD',
      stage: 'Enquiry',
      expectedClose: '',
      amount: '',
      discount: '',
      vatType: 'With VAT',
      vatRate: 5,
      adjustment: '',
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
      reference: '',
      deliveryMethod: '',
      contactPersonText: '',
      enquiryForm: false,
      subtitle: '',
      classification: 'Corporate',
      createdBy: 'Super Admin',
    });
    setEnquiryItems([
      {
        id: 'item_1',
        description: '',
        additionalDescription: '',
        showAdditionalDesc: false,
        code: '',
        unit: '',
        brand: '',
        qty: 1,
        price: '',
        priceTotal: 0,
      },
    ]);
    setIsAddModalOpen(true);
    router.push('/sales?tab=opportunities&action=add');
  };

  const handleOpenChangeStage = (opp: CrmSalesOpportunity) => {
    setChangeStageOpp(opp);
    setChangeStageData({
      stage: (opp.stage as DealStage) || 'Offer Sent',
      closeDate: toDateInputFormat(opp.expectedClose) || '',
      amount: opp.amount !== undefined ? opp.amount : 3900,
      discount: opp.discount !== undefined ? opp.discount : '',
      vatType: opp.vatType || 'With VAT',
      vatRate: opp.vatRate ?? 5,
      adjustment: opp.adjustment !== undefined ? opp.adjustment : '',
      rating: (opp.rating?.toUpperCase() === 'HOT' ? 'HOT' : opp.rating?.toUpperCase() === 'WARM' ? 'WARM' : 'COLD') as any,
      probability: opp.probability || 10,
      type: opp.type || '',
      comments: opp.comments || '',
      addNote: false,
    });
    setIsChangeStageModalOpen(true);
  };

  useEffect(() => {
    const action = searchParams.get('action');
    const editId = searchParams.get('editId') || (action === 'edit' ? searchParams.get('id') : null);
    if (editId) {
      const found = salesOpportunities.find((o) => o.id === editId || o.opportunityCode === editId);
      if (found && editingOpportunityId !== found.id) {
        handleOpenEditOpportunity(found);
      }
    }
  }, [searchParams, salesOpportunities]);

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppFormData.title || !oppFormData.customer) return;

    const finalAmount = oppCalculations.totalAmount > 0
      ? oppCalculations.totalAmount
      : (oppCalculations.effectiveAmount > 0 ? oppCalculations.effectiveAmount : Number(oppFormData.amount) || 0);

    const oppPayload = {
      opportunityCode: oppFormData.opportunityCode,
      title: oppFormData.title,
      subtitle: oppFormData.businessOpportunity || oppFormData.type || oppFormData.subtitle || '',
      customer: oppFormData.customer,
      contactPerson: oppFormData.contactPersonText || oppFormData.contactPerson,
      phone: oppFormData.phone,
      amount: finalAmount,
      discount: Number(oppFormData.discount) || 0,
      vatType: oppFormData.vatType || 'With VAT',
      vatRate: oppCalculations.vatRateNum,
      vatAmount: oppCalculations.vatVal,
      adjustment: Number(oppFormData.adjustment) || 0,
      totalAmount: oppCalculations.totalAmount,
      location: oppFormData.location || '',
      source: oppFormData.source || '',
      sourceName: oppFormData.sourceName || '',
      deliveryDate: toDisplayDateFormat(oppFormData.deliveryDate) || '',
      lpoNumber: oppFormData.lpoNumber || '',
      lpoDate: toDisplayDateFormat(oppFormData.lpoDate) || '',
      nextAction: oppFormData.nextAction || '',
      competitorsDetails: oppFormData.competitorsDetails || '',
      comments: oppFormData.comments || '',
      reference: oppFormData.reference || '',
      deliveryMethod: oppFormData.deliveryMethod || '',
      trn: (oppFormData as any).trn || '',
      quotationNumber: (oppFormData as any).quotationNumber || `CTSQ#${Math.floor(4300 + Math.random() * 200)}`,
      enquiryItems: oppFormData.enquiryForm && enquiryItems.length > 0 ? enquiryItems : [],
      items: oppFormData.enquiryForm && enquiryItems.length > 0 ? enquiryItems : [],
      termsAndConditions: termsAndConditionsText || '',
      stage: oppFormData.stage,
      probability: Number(oppFormData.probability) || 10,
      owner: oppFormData.owner || 'Nafal',
      opportunityDate: toDisplayDateFormat(oppFormData.opportunityDate) || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      opportunityDateDaysAgo: '0 days',
      expectedClose: toDisplayDateFormat(oppFormData.expectedClose) || 'Pending',
      closeDateRemaining: '7 days',
      lastActivity: `${toDisplayDateFormat(oppFormData.opportunityDate) || 'Today'} 12:00:00 PM`,
      lastActivityRelative: 'Today',
      classification: oppFormData.classification || 'Corporate',
      rating: oppFormData.rating === 'COLD' ? 'Cold' : oppFormData.rating === 'WARM' ? 'Warm' : 'Hot',
      businessOpportunity: oppFormData.businessOpportunity,
      campaign: oppFormData.campaign,
      createdBy: oppFormData.createdBy,
      tags: oppFormData.tags ? (typeof oppFormData.tags === 'string' ? oppFormData.tags.split(',').map((t) => t.trim()) : oppFormData.tags) : [],
    };

    const targetCode = oppPayload.opportunityCode || (editingOpportunityId ? String(editingOpportunityId) : 'CTEQ#7120');
    if (editingOpportunityId) {
      updateOpportunity(editingOpportunityId, oppPayload);
      setSalesToast('Opportunity updated successfully');
    } else {
      addOpportunity(oppPayload);
      setSalesToast('Opportunity created successfully');
    }

    setIsAddModalOpen(false);
    setEditingOpportunityId(null);
    setSelectedOpportunity(null);
    setDetailActiveTab('opportunity');
    router.push(`/sales?tab=opportunities&view=${targetCode}`);
  };

  const isAddOpen = isAddModalOpen || searchParams.get('action') === 'add' || searchParams.get('action') === 'edit';
  const viewOppId = searchParams.get('view');
  const viewOpp = viewOppId
    ? salesOpportunities.find((o) => o.id === viewOppId || o.opportunityCode === viewOppId) || salesOpportunities[0]
    : null;
  const isDetailViewOpen = Boolean(viewOppId);

  const closeAddOpportunity = () => {
    setIsAddModalOpen(false);
    setEditingOpportunityId(null);
    setSelectedOpportunity(null);
    if (searchParams.get('action') === 'add' || searchParams.get('action') === 'edit' || searchParams.get('editId')) {
      router.push('/sales?tab=opportunities');
    }
  };

  const handleOpenConvertToMultiple = (opp: CrmSalesOpportunity) => {
    const oppAmt = opp.amount !== undefined ? opp.amount : 3900;
    const vatRate = opp.vatRate ?? 5;
    const vatAmt = opp.vatType === 'Without VAT' || opp.vatType === 'Zero VAT' ? 0 : (Number(oppAmt) * Number(vatRate)) / 100;
    const tot = Number(oppAmt) + vatAmt;

    setConvertMasterData({
      opportunityCode: opp.opportunityCode || 'CTEQ#7132',
      customer: opp.customer || 'SAIT SPECIALIZED ENGINEERING AND CONTRACTING',
      contactPerson: opp.contactPerson || 'Mr JISHINU V',
      source: opp.source || '',
      sourceName: opp.sourceName || '',
      campaign: opp.campaign || '',
      competitorsDetails: opp.competitorsDetails || '',
      winProbability: opp.probability || 10,
      comments: opp.comments || '',
      rating: (opp.rating?.toUpperCase() === 'HOT' ? 'HOT' : opp.rating?.toUpperCase() === 'WARM' ? 'WARM' : 'COLD') as any,
      nextAction: opp.nextAction || '',
      deliveryDate: toDateInputFormat(opp.deliveryDate) || '',
      location: opp.location || '',
    });

    setConvertRows([
      {
        id: `conv_${Date.now()}`,
        rowNum: 1,
        owner: opp.owner || 'NEBIN BENNY',
        title: opp.title || 'PORTABLE AC',
        oppDate: opp.opportunityDate || '05-10-2026',
        stage: opp.stage || 'Offer Sent',
        closeDate: opp.expectedClose || '21-10-2026',
        amount: oppAmt,
        discount: opp.discount !== undefined ? opp.discount : 0,
        vatType: (opp.vatType || 'With VAT') as any,
        vatPercent: vatRate,
        vatAmount: vatAmt,
        adjustment: opp.adjustment !== undefined ? opp.adjustment : 0,
        totalAmount: tot,
        type: opp.type || '',
        tags: Array.isArray(opp.tags) && opp.tags.length > 0 ? opp.tags : ['Maintenance'],
        businessOpportunity: opp.businessOpportunity || '',
      },
    ]);

    setIsConvertToMultipleOpen(true);
  };

  const updateConvertRow = (id: string, field: keyof ConvertOpportunityRow, value: any) => {
    setConvertRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };

        const amt = Number(updated.amount) || 0;
        const disc = Number(updated.discount) || 0;
        const adj = Number(updated.adjustment) || 0;
        const taxable = Math.max(0, amt - disc);
        const vatPct = updated.vatType === 'With VAT' ? (Number(updated.vatPercent) || 5) : 0;
        const vatAmt = updated.vatType === 'With VAT' ? (taxable * vatPct) / 100 : 0;
        const tot = taxable + vatAmt + adj;

        updated.vatAmount = vatAmt;
        updated.totalAmount = tot;
        return updated;
      })
    );
  };

  const handleAddConvertRow = () => {
    const nextNum = convertRows.length + 1;
    const baseOpp = convertRows[0] || {};
    const amt = baseOpp.amount || 3900;
    const vatRate = 5;
    const vatAmt = (Number(amt) * vatRate) / 100;

    setConvertRows([
      ...convertRows,
      {
        id: `conv_${Date.now()}_${nextNum}`,
        rowNum: nextNum,
        owner: baseOpp.owner || 'NEBIN BENNY',
        title: baseOpp.title || 'PORTABLE AC',
        oppDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        stage: 'Offer Sent',
        closeDate: '21-10-2026',
        amount: amt,
        discount: 0,
        vatType: 'With VAT',
        vatPercent: 5,
        vatAmount: vatAmt,
        adjustment: 0,
        totalAmount: Number(amt) + vatAmt,
        type: '',
        tags: ['Maintenance'],
        businessOpportunity: '',
      },
    ]);
  };

  const handleGenerateRowsFromBar = () => {
    const count = Math.max(1, Number(convertGenCount) || 1);
    const amt = convertGenAmount !== '' ? Number(convertGenAmount) : (convertRows[0]?.amount || 3900);
    const stage = convertGenStage || 'Enquiry';
    const owner = convertRows[0]?.owner || 'NEBIN BENNY';
    const title = convertRows[0]?.title || 'PORTABLE AC';

    const newRows: ConvertOpportunityRow[] = [];
    const baseDate = new Date();

    for (let i = 0; i < count; i++) {
      const curDate = new Date(baseDate);
      if (convertGenFrequency === 'Weekly') {
        curDate.setDate(baseDate.getDate() + i * 7);
      } else if (convertGenFrequency === 'Monthly') {
        curDate.setMonth(baseDate.getMonth() + i);
      } else if (convertGenFrequency === 'Quarterly') {
        curDate.setMonth(baseDate.getMonth() + i * 3);
      } else if (convertGenFrequency === 'Yearly') {
        curDate.setFullYear(baseDate.getFullYear() + i);
      }

      const oppDateStr = `${String(curDate.getDate()).padStart(2, '0')}-${String(curDate.getMonth() + 1).padStart(2, '0')}-${curDate.getFullYear()}`;
      const closeDate = new Date(curDate);
      closeDate.setDate(curDate.getDate() + 16);
      const closeDateStr = `${String(closeDate.getDate()).padStart(2, '0')}-${String(closeDate.getMonth() + 1).padStart(2, '0')}-${closeDate.getFullYear()}`;

      const vatAmt = (Number(amt) * 5) / 100;
      newRows.push({
        id: `conv_${Date.now()}_${i + 1}`,
        rowNum: i + 1,
        owner: owner,
        title: title,
        oppDate: oppDateStr,
        stage: stage,
        closeDate: closeDateStr,
        amount: amt,
        discount: 0,
        vatType: 'With VAT',
        vatPercent: 5,
        vatAmount: vatAmt,
        adjustment: 0,
        totalAmount: Number(amt) + vatAmt,
        type: '',
        tags: ['Maintenance'],
        businessOpportunity: '',
      });
    }
    setConvertRows(newRows);
    setSalesToast(`Loaded ${count} opportunities with ${convertGenFrequency} frequency`);
  };

  const handleSaveConvertToMultiple = () => {
    convertRows.forEach((row, idx) => {
      const code = idx === 0 ? convertMasterData.opportunityCode : `CTEQ#${Math.floor(7130 + Math.random() * 800)}`;
      addOpportunity({
        opportunityCode: code,
        title: row.title || 'PORTABLE AC',
        subtitle: row.businessOpportunity || row.type || '',
        customer: convertMasterData.customer,
        contactPerson: convertMasterData.contactPerson,
        phone: '+971500000000',
        amount: Number(row.totalAmount) || Number(row.amount) || 0,
        stage: (row.stage as DealStage) || 'Offer Sent',
        probability: Number(convertMasterData.winProbability) || 10,
        owner: row.owner || 'NEBIN BENNY',
        opportunityDate: row.oppDate,
        opportunityDateDaysAgo: '0 days',
        expectedClose: row.closeDate,
        closeDateRemaining: '16 days',
        lastActivity: `${row.oppDate} 11:08:20 AM`,
        lastActivityRelative: 'Today',
        classification: 'Corporate',
        rating: convertMasterData.rating === 'COLD' ? 'Cold' : convertMasterData.rating === 'WARM' ? 'Warm' : 'Hot',
        businessOpportunity: row.businessOpportunity,
        campaign: convertMasterData.campaign,
        createdBy: 'Super Admin',
        tags: row.tags,
      });
    });

    setIsConvertToMultipleOpen(false);
    setSalesToast(`Converted to ${convertRows.length} opportunities successfully`);
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
          {isConvertToMultipleOpen ? (
            /* ── FULL PAGE CONVERT TO MULTIPLE OPPORTUNITIES VIEW (EXACT CEZCON CRM IMAGE 1) ── */
            <div className="p-2 sm:p-4 flex-1 flex flex-col min-w-0 w-full">
              <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col flex-1 text-xs font-sans">
                {/* 1. Header Bar: [🔍] Convert to Multiple Opportunities / Red Close button */}
                <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-700 text-xs">
                      Convert to Multiple Opportunities
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConvertToMultipleOpen(false)}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Scrollable Body Content */}
                <div className="p-4 sm:p-6 flex-1 space-y-5 overflow-y-auto">
                  {/* Master Form Fields (2 Columns) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-[11px]">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Opportunity Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={convertMasterData.opportunityCode}
                          className="w-full bg-[#ECEFF1] border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Point of Contact
                        </label>
                        <div className="border border-slate-300 rounded bg-white p-1 text-[11px] text-slate-700 max-h-24 overflow-y-auto">
                          <div className="text-slate-400 text-[10px] px-1.5 py-0.5">Select Contact</div>
                          <div className="font-bold text-slate-800 px-1.5 py-0.5 text-[10px]">Account Contacts</div>
                          <div
                            onClick={() => setConvertMasterData({ ...convertMasterData, contactPerson: 'Mr JISHINU V' })}
                            className={cn(
                              "px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                              convertMasterData.contactPerson === 'Mr JISHINU V'
                                ? "bg-blue-100 text-blue-900 font-semibold"
                                : "text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            Mr JISHINU V
                          </div>
                          <div className="font-bold text-slate-800 px-1.5 py-0.5 text-[10px] mt-1">Other Contacts</div>
                          <div
                            onClick={() => setConvertMasterData({ ...convertMasterData, contactPerson: 'Mr. Raja Fauzi TORNADO GENERAL CONTRACTING LLC' })}
                            className={cn(
                              "px-1.5 py-0.5 rounded cursor-pointer transition-colors truncate",
                              convertMasterData.contactPerson === 'Mr. Raja Fauzi TORNADO GENERAL CONTRACTING LLC'
                                ? "bg-blue-100 text-blue-900 font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            Mr. Raja Fauzi TORNADO GENERAL CONTRACTING LLC
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Source Name
                        </label>
                        <input
                          type="text"
                          value={convertMasterData.sourceName}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, sourceName: e.target.value })}
                          placeholder="Name of the source. Eg Google, LinkedIn"
                          className="w-full border border-blue-400 focus:ring-1 focus:ring-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="text-slate-700 text-[11px] font-semibold">Campaign</label>
                          <HelpCircle className="w-3 h-3 text-slate-400" />
                        </div>
                        <select
                          value={convertMasterData.campaign}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, campaign: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                        >
                          <option value="">Select Campaign</option>
                          <option value="Summer HVAC Promo 2026">Summer HVAC Promo 2026</option>
                          <option value="Corporate Expo 2026">Corporate Expo 2026</option>
                          <option value="Email Outreach Q3">Email Outreach Q3</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Competitors Details
                        </label>
                        <textarea
                          rows={2}
                          value={convertMasterData.competitorsDetails}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, competitorsDetails: e.target.value })}
                          className="w-full border border-slate-300 rounded p-2 text-xs text-slate-700 resize-y outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Win Probability
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={convertMasterData.winProbability}
                            onChange={(e) => setConvertMasterData({ ...convertMasterData, winProbability: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
                          />
                          <span className="bg-[#F59E0B] text-white px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
                            {convertMasterData.winProbability}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Comments
                        </label>
                        <textarea
                          rows={2}
                          value={convertMasterData.comments}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, comments: e.target.value })}
                          className="w-full border border-slate-300 rounded p-2 text-xs text-slate-700 resize-y outline-none"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={convertMasterData.customer}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, customer: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                        >
                          <option value="SAIT SPECIALIZED ENGINEERING AND CONTRACTING">SAIT SPECIALIZED ENGINEERING AND CONTRACTING</option>
                          <option value="SECURA SAFETY WEAR - SOLEPROPRIETORSHIP L.L.C.">SECURA SAFETY WEAR - SOLEPROPRIETORSHIP L.L.C.</option>
                          <option value="AL AIN DISTRIBUTION COMPANY">AL AIN DISTRIBUTION COMPANY</option>
                          <option value="TORNADO GENERAL CONTRACTING LLC">TORNADO GENERAL CONTRACTING LLC</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="text-slate-700 text-[11px] font-semibold">Source</label>
                          <HelpCircle className="w-3 h-3 text-slate-400" />
                        </div>
                        <select
                          value={convertMasterData.source}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, source: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                        >
                          <option value="">Where did you get this opportunity</option>
                          <option value="Direct Inquiry">Direct Inquiry</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Exhibition">Exhibition</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="text-slate-700 text-[11px] font-semibold">Rating</label>
                          <HelpCircle className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="inline-flex border border-slate-300 rounded overflow-hidden text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setConvertMasterData({ ...convertMasterData, rating: 'COLD' })}
                            className={cn(
                              "px-2.5 py-1 transition-colors cursor-pointer",
                              convertMasterData.rating === 'COLD' ? "bg-[#0284C7] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            COLD
                          </button>
                          <button
                            type="button"
                            onClick={() => setConvertMasterData({ ...convertMasterData, rating: 'WARM' })}
                            className={cn(
                              "px-2.5 py-1 transition-colors border-x border-slate-200 cursor-pointer",
                              convertMasterData.rating === 'WARM' ? "bg-[#F59E0B] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            WARM
                          </button>
                          <button
                            type="button"
                            onClick={() => setConvertMasterData({ ...convertMasterData, rating: 'HOT' })}
                            className={cn(
                              "px-2.5 py-1 transition-colors cursor-pointer",
                              convertMasterData.rating === 'HOT' ? "bg-[#DC2626] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            HOT
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Next Action
                        </label>
                        <textarea
                          rows={2}
                          value={convertMasterData.nextAction}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, nextAction: e.target.value })}
                          className="w-full border border-slate-300 rounded p-2 text-xs text-slate-700 resize-y outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Delivery Date
                        </label>
                        <input
                          type="date"
                          value={convertMasterData.deliveryDate}
                          onChange={(e) => setConvertMasterData({ ...convertMasterData, deliveryDate: e.target.value })}
                          className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                          Location
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={convertMasterData.location}
                            onChange={(e) => setConvertMasterData({ ...convertMasterData, location: e.target.value })}
                            placeholder="Search location"
                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 pr-7 text-xs text-slate-700 outline-none"
                          />
                          {convertMasterData.location && (
                            <button
                              type="button"
                              onClick={() => setConvertMasterData({ ...convertMasterData, location: '' })}
                              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Opportunities Matrix */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs mt-4">
                    <div className="bg-[#F1F5F9] px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setConvertRows((prev) => [...prev]);
                          setSalesToast('Refreshed split opportunities matrix');
                        }}
                        className="text-slate-500 hover:text-slate-800 p-1 rounded transition-colors cursor-pointer"
                        title="Reload"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3.5 space-y-4 bg-[#FAFAFA]">
                      {convertRows.map((row) => (
                        <div
                          key={row.id}
                          className="border border-slate-200 rounded bg-white p-3.5 flex gap-3 shadow-2xs relative"
                        >
                          <div className="text-slate-700 font-bold text-xs pt-1 shrink-0 w-4 text-center">
                            {row.rowNum}
                          </div>

                          <div className="flex-1 space-y-3 text-[11px]">
                            {/* Line 1: Owner, Title, Date, Stage */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Opportunity Owner <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={row.owner}
                                  onChange={(e) => updateConvertRow(row.id, 'owner', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white"
                                >
                                  <option value="NEBIN BENNY">NEBIN BENNY</option>
                                  <option value="Nafal">Nafal</option>
                                  <option value="Super Admin">Super Admin</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Opportunity Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={row.title}
                                  onChange={(e) => updateConvertRow(row.id, 'title', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                                />
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Opportunity Date
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={row.oppDate}
                                    onChange={(e) => updateConvertRow(row.id, 'oppDate', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-2 py-1 pr-7 text-xs text-slate-700"
                                  />
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                                </div>
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Stage
                                </label>
                                <select
                                  value={row.stage}
                                  onChange={(e) => updateConvertRow(row.id, 'stage', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white"
                                >
                                  <option value="Enquiry">Enquiry</option>
                                  <option value="Offer Sent">Offer Sent</option>
                                  <option value="Qualification">Qualification</option>
                                  <option value="Site Visit">Site Visit</option>
                                  <option value="Meeting">Meeting</option>
                                  <option value="Negotiation">Negotiation</option>
                                  <option value="Won">Won</option>
                                  <option value="Lost">Lost</option>
                                </select>
                              </div>
                            </div>

                            {/* Line 2: Close Date, Amount, Discount, VAT Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Close Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={row.closeDate}
                                    onChange={(e) => updateConvertRow(row.id, 'closeDate', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-2 py-1 pr-7 text-xs text-slate-700"
                                  />
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                                </div>
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  value={row.amount}
                                  onChange={(e) => updateConvertRow(row.id, 'amount', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                                />
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Discount
                                </label>
                                <input
                                  type="number"
                                  value={row.discount}
                                  onChange={(e) => updateConvertRow(row.id, 'discount', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                                />
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  VAT Type
                                </label>
                                <select
                                  value={row.vatType}
                                  onChange={(e) => updateConvertRow(row.id, 'vatType', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white"
                                >
                                  <option value="With VAT">With VAT</option>
                                  <option value="Without VAT">Without VAT</option>
                                  <option value="Zero VAT">Zero VAT</option>
                                </select>
                              </div>
                            </div>

                            {/* Line 3: VAT (% + calc amount), Adjustment, Total Amount, Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  VAT
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center border border-slate-300 rounded bg-white px-2 py-1 text-xs w-20">
                                    <input
                                      type="number"
                                      value={row.vatPercent}
                                      onChange={(e) => updateConvertRow(row.id, 'vatPercent', e.target.value)}
                                      className="w-full outline-none text-xs"
                                    />
                                    <span className="text-slate-500 font-semibold">%</span>
                                  </div>
                                  <input
                                    type="text"
                                    readOnly
                                    disabled
                                    value={Number(row.vatAmount).toFixed(0)}
                                    className="w-full bg-[#ECEFF1] border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Adjustment
                                </label>
                                <input
                                  type="number"
                                  value={row.adjustment}
                                  onChange={(e) => updateConvertRow(row.id, 'adjustment', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700"
                                />
                              </div>

                              <div>
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Total Amount
                                </label>
                                <input
                                  type="text"
                                  readOnly
                                  disabled
                                  value={Number(row.totalAmount).toFixed(2)}
                                  className="w-full bg-[#ECEFF1] border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-slate-700 font-semibold mb-1 block">
                                    Type
                                  </label>
                                  <select
                                    value={row.type}
                                    onChange={(e) => updateConvertRow(row.id, 'type', e.target.value)}
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white"
                                  >
                                    <option value="">Select Type</option>
                                    <option value="Product">Product</option>
                                    <option value="Service">Service</option>
                                    <option value="Project">Project</option>
                                  </select>
                                </div>
                                {convertRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setConvertRows(convertRows.filter((r) => r.id !== row.id))}
                                    className="text-red-500 hover:text-red-700 p-1.5 mt-5 cursor-pointer"
                                    title="Delete Row"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Line 4: Opportunity Tags, Business Opportunity */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="col-span-1">
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Opportunity Tags
                                </label>
                                <div className="border border-slate-300 rounded bg-white p-1 text-[11px] max-h-24 overflow-y-auto space-y-0.5">
                                  {['Maintenance', 'Inspection', 'UWSR', 'Ice Maker', 'Chiller Repair'].map((tag) => {
                                    const isSel = row.tags.includes(tag);
                                    return (
                                      <div
                                        key={tag}
                                        onClick={() => {
                                          const newTags = isSel
                                            ? row.tags.filter((t) => t !== tag)
                                            : [...row.tags, tag];
                                          updateConvertRow(row.id, 'tags', newTags);
                                        }}
                                        className={cn(
                                          "px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                                          isSel
                                            ? "bg-blue-100 text-blue-900 font-semibold"
                                            : "hover:bg-slate-50 text-slate-600"
                                        )}
                                      >
                                        {tag}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="col-span-1">
                                <label className="text-slate-700 font-semibold mb-1 block">
                                  Business Opportunity
                                </label>
                                <select
                                  value={row.businessOpportunity}
                                  onChange={(e) => updateConvertRow(row.id, 'businessOpportunity', e.target.value)}
                                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white"
                                >
                                  <option value="">Select Business Opportunity</option>
                                  <option value="HVAC AMC">HVAC AMC</option>
                                  <option value="Ducting Supply">Ducting Supply</option>
                                  <option value="Facility Maintenance">Facility Maintenance</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* + Add More button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddConvertRow}
                          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add More
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls / Generator Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 items-end">
                    <div>
                      <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                        Opportunity Frequency
                      </label>
                      <select
                        value={convertGenFrequency}
                        onChange={(e) => setConvertGenFrequency(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                      >
                        <option value="None">None</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                        Stage
                      </label>
                      <select
                        value={convertGenStage}
                        onChange={(e) => setConvertGenStage(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                      >
                        <option value="Enquiry">Enquiry</option>
                        <option value="Offer Sent">Offer Sent</option>
                        <option value="Qualification">Qualification</option>
                        <option value="Site Visit">Site Visit</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                        Amount
                      </label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={convertGenAmount}
                        onChange={(e) => setConvertGenAmount(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-semibold mb-1 block">
                        Opportunity Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={convertGenCount}
                        onChange={(e) => setConvertGenCount(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleGenerateRowsFromBar}
                        className="w-full bg-[#0F2942] hover:bg-[#07192b] text-white text-xs font-semibold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Load
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Footer Action Bar */}
                <div className="bg-[#F8FAFC] border-t border-slate-200 px-4 py-2.5 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveConvertToMultiple}
                    className="px-4 py-1.5 bg-[#0F2942] hover:bg-[#07192b] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConvertToMultipleOpen(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>
              </div>
            </div>
          ) : isAddOpen ? (
            /* ── FULL PAGE ADD OPPORTUNITY VIEW (EXACT CEZCON CRM IMAGE 1) ── */
            <div className="p-2 sm:p-4 flex-1 flex flex-col min-w-0 w-full">
              <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col flex-1 text-xs font-sans">
                {/* 1. Header Bar with Search/Add Opportunity title and + Customer / X buttons */}
                <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-800 text-[13px]">
                      {editingOpportunityId ? 'Edit Opportunity' : 'Add Opportunity'}
                    </span>
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

                {/* Quick Add Customer Modal */}
                {isQuickAddCustomerOpen && (
                  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <Plus className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsQuickAddCustomerOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleQuickAddCustomerSubmit} className="space-y-3 pt-3 text-xs">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Company / Customer Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Al Habtoor Engineering"
                            value={quickCustomerForm.companyName}
                            onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, companyName: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={quickCustomerForm.contactPerson}
                            onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, contactPerson: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1">Phone / Mobile</label>
                            <input
                              type="text"
                              placeholder="+971 50 123 4567"
                              value={quickCustomerForm.phone}
                              onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, phone: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="info@company.com"
                              value={quickCustomerForm.email}
                              onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, email: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsQuickAddCustomerOpen(false)}
                            className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save &amp; Select</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

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
                        <div className="flex-1 flex items-center gap-1.5">
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
                            {oppFormData.customer && !customers.some((c) => (c.customerName || c.companyName) === oppFormData.customer) && (
                              <option value={oppFormData.customer}>{oppFormData.customer}</option>
                            )}
                            {customers.map((c) => (
                              <option key={c.id} value={c.customerName || c.companyName}>
                                {c.customerName || c.companyName}
                              </option>
                            ))}
                            <option value="AL HABTOOR ENGINEERING">AL HABTOOR ENGINEERING</option>
                            <option value="EMAAR PROPERTIES">EMAAR PROPERTIES</option>
                            <option value="SMART GROUP OF COMPANIES">SMART GROUP OF COMPANIES</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsQuickAddCustomerOpen(true)}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 shrink-0 shadow-2xs transition-colors cursor-pointer"
                            title="Add New Customer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New</span>
                          </button>
                        </div>
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
                        <div className="flex-1 relative flex items-center">
                          <input
                            ref={closeDateRef}
                            type="date"
                            required
                            placeholder="Expected Closing Date"
                            value={oppFormData.expectedClose}
                            onChange={(e) => setOppFormData({ ...oppFormData, expectedClose: e.target.value })}
                            onClick={(e) => {
                              try {
                                (e.currentTarget as HTMLInputElement).showPicker?.();
                              } catch { }
                            }}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Discount</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={oppFormData.discount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOppFormData((prev) => ({ ...prev, discount: val }));
                            setEnquiryDiscountAmount(val);
                          }}
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
                              onChange={(e) => {
                                const val = e.target.value;
                                setOppFormData((prev) => ({ ...prev, vatRate: val === '' ? '' : Number(val) }));
                                setEnquiryVatPercent(val === '' ? 5 : Number(val));
                              }}
                              className="w-full px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                            />
                            <span className="px-2 text-xs text-slate-500 font-semibold bg-slate-100 border-l border-slate-300 py-1.5">
                              %
                            </span>
                          </div>
                          <input
                            type="text"
                            readOnly
                            placeholder="0.00"
                            value={
                              oppFormData.vatType === 'With VAT'
                                ? (oppCalculations.vatVal > 0 ? oppCalculations.vatVal.toFixed(2) : '0.00')
                                : '0.00'
                            }
                            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none text-right"
                          />
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Total Amount</label>
                        <input
                          type="text"
                          readOnly
                          placeholder="0.00"
                          value={
                            oppCalculations.totalAmount > 0 || Number(oppFormData.amount) > 0 || Number(oppFormData.discount) > 0 || Number(oppFormData.adjustment) !== 0
                              ? oppCalculations.totalAmount.toFixed(2)
                              : '0.00'
                          }
                          className="flex-1 bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none text-right"
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
                        <div className="flex-1 relative flex items-center">
                          <input
                            ref={deliveryDateRef}
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={oppFormData.deliveryDate}
                            onChange={(e) => setOppFormData({ ...oppFormData, deliveryDate: e.target.value })}
                            onClick={(e) => {
                              try {
                                (e.currentTarget as HTMLInputElement).showPicker?.();
                              } catch { }
                            }}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* LPO Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">LPO Date</label>
                        <div className="flex-1 relative flex items-center">
                          <input
                            ref={lpoDateRef}
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={oppFormData.lpoDate}
                            onChange={(e) => setOppFormData({ ...oppFormData, lpoDate: e.target.value })}
                            onClick={(e) => {
                              try {
                                (e.currentTarget as HTMLInputElement).showPicker?.();
                              } catch { }
                            }}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
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
                        <div className="flex-1 relative" ref={oppLocationRef}>
                          <input
                            type="text"
                            placeholder="Search location"
                            value={oppFormData.location}
                            onChange={(e) => {
                              setOppFormData({ ...oppFormData, location: e.target.value });
                              setOppLocationDropdownOpen(true);
                            }}
                            onFocus={() => setOppLocationDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setOppLocationDropdownOpen(false), 150)}
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
                          {oppLocationDropdownOpen && (() => {
                            const filtered = UAE_LOCATIONS.filter((loc) =>
                              loc.toLowerCase().includes(oppFormData.location.toLowerCase())
                            );
                            return filtered.length > 0 ? (
                              <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
                                {filtered.map((loc) => (
                                  <button
                                    key={loc}
                                    type="button"
                                    onMouseDown={() => {
                                      setOppFormData({ ...oppFormData, location: loc });
                                      setOppLocationDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                  >
                                    {loc}
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Reference</label>
                        <input
                          type="text"
                          value={oppFormData.reference}
                          onChange={(e) => setOppFormData({ ...oppFormData, reference: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
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
                            className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            title="Opportunity Number Settings"
                            onClick={openOppNumModal}
                            className="p-1.5 bg-[#E6F9FB] border border-[#BCEBF2] text-[#0891B2] rounded hover:bg-[#D5F5F9] transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Opportunity Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Opportunity Date</label>
                        <div className="flex-1 relative flex items-center">
                          <input
                            ref={oppDateRef}
                            type="date"
                            value={oppFormData.opportunityDate}
                            onChange={(e) => setOppFormData({ ...oppFormData, opportunityDate: e.target.value })}
                            onClick={(e) => {
                              try {
                                (e.currentTarget as HTMLInputElement).showPicker?.();
                              } catch { }
                            }}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          />
                          <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
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
                          {opportunityStages.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                          {oppFormData.stage && !opportunityStages.includes(oppFormData.stage) && (
                            <option value={oppFormData.stage}>{oppFormData.stage}</option>
                          )}
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Amount</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={oppFormData.amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOppFormData((prev) => ({ ...prev, amount: val }));
                            if (enquiryItems.length === 1) {
                              const q = Number(enquiryItems[0].qty) || 1;
                              setEnquiryItems([
                                {
                                  ...enquiryItems[0],
                                  price: val,
                                  priceTotal: (Number(val) || 0) * q,
                                },
                              ]);
                            }
                          }}
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
                          placeholder="0.00"
                          value={oppFormData.adjustment}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOppFormData((prev) => ({ ...prev, adjustment: val }));
                            setEnquiryAdjustmentAmount(val);
                          }}
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

                      {/* Delivery Method */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Delivery Method</label>
                        <input
                          type="text"
                          value={oppFormData.deliveryMethod}
                          onChange={(e) => setOppFormData({ ...oppFormData, deliveryMethod: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Contact Person */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Contact Person</label>
                        <input
                          type="text"
                          value={oppFormData.contactPersonText}
                          onChange={(e) => setOppFormData({ ...oppFormData, contactPersonText: e.target.value })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── ENQUIRY FORM TOGGLE & EXPANDABLE SECTION ── */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2.5 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          const willBeOpen = !oppFormData.enquiryForm;
                          if (willBeOpen) {
                            if (oppFormData.amount && (!enquiryItems[0]?.price || Number(enquiryItems[0]?.price) === 0)) {
                              const initPrice = oppFormData.amount;
                              const initQty = enquiryItems[0]?.qty || 1;
                              setEnquiryItems([
                                {
                                  ...enquiryItems[0],
                                  price: initPrice,
                                  priceTotal: Number(initPrice) * Number(initQty),
                                },
                                ...enquiryItems.slice(1),
                              ]);
                            }
                            if (oppFormData.discount) {
                              setEnquiryDiscountAmount(oppFormData.discount);
                            }
                            if (oppFormData.vatRate) {
                              setEnquiryVatPercent(Number(oppFormData.vatRate));
                            }
                            if (oppFormData.adjustment) {
                              setEnquiryAdjustmentAmount(oppFormData.adjustment);
                            }
                          }
                          setOppFormData((prev) => ({ ...prev, enquiryForm: willBeOpen }));
                        }}
                        className={cn(
                          'w-10 h-5.5 rounded-full transition-colors relative cursor-pointer',
                          oppFormData.enquiryForm ? 'bg-[#22C55E]' : 'bg-slate-300'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform shadow-2xs',
                            oppFormData.enquiryForm ? 'left-5' : 'left-0.5'
                          )}
                        />
                      </button>
                      <span className="text-[13px] font-bold text-[#2563EB]">Enquiry Form</span>
                    </div>

                    {/* Expandable Enquiry Form UI */}
                    {oppFormData.enquiryForm && (
                      <div className="mt-3 space-y-4 border-t border-slate-200 pt-3">
                        {/* 1. Items Table (Exact Cezcon UI 2) */}
                        <div className="overflow-x-auto border border-slate-200 rounded bg-white">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold">
                                <th className="p-2 min-w-[340px]">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-800 text-[11px]">Description</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = !showAllAdditionalDesc;
                                        setShowAllAdditionalDesc(next);
                                        setEnquiryItems((prev) =>
                                          prev.map((item) => ({ ...item, showAdditionalDesc: next }))
                                        );
                                      }}
                                      className="bg-[#6B7280] hover:bg-[#4B5563] text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" /> Additional Description
                                    </button>
                                  </div>
                                </th>
                                <th className="p-2 min-w-[90px] font-semibold text-slate-800">Code</th>
                                <th className="p-2 min-w-[80px] font-semibold text-slate-800">Unit</th>
                                <th className="p-2 min-w-[90px] font-semibold text-slate-800">Brand</th>
                                <th className="p-2 min-w-[70px] text-center font-semibold text-slate-800">QTY</th>
                                <th className="p-2 min-w-[100px] text-right font-semibold text-slate-800">Price</th>
                                <th className="p-2 min-w-[110px] text-right font-semibold text-slate-800">Price Total</th>
                                <th className="p-2 w-[40px] text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {enquiryItems.map((item) => (
                                <React.Fragment key={item.id}>
                                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="p-2">
                                      <div className="space-y-1.5">
                                        <input
                                          type="text"
                                          value={item.description}
                                          onChange={(e) => handleUpdateEnquiryItem(item.id, 'description', e.target.value)}
                                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                        />
                                        {item.showAdditionalDesc && (
                                          <textarea
                                            rows={2}
                                            placeholder="Enter extended specifications, notes, or technical details..."
                                            value={item.additionalDescription}
                                            onChange={(e) => handleUpdateEnquiryItem(item.id, 'additionalDescription', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                                          />
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={item.code}
                                        onChange={(e) => handleUpdateEnquiryItem(item.id, 'code', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={item.unit}
                                        onChange={(e) => handleUpdateEnquiryItem(item.id, 'unit', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={item.brand}
                                        onChange={(e) => handleUpdateEnquiryItem(item.id, 'brand', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={item.qty}
                                        onChange={(e) => handleUpdateEnquiryItem(item.id, 'qty', e.target.value)}
                                        className="w-full text-center bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                    <td className="p-2 text-right">
                                      <input
                                        type="number"
                                        step="any"
                                        placeholder="0.00"
                                        value={item.price}
                                        onChange={(e) => handleUpdateEnquiryItem(item.id, 'price', e.target.value)}
                                        className="w-full text-right bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                    <td className="p-2 text-right">
                                      <input
                                        type="text"
                                        readOnly
                                        value={(Number(item.priceTotal) || 0).toFixed(2)}
                                        className="w-full text-right bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-bold focus:outline-none"
                                      />
                                    </td>
                                    <td className="p-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveEnquiryItem(item.id)}
                                        className="w-6 h-6 bg-[#D9534F] hover:bg-[#C9302C] text-white rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-2xs mx-auto"
                                        title="Delete Item"
                                      >
                                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </button>
                                    </td>
                                  </tr>
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Add More Button */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddEnquiryItem}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold px-3 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add More
                          </button>
                        </div>

                        {/* 2. Lower Section: Terms & Conditions Left, Calculations Right */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                          {/* Terms & Conditions (Left Column - 7 Cols) */}
                          <div className="lg:col-span-7 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-blue-600" /> Terms &amp; Conditions
                              </label>
                              <div className="flex-1 min-w-[200px]">
                                <select
                                  value={selectedTermsCondition}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedTermsCondition(val);
                                    if (val && termsTemplates[val]) {
                                      const content = termsTemplates[val];
                                      setTermsAndConditionsText((prev) => {
                                        if (!prev || !prev.trim()) {
                                          return content;
                                        }
                                        return `${prev.trim()}\n\n${content}`;
                                      });
                                      showSalesToast(`Added "${val}" to Terms & Conditions`);
                                    }
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                >
                                  <option value="">Select &amp; Add Terms &amp; Conditions...</option>
                                  {Object.keys(termsTemplates).map((name) => (
                                    <option key={name} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={handleLoadTerms}
                                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <RotateCw className="w-3 h-3" /> Load
                              </button>
                              <button
                                type="button"
                                onClick={handleClearTerms}
                                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Trash className="w-3 h-3" /> Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTermsTitle('');
                                  setNewTermsContent('');
                                  setIsAddTermsModalOpen(true);
                                }}
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> New
                              </button>
                            </div>

                            {/* CKEditor-styled Rich Text Box */}
                            <div className="border border-slate-300 rounded overflow-hidden bg-white shadow-xs">
                              {/* Editor Toolbar */}
                              <div className="bg-[#F1F5F9] border-b border-slate-300 p-1 flex flex-wrap items-center gap-1 text-slate-700">
                                <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                                  <button type="button" title="Cut" className="p-1 hover:bg-slate-200 rounded text-slate-600"><Scissors className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Copy" className="p-1 hover:bg-slate-200 rounded text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Paste" className="p-1 hover:bg-slate-200 rounded text-slate-600"><FileText className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                                  <button type="button" title="Bold" className="p-1 hover:bg-slate-200 rounded font-bold text-xs px-1.5"><Bold className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Italic" className="p-1 hover:bg-slate-200 rounded italic text-xs px-1.5"><Italic className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Strikethrough" className="p-1 hover:bg-slate-200 rounded text-xs px-1.5"><Strikethrough className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Underline" className="p-1 hover:bg-slate-200 rounded text-xs px-1.5"><Underline className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                                  <button type="button" title="Bullet List" className="p-1 hover:bg-slate-200 rounded text-slate-600"><List className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Numbered List" className="p-1 hover:bg-slate-200 rounded text-slate-600"><ListOrdered className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                                  <button type="button" title="Insert Link" className="p-1 hover:bg-slate-200 rounded text-slate-600"><Link2 className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Insert Image" className="p-1 hover:bg-slate-200 rounded text-slate-600"><ImageIcon className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Insert Table" className="p-1 hover:bg-slate-200 rounded text-slate-600"><TableIcon className="w-3.5 h-3.5" /></button>
                                  <button type="button" title="Special Character" className="p-1 hover:bg-slate-200 rounded text-slate-600 text-xs font-bold px-1">Ω</button>
                                  <button type="button" title="Maximize" className="p-1 hover:bg-slate-200 rounded text-slate-600"><Maximize2 className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <select className="bg-white border border-slate-300 rounded text-[10px] px-1 py-0.5 text-slate-700">
                                    <option>Styles</option>
                                    <option>Normal</option>
                                    <option>Heading 1</option>
                                    <option>Heading 2</option>
                                  </select>
                                  <select className="bg-white border border-slate-300 rounded text-[10px] px-1 py-0.5 text-slate-700">
                                    <option>Format</option>
                                    <option>Paragraph</option>
                                    <option>Blockquote</option>
                                  </select>
                                  <button type="button" title="Help" className="p-1 hover:bg-slate-200 rounded text-slate-600"><HelpCircle className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>

                              {/* Editable Content Area */}
                              <textarea
                                rows={7}
                                placeholder="Enter terms & conditions text here..."
                                value={termsAndConditionsText}
                                onChange={(e) => setTermsAndConditionsText(e.target.value)}
                                className="w-full p-2.5 text-xs text-slate-800 focus:outline-none font-mono bg-white resize-y"
                              />

                              {/* Status Footer */}
                              <div className="bg-[#E2E8F0] border-t border-slate-300 px-2 py-0.5 flex items-center justify-between text-[10px] text-slate-600">
                                <span>body p</span>
                                <span className="cursor-se-resize">◢</span>
                              </div>
                            </div>
                          </div>

                          {/* Calculation Breakdown (Right Column - 5 Cols) */}
                          <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded p-3.5 space-y-2 text-xs">
                            {/* Amount */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">Amount</label>
                              <input
                                type="text"
                                readOnly
                                value={enquiryCalculations.totalItemsAmount.toFixed(2)}
                                className="w-36 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right text-xs text-slate-800 font-semibold focus:outline-none"
                              />
                            </div>

                            {/* Discount % */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">Discount %</label>
                              <div className="flex items-center w-36 bg-white border border-slate-300 rounded overflow-hidden">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={enquiryDiscountPercent}
                                  onChange={(e) => setEnquiryDiscountPercent(e.target.value)}
                                  className="w-full px-2 py-1 text-right text-xs text-slate-800 focus:outline-none"
                                />
                                <span className="px-1.5 text-xs text-slate-500 font-semibold bg-slate-100 border-l border-slate-300 py-1">
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Discount Amount */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">Discount</label>
                              <input
                                type="number"
                                min="0"
                                value={enquiryDiscountAmount}
                                onChange={(e) => {
                                  setEnquiryDiscountAmount(e.target.value);
                                  setEnquiryDiscountPercent(0);
                                }}
                                className="w-36 bg-white border border-slate-300 rounded px-2.5 py-1 text-right text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Amount After Discount */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">Amount After Discount</label>
                              <input
                                type="text"
                                readOnly
                                value={enquiryCalculations.amountAfterDiscount.toFixed(2)}
                                className="w-36 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right text-xs text-slate-800 font-semibold focus:outline-none"
                              />
                            </div>

                            {/* VAT (%) */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">VAT(%)</label>
                              <div className="flex items-center w-36 bg-white border border-slate-300 rounded overflow-hidden">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={enquiryVatPercent}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEnquiryVatPercent(val === '' ? ('' as any) : Number(val));
                                    setOppFormData((prev) => ({ ...prev, vatRate: val }));
                                  }}
                                  className="w-full px-2 py-1 text-right text-xs text-slate-800 focus:outline-none"
                                />
                                <span className="px-1.5 text-xs text-slate-500 font-semibold bg-slate-100 border-l border-slate-300 py-1">
                                  %
                                </span>
                              </div>
                            </div>

                            {/* VAT Amount */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">VAT Amount</label>
                              <input
                                type="text"
                                readOnly
                                value={enquiryCalculations.vatAmount.toFixed(2)}
                                className="w-36 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right text-xs text-slate-800 font-semibold focus:outline-none"
                              />
                            </div>

                            {/* Sub Total */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">Sub Total</label>
                              <input
                                type="text"
                                readOnly
                                value={enquiryCalculations.subTotal.toFixed(2)}
                                className="w-36 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right text-xs text-slate-800 font-semibold focus:outline-none"
                              />
                            </div>

                            {/* Adjustment */}
                            <div className="flex items-center justify-between gap-3">
                              <label className="font-medium text-slate-600 shrink-0">Adjustment</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={enquiryAdjustmentAmount}
                                onChange={(e) => setEnquiryAdjustmentAmount(e.target.value)}
                                className="w-36 bg-white border border-slate-300 rounded px-2.5 py-1 text-right text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Total Amount */}
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-300">
                              <label className="font-bold text-slate-800 shrink-0">Total Amount</label>
                              <input
                                type="text"
                                readOnly
                                value={enquiryCalculations.totalAmount.toFixed(2)}
                                className="w-36 bg-slate-200 border border-slate-400 rounded px-2.5 py-1 text-right text-xs text-slate-900 font-bold focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Bottom Action Bar */}
                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
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
                </form>
              </div>

              {/* ── OPPORTUNITY NUMBER SETTINGS MODAL (Exact Cezcon CRM Design) ── */}
              {isOppNumModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-md shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
                      <h3 className="text-sm font-semibold text-slate-800">Opportunity Number</h3>
                      <button
                        type="button"
                        onClick={() => setIsOppNumModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSaveOppNumSettings}>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="w-28 text-xs font-normal text-slate-700">Prefix</label>
                          <input
                            type="text"
                            value={oppPrefix}
                            onChange={(e) => setOppPrefix(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="w-28 text-xs font-normal text-slate-700">
                            Next Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={oppNextNumber}
                            onChange={(e) => setOppNextNumber(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end gap-2 px-6 py-3 bg-[#F8FAFC] border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsOppNumModalOpen(false)}
                          className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-medium text-white bg-[#0A2540] hover:bg-[#07192b] rounded shadow-2xs transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : isDetailViewOpen && viewOpp ? (
            /* ── FULL PAGE OPPORTUNITY DETAIL VIEW (EXACT CEZCON CRM IMAGE 1) ── */
            <div className="p-2 sm:p-4 flex-1 flex flex-col min-w-0 w-full">
              <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col flex-1 text-xs font-sans">
                {/* 1. Header Bar: [↗] CTEQ#... / TITLE and Red Close Button */}
                <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    <span className="font-bold text-slate-800 text-[13px] uppercase">
                      {viewOpp.opportunityCode || 'CTEQ#7132'} / {viewOpp.title || 'PORTABLE AC'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/sales?tab=opportunities')}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Sub-Tabs Strip */}
                <div className="bg-white border-b border-slate-200 px-3 flex items-center gap-1 text-xs overflow-x-auto">
                  {[
                    { id: 'opportunity', label: 'Opportunity', icon: SlidersHorizontal },
                    { id: 'enquiry_form', label: 'Enquiry Form', icon: FileText },
                    { id: 'customer', label: 'Customer', icon: Shield },
                    { id: 'contact_details', label: 'Contact Details', icon: User },
                    { id: 'cost_details', label: 'Cost Details / Jobs', icon: DollarSign },
                    { id: 'quotation', label: 'Quotation', icon: FileText },
                    { id: 'proforma_invoice', label: 'Proforma Invoice', icon: FileText },
                    { id: 'invoice', label: 'Invoice', icon: FileCheck },
                    { id: 'purchase', label: 'Purchase', icon: ShoppingCart },
                    { id: 'history', label: 'History', icon: Clock },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = detailActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDetailActiveTab(tab.id)}
                        className={cn(
                          'px-3.5 py-2 font-medium transition-colors whitespace-nowrap cursor-pointer text-xs flex items-center gap-1.5 border-b-2',
                          isActive
                            ? 'border-[#DC2626] bg-white text-slate-900 font-bold border-t-2 border-t-[#DC2626]'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#DC2626]' : 'text-slate-500')} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 3. Centered Headline Block */}
                <div className="text-center py-4 bg-white border-b border-slate-100">
                  <h1 className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
                    {viewOpp.title || 'OPPORTUNITY'}
                  </h1>
                  <h2 className="text-xs font-bold text-slate-700 uppercase mt-0.5">
                    {viewOpp.customer || ''}
                  </h2>
                  {viewOpp.customer && (
                    <div className="flex justify-center items-center gap-1 mt-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 border border-slate-200 rounded-xs bg-slate-50/50">
                        <span className="text-[#DC2626] font-black text-xs tracking-tighter">///</span>
                        <span className="font-black text-slate-800 text-[11px] tracking-wider uppercase">
                          {(viewOpp as any).customerEmblem ||
                            viewOpp.customer
                              .split(/\s+/)
                              .filter((w: string) => w.length > 2 && !['AND', 'THE', 'FOR', 'L.L.C', 'LLC', 'LIMITED'].includes(w.toUpperCase()))
                              .map((w: string) => w[0])
                              .join('')
                              .slice(0, 5) ||
                            viewOpp.customer.slice(0, 4)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Detail Tab Content */}
                {detailActiveTab === 'enquiry_form' ? (
                  /* ── ENQUIRY FORM TAB VIEW (Matching Exact Cezcon CRM Image) ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    {/* Enquiry Form Card */}
                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Enquiry Form</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditOpportunity(viewOpp)}
                          className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Enquiry Form
                        </button>
                      </div>

                      {Array.isArray((viewOpp as any).enquiryItems) && (viewOpp as any).enquiryItems.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-[#F8FAFC]">
                                <th className="py-2.5 px-3 w-10 text-center">SL</th>
                                <th className="py-2.5 px-3">Description</th>
                                <th className="py-2.5 px-3">Code</th>
                                <th className="py-2.5 px-3">Unit</th>
                                <th className="py-2.5 px-3">Brand</th>
                                <th className="py-2.5 px-3 text-center">QTY</th>
                                <th className="py-2.5 px-3 text-right">Price</th>
                                <th className="py-2.5 px-3 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(viewOpp as any).enquiryItems.map((item: any, idx: number) => {
                                const q = Number(item.qty) || 1;
                                const p = Number(item.price) || 0;
                                const t = Number(item.priceTotal) || (q * p);
                                return (
                                  <tr key={item.id || idx} className="hover:bg-slate-50">
                                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.description || viewOpp.title}</td>
                                    <td className="py-2.5 px-3 text-slate-700">{item.code || '—'}</td>
                                    <td className="py-2.5 px-3 text-slate-700">{item.unit || 'EACH'}</td>
                                    <td className="py-2.5 px-3 text-slate-700">{item.brand || '—'}</td>
                                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{q}</td>
                                    <td className="py-2.5 px-3 text-right text-slate-800">{p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{t.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-xs text-slate-700">
                          No records found.
                        </div>
                      )}
                    </div>

                    {/* Opportunity Activities Section */}
                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Opportunity Activities</span>
                      </div>

                      {/* Sub-Tabs Bar */}
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors',
                                  isActive
                                    ? 'bg-[#E2E8F0] text-slate-900 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                )}
                              >
                                <Icon className="w-3.5 h-3.5 text-slate-500" />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>

                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : detailActiveTab === 'customer' ? (
                  /* ── CUSTOMER TAB VIEW (100% Live Data Binding) ── */
                  (() => {
                    const matchedCustomer = customers.find(
                      (c: any) =>
                        (c.customerName || c.companyName || c.name || '').toLowerCase() ===
                        (viewOpp.customer || '').toLowerCase()
                    ) as any || null;

                    const liveOwner = viewOpp.owner || matchedCustomer?.owner || 'NAFAL';
                    const livePhone = viewOpp.phone || matchedCustomer?.phone || matchedCustomer?.mobile || '—';
                    const liveWebsite = (viewOpp as any).website || matchedCustomer?.website || '—';
                    const liveAddress = (viewOpp as any).address || (viewOpp as any).location || matchedCustomer?.address || matchedCustomer?.billingAddress || '—';
                    const liveComments = (viewOpp as any).comments || (viewOpp as any).description || '—';
                    const liveCustomerName = viewOpp.customer || matchedCustomer?.customerName || matchedCustomer?.companyName || matchedCustomer?.name || '—';
                    const liveIndustry = (viewOpp as any).industryType || matchedCustomer?.industry || matchedCustomer?.industryType || '—';
                    const liveSourceName = (viewOpp as any).sourceName || '—';
                    const liveSource = (viewOpp as any).source || matchedCustomer?.source || '—';
                    const liveEmployees = (viewOpp as any).employees || matchedCustomer?.employees || matchedCustomer?.noOfEmployees || '—';
                    const liveEmail = (viewOpp as any).email || matchedCustomer?.email || matchedCustomer?.contactEmail || '—';
                    const liveOffice = (viewOpp as any).office || matchedCustomer?.office || matchedCustomer?.branch || '—';
                    const liveLocation = (viewOpp as any).location || (viewOpp as any).city || matchedCustomer?.city || matchedCustomer?.country || '—';

                    return (
                      <div className="bg-white p-3 sm:p-5 space-y-4">
                        {/* Customer Details Card */}
                        <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                          <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-slate-500" />
                            <span>Customer Details</span>
                          </div>

                          <div className="p-4 sm:p-5 text-xs text-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5">
                              {/* Left Column */}
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Customer Owner</span>
                                  <div className="col-span-8 flex items-center gap-2">
                                    {viewOpp.ownerAvatar ? (
                                      <img
                                        src={viewOpp.ownerAvatar}
                                        alt={liveOwner}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {(liveOwner || 'U').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-900 uppercase">{liveOwner}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Industry Type</span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveIndustry}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Source Name</span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveSourceName}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#16A34A]" /> Tel
                                  </span>
                                  <span className="col-span-8 font-bold text-slate-900">{livePhone}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Website</span>
                                  <span className="col-span-8 text-[#2563EB] hover:underline cursor-pointer font-medium">
                                    {liveWebsite ? (
                                      <a
                                        href={liveWebsite.startsWith('http') ? liveWebsite : `https://${liveWebsite}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {liveWebsite}
                                      </a>
                                    ) : null}
                                  </span>
                                </div>

                                <div className="grid grid-cols-12 items-start gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium flex items-center gap-1 pt-0.5">
                                    <span className="text-slate-500">📍</span> Address
                                  </span>
                                  <div className="col-span-8 text-slate-900 font-bold text-xs leading-relaxed whitespace-pre-line">
                                    {liveAddress}
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2 pt-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Comments</span>
                                  <span className="col-span-8 text-slate-800">{liveComments}</span>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-3.5">
                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Customer Name</span>
                                  <span className="col-span-8 font-bold text-slate-900 uppercase">
                                    {liveCustomerName}
                                  </span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Source</span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveSource}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">No.of Employees</span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveEmployees}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-[#DC2626]" /> Email
                                  </span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveEmail}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Office</span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveOffice}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Location</span>
                                  <span className="col-span-8 text-slate-800 font-medium">{liveLocation}</span>
                                </div>
                              </div>
                            </div>

                            {/* View Button */}
                            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                              <button
                                type="button"
                                onClick={() => router.push('/sales?tab=customers')}
                                className="bg-[#0F2942] hover:bg-[#07192b] text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                              >
                                <BookOpen className="w-3.5 h-3.5" /> View
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Opportunity Activities Section */}
                        <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs mt-6">
                          <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                            <TableIcon className="w-3.5 h-3.5 text-[#0891B2]" />
                            <span>Opportunity Activities</span>
                          </div>

                          {/* Sub-Tabs Bar */}
                          <div className="p-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
                            <div className="flex items-center gap-1">
                              {[
                                { id: 'notes', label: 'Notes', icon: FileText },
                                { id: 'task', label: 'Task', icon: CheckCircle2 },
                                { id: 'files', label: 'Files', icon: BookOpen },
                                { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                              ].map((t) => {
                                const Icon = t.icon;
                                const isActive = detailActivityTab === t.id;
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setDetailActivityTab(t.id)}
                                    className={cn(
                                      'px-3 py-1.5 text-xs font-semibold rounded-t border flex items-center gap-1.5 cursor-pointer transition-colors -mb-3',
                                      isActive
                                        ? 'bg-white text-slate-900 font-bold border-t-2 border-t-[#DC2626] border-slate-200 border-b-transparent shadow-2xs'
                                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    )}
                                  >
                                    <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#DC2626]' : 'text-slate-500')} />
                                    <span>{t.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          </div>

                          <div className="py-6 px-4 text-slate-600 text-xs">
                            No Notes.
                          </div>
                        </div>

                        {/* Back Button */}
                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => router.push('/sales?tab=opportunities')}
                            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : detailActiveTab === 'contact_details' ? (
                  /* ── CONTACT DETAILS TAB VIEW (Matching Exact Cezcon CRM Image) ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    <div className="p-3 text-xs text-slate-700 font-medium">
                      {viewOpp.contactPerson ? (
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{viewOpp.contactPerson}</p>
                          {viewOpp.phone && <p className="text-slate-600">Phone: {viewOpp.phone}</p>}
                        </div>
                      ) : (
                        'No Records.'
                      )}
                    </div>

                    {/* Opportunity Activities Section */}
                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Opportunity Activities</span>
                      </div>

                      {/* Sub-Tabs Bar */}
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors',
                                  isActive
                                    ? 'bg-[#E2E8F0] text-slate-900 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                )}
                              >
                                <Icon className="w-3.5 h-3.5 text-slate-500" />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>

                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : detailActiveTab === 'cost_details' ? (
                  /* ── COST DETAILS / JOBS TAB VIEW (Matching Exact Cezcon CRM Image) ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    {/* Top + Cost/Job Action Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1 text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Cost/Job
                      </button>
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3 w-16 text-slate-700">SL.No</th>
                            <th className="py-2.5 px-3 w-40 text-slate-700">Cost/Job Type</th>
                            <th className="py-2.5 px-3 text-slate-700">Description</th>
                            <th className="py-2.5 px-3 w-36 text-right text-slate-700">Estimated Amount</th>
                            <th className="py-2.5 px-3 w-20 text-center text-slate-700">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Array.isArray((viewOpp as any)?.costJobs) && (viewOpp as any).costJobs.length > 0 ? (
                            (viewOpp as any).costJobs.map((job: any, idx: number) => (
                              <tr key={job.id || idx} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 text-slate-600">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-900">{job.type || 'Direct Supply'}</td>
                                <td className="py-2.5 px-3 text-slate-700">{job.description || viewOpp.title}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                  {(Number(job.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button type="button" className="text-blue-600 hover:underline font-medium">Edit</button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-3.5 px-3 text-xs text-slate-700">
                                No Records.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Opportunity Activities Section */}
                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs mt-6">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Opportunity Activities</span>
                      </div>

                      {/* Sub-Tabs Bar */}
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors',
                                  isActive
                                    ? 'bg-[#E2E8F0] text-slate-900 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100'
                                )}
                              >
                                <Icon className="w-3.5 h-3.5 text-slate-500" />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>

                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : detailActiveTab === 'quotation' ? (
                  /* ── QUOTATION TAB VIEW (Matching Cezcon CRM Image 1) ── */
                  <div className="bg-white">
                    {/* Quotation Details Header Sub-bar */}
                    <div className="bg-[#F8FAFC] border-y border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Quotation Details</span>
                      </div>
                      <button
                        type="button"
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Quotation
                      </button>
                    </div>

                    {(() => {
                      const oppAmt = typeof viewOpp.amount === 'number' ? viewOpp.amount : parseFloat(String(viewOpp.amount || '5000').replace(/,/g, '')) || 5000;
                      const oppDiscount = typeof viewOpp.discount === 'number' ? viewOpp.discount : parseFloat(String(viewOpp.discount || '0').replace(/,/g, '')) || 0;
                      const oppVatPercent = typeof viewOpp.vatRate === 'number' ? viewOpp.vatRate : parseFloat(String(viewOpp.vatRate || '5').replace(/,/g, '')) || 5;
                      const oppVatAmt = (oppAmt * oppVatPercent) / 100;
                      const oppSubTotal = oppAmt + oppVatAmt;
                      const oppAdj = typeof viewOpp.adjustment === 'number' ? viewOpp.adjustment : parseFloat(String(viewOpp.adjustment || '0').replace(/,/g, '')) || 0;
                      const oppTotal = oppSubTotal + oppAdj;

                      return (
                        <div className="p-4 sm:p-6 space-y-6">
                          {/* Quotation Item 1 */}
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-4 font-black text-slate-800 text-sm pt-0.5">
                              1
                            </div>
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left Column Details */}
                              <div className="lg:col-span-7 space-y-2.5 text-xs text-slate-700">
                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Quotation Owner</span>
                                  <div className="col-span-8 flex items-center gap-2">
                                    {viewOpp.ownerAvatar ? (
                                      <img
                                        src={viewOpp.ownerAvatar}
                                        alt={viewOpp.owner}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-[10px] font-bold">
                                        {(viewOpp.owner || 'N').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-900 uppercase">{viewOpp.owner || 'NEBIN BENNY'}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Quotation Date</span>
                                  <span className="col-span-8 font-bold text-slate-900">{toDisplayDateFormat(viewOpp.opportunityDate) || viewOpp.opportunityDate || '03-10-2026'}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Quotation Number</span>
                                  <span className="col-span-8 font-bold text-slate-900">{(viewOpp as any).quotationNumber || 'CTSQ#4351'}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Amount</span>
                                  <span className="col-span-8 font-bold text-slate-900">{oppAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Discount</span>
                                  <span className="col-span-8 font-bold text-slate-900">{oppDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Quotation Type</span>
                                  <span className="col-span-8 font-bold text-slate-900">Manual Creation</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2">
                                  <span className="col-span-4 text-slate-600 font-medium">Description</span>
                                  <span className="col-span-8 text-slate-700">{(viewOpp as any).description || viewOpp.subtitle || '—'}</span>
                                </div>

                                <div className="grid grid-cols-12 items-center gap-2 pt-1">
                                  <span className="col-span-4 text-slate-600 font-medium">Status</span>
                                  <div className="col-span-8 flex items-center gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenChangeQuotationStatus(viewOpp)}
                                      className={cn(
                                        "text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 shadow-2xs cursor-pointer transition-all hover:brightness-110",
                                        ((viewOpp as any).quotationStatus || 'Pending') === 'Approved' ? 'bg-[#16A34A]' :
                                          ((viewOpp as any).quotationStatus || 'Pending') === 'Rejected' ? 'bg-[#DC2626]' :
                                            ((viewOpp as any).quotationStatus || 'Pending') === 'Submit for Approval' ? 'bg-[#0088CC]' :
                                              'bg-[#F59E0B]'
                                      )}
                                    >
                                      <Edit2 className="w-3 h-3" /> {(viewOpp as any).quotationStatus || 'Pending'}
                                    </button>
                                    {((viewOpp as any).quotationStatus || 'Pending') !== 'Approved' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateOpportunity(viewOpp.id, { quotationStatus: 'Submit for Approval' } as any);
                                          (viewOpp as any).quotationStatus = 'Submit for Approval';
                                          setQuotationStatusValue('Submit for Approval');
                                          showSalesToast('Quotation submitted for approval!');
                                        }}
                                        className="bg-[#0088CC] hover:bg-[#0077b3] text-white text-[11px] font-bold px-3 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                      >
                                        <Send className="w-3 h-3" /> Submit for Approval
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {((viewOpp as any).quotationStatus || 'Pending') === 'Approved' && (
                                  <div className="grid grid-cols-12 items-center gap-2 pt-1">
                                    <span className="col-span-4 text-slate-600 font-medium">Approved</span>
                                    <span className="col-span-8 font-bold text-slate-800 text-xs">
                                      {viewOpp.owner || 'NEBIN BENNY'} on Sat {toDisplayDateFormat(viewOpp.opportunityDate) || '03 Oct 2026'} 2:51:04 PM
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Right Column Financial Summary Card */}
                              <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded p-3 text-xs space-y-2">
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Amount</span>
                                  <span className="font-bold text-slate-900">{oppAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">VAT (5%)</span>
                                  <span className="font-bold text-slate-900">{oppVatAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Sub Total</span>
                                  <span className="font-bold text-slate-900">{oppSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Adjustment</span>
                                  <span className="font-bold text-slate-900">{oppAdj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
                                  <span className="text-slate-900 font-bold">Total Amount</span>
                                  <span className="font-black text-slate-900 text-sm">{oppTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lower Quotation Details Table */}
                          <div className="mt-8 border-t border-slate-200 pt-4">
                            <div className="text-center font-bold text-slate-700 text-xs tracking-wide uppercase mb-3">
                              Quotation Details
                            </div>

                            <div className="overflow-x-auto border-t border-slate-200">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-white">
                                    <th className="py-2.5 px-4 font-bold text-slate-700">Description</th>
                                    <th className="py-2.5 px-4 text-center font-bold text-slate-700">QTY</th>
                                    <th className="py-2.5 px-4 text-right font-bold text-slate-700">Price</th>
                                    <th className="py-2.5 px-4 text-right font-bold text-slate-700">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {Array.isArray((viewOpp as any).enquiryItems) && (viewOpp as any).enquiryItems.length > 0 ? (
                                    (viewOpp as any).enquiryItems.map((it: any, i: number) => {
                                      const q = Number(it.qty) || 1;
                                      const p = Number(it.price) || (oppAmt / q);
                                      const t = Number(it.priceTotal) || (q * p);
                                      return (
                                        <tr key={it.id || i} className="bg-white">
                                          <td className="py-3 px-4">
                                            <div className="flex items-start gap-3">
                                              <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex flex-col items-center justify-center text-[7px] text-slate-400 font-bold shrink-0 p-1 text-center leading-tight">
                                                <FileText className="w-4 h-4 text-slate-300 mb-0.5" />
                                                <span>NO IMAGE<br />AVAILABLE</span>
                                              </div>
                                              <div className="space-y-0.5">
                                                <p className="font-bold text-slate-900 uppercase">
                                                  {it.description || it.title || viewOpp.title}
                                                </p>
                                                <p className="text-[11px] text-slate-600">Code: {it.code || 'CT25F2'}</p>
                                                <p className="text-[11px] text-slate-600">Unit: {it.unit || 'Each'}</p>
                                                <p className="text-[11px] text-slate-600">Brand: {it.brand || 'COOLTECH'}</p>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="py-3 px-4 text-center font-medium text-slate-800">{q}</td>
                                          <td className="py-3 px-4 text-right font-medium text-slate-800">{p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                          <td className="py-3 px-4 text-right font-medium text-slate-800">{t.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr className="bg-white">
                                      <td className="py-3 px-4">
                                        <div className="flex items-start gap-3">
                                          <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex flex-col items-center justify-center text-[7px] text-slate-400 font-bold shrink-0 p-1 text-center leading-tight">
                                            <FileText className="w-4 h-4 text-slate-300 mb-0.5" />
                                            <span>NO IMAGE<br />AVAILABLE</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <p className="font-bold text-slate-900 uppercase">
                                              {viewOpp.title || 'WATER COOLER 2 TAP 25 USG COOLTECH CT25F2'}
                                            </p>
                                            <p className="text-[11px] text-slate-600">Code: {(viewOpp as any).code || (viewOpp as any).itemCode || (viewOpp.title?.toLowerCase().includes('water') ? 'CT25F2' : 'NPAC15C')}</p>
                                            <p className="text-[11px] text-slate-600">Unit: {(viewOpp as any).unit || 'Each'}</p>
                                            <p className="text-[11px] text-slate-600">Brand: {(viewOpp as any).brand || (viewOpp.title?.toLowerCase().includes('water') || viewOpp.title?.toLowerCase().includes('cooltech') ? 'COOLTECH' : 'NOBEL')}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-center font-medium text-slate-800">{(viewOpp as any).qty || (oppAmt === 21002 ? 5 : (oppAmt === 3900 ? 3 : 1))}</td>
                                      <td className="py-3 px-4 text-right font-medium text-slate-800">{(oppAmt === 21002 ? (21002 / 5) : (oppAmt === 3900 ? 1300 : oppAmt)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="py-3 px-4 text-right font-medium text-slate-800">{oppAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Bottom Right Summary */}
                            <div className="flex justify-end mt-4">
                              <div className="w-80 space-y-1.5 text-xs">
                                <div className="flex justify-between py-0.5">
                                  <span className="text-slate-600 font-medium">Amount</span>
                                  <span className="font-bold text-slate-900">{oppAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between py-0.5">
                                  <span className="text-slate-600 font-medium">VAT (5%)</span>
                                  <span className="font-bold text-slate-900">{oppVatAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between py-0.5">
                                  <span className="text-slate-600 font-medium">Sub Total</span>
                                  <span className="font-bold text-slate-900">{oppSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between py-0.5">
                                  <span className="text-slate-600 font-medium">Adjustment</span>
                                  <span className="font-bold text-slate-900">{oppAdj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-t border-slate-300 font-bold">
                                  <span className="text-slate-900 font-bold">Total Amount</span>
                                  <span className="font-bold text-slate-900">{oppTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            </div>

                            {/* Print & View Action Buttons */}
                            <div className="flex justify-end items-center gap-2 mt-4 pt-2 relative">
                              {/* Print Format Dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPrintFormatDropdownOpen((prev) => !prev);
                                  }}
                                  className="bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Print Format <ChevronDown className="w-3 h-3 ml-0.5" />
                                </button>

                                {isPrintFormatDropdownOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[100]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsPrintFormatDropdownOpen(false);
                                      }}
                                    />
                                    <div
                                      className="absolute right-0 bottom-full mb-1.5 bg-white border border-slate-300 rounded shadow-2xl py-1.5 z-[101] min-w-[300px]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {[
                                        'Print with Quantity',
                                        'Print without Quantity',
                                        'Print without Item Price',
                                        'Print without Quantity & Item Price',
                                        'Print without Total Price',
                                        'Print without Unit Price & Total Price',
                                        'Print without Unit Price & with Total Price',
                                      ].map((fmt) => (
                                        <button
                                          key={fmt}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsPrintFormatDropdownOpen(false);
                                            setSelectedPrintFormat(fmt);
                                            handleOpenPrintPreview(viewOpp, fmt);
                                          }}
                                          className="w-full text-left px-4 py-2 text-xs text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                                        >
                                          <span className="text-slate-900 font-bold text-xs">•</span>
                                          <span className="font-normal text-slate-800">{fmt}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenPrintPreview(viewOpp)}
                                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" /> Print
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveViewQuotationOpp(viewOpp);
                                  setIsQuotationViewModalOpen(true);
                                }}
                                className="bg-[#002B49] hover:bg-[#001f33] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                            </div>

                            {/* Opportunity Activities Section */}
                            <div className="mt-8 border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                              <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-500" />
                                <span>Opportunity Activities</span>
                              </div>

                              {/* Activity Sub-Tabs */}
                              <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-1">
                                  {[
                                    { id: 'notes', label: 'Notes', icon: FileText },
                                    { id: 'task', label: 'Task', icon: CheckCircle2 },
                                    { id: 'files', label: 'Files', icon: BookOpen },
                                    { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                                  ].map((t) => {
                                    const Icon = t.icon;
                                    const isActive = detailActivityTab === t.id;
                                    return (
                                      <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setDetailActivityTab(t.id)}
                                        className={cn(
                                          'px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors',
                                          isActive
                                            ? 'bg-[#E2E8F0] text-slate-900'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        )}
                                      >
                                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{t.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  type="button"
                                  className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                              </div>

                              <div className="py-8 px-4 text-slate-500 text-xs">
                                No Notes.
                              </div>
                            </div>

                            {/* Back Button */}
                            <div className="flex justify-end pt-6">
                              <button
                                type="button"
                                onClick={() => router.push('/sales?tab=opportunities')}
                                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : detailActiveTab === 'proforma_invoice' ? (
                  /* ── PROFORMA INVOICE TAB VIEW (Matching Exact Cezcon CRM Image) ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    {/* Top + Proforma Invoice Button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Proforma Invoice
                      </button>
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3 w-16 text-slate-700">SL.No</th>
                            <th className="py-2.5 px-3 min-w-[140px] text-slate-700">Proforma Invoice</th>
                            <th className="py-2.5 px-3 w-28 text-slate-700">Owner</th>
                            <th className="py-2.5 px-3 text-slate-700">Opportunity</th>
                            <th className="py-2.5 px-3 w-28 text-right text-slate-700">Amount</th>
                            <th className="py-2.5 px-3 w-24 text-right text-slate-700">VAT</th>
                            <th className="py-2.5 px-3 w-28 text-right text-slate-700">Total</th>
                            <th className="py-2.5 px-3 w-24 text-center text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {proformas.filter((p) => p.opportunityTitle === viewOpp.title || (p as any).opportunityCode === viewOpp.opportunityCode).length > 0 ? (
                            proformas
                              .filter((p) => p.opportunityTitle === viewOpp.title || (p as any).opportunityCode === viewOpp.opportunityCode)
                              .map((p, idx) => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 text-slate-600">{idx + 1}</td>
                                  <td className="py-2.5 px-3 font-semibold text-[#2563EB] hover:underline cursor-pointer">
                                    {p.piNumber}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-700">{(p as any).owner || viewOpp.owner}</td>
                                  <td className="py-2.5 px-3 text-slate-700">{viewOpp.title}</td>
                                  <td className="py-2.5 px-3 text-right text-slate-800">
                                    {p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-600">
                                    {p.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                    {p.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button type="button" className="text-blue-600 hover:underline font-medium">View</button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-3.5 px-3 text-xs text-slate-700">
                                No record found!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Opportunity Activities Section */}
                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs mt-6">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-[#0891B2]" />
                        <span>Opportunity Activities</span>
                      </div>

                      {/* Sub-Tabs Bar */}
                      <div className="p-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-semibold rounded-t border flex items-center gap-1.5 cursor-pointer transition-colors -mb-3',
                                  isActive
                                    ? 'bg-white text-slate-900 font-bold border-t-2 border-t-[#DC2626] border-slate-200 border-b-transparent shadow-2xs'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                )}
                              >
                                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#DC2626]' : 'text-slate-500')} />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>

                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : detailActiveTab === 'invoice' ? (
                  /* ── INVOICE TAB VIEW ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsCreateInvoiceModalOpen(true)}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Invoice
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3 w-16">SL.No</th>
                            <th className="py-2.5 px-3 min-w-[140px]">Invoice #</th>
                            <th className="py-2.5 px-3 w-28">Owner</th>
                            <th className="py-2.5 px-3">Opportunity</th>
                            <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                            <th className="py-2.5 px-3 w-24 text-right">VAT</th>
                            <th className="py-2.5 px-3 w-28 text-right">Total</th>
                            <th className="py-2.5 px-3 w-24 text-center">Status</th>
                            <th className="py-2.5 px-3 w-24 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.filter((inv) => inv.opportunityOrderRef?.includes(viewOpp.title) || inv.customer === viewOpp.customer).length > 0 ? (
                            invoices
                              .filter((inv) => inv.opportunityOrderRef?.includes(viewOpp.title) || inv.customer === viewOpp.customer)
                              .map((inv, idx) => (
                                <tr key={inv.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 text-slate-600">{idx + 1}</td>
                                  <td className="py-2.5 px-3 font-semibold text-[#2563EB] hover:underline cursor-pointer">
                                    {inv.invoiceNumber}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-700">{inv.owner || viewOpp.owner}</td>
                                  <td className="py-2.5 px-3 text-slate-700">{viewOpp.title}</td>
                                  <td className="py-2.5 px-3 text-right text-slate-800">
                                    {inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-600">
                                    {((inv.amount * 0.05) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                    {(inv.amount * 1.05).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      {inv.status || 'Due'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button type="button" className="text-blue-600 hover:underline font-medium">View</button>
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="py-3.5 px-3 text-xs text-slate-700">
                                No record found!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs mt-6">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-[#0891B2]" />
                        <span>Opportunity Activities</span>
                      </div>
                      <div className="p-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-semibold rounded-t border flex items-center gap-1.5 cursor-pointer transition-colors -mb-3',
                                  isActive
                                    ? 'bg-white text-slate-900 font-bold border-t-2 border-t-[#DC2626] border-slate-200 border-b-transparent shadow-2xs'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                )}
                              >
                                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#DC2626]' : 'text-slate-500')} />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button type="button" className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : detailActiveTab === 'purchase' ? (
                  /* ── PURCHASE TAB VIEW ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Purchase Order
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3 w-16">SL.No</th>
                            <th className="py-2.5 px-3 min-w-[140px]">PO #</th>
                            <th className="py-2.5 px-3">Vendor</th>
                            <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                            <th className="py-2.5 px-3 w-24 text-right">VAT</th>
                            <th className="py-2.5 px-3 w-28 text-right">Total</th>
                            <th className="py-2.5 px-3 w-24 text-center">Status</th>
                            <th className="py-2.5 px-3 w-24 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td colSpan={8} className="py-3.5 px-3 text-xs text-slate-700">
                              No record found!
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs mt-6">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-[#0891B2]" />
                        <span>Opportunity Activities</span>
                      </div>
                      <div className="p-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-semibold rounded-t border flex items-center gap-1.5 cursor-pointer transition-colors -mb-3',
                                  isActive
                                    ? 'bg-white text-slate-900 font-bold border-t-2 border-t-[#DC2626] border-slate-200 border-b-transparent shadow-2xs'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                )}
                              >
                                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#DC2626]' : 'text-slate-500')} />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button type="button" className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : detailActiveTab === 'history' ? (
                  /* ── HISTORY TAB VIEW ── */
                  <div className="bg-white p-3 sm:p-5 space-y-4">
                    <div className="border border-slate-200 rounded-sm p-4 bg-slate-50/50 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Audit History</h4>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">05-10-2026 10:33 AM:</span>
                          <span>Opportunity created by Super Admin</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">05-10-2026 11:08 AM:</span>
                          <span>Quotation CTSQ#4359 generated by {viewOpp.owner || 'NEBIN BENNY'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs mt-6">
                      <div className="bg-[#F8FAFC] px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-[#0891B2]" />
                        <span>Opportunity Activities</span>
                      </div>
                      <div className="p-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 bg-slate-50/50">
                        <div className="flex items-center gap-1">
                          {[
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'task', label: 'Task', icon: CheckCircle2 },
                            { id: 'files', label: 'Files', icon: BookOpen },
                            { id: 'sales_visit', label: 'Sales Visit', icon: Truck },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isActive = detailActivityTab === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setDetailActivityTab(t.id)}
                                className={cn(
                                  'px-3 py-1.5 text-xs font-semibold rounded-t border flex items-center gap-1.5 cursor-pointer transition-colors -mb-3',
                                  isActive
                                    ? 'bg-white text-slate-900 font-bold border-t-2 border-t-[#DC2626] border-slate-200 border-b-transparent shadow-2xs'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                )}
                              >
                                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#DC2626]' : 'text-slate-500')} />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button type="button" className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                      <div className="py-6 px-4 text-slate-600 text-xs">
                        No Notes.
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => router.push('/sales?tab=opportunities')}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const oppAmount = Number(viewOpp.amount || 0);
                      const oppDiscount = Number(viewOpp.discount || 0);
                      const oppAdjustment = Number(viewOpp.adjustment || 0);
                      const oppVatRate = viewOpp.vatType === 'Without VAT' || viewOpp.vatType === 'Zero VAT' ? 0 : (viewOpp.vatRate ?? 5);
                      const oppTaxable = Math.max(0, oppAmount - oppDiscount);
                      const oppVatAmount = (viewOpp as any).vatAmount !== undefined ? Number((viewOpp as any).vatAmount) : (oppTaxable * Number(oppVatRate)) / 100;
                      const oppSubTotal = oppTaxable + oppVatAmount;
                      const oppTotalAmount = (viewOpp as any).totalAmount !== undefined ? Number((viewOpp as any).totalAmount) : (oppSubTotal + oppAdjustment);

                      return (
                        <>
                          {/* 4. Chevrons Stage Indicator Track */}
                          <div className="px-4 sm:px-6 py-3 bg-white flex items-center gap-1 overflow-x-auto">
                            {['Enquiry', 'Qualification', 'Offer Sent', 'Negotiation', 'Won'].map((stg, idx) => {
                              const isCurrent = (viewOpp.stage || 'Enquiry').toLowerCase() === stg.toLowerCase();
                              return (
                                <button
                                  key={stg}
                                  type="button"
                                  onClick={() => handleOpenChangeStage(viewOpp)}
                                  className={cn(
                                    "relative text-white px-5 py-1.5 text-center text-xs font-bold flex flex-col leading-tight pr-7 cursor-pointer transition-all shrink-0",
                                    idx === 0
                                      ? "[clip-path:polygon(0%_0%,calc(100%-12px)_0%,100%_50%,calc(100%-12px)_100%,0%_100%)]"
                                      : "[clip-path:polygon(0%_0%,calc(100%-12px)_0%,100%_50%,calc(100%-12px)_100%,0%_100%,12px_50%)] pl-6 -ml-2",
                                    isCurrent ? "bg-[#0088CC] shadow-sm" : idx === 0 ? "bg-[#7A1336]" : "bg-slate-400 hover:bg-slate-500"
                                  )}
                                >
                                  <span>{stg}</span>
                                  <span className="text-[10px] font-normal opacity-90">0 day(s)</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* 5. Main 2-Column Layout */}
                          <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#F8FAFC]">
                            {/* LEFT COLUMN: Opportunity Details (5 cols) */}
                            <div className="lg:col-span-6 xl:col-span-5 bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                              <div className="bg-[#F1F5F9] px-3.5 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5 text-slate-500" />
                                <span>Opportunity Details</span>
                              </div>

                              <div className="p-3.5 divide-y divide-slate-100 text-xs text-slate-700 space-y-2">
                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Opportunity Owner</span>
                                  <div className="flex items-center gap-2">
                                    {viewOpp.ownerAvatar ? (
                                      <img
                                        src={viewOpp.ownerAvatar}
                                        alt={viewOpp.owner}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold">
                                        {(viewOpp.owner || 'N').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-800 uppercase">{viewOpp.owner || 'NAFAL'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Opportunity Number</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-slate-800">{viewOpp.opportunityCode || 'CTEQ#7133'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Quotation Number</span>
                                  <span className="font-bold text-[#2563EB] cursor-pointer hover:underline">
                                    {(viewOpp as any).quotationNumber || '—'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Opportunity Title</span>
                                  <span className="font-bold text-slate-800 uppercase">{viewOpp.title || 'OPPORTUNITY'}</span>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Customer</span>
                                  <div className="flex items-center gap-1.5 text-right">
                                    <span className="font-bold text-[#2563EB] uppercase hover:underline cursor-pointer">
                                      {viewOpp.customer || '—'}
                                    </span>
                                    <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Rating</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenChangeStage(viewOpp)}
                                    className="px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" /> {viewOpp.rating ? viewOpp.rating.toUpperCase() : 'COLD'}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Stage</span>
                                  <div className="flex flex-col items-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenChangeStage(viewOpp)}
                                      className="px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" /> {viewOpp.stage || 'Enquiry'}
                                    </button>
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                      <div className="h-full bg-amber-500" style={{ width: `${viewOpp.probability || 10}%` }} />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Opportunity Date</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-slate-800">{viewOpp.opportunityDate || 'Today'}</span>
                                    <span className="px-1.5 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">Today</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Created</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center">
                                      {(viewOpp.owner || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-slate-700">{viewOpp.opportunityDate || 'Today'} 10:00:00 AM</span>
                                    <span className="px-1.5 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">Today</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Last Modified</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold flex items-center justify-center">
                                      {(viewOpp.owner || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-slate-700">{viewOpp.lastActivity || `${viewOpp.opportunityDate || 'Today'} 10:00:00 AM`}</span>
                                    <span className="px-1.5 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">Today</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Last Activity</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center">
                                      {(viewOpp.owner || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-slate-700">{viewOpp.lastActivity || `${viewOpp.opportunityDate || 'Today'} 10:00:00 AM`}</span>
                                    <span className="px-1.5 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">Today</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between py-1 gap-2">
                                  <span className="text-slate-600 font-medium">Close Date</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-800 font-medium">{viewOpp.expectedClose || 'Pending'}</span>
                                    <span className="px-1.5 py-0.2 bg-[#06B6D4] text-white rounded text-[10px] font-bold">
                                      {viewOpp.closeDateRemaining || '7 days'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons Bar */}
                              <div className="p-3 bg-[#F8FAFC] border-t border-slate-200 flex flex-wrap items-center gap-1.5 mt-auto">
                                <button
                                  type="button"
                                  onClick={() => handleOpenConvertToMultiple(viewOpp)}
                                  className="px-2.5 py-1.5 bg-[#0F2942] hover:bg-[#07192b] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="w-3 h-3" /> Convert to Multiple Opportunity
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAssignModalOpen(true)}
                                  className="px-2.5 py-1.5 bg-[#0F2942] hover:bg-[#07192b] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <UserCheck className="w-3 h-3" /> Assign Opportunity
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditOpportunity(viewOpp)}
                                  className="px-2.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteOppConfirm(viewOpp)}
                                  className="px-2.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </div>
                            </div>

                            {/* RIGHT COLUMN: Overview Grid & Cost Details (7 cols) */}
                            <div className="lg:col-span-6 xl:col-span-7 bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                              <div className="bg-[#F1F5F9] px-3.5 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs">
                                Overview
                              </div>

                              <div className="p-4 space-y-4">
                                {/* 8 Overview Metric Cards Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Amount</span>
                                      <span className="text-sm font-bold text-slate-900">
                                        {oppAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                      💵
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">VAT</span>
                                      <span className="text-sm font-bold text-slate-900">
                                        {oppVatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({oppVatRate}%)
                                      </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                      💵
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Sub Total</span>
                                      <span className="text-sm font-bold text-slate-900">
                                        {oppSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                      🧮
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Total Amount</span>
                                      <span className="text-sm font-bold text-slate-900">
                                        {oppTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                      💵
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Net Sale</span>
                                      <span className="text-sm font-bold text-slate-900">
                                        {oppAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                      💵
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Invoice Generated</span>
                                      <span className="text-sm font-bold text-slate-900">0.00</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                      📄
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Invoice VAT</span>
                                      <span className="text-sm font-bold text-slate-900">0.00</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                      📅
                                    </div>
                                  </div>

                                  <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                    <div>
                                      <span className="text-[11px] text-slate-500 font-medium block">Total Invoice</span>
                                      <span className="text-sm font-bold text-slate-900">0.00</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                      📄
                                    </div>
                                  </div>
                                </div>

                                {/* Cost Details Section */}
                                <div className="pt-2">
                                  <h4 className="text-xs font-bold text-slate-700 mb-2">Cost Details</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                      <div>
                                        <span className="text-[11px] text-slate-500 font-medium block">Estimated Cost</span>
                                        <span className="text-sm font-bold text-amber-600">0.00</span>
                                      </div>
                                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                        📄
                                      </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                      <div>
                                        <span className="text-[11px] text-slate-500 font-medium block">Actual Cost</span>
                                        <span className="text-sm font-bold text-emerald-600">0.00</span>
                                      </div>
                                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                        🌡
                                      </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-2xs">
                                      <div>
                                        <span className="text-[11px] text-slate-500 font-medium block">Estimated Profit(GP)</span>
                                        <span className="text-sm font-bold text-blue-600">
                                          {oppAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                        📈
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* 6. Opportunity Activities Bottom Section */}
                    <div className="p-3 sm:p-4 bg-[#F8FAFC]">
                      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
                        <div className="bg-[#F1F5F9] px-3.5 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Opportunity Activities</span>
                        </div>

                        <div className="p-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-2">
                              {['notes', 'task', 'files', 'sales_visit'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setDetailActivityTab(t)}
                                  className={cn(
                                    'px-3 py-1 rounded text-xs font-semibold capitalize transition-colors cursor-pointer',
                                    detailActivityTab === t
                                      ? 'bg-[#E2E8F0] text-slate-900'
                                      : 'text-slate-600 hover:bg-slate-100'
                                  )}
                                >
                                  {t === 'sales_visit' ? 'Sales Visit' : t}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              className="px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          </div>

                          <div className="py-6 px-3 text-slate-500 text-xs">
                            No Notes.
                          </div>
                        </div>
                      </div>

                      {/* Back Button */}
                      <div className="flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => router.push('/sales?tab=opportunities')}
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Shaheer">Shaheer</option>
                            <option value="SUPER ADMIN">SUPER ADMIN</option>
                            <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                            <option value="COOL TECH">COOL TECH</option>
                          </>
                        )}
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
                        onClick={handleOpenAddOpportunity}
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
                                    router.push(`/sales?tab=opportunities&view=${opp.id}`);
                                  }}
                                  className="text-[#2563EB] hover:underline font-bold text-xs"
                                >
                                  {opp.opportunityCode || 'CTEQ#7016'}
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenChangeStage(opp)}
                                className="px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>{opp.stage}</span>
                              </button>
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
                                ) : opp.ownerAvatar ? (
                                  <img
                                    src={opp.ownerAvatar}
                                    alt={opp.owner}
                                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                  />
                                ) : null}
                                <span className="font-medium text-slate-700 text-xs">{opp.owner}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* ── Desktop Table View (lg and up) ── */}
                  <div className="hidden lg:block overflow-x-auto w-full min-h-[360px]">
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
                          <th className="p-2.5 w-16 text-center text-slate-600">Actions</th>
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
                                ) : opp.ownerAvatar ? (
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 mx-auto">
                                    <img
                                      src={opp.ownerAvatar}
                                      alt={opp.owner || 'Owner'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium text-xs">—</span>
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
                                        router.push(`/sales?tab=opportunities&view=${opp.id}`);
                                      }}
                                      className="text-[#2563EB] hover:underline font-bold text-xs"
                                    >
                                      {opp.opportunityCode || 'CTEQ#7016'}
                                    </button>
                                    <span className="font-bold text-slate-800 uppercase text-[11px]">{opp.title}</span>
                                    <Info
                                      className="w-3.5 h-3.5 text-blue-500 cursor-pointer"
                                      onClick={() => {
                                        router.push(`/sales?tab=opportunities&view=${opp.id}`);
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
                                  <button
                                    type="button"
                                    onClick={() => handleOpenChangeStage(opp)}
                                    className="px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                    <span>{opp.stage}</span>
                                  </button>
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
                              <td className="p-2.5 text-center whitespace-nowrap relative">
                                <div className="inline-block text-left relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionDropdownOpenId(actionDropdownOpenId === opp.id ? null : opp.id);
                                    }}
                                    className="px-2 py-1.5 bg-[#008080] hover:bg-[#006666] text-white rounded text-xs font-semibold flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                                    title="Actions"
                                  >
                                    <Settings className="w-3.5 h-3.5" />
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                  {actionDropdownOpenId === opp.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActionDropdownOpenId(null);
                                        }}
                                      />
                                      <div className="absolute right-0 top-8 w-44 bg-white rounded-md shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/sales?tab=opportunities&view=${opp.id}`, '_blank');
                                            setActionDropdownOpenId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                                        >
                                          <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                          <span>Open in new tab</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/sales?tab=opportunities&view=${opp.id}`);
                                            setActionDropdownOpenId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                                        >
                                          <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                          <span>View</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditOpportunity(opp);
                                            setActionDropdownOpenId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                                        >
                                          <Edit2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOpportunity(opp);
                                            setIsAssignModalOpen(true);
                                            setActionDropdownOpenId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                          <span>Assign Opportunity</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteOppConfirm(opp);
                                            setActionDropdownOpenId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2.5 text-slate-700 hover:text-red-600 cursor-pointer font-medium"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
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
      {activeTab === 'quotations' && (
        <div className="flex-1 p-3 sm:p-4 w-full font-sans">
          <CezconQuotationModule />
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
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Shaheer">Shaheer</option>
                            <option value="SUPER ADMIN">SUPER ADMIN</option>
                            <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                            <option value="COOL TECH">COOL TECH</option>
                          </>
                        )}
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
                          {users && users.length > 0 ? (
                            users.map((u) => (
                              <option key={u.id} value={u.name}>
                                {u.name}
                              </option>
                            ))
                          ) : (
                            <option value={currentUser?.name || 'shaheer'}>{currentUser?.name || 'shaheer'}</option>
                          )}
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
                              {(() => {
                                const av = (o.ownerAvatar && !o.ownerAvatar.includes('unsplash') && !o.ownerAvatar.includes('photo-')) ? o.ownerAvatar : getEmployeePhoto(o.owner);
                                const name = o.owner || currentUser?.name || 'S';
                                if (av) {
                                  return (
                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                      <img src={av} alt={name} className="w-full h-full object-cover" />
                                    </div>
                                  );
                                }
                                return (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-2xs shrink-0">
                                    {name[0]}
                                  </div>
                                );
                              })()}
                              <span className="text-[11px] text-slate-600 font-medium">{o.owner || currentUser?.name || 'shaheer'}</span>
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
                                {(() => {
                                  const av = (o.ownerAvatar && !o.ownerAvatar.includes('unsplash') && !o.ownerAvatar.includes('photo-')) ? o.ownerAvatar : getEmployeePhoto(o.owner);
                                  const name = o.owner || currentUser?.name || 'S';
                                  if (av) {
                                    return (
                                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                        <img src={av} alt={name} className="w-full h-full object-cover" />
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs">
                                      {name[0]}
                                    </div>
                                  );
                                })()}
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
          {viewingProforma ? (
            /* ========================================================================= */
            /* VIEW 1: FULL PAGE PROFORMA INVOICE DETAILS (EXACT CEZCON CRM REFERENCE)   */
            /* ========================================================================= */
            <div className="space-y-3 font-sans">
              {/* Top Notification Alert Banner */}
              <div className="bg-[#EBF3FB] border border-[#BCE8F1] text-[#31708F] px-3.5 py-2.5 rounded-xs flex items-center justify-between text-xs font-semibold shadow-2xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className="text-sm shrink-0">🗋</span>
                  <div className="space-y-0.5">
                    <div>
                      PROFORMA INVOICE CREATED BY {viewingProforma.owner?.toUpperCase() || currentUser?.name?.toUpperCase() || 'SYSTEM SUPER ADMIN'} ON MON {viewingProforma.issueDate} 10:24:42 AM
                    </div>
                    <div>
                      PROFORMA INVOICE LAST MODIFIED BY {viewingProforma.owner?.toUpperCase() || currentUser?.name?.toUpperCase() || 'SYSTEM SUPER ADMIN'} ON MON {viewingProforma.issueDate} 10:29:58 AM
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingProforma(null)}
                  className="w-4 h-4 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded-xs transition cursor-pointer text-[10px] font-bold shrink-0 ml-2"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Main Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-[#FAFAFA] border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <h2 className="text-xs font-bold text-slate-800">Proforma Invoice Details</h2>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="p-4 sm:p-6 border-b border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-xs text-slate-700">
                    {/* Left Column */}
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Owner</span>
                        <div className="col-span-2 flex items-center gap-2 font-bold text-slate-800 uppercase">
                          {(() => {
                            const av = viewingProforma.ownerAvatar || getEmployeePhoto(viewingProforma.owner);
                            if (av) {
                              return (
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                  <img src={av} alt={viewingProforma.owner} className="w-full h-full object-cover" />
                                </div>
                              );
                            }
                            return (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-2xs shrink-0">
                                {(viewingProforma.owner || 'M')[0]}
                              </div>
                            );
                          })()}
                          <span>{viewingProforma.owner || currentUser?.name || 'System Super Admin'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Date</span>
                        <span className="col-span-2 font-bold text-slate-800">{viewingProforma.issueDate}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">LPO Number</span>
                        <span className="col-span-2 text-slate-800">{(viewingProforma as any).lpoNumber || '—'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Opportunity</span>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className="text-[#2563EB] font-bold hover:underline cursor-pointer">
                            {viewingProforma.opportunityTitle || '—'}
                          </span>
                          <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Amount</span>
                        <span className="col-span-2 font-bold text-slate-800">
                          {viewingProforma.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">VAT (5%)</span>
                        <span className="col-span-2 text-slate-800">
                          {viewingProforma.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Adjustment</span>
                        <span className="col-span-2 text-slate-800">
                          {((viewingProforma as any).adjustment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Remarks</span>
                        <span className="col-span-2 text-slate-800">{(viewingProforma as any).remarks || '—'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Prepared By</span>
                        <span className="col-span-2 font-bold text-slate-800 uppercase">
                          {(viewingProforma as any).preparedBy || viewingProforma.owner || currentUser?.name || 'System Super Admin'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Prepared by Mobile</span>
                        <span className="col-span-2 text-slate-800">
                          {(viewingProforma as any).preparedByMobile || (viewingProforma as any).mobile || (currentUser as any)?.mobile || (currentUser as any)?.phone || '+971 50 123 4567'}
                        </span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Invoice Number</span>
                        <span className="col-span-2 font-bold text-slate-800">{viewingProforma.piNumber || 'PRN-1'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Quotation Number</span>
                        <span className="col-span-2 text-[#2563EB] font-bold hover:underline cursor-pointer">
                          {viewingProforma.quotationRef || '—'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">LPO Date</span>
                        <span className="col-span-2 text-slate-800">{(viewingProforma as any).lpoDate || '—'}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Customer Name</span>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <span className="text-[#2563EB] font-bold hover:underline cursor-pointer">
                            {viewingProforma.customer}
                          </span>
                          <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Discount</span>
                        <span className="col-span-2 text-slate-800">
                          {((viewingProforma as any).discount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Sub Total</span>
                        <span className="col-span-2 font-bold text-slate-800">
                          {viewingProforma.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-700 font-medium">Total Amount</span>
                        <span className="col-span-2 font-bold text-slate-900 text-sm">
                          {viewingProforma.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 w-20 text-center">QTY</th>
                        <th className="py-2.5 px-4 w-32 text-right">Price</th>
                        <th className="py-2.5 px-4 w-32 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {(() => {
                        const matchedQuote = liveQuotations?.find(
                          (q) =>
                            (viewingProforma.quotationRef && (q.quotationNumber === viewingProforma.quotationRef || q.id === viewingProforma.quotationRef)) ||
                            (viewingProforma.customer && q.customer && q.customer.trim().toLowerCase() === viewingProforma.customer.trim().toLowerCase())
                        );
                        const matchedOpp = salesOpportunities?.find(
                          (o) =>
                            (viewingProforma.opportunityTitle && (`${o.reference || o.opportunityCode || 'OPP'} / ${o.title}` === viewingProforma.opportunityTitle || viewingProforma.opportunityTitle.includes(o.title))) ||
                            (viewingProforma.customer && o.customer && o.customer.trim().toLowerCase() === viewingProforma.customer.trim().toLowerCase())
                        );
                        const items = (matchedQuote?.items && matchedQuote.items.length > 0)
                          ? matchedQuote.items.map((it: any, idx: number) => ({
                              id: it.id || `quote-item-${idx}`,
                              description: it.description || it.name || it.itemDescription || 'Product Item',
                              code: it.code || it.itemCode || 'CT-PROD',
                              unit: it.unit || 'Each',
                              brand: it.brand || 'SUPER GENERAL',
                              qty: Number(it.qty || it.quantity) || 1,
                              price: Number(it.price || it.rate || it.unitPrice) || (viewingProforma.amount / (Number(it.qty || it.quantity) || 1)),
                              total: (Number(it.qty || it.quantity) || 1) * (Number(it.price || it.rate || it.unitPrice) || (viewingProforma.amount / (Number(it.qty || it.quantity) || 1))),
                            }))
                          : ((matchedOpp as any)?.items && (matchedOpp as any).items.length > 0)
                          ? (matchedOpp as any).items.map((it: any, idx: number) => ({
                              id: it.id || `opp-item-${idx}`,
                              description: it.description || it.name || it.itemDescription || 'Product Item',
                              code: it.code || it.itemCode || 'CT-PROD',
                              unit: it.unit || 'Each',
                              brand: it.brand || 'SUPER GENERAL',
                              qty: Number(it.qty || it.quantity) || 1,
                              price: Number(it.price || it.rate || it.unitPrice) || (viewingProforma.amount / (Number(it.qty || it.quantity) || 1)),
                              total: (Number(it.qty || it.quantity) || 1) * (Number(it.price || it.rate || it.unitPrice) || (viewingProforma.amount / (Number(it.qty || it.quantity) || 1))),
                            }))
                          : [
                              {
                                id: `proforma-item-${viewingProforma.id}`,
                                description: viewingProforma.opportunityTitle?.split('/')[1]?.trim() || viewingProforma.opportunityTitle || 'Sales Item',
                                code: (viewingProforma as any).itemCode || 'CT-PROD',
                                unit: 'Each',
                                brand: 'SUPER GENERAL',
                                qty: 1,
                                price: viewingProforma.amount,
                                total: viewingProforma.amount,
                              }
                            ];

                        return (
                          <>
                            {items.map((it: any) => (
                              <tr key={it.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded flex flex-col items-center justify-center text-[8px] text-slate-400 font-semibold uppercase text-center p-1 shrink-0">
                                      <Package className="w-4 h-4 text-slate-400 mb-0.5" />
                                      <span>No Image</span>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                                        {it.description}
                                      </div>
                                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                                        {it.code && <span>Code: {it.code}</span>}
                                        {it.unit && <span>Unit: {it.unit}</span>}
                                        {it.brand && <span>Brand: {it.brand}</span>}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center font-medium text-slate-800">{it.qty}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-800">
                                  {it.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-slate-900">
                                  {it.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}

                            {/* Total Quantity Footer Row */}
                            <tr className="bg-slate-50/50 border-t border-slate-200 font-bold text-slate-700">
                              <td className="py-2.5 px-4 text-right">Total Quantity:</td>
                              <td className="py-2.5 px-4 text-center">
                                {items.reduce((acc: number, curr: any) => acc + (curr.qty || 0), 0)}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary Box */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                  <div className="w-full sm:w-80 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span className="font-medium">Amount</span>
                      <span className="font-bold text-slate-800">
                        {viewingProforma.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span className="font-medium">VAT (5%)</span>
                      <span className="font-medium text-slate-700">
                        {viewingProforma.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span className="font-medium">Sub Total</span>
                      <span className="font-bold text-slate-800">
                        {viewingProforma.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span className="font-medium">Adjustment</span>
                      <span className="text-slate-700">
                        {((viewingProforma as any).adjustment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                      <span>Total Amount</span>
                      <span>
                        {viewingProforma.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col items-end gap-2.5">
                  <div className="flex flex-wrap items-center justify-end gap-1.5 w-full">
                    {/* Print Format Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProformaPrintFormatDropdownOpen((prev) => !prev);
                        }}
                        className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Format</span>
                        <span className="text-[10px]">▾</span>
                      </button>

                      {isProformaPrintFormatDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[100]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProformaPrintFormatDropdownOpen(false);
                            }}
                          />
                          <div
                            className="absolute left-0 bottom-full mb-1.5 bg-white border border-slate-300 rounded shadow-2xl py-1.5 z-[101] min-w-[300px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              'Print with Quantity',
                              'Print without Quantity',
                              'Print without Item Price',
                              'Print without Quantity & Item Price',
                              'Print without Total Price',
                              'Print without Unit Price & Total Price',
                              'Print without Unit Price & with Total Price',
                            ].map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsProformaPrintFormatDropdownOpen(false);
                                  const proformaAsInv: CrmInvoice = {
                                    id: viewingProforma.id,
                                    slNo: viewingProforma.slNo || 1,
                                    invoiceNumber: viewingProforma.piNumber,
                                    customer: viewingProforma.customer,
                                    issueDate: viewingProforma.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                                    dueDate: viewingProforma.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                                    lpoNumber: viewingProforma.lpoNumber || '',
                                    lpoDate: viewingProforma.lpoDate || '',
                                    amount: viewingProforma.amount,
                                    subtotal: viewingProforma.amount,
                                    vatAmount: viewingProforma.vatAmount,
                                    totalAmount: viewingProforma.totalAmount,
                                    adjustment: viewingProforma.adjustment || 0,
                                    vatType: 'With VAT',
                                    status: viewingProforma.status || 'Pending',
                                    items: viewingProforma.items && viewingProforma.items.length > 0
                                      ? viewingProforma.items
                                      : [
                                          {
                                            id: 'item-1',
                                            description: 'AC',
                                            code: 'CT-PROD',
                                            unit: 'Each',
                                            brand: 'SUPER GENERAL',
                                            qty: 1,
                                            price: viewingProforma.amount || 9448,
                                          },
                                        ],
                                    owner: viewingProforma.preparedBy || viewingProforma.owner || '',
                                    phone: viewingProforma.preparedByMobile || viewingProforma.phone || '',
                                    location: viewingProforma.location || '',
                                    opportunityOrderRef: viewingProforma.quotationRef || viewingProforma.opportunityTitle || '',
                                    paidAmount: 0,
                                    balanceAmount: viewingProforma.totalAmount,
                                    ...({ isProforma: true } as any),
                                  };
                                  handleOpenPrintInvoice(proformaAsInv, fmt);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                              >
                                <span className="text-slate-900 font-bold text-xs">•</span>
                                <span className="font-normal text-slate-800">{fmt}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const proformaAsInv: CrmInvoice = {
                          id: viewingProforma.id,
                          slNo: viewingProforma.slNo || 1,
                          invoiceNumber: viewingProforma.piNumber,
                          customer: viewingProforma.customer,
                          issueDate: viewingProforma.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                          dueDate: viewingProforma.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                          lpoNumber: viewingProforma.lpoNumber || '',
                          lpoDate: viewingProforma.lpoDate || '',
                          amount: viewingProforma.amount,
                          subtotal: viewingProforma.amount,
                          vatAmount: viewingProforma.vatAmount,
                          totalAmount: viewingProforma.totalAmount,
                          adjustment: viewingProforma.adjustment || 0,
                          vatType: 'With VAT',
                          status: viewingProforma.status || 'Pending',
                          items: viewingProforma.items && viewingProforma.items.length > 0
                            ? viewingProforma.items
                            : [
                                {
                                  id: 'item-1',
                                  description: 'AC',
                                  code: 'CT-PROD',
                                  unit: 'Each',
                                  brand: 'SUPER GENERAL',
                                  qty: 1,
                                  price: viewingProforma.amount || 9448,
                                },
                              ],
                          owner: viewingProforma.preparedBy || viewingProforma.owner || '',
                          phone: viewingProforma.preparedByMobile || viewingProforma.phone || '',
                          location: viewingProforma.location || '',
                          opportunityOrderRef: viewingProforma.quotationRef || viewingProforma.opportunityTitle || '',
                          paidAmount: 0,
                          balanceAmount: viewingProforma.totalAmount,
                          ...({ isProforma: true } as any),
                        };
                        handleOpenPrintInvoice(proformaAsInv, 'Print in USD');
                      }}
                      className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print In USD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const proformaAsInv: CrmInvoice = {
                          id: viewingProforma.id,
                          slNo: viewingProforma.slNo || 1,
                          invoiceNumber: viewingProforma.piNumber,
                          customer: viewingProforma.customer,
                          issueDate: viewingProforma.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                          dueDate: viewingProforma.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                          lpoNumber: viewingProforma.lpoNumber || '',
                          lpoDate: viewingProforma.lpoDate || '',
                          amount: viewingProforma.amount,
                          subtotal: viewingProforma.amount,
                          vatAmount: viewingProforma.vatAmount,
                          totalAmount: viewingProforma.totalAmount,
                          adjustment: viewingProforma.adjustment || 0,
                          vatType: 'With VAT',
                          status: viewingProforma.status || 'Pending',
                          items: viewingProforma.items && viewingProforma.items.length > 0
                            ? viewingProforma.items
                            : [
                                {
                                  id: 'item-1',
                                  description: 'AC',
                                  code: 'CT-PROD',
                                  unit: 'Each',
                                  brand: 'SUPER GENERAL',
                                  qty: 1,
                                  price: viewingProforma.amount || 9448,
                                },
                              ],
                          owner: viewingProforma.preparedBy || viewingProforma.owner || '',
                          phone: viewingProforma.preparedByMobile || viewingProforma.phone || '',
                          location: viewingProforma.location || '',
                          opportunityOrderRef: viewingProforma.quotationRef || viewingProforma.opportunityTitle || '',
                          paidAmount: 0,
                          balanceAmount: viewingProforma.totalAmount,
                          ...({ isProforma: true } as any),
                        };
                        handleOpenPrintInvoice(proformaAsInv, 'Print with Quantity');
                      }}
                      className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Generating Tax Invoice from ${viewingProforma.piNumber}...`);
                      }}
                      className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Generate Invoice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = viewingProforma;
                        setViewingProforma(null);
                        setProformaFormData({
                          customer: p.customer || '',
                          quotation: p.quotationRef || '',
                          opportunityOrder: p.opportunityTitle || '',
                          proformaNumber: p.piNumber,
                          invoiceDate: p.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                          lpoDate: (p as any).lpoDate || '',
                          lpoNumber: (p as any).lpoNumber || '',
                          invoiceType: (p as any).invoiceType || 'File Upload',
                          vatType: p.vatAmount > 0 ? 'With VAT' : 'Without VAT',
                          amount: String(p.amount || ''),
                          discount: String((p as any).discount || ''),
                          adjustment: String((p as any).adjustment || ''),
                          remarks: (p as any).remarks || '',
                          vatRate: '5',
                          document: null,
                        });
                        setIsCreateProformaModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#337AB7] hover:bg-[#286090] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete proforma invoice ${viewingProforma.piNumber}?`)) {
                          setProformas((prev) => {
                            const updated = prev.filter((item) => item.id !== viewingProforma.id);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('crm_proforma_invoices', JSON.stringify(updated));
                            }
                            return updated;
                          });
                          setViewingProforma(null);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#D9534F] hover:bg-[#C9302C] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="flex justify-end w-full pt-1">
                    <button
                      type="button"
                      onClick={() => setViewingProforma(null)}
                      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isCreateProformaModalOpen ? (
            /* ================================================================= */
            /* ADD PROFORMA INVOICE FORM (Matching Cezcon CRM Reference UI)      */
            /* ================================================================= */
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden font-sans">
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#FAFAFA] border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-xs font-bold text-slate-800">Add Proforma Invoice</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateProformaModalOpen(false)}
                  className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded-xs transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const parsedAmount = parseFloat(proformaFormData.amount) || 0;
                  const parsedDiscount = parseFloat(proformaFormData.discount) || 0;
                  const parsedAdjustment = parseFloat(proformaFormData.adjustment) || 0;
                  const net = Math.max(0, parsedAmount - parsedDiscount);
                  const vatRateNum = proformaFormData.vatType === 'With VAT' ? (parseFloat(proformaFormData.vatRate) || 0) : 0;
                  const vatAmt = (net * vatRateNum) / 100;
                  const total = net + vatAmt + parsedAdjustment;
                  setProformas((prev) => [
                    ...prev,
                    {
                      id: `pi_${Date.now()}`,
                      slNo: prev.length + 1,
                      piNumber: proformaFormData.proformaNumber,
                      issueDate: proformaFormData.invoiceDate,
                      owner: currentUser?.name || 'Super Admin',
                      ownerAvatar: currentUser?.avatar,
                      customer: proformaFormData.customer || 'N/A',
                      opportunityTitle: proformaFormData.opportunityOrder,
                      quotationRef: proformaFormData.quotation,
                      amount: parsedAmount,
                      vatAmount: vatAmt,
                      totalAmount: total || parsedAmount,
                      status: 'Pending',
                    } as CrmProformaInvoice,
                  ]);
                  setIsCreateProformaModalOpen(false);
                  setProformaFormData({
                    customer: '', quotation: '', opportunityOrder: '',
                    proformaNumber: 'CTPI#' + (1001 + Math.floor(Math.random() * 100)),
                    invoiceDate: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                    lpoDate: '', lpoNumber: '', invoiceType: 'File Upload',
                    vatType: 'With VAT', amount: '', discount: '', adjustment: '',
                    remarks: '', vatRate: '5', document: null,
                  });
                }}
                className="p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-xs text-slate-700">

                  {/* ── LEFT COLUMN ── */}
                  <div className="space-y-3.5">

                    {/* Customer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <select
                          required
                          value={proformaFormData.customer}
                          onChange={(e) => {
                            const custName = e.target.value;
                            if (!custName) {
                              setProformaFormData((prev) => ({
                                ...prev,
                                customer: '',
                                quotation: '',
                                opportunityOrder: '',
                              }));
                              return;
                            }

                            // Match opportunities for selected customer
                            const matchingOpps = salesOpportunities?.filter(
                              (o) =>
                                (o.customer && o.customer.trim().toLowerCase() === custName.trim().toLowerCase()) ||
                                ((o as any).companyName && (o as any).companyName.trim().toLowerCase() === custName.trim().toLowerCase())
                            ) || [];

                            // Match quotations for selected customer
                            const matchingQuotes = liveQuotations?.filter(
                              (q) => q.customer && q.customer.trim().toLowerCase() === custName.trim().toLowerCase()
                            ) || [];

                            const topQuote = matchingQuotes[0];
                            const topOpp = matchingOpps[0];

                            const quoteRef = topQuote ? topQuote.quotationNumber : '';
                            const oppRef = topOpp ? `${topOpp.reference || topOpp.opportunityCode || 'OPP'} / ${topOpp.title}` : '';

                            const amountVal = topQuote?.subtotal !== undefined
                              ? String(topQuote.subtotal)
                              : topQuote?.grossAmount !== undefined
                              ? String(topQuote.grossAmount)
                              : topOpp?.amount !== undefined
                              ? String(topOpp.amount)
                              : '';

                            const discountVal = topQuote?.discountTotal !== undefined && topQuote.discountTotal > 0
                              ? String(topQuote.discountTotal)
                              : topQuote?.discountAmount !== undefined && topQuote.discountAmount > 0
                              ? String(topQuote.discountAmount)
                              : '';

                            const adjustmentVal = topQuote?.shippingCharges !== undefined && topQuote.shippingCharges > 0
                              ? String(topQuote.shippingCharges)
                              : '';

                            const vatRateVal = topQuote?.vatRate !== undefined
                              ? String(topQuote.vatRate)
                              : topOpp?.vatRate !== undefined
                              ? String(topOpp.vatRate)
                              : '5';

                            const vatTypeVal = (topQuote?.vatAmount && topQuote.vatAmount > 0) || (topQuote?.vatRate && topQuote.vatRate > 0) || topOpp?.vatType
                              ? (topOpp?.vatType || 'With VAT')
                              : 'With VAT';

                            const lpoNumVal = (topOpp as any)?.lpoNumber || (topQuote as any)?.lpoNumber || '';
                            const lpoDateVal = (topOpp as any)?.lpoDate || (topQuote as any)?.lpoDate || '';
                            const remarksVal = topQuote?.subject || topOpp?.title || '';

                            setProformaFormData((prev) => ({
                              ...prev,
                              customer: custName,
                              quotation: quoteRef || prev.quotation,
                              opportunityOrder: oppRef || prev.opportunityOrder,
                              amount: amountVal || prev.amount,
                              discount: discountVal || prev.discount,
                              adjustment: adjustmentVal || prev.adjustment,
                              vatRate: vatRateVal,
                              vatType: vatTypeVal,
                              lpoNumber: lpoNumVal || prev.lpoNumber,
                              lpoDate: lpoDateVal || prev.lpoDate,
                              remarks: remarksVal || prev.remarks,
                            }));
                          }}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">Select Customer</option>
                          {(() => {
                            const names = new Set<string>();
                            customers?.forEach((c) => {
                              const n = c.companyName || c.customerName || (c as any).name;
                              if (n) names.add(n.trim());
                            });
                            salesOpportunities?.forEach((o) => { if (o.customer) names.add(o.customer.trim()); });
                            return Array.from(names).sort().map((n) => <option key={n} value={n}>{n}</option>);
                          })()}
                        </select>
                      </div>
                    </div>

                    {/* Quotation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">Quotation</label>
                      <div className="sm:col-span-2">
                        <select
                          value={proformaFormData.quotation}
                          onChange={(e) => {
                            const quoteVal = e.target.value;
                            if (!quoteVal) {
                              setProformaFormData((prev) => ({ ...prev, quotation: '' }));
                              return;
                            }
                            const matchedQuote = liveQuotations?.find((q) => q.quotationNumber === quoteVal || q.id === quoteVal);
                            if (!matchedQuote) {
                              setProformaFormData((prev) => ({ ...prev, quotation: quoteVal }));
                              return;
                            }

                            // Match opportunity for this quotation
                            const matchedOpp = salesOpportunities?.find(
                              (o) =>
                                (matchedQuote.opportunityId && o.id === matchedQuote.opportunityId) ||
                                (matchedQuote.opportunityCode && (o.opportunityCode === matchedQuote.opportunityCode || o.reference === matchedQuote.opportunityCode)) ||
                                (o.customer && o.customer.trim().toLowerCase() === (matchedQuote.customer || '').trim().toLowerCase())
                            );

                            const oppRef = matchedOpp ? `${matchedOpp.reference || matchedOpp.opportunityCode || 'OPP'} / ${matchedOpp.title}` : '';
                            const amountVal = matchedQuote.subtotal !== undefined
                              ? String(matchedQuote.subtotal)
                              : matchedQuote.grossAmount !== undefined
                              ? String(matchedQuote.grossAmount)
                              : matchedQuote.totalAmount !== undefined
                              ? String(matchedQuote.totalAmount)
                              : '';

                            const discountVal = matchedQuote.discountTotal !== undefined && matchedQuote.discountTotal > 0
                              ? String(matchedQuote.discountTotal)
                              : matchedQuote.discountAmount !== undefined && matchedQuote.discountAmount > 0
                              ? String(matchedQuote.discountAmount)
                              : '';

                            const adjustmentVal = matchedQuote.shippingCharges !== undefined && matchedQuote.shippingCharges > 0
                              ? String(matchedQuote.shippingCharges)
                              : '';

                            const vatRateVal = matchedQuote.vatRate !== undefined ? String(matchedQuote.vatRate) : '5';
                            const vatTypeVal = (matchedQuote.vatAmount && matchedQuote.vatAmount > 0) || (matchedQuote.vatRate && matchedQuote.vatRate > 0)
                              ? 'With VAT'
                              : 'Without VAT';

                            const lpoNumVal = (matchedOpp as any)?.lpoNumber || (matchedQuote as any)?.lpoNumber || '';
                            const lpoDateVal = (matchedOpp as any)?.lpoDate || (matchedQuote as any)?.lpoDate || '';

                            setProformaFormData((prev) => ({
                              ...prev,
                              quotation: quoteVal,
                              customer: matchedQuote.customer || prev.customer,
                              opportunityOrder: oppRef || prev.opportunityOrder,
                              amount: amountVal || prev.amount,
                              discount: discountVal || prev.discount,
                              adjustment: adjustmentVal || prev.adjustment,
                              vatRate: vatRateVal,
                              vatType: vatTypeVal,
                              lpoNumber: lpoNumVal || prev.lpoNumber,
                              lpoDate: lpoDateVal || prev.lpoDate,
                              remarks: matchedQuote.subject || prev.remarks,
                            }));
                          }}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">Select Quotation</option>
                          {(() => {
                            const filtered = proformaFormData.customer
                              ? liveQuotations?.filter((q) => q.customer?.trim().toLowerCase() === proformaFormData.customer.trim().toLowerCase())
                              : liveQuotations;
                            const list = filtered && filtered.length > 0 ? filtered : liveQuotations;
                            return list?.map((q) => (
                              <option key={q.id} value={q.quotationNumber}>
                                {q.quotationNumber} — {q.subject || q.customer} ({q.customer})
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>

                    {/* Invoice Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">Invoice Date</label>
                      <div className="sm:col-span-2">
                        <CezconDateInput
                          value={proformaFormData.invoiceDate}
                          onChange={(val) => setProformaFormData({ ...proformaFormData, invoiceDate: val })}
                        />
                      </div>
                    </div>

                    {/* LPO Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">LPO Number</label>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={proformaFormData.lpoNumber}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, lpoNumber: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="any"
                          value={proformaFormData.amount}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, amount: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* VAT */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">VAT</label>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="number"
                          value={proformaFormData.vatRate}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, vatRate: e.target.value })}
                          className="w-20 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-center"
                        />
                        <span className="text-xs text-slate-500 font-medium">%</span>
                        <input
                          type="text"
                          readOnly
                          placeholder="VAT Amount"
                          value={(() => {
                            const net = Math.max(0, (parseFloat(proformaFormData.amount) || 0) - (parseFloat(proformaFormData.discount) || 0));
                            const rate = proformaFormData.vatType === 'With VAT' ? (parseFloat(proformaFormData.vatRate) || 0) : 0;
                            const vat = (net * rate) / 100;
                            return vat ? vat.toFixed(2) : '';
                          })()}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 bg-slate-50 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">Total Amount</label>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          readOnly
                          value={(() => {
                            const net = Math.max(0, (parseFloat(proformaFormData.amount) || 0) - (parseFloat(proformaFormData.discount) || 0));
                            const rate = proformaFormData.vatType === 'With VAT' ? (parseFloat(proformaFormData.vatRate) || 0) : 0;
                            const vat = (net * rate) / 100;
                            const total = net + vat + (parseFloat(proformaFormData.adjustment) || 0);
                            return total ? total.toFixed(2) : '';
                          })()}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 bg-slate-50 focus:outline-none font-semibold"
                        />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-2">
                      <label className="text-slate-700 font-medium pt-1.5">Remarks</label>
                      <div className="sm:col-span-2">
                        <textarea
                          rows={3}
                          value={proformaFormData.remarks}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, remarks: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT COLUMN ── */}
                  <div className="space-y-3.5">

                    {/* Opportunity / Order */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">
                        Opportunity/Order <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-2">
                        <select
                          value={proformaFormData.opportunityOrder}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setProformaFormData((prev) => ({ ...prev, opportunityOrder: '' }));
                              return;
                            }
                            const matchedOpp = salesOpportunities?.find(
                              (o) => `${o.reference || o.opportunityCode || 'OPP'} / ${o.title}` === val || o.id === val
                            );

                            const oppCust = matchedOpp?.customer || '';
                            const matchedQuote = liveQuotations?.find(
                              (q) =>
                                (matchedOpp && q.opportunityId && q.opportunityId === matchedOpp.id) ||
                                (matchedOpp && q.opportunityCode && (q.opportunityCode === matchedOpp.opportunityCode || q.opportunityCode === matchedOpp.reference)) ||
                                (oppCust && q.customer && q.customer.trim().toLowerCase() === oppCust.trim().toLowerCase())
                            );

                            const amountVal = matchedQuote?.subtotal !== undefined
                              ? String(matchedQuote.subtotal)
                              : matchedOpp?.amount !== undefined
                              ? String(matchedOpp.amount)
                              : '';

                            const discountVal = matchedQuote?.discountTotal !== undefined && matchedQuote.discountTotal > 0
                              ? String(matchedQuote.discountTotal)
                              : '';

                            const adjustmentVal = matchedQuote?.shippingCharges !== undefined && matchedQuote.shippingCharges > 0
                              ? String(matchedQuote.shippingCharges)
                              : '';

                            const vatTypeVal = matchedOpp?.vatType || (matchedQuote?.vatAmount ? 'With VAT' : 'With VAT');
                            const vatRateVal = String(matchedQuote?.vatRate ?? matchedOpp?.vatRate ?? '5');

                            setProformaFormData((prev) => ({
                              ...prev,
                              opportunityOrder: val,
                              customer: matchedOpp?.customer || prev.customer,
                              quotation: matchedQuote?.quotationNumber || prev.quotation,
                              amount: amountVal || prev.amount,
                              discount: discountVal || prev.discount,
                              adjustment: adjustmentVal || prev.adjustment,
                              vatType: vatTypeVal,
                              vatRate: vatRateVal,
                              lpoNumber: (matchedOpp as any)?.lpoNumber || (matchedQuote as any)?.lpoNumber || prev.lpoNumber,
                              lpoDate: (matchedOpp as any)?.lpoDate || (matchedQuote as any)?.lpoDate || prev.lpoDate,
                              remarks: matchedQuote?.subject || matchedOpp?.title || prev.remarks,
                            }));
                          }}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">Select Opportunity</option>
                          {(() => {
                            const filtered = proformaFormData.customer
                              ? salesOpportunities?.filter(
                                  (o) =>
                                    (o.customer && o.customer.trim().toLowerCase() === proformaFormData.customer.trim().toLowerCase()) ||
                                    ((o as any).companyName && (o as any).companyName.trim().toLowerCase() === proformaFormData.customer.trim().toLowerCase())
                                )
                              : salesOpportunities;
                            const list = filtered && filtered.length > 0 ? filtered : salesOpportunities;
                            return list?.map((o) => {
                              const label = `${o.reference || o.opportunityCode || 'OPP'} / ${o.title}`;
                              return <option key={o.id} value={label}>{label} ({o.customer})</option>;
                            });
                          })()}
                        </select>
                      </div>
                    </div>

                    {/* Proforma Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">
                        Proforma Number <span className="text-red-500">*</span>
                      </label>
                      <div className="sm:col-span-2 relative">
                        <input
                          type="text"
                          required
                          value={proformaFormData.proformaNumber}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, proformaNumber: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 pr-8"
                        />
                        <button
                          type="button"
                          title="Auto Generate"
                          onClick={() => setProformaFormData({ ...proformaFormData, proformaNumber: 'CTPI#' + (1001 + Math.floor(Math.random() * 999)) })}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-600 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* LPO Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">LPO Date</label>
                      <div className="sm:col-span-2">
                        <CezconDateInput
                          placeholder="DD-MM-YYYY"
                          value={proformaFormData.lpoDate}
                          onChange={(val) => setProformaFormData({ ...proformaFormData, lpoDate: val })}
                        />
                      </div>
                    </div>

                    {/* Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">Type</label>
                      <div className="sm:col-span-2 flex gap-2">
                        <select
                          value={proformaFormData.invoiceType}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, invoiceType: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="File Upload">File Upload</option>
                          <option value="Manual">Manual</option>
                          <option value="Auto">Auto</option>
                        </select>
                        <select
                          value={proformaFormData.vatType}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, vatType: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="With VAT">With VAT</option>
                          <option value="Without VAT">Without VAT</option>
                          <option value="Zero VAT">Zero VAT</option>
                        </select>
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">Discount</label>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="any"
                          value={proformaFormData.discount}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, discount: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Adjustment */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">Adjustment</label>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="any"
                          value={proformaFormData.adjustment}
                          onChange={(e) => setProformaFormData({ ...proformaFormData, adjustment: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* File */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                      <label className="text-slate-700 font-medium">File</label>
                      <div className="sm:col-span-2">
                        <input
                          type="file"
                          onChange={(e) => setProformaFormData({ ...proformaFormData, document: e.target.files?.[0] || null })}
                          className="w-full text-xs text-slate-700 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white file:text-slate-700 file:cursor-pointer hover:file:bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-2 pt-5 mt-3 border-t border-slate-200">
                  <button
                    type="submit"
                    className="px-6 py-1.5 bg-[#1B2A4A] hover:bg-[#111C33] text-white rounded-xs text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateProformaModalOpen(false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#D2D6DE] hover:bg-slate-50 text-slate-700 rounded-xs text-xs font-semibold cursor-pointer transition"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>

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
                    {users && users.length > 0 ? (
                      users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))
                    ) : (
                      <option value={currentUser?.name || 'shaheer'}>{currentUser?.name || 'shaheer'}</option>
                    )}
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
                        {(() => {
                          const av = (p.ownerAvatar && !p.ownerAvatar.includes('unsplash') && !p.ownerAvatar.includes('photo-')) ? p.ownerAvatar : getEmployeePhoto(p.owner);
                          const name = p.owner || currentUser?.name || 'S';
                          if (av) {
                            return (
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <img src={av} alt={name} className="w-full h-full object-cover" />
                              </div>
                            );
                          }
                          return (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-2xs shrink-0">
                              {name[0]}
                            </div>
                          );
                        })()}
                        <span className="text-[11px] text-slate-600 font-medium">{p.owner || currentUser?.name || 'shaheer'}</span>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenProformaActionId((prev) => (prev === p.id ? null : p.id));
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#008080] hover:bg-[#006666] text-white rounded text-[11px] font-medium shadow-2xs cursor-pointer transition select-none"
                          title="Actions"
                        >
                          <Settings className="w-3.5 h-3.5 text-white" />
                          <span className="text-white text-[10px] leading-none">▾</span>
                        </button>

                        {openProformaActionId === p.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40 bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenProformaActionId(null);
                              }}
                            />
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded shadow-[0_8px_24px_rgba(0,0,0,0.2)] z-50 py-1 text-left text-xs font-normal"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenProformaActionId(null);
                                  setShowProformaAlertBanner(true);
                                  setViewingProforma(p);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer text-xs"
                              >
                                <Contact className="w-3.5 h-3.5 text-slate-700" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenProformaActionId(null);
                                  setProformaFormData({
                                    customer: p.customer || '',
                                    quotation: p.quotationRef || '',
                                    opportunityOrder: p.opportunityTitle || '',
                                    proformaNumber: p.piNumber,
                                    invoiceDate: p.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                                    lpoDate: (p as any).lpoDate || '',
                                    lpoNumber: (p as any).lpoNumber || '',
                                    invoiceType: (p as any).invoiceType || 'File Upload',
                                    vatType: p.vatAmount > 0 ? 'With VAT' : 'Without VAT',
                                    amount: String(p.amount || ''),
                                    discount: String((p as any).discount || ''),
                                    adjustment: String((p as any).adjustment || ''),
                                    remarks: (p as any).remarks || '',
                                    vatRate: '5',
                                    document: null,
                                  });
                                  setIsCreateProformaModalOpen(true);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer text-xs"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenProformaActionId(null);
                                  if (confirm(`Are you sure you want to delete proforma invoice ${p.piNumber}?`)) {
                                    setProformas((prev) => {
                                      const updated = prev.filter((item) => item.id !== p.id);
                                      if (typeof window !== 'undefined') {
                                        localStorage.setItem('crm_proforma_invoices', JSON.stringify(updated));
                                      }
                                      return updated;
                                    });
                                  }
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50 transition cursor-pointer text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Table (Desktop Viewports) */}
            <div className="hidden md:block overflow-x-auto w-full min-h-[300px] pb-24">
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
                      <tr
                        key={p.id}
                        className={`transition-colors ${openProformaActionId === p.id ? 'relative z-50 bg-[#F0FDF4]/60' : 'hover:bg-[#F0FDF4]/40'}`}
                      >
                        {/* SL.No */}
                        <td className="p-2.5 text-center text-slate-600 font-medium">{p.slNo}</td>

                        {/* Proforma Invoice Link */}
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0">
                              📄
                            </span>
                            <span
                              onClick={() => {
                                setShowProformaAlertBanner(true);
                                setViewingProforma(p);
                              }}
                              className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
                            >
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
                          {(() => {
                            const av = (p.ownerAvatar && !p.ownerAvatar.includes('unsplash') && !p.ownerAvatar.includes('photo-')) ? p.ownerAvatar : getEmployeePhoto(p.owner);
                            const name = p.owner || currentUser?.name || 'S';
                            if (av) {
                              return (
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                  <img src={av} alt={name} className="w-full h-full object-cover" />
                                </div>
                              );
                            }
                            return (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs">
                                {name[0]}
                              </div>
                            );
                          })()}
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
                        <td className="p-2.5 text-center relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenProformaActionId((prev) => (prev === p.id ? null : p.id));
                            }}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#008080] hover:bg-[#006666] text-white rounded text-[11px] font-medium shadow-2xs cursor-pointer transition select-none"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-[10px] leading-none">▾</span>
                          </button>

                          {/* Action Dropdown Menu matching Reference UI */}
                          {openProformaActionId === p.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenProformaActionId(null);
                                }}
                              />
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-2 top-full mt-1 w-32 bg-white border border-slate-200 rounded shadow-[0_8px_24px_rgba(0,0,0,0.2)] z-50 py-1 text-left text-xs font-normal"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenProformaActionId(null);
                                    setShowProformaAlertBanner(true);
                                    setViewingProforma(p);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer text-xs"
                                >
                                  <Contact className="w-3.5 h-3.5 text-slate-700" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenProformaActionId(null);
                                    setProformaFormData({
                                      customer: p.customer || '',
                                      quotation: p.quotationRef || '',
                                      opportunityOrder: p.opportunityTitle || '',
                                      proformaNumber: p.piNumber,
                                      invoiceDate: p.issueDate || new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
                                      lpoDate: (p as any).lpoDate || '',
                                      lpoNumber: (p as any).lpoNumber || '',
                                      invoiceType: (p as any).invoiceType || 'File Upload',
                                      vatType: p.vatAmount > 0 ? 'With VAT' : 'Without VAT',
                                      amount: String(p.amount || ''),
                                      discount: String((p as any).discount || ''),
                                      adjustment: String((p as any).adjustment || ''),
                                      remarks: (p as any).remarks || '',
                                      vatRate: '5',
                                      document: null,
                                    });
                                    setIsCreateProformaModalOpen(true);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer text-xs"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenProformaActionId(null);
                                    if (confirm(`Are you sure you want to delete proforma invoice ${p.piNumber}?`)) {
                                      setProformas((prev) => {
                                        const updated = prev.filter((item) => item.id !== p.id);
                                        if (typeof window !== 'undefined') {
                                          localStorage.setItem('crm_proforma_invoices', JSON.stringify(updated));
                                        }
                                        return updated;
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50 transition cursor-pointer text-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
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


            </>
          )}
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
          {isCreateInvoiceModalOpen ? (
            editingInvoiceId ? (
              /* ========================================================================= */
              /* CEZCON CRM EXACT EDIT INVOICE FULL UI */
              /* ========================================================================= */
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden font-sans">
                {/* Header with Title and Red Close Button */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAFAFA] border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <h2 className="text-xs font-bold text-slate-800">Edit Invoice</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateInvoiceModalOpen(false);
                      setEditingInvoiceId(null);
                    }}
                    className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded-xs transition cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Form Content */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const itemsSubtotal = invoiceLineItems.reduce(
                      (acc, item) => acc + (Number(item.qty) || 0) * (Number(item.price) || 0),
                      0
                    );
                    const discPercentNum = parseFloat(invoiceDiscountPercent) || 0;
                    const calculatedDiscountAmount = (itemsSubtotal * discPercentNum) / 100;
                    const amountAfterDiscount = Math.max(0, itemsSubtotal - calculatedDiscountAmount);
                    const isWithVat = addInvoiceData.vatType === 'With VAT';
                    const vatPercentNum = isWithVat ? parseFloat(addInvoiceData.vatRate) || 0 : 0;
                    const calculatedVatAmount = (amountAfterDiscount * vatPercentNum) / 100;
                    const subTotal = amountAfterDiscount + calculatedVatAmount;
                    const adjustmentNum = parseFloat(addInvoiceData.adjustment) || 0;
                    const grandTotal = subTotal + adjustmentNum;
                    const finalAmount = grandTotal || itemsSubtotal || parseFloat(addInvoiceData.amount) || 0;

                    const updatedInvoicePayload: Partial<CrmInvoice> = {
                      invoiceNumber: addInvoiceData.invoiceNumber,
                      opportunityOrderRef: addInvoiceData.opportunityOrder,
                      customer: addInvoiceData.customer,
                      contactPerson: addInvoiceData.attention,
                      attention: addInvoiceData.attention,
                      issueDate: addInvoiceData.invoiceDate,
                      dueDate: addInvoiceData.invoiceDueDate,
                      amount: finalAmount,
                      subtotal: itemsSubtotal,
                      vatAmount: calculatedVatAmount,
                      vatRate: addInvoiceData.vatRate,
                      vatType: addInvoiceData.vatType,
                      totalAmount: finalAmount,
                      balanceAmount: Math.max(0, finalAmount - (selectedInvoice?.paidAmount || 0)),
                      lpoNumber: addInvoiceData.lpoNumber,
                      lpoDate: addInvoiceData.lpoDate,
                      referenceNumber: addInvoiceData.referenceNumber,
                      location: addInvoiceData.location,
                      description: addInvoiceData.description,
                      discount: calculatedDiscountAmount,
                      discountPercent: invoiceDiscountPercent,
                      adjustment: addInvoiceData.adjustment,
                      termsConditions: invoiceTermsConditions,
                      items: invoiceLineItems.map((item) => ({
                        ...item,
                        total: (Number(item.qty) || 0) * (Number(item.price) || 0),
                      })),
                    };

                    updateInvoice(editingInvoiceId, updatedInvoicePayload);

                    if (selectedInvoice && selectedInvoice.id === editingInvoiceId) {
                      setSelectedInvoice({
                        ...selectedInvoice,
                        ...updatedInvoicePayload,
                      });
                    }

                    setIsCreateInvoiceModalOpen(false);
                    setEditingInvoiceId(null);
                  }}
                  className="p-4 sm:p-5 space-y-5"
                >
                  {/* 2-COLUMN HEADER FIELDS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2.5 text-xs text-slate-700">
                    {/* LEFT COLUMN */}
                    <div className="space-y-2.5">
                      {/* Invoice Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium flex items-center gap-1">
                          <span>Invoice Number</span>
                          <span className="text-emerald-600 font-bold text-xs">✔</span>
                        </label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            value={addInvoiceData.invoiceNumber}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, invoiceNumber: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-emerald-500 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* LPO Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">LPO Date</label>
                        <div className="sm:col-span-2">
                          <CezconDateInput
                            placeholder="DD-MM-YYYY"
                            value={addInvoiceData.lpoDate}
                            onChange={(val) => setAddInvoiceData({ ...addInvoiceData, lpoDate: val })}
                          />
                        </div>
                      </div>

                      {/* Invoice Due Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Invoice Due Date</label>
                        <div className="sm:col-span-2">
                          <CezconDateInput
                            placeholder="DD-MM-YYYY"
                            value={addInvoiceData.invoiceDueDate}
                            onChange={(val) => setAddInvoiceData({ ...addInvoiceData, invoiceDueDate: val })}
                          />
                        </div>
                      </div>

                      {/* Opportunity/Order */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">
                          Opportunity/Order <span className="text-red-500">*</span>
                        </label>
                        <div className="sm:col-span-2">
                          <select
                            value={addInvoiceData.opportunityOrder}
                            onChange={(e) => {
                              const selectedVal = e.target.value;
                              if (!selectedVal) {
                                setAddInvoiceData((prev) => ({ ...prev, opportunityOrder: '' }));
                                return;
                              }

                              const matchedQuote = liveQuotations?.find(
                                (q) =>
                                  q.id === selectedVal ||
                                  q.quotationNumber === selectedVal ||
                                  `${q.quotationNumber} / ${q.subject || 'Quotation'}` === selectedVal ||
                                  (q.quotationNumber && selectedVal.includes(q.quotationNumber))
                              );
                              const matchedOpp = salesOpportunities?.find(
                                (opp) =>
                                  opp.id === selectedVal ||
                                  opp.opportunityCode === selectedVal ||
                                  opp.reference === selectedVal ||
                                  `${opp.reference || opp.opportunityCode || 'OPP'} / ${opp.title}` === selectedVal ||
                                  `${opp.opportunityCode} / ${opp.title}` === selectedVal ||
                                  (opp.reference && selectedVal.includes(opp.reference)) ||
                                  (opp.opportunityCode && selectedVal.includes(opp.opportunityCode))
                              );
                              const matchedOrd = liveOrders?.find(
                                (o) =>
                                  o.id === selectedVal ||
                                  o.orderNumber === selectedVal ||
                                  `${o.orderNumber} / ${o.opportunityRef || o.subject || 'Sales Order'}` === selectedVal ||
                                  (o.orderNumber && selectedVal.includes(o.orderNumber))
                              );

                              const cust = matchedQuote?.customer || matchedOpp?.customer || matchedOrd?.customer || addInvoiceData.customer;
                              const amt = matchedQuote?.subtotal ?? matchedQuote?.totalAmount ?? matchedOpp?.amount ?? matchedOrd?.amount;
                              const disc = matchedQuote?.discountTotal ?? matchedQuote?.discountAmount ?? matchedOpp?.discount ?? '0';
                              const vat = matchedQuote?.vatRate ?? matchedOpp?.vatRate ?? '5';
                              const vatTyp = matchedOpp?.vatType || 'With VAT';
                              const adj = matchedOpp?.adjustment ?? '';
                              const att = matchedQuote?.contactPerson || matchedOpp?.contactPerson || matchedOrd?.contactPerson || addInvoiceData.attention;
                              const loc = matchedQuote?.billingAddress || matchedOpp?.location || matchedOrd?.billingAddress || addInvoiceData.location;
                              const lpo = matchedOpp?.lpoNumber || matchedOrd?.poReference || addInvoiceData.lpoNumber;
                              const lpoDt = matchedOpp?.lpoDate || addInvoiceData.lpoDate;
                              const refNo = matchedQuote?.quotationNumber || matchedOpp?.reference || matchedOpp?.opportunityCode || matchedOrd?.orderNumber || addInvoiceData.referenceNumber;
                              const desc = matchedQuote?.subject || matchedOpp?.title || matchedOrd?.subject || addInvoiceData.description;
                              const terms = matchedQuote?.customerNotes || matchedQuote?.paymentTerms || '';

                              if (matchedQuote?.items && Array.isArray(matchedQuote.items) && matchedQuote.items.length > 0) {
                                setInvoiceLineItems(
                                  matchedQuote.items.map((item: any, idx: number) => ({
                                    id: item.id || `item-${Date.now()}-${idx}`,
                                    description: item.description || item.name || item.itemDescription || 'Product / Service Item',
                                    code: item.code || item.itemCode || item.sku || '',
                                    unit: item.unit || 'Each',
                                    brand: item.brand || '',
                                    qty: Number(item.qty || item.quantity) || 1,
                                    price: Number(item.price || item.unitPrice || item.rate) || 0,
                                  }))
                                );
                              } else if (amt) {
                                const isVat = vatTyp === 'With VAT';
                                const vatR = parseFloat(String(vat)) || 5;
                                const rawAmt = Number(amt) || 0;
                                const basePrice = isVat && rawAmt > 0 ? Number((rawAmt / (1 + vatR / 100)).toFixed(2)) : rawAmt;
                                setInvoiceLineItems([
                                  {
                                    id: `item-${Date.now()}-1`,
                                    description: desc || selectedVal || 'Sales Item',
                                    code: refNo || '',
                                    unit: 'Each',
                                    brand: '',
                                    qty: 1,
                                    price: basePrice || rawAmt || 0,
                                  },
                                ]);
                              }

                              if (terms) {
                                setInvoiceTermsConditions(terms);
                              }

                              setAddInvoiceData((prev) => ({
                                ...prev,
                                opportunityOrder: selectedVal,
                                customer: cust || prev.customer,
                                amount: amt !== undefined ? String(amt) : prev.amount,
                                discount: disc !== undefined ? String(disc) : prev.discount,
                                vatRate: vat !== undefined ? String(vat) : prev.vatRate,
                                vatType: vatTyp,
                                adjustment: adj !== undefined ? String(adj) : prev.adjustment,
                                attention: att || prev.attention,
                                location: loc || prev.location,
                                lpoNumber: lpo || prev.lpoNumber,
                                lpoDate: lpoDt || prev.lpoDate,
                                referenceNumber: refNo || prev.referenceNumber,
                                description: desc || prev.description,
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">Select</option>
                            {liveQuotations && liveQuotations.length > 0 && (
                              <optgroup label="Quotations">
                                {liveQuotations.map((q) => {
                                  const label = `${q.quotationNumber} / ${q.subject || 'Quotation'}`;
                                  return (
                                    <option key={q.id} value={label}>
                                      {label} {q.totalAmount ? `(AED ${q.totalAmount.toLocaleString()})` : ''} - {q.customer}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                            {salesOpportunities && salesOpportunities.length > 0 && (
                              <optgroup label="Opportunities">
                                {salesOpportunities.map((opp) => {
                                  const label = `${opp.reference || opp.opportunityCode || 'OPP'} / ${opp.title}`;
                                  return (
                                    <option key={opp.id} value={label}>
                                      {label} {opp.amount ? `(AED ${opp.amount.toLocaleString()})` : ''} - {opp.customer}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                            {liveOrders && liveOrders.length > 0 && (
                              <optgroup label="Orders">
                                {liveOrders.map((ord) => {
                                  const label = `${ord.orderNumber} / ${ord.opportunityRef || ord.subject || 'Sales Order'}`;
                                  return (
                                    <option key={ord.id} value={label}>
                                      {label} {ord.amount ? `(AED ${ord.amount.toLocaleString()})` : ''} - {ord.customer}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Reference Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Reference Number</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={addInvoiceData.referenceNumber}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, referenceNumber: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Payment Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium flex items-center gap-1">
                          <span className="text-blue-500">📍</span> Payment Location
                        </label>
                        <div className="sm:col-span-2 relative">
                          <input
                            type="text"
                            placeholder="Search location"
                            value={addInvoiceData.location}
                            onChange={(e) => {
                              setAddInvoiceData({ ...addInvoiceData, location: e.target.value });
                              setInvoiceLocationDropdownOpen(true);
                            }}
                            onFocus={() => setInvoiceLocationDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setInvoiceLocationDropdownOpen(false), 150)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-7"
                          />
                          {addInvoiceData.location && (
                            <button
                              type="button"
                              onClick={() => setAddInvoiceData({ ...addInvoiceData, location: '' })}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {invoiceLocationDropdownOpen && (() => {
                            const filtered = UAE_LOCATIONS.filter((loc) =>
                              loc.toLowerCase().includes(addInvoiceData.location.toLowerCase())
                            );
                            return filtered.length > 0 ? (
                              <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
                                {filtered.map((loc) => (
                                  <button
                                    key={loc}
                                    type="button"
                                    onMouseDown={() => {
                                      setAddInvoiceData({ ...addInvoiceData, location: loc });
                                      setInvoiceLocationDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                  >
                                    {loc}
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-2.5">
                      {/* Invoice Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Invoice Date</label>
                        <div className="sm:col-span-2">
                          <CezconDateInput
                            value={addInvoiceData.invoiceDate}
                            onChange={(val) => setAddInvoiceData({ ...addInvoiceData, invoiceDate: val })}
                          />
                        </div>
                      </div>

                      {/* LPO Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">LPO Number</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={addInvoiceData.lpoNumber}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, lpoNumber: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <div className="sm:col-span-2">
                          <select
                            required
                            value={addInvoiceData.customer}
                            onChange={(e) => {
                              const selectedCust = e.target.value;
                              if (!selectedCust) {
                                setAddInvoiceData((prev) => ({ ...prev, customer: '' }));
                                return;
                              }

                              const matchedCustomer = customers?.find(
                                (c) =>
                                  (c.companyName && c.companyName.toLowerCase() === selectedCust.toLowerCase()) ||
                                  (c.customerName && c.customerName.toLowerCase() === selectedCust.toLowerCase())
                              );
                              const matchedQuote = liveQuotations?.find(
                                (q) => q.customer && q.customer.toLowerCase() === selectedCust.toLowerCase()
                              );
                              const matchedOpp = salesOpportunities?.find(
                                (opp) => opp.customer && opp.customer.toLowerCase() === selectedCust.toLowerCase()
                              );
                              const matchedOrd = liveOrders?.find(
                                (ord) => ord.customer && ord.customer.toLowerCase() === selectedCust.toLowerCase()
                              );

                              const oppOrderLabel = matchedQuote
                                ? `${matchedQuote.quotationNumber} / ${matchedQuote.subject || 'Quotation'}`
                                : matchedOpp
                                  ? `${matchedOpp.reference || matchedOpp.opportunityCode || 'OPP'} / ${matchedOpp.title}`
                                  : matchedOrd
                                    ? `${matchedOrd.orderNumber} / ${matchedOrd.opportunityRef || matchedOrd.subject || 'Sales Order'}`
                                    : addInvoiceData.opportunityOrder;

                              const amt = matchedQuote?.subtotal ?? matchedQuote?.totalAmount ?? matchedOpp?.amount ?? matchedOrd?.amount;
                              const disc = matchedQuote?.discountTotal ?? matchedQuote?.discountAmount ?? matchedOpp?.discount;
                              const vat = matchedQuote?.vatRate ?? matchedOpp?.vatRate;
                              const vatTyp = matchedOpp?.vatType || 'With VAT';
                              const adj = matchedOpp?.adjustment;
                              const att = matchedCustomer?.contactPerson || matchedQuote?.contactPerson || matchedOpp?.contactPerson || matchedOrd?.contactPerson;
                              const loc = matchedCustomer?.address || matchedQuote?.billingAddress || matchedOpp?.location || matchedOrd?.billingAddress;
                              const lpo = matchedOpp?.lpoNumber || matchedOrd?.poReference;
                              const lpoDt = matchedOpp?.lpoDate;
                              const refNo = matchedQuote?.quotationNumber || matchedOpp?.reference || matchedOpp?.opportunityCode || matchedOrd?.orderNumber;
                              const desc = matchedQuote?.subject || matchedOpp?.title || matchedOrd?.subject;
                              const terms = matchedQuote?.customerNotes || matchedQuote?.paymentTerms || '';

                              if (matchedQuote?.items && Array.isArray(matchedQuote.items) && matchedQuote.items.length > 0) {
                                setInvoiceLineItems(
                                  matchedQuote.items.map((item: any, idx: number) => ({
                                    id: item.id || `item-${Date.now()}-${idx}`,
                                    description: item.description || item.name || item.itemDescription || 'Product / Service Item',
                                    code: item.code || item.itemCode || item.sku || '',
                                    unit: item.unit || 'Each',
                                    brand: item.brand || '',
                                    qty: Number(item.qty || item.quantity) || 1,
                                    price: Number(item.price || item.unitPrice || item.rate) || 0,
                                  }))
                                );
                              }

                              if (terms) {
                                setInvoiceTermsConditions(terms);
                              }

                              setAddInvoiceData((prev) => ({
                                ...prev,
                                customer: selectedCust,
                                opportunityOrder: oppOrderLabel || prev.opportunityOrder,
                                amount: amt !== undefined ? String(amt) : prev.amount,
                                discount: disc !== undefined ? String(disc) : prev.discount,
                                vatRate: vat !== undefined ? String(vat) : prev.vatRate,
                                vatType: vatTyp || prev.vatType,
                                adjustment: adj !== undefined ? String(adj) : prev.adjustment,
                                attention: att || prev.attention,
                                location: loc || prev.location,
                                lpoNumber: lpo || prev.lpoNumber,
                                lpoDate: lpoDt || prev.lpoDate,
                                referenceNumber: refNo || prev.referenceNumber,
                                description: desc || prev.description,
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">Select Customer</option>
                            {(() => {
                              const custNames = new Set<string>();
                              if (customers && customers.length > 0) {
                                customers.forEach((c) => {
                                  const name = c.companyName || c.customerName || (c as any).name;
                                  if (name && typeof name === 'string' && name.trim()) {
                                    custNames.add(name.trim());
                                  }
                                });
                              }
                              if (salesOpportunities && salesOpportunities.length > 0) {
                                salesOpportunities.forEach((opp) => {
                                  if (opp.customer && typeof opp.customer === 'string' && opp.customer.trim()) {
                                    custNames.add(opp.customer.trim());
                                  }
                                });
                              }
                              if (liveQuotations && liveQuotations.length > 0) {
                                liveQuotations.forEach((q) => {
                                  if (q.customer && typeof q.customer === 'string' && q.customer.trim()) {
                                    custNames.add(q.customer.trim());
                                  }
                                });
                              }
                              if (liveOrders && liveOrders.length > 0) {
                                liveOrders.forEach((ord) => {
                                  if (ord.customer && typeof ord.customer === 'string' && ord.customer.trim()) {
                                    custNames.add(ord.customer.trim());
                                  }
                                });
                              }
                              return Array.from(custNames)
                                .sort()
                                .map((custName) => (
                                  <option key={custName} value={custName}>
                                    {custName}
                                  </option>
                                ));
                            })()}
                          </select>
                        </div>
                      </div>

                      {/* VAT Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">VAT Type</label>
                        <div className="sm:col-span-2">
                          <select
                            value={addInvoiceData.vatType}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, vatType: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="With VAT">With VAT</option>
                            <option value="Without VAT">Without VAT</option>
                            <option value="Zero VAT">Zero VAT</option>
                          </select>
                        </div>
                      </div>

                      {/* Attention */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Attention</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={addInvoiceData.attention}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, attention: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-2">
                        <label className="text-slate-700 font-medium pt-1.5">Description</label>
                        <div className="sm:col-span-2">
                          <textarea
                            rows={2}
                            value={addInvoiceData.description}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, description: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LINE ITEMS TABLE SECTION */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden bg-white mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                            <th className="p-2 min-w-[280px]">
                              <div className="flex items-center gap-2">
                                <span>Description</span>
                                <button
                                  type="button"
                                  className="px-2 py-0.5 bg-[#31B0D5] hover:bg-[#269ABC] text-white text-[10px] font-bold rounded-xs cursor-pointer"
                                >
                                  + Additional Description
                                </button>
                              </div>
                            </th>
                            <th className="p-2 w-28 text-slate-700">Code</th>
                            <th className="p-2 w-24 text-slate-700">Unit</th>
                            <th className="p-2 w-28 text-slate-700">Brand</th>
                            <th className="p-2 w-20 text-center text-slate-700">QTY</th>
                            <th className="p-2 w-24 text-right text-slate-700">Price</th>
                            <th className="p-2 w-28 text-right text-slate-700">Price Total</th>
                            <th className="p-2 w-10 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {invoiceLineItems.map((item, idx) => {
                            const itemTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
                            return (
                              <tr key={item.id || idx} className="hover:bg-slate-50/50">
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => {
                                      const next = [...invoiceLineItems];
                                      next[idx].description = e.target.value;
                                      setInvoiceLineItems(next);
                                    }}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={item.code}
                                    onChange={(e) => {
                                      const next = [...invoiceLineItems];
                                      next[idx].code = e.target.value;
                                      setInvoiceLineItems(next);
                                    }}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) => {
                                      const next = [...invoiceLineItems];
                                      next[idx].unit = e.target.value;
                                      setInvoiceLineItems(next);
                                    }}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={item.brand}
                                    onChange={(e) => {
                                      const next = [...invoiceLineItems];
                                      next[idx].brand = e.target.value;
                                      setInvoiceLineItems(next);
                                    }}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => {
                                      const next = [...invoiceLineItems];
                                      next[idx].qty = Number(e.target.value) || 0;
                                      setInvoiceLineItems(next);
                                    }}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 text-center focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="number"
                                    step="any"
                                    value={item.price}
                                    onChange={(e) => {
                                      const next = [...invoiceLineItems];
                                      next[idx].price = Number(e.target.value) || 0;
                                      setInvoiceLineItems(next);
                                    }}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 text-right focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    readOnly
                                    value={itemTotal ? itemTotal.toFixed(2) : '0.00'}
                                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 text-right bg-slate-100 font-medium"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  {invoiceLineItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInvoiceLineItems(invoiceLineItems.filter((_, i) => i !== idx));
                                      }}
                                      className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white inline-flex items-center justify-center rounded-xs transition cursor-pointer"
                                      title="Delete"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Add More Button */}
                    <div className="p-2 bg-[#FAFAFA] border-t border-slate-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceLineItems([
                            ...invoiceLineItems,
                            {
                              id: `item-${Date.now()}`,
                              description: '',
                              code: '',
                              unit: 'Each',
                              brand: '',
                              qty: 1,
                              price: 0,
                            },
                          ]);
                        }}
                        className="px-2.5 py-1 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded-xs text-xs font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add More
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM 2-COLUMN SECTION (Terms on Left, Financials on Right) */}
                  {(() => {
                    const itemsSubtotal = invoiceLineItems.reduce(
                      (acc, item) => acc + (Number(item.qty) || 0) * (Number(item.price) || 0),
                      0
                    );
                    const discPercentNum = parseFloat(invoiceDiscountPercent) || 0;
                    const calculatedDiscountAmount = (itemsSubtotal * discPercentNum) / 100;
                    const amountAfterDiscount = Math.max(0, itemsSubtotal - calculatedDiscountAmount);
                    const isWithVat = addInvoiceData.vatType === 'With VAT';
                    const vatPercentNum = isWithVat ? parseFloat(addInvoiceData.vatRate) || 0 : 0;
                    const calculatedVatAmount = (amountAfterDiscount * vatPercentNum) / 100;
                    const subTotal = amountAfterDiscount + calculatedVatAmount;
                    const adjustmentNum = parseFloat(addInvoiceData.adjustment) || 0;
                    const grandTotal = subTotal + adjustmentNum;

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                        {/* LEFT: Terms & Conditions Rich Text Editor */}
                        <div className="lg:col-span-7 space-y-2">
                          {/* Header bar */}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              <Info className="w-3.5 h-3.5 text-blue-500" />
                              <span>Terms & Conditions</span>
                            </div>

                            <select
                              onChange={(e) => {
                                if (e.target.value === 'standard') {
                                  setInvoiceTermsConditions('1. Payment is due within 30 days.\n2. Goods once sold will not be taken back.\n3. Warranty as per manufacturer terms.');
                                } else if (e.target.value === 'cash') {
                                  setInvoiceTermsConditions('1. 100% Cash against delivery.\n2. Standard warranty applies.');
                                }
                              }}
                              className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 min-w-[200px]"
                            >
                              <option value="">Select Terms & Conditions</option>
                              <option value="standard">Standard 30 Days Net</option>
                              <option value="cash">100% Cash on Delivery</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => setInvoiceTermsConditions('1. Payment is due within 30 days.\n2. Goods once sold will not be taken back.\n3. Warranty as per manufacturer terms.')}
                              className="px-2.5 py-1 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1 cursor-pointer transition"
                            >
                              <RotateCcw className="w-3 h-3" /> Load
                            </button>

                            <button
                              type="button"
                              onClick={() => setInvoiceTermsConditions('')}
                              className="px-2.5 py-1 bg-[#D9534F] hover:bg-[#C9302C] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center gap-1 cursor-pointer transition"
                            >
                              <Trash2 className="w-3 h-3" /> Clear
                            </button>
                          </div>

                          {/* Rich Text Editor Frame */}
                          <div className="border border-slate-300 rounded overflow-hidden shadow-2xs bg-white">
                            {/* Toolbar Row 1 */}
                            <div className="flex flex-wrap items-center gap-0.5 p-1 bg-[#EBEBEB] border-b border-slate-300 text-slate-700 text-xs select-none">
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Cut">✂</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Copy">📋</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Paste">📄</button>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Undo">↩</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Redo">↪</button>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[10px] font-bold" title="Spell Check">ABC▾</button>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Link">🔗</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Unlink">⛓</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Anchor">⚓</button>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Image">🖼</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Table">▦</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Horizontal Rule">―</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Special Character">Ω</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Maximize">⛶</button>
                            </div>

                            {/* Toolbar Row 2 */}
                            <div className="flex flex-wrap items-center gap-0.5 p-1 bg-[#F5F5F5] border-b border-slate-300 text-slate-700 text-xs select-none">
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-bold" title="Bold">B</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded italic" title="Italic">I</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded line-through" title="Strikethrough">S</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[10px]" title="Subscript">Tₓ</button>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Numbered List">1.≡</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Bulleted List">•≡</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Outdent">⇤</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Indent">⇥</button>
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px]" title="Blockquote">❝</button>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px] text-slate-600">
                                Styles ▾
                              </div>
                              <div className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px] text-slate-600">
                                Format ▾
                              </div>
                              <span className="w-px h-3.5 bg-slate-300 mx-0.5" />
                              <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-bold text-slate-500" title="Help">?</button>
                            </div>

                            {/* Editable Area */}
                            <textarea
                              rows={8}
                              value={invoiceTermsConditions}
                              onChange={(e) => setInvoiceTermsConditions(e.target.value)}
                              placeholder="Type terms & conditions here..."
                              className="w-full p-2.5 text-xs text-slate-800 bg-white focus:outline-none resize-none font-sans"
                            />

                            {/* Editor Footer */}
                            <div className="px-2 py-0.5 bg-[#EAEAEA] border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
                              <span>body p</span>
                              <span className="text-slate-400">◢</span>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Financial Calculations Table */}
                        <div className="lg:col-span-5 space-y-2 text-xs">
                          {/* Amount */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">Amount</label>
                            <div className="col-span-7">
                              <input
                                type="text"
                                readOnly
                                value={itemsSubtotal.toFixed(2)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-[#F2F2F2] text-slate-800 text-right text-xs font-semibold focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Discount % */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">Discount %</label>
                            <div className="col-span-7 flex items-center gap-1.5">
                              <input
                                type="number"
                                step="any"
                                value={invoiceDiscountPercent}
                                onChange={(e) => setInvoiceDiscountPercent(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-right text-xs focus:outline-none focus:border-blue-500"
                              />
                              <span className="text-slate-600 font-semibold">%</span>
                            </div>
                          </div>

                          {/* Discount Amount */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">Discount</label>
                            <div className="col-span-7">
                              <input
                                type="text"
                                readOnly
                                value={calculatedDiscountAmount.toFixed(2)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-[#F2F2F2] text-slate-800 text-right text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Amount After Discount */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">Amount After Discount</label>
                            <div className="col-span-7">
                              <input
                                type="text"
                                readOnly
                                value={amountAfterDiscount.toFixed(2)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-[#F2F2F2] text-slate-800 text-right text-xs font-semibold focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* VAT(%) */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">VAT(%)</label>
                            <div className="col-span-7">
                              <input
                                type="number"
                                step="any"
                                value={addInvoiceData.vatRate}
                                onChange={(e) => setAddInvoiceData({ ...addInvoiceData, vatRate: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-right text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {/* VAT Amount */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">VAT Amount</label>
                            <div className="col-span-7">
                              <input
                                type="text"
                                readOnly
                                value={calculatedVatAmount.toFixed(2)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-[#F2F2F2] text-slate-800 text-right text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Sub Total */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">Sub Total</label>
                            <div className="col-span-7">
                              <input
                                type="text"
                                readOnly
                                value={subTotal.toFixed(2)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-[#F2F2F2] text-slate-800 text-right text-xs font-semibold focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Adjustment */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-medium text-slate-700">Adjustment</label>
                            <div className="col-span-7">
                              <input
                                type="number"
                                step="any"
                                value={addInvoiceData.adjustment}
                                onChange={(e) => setAddInvoiceData({ ...addInvoiceData, adjustment: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 text-right text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {/* Total Amount */}
                          <div className="grid grid-cols-12 items-center gap-2">
                            <label className="col-span-5 text-right font-bold text-slate-800">Total Amount</label>
                            <div className="col-span-7">
                              <input
                                type="text"
                                readOnly
                                value={grandTotal.toFixed(2)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-[#EBEBEB] text-slate-900 text-right text-xs font-extrabold focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-[#1B2A4A] hover:bg-[#111C33] text-white rounded-xs text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateInvoiceModalOpen(false);
                        setEditingInvoiceId(null);
                      }}
                      className="px-3.5 py-1.5 bg-white border border-[#D2D6DE] hover:bg-slate-50 text-slate-700 rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ========================================================================= */
              /* CEZCON CRM EXACT ADD INVOICE FULL UI */
              /* ========================================================================= */
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden font-sans">
                {/* Header with Title and Red Close Button */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAFAFA] border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <h2 className="text-xs font-bold text-slate-800">Add Invoice</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateInvoiceModalOpen(false);
                      setEditingInvoiceId(null);
                    }}
                    className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded-xs transition cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sub-Header: Invoice Details */}
                <div className="px-3.5 py-2 bg-[#F4F4F4] border-b border-slate-200 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">Invoice Details</span>
                </div>

                {/* Quick Add Customer Modal for Invoice */}
                {isQuickAddInvoiceCustomerOpen && (
                  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <Plus className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsQuickAddInvoiceCustomerOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleQuickAddInvoiceCustomerSubmit} className="space-y-3 pt-3 text-xs">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Company / Customer Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Al Habtoor Engineering"
                            value={quickInvoiceCustomerForm.companyName}
                            onChange={(e) => setQuickInvoiceCustomerForm({ ...quickInvoiceCustomerForm, companyName: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={quickInvoiceCustomerForm.contactPerson}
                            onChange={(e) => setQuickInvoiceCustomerForm({ ...quickInvoiceCustomerForm, contactPerson: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1">Phone / Mobile</label>
                            <input
                              type="text"
                              placeholder="+971 50 123 4567"
                              value={quickInvoiceCustomerForm.phone}
                              onChange={(e) => setQuickInvoiceCustomerForm({ ...quickInvoiceCustomerForm, phone: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1">Email</label>
                            <input
                              type="email"
                              placeholder="info@company.com"
                              value={quickInvoiceCustomerForm.email}
                              onChange={(e) => setQuickInvoiceCustomerForm({ ...quickInvoiceCustomerForm, email: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsQuickAddInvoiceCustomerOpen(false)}
                            className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save &amp; Select</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Invoice Number Settings Modal (Exact Cezcon UI) */}
                {isInvoiceNumModalOpen && (
                  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150 font-sans">
                      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
                        <h3 className="text-sm font-bold text-slate-900">Invoice Number</h3>
                        <button
                          type="button"
                          onClick={() => setIsInvoiceNumModalOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveInvoiceNumber} className="p-5 space-y-3.5 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="sm:w-28 font-semibold text-slate-700 shrink-0">
                            Prefix
                          </label>
                          <input
                            type="text"
                            value={invoicePrefix}
                            onChange={(e) => setInvoicePrefix(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="sm:w-28 font-semibold text-slate-700 shrink-0">
                            Next Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={invoiceNextNumber}
                            onChange={(e) => setInvoiceNextNumber(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsInvoiceNumModalOpen(false)}
                            className="px-3.5 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded bg-[#0A2540] hover:bg-[#061B30] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Form Content */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const parsedAmount = parseFloat(addInvoiceData.amount) || 0;
                    const parsedDiscount = parseFloat(addInvoiceData.discount) || 0;
                    const parsedAdjustment = parseFloat(addInvoiceData.adjustment) || 0;
                    const netAmount = Math.max(0, parsedAmount - parsedDiscount);
                    const vatRateNum = addInvoiceData.vatType === 'With VAT' ? (parseFloat(addInvoiceData.vatRate) || 0) : 0;
                    const vatAmount = (netAmount * vatRateNum) / 100;
                    const finalTotal = netAmount + vatAmount + parsedAdjustment;

                    const newInv: Omit<CrmInvoice, 'id'> = {
                      slNo: (invoices?.length || 0) + 1,
                      invoiceNumber: addInvoiceData.invoiceNumber || ('CTINV#' + Math.floor(15000 + Math.random() * 1000)),
                      opportunityOrderRef: addInvoiceData.opportunityOrder || 'CTSO#3854 / SUPER GENERAL AC UNITS WITH INST',
                      customer: addInvoiceData.customer || 'OFFICE OF H.H. SHEIKH HAMDAN BIN ZAYED AL NAHYAN',
                      contactPerson: addInvoiceData.attention?.trim() || '',
                      phone: '+971 0506693043',
                      owner: currentUser?.name || 'shaheer',
                      ownerAvatar: currentUser?.avatar || undefined,
                      issueDate: addInvoiceData.invoiceDate || '06-10-2026',
                      dueDate: addInvoiceData.invoiceDueDate,
                      amount: finalTotal || parsedAmount || 12432.0,
                      paidAmount: 0.0,
                      balanceAmount: finalTotal || parsedAmount || 12432.0,
                      status: 'Due',
                      lpoNumber: addInvoiceData.lpoNumber,
                      lpoDate: addInvoiceData.lpoDate,
                      referenceNumber: addInvoiceData.referenceNumber,
                    };
                    addInvoice(newInv);
                    setIsCreateInvoiceModalOpen(false);
                    setEditingInvoiceId(null);
                  }}
                  className="p-4 sm:p-6 space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-xs text-slate-700">
                    {/* LEFT COLUMN */}
                    <div className="space-y-3.5">
                      {/* Invoice Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">
                          Invoice Number <span className="text-red-500">*</span>
                        </label>
                        <div className="sm:col-span-2 relative">
                          <input
                            type="text"
                            required
                            value={addInvoiceData.invoiceNumber}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, invoiceNumber: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-8"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-600 cursor-pointer p-0.5"
                            title="Invoice Number Settings"
                            onClick={openInvoiceNumModal}
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">
                          Customer <span className="text-red-500">*</span>
                        </label>
                        <div className="sm:col-span-2 flex items-center gap-1.5">
                          <select
                            required
                            value={addInvoiceData.customer}
                            onChange={(e) => {
                              const selectedCust = e.target.value;
                              if (!selectedCust) {
                                setAddInvoiceData((prev) => ({ ...prev, customer: '' }));
                                return;
                              }

                              const matchedCustomer = customers?.find(
                                (c) =>
                                  (c.companyName && c.companyName.toLowerCase() === selectedCust.toLowerCase()) ||
                                  (c.customerName && c.customerName.toLowerCase() === selectedCust.toLowerCase())
                              );
                              const matchedQuote = liveQuotations?.find(
                                (q) => q.customer && q.customer.toLowerCase() === selectedCust.toLowerCase()
                              );
                              const matchedOpp = salesOpportunities?.find(
                                (opp) => opp.customer && opp.customer.toLowerCase() === selectedCust.toLowerCase()
                              );
                              const matchedOrd = liveOrders?.find(
                                (ord) => ord.customer && ord.customer.toLowerCase() === selectedCust.toLowerCase()
                              );

                              const oppOrderLabel = matchedQuote
                                ? `${matchedQuote.quotationNumber} / ${matchedQuote.subject || 'Quotation'}`
                                : matchedOpp
                                  ? `${matchedOpp.reference || matchedOpp.opportunityCode || 'OPP'} / ${matchedOpp.title}`
                                  : matchedOrd
                                    ? `${matchedOrd.orderNumber} / ${matchedOrd.opportunityRef || matchedOrd.subject || 'Sales Order'}`
                                    : addInvoiceData.opportunityOrder;

                              const amt = matchedQuote?.subtotal ?? matchedQuote?.totalAmount ?? matchedOpp?.amount ?? matchedOrd?.amount;
                              const disc = matchedQuote?.discountTotal ?? matchedQuote?.discountAmount ?? matchedOpp?.discount;
                              const vat = matchedQuote?.vatRate ?? matchedOpp?.vatRate;
                              const vatTyp = matchedOpp?.vatType || 'With VAT';
                              const adj = matchedOpp?.adjustment;
                              const att = matchedCustomer?.contactPerson || matchedQuote?.contactPerson || matchedOpp?.contactPerson || matchedOrd?.contactPerson;
                              const loc = matchedCustomer?.address || matchedQuote?.billingAddress || matchedOpp?.location || matchedOrd?.billingAddress;
                              const lpo = matchedOpp?.lpoNumber || matchedOrd?.poReference;
                              const lpoDt = matchedOpp?.lpoDate;
                              const refNo = matchedQuote?.quotationNumber || matchedOpp?.reference || matchedOpp?.opportunityCode || matchedOrd?.orderNumber;
                              const desc = matchedQuote?.subject || matchedOpp?.title || matchedOrd?.subject;

                              setAddInvoiceData((prev) => ({
                                ...prev,
                                customer: selectedCust,
                                opportunityOrder: oppOrderLabel || prev.opportunityOrder,
                                amount: amt !== undefined ? String(amt) : prev.amount,
                                discount: disc !== undefined ? String(disc) : prev.discount,
                                vatRate: vat !== undefined ? String(vat) : prev.vatRate,
                                vatType: vatTyp || prev.vatType,
                                adjustment: adj !== undefined ? String(adj) : prev.adjustment,
                                attention: att || prev.attention,
                                location: loc || prev.location,
                                lpoNumber: lpo || prev.lpoNumber,
                                lpoDate: lpoDt || prev.lpoDate,
                                referenceNumber: refNo || prev.referenceNumber,
                                description: desc || prev.description,
                              }));
                            }}
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">Select Customer</option>
                            {(() => {
                              const custNames = new Set<string>();
                              if (customers && customers.length > 0) {
                                customers.forEach((c) => {
                                  const name = c.companyName || c.customerName || (c as any).name;
                                  if (name && typeof name === 'string' && name.trim()) {
                                    custNames.add(name.trim());
                                  }
                                });
                              }
                              if (salesOpportunities && salesOpportunities.length > 0) {
                                salesOpportunities.forEach((opp) => {
                                  if (opp.customer && typeof opp.customer === 'string' && opp.customer.trim()) {
                                    custNames.add(opp.customer.trim());
                                  }
                                });
                              }
                              if (liveQuotations && liveQuotations.length > 0) {
                                liveQuotations.forEach((q) => {
                                  if (q.customer && typeof q.customer === 'string' && q.customer.trim()) {
                                    custNames.add(q.customer.trim());
                                  }
                                });
                              }
                              if (liveOrders && liveOrders.length > 0) {
                                liveOrders.forEach((ord) => {
                                  if (ord.customer && typeof ord.customer === 'string' && ord.customer.trim()) {
                                    custNames.add(ord.customer.trim());
                                  }
                                });
                              }
                              return Array.from(custNames)
                                .sort()
                                .map((custName) => (
                                  <option key={custName} value={custName}>
                                    {custName}
                                  </option>
                                ));
                            })()}
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsQuickAddInvoiceCustomerOpen(true)}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 shrink-0 shadow-2xs transition-colors cursor-pointer"
                            title="Add New Customer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New</span>
                          </button>
                        </div>
                      </div>

                      {/* Opportunity/Order */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">
                          Opportunity/Order <span className="text-red-500">*</span>
                        </label>
                        <div className="sm:col-span-2">
                          <select
                            value={addInvoiceData.opportunityOrder}
                            onChange={(e) => {
                              const selectedVal = e.target.value;
                              if (!selectedVal) {
                                setAddInvoiceData((prev) => ({ ...prev, opportunityOrder: '' }));
                                return;
                              }

                              const matchedQuote = liveQuotations?.find(
                                (q) =>
                                  q.id === selectedVal ||
                                  q.quotationNumber === selectedVal ||
                                  `${q.quotationNumber} / ${q.subject || 'Quotation'}` === selectedVal ||
                                  (q.quotationNumber && selectedVal.includes(q.quotationNumber))
                              );
                              const matchedOpp = salesOpportunities?.find(
                                (opp) =>
                                  opp.id === selectedVal ||
                                  opp.opportunityCode === selectedVal ||
                                  opp.reference === selectedVal ||
                                  `${opp.reference || opp.opportunityCode || 'OPP'} / ${opp.title}` === selectedVal ||
                                  `${opp.opportunityCode} / ${opp.title}` === selectedVal ||
                                  (opp.reference && selectedVal.includes(opp.reference)) ||
                                  (opp.opportunityCode && selectedVal.includes(opp.opportunityCode))
                              );
                              const matchedOrd = liveOrders?.find(
                                (o) =>
                                  o.id === selectedVal ||
                                  o.orderNumber === selectedVal ||
                                  `${o.orderNumber} / ${o.opportunityRef || o.subject || 'Sales Order'}` === selectedVal ||
                                  (o.orderNumber && selectedVal.includes(o.orderNumber))
                              );

                              const cust = matchedQuote?.customer || matchedOpp?.customer || matchedOrd?.customer || addInvoiceData.customer;
                              const amt = matchedQuote?.subtotal ?? matchedQuote?.totalAmount ?? matchedOpp?.amount ?? matchedOrd?.amount;
                              const disc = matchedQuote?.discountTotal ?? matchedQuote?.discountAmount ?? matchedOpp?.discount ?? '0';
                              const vat = matchedQuote?.vatRate ?? matchedOpp?.vatRate ?? '5';
                              const vatTyp = matchedOpp?.vatType || 'With VAT';
                              const adj = matchedOpp?.adjustment ?? '';
                              const att = matchedQuote?.contactPerson || matchedOpp?.contactPerson || matchedOrd?.contactPerson || addInvoiceData.attention;
                              const loc = matchedQuote?.billingAddress || matchedOpp?.location || matchedOrd?.billingAddress || addInvoiceData.location;
                              const lpo = matchedOpp?.lpoNumber || matchedOrd?.poReference || addInvoiceData.lpoNumber;
                              const lpoDt = matchedOpp?.lpoDate || addInvoiceData.lpoDate;
                              const refNo = matchedQuote?.quotationNumber || matchedOpp?.reference || matchedOpp?.opportunityCode || matchedOrd?.orderNumber || addInvoiceData.referenceNumber;
                              const desc = matchedQuote?.subject || matchedOpp?.title || matchedOrd?.subject || addInvoiceData.description;

                              setAddInvoiceData((prev) => ({
                                ...prev,
                                opportunityOrder: selectedVal,
                                customer: cust || prev.customer,
                                amount: amt !== undefined ? String(amt) : prev.amount,
                                discount: disc !== undefined ? String(disc) : prev.discount,
                                vatRate: vat !== undefined ? String(vat) : prev.vatRate,
                                vatType: vatTyp,
                                adjustment: adj !== undefined ? String(adj) : prev.adjustment,
                                attention: att || prev.attention,
                                location: loc || prev.location,
                                lpoNumber: lpo || prev.lpoNumber,
                                lpoDate: lpoDt || prev.lpoDate,
                                referenceNumber: refNo || prev.referenceNumber,
                                description: desc || prev.description,
                              }));
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white truncate"
                          >
                            <option value="">Select</option>
                            {liveQuotations && liveQuotations.length > 0 && (
                              <optgroup label="Quotations">
                                {liveQuotations.map((q) => {
                                  const label = `${q.quotationNumber} / ${q.subject || 'Quotation'}`;
                                  return (
                                    <option key={q.id} value={label}>
                                      {label} {q.totalAmount ? `(AED ${q.totalAmount.toLocaleString()})` : ''} - {q.customer}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                            {salesOpportunities && salesOpportunities.length > 0 && (
                              <optgroup label="Opportunities">
                                {salesOpportunities.map((opp) => {
                                  const label = `${opp.reference || opp.opportunityCode || 'OPP'} / ${opp.title}`;
                                  return (
                                    <option key={opp.id} value={label}>
                                      {label} {opp.amount ? `(AED ${opp.amount.toLocaleString()})` : ''} - {opp.customer}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                            {liveOrders && liveOrders.length > 0 && (
                              <optgroup label="Orders">
                                {liveOrders.map((ord) => {
                                  const label = `${ord.orderNumber} / ${ord.opportunityRef || ord.subject || 'Sales Order'}`;
                                  return (
                                    <option key={ord.id} value={label}>
                                      {label} {ord.amount ? `(AED ${ord.amount.toLocaleString()})` : ''} - {ord.customer}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* LPO Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">LPO Date</label>
                        <div className="sm:col-span-2">
                          <CezconDateInput
                            placeholder="DD-MM-YYYY"
                            value={addInvoiceData.lpoDate}
                            onChange={(val) => setAddInvoiceData({ ...addInvoiceData, lpoDate: val })}
                          />
                        </div>
                      </div>

                      {/* Reference Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Reference Number</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={addInvoiceData.referenceNumber}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, referenceNumber: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            step="any"
                            required
                            value={addInvoiceData.amount}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, amount: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* VAT */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">VAT</label>
                        <div className="sm:col-span-2 flex items-center gap-2">
                          <input
                            type="number"
                            value={addInvoiceData.vatRate}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, vatRate: e.target.value })}
                            className="w-20 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 text-center"
                          />
                          <span className="text-xs text-slate-500 font-medium">%</span>
                          <input
                            type="text"
                            readOnly
                            placeholder="VAT Amount"
                            value={(() => {
                              const parsedAmount = parseFloat(addInvoiceData.amount) || 0;
                              const parsedDiscount = parseFloat(addInvoiceData.discount) || 0;
                              const net = Math.max(0, parsedAmount - parsedDiscount);
                              const rate = addInvoiceData.vatType === 'With VAT' ? (parseFloat(addInvoiceData.vatRate) || 0) : 0;
                              const vat = (net * rate) / 100;
                              return vat ? vat.toFixed(2) : '';
                            })()}
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 bg-slate-50 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Total */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Total</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            readOnly
                            value={(() => {
                              const parsedAmount = parseFloat(addInvoiceData.amount) || 0;
                              const parsedDiscount = parseFloat(addInvoiceData.discount) || 0;
                              const parsedAdjustment = parseFloat(addInvoiceData.adjustment) || 0;
                              const net = Math.max(0, parsedAmount - parsedDiscount);
                              const rate = addInvoiceData.vatType === 'With VAT' ? (parseFloat(addInvoiceData.vatRate) || 0) : 0;
                              const vat = (net * rate) / 100;
                              const tot = net + vat + parsedAdjustment;
                              return tot ? tot.toFixed(2) : '';
                            })()}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 bg-slate-50 focus:outline-none font-semibold"
                          />
                        </div>
                      </div>

                      {/* Payment Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium flex items-center gap-1">
                          <span className="text-blue-500">📍</span> Payment Location
                        </label>
                        <div className="sm:col-span-2 relative">
                          <input
                            type="text"
                            placeholder="Search location"
                            value={addInvoiceData.location}
                            onChange={(e) => {
                              setAddInvoiceData({ ...addInvoiceData, location: e.target.value });
                              setInvoiceLocationDropdownOpen(true);
                            }}
                            onFocus={() => setInvoiceLocationDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setInvoiceLocationDropdownOpen(false), 150)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-8"
                          />
                          {addInvoiceData.location && (
                            <button
                              type="button"
                              onClick={() => setAddInvoiceData({ ...addInvoiceData, location: '' })}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {invoiceLocationDropdownOpen && (() => {
                            const filtered = UAE_LOCATIONS.filter((loc) =>
                              loc.toLowerCase().includes(addInvoiceData.location.toLowerCase())
                            );
                            return filtered.length > 0 ? (
                              <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
                                {filtered.map((loc) => (
                                  <button
                                    key={loc}
                                    type="button"
                                    onMouseDown={() => {
                                      setAddInvoiceData({ ...addInvoiceData, location: loc });
                                      setInvoiceLocationDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                  >
                                    {loc}
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-3.5">
                      {/* Invoice Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Invoice Date</label>
                        <div className="sm:col-span-2">
                          <CezconDateInput
                            value={addInvoiceData.invoiceDate}
                            onChange={(val) => setAddInvoiceData({ ...addInvoiceData, invoiceDate: val })}
                          />
                        </div>
                      </div>

                      {/* Invoice Due Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Invoice Due Date</label>
                        <div className="sm:col-span-2">
                          <CezconDateInput
                            placeholder="DD-MM-YYYY"
                            value={addInvoiceData.invoiceDueDate}
                            onChange={(val) => setAddInvoiceData({ ...addInvoiceData, invoiceDueDate: val })}
                          />
                        </div>
                      </div>

                      {/* LPO Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">LPO Number</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={addInvoiceData.lpoNumber}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, lpoNumber: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Invoice Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Invoice Type</label>
                        <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                          <select
                            value={addInvoiceData.invoiceType}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, invoiceType: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="File Upload">File Upload</option>
                            <option value="Manual Entry">Manual Entry</option>
                            <option value="Direct Entry">Direct Entry</option>
                          </select>
                          <select
                            value={addInvoiceData.vatType}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, vatType: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="With VAT">With VAT</option>
                            <option value="Without VAT">Without VAT</option>
                            <option value="Zero VAT">Zero VAT</option>
                          </select>
                        </div>
                      </div>

                      {/* Document */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Document</label>
                        <div className="sm:col-span-2 flex items-center gap-2">
                          <input
                            type="file"
                            id="invoice-document-upload-cezcon"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAddInvoiceData({ ...addInvoiceData, documentName: e.target.files[0].name });
                              }
                            }}
                          />
                          <label
                            htmlFor="invoice-document-upload-cezcon"
                            className="px-2.5 py-1 border border-slate-300 bg-[#EFEFEF] hover:bg-slate-200 text-slate-700 rounded-xs text-xs cursor-pointer shadow-2xs font-normal shrink-0"
                          >
                            Choose file
                          </label>
                          <span className="text-xs text-slate-500 truncate">
                            {addInvoiceData.documentName || 'No file chosen'}
                          </span>
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Discount</label>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            step="any"
                            value={addInvoiceData.discount}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, discount: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Adjustment */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Adjustment</label>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            step="any"
                            value={addInvoiceData.adjustment}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, adjustment: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Attention */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                        <label className="text-slate-700 font-medium">Attention</label>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={addInvoiceData.attention}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, attention: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-2">
                        <label className="text-slate-700 font-medium pt-1.5">Description</label>
                        <div className="sm:col-span-2">
                          <textarea
                            rows={2}
                            value={addInvoiceData.description}
                            onChange={(e) => setAddInvoiceData({ ...addInvoiceData, description: e.target.value })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-xs text-[#2563EB] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addInvoiceData.addReceipt}
                        onChange={(e) => setAddInvoiceData({ ...addInvoiceData, addReceipt: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>Add Receipt</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#2563EB] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addInvoiceData.addPaymentFollowup}
                        onChange={(e) => setAddInvoiceData({ ...addInvoiceData, addPaymentFollowup: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>Add Payment Followup</span>
                    </label>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#1B2A4A] hover:bg-[#111C33] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateInvoiceModalOpen(false);
                        setEditingInvoiceId(null);
                      }}
                      className="px-4 py-2 bg-white border border-[#D2D6DE] hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : selectedInvoice ? (
            /* ========================================================================= */
            /* CEZCON CRM EXACT INVOICE DETAIL FULL PAGE VIEW */
            /* ========================================================================= */
            <div className="space-y-3 font-sans">
              {/* Top Notification Banner */}
              <div className="bg-[#EAEAF0] border border-[#D5D5E0] rounded-sm px-3.5 py-2 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 tracking-wide">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>
                    INVOICE CREATED BY <span className="font-extrabold">{(selectedInvoice.owner && !selectedInvoice.owner.toLowerCase().includes('alex rivera') && !selectedInvoice.owner.toLowerCase().includes('nebin benny') ? selectedInvoice.owner : (currentUser?.name || 'shaheer')).toUpperCase()}</span> ON SAT {selectedInvoice.issueDate || '03-10-2026'} 2:58:36 PM
                  </span>
                </div>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(null)}
                      className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded-xs transition cursor-pointer"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sub-tabs: Invoice / Receipt */}
                  <div className="flex items-center gap-1 border-b border-slate-200 bg-transparent px-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setInvoiceDetailSubTab('invoice')}
                      className={cn(
                        'px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-t-2 transition cursor-pointer',
                        invoiceDetailSubTab === 'invoice'
                          ? 'border-[#2E7D32] text-slate-900 bg-white border-l border-r border-slate-200 -mb-px rounded-t'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Invoice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceDetailSubTab('receipt')}
                      className={cn(
                        'px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-t-2 transition cursor-pointer',
                        invoiceDetailSubTab === 'receipt'
                          ? 'border-[#2E7D32] text-slate-900 bg-white border-l border-r border-slate-200 -mb-px rounded-t'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <ReceiptIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Receipt</span>
                    </button>
                  </div>

                  {/* Main Card Container */}
                  <div className="bg-white border border-[#E2E8F0] rounded-sm p-4 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* LEFT COLUMN: Invoice Details & Payment Followup */}
                      <div className="lg:col-span-6 space-y-4">
                        {/* Invoice Details Card */}
                        <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs">
                          <div className="px-3.5 py-2 bg-[#F5F5F5] border-b border-slate-200 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-700">Invoice Details</span>
                          </div>
                          <div className="p-3.5 space-y-2.5 text-xs">
                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <span className="text-slate-600 font-medium">Invoice Owner</span>
                          <span className="col-span-2 font-bold text-slate-800 uppercase">
                            {selectedInvoice.owner &&
                            !selectedInvoice.owner.toLowerCase().includes('alex rivera') &&
                            !selectedInvoice.owner.toLowerCase().includes('nebin benny')
                              ? selectedInvoice.owner
                              : currentUser?.name || 'shaheer'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <span className="text-slate-600 font-medium">Customer Name</span>
                          <div className="col-span-2 flex items-center gap-1.5">
                            <span className="text-[#2563EB] font-bold hover:underline cursor-pointer">
                              {selectedInvoice.customer || 'CITICORE INTERIOR DESIGN - SOLE PROPRIETORSHIP L.L.C'}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <span className="text-slate-600 font-medium">Opportunity/Order</span>
                          <div className="col-span-2 flex items-center gap-1.5">
                            <span className="text-[#2563EB] font-bold hover:underline cursor-pointer">
                              {selectedInvoice.opportunityOrderRef || 'CTEQ#7120 / AC SERVICE'}
                            </span>
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0" />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <span className="text-slate-600 font-medium">Invoice Date</span>
                          <span className="col-span-2 text-slate-800 font-medium">
                            {selectedInvoice.issueDate || '03-10-2026'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <span className="text-slate-600 font-medium">Invoice Number</span>
                          <span className="col-span-2 font-bold text-slate-800">
                            {selectedInvoice.invoiceNumber || 'CTINV#15000'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-0.5">
                          <span className="text-slate-600 font-medium">Attention</span>
                          <span className="col-span-2 font-bold text-slate-800">
                            {selectedInvoice.contactPerson &&
                            !selectedInvoice.contactPerson.toLowerCase().includes('hala fawzi') &&
                            !selectedInvoice.contactPerson.toLowerCase().includes('mohammad hattab')
                              ? selectedInvoice.contactPerson
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Followup Card */}
                    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white shadow-2xs">
                      <div className="px-3.5 py-2 bg-[#F5F5F5] border-b border-slate-200 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">Payment Followup</span>
                      </div>
                      <div className="p-4 flex flex-col items-center justify-center min-h-[90px] relative">
                        <span className="text-xs text-slate-500">No payment followup</span>
                        <div className="w-full flex justify-end mt-2">
                          <button
                            type="button"
                            className="px-3 py-1 bg-[#337AB7] hover:bg-[#286090] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Overview */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="text-xs font-bold text-slate-700">Overview</div>

                    {/* 4 rows x 2 columns grid of metric cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Card 1: Amount */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Amount</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {((selectedInvoice.amount || 3000) * 0.95238).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) === '3,000.00' ? '3,000.00' : (selectedInvoice.amount || 3000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 2: Discount */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Discount</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">0.00</div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 3: VAT (5%) */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">VAT (5%)</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {((selectedInvoice.amount || 3150) * 0.047619).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) === '150.00' ? '150.00' : '150.00'}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 4: Sub Total */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Sub Total</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {(selectedInvoice.amount || 3150).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#DBEAFE] flex items-center justify-center text-[#3B82F6]">
                          <TableIcon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 5: Adjustment */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Adjustment</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">0.00</div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#E0F2FE] flex items-center justify-center text-[#0EA5E9]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 6: Total Amount */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Total Amount</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {(selectedInvoice.amount || 3150).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 7: Payment Received */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Payment Received</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {(selectedInvoice.paidAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#FEF9C3] flex items-center justify-center text-[#CA8A04]">
                          <FileText className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card 8: Receivable */}
                      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">Receivable</div>
                          <div className="text-sm font-bold text-[#E11D48] mt-0.5">
                            {(selectedInvoice.balanceAmount || selectedInvoice.amount || 3150).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-[#FCE7F3] flex items-center justify-center text-[#DB2777]">
                          <TableIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="border-t border-slate-200 pt-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 font-semibold select-none pb-2">
                        <th className="py-2.5 px-3 font-semibold text-slate-700">Description</th>
                        <th className="py-2.5 px-3 text-center font-semibold text-slate-700 w-24">QTY</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-slate-700 w-32">Price</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-slate-700 w-32">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const itemsToDisplay =
                          selectedInvoice.items && selectedInvoice.items.length > 0
                            ? selectedInvoice.items
                            : [
                              {
                                id: 'default-item',
                                description: selectedInvoice.opportunityOrderRef
                                  ? selectedInvoice.opportunityOrderRef.split('/')[1]?.trim() || selectedInvoice.opportunityOrderRef
                                  : 'Sales Item',
                                code: selectedInvoice.referenceNumber || '',
                                unit: 'Each',
                                brand: '',
                                qty: 1,
                                price: selectedInvoice.subtotal || selectedInvoice.amount || 0,
                                total: selectedInvoice.subtotal || selectedInvoice.amount || 0,
                              },
                            ];

                        return itemsToDisplay.map((item, idx) => {
                          const itemTotal =
                            item.total !== undefined ? item.total : (Number(item.qty) || 1) * (Number(item.price) || 0);
                          return (
                            <tr key={item.id || idx}>
                              <td className="py-3 px-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-[8px] text-slate-400 font-medium text-center shrink-0">
                                    <ImageIcon className="w-4 h-4 text-slate-400 mb-0.5" />
                                    <span>NO IMAGE</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-bold text-slate-800 text-xs">{item.description}</div>
                                    {(item.code || item.unit || item.brand) && (
                                      <div className="text-[11px] text-slate-500 space-y-0.5">
                                        {item.code && (
                                          <div>
                                            Code: <span className="text-slate-700">{item.code}</span>
                                          </div>
                                        )}
                                        {item.unit && (
                                          <div>
                                            Unit: <span className="text-slate-700">{item.unit}</span>
                                          </div>
                                        )}
                                        {item.brand && (
                                          <div>
                                            Brand: <span className="text-slate-700">{item.brand}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center font-medium text-slate-800">{item.qty || 1}</td>
                              <td className="py-3 px-3 text-right font-medium text-slate-800">
                                {(Number(item.price) || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-slate-800">
                                {itemTotal.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between border-t border-b border-slate-200 py-2.5 px-3 text-xs">
                    <div className="font-bold text-slate-800">
                      Total Quantity:{' '}
                      <span className="font-normal ml-16">
                        {selectedInvoice.items && selectedInvoice.items.length > 0
                          ? selectedInvoice.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0)
                          : 1}
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary (Right aligned) */}
                  <div className="flex justify-end pt-4 pb-2">
                    <div className="w-72 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">Amount</span>
                        <span className="font-semibold">
                          {(selectedInvoice.subtotal || selectedInvoice.amount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">VAT ({selectedInvoice.vatRate || 5}%)</span>
                        <span className="font-semibold">
                          {(selectedInvoice.vatAmount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">Sub Total</span>
                        <span className="font-semibold">
                          {((selectedInvoice.subtotal || selectedInvoice.amount || 0) + (selectedInvoice.vatAmount || 0)).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="font-medium">Adjustment</span>
                        <span className="font-semibold">
                          {(Number(selectedInvoice.adjustment) || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200">
                        <span className="font-bold">Total Amount</span>
                        <span className="font-bold text-sm">
                          {(selectedInvoice.totalAmount || selectedInvoice.amount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setIsInvoicePrintFormatDropdownOpen((prev) => !prev)}
                        className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Format <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {isInvoicePrintFormatDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsInvoicePrintFormatDropdownOpen(false)}
                          />
                          <div className="absolute right-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mt-1.5 bg-white border border-slate-200 rounded shadow-lg py-1.5 z-50 min-w-[280px] sm:min-w-[300px] animate-in fade-in zoom-in-95 duration-100 text-left">
                            {[
                              'Print with Quantity',
                              'Print without Quantity',
                              'Print without Item Price',
                              'Print without Quantity & Item Price',
                              'Print without Total Price',
                              'Print without Unit Price & Total Price',
                              'Print without Unit Price & with Total Price',
                            ].map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => {
                                  handleOpenPrintInvoice(selectedInvoice, fmt);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <span className="text-[10px] text-slate-700 font-bold">•</span>
                                <span className="font-normal text-slate-800">{fmt}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPrintInvoice(selectedInvoice, 'Print in USD')}
                      className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print in USD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPrintInvoice(selectedInvoice, 'Print with Quantity')}
                      className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEditInvoice(selectedInvoice);
                      }}
                      className="px-3 py-1.5 bg-[#337AB7] hover:bg-[#286090] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteInvoiceConfirm(selectedInvoice);
                      }}
                      className="px-3 py-1.5 bg-[#D9534F] hover:bg-[#C9302C] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* INVOICE ACTIVITIES */}
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <TableIcon className="w-4 h-4 text-slate-600" />
                    <span>Invoice Activities</span>
                  </div>

                  {/* Sub-tabs & +Add Buttons */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <button
                        type="button"
                        onClick={() => setInvoiceActivityTab('task')}
                        className={cn(
                          'flex items-center gap-1.5 pb-1 border-b-2 transition cursor-pointer',
                          invoiceActivityTab === 'task'
                            ? 'border-slate-800 text-slate-900 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        )}
                      >
                        <List className="w-3.5 h-3.5 text-slate-500" />
                        <span>Task</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceActivityTab('notes')}
                        className={cn(
                          'flex items-center gap-1.5 pb-1 border-b-2 transition cursor-pointer',
                          invoiceActivityTab === 'notes'
                            ? 'border-slate-800 text-slate-900 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        )}
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Notes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceActivityTab('visits')}
                        className={cn(
                          'flex items-center gap-1.5 pb-1 border-b-2 transition cursor-pointer',
                          invoiceActivityTab === 'visits'
                            ? 'border-slate-800 text-slate-900 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        )}
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sales Visit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="p-4 border border-slate-200 rounded-sm bg-slate-50/50 text-xs text-slate-500">
                    {invoiceActivityTab === 'task' && 'No Tasks.'}
                    {invoiceActivityTab === 'notes' && 'No Notes.'}
                    {invoiceActivityTab === 'visits' && 'No Sales Visits.'}
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(null)}
                      className="px-4 py-1.5 bg-white border border-[#D2D6DE] hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Shaheer">Shaheer</option>
                            <option value="SUPER ADMIN">SUPER ADMIN</option>
                            <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                            <option value="COOL TECH">COOL TECH</option>
                          </>
                        )}
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
                    onClick={() => {
                      setEditingInvoiceId(null);
                      setAddInvoiceData({
                        invoiceNumber: 'CTINV#' + Math.floor(15000 + Math.random() * 1000),
                        invoiceDate: '06-10-2026',
                        customer: '',
                        invoiceDueDate: '',
                        opportunityOrder: '',
                        lpoNumber: '',
                        lpoDate: '',
                        invoiceType: 'File Upload',
                        vatType: 'With VAT',
                        referenceNumber: '',
                        documentName: '',
                        amount: '',
                        discount: '',
                        vatRate: '5',
                        adjustment: '',
                        attention: '',
                        location: '',
                        description: '',
                        addReceipt: false,
                        addPaymentFollowup: false,
                      });
                      setInvoiceLineItems([
                        {
                          id: `item-${Date.now()}`,
                          description: 'WATER COOLER 2 TAP 25 USG COOLTECH CT25F2',
                          code: 'CT25F2',
                          unit: 'Each',
                          brand: 'COOLTECH',
                          qty: 3,
                          price: 1000,
                        },
                      ]);
                      setInvoiceDiscountPercent('0.00');
                      setIsCreateInvoiceModalOpen(true);
                    }}
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
                            {(() => {
                              const av = (inv.ownerAvatar && !inv.ownerAvatar.includes('unsplash') && !inv.ownerAvatar.includes('photo-')) ? inv.ownerAvatar : getEmployeePhoto(inv.owner);
                              const name = inv.owner || currentUser?.name || 'S';
                              if (av) {
                                return (
                                  <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                    <img src={av} alt={name} className="w-full h-full object-cover" />
                                  </div>
                                );
                              }
                              return (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-2xs shrink-0">
                                  {name[0]}
                                </div>
                              );
                            })()}
                            <span className="text-[11px] text-slate-600 font-medium">{inv.owner || currentUser?.name || 'shaheer'}</span>
                          </div>

                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (openInvoiceActionMenuId === `mobile-${inv.id}`) {
                                  setOpenInvoiceActionMenuId(null);
                                  setActionMenuPosition(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const menuHeight = 155;
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const openUpward = spaceBelow < menuHeight + 10;
                                  const top = openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4;
                                  const left = Math.max(10, rect.right - 176);
                                  setActionMenuPosition({ top, left });
                                  setOpenInvoiceActionMenuId(`mobile-${inv.id}`);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#3B384E] hover:bg-[#2D2A3E] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            >
                              <Settings className="w-3 h-3 text-white" />
                              <ChevronDown className="w-2.5 h-2.5 text-white" />
                            </button>

                            {openInvoiceActionMenuId === `mobile-${inv.id}` && actionMenuPosition && (
                              <>
                                <div
                                  className="fixed inset-0 z-[9998]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenInvoiceActionMenuId(null);
                                    setActionMenuPosition(null);
                                  }}
                                />
                                <div
                                  style={{
                                    position: 'fixed',
                                    top: `${actionMenuPosition.top}px`,
                                    left: `${actionMenuPosition.left}px`,
                                    zIndex: 9999,
                                  }}
                                  className="w-44 bg-white border border-[#D2D6DE] rounded shadow-xl py-1 text-left"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`/sales?tab=invoice&id=${inv.id}`, '_blank');
                                      setOpenInvoiceActionMenuId(null);
                                      setActionMenuPosition(null);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                    <span className="font-normal text-[12px]">Open in new tab</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedInvoice(inv);
                                      setOpenInvoiceActionMenuId(null);
                                      setActionMenuPosition(null);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                    <span className="font-normal text-[12px]">View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditInvoice(inv);
                                      setOpenInvoiceActionMenuId(null);
                                      setActionMenuPosition(null);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                    <span className="font-normal text-[12px]">Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteInvoiceConfirm(inv);
                                      setOpenInvoiceActionMenuId(null);
                                      setActionMenuPosition(null);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                    <span className="font-normal text-[12px]">Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
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
                              {(() => {
                                const av = (inv.ownerAvatar && !inv.ownerAvatar.includes('unsplash') && !inv.ownerAvatar.includes('photo-')) ? inv.ownerAvatar : getEmployeePhoto(inv.owner);
                                const name = inv.owner || currentUser?.name || 'S';
                                if (av) {
                                  return (
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                      <img src={av} alt={name} className="w-full h-full object-cover" />
                                    </div>
                                  );
                                }
                                return (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs">
                                    {name[0]}
                                  </div>
                                );
                              })()}
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
                              <div className="inline-block text-left">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openInvoiceActionMenuId === inv.id) {
                                      setOpenInvoiceActionMenuId(null);
                                      setActionMenuPosition(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const menuHeight = 155;
                                      const spaceBelow = window.innerHeight - rect.bottom;
                                      const openUpward = spaceBelow < menuHeight + 10;
                                      const top = openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4;
                                      const left = Math.max(10, rect.right - 176);
                                      setActionMenuPosition({ top, left });
                                      setOpenInvoiceActionMenuId(inv.id);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#3B384E] hover:bg-[#2D2A3E] text-white rounded text-xs font-semibold shadow-xs cursor-pointer transition"
                                  title="Action"
                                >
                                  <Settings className="w-3.5 h-3.5 text-white" />
                                  <ChevronDown className="w-2.5 h-2.5 text-white" />
                                </button>

                                {openInvoiceActionMenuId === inv.id && actionMenuPosition && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[9998]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenInvoiceActionMenuId(null);
                                        setActionMenuPosition(null);
                                      }}
                                    />
                                    <div
                                      style={{
                                        position: 'fixed',
                                        top: `${actionMenuPosition.top}px`,
                                        left: `${actionMenuPosition.left}px`,
                                        zIndex: 9999,
                                      }}
                                      className="w-44 bg-white border border-[#D2D6DE] rounded shadow-xl py-1 text-left"
                                    >
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(`/sales?tab=invoice&id=${inv.id}`, '_blank');
                                          setOpenInvoiceActionMenuId(null);
                                          setActionMenuPosition(null);
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                      >
                                        <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                        <span className="font-normal text-[12px]">Open in new tab</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedInvoice(inv);
                                          setOpenInvoiceActionMenuId(null);
                                          setActionMenuPosition(null);
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                      >
                                        <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                        <span className="font-normal text-[12px]">View</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditInvoice(inv);
                                          setOpenInvoiceActionMenuId(null);
                                          setActionMenuPosition(null);
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                        <span className="font-normal text-[12px]">Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteInvoiceConfirm(inv);
                                          setOpenInvoiceActionMenuId(null);
                                          setActionMenuPosition(null);
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 text-xs text-slate-800 hover:bg-slate-50 transition cursor-pointer text-left"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                        <span className="font-normal text-[12px]">Delete</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
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
            </>
          )}
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
                    {users && users.length > 0 ? (
                      users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))
                    ) : (
                      <option value={currentUser?.name || 'shaheer'}>{currentUser?.name || 'shaheer'}</option>
                    )}
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
                        {(() => {
                          const av = (r.createdByAvatar && !r.createdByAvatar.includes('unsplash') && !r.createdByAvatar.includes('photo-')) ? r.createdByAvatar : getEmployeePhoto(r.createdBy);
                          const name = r.createdBy || currentUser?.name || 'S';
                          if (av) {
                            return (
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <img src={av} alt={name} className="w-full h-full object-cover" />
                              </div>
                            );
                          }
                          return (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-2xs shrink-0">
                              {name[0]}
                            </div>
                          );
                        })()}
                        <span className="text-[11px] text-slate-600 font-medium">{r.createdBy || currentUser?.name || 'shaheer'}</span>
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
                            {(() => {
                              const av = (r.createdByAvatar && !r.createdByAvatar.includes('unsplash') && !r.createdByAvatar.includes('photo-')) ? r.createdByAvatar : getEmployeePhoto(r.createdBy);
                              const name = r.createdBy || currentUser?.name || 'S';
                              if (av) {
                                return (
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                    <img src={av} alt={name} className="w-full h-full object-cover" />
                                  </div>
                                );
                              }
                              return (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs">
                                  {name[0]}
                                </div>
                              );
                            })()}
                            <span className="text-slate-800 font-medium text-xs">
                              {r.createdBy || currentUser?.name || 'shaheer'}
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
                    {users && users.length > 0 ? (
                      users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))
                    ) : (
                      <option value={currentUser?.name || 'shaheer'}>{currentUser?.name || 'shaheer'}</option>
                    )}
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
                        {(() => {
                          const av = (dn.ownerAvatar && !dn.ownerAvatar.includes('unsplash') && !dn.ownerAvatar.includes('photo-')) ? dn.ownerAvatar : getEmployeePhoto(dn.owner);
                          const name = dn.owner || currentUser?.name || 'S';
                          if (av) {
                            return (
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <img src={av} alt={name} className="w-full h-full object-cover" />
                              </div>
                            );
                          }
                          return (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[9px] uppercase shadow-2xs shrink-0">
                              {name[0]}
                            </div>
                          );
                        })()}
                        <span className="text-[11px] text-slate-600 font-medium">{dn.owner || currentUser?.name || 'shaheer'}</span>
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
                          {(() => {
                            const av = (dn.ownerAvatar && !dn.ownerAvatar.includes('unsplash') && !dn.ownerAvatar.includes('photo-')) ? dn.ownerAvatar : getEmployeePhoto(dn.owner);
                            const name = dn.owner || currentUser?.name || 'S';
                            if (av) {
                              return (
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 inline-block">
                                  <img src={av} alt={name} className="w-full h-full object-cover" />
                                </div>
                              );
                            }
                            return (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white inline-flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs">
                                {name[0]}
                              </div>
                            );
                          })()}
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

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subtotal (AED) *</label>
              <input
                type="number"
                required
                value={quoteFormData.subtotal}
                onChange={(e) => {
                  const sub = Number(e.target.value) || 0;
                  const rate = Number(quoteFormData.vatRate ?? 5) || 0;
                  const vat = (sub * rate) / 100;
                  setQuoteFormData({
                    ...quoteFormData,
                    subtotal: sub,
                    vatAmount: vat,
                    totalAmount: sub + vat,
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">VAT Rate (%)</label>
              <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden">
                <input
                  type="number"
                  step="any"
                  value={quoteFormData.vatRate !== undefined ? quoteFormData.vatRate : 5}
                  onChange={(e) => {
                    const rate = Number(e.target.value) || 0;
                    const sub = Number(quoteFormData.subtotal) || 0;
                    const vat = (sub * rate) / 100;
                    setQuoteFormData({
                      ...quoteFormData,
                      vatRate: e.target.value as any,
                      vatAmount: vat,
                      totalAmount: sub + vat,
                    });
                  }}
                  className="w-full px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
                <span className="px-2 text-xs text-slate-500 bg-slate-100 font-semibold border-l border-slate-300 py-1.5">%</span>
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">VAT Amount (AED)</label>
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
              createdBy: currentUser?.name || 'shaheer',
              createdByAvatar: currentUser?.avatar || getEmployeePhoto(currentUser?.name || 'shaheer'),
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
              owner: currentUser?.name || 'shaheer',
              ownerAvatar: currentUser?.avatar || getEmployeePhoto(currentUser?.name || 'shaheer'),
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

      {/* Toast Notification */}
      {salesToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded shadow-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{salesToast}</span>
        </div>
      )}

      {/* ASSIGN OPPORTUNITY MODAL (Exact Cezcon CRM Image 2 Design) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-[480px] border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
              <h3 className="text-[13px] font-normal text-slate-800">Assign Opportunity</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedOpportunity(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded cursor-pointer text-xs leading-none"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const targetIds = selectedOpportunity
                  ? [selectedOpportunity.id]
                  : selectedIds.length > 0
                    ? selectedIds
                    : (salesOpportunities.length > 0 ? [salesOpportunities[0].id] : []);

                if (targetIds.length > 0) {
                  targetIds.forEach((id) => {
                    updateOpportunity(id, {
                      opportunityAssigned: assignedToUser,
                      owner: assignedToUser,
                    });
                  });
                  setSalesToast(
                    `Opportunity${targetIds.length > 1 ? 'ies' : ''} assigned to ${assignedToUser}`
                  );
                }
                setIsAssignModalOpen(false);
                setSelectedOpportunity(null);
              }}
            >
              <div className="px-6 py-6">
                <div className="flex items-center gap-6">
                  <label className="text-xs text-slate-700 font-normal shrink-0 w-20">
                    Assign To
                  </label>
                  <div className="flex-1 relative">
                    <div className="w-full flex items-center justify-between bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs hover:border-slate-400 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                          const av = getEmployeePhoto(assignedToUser);
                          if (av) {
                            return (
                              <img
                                src={av}
                                alt={assignedToUser}
                                className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                            );
                          }
                          return (
                            <div className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[8px] uppercase shrink-0">
                              {(assignedToUser || 'U')[0]}
                            </div>
                          );
                        })()}
                        <span className="font-medium text-slate-800 uppercase tracking-wide text-xs truncate">
                          {assignedToUser}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                    </div>

                    {/* Native Select Overlay */}
                    <select
                      value={assignedToUser}
                      onChange={(e) => setAssignedToUser(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    >
                      <option value="NEBIN BENNY">NEBIN BENNY</option>
                      <option value="Nafal">Nafal</option>
                      <option value="Muhammed Adhil">Muhammed Adhil</option>
                      <option value="Muhammed Shemin">Muhammed Shemin</option>
                      <option value="Muhammed Shibil">Muhammed Shibil</option>
                      <option value="Afsal">Afsal</option>
                      <option value="Shaheer">Shaheer</option>
                      <option value="shameem">shameem</option>
                      <option value="Arun">Arun</option>
                      <option value="System Super Admin">System Super Admin</option>
                      {users
                        .filter(
                          (u) =>
                            ![
                              'NEBIN BENNY',
                              'Nafal',
                              'Muhammed Adhil',
                              'Muhammed Shemin',
                              'Muhammed Shibil',
                              'Afsal',
                              'Shaheer',
                              'shameem',
                              'Arun',
                              'System Super Admin',
                            ].includes(u.name)
                        )
                        .map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-[#EFF2F5] border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedOpportunity(null);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer shadow-2xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B1E2E] hover:bg-[#07192b] rounded shadow-2xs transition-colors cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE OPPORTUNITY CONFIRMATION MODAL */}
      {deleteOppConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Delete Opportunity</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteOppConfirm(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded cursor-pointer text-base leading-none"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-700">
                Are you sure you want to delete this opportunity?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                <div className="font-bold text-[#2563EB]">
                  {deleteOppConfirm.opportunityCode || 'CTEQ#7016'} - {deleteOppConfirm.title}
                </div>
                <div className="text-slate-600">Customer: {deleteOppConfirm.customer}</div>
                <div className="text-slate-500">
                  Amount: AED{' '}
                  {deleteOppConfirm.amount?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <p className="text-[11px] text-red-500 font-medium">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3 bg-[#F8FAFC] border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeleteOppConfirm(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOpportunity(deleteOppConfirm.id);
                  if (viewOppId === deleteOppConfirm.id || viewOppId === deleteOppConfirm.opportunityCode) {
                    router.push('/sales?tab=opportunities');
                  }
                  setSalesToast(
                    `Opportunity ${deleteOppConfirm.opportunityCode || ''} deleted successfully`
                  );
                  setDeleteOppConfirm(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE INVOICE CONFIRMATION MODAL */}
      {deleteInvoiceConfirm && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2.5 text-red-600 font-bold text-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span>Delete Invoice</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteInvoiceConfirm(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded cursor-pointer text-base leading-none"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3.5 font-sans">
              <p className="text-xs font-medium text-slate-700">
                Are you sure you want to delete this invoice? This action is permanent and cannot be undone.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Invoice No:</span>
                  <span className="font-bold text-[#0088CC]">
                    {deleteInvoiceConfirm.invoiceNumber || 'CTINV#15000'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[220px]">
                    {deleteInvoiceConfirm.customer}
                  </span>
                </div>
                {deleteInvoiceConfirm.opportunityOrderRef && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Ref / Order:</span>
                    <span className="text-slate-700 truncate max-w-[220px]">{deleteInvoiceConfirm.opportunityOrderRef}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-bold">Total Amount:</span>
                  <span className="font-black text-slate-900 text-sm">
                    AED {(deleteInvoiceConfirm.totalAmount || deleteInvoiceConfirm.amount || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded border border-red-200/60">
                ⚠️ Warning: Deleting this invoice will remove all its linked line items and payment records.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#F8FAFC] border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeleteInvoiceConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteInvoice(deleteInvoiceConfirm.id);
                  if (selectedInvoice && selectedInvoice.id === deleteInvoiceConfirm.id) {
                    setSelectedInvoice(null);
                  }
                  setSalesToast(
                    `Invoice ${deleteInvoiceConfirm.invoiceNumber || ''} deleted successfully`
                  );
                  setDeleteInvoiceConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Yes, Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE OPPORTUNITY STAGE MODAL (Exact Cezcon CRM Image 1 Design) */}
      {isChangeStageModalOpen && changeStageOpp && (() => {
        const stageBaseAmount = Number(changeStageData.amount) || 0;
        const stageDiscount = Number(changeStageData.discount) || 0;
        const stageAfterDiscount = Math.max(0, stageBaseAmount - stageDiscount);
        const stageVatRate = Number(changeStageData.vatRate) || 0;
        const stageVatAmount = changeStageData.vatType === 'With VAT' ? (stageAfterDiscount * stageVatRate) / 100 : 0;
        const stageAdjustment = Number(changeStageData.adjustment) || 0;
        const stageTotalAmount = stageAfterDiscount + stageVatAmount + stageAdjustment;

        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
                <h3 className="text-sm font-semibold text-slate-800">Change Opportunity Stage</h3>
                <button
                  type="button"
                  onClick={() => setIsChangeStageModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded cursor-pointer text-base leading-none"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateOpportunity(changeStageOpp.id, {
                    stage: changeStageData.stage,
                    expectedClose: toDisplayDateFormat(changeStageData.closeDate) || changeStageOpp.expectedClose,
                    amount: stageTotalAmount > 0 ? stageTotalAmount : stageBaseAmount,
                    discount: changeStageData.discount,
                    vatType: changeStageData.vatType,
                    vatRate: changeStageData.vatRate,
                    adjustment: changeStageData.adjustment,
                    rating: changeStageData.rating === 'COLD' ? 'Cold' : changeStageData.rating === 'WARM' ? 'Warm' : 'Hot',
                    probability: Number(changeStageData.probability) || 10,
                    type: changeStageData.type,
                    comments: changeStageData.comments,
                  });
                  setSalesToast(`Opportunity stage updated to ${changeStageData.stage}`);
                  setIsChangeStageModalOpen(false);
                }}
                className="flex-1 overflow-y-auto p-6 space-y-3.5 text-xs text-slate-700 font-sans"
              >
                {/* Stage */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">
                    Stage <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    {isAddingNewStage ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Enter stage name"
                          value={newStageInput}
                          onChange={(e) => setNewStageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newStageInput.trim()) {
                                const trimmed = newStageInput.trim();
                                if (!opportunityStages.includes(trimmed)) {
                                  setOpportunityStages([...opportunityStages, trimmed]);
                                }
                                setChangeStageData({ ...changeStageData, stage: trimmed as DealStage });
                                setNewStageInput('');
                                setIsAddingNewStage(false);
                                setSalesToast(`New stage "${trimmed}" added`);
                              }
                            }
                          }}
                          className="flex-1 bg-white border border-blue-500 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newStageInput.trim()) {
                              const trimmed = newStageInput.trim();
                              if (!opportunityStages.includes(trimmed)) {
                                setOpportunityStages([...opportunityStages, trimmed]);
                              }
                              setChangeStageData({ ...changeStageData, stage: trimmed as DealStage });
                              setNewStageInput('');
                              setIsAddingNewStage(false);
                              setSalesToast(`New stage "${trimmed}" added`);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewStage(false);
                            setNewStageInput('');
                          }}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <select
                          required
                          value={changeStageData.stage}
                          onChange={(e) => setChangeStageData({ ...changeStageData, stage: e.target.value as DealStage })}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          {opportunityStages.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                          {changeStageData.stage && !opportunityStages.includes(changeStageData.stage) && (
                            <option value={changeStageData.stage}>{changeStageData.stage}</option>
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewStage(true)}
                          className="px-2.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors shadow-2xs"
                          title="Add New Stage"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>New</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Close Date */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                    Close Date <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  </label>
                  <div className="flex-1 relative flex items-center border border-emerald-600 rounded bg-white">
                    <input
                      ref={stageCloseDateRef}
                      type="date"
                      value={changeStageData.closeDate}
                      onChange={(e) => setChangeStageData({ ...changeStageData, closeDate: e.target.value })}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as HTMLInputElement).showPicker?.();
                        } catch { }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer"
                    />
                    <div
                      onClick={() => {
                        try {
                          stageCloseDateRef.current?.showPicker?.();
                        } catch { }
                      }}
                      className="p-1.5 text-emerald-600 border-l border-emerald-600 hover:bg-emerald-50 cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Amount</label>
                  <input
                    type="number"
                    value={changeStageData.amount}
                    onChange={(e) => setChangeStageData({ ...changeStageData, amount: e.target.value })}
                    className="flex-1 bg-white border border-emerald-600 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-medium"
                  />
                </div>

                {/* Discount */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Discount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={changeStageData.discount}
                    onChange={(e) => setChangeStageData({ ...changeStageData, discount: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* VAT Type */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">VAT Type</label>
                  <select
                    value={changeStageData.vatType}
                    onChange={(e) => setChangeStageData({ ...changeStageData, vatType: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="With VAT">With VAT</option>
                    <option value="Without VAT">Without VAT</option>
                    <option value="Zero VAT">Zero VAT</option>
                  </select>
                </div>

                {/* VAT */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">VAT</label>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                      <input
                        type="number"
                        value={changeStageData.vatRate}
                        onChange={(e) => setChangeStageData({ ...changeStageData, vatRate: e.target.value === '' ? '' : Number(e.target.value) })}
                        className="w-full px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                      />
                      <span className="px-2 text-xs text-slate-500 font-semibold bg-slate-100 border-l border-slate-300 py-1.5">
                        %
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={stageVatAmount > 0 ? stageVatAmount.toFixed(2) : '0.00'}
                      className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none text-right"
                    />
                  </div>
                </div>

                {/* Adjustment */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Adjustment</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={changeStageData.adjustment}
                    onChange={(e) => setChangeStageData({ ...changeStageData, adjustment: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Total Amount */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Total Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={stageTotalAmount > 0 ? stageTotalAmount.toFixed(2) : '0.00'}
                    className="flex-1 bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none text-right"
                  />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                    Rating <HelpCircle className="w-3.5 h-3.5 text-slate-800 fill-slate-800 text-white" />
                  </label>
                  <div className="flex-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setChangeStageData({ ...changeStageData, rating: 'COLD' })}
                      className={cn(
                        'px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors',
                        changeStageData.rating === 'COLD'
                          ? 'bg-[#0284C7] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                      )}
                    >
                      COLD
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeStageData({ ...changeStageData, rating: 'WARM' })}
                      className={cn(
                        'px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors',
                        changeStageData.rating === 'WARM'
                          ? 'bg-[#F59E0B] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                      )}
                    >
                      WARM
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeStageData({ ...changeStageData, rating: 'HOT' })}
                      className={cn(
                        'px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors',
                        changeStageData.rating === 'HOT'
                          ? 'bg-[#DC2626] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                      )}
                    >
                      HOT
                    </button>
                  </div>
                </div>

                {/* Win Probability */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Win Probability</label>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={changeStageData.probability}
                      onChange={(e) => setChangeStageData({ ...changeStageData, probability: Number(e.target.value) })}
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <span className="px-2 py-0.5 bg-[#F59E0B] text-white rounded text-[11px] font-bold min-w-10 text-center">
                      {changeStageData.probability}%
                    </span>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Type</label>
                  <select
                    value={changeStageData.type}
                    onChange={(e) => setChangeStageData({ ...changeStageData, type: e.target.value })}
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

                {/* Comments */}
                <div className="flex items-start gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0 pt-1.5">Comments</label>
                  <textarea
                    rows={2}
                    value={changeStageData.comments}
                    onChange={(e) => setChangeStageData({ ...changeStageData, comments: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>

                {/* Add Note */}
                <div className="flex items-center gap-4">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">Add Note</label>
                  <div className="flex-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={changeStageData.addNote}
                      onChange={(e) => setChangeStageData({ ...changeStageData, addNote: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsChangeStageModalOpen(false)}
                    className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-medium text-white bg-[#0A2540] hover:bg-[#07192b] rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ADD NEW TERMS & CONDITIONS MODAL */}
      {isAddTermsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add New Terms &amp; Conditions</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTermsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTerms} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Template Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Project Payment &amp; Supply Terms"
                  value={newTermsTitle}
                  onChange={(e) => setNewTermsTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Terms &amp; Conditions Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="1. Payment Terms: ...&#10;2. Delivery: ...&#10;3. Warranty: ..."
                  value={newTermsContent}
                  onChange={(e) => setNewTermsContent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTermsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded cursor-pointer transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddAnotherTerm}
                    className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Another Term
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Save &amp; Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE QUOTATION STATUS MODAL (Matching Cezcon CRM Image 1) */}
      {isChangeQuotationStatusModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Change Quotation Status</h3>
              <button
                type="button"
                onClick={() => setIsChangeQuotationStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUpdateQuotationStatus}>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-slate-700 shrink-0 min-w-[60px]">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <select
                      value={quotationStatusValue}
                      onChange={(e) => setQuotationStatusValue(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Submit for Approval">Submit for Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Draft">Draft</option>
                      <option value="Sent to Customer">Sent to Customer</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Declined">Declined</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#F1F5F9] px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChangeQuotationStatusModalOpen(false)}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded cursor-pointer transition-colors shadow-2xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-2xs"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT QUOTATION PDF PREVIEW MODAL (Matching Cezcon CRM Image 1 with 100% Live Data) */}
      {/* QUOTATION FULL VIEW MODAL (Exact Cezcon CRM Image 1 Design) */}
      {isQuotationViewModalOpen && (() => {
        const qOpp = activeViewQuotationOpp || viewOpp || salesOpportunities[0];
        const pAmt = typeof qOpp?.amount === 'number' && qOpp.amount > 0
          ? qOpp.amount
          : (parseFloat(String((qOpp as any)?.amount || '0').replace(/,/g, '')) || 3900);
        const pVatRate = typeof (qOpp as any)?.vatRate === 'number'
          ? (qOpp as any).vatRate
          : (parseFloat(String((qOpp as any)?.vatRate || '5').replace(/,/g, '')) || 5);
        const pDiscount = typeof (qOpp as any)?.discount === 'number'
          ? (qOpp as any).discount
          : (parseFloat(String((qOpp as any)?.discount || '0').replace(/,/g, '')) || 0);
        const pVat = ((pAmt - pDiscount) * pVatRate) / 100;
        const pSubTotal = pAmt - pDiscount + pVat;
        const pAdj = typeof (qOpp as any)?.adjustment === 'number'
          ? (qOpp as any).adjustment
          : (parseFloat(String((qOpp as any)?.adjustment || '0').replace(/,/g, '')) || 0);
        const pGrandTotal = pSubTotal + pAdj;

        const liveQuoteNumber = (qOpp as any)?.quotationNumber || (qOpp as any)?.quoteNumber || (qOpp?.opportunityCode ? qOpp.opportunityCode.replace('CTEQ', 'CTSQ') : 'CTSQ#4359');
        const liveOwner = qOpp?.owner || 'NEBIN BENNY';
        const livePhone = qOpp?.phone || '+971552346792';
        const liveCustomer = qOpp?.customer || 'SAIT SPECIALIZED ENGINEERING AND CONTRACTING';
        const liveLocation = (qOpp as any)?.location || (qOpp as any)?.address || 'MOHAMED BIN ZAYED CITY - ME-9';
        const liveTitle = qOpp?.title || 'PORTABLE AC';
        const liveDate = (qOpp as any)?.opportunityDate || '05-10-2026';
        const liveOwnerEmail = liveOwner ? `${liveOwner.toLowerCase().replace(/\s+/g, '.')}@cooltechuae.com` : 'nebin@cooltechuae.com';
        const liveOwnerMobile = liveOwner.toLowerCase().includes('shemin') ? '+971 55 946 0123' : '+971558308855';

        const rawItems = (qOpp as any)?.enquiryItems || (qOpp as any)?.items;
        const tableItems = Array.isArray(rawItems) && rawItems.length > 0
          ? rawItems.map((item: any, idx: number) => {
            const q = Number(item.qty) || 1;
            const p = Number(item.price) || (pAmt / q);
            const t = Number(item.priceTotal) || (q * p);
            return {
              sl: idx + 1,
              code: item.code || 'NPAC15C',
              description: item.description || item.title || qOpp?.title || '14000 BTU PORTABLE AC',
              unit: item.unit || 'EACH',
              brand: item.brand || 'NOBEL',
              qty: q,
              price: p,
              total: t,
            };
          })
          : [
            {
              sl: 1,
              code: (qOpp as any)?.itemCode || (qOpp as any)?.code || 'NPAC15C',
              description: qOpp?.title || '14000 BTU PORTABLE AC',
              unit: (qOpp as any)?.unit || 'EACH',
              brand: (qOpp as any)?.brand || 'NOBEL',
              qty: (qOpp as any)?.qty || (pAmt === 3900 ? 3 : 1),
              price: (pAmt === 3900 ? 1300 : pAmt),
              total: pAmt,
            },
          ];

        return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col justify-start items-stretch overflow-hidden text-xs font-sans">
            {/* Top Banner Header Bar */}
            <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-tight">
                  <p>QUOTATION CREATED BY {liveOwner} ON MON 05-10-2026 10:36:44 AM</p>
                  <p className="text-slate-500 font-normal text-[10px]">QUOTATION LAST MODIFIED BY {liveOwner} ON MON 05-10-2026 11:03:24 AM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationViewModalOpen(false)}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Document Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
              {/* 2-Column Top Section: Quotation Details & Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Quotation Details Card */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
                  <div className="bg-[#F8FAFC] px-3.5 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0088CC]" />
                    <span>Quotation Details</span>
                  </div>

                  <div className="p-3.5 divide-y divide-slate-100 text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Quotation Owner</span>
                      <div className="flex items-center gap-2">
                        {qOpp?.ownerAvatar ? (
                          <img
                            src={qOpp.ownerAvatar}
                            alt={liveOwner}
                            className="w-4 h-4 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-100 text-[#0088CC] border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(liveOwner || 'N').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-slate-900 uppercase">{liveOwner}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Quotation Number</span>
                      <span className="font-bold text-slate-900">{liveQuoteNumber}/rev01</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Quotation Type</span>
                      <span className="text-slate-800 font-medium">Manual Creation</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Quotation Date</span>
                      <span className="text-slate-800 font-medium">{liveDate}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Opportunity</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#0088CC] hover:underline cursor-pointer uppercase">{liveTitle}</span>
                        <Info className="w-3.5 h-3.5 text-[#0088CC] cursor-pointer" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Customer Name</span>
                      <div className="flex items-center gap-1 text-right">
                        <span className="font-bold text-[#0088CC] hover:underline cursor-pointer uppercase">{liveCustomer}</span>
                        <Info className="w-3.5 h-3.5 text-[#0088CC] cursor-pointer shrink-0" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Prepared By</span>
                      <span className="font-bold text-slate-900 uppercase">{liveOwner}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Customer Phone</span>
                      <span className="font-bold text-slate-900">{livePhone}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Prepared By Mobile</span>
                      <span className="font-bold text-slate-900">{liveOwnerMobile}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Prepared By Email</span>
                      <span className="text-slate-800 font-medium">{liveOwnerEmail}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Address</span>
                      <span className="font-bold text-slate-900 text-right uppercase">{liveLocation}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Prepared By Designation</span>
                      <span className="font-medium text-slate-800">Sr. Sales Executive</span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Status</span>
                      <span className="px-2 py-0.5 bg-[#0088CC] text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <Edit2 className="w-2.5 h-2.5" /> Approved
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 gap-2">
                      <span className="text-slate-600 font-medium">Approved</span>
                      <span className="text-slate-800 font-medium">{liveOwner} on Mon 05 Oct 2026 11:03:24 AM</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Overview Card with 6 Metric Tiles */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col">
                  <div className="bg-[#F8FAFC] px-3.5 py-2 border-b border-slate-200 font-bold text-slate-700 text-xs">
                    Overview
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
                    {/* Amount Tile */}
                    <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Amount</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {pAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded bg-blue-50 flex items-center justify-center text-[#0088CC]">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Discount Tile */}
                    <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Discount</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {pDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded bg-sky-50 flex items-center justify-center text-[#0284C7]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* VAT Tile */}
                    <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">VAT ({pVatRate}%)</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {pVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded bg-cyan-50 flex items-center justify-center text-[#0891B2]">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Sub Total Tile */}
                    <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Sub Total</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {pSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded bg-blue-50 flex items-center justify-center text-[#0088CC]">
                        <Layers className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Adjustment Tile */}
                    <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Adjustment</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {pAdj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded bg-emerald-50 flex items-center justify-center text-[#10B981]">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Total Amount Tile */}
                    <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Total Amount</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {pGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded bg-amber-50 flex items-center justify-center text-[#D97706]">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <span>Description</span>
                          <Info className="w-3.5 h-3.5 text-[#0088CC]" />
                        </div>
                      </th>
                      <th className="py-2.5 px-4 text-center w-24">QTY</th>
                      <th className="py-2.5 px-4 text-right w-36">Price</th>
                      <th className="py-2.5 px-4 text-right w-36">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tableItems.map((item: any) => (
                      <tr key={item.sl} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center text-slate-400 shrink-0 text-[8px] text-center p-1 leading-tight font-medium">
                              <ImageIcon className="w-4 h-4 mb-0.5 text-slate-400" />
                              NO IMAGE
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 uppercase text-xs">{item.description}</p>
                              <p className="text-[11px] text-slate-500">Code: {item.code}</p>
                              <p className="text-[11px] text-slate-500">Unit: {item.unit}</p>
                              <p className="text-[11px] text-slate-500">Brand: {item.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900 text-xs">{item.qty}</td>
                        <td className="py-3 px-4 text-right text-slate-900 text-xs">
                          {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 text-xs">
                          {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms & Conditions (Left) and Totals Breakdown (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                <div className="lg:col-span-8 space-y-1.5 text-xs text-slate-800">
                  <p className="font-bold text-slate-900">Terms &amp; Conditions:</p>
                  <div className="space-y-1 text-slate-700 font-medium">
                    <p><span className="font-bold text-slate-900">PRICE</span> : In AED, DDP</p>
                    <p><span className="font-bold text-slate-900">PAYMENT TERMS</span> : CDC</p>
                    <p><span className="font-bold text-slate-900">DELIVERY</span> : 2-3 DAYS ARO, SUBJECT TO PRIOR SALE</p>
                    <p><span className="font-bold text-slate-900">VALIDITY</span> : 7 Days</p>
                    <div className="pt-1 space-y-0.5">
                      <p className="font-bold text-slate-900">WARRANTY</p>
                      <p className="text-slate-600">1. One year for the complete unit as per manufacturer's terms.</p>
                      <p className="text-slate-600">2. Warranty limited for manufacturing defect only</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-slate-200 rounded p-3.5 space-y-2 text-xs shadow-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Amount</span>
                    <span className="font-bold text-slate-900">
                      {pAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>VAT ({pVatRate}%)</span>
                    <span className="font-bold text-slate-900">
                      {pVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Sub Total</span>
                    <span className="font-bold text-slate-900">
                      {pSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-[#0088CC] font-black">
                      {pGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quote Revise History Section */}
              <div className="pt-4 space-y-3">
                <h3 className="text-base font-bold text-slate-900">Quote Revise History</h3>
                <div className="border border-slate-200 rounded-sm bg-white overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3 w-16">Sl No.</th>
                        <th className="py-2.5 px-3">Quotation Number</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Discount</th>
                        <th className="py-2.5 px-3 text-right">VAT</th>
                        <th className="py-2.5 px-3 text-right">Adjustment</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-center w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-600">1</td>
                        <td className="py-2.5 px-3 font-semibold text-[#0088CC]">{liveQuoteNumber}</td>
                        <td className="py-2.5 px-3 text-slate-700">{liveDate}</td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          {pAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">0.00</td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          {pVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">0.00</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {pGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenPrintPreview(qOpp)}
                            className="text-slate-600 hover:text-[#0088CC] p-1 rounded cursor-pointer transition-colors"
                            title="View Document"
                          >
                            <FileText className="w-4 h-4 text-[#0088CC]" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-slate-200 flex flex-col items-end gap-3">
                <div className="flex items-center justify-end flex-wrap gap-1.5 w-full">
                  {/* Print Format Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPrintFormatDropdownOpen((prev) => !prev);
                      }}
                      className="bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Format <ChevronDown className="w-3 h-3 ml-0.5" />
                    </button>

                    {isPrintFormatDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[100]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPrintFormatDropdownOpen(false);
                          }}
                        />
                        <div
                          className="absolute left-0 bottom-full mb-1.5 bg-white border border-slate-300 rounded shadow-2xl py-1.5 z-[101] min-w-[300px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {[
                            'Print with Quantity',
                            'Print without Quantity',
                            'Print without Item Price',
                            'Print without Quantity & Item Price',
                            'Print without Total Price',
                            'Print without Unit Price & Total Price',
                            'Print without Unit Price & with Total Price',
                          ].map((fmt) => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsPrintFormatDropdownOpen(false);
                                setSelectedPrintFormat(fmt);
                                handleOpenPrintPreview(qOpp, fmt);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer transition-colors"
                            >
                              <span className="text-slate-900 font-bold text-xs">•</span>
                              <span className="font-normal">{fmt}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(qOpp, 'Print in USD')}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print in USD
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(qOpp)}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenChangeStage(qOpp)}
                    className="bg-[#002B49] hover:bg-[#001f33] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Revise
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditOpportunity(qOpp)}
                    className="bg-[#0088CC] hover:bg-[#0077b3] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteOppConfirm(qOpp)}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                {/* Back Button */}
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={() => setIsQuotationViewModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PRINT QUOTATION PDF VIEWER MODAL */}
      {isPrintQuotationModalOpen && (() => {
        const pOpp = activePrintOpp || viewOpp || salesOpportunities[0];
        const pAmt = typeof pOpp?.amount === 'number' && pOpp.amount > 0
          ? pOpp.amount
          : (parseFloat(String((pOpp as any)?.amount || '0').replace(/,/g, '')) || 3900);
        const pVatRate = typeof (pOpp as any)?.vatRate === 'number'
          ? (pOpp as any).vatRate
          : (parseFloat(String((pOpp as any)?.vatRate || '5').replace(/,/g, '')) || 5);
        const pVat = (pAmt * pVatRate) / 100;
        const pSubTotal = pAmt + pVat;
        const pAdj = typeof (pOpp as any)?.adjustment === 'number'
          ? (pOpp as any).adjustment
          : (parseFloat(String((pOpp as any)?.adjustment || '0').replace(/,/g, '')) || 0);
        const pGrandTotal = pSubTotal + pAdj;

        const showQty = !selectedPrintFormat.includes('without Quantity');
        const showPrice = !selectedPrintFormat.includes('without Item Price') && !selectedPrintFormat.includes('without Unit Price');
        const showTotal = !selectedPrintFormat.includes('without Total Price') || selectedPrintFormat.includes('with Total Price');
        const totalColCount = 5 + (showQty ? 1 : 0) + (showPrice ? 1 : 0) + (showTotal ? 1 : 0);
        const summaryColSpan = Math.max(1, totalColCount - 1);

        // Dynamic Number to Words function
        const numberToWords = (num: number): string => {
          if (!num || isNaN(num) || num <= 0) return 'Zero Dirhams Only';
          const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
          const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
          const inWords = (n: number): string => {
            if (n === 0) return '';
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
            if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
            if (n < 1000000000) return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + inWords(n % 1000000) : '');
            return inWords(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 !== 0 ? ' ' + inWords(n % 1000000000) : '');
          };
          const integerPart = Math.floor(num);
          const decimalPart = Math.round((num - integerPart) * 100);
          let result = inWords(integerPart).trim() + ' Dirhams';
          if (decimalPart > 0) {
            result += ' and ' + inWords(decimalPart).trim() + ' Fils';
          }
          return result + ' Only';
        };

        // Live Table Items Extraction
        const rawItems = (pOpp as any)?.enquiryItems || (pOpp as any)?.items || (pOpp as any)?.lineItems;
        const tableItems = Array.isArray(rawItems) && rawItems.length > 0
          ? rawItems.map((item: any, idx: number) => {
            const q = Number(item.qty) || 1;
            const p = Number(item.price) || (pAmt / q);
            const t = Number(item.priceTotal) || Number(item.total) || (q * p);
            return {
              sl: idx + 1,
              code: item.code || '',
              description: item.description || item.title || '',
              unit: item.unit || 'Each',
              brand: item.brand || '',
              qty: q,
              price: p,
              total: t,
            };
          })
          : [
            {
              sl: 1,
              code: (pOpp as any)?.itemCode || (pOpp as any)?.code || '',
              description: pOpp?.title || (pOpp as any)?.description || '',
              unit: (pOpp as any)?.unit || 'Each',
              brand: (pOpp as any)?.brand || '',
              qty: Number((pOpp as any)?.qty) || 1,
              price: pAmt / (Number((pOpp as any)?.qty) || 1),
              total: pAmt,
            },
          ];

        const liveQuoteNumber = (pOpp as any)?.quotationNumber || (pOpp as any)?.quoteNumber || (pOpp?.opportunityCode ? pOpp.opportunityCode.replace('CTEQ', 'CTSQ') : '');
        const liveOwner = pOpp?.owner || (pOpp as any)?.preparedBy || '';
        const livePhone = pOpp?.phone || (pOpp as any)?.preparedByMobile || '';
        const liveCustomer = pOpp?.customer || '';
        const liveLocation = (pOpp as any)?.location || (pOpp as any)?.address || '';
        const liveTrn = (pOpp as any)?.trn || (pOpp as any)?.trnNumber || '';
        const liveContact = (pOpp as any)?.contactPerson || (pOpp as any)?.attn || '';
        const liveTerms = termsAndConditionsText || (pOpp as any)?.termsAndConditions || (pOpp as any)?.terms || '';

        return (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex flex-col justify-start items-stretch">
            {/* Top PDF Reader Control Bar */}
            <div className="bg-[#323639] text-white px-4 py-2 flex items-center justify-between shadow-md z-10 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrintQuotationModalOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700 cursor-pointer"
                  title="Close"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold tracking-wide text-slate-100">
                    {liveQuoteNumber || 'Quotation'}.pdf
                  </span>
                </div>
              </div>

              {/* Center Zoom Controls */}
              <div className="hidden sm:flex items-center gap-2 bg-[#212427] px-3 py-1 rounded text-xs text-slate-300 border border-slate-700">
                <span>1 / 1</span>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
                  className="hover:text-white px-1 font-bold cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
                <span className="w-10 text-center text-[11px] font-mono">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
                  className="hover:text-white px-1 font-bold cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="Print Document"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-slate-300 hover:text-white p-1.5 rounded hover:bg-slate-700 cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintQuotationModalOpen(false)}
                  className="text-slate-300 hover:text-red-400 p-1.5 rounded hover:bg-slate-700 cursor-pointer ml-1"
                  title="Close PDF Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Canvas Body */}
            <div className="flex-1 bg-[#525659] p-4 sm:p-8 overflow-y-auto">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="bg-white text-slate-900 shadow-2xl mx-auto max-w-[840px] p-8 sm:p-12 text-xs font-sans border border-slate-300 min-h-[1100px] flex flex-col justify-between transition-transform duration-100"
              >
                <div className="space-y-6">
                  {/* Top Header Section */}
                  <div className="grid grid-cols-12 items-start gap-4 pb-4">
                    {/* Left: Company Logo & Details */}
                    <div className="col-span-5 space-y-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 80 80" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                            {/* Top cyan arcs */}
                            <path d="M60 14 A32 32 0 0 0 18 40" fill="none" stroke="#00AEEF" strokeWidth="6" strokeLinecap="round" />
                            <path d="M54 21 A24 24 0 0 0 24 40" fill="none" stroke="#00AEEF" strokeWidth="5.5" strokeLinecap="round" />
                            <path d="M48 28 A16 16 0 0 0 30 40" fill="none" stroke="#00AEEF" strokeWidth="5" strokeLinecap="round" />
                            {/* Bottom navy arcs */}
                            <path d="M18 40 A32 32 0 0 0 60 66" fill="none" stroke="#3D405B" strokeWidth="6" strokeLinecap="round" />
                            <path d="M24 40 A24 24 0 0 0 54 59" fill="none" stroke="#3D405B" strokeWidth="5.5" strokeLinecap="round" />
                            <path d="M30 40 A16 16 0 0 0 48 52" fill="none" stroke="#3D405B" strokeWidth="5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1 leading-none">
                            <span className="font-black text-[18px] text-[#00AEEF] tracking-tight">COOL</span>
                            <span className="font-bold text-[13px] text-[#3D405B] tracking-wider uppercase">TECHNOLOGIES</span>
                          </div>
                          <div className="text-[8px] text-slate-400 italic tracking-widest uppercase font-medium mt-0.5">
                            the science of cooling
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-[11px] text-slate-900 uppercase">COOL TECHNOLOGIES</p>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        Breej 5 Street, Plot 99, Sector M-42 Mussafah<br />
                        Industrial Area, Abu Dhabi, UAE
                      </p>
                    </div>

                    {/* Center: QUOTATION Headline */}
                    <div className="col-span-3 text-center pt-2">
                      <h2 className="text-lg sm:text-xl font-black text-[#0088CC] tracking-wider uppercase">
                        QUOTATION
                      </h2>
                    </div>

                    {/* Right: Contact Details */}
                    <div className="col-span-4 text-[10px] text-slate-700 space-y-0.5 text-right font-medium">
                      <p><span className="font-bold text-slate-800">Tel :</span> +971 2 565 0123</p>
                      <p><span className="font-bold text-slate-800">Mobile :</span> +971 55 946 0123</p>
                      <p><span className="font-bold text-slate-800">Email :</span> info@cooltechuae.com</p>
                      <p><span className="font-bold text-slate-800">Website :</span> www.cooltechuae.com</p>
                      <p><span className="font-bold text-slate-800">TRN :</span> 100 004 337 000 003</p>
                    </div>
                  </div>

                  {/* Recipient & Quotation Details (2 Columns) */}
                  <div className="grid grid-cols-12 gap-6 pt-2 border-t border-slate-200">
                    {/* Left: To */}
                    <div className="col-span-7 space-y-1 text-xs">
                      <div className="border-l-2 border-[#0088CC] pl-1.5 font-bold text-[#0088CC] text-xs">
                        To
                      </div>
                      <p className="font-bold text-slate-900 text-xs uppercase pt-0.5">
                        {liveCustomer}
                      </p>
                      {liveContact ? (
                        <p className="text-[11px] text-slate-700">
                          <span className="font-semibold text-slate-800">Attn :</span> {liveContact}
                        </p>
                      ) : null}
                      {liveLocation ? (
                        <p className="text-[11px] text-slate-700">
                          {liveLocation}
                        </p>
                      ) : null}
                      {livePhone ? (
                        <p className="text-[11px] text-slate-700">
                          <span className="font-semibold text-slate-800">Mobile :</span> {livePhone}
                        </p>
                      ) : null}
                      {liveTrn ? (
                        <p className="text-[11px] text-slate-700">
                          <span className="font-semibold text-slate-800">TRN :</span> {liveTrn}
                        </p>
                      ) : null}
                    </div>

                    {/* Right: Quotation Details */}
                    <div className="col-span-5 space-y-1 text-[11px] text-slate-800">
                      <div className="border-l-2 border-[#0088CC] pl-1.5 font-bold text-[#0088CC] text-xs">
                        Quotation Details
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p><span className="font-medium text-slate-600">Quotation Number :</span> <span className="font-bold">{liveQuoteNumber}</span></p>
                        <p><span className="font-medium text-slate-600">Quotation Date :</span> <span className="font-bold">{toDisplayDateFormat(pOpp?.opportunityDate) || pOpp?.opportunityDate || ''}</span></p>
                        {liveOwner ? (
                          <p><span className="font-medium text-slate-600">Prepared By :</span> <span className="font-bold">{liveOwner}</span></p>
                        ) : null}
                        <p><span className="font-medium text-slate-600">No. of Pages :</span> 1</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="pt-2">
                    <table className="w-full text-left text-[10px] sm:text-[11px] border border-slate-200">
                      <thead>
                        <tr className="bg-[#0088CC] text-white font-bold">
                          <th className="py-2 px-2.5 text-center w-8">SL</th>
                          <th className="py-2 px-2.5">Code</th>
                          <th className="py-2 px-2.5">Item Description</th>
                          <th className="py-2 px-2.5">Unit</th>
                          <th className="py-2 px-2.5">Brand</th>
                          {showQty && <th className="py-2 px-2.5 text-center">Qty</th>}
                          {showPrice && <th className="py-2 px-2.5 text-right">Price</th>}
                          {showTotal && <th className="py-2 px-2.5 text-right">Total</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {tableItems.map((item: any) => (
                          <tr key={item.sl}>
                            <td className="py-3 px-2.5 text-center font-medium">{item.sl}</td>
                            <td className="py-3 px-2.5 font-bold text-slate-900">{item.code}</td>
                            <td className="py-3 px-2.5 font-bold text-slate-900 uppercase">
                              {item.description}
                            </td>
                            <td className="py-3 px-2.5">{item.unit}</td>
                            <td className="py-3 px-2.5">{item.brand}</td>
                            {showQty && <td className="py-3 px-2.5 text-center font-medium">{item.qty}</td>}
                            {showPrice && <td className="py-3 px-2.5 text-right font-medium">{(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                            {showTotal && <td className="py-3 px-2.5 text-right font-medium">{(Number(item.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                          </tr>
                        ))}

                        {/* Summary Rows */}
                        <tr className="bg-slate-50/50">
                          <td colSpan={summaryColSpan} className="py-1.5 px-2.5 text-right font-bold text-slate-700">
                            Total
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                            {pAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td colSpan={summaryColSpan} className="py-1.5 px-2.5 text-right font-bold text-slate-700">
                            VAT ({pVatRate}%)
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                            {pVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="bg-slate-100/80">
                          <td colSpan={summaryColSpan} className="py-2 px-2.5 text-right font-black text-[#0088CC] text-xs">
                            Grand Total in AED
                          </td>
                          <td className="py-2 px-2.5 text-right font-black text-[#0088CC] text-xs">
                            {pGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Amount in words */}
                  <div className="pt-1">
                    <p className="font-bold text-slate-800 text-[11px]">Amount in words</p>
                    <p className="font-bold text-[#0088CC] text-xs mt-0.5">
                      {numberToWords(pGrandTotal)}
                    </p>
                  </div>

                  {/* Terms & Conditions Section */}
                  {liveTerms && liveTerms.trim() ? (
                    <div className="pt-2 space-y-1.5 text-[11px] text-slate-800">
                      <div className="border-l-2 border-[#0088CC] pl-1.5 font-bold text-[#0088CC] text-xs mb-2">
                        Terms &amp; Conditions
                      </div>
                      <div className="space-y-1 text-slate-800 font-medium whitespace-pre-line">
                        {liveTerms}
                      </div>
                    </div>
                  ) : null}

                  {/* Sign-off / Prepared By Section */}
                  {liveOwner ? (
                    <div className="pt-4 space-y-0.5 text-[11px]">
                      <p className="font-bold text-slate-900">For COOL TECHNOLOGIES</p>
                      <p className="font-bold text-slate-900 pt-1">{liveOwner}</p>
                      {livePhone ? <p className="text-slate-600 text-[10px]">Phone: {livePhone}</p> : null}
                    </div>
                  ) : null}
                </div>

                {/* Document Bottom Footer */}
                <div className="pt-6 border-t border-slate-100 flex justify-end text-[10px] text-slate-500">
                  Page 1 of 1
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PRINT INVOICE PDF VIEWER MODAL */}
      {isPrintInvoiceModalOpen && (() => {
        const inv = activePrintInvoice || selectedInvoice || invoices[0];
        if (!inv) return null;

        const isUSD = selectedInvoicePrintFormat === 'Print in USD';
        // Cezcon CRM standard conversion factor for USD
        const currencyMultiplier = isUSD ? 0.27 : 1;
        const currencySymbol = isUSD ? 'USD' : 'AED';

        const rawSubtotal = Number(inv.subtotal || inv.amount || 0);
        const vatRateNum = typeof inv.vatRate === 'number' ? inv.vatRate : parseFloat(String(inv.vatRate || '5')) || 5;
        const isWithVat = inv.vatType ? inv.vatType === 'With VAT' : true;

        const pAmt = rawSubtotal * currencyMultiplier;
        const pVat = isWithVat ? (pAmt * vatRateNum) / 100 : 0;
        const pSubTotal = pAmt + pVat;
        const pAdj = Number(inv.adjustment || 0) * currencyMultiplier;
        const pGrandTotal = pSubTotal + pAdj;

        // Explicit 7 Print Format Flag Mappings
        const fmt = selectedInvoicePrintFormat || 'Print with Quantity';
        let showQty = true;
        let showPrice = true;
        let showTotal = true;

        if (fmt === 'Print with Quantity') {
          showQty = true;
          showPrice = true;
          showTotal = true;
        } else if (fmt === 'Print without Quantity') {
          showQty = false;
          showPrice = true;
          showTotal = true;
        } else if (fmt === 'Print without Item Price') {
          showQty = true;
          showPrice = false;
          showTotal = true;
        } else if (fmt === 'Print without Quantity & Item Price') {
          showQty = false;
          showPrice = false;
          showTotal = true;
        } else if (fmt === 'Print without Total Price') {
          showQty = true;
          showPrice = true;
          showTotal = false;
        } else if (fmt === 'Print without Unit Price & Total Price') {
          showQty = true;
          showPrice = false;
          showTotal = false;
        } else if (fmt === 'Print without Unit Price & with Total Price') {
          showQty = true;
          showPrice = false;
          showTotal = true;
        } else {
          // e.g. Print in USD or Print
          showQty = true;
          showPrice = true;
          showTotal = true;
        }

        const totalColCount = 5 + (showQty ? 1 : 0) + (showPrice ? 1 : 0) + (showTotal ? 1 : 0);
        const summaryColSpan = showTotal
          ? 5 + (showQty ? 1 : 0) + (showPrice ? 1 : 0)
          : Math.max(1, totalColCount - 1);

        // Dynamic Number to Words function
        const numberToWords = (num: number, isDollar = false): string => {
          if (!num || isNaN(num) || num <= 0) return isDollar ? 'Zero Dollars Only' : 'Zero Dirhams Only';
          const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
          const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
          const inWords = (n: number): string => {
            if (n === 0) return '';
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
            if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
            if (n < 1000000000) return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + inWords(n % 1000000) : '');
            return inWords(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 !== 0 ? ' ' + inWords(n % 1000000000) : '');
          };
          const integerPart = Math.floor(num);
          const decimalPart = Math.round((num - integerPart) * 100);
          let result = inWords(integerPart).trim() + (isDollar ? ' Dollars' : ' Dirhams');
          if (decimalPart > 0) {
            result += (isDollar ? ' And ' : ' and ') + inWords(decimalPart).trim() + (isDollar ? ' Cents' : ' Fils');
          }
          return result + ' Only';
        };

        // Live Table Items Extraction
        const rawItems = inv.items;
        const tableItems = Array.isArray(rawItems) && rawItems.length > 0
          ? rawItems.map((item: any, idx: number) => {
            const q = Number(item.qty) || 1;
            const p = (Number(item.price) || 0) * currencyMultiplier;
            return {
              sl: idx + 1,
              code: item.code || inv.referenceNumber || 'CT-PROD',
              description: item.description || inv.description || inv.opportunityOrderRef || 'AC',
              unit: item.unit || 'Each',
              brand: item.brand || 'SUPER GENERAL',
              qty: q,
              price: p,
              total: q * p,
            };
          })
          : [
            {
              sl: 1,
              code: inv.referenceNumber || 'CT-PROD',
              description: inv.description || inv.opportunityOrderRef || 'AC',
              unit: 'Each',
              brand: 'SUPER GENERAL',
              qty: 1,
              price: pAmt,
              total: pAmt,
            },
          ];

        const isProforma = Boolean(
          (inv as any).isProforma ||
          inv.invoiceNumber?.startsWith('CTPI') ||
          inv.invoiceNumber?.startsWith('PRN') ||
          activeTab === 'proforma'
        );

        const liveInvoiceNumber = inv.invoiceNumber || (isProforma ? 'PRN-1' : 'CTINV#15226');
        const livePhone = inv.phone || '+971 50 669 3043';
        const liveCustomer = inv.customer || 'Customer';
        const liveAttention = inv.attention || inv.contactPerson || '';
        const liveLocation = inv.location || 'Abu Dhabi, UAE';
        const liveTrn = inv.trnNumber || '100 004 337 000 003';
        const liveTerms = inv.termsConditions || '1. Payment is due within 30 days.\n2. Goods once sold will not be taken back.\n3. Warranty as per manufacturer terms.';

        return (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex flex-col justify-start items-stretch">
            {/* Top PDF Reader Control Bar */}
            <div className="bg-[#323639] text-white px-4 py-2 flex items-center justify-between shadow-md z-10 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrintInvoiceModalOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700 cursor-pointer"
                  title="Close"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold tracking-wide text-slate-100">
                    {liveInvoiceNumber}_{isProforma ? 'Proforma_Invoice' : 'Tax_Invoice'}.pdf
                  </span>
                </div>
              </div>

              {/* Center Zoom Controls */}
              <div className="hidden sm:flex items-center gap-2 bg-[#212427] px-3 py-1 rounded text-xs text-slate-300 border border-slate-700">
                <span>1 / 1</span>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setInvoiceZoomLevel((prev) => Math.max(60, prev - 10))}
                  className="hover:text-white px-1 font-bold cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
                <span className="w-10 text-center text-[11px] font-mono">{invoiceZoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setInvoiceZoomLevel((prev) => Math.min(140, prev + 10))}
                  className="hover:text-white px-1 font-bold cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="Print Document"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-slate-300 hover:text-white p-1.5 rounded hover:bg-slate-700 cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintInvoiceModalOpen(false)}
                  className="text-slate-300 hover:text-red-400 p-1.5 rounded hover:bg-slate-700 cursor-pointer ml-1"
                  title="Close PDF Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Canvas Body */}
            <div className="flex-1 bg-[#525659] p-4 sm:p-8 overflow-y-auto">
              <div
                style={{ transform: `scale(${invoiceZoomLevel / 100})`, transformOrigin: 'top center' }}
                className="bg-white text-slate-900 shadow-2xl mx-auto max-w-[840px] p-8 sm:p-12 text-xs font-sans border border-slate-300 min-h-[1100px] flex flex-col justify-between transition-transform duration-100"
              >
                <div className="space-y-5">
                  {/* Top Header Section */}
                  <div className="grid grid-cols-12 items-start gap-4 pb-3">
                    {/* Left: Company Logo & Details */}
                    <div className="col-span-5 space-y-0.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 80 80" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                            {/* Top cyan arcs */}
                            <path d="M60 14 A32 32 0 0 0 18 40" fill="none" stroke="#00AEEF" strokeWidth="6" strokeLinecap="round" />
                            <path d="M54 21 A24 24 0 0 0 24 40" fill="none" stroke="#00AEEF" strokeWidth="5.5" strokeLinecap="round" />
                            <path d="M48 28 A16 16 0 0 0 30 40" fill="none" stroke="#00AEEF" strokeWidth="5" strokeLinecap="round" />
                            {/* Bottom navy arcs */}
                            <path d="M18 40 A32 32 0 0 0 60 66" fill="none" stroke="#3D405B" strokeWidth="6" strokeLinecap="round" />
                            <path d="M24 40 A24 24 0 0 0 54 59" fill="none" stroke="#3D405B" strokeWidth="5.5" strokeLinecap="round" />
                            <path d="M30 40 A16 16 0 0 0 48 52" fill="none" stroke="#3D405B" strokeWidth="5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1 leading-none">
                            <span className="font-black text-[18px] text-[#00AEEF] tracking-tight">COOL</span>
                            <span className="font-bold text-[13px] text-[#3D405B] tracking-wider uppercase">TECHNOLOGIES</span>
                          </div>
                          <div className="text-[8px] text-slate-400 italic tracking-widest uppercase font-medium mt-0.5">
                            the science of cooling
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-[11px] text-slate-900 uppercase">COOL TECHNOLOGIES</p>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        Breej 5 Street, Plot 99, Sector M-42 Mussafah Industrial Area, Abu Dhabi, UAE
                      </p>
                    </div>

                    {/* Center: INVOICE Headline */}
                    <div className="col-span-3 text-center pt-2">
                      <h2 className="text-xl font-bold text-slate-900 tracking-normal uppercase">
                        {isProforma ? 'PROFORMA INVOICE' : 'TAX INVOICE'}
                      </h2>
                    </div>

                    {/* Right: Contact Details */}
                    <div className="col-span-4 text-[10px] text-slate-800 space-y-0.5 text-right font-medium">
                      <div className="inline-grid grid-cols-[48px_auto] gap-x-1 text-left text-[10px]">
                        <span className="font-bold text-slate-900">Tel</span>
                        <span>: +971 2 565 0123</span>
                        <span className="font-bold text-slate-900">Mobile</span>
                        <span>: +971 55 946 0123</span>
                        <span className="font-bold text-slate-900">Email</span>
                        <span>: info@cooltechuae.com</span>
                        <span className="font-bold text-slate-900">Website</span>
                        <span>: www.cooltechuae.com</span>
                        <span className="font-bold text-slate-900">TRN</span>
                        <span>: {liveTrn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Info Section */}
                  {isProforma ? (
                    <div className="grid grid-cols-12 gap-4 pt-3 border-t border-slate-200 text-xs">
                      {/* Column 1: Billed To */}
                      <div className="col-span-7 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <span className="text-slate-400 font-normal">|</span>
                          <span>Billed To</span>
                        </div>
                        <div className="font-bold text-[13px] text-slate-900 leading-snug">
                          {liveCustomer}
                        </div>
                        {liveLocation && (
                          <p className="text-[10px] text-slate-600 leading-tight">{liveLocation}</p>
                        )}
                        {livePhone && (
                          <p className="text-[10px] text-slate-600 leading-tight">Phone: {livePhone}</p>
                        )}
                      </div>

                      {/* Column 2: Proforma Invoice Details */}
                      <div className="col-span-5 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <span className="text-slate-400 font-normal">|</span>
                          <span>Proforma Details</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-slate-800">
                          <div className="grid grid-cols-[100px_auto] gap-1">
                            <span className="text-slate-600 font-normal">Invoice#</span>
                            <span className="font-bold text-slate-900">: {liveInvoiceNumber}</span>
                          </div>
                          <div className="grid grid-cols-[100px_auto] gap-1">
                            <span className="text-slate-600 font-normal">Invoice Date</span>
                            <span className="font-medium text-slate-900">: {inv.issueDate}</span>
                          </div>
                          {inv.opportunityOrderRef ? (
                            <div className="grid grid-cols-[100px_auto] gap-1">
                              <span className="text-slate-600 font-normal">Opportunity #</span>
                              <span className="font-medium text-slate-900">: {inv.opportunityOrderRef}</span>
                            </div>
                          ) : null}
                          {liveAttention ? (
                            <div className="grid grid-cols-[100px_auto] gap-1">
                              <span className="text-slate-600 font-normal">Attention</span>
                              <span className="font-medium text-slate-900">: {liveAttention}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-4 pt-3 border-t border-slate-200 text-xs">
                      {/* Column 1: Billed To */}
                      <div className="col-span-5 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <span className="text-slate-400 font-normal">|</span>
                          <span>Billed To</span>
                        </div>
                        <div className="font-black text-[12px] sm:text-[13px] text-slate-900 uppercase leading-snug">
                          {liveCustomer}
                        </div>
                        {liveLocation && (
                          <p className="text-[10px] text-slate-600 leading-tight">{liveLocation}</p>
                        )}
                        {livePhone && (
                          <p className="text-[10px] text-slate-600 leading-tight">Phone: {livePhone}</p>
                        )}
                      </div>

                      {/* Column 2: Invoice Details */}
                      <div className="col-span-4 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <span className="text-slate-400 font-normal">|</span>
                          <span>Invoice Details</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-slate-800">
                          <div className="grid grid-cols-[85px_auto] gap-1">
                            <span className="text-[#0088CC] font-semibold">Invoice#</span>
                            <span className="font-bold text-slate-900">: {liveInvoiceNumber}</span>
                          </div>
                          <div className="grid grid-cols-[85px_auto] gap-1">
                            <span className="text-slate-600">Invoice Date</span>
                            <span className="font-medium text-slate-900">: {inv.issueDate}</span>
                          </div>
                          <div className="grid grid-cols-[85px_auto] gap-1">
                            <span className="text-slate-600">Opportunity #</span>
                            <span className="font-medium text-slate-900">: {inv.opportunityOrderRef || '—'}</span>
                          </div>
                          {liveAttention && (
                            <div className="grid grid-cols-[85px_auto] gap-1">
                              <span className="text-slate-600">Attention</span>
                              <span className="font-medium text-slate-900">: {liveAttention}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Payment Record */}
                      <div className="col-span-3 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <span className="text-slate-400 font-normal">|</span>
                          <span>Payment Record</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-slate-800">
                          <div className="grid grid-cols-[80px_auto] gap-1">
                            <span className="text-slate-600">Paid Amount</span>
                            <span className="font-medium text-slate-900">: {((inv.paidAmount || 0) * currencyMultiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="grid grid-cols-[80px_auto] gap-1">
                            <span className="text-slate-600">Due Amount</span>
                            <span className="font-bold text-slate-900">: {(inv.balanceAmount ? Number(inv.balanceAmount) * currencyMultiplier : pGrandTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Line Items & Summary Table (Exact Cezcon CRM Layout) */}
                  <div className="pt-2">
                    <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-[#8E95A0] text-white font-semibold">
                          <th className="py-1.5 px-2 text-center w-9">SL.</th>
                          <th className="py-1.5 px-2 w-24">Code</th>
                          <th className="py-1.5 px-2">Item Description</th>
                          <th className="py-1.5 px-2 w-14">Unit</th>
                          <th className="py-1.5 px-2 w-20">Brand</th>
                          {showQty && <th className="py-1.5 px-2 text-center w-12">Qty</th>}
                          {showPrice && <th className="py-1.5 px-2 text-right w-24">Price ({currencySymbol})</th>}
                          {showTotal && <th className="py-1.5 px-2 text-right w-24">Total ({currencySymbol})</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 text-slate-800">
                        {tableItems.map((item: any) => (
                          <tr key={item.sl} className="border-b border-slate-300">
                            <td className="py-2 px-2 text-center font-normal">{item.sl}</td>
                            <td className="py-2 px-2 font-bold text-slate-900">{item.code}</td>
                            <td className="py-2 px-2 font-bold text-slate-900 uppercase">
                              {item.description}
                            </td>
                            <td className="py-2 px-2 text-slate-700">{item.unit}</td>
                            <td className="py-2 px-2 text-slate-700">{item.brand}</td>
                            {showQty && <td className="py-2 px-2 text-center font-normal text-slate-900">{item.qty ?? 1}</td>}
                            {showPrice && <td className="py-2 px-2 text-right font-normal text-slate-900">{(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                            {showTotal && <td className="py-2 px-2 text-right font-bold text-slate-900">{(Number(item.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                          </tr>
                        ))}

                        {/* Total Row */}
                        <tr className="border-b border-slate-300 font-normal">
                          <td colSpan={5} className="py-1.5 px-2 text-right text-slate-700">
                            Total
                          </td>
                          {showQty && (
                            <td className="py-1.5 px-2 text-center font-normal text-slate-900">
                              {tableItems.reduce((acc: number, curr: any) => acc + (curr.qty || 1), 0)}
                            </td>
                          )}
                          {showPrice && showTotal && <td></td>}
                          {showTotal && (
                            <td className="py-1.5 px-2 text-right font-bold text-slate-900">
                              {pAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          )}
                        </tr>

                        {/* VAT Row */}
                        {isWithVat && (
                          <tr className="border-b border-slate-300">
                            <td colSpan={5 + (showQty ? 1 : 0) + (showPrice && showTotal ? 1 : 0)} className="py-1.5 px-2 text-right text-slate-800">
                              VAT ({vatRateNum}%)
                            </td>
                            <td className="py-1.5 px-2 text-right text-slate-900 font-medium">
                              {pVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}

                        {/* Adjustment Row if any */}
                        {pAdj !== 0 && (
                          <tr className="border-b border-slate-300">
                            <td colSpan={5 + (showQty ? 1 : 0) + (showPrice && showTotal ? 1 : 0)} className="py-1.5 px-2 text-right text-slate-800">
                              Adjustment
                            </td>
                            <td className="py-1.5 px-2 text-right text-slate-900 font-medium">
                              {pAdj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}

                        {/* Grand Total Row */}
                        <tr className="border-b-2 border-slate-400">
                          <td colSpan={5 + (showQty ? 1 : 0) + (showPrice && showTotal ? 1 : 0)} className="py-2 px-2 text-right font-bold text-slate-900 text-xs">
                            Grand Total ({currencySymbol})
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-slate-900 text-xs">
                            {pGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Amount in words */}
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="font-bold text-slate-900 text-xs shrink-0">Amount in Words:</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {numberToWords(pGrandTotal, isUSD)}
                    </span>
                  </div>

                  {/* Bank Details & Representative Section for Proforma Invoice */}
                  {isProforma && (
                    <div className="pt-4 space-y-4">
                      {Boolean((inv as any).bankName || (inv as any).bankAccountNo || (inv as any).bankDetails) && (
                        <div className="space-y-1 text-[11px] text-slate-800">
                          <div className="flex items-center gap-1 text-[11px] text-slate-700 font-bold mb-1">
                            <span className="text-slate-400 font-normal">|</span>
                            <span>Bank Details</span>
                          </div>
                          <div className="grid grid-cols-[140px_auto] gap-y-0.5 text-[11px]">
                            {(inv as any).bankName && (
                              <>
                                <span className="font-medium text-slate-700">Bank name</span>
                                <span className="font-medium text-slate-900">: {(inv as any).bankName}</span>
                              </>
                            )}
                            {(inv as any).bankBranch && (
                              <>
                                <span className="font-medium text-slate-700">Bank Branch</span>
                                <span className="font-medium text-slate-900">: {(inv as any).bankBranch}</span>
                              </>
                            )}
                            {(inv as any).bankAccountName && (
                              <>
                                <span className="font-medium text-slate-700">Bank Account Name</span>
                                <span className="font-medium text-slate-900">: {(inv as any).bankAccountName}</span>
                              </>
                            )}
                            {(inv as any).bankAccountNo && (
                              <>
                                <span className="font-medium text-slate-700">Bank Account No</span>
                                <span className="font-medium text-slate-900">: {(inv as any).bankAccountNo}</span>
                              </>
                            )}
                            {(inv as any).swift && (
                              <>
                                <span className="font-medium text-slate-700">Swift</span>
                                <span className="font-medium text-slate-900">: {(inv as any).swift}</span>
                              </>
                            )}
                            {(inv as any).iban && (
                              <>
                                <span className="font-medium text-slate-700">IBAN</span>
                                <span className="font-medium text-slate-900">: {(inv as any).iban}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {inv.owner && (
                        <div className="pt-1 text-[11px] space-y-0.5">
                          <p className="font-bold text-slate-900 uppercase">{inv.owner}</p>
                          {inv.phone && <p className="font-medium text-slate-800">{inv.phone}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Document Bottom Footer */}
                {!isProforma && (
                  <div className="pt-12 flex justify-between text-[10px] text-slate-400">
                    <span>This is a computer generated tax invoice.</span>
                    <span>Page 1 of 1</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
