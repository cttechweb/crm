'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Shield,
  User,
  Phone,
  Info,
  ChevronDown,
  Edit2,
  Settings,
  Eye,
  Printer,
  Edit3,
  ShoppingCart,
  Trash2,
  X,
  ArrowLeft,
  BookOpen,
  RotateCw,
  Contact,
  FileSpreadsheet,
  DollarSign,
  Handshake,
  Receipt,
  Calculator,
  ThumbsUp,
  Image as ImageIcon,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { filterQuotationsByScope, canConvertQuotation } from '@/services/crmDataScopeService';
import { CrmQuotation } from '@/types/enterprise-crm';
import { QuotationVoucherModal } from '@/components/sales/QuotationVoucherModal';
import { CezconDateInput } from '@/components/ui/CezconDateInput';
import { cn } from '@/lib/utils';

interface CezconQuotationModuleProps {
  initialCreate?: boolean;
}

export function CezconQuotationModule({ initialCreate = false }: CezconQuotationModuleProps) {
  const {
    quotations: crmQuotations,
    users,
    salesOpportunities,
    addQuotation,
    updateQuotation,
    updateOpportunity,
    convertQuotationToSalesOrder,
    deleteQuotation,
    customers,
  } = useEnterpriseCrm();

  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;

  // View state: Table list vs Full-Page Add/Edit View vs Full-Page Quotation Overview View vs Full-Page Add Proforma Invoice View vs Full-Page Revise Quotation View
  const [isCreating, setIsCreating] = useState(initialCreate);
  const [quoteToEdit, setQuoteToEdit] = useState<CrmQuotation | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<CrmQuotation | null>(null);
  const [proformaTargetQuote, setProformaTargetQuote] = useState<CrmQuotation | null>(null);
  const [reviseTargetQuote, setReviseTargetQuote] = useState<CrmQuotation | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<CrmQuotation | null>(null);
  const [quoteForVoucher, setQuoteForVoucher] = useState<CrmQuotation | null>(null);
  const [isPrintFormatDropdownOpen, setIsPrintFormatDropdownOpen] = useState(false);
  const [selectedPrintFormat, setSelectedPrintFormat] = useState('Print with Quantity');
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  // Revise Quotation Form Fields State
  const [revQuotePrefix, setRevQuotePrefix] = useState('');
  const [revQuoteSuffix, setRevQuoteSuffix] = useState('R1');
  const [revOpp, setRevOpp] = useState('');
  const [revDescription, setRevDescription] = useState('');
  const [revExpiryDate, setRevExpiryDate] = useState('');
  const [revCustomerPhone, setRevCustomerPhone] = useState('');
  const [revAddress, setRevAddress] = useState('');
  const [revMobile, setRevMobile] = useState('');
  const [revPreparedBy, setRevPreparedBy] = useState('');
  const [revPreparedByEmail, setRevPreparedByEmail] = useState('');
  const [revSubject, setRevSubject] = useState('');
  const [revPrintHeading, setRevPrintHeading] = useState('Quotation');

  const [revQuoteDate, setRevQuoteDate] = useState('');
  const [revQuoteType, setRevQuoteType] = useState('Manual Creation');
  const [revVatType, setRevVatType] = useState<'With VAT' | 'Without VAT' | 'Zero VAT'>('With VAT');
  const [revCustomerName, setRevCustomerName] = useState('');
  const [revCustomerEmail, setRevCustomerEmail] = useState('');
  const [revAttention, setRevAttention] = useState('');
  const [revReference, setRevReference] = useState('');
  const [revPreparedByMobile, setRevPreparedByMobile] = useState('');
  const [revPreparedByDesignation, setRevPreparedByDesignation] = useState('Sales Executive');
  const [revValidFor, setRevValidFor] = useState('');
  const [revHideTotalFromPrint, setRevHideTotalFromPrint] = useState(false);

  const [revItems, setRevItems] = useState<Array<{
    id: string;
    description: string;
    code: string;
    unit: string;
    brand: string;
    qty: number;
    price: number;
    total: number;
  }>>([]);
  const [revTerms, setRevTerms] = useState(`PAYMENT TERMS: 30 Days PDC\nPRICE: In AED, Ex-Works, Mussafah\nWARRANTY: 1. One year for the complete unit as per manufacturer's terms.\nFor COOL TECHNOLOGIES`);
  const [revDiscountPercent, setRevDiscountPercent] = useState<number | ''>(0);
  const [revDiscountAmount, setRevDiscountAmount] = useState<number | ''>(0);
  const [revVatRate, setRevVatRate] = useState<number>(5);
  const [revAdjustment, setRevAdjustment] = useState<number | ''>(0);
  const [revUpdateOppAmount, setRevUpdateOppAmount] = useState<boolean>(true);

  // Proforma Invoice Form Fields State
  const [profCustomer, setProfCustomer] = useState('');
  const [profOpp, setProfOpp] = useState('');
  const [profQuoteNum, setProfQuoteNum] = useState('');
  const [profInvoiceNum, setProfInvoiceNum] = useState('CTPI#1001');
  const [profInvoiceDate, setProfInvoiceDate] = useState('');
  const [profLpoDate, setProfLpoDate] = useState('');
  const [profLpoNumber, setProfLpoNumber] = useState('');
  const [profType, setProfType] = useState('File Upload');
  const [profVatType, setProfVatType] = useState<'With VAT' | 'Without VAT' | 'Zero VAT'>('With VAT');
  const [profAmount, setProfAmount] = useState<number | ''>('');
  const [profDiscount, setProfDiscount] = useState<number | ''>('');
  const [profVatRate, setProfVatRate] = useState<number>(5);
  const [profAdjustment, setProfAdjustment] = useState<number | ''>('');
  const [profFileName, setProfFileName] = useState('');
  const [profRemarks, setProfRemarks] = useState('');

  // Form Fields State (for Full-Page Add Quotation)
  const [formQuoteNumber, setFormQuoteNumber] = useState('');
  const [formOppId, setFormOppId] = useState('');
  const [formOppCode, setFormOppCode] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formVatRate, setFormVatRate] = useState<number>(5);
  const [formQuoteDate, setFormQuoteDate] = useState('');
  const [formQuoteType, setFormQuoteType] = useState('File Upload');
  const [formVatType, setFormVatType] = useState<'With VAT' | 'Without VAT' | 'Zero VAT'>('With VAT');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscount, setFormDiscount] = useState<number | ''>('');
  const [formAdjustment, setFormAdjustment] = useState<number | ''>('');
  const [formUpdateOppAmount, setFormUpdateOppAmount] = useState<boolean>(true);

  // List Filters State matching exact Cezcon CRM reference image
  const [filterOwner, setFilterOwner] = useState<string>('All');
  const [filterDateRange, setFilterDateRange] = useState<string>('07-09-2026 - 06-10-2026');
  const [filterQuoteTypeVal, setFilterQuoteTypeVal] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterBizOpp, setFilterBizOpp] = useState<string>('');
  const [filterCustomerVal, setFilterCustomerVal] = useState<string>('');
  const [filterOpportunityVal, setFilterOpportunityVal] = useState<string>('');
  const [filterProductService, setFilterProductService] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('All');

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const actionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setOpenActionDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-open quote overview when navigated to via URL (e.g. from "Open in new tab")
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('quoteId') || params.get('quotationId');
      if (qId && crmQuotations && crmQuotations.length > 0) {
        const found = crmQuotations.find((q) => q.id === qId || q.quotationNumber === qId);
        if (found) {
          setSelectedQuote(found);
        }
      }
    }
  }, [crmQuotations]);

  const handleCloseOverview = () => {
    setSelectedQuote(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('quoteId');
      url.searchParams.delete('quotationId');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Setup form when entering create or edit mode
  const initForm = (editTarget?: CrmQuotation | null) => {
    if (editTarget) {
      setFormQuoteNumber(editTarget.quotationNumber);
      setFormOppId(editTarget.opportunityId || '');
      setFormOppCode(editTarget.opportunityCode || '');
      setFormCustomer(editTarget.customer || '');
      setFormContactPerson(editTarget.contactPerson || '');
      setFormPhone(editTarget.phone || '');
      setFormQuoteDate(editTarget.quoteDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
      setFormDescription(editTarget.subject || '');
      setFormAmount(editTarget.subtotal || editTarget.totalAmount || '');
      setFormDiscount(editTarget.discountAmount || '');
      setFormVatRate(editTarget.vatRate || 5);
      setFormVatType(editTarget.vatAmount && editTarget.vatAmount > 0 ? 'With VAT' : 'With VAT');
      setFormAdjustment('');
      setFormFileName('');
      setFormQuoteType('File Upload');
      setFormUpdateOppAmount(true);
    } else {
      const randNum = Math.floor(4300 + Math.random() * 200);
      setFormQuoteNumber(`CTSQ#${randNum}`);
      const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      setFormQuoteDate(todayStr);
      setFormOppId('');
      setFormOppCode('');
      setFormCustomer('');
      setFormContactPerson('');
      setFormPhone('');
      setFormFileName('');
      setFormAmount('');
      setFormDiscount('');
      setFormAdjustment('');
      setFormVatRate(5);
      setFormVatType('With VAT');
      setFormDescription('');
      setFormQuoteType('File Upload');
      setFormUpdateOppAmount(true);
    }
  };

  const handleStartCreate = () => {
    setSelectedQuote(null);
    setQuoteToEdit(null);
    setProformaTargetQuote(null);
    setReviseTargetQuote(null);
    initForm(null);
    setIsCreating(true);
  };

  const handleStartEdit = (q: CrmQuotation) => {
    setSelectedQuote(null);
    setIsCreating(false);
    setProformaTargetQuote(null);
    setReviseTargetQuote(null);
    setQuoteToEdit(q);

    const matchedOpp = salesOpportunities?.find(
      (o) => o.id === q.opportunityId || o.opportunityCode === q.opportunityCode
    );
    const matchedCust = customers?.find(
      (c) => (c.companyName && c.companyName.toLowerCase() === (q.customer || '').toLowerCase()) ||
        (c.customerName && c.customerName.toLowerCase() === (q.customer || '').toLowerCase())
    );

    setRevQuotePrefix(q.quotationNumber || 'CTSQ#4364');
    setRevQuoteSuffix('');
    setRevOpp(
      matchedOpp
        ? `${matchedOpp.opportunityCode} - ${matchedOpp.title}`
        : q.subject
          ? `CTEQ#7137 - ${q.subject}`
          : 'CTEQ#7137 - APPLIANCES'
    );
    setRevDescription(q.subject || '');
    setRevExpiryDate(q.validUntil || '');
    setRevCustomerPhone(q.phone || matchedCust?.phone || '+97126727322');
    setRevAddress((matchedCust as any)?.address || 'OFFICE 1401 FLOOR 14 TAMOUH TOWER, AL REEM ISLAND');
    setRevMobile(q.phone || '+971564243920');
    setRevPreparedBy(q.owner || currentUser?.name || 'JISMON JOSE');
    setRevPreparedByEmail('jismon@cooltechuae.com');
    setRevSubject(q.subject || '');
    setRevPrintHeading('Quotation');

    setRevQuoteDate(q.quoteDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setRevQuoteType('Manual Creation');
    setRevVatType('With VAT');
    setRevCustomerName(q.customer || 'SIX SIGMA MIDDLE EAST CONSTRUCTIONS L.L.C');
    setRevCustomerEmail(matchedCust?.email || 'sonia.s@6sigma-mc.com');
    setRevAttention(q.contactPerson || 'Mr. PRASHOBH');
    setRevReference('');
    setRevPreparedByMobile('+971585262058');
    setRevPreparedByDesignation('Sales Executive');
    setRevValidFor('');
    setRevHideTotalFromPrint(false);

    if (q.items && q.items.length > 0) {
      setRevItems(
        q.items.map((it, idx) => ({
          id: it.id || `edit-item-${idx}-${Date.now()}`,
          description: it.productName || it.description || '',
          code: (it as any).code || 'SGR175HE',
          unit: (it as any).unit || 'EACH',
          brand: (it as any).brand || 'SUPER GENERAL',
          qty: it.quantity || 1,
          price: it.unitPrice || 0,
          total: it.totalAmount || (it.quantity * it.unitPrice) || 0,
        }))
      );
    } else {
      setRevItems([
        {
          id: 'edit-item-1',
          description: 'SUPER GENERAL REFRIGERATOR WHITE 175 LTR GROSS',
          code: 'SGR175HE',
          unit: 'EACH',
          brand: 'SUPER GENERAL',
          qty: 2,
          price: 650,
          total: 1300,
        },
        {
          id: 'edit-item-2',
          description: 'Water Dispenser 3 Tap Nobel NWD1602I',
          code: 'NWD1602I',
          unit: 'EACH',
          brand: 'NOBEL',
          qty: 3,
          price: 280,
          total: 840,
        },
        {
          id: 'edit-item-3',
          description: '20 Ltr Microwave oven Nobel',
          code: 'NMO22M',
          unit: 'EACH',
          brand: 'NOBEL',
          qty: 2,
          price: 225,
          total: 450,
        },
      ]);
    }

    setRevDiscountPercent(0);
    setRevDiscountAmount(q.discountAmount || 0);
    setRevVatRate(q.vatRate || 5);
    setRevAdjustment(0);
    setRevUpdateOppAmount(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setQuoteToEdit(null);
  };

  // Opportunity selection handler
  const handleOpportunitySelect = (oppVal: string) => {
    setFormOppCode(oppVal);
    const found = salesOpportunities?.find(
      (o) => o.opportunityCode === oppVal || o.id === oppVal || o.title === oppVal
    );
    if (found) {
      setFormOppId(found.id);
      if (found.title) setFormDescription(found.title);
      if (found.customer) setFormCustomer(found.customer);
      if (found.contactPerson) setFormContactPerson(found.contactPerson);
      if (found.phone) setFormPhone(found.phone);
      if (found.amount && !formAmount) setFormAmount(found.amount);
    }
  };

  // Calculation helpers
  const numAmount = Number(formAmount) || 0;
  const numDiscount = Number(formDiscount) || 0;
  const numAdjustment = Number(formAdjustment) || 0;
  const subtotalAfterDiscount = Math.max(0, numAmount - numDiscount);

  const calculatedVat =
    formVatType === 'With VAT' ? Math.round(subtotalAfterDiscount * (formVatRate / 100) * 100) / 100 : 0;

  const grandTotal = subtotalAfterDiscount + calculatedVat + numAdjustment;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormFileName(e.target.files[0].name);
    }
  };

  // Save Quotation
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuoteNumber) return;

    const finalQuote: CrmQuotation = {
      id: quoteToEdit?.id || `qtn-${Date.now()}`,
      slNo: quoteToEdit?.slNo || (crmQuotations?.length || 0) + 1,
      quotationNumber: formQuoteNumber,
      opportunityId: formOppId || undefined,
      opportunityCode: formOppCode || undefined,
      customer: formCustomer || 'Direct Customer',
      contactPerson: formContactPerson || undefined,
      phone: formPhone || undefined,
      subject: formDescription || 'Commercial Proposal',
      quoteDate: formQuoteDate,
      validUntil: formQuoteDate,
      subtotal: numAmount,
      discountAmount: numDiscount,
      vatRate: formVatRate,
      vatAmount: calculatedVat,
      totalAmount: grandTotal,
      status: quoteToEdit?.status || 'Approved',
      owner: quoteToEdit?.owner || currentUser?.name || 'shaheer',
      itemsCount: 1,
      items: [
        {
          id: `item-${Date.now()}`,
          productName: formDescription || 'Commercial Supply & Installation',
          description: formDescription || 'Commercial Proposal',
          quantity: 1,
          unitPrice: numAmount,
          discount: numDiscount,
          taxRate: formVatRate,
          taxAmount: calculatedVat,
          totalAmount: grandTotal,
        },
      ],
    };

    if (quoteToEdit) {
      updateQuotation(finalQuote.id, finalQuote);
    } else {
      addQuotation(finalQuote);
    }

    if (formUpdateOppAmount && formOppId) {
      updateOpportunity(formOppId, {
        amount: grandTotal,
      });
    }

    setIsCreating(false);
    setQuoteToEdit(null);
  };

  // Open Add Proforma Invoice form
  const handleOpenProforma = (q: CrmQuotation) => {
    setProformaTargetQuote(q);
    setSelectedQuote(null);
    setIsCreating(false);

    const matchedOpp = salesOpportunities?.find(
      (o) => o.id === q.opportunityId || o.opportunityCode === q.opportunityCode
    );

    const amountVal = q.subtotal || q.totalAmount || 25440;
    setProfCustomer(q.customer || 'ADC ENERGY SYSTEMS LLC');
    setProfOpp(
      q.opportunityCode
        ? `${q.opportunityCode} | ${q.subject || 'WINDOW AC UNITS'} [Sale Rate: ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]`
        : matchedOpp
          ? `${matchedOpp.opportunityCode} | ${matchedOpp.title} [Sale Rate: ${(matchedOpp.amount || amountVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]`
          : `CTEQ#7136 | ${q.subject || 'WINDOW AC UNITS'} [Sale Rate: ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]`
    );
    setProfQuoteNum(q.quotationNumber || 'CTSQ#4363');
    setProfInvoiceNum(`CTPI#${Math.floor(1000 + Math.random() * 900)}`);
    setProfInvoiceDate(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setProfLpoDate('');
    setProfLpoNumber('');
    setProfType('File Upload');
    setProfVatType('With VAT');
    setProfAmount(amountVal);
    setProfDiscount(q.discountAmount || '');
    setProfVatRate(q.vatRate || 5);
    setProfAdjustment('');
    setProfFileName('');
    setProfRemarks('');
  };

  // Proforma Calculations
  const profNumAmount = Number(profAmount) || 0;
  const profNumDiscount = Number(profDiscount) || 0;
  const profNumAdjustment = Number(profAdjustment) || 0;
  const profSubtotalAfterDiscount = Math.max(0, profNumAmount - profNumDiscount);
  const profCalculatedVat =
    profVatType === 'With VAT' ? Math.round(profSubtotalAfterDiscount * (profVatRate / 100) * 100) / 100 : 0;
  const profGrandTotal = profSubtotalAfterDiscount + profCalculatedVat + profNumAdjustment;

  const handleSubmitProforma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proformaTargetQuote) return;

    convertQuotationToSalesOrder(proformaTargetQuote.id);
    updateQuotation(proformaTargetQuote.id, {
      ...proformaTargetQuote,
      status: 'Approved',
    });

    setProformaTargetQuote(null);
  };

  // Open Revise Quotation Form
  const handleOpenRevise = (q: CrmQuotation) => {
    setReviseTargetQuote(q);
    setSelectedQuote(null);
    setIsCreating(false);
    setProformaTargetQuote(null);

    const prefix = q.quotationNumber.includes('/')
      ? q.quotationNumber.substring(0, q.quotationNumber.lastIndexOf('/') + 1)
      : `${q.quotationNumber}/`;
    setRevQuotePrefix(prefix);
    setRevQuoteSuffix('R1');

    const matchedOpp = salesOpportunities?.find(
      (o) => o.id === q.opportunityId || o.opportunityCode === q.opportunityCode
    );
    const matchedCust = customers?.find(
      (c) => (c.companyName && c.companyName.toLowerCase() === (q.customer || '').toLowerCase()) ||
        (c.customerName && c.customerName.toLowerCase() === (q.customer || '').toLowerCase())
    );

    setRevOpp(matchedOpp?.title || q.subject || 'APPLIANCES');
    setRevDescription(q.subject || '');
    setRevExpiryDate(q.validUntil || '');
    setRevCustomerPhone(q.phone || matchedCust?.phone || '+97126727322');
    setRevAddress((matchedCust as any)?.address || 'OFFICE 1401 FLOOR 14 TAMOUH TOWER, AL REEM ISLAND');
    setRevMobile(q.phone || '+971564243920');
    setRevPreparedBy(q.owner || currentUser?.name || 'JISMON JOSE');
    setRevPreparedByEmail('jismon@cooltechuae.com');
    setRevSubject(q.subject || '');
    setRevPrintHeading('Quotation');

    setRevQuoteDate(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    setRevQuoteType('Manual Creation');
    setRevVatType('With VAT');
    setRevCustomerName(q.customer || 'SIX SIGMA MIDDLE EAST CONSTRUCTIONS L.L.C');
    setRevCustomerEmail(matchedCust?.email || 'sonia.s@6sigma-mc.com');
    setRevAttention(q.contactPerson || 'Mr. PRASHOBH');
    setRevReference('');
    setRevPreparedByMobile('+971585262058');
    setRevPreparedByDesignation('Sales Executive');
    setRevValidFor('');
    setRevHideTotalFromPrint(false);

    if (q.items && q.items.length > 0) {
      setRevItems(
        q.items.map((it, idx) => ({
          id: it.id || `rev-item-${idx}-${Date.now()}`,
          description: it.productName || it.description || '',
          code: (it as any).code || 'SGR175HE',
          unit: (it as any).unit || 'EACH',
          brand: (it as any).brand || 'SUPER GENERAL',
          qty: it.quantity || 1,
          price: it.unitPrice || 0,
          total: it.totalAmount || (it.quantity * it.unitPrice) || 0,
        }))
      );
    } else {
      setRevItems([
        {
          id: 'rev-item-1',
          description: 'SUPER GENERAL REFRIGERATOR WHITE 175 LTR GROSS',
          code: 'SGR175HE',
          unit: 'EACH',
          brand: 'SUPER GENERAL',
          qty: 2,
          price: 650,
          total: 1300,
        },
        {
          id: 'rev-item-2',
          description: 'Water Dispenser 3 Tap Nobel NWD1602I',
          code: 'NWD1602I',
          unit: 'EACH',
          brand: 'NOBEL',
          qty: 3,
          price: 280,
          total: 840,
        },
        {
          id: 'rev-item-3',
          description: '20 Ltr Microwave oven Nobel',
          code: 'NMO22M',
          unit: 'EACH',
          brand: 'NOBEL',
          qty: 2,
          price: 225,
          total: 450,
        },
      ]);
    }

    setRevDiscountPercent(0);
    setRevDiscountAmount(q.discountAmount || 0);
    setRevVatRate(q.vatRate || 5);
    setRevAdjustment(0);
    setRevUpdateOppAmount(true);
  };

  // Revise Items Handlers
  const handleUpdateRevItem = (id: string, field: string, value: any) => {
    setRevItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'price') {
          const qVal = field === 'qty' ? Number(value) || 0 : item.qty;
          const pVal = field === 'price' ? Number(value) || 0 : item.price;
          updated.total = qVal * pVal;
        }
        return updated;
      })
    );
  };

  const handleAddRevItem = () => {
    setRevItems((prev) => [
      ...prev,
      {
        id: `rev-item-${Date.now()}`,
        description: '',
        code: '',
        unit: 'EACH',
        brand: '',
        qty: 1,
        price: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveRevItem = (id: string) => {
    setRevItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Revise Calculations
  const revSumAmount = revItems.reduce(
    (acc, it) => acc + (Number(it.total) || (Number(it.qty) * Number(it.price)) || 0),
    0
  );
  const numRevDiscount = Number(revDiscountAmount) || 0;
  const revAmountAfterDiscount = Math.max(0, revSumAmount - numRevDiscount);
  const revCalculatedVat =
    revVatType === 'With VAT'
      ? Math.round(revAmountAfterDiscount * (revVatRate / 100) * 100) / 100
      : 0;
  const revSubTotal = revAmountAfterDiscount + revCalculatedVat;
  const numRevAdjustment = Number(revAdjustment) || 0;
  const revTotalAmount = revSubTotal + numRevAdjustment;

  const handleSubmitRevise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviseTargetQuote) return;

    const revisedNumber = `${revQuotePrefix}${revQuoteSuffix || 'R1'}`;
    const revisedQuote: CrmQuotation = {
      ...reviseTargetQuote,
      id: `qtn-rev-${Date.now()}`,
      slNo: (crmQuotations?.length || 0) + 1,
      quotationNumber: revisedNumber,
      customer: revCustomerName || reviseTargetQuote.customer,
      contactPerson: revAttention || reviseTargetQuote.contactPerson,
      phone: revMobile || reviseTargetQuote.phone,
      subject: revSubject || revOpp || reviseTargetQuote.subject,
      quoteDate: revQuoteDate,
      validUntil: revExpiryDate || revQuoteDate,
      subtotal: revSumAmount,
      discountAmount: numRevDiscount,
      vatRate: revVatRate,
      vatAmount: revCalculatedVat,
      totalAmount: revTotalAmount,
      status: 'Approved',
      owner: revPreparedBy || reviseTargetQuote.owner,
      itemsCount: revItems.length,
      items: revItems.map((it) => ({
        id: it.id,
        productName: it.description,
        description: `Code: ${it.code} | Unit: ${it.unit} | Brand: ${it.brand}`,
        quantity: it.qty,
        unitPrice: it.price,
        discount: 0,
        taxRate: revVatRate,
        taxAmount: it.total * (revVatRate / 100),
        totalAmount: it.total,
      })),
    };

    addQuotation(revisedQuote);

    if (revUpdateOppAmount && reviseTargetQuote.opportunityId) {
      updateOpportunity(reviseTargetQuote.opportunityId, {
        amount: revTotalAmount,
      });
    }

    setReviseTargetQuote(null);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteToEdit) return;

    const updatedQuote: CrmQuotation = {
      ...quoteToEdit,
      quotationNumber: revQuotePrefix || quoteToEdit.quotationNumber,
      customer: revCustomerName || quoteToEdit.customer,
      contactPerson: revAttention || quoteToEdit.contactPerson,
      phone: revMobile || quoteToEdit.phone,
      subject: revSubject || revOpp || quoteToEdit.subject,
      quoteDate: revQuoteDate,
      validUntil: revExpiryDate || revQuoteDate,
      subtotal: revSumAmount,
      discountAmount: numRevDiscount,
      vatRate: revVatRate,
      vatAmount: revCalculatedVat,
      totalAmount: revTotalAmount,
      status: quoteToEdit.status || 'Approved',
      owner: revPreparedBy || quoteToEdit.owner,
      itemsCount: revItems.length,
      items: revItems.map((it) => ({
        id: it.id,
        productName: it.description,
        description: `Code: ${it.code} | Unit: ${it.unit} | Brand: ${it.brand}`,
        quantity: it.qty,
        unitPrice: it.price,
        discount: 0,
        taxRate: revVatRate,
        taxAmount: it.total * (revVatRate / 100),
        totalAmount: it.total,
      })),
    };

    updateQuotation(quoteToEdit.id, updatedQuote);

    if (revUpdateOppAmount && quoteToEdit.opportunityId) {
      updateOpportunity(quoteToEdit.opportunityId, {
        amount: revTotalAmount,
      });
    }

    setQuoteToEdit(null);
  };

  // 🛡️ Strict Role-Based Visibility
  const scopedQuotations = useMemo(() => {
    return filterQuotationsByScope(crmQuotations || [], currentUser, users);
  }, [crmQuotations, currentUser, users]);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return scopedQuotations.filter((q) => {
      if (filterStatus !== 'All' && q.status !== filterStatus) return false;
      if (filterOwner !== 'All' && q.owner !== filterOwner) return false;
      if (filterCustomerVal && !q.customer.toLowerCase().includes(filterCustomerVal.toLowerCase())) return false;
      if (filterBizOpp && !(q.subject || '').toLowerCase().includes(filterBizOpp.toLowerCase())) return false;
      if (filterOpportunityVal && !(q.subject || '').toLowerCase().includes(filterOpportunityVal.toLowerCase())) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          q.quotationNumber.toLowerCase().includes(query) ||
          q.customer.toLowerCase().includes(query) ||
          (q.subject || '').toLowerCase().includes(query) ||
          (q.opportunityCode || '').toLowerCase().includes(query) ||
          (q.contactPerson || '').toLowerCase().includes(query) ||
          (q.phone || '').includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [scopedQuotations, filterStatus, filterOwner, filterCustomerVal, filterBizOpp, filterOpportunityVal, searchQuery]);

  const totalPages = Math.ceil(filteredQuotations.length / rowsPerPage) || 1;
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStageBadge = (quote: CrmQuotation) => {
    const matchedOpp = salesOpportunities?.find(
      (o) =>
        (quote.opportunityId && o.id === quote.opportunityId) ||
        (quote.opportunityCode && o.opportunityCode === quote.opportunityCode) ||
        (o.title && quote.subject && o.title.toLowerCase() === quote.subject.toLowerCase())
    );
    const oppStage = matchedOpp?.stage || (quote as any).stage || (quote as any).opportunityStage;
    if (oppStage) {
      if (oppStage === 'Enquiry' || oppStage === 'Opportunity' || oppStage === 'Lead' || oppStage === 'New') {
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#b8860b]">
            Enquiry
          </span>
        );
      }
      if (oppStage === 'Offer Sent' || oppStage === 'Quotation' || oppStage === 'Proposal Sent') {
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#337ab7]">
            Offer Sent
          </span>
        );
      }
      if (oppStage === 'Offer Confirmed' || oppStage === 'Accepted' || oppStage === 'Won' || oppStage === 'Approved' || oppStage === 'Confirmed') {
        return (
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#16A34A]">
            Offer Confirmed
          </span>
        );
      }
      return (
        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#b8860b]">
          {oppStage}
        </span>
      );
    }

    const subj = (quote.subject || '').toUpperCase();
    if (subj.includes('SPLIT') || subj.includes('OFFER SENT')) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#337ab7]">
          Offer Sent
        </span>
      );
    }
    if (subj.includes('CONFIRMED') || subj.includes('WON')) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#16A34A]">
          Offer Confirmed
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#b8860b]">
        Enquiry
      </span>
    );
  };

  const getStatusBadge = (status: CrmQuotation['status']) => {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-[11px] font-bold bg-[#5bc0de] text-white shadow-2xs whitespace-nowrap">
        <Edit2 className="w-2.5 h-2.5 text-white" />
        <span>{status || 'Approved'}</span>
      </span>
    );
  };

  const handleConvertToOrder = (quote: CrmQuotation) => {
    if (!canConvertQuotation(currentUser)) {
      alert('You do not have permission to convert quotations to Sales Orders.');
      return;
    }
    if (quote.status !== 'Approved' && quote.status !== 'Accepted') {
      alert('Quotation must be Approved or Accepted before converting to Sales Order.');
      return;
    }
    if (confirm(`Convert quotation ${quote.quotationNumber} for ${quote.customer} into an official Sales Order?`)) {
      const newOrder = convertQuotationToSalesOrder(quote.id);
      if (newOrder) {
        alert(`Successfully converted quotation to Sales Order: ${newOrder.orderNumber}`);
      }
    }
  };

  const handleDelete = (quote: CrmQuotation) => {
    setQuoteToDelete(quote);
  };

  return (
    <div className="w-full font-sans text-xs space-y-4">
      {/* ========================================================================= */}
      {/* VIEW: FULL PAGE EDIT QUOTATION (EXACT CEZCON CRM REFERENCE)               */}
      {/* ========================================================================= */}
      {quoteToEdit ? (
        <div className="bg-white rounded-[3px] shadow-xs border border-[#d2d6de] overflow-hidden mb-6">
          {/* Header Bar */}
          <div className="bg-[#f4f4f4] border-b border-[#e5e7eb] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#333333] text-xs font-semibold">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Edit Quotation</span>
            </div>
            <button
              type="button"
              onClick={() => setQuoteToEdit(null)}
              className="w-5 h-5 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-[2px] flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitEdit} className="p-6 sm:p-8 space-y-6">
            {/* Top 2 Columns Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-xs">
              {/* LEFT COLUMN */}
              <div className="space-y-3.5">
                {/* Quotation Number ✔ */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal flex items-center gap-1">
                    <span className="text-[#3c763d] font-normal">Quotation Number</span>
                    <span className="text-[#3c763d] font-bold text-xs">✔</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revQuotePrefix}
                      onChange={(e) => setRevQuotePrefix(e.target.value)}
                      className="w-full bg-white border border-[#3c763d] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#2b542c]"
                    />
                  </div>
                </div>

                {/* Opportunity */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Opportunity
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      readOnly
                      value={revOpp}
                      className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quotation Expiry */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Expiry
                  </label>
                  <div className="flex-1">
                    <CezconDateInput
                      placeholder="DD-MM-YYYY"
                      value={revExpiryDate}
                      onChange={(val) => setRevExpiryDate(val)}
                    />
                  </div>
                </div>

                {/* VAT Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    VAT Type
                  </label>
                  <div className="flex-1">
                    <select
                      value={revVatType}
                      onChange={(e) => setRevVatType(e.target.value as any)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Without VAT">Without VAT</option>
                      <option value="Zero VAT">Zero VAT</option>
                    </select>
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Customer Phone
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revCustomerPhone}
                      onChange={(e) => setRevCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal pt-1.5">
                    Address
                  </label>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={revAddress}
                      onChange={(e) => setRevAddress(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080] resize-none"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Mobile
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revMobile}
                      onChange={(e) => setRevMobile(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Quotation Valid For */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Valid For
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revValidFor}
                      onChange={(e) => setRevValidFor(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By Mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By Mobile
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedByMobile}
                      onChange={(e) => setRevPreparedByMobile(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By Designation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By Designation
                  </label>
                  <div className="flex-1">
                    <select
                      value={revPreparedByDesignation}
                      onChange={(e) => setRevPreparedByDesignation(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Sr. Sales Executive">Sr. Sales Executive</option>
                      <option value="Sales Manager">Sales Manager</option>
                    </select>
                  </div>
                </div>

                {/* ⓘ Quotation Print Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                      i
                    </span>
                    <span>Quotation Print Heading</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPrintHeading}
                      onChange={(e) => setRevPrintHeading(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-3.5">
                {/* Quotation Date * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Date <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <CezconDateInput
                      placeholder="DD-MM-YYYY"
                      value={revQuoteDate}
                      onChange={(val) => setRevQuoteDate(val)}
                    />
                  </div>
                </div>

                {/* Quotation Type * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      readOnly
                      value={revQuoteType}
                      className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal pt-1.5">
                    Description
                  </label>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={revDescription}
                      onChange={(e) => setRevDescription(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080] resize-none"
                    />
                  </div>
                </div>

                {/* Customer Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Customer Name
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revCustomerName}
                      onChange={(e) => setRevCustomerName(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Customer Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Customer Email
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revCustomerEmail}
                      onChange={(e) => setRevCustomerEmail(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Attention */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Attention
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revAttention}
                      onChange={(e) => setRevAttention(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Reference */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Reference
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revReference}
                      onChange={(e) => setRevReference(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedBy}
                      onChange={(e) => setRevPreparedBy(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By Email
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedByEmail}
                      onChange={(e) => setRevPreparedByEmail(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Subject
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revSubject}
                      onChange={(e) => setRevSubject(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* ⓘ Hide Total Amount From Print */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                    i
                  </span>
                  <label className="text-slate-700 font-normal cursor-pointer flex items-center gap-2">
                    <span>Hide Total Amount From Print</span>
                    <input
                      type="checkbox"
                      checked={revHideTotalFromPrint}
                      onChange={(e) => setRevHideTotalFromPrint(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#d2d6de] text-[#008080] focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="space-y-3">
                {revItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-[3px] space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="px-2 py-0.5 bg-[#5bc0de] hover:bg-[#31b0d5] text-white rounded-[2px] text-[11px] font-medium transition cursor-pointer"
                      >
                        + Additional Description
                      </button>
                      {revItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRevItem(item.id)}
                          className="w-5 h-5 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-[2px] flex items-center justify-center text-xs font-bold transition cursor-pointer"
                          title="Delete Item"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2 text-xs items-end">
                      {/* Description */}
                      <div className="col-span-12 md:col-span-3">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateRevItem(item.id, 'description', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Image */}
                      <div className="col-span-6 md:col-span-2">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Image</label>
                        <input
                          type="file"
                          className="w-full text-[11px] text-slate-500 file:mr-1 file:py-0.5 file:px-2 file:rounded-[2px] file:border file:border-slate-300 file:text-[10px] file:bg-white"
                        />
                      </div>

                      {/* Code */}
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Code</label>
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => handleUpdateRevItem(item.id, 'code', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Unit */}
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateRevItem(item.id, 'unit', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Brand */}
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Brand</label>
                        <input
                          type="text"
                          value={item.brand}
                          onChange={(e) => handleUpdateRevItem(item.id, 'brand', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* QTY */}
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5 text-center">QTY</label>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateRevItem(item.id, 'qty', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-center text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Price */}
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5 text-right">Price</label>
                        <input
                          type="number"
                          step="any"
                          value={item.price}
                          onChange={(e) => handleUpdateRevItem(item.id, 'price', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Price Total */}
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-[11px] text-slate-600 block mb-0.5 text-right">Price Total</label>
                        <input
                          type="text"
                          readOnly
                          value={item.total.toFixed(2)}
                          className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-right font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddRevItem}
                  className="px-3 py-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-[2px] text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>+ Add More</span>
                </button>
              </div>
            </div>

            {/* Bottom Section: Terms (Left) + Totals (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-200 text-xs">
              {/* Left Column: Terms & Conditions with Rich Text Box */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                      i
                    </span>
                    <span>Terms &amp; Conditions</span>
                  </div>
                  <select className="bg-white border border-[#d2d6de] rounded-[3px] px-2.5 py-1 text-xs text-slate-700 focus:outline-none">
                    <option>Select Terms &amp; Conditions</option>
                  </select>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-[2px] text-xs font-medium cursor-pointer"
                  >
                    ⟳ Load
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevTerms('')}
                    className="px-2.5 py-1 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded-[2px] text-xs font-medium cursor-pointer"
                  >
                    🗑 Clear
                  </button>
                </div>

                {/* Editor Box */}
                <div className="border border-[#d2d6de] rounded-[3px] overflow-hidden bg-white shadow-xs">
                  {/* Mock Editor Toolbar */}
                  <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] p-1.5 flex flex-wrap items-center gap-1 text-slate-600 text-xs">
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 font-bold">B</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 italic">I</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 line-through">S</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50">Tx</button>
                    <span className="h-4 w-px bg-slate-300 mx-0.5" />
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50">≡</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50">”</button>
                    <span className="h-4 w-px bg-slate-300 mx-0.5" />
                    <select className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[11px]">
                      <option>Styles</option>
                    </select>
                    <select className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[11px]">
                      <option>Format</option>
                    </select>
                  </div>
                  <textarea
                    rows={8}
                    value={revTerms}
                    onChange={(e) => setRevTerms(e.target.value)}
                    className="w-full p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none resize-none"
                  />
                  <div className="bg-[#f5f5f5] border-t border-[#e5e5e5] px-2 py-0.5 text-[10px] text-slate-500">
                    body &gt; p &gt; strong
                  </div>
                </div>
              </div>

              {/* Right Column: Totals Summary */}
              <div className="lg:col-span-5 space-y-2">
                {/* Amount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={revSumAmount.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* Discount % */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Discount %</label>
                  <div className="flex-1 flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={revDiscountPercent}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setRevDiscountPercent(val);
                        if (val !== '') {
                          setRevDiscountAmount(Math.round((revSumAmount * (Number(val) / 100)) * 100) / 100);
                        }
                      }}
                      className="w-full bg-white border border-[#d2d6de] rounded-l-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                    <span className="px-2.5 py-1.5 bg-[#eeeeee] border border-l-0 border-[#d2d6de] rounded-r-[3px] text-slate-600 font-semibold">%</span>
                  </div>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Discount</label>
                  <input
                    type="number"
                    step="any"
                    value={revDiscountAmount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setRevDiscountAmount(val);
                      if (val !== '' && revSumAmount > 0) {
                        setRevDiscountPercent(Math.round((Number(val) / revSumAmount * 100) * 100) / 100);
                      }
                    }}
                    className="flex-1 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* Amount After Discount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Amount After Discount</label>
                  <input
                    type="text"
                    readOnly
                    value={revAmountAfterDiscount.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* VAT(%) */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">VAT(%)</label>
                  <input
                    type="number"
                    value={revVatRate}
                    onChange={(e) => setRevVatRate(Number(e.target.value))}
                    className="flex-1 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* VAT Amount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">VAT Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={revCalculatedVat.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* Sub Total */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Sub Total</label>
                  <input
                    type="text"
                    readOnly
                    value={revSubTotal.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* Adjustment */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Adjustment</label>
                  <input
                    type="number"
                    step="any"
                    value={revAdjustment}
                    onChange={(e) => setRevAdjustment(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-bold w-36 text-right">Total Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={revTotalAmount.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revUpdateOppAmount}
                  onChange={(e) => setRevUpdateOppAmount(e.target.checked)}
                  className="w-3.5 h-3.5 text-red-600 border-red-500 rounded focus:ring-0 accent-red-600 cursor-pointer"
                />
                <span className="text-red-600 font-medium">Update quotation amount in opportunity?</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#1b2a4a] hover:bg-[#152238] text-white rounded-[3px] text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteToEdit(null)}
                  className="px-4 py-1.5 bg-white border border-[#d2d6de] text-slate-700 hover:bg-slate-50 rounded-[3px] text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : isCreating ? (
        <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden flex flex-col font-sans text-xs">
          {/* Header Bar with [FileText] Add Quotation and Red [ ✕ ] Button */}
          <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-800 text-[13px]">
                {quoteToEdit ? 'Edit Quotation' : 'Add Quotation'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseForm}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body: 2-Column Exact Cezcon Grid */}
          <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 flex flex-col space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 text-[11px]">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-4">
                {/* Quotation Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                    Quotation Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      required
                      value={formQuoteNumber}
                      onChange={(e) => setFormQuoteNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <Settings className="w-3.5 h-3.5 text-cyan-600 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>

                {/* Opportunity */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                    Opportunity <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formOppCode}
                    onChange={(e) => handleOpportunitySelect(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Opportunity</option>
                    {salesOpportunities?.map((opp) => (
                      <option key={opp.id} value={opp.opportunityCode || opp.id}>
                        {opp.opportunityCode} - {opp.title} ({opp.customer})
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">File</label>
                  <div className="flex-1 flex items-center gap-2">
                    <label className="border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded cursor-pointer text-xs font-medium shrink-0 transition">
                      Choose file
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-500 text-xs truncate">
                      {formFileName || 'No file chosen'}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Amount</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* VAT (Compound Row: Rate % + Calculated VAT Amount) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">VAT</label>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                      <input
                        type="number"
                        value={formVatRate}
                        onChange={(e) => setFormVatRate(Number(e.target.value))}
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
                        calculatedVat > 0
                          ? calculatedVat.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                          : ''
                      }
                      className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none font-medium"
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
                      grandTotal > 0
                        ? grandTotal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                        : ''
                    }
                    className="flex-1 bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="space-y-4">
                {/* Quotation Date */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Quotation Date</label>
                  <div className="flex-1">
                    <CezconDateInput
                      value={formQuoteDate}
                      onChange={(val) => setFormQuoteDate(val)}
                    />
                  </div>
                </div>

                {/* Quotation Type (Dual Dropdowns: Type + With VAT) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                    Quotation Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <select
                      value={formQuoteType}
                      onChange={(e) => setFormQuoteType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="File Upload">File Upload</option>
                      <option value="Standard Proposal">Standard Proposal</option>
                      <option value="Project Tender">Project Tender</option>
                      <option value="Maintenance Contract">Maintenance Contract</option>
                    </select>

                    <select
                      value={formVatType}
                      onChange={(e) => setFormVatType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Without VAT">Without VAT</option>
                      <option value="Zero VAT">Zero VAT</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0 pt-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>

                {/* Discount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Discount</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Adjustment */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Adjustment</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formAdjustment}
                    onChange={(e) => setFormAdjustment(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Footer Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-200 mt-2">
              {/* Red Checkbox for Opportunity Amount Update */}
              <label className="flex items-center gap-1.5 text-red-600 font-semibold text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formUpdateOppAmount}
                  onChange={(e) => setFormUpdateOppAmount(e.target.checked)}
                  className="w-3.5 h-3.5 text-red-600 border-red-500 rounded focus:ring-0 accent-red-600 cursor-pointer"
                />
                <span>Update quotation amount in opportunity</span>
              </label>

              <div className="flex items-center gap-2">
                {/* Submit Button */}
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Submit
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : proformaTargetQuote ? (
        /* ========================================================================= */
        /* VIEW 2: FULL PAGE ADD PROFORMA INVOICE (EXACT CEZCON CRM REFERENCE)      */
        /* ========================================================================= */
        <div className="bg-white rounded-[3px] shadow-xs border border-[#d2d6de] overflow-hidden mb-6">
          {/* 1. Header Bar */}
          <div className="bg-[#f4f4f4] border-b border-[#e5e7eb] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#333333] text-xs font-semibold">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <span>Add Proforma Invoice</span>
            </div>
            <button
              type="button"
              onClick={() => setProformaTargetQuote(null)}
              className="w-5 h-5 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-[2px] flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* 2. Form Body */}
          <form onSubmit={handleSubmitProforma} className="p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-xs">
              {/* LEFT COLUMN */}
              <div className="space-y-3.5">
                {/* Customer * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <select
                      value={profCustomer}
                      onChange={(e) => setProfCustomer(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value={profCustomer}>{profCustomer}</option>
                      {customers?.map((c) => (
                        <option key={c.id} value={c.companyName || c.customerName}>
                          {c.companyName || c.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quotation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    Quotation
                  </label>
                  <div className="flex-1">
                    <select
                      value={profQuoteNum}
                      onChange={(e) => setProfQuoteNum(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value={profQuoteNum}>{profQuoteNum}</option>
                      {crmQuotations?.map((q) => (
                        <option key={q.id} value={q.quotationNumber}>
                          {q.quotationNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Invoice Date */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    Invoice Date
                  </label>
                  <div className="flex-1">
                    <CezconDateInput
                      placeholder="DD-MM-YYYY"
                      value={profInvoiceDate}
                      onChange={(val) => setProfInvoiceDate(val)}
                    />
                  </div>
                </div>

                {/* LPO Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    LPO Number
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={profLpoNumber}
                      onChange={(e) => setProfLpoNumber(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    Amount
                  </label>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="any"
                      value={profAmount}
                      onChange={(e) => setProfAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* VAT (Compound: Rate + % + VAT Amount) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    VAT
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      value={profVatRate}
                      onChange={(e) => setProfVatRate(Number(e.target.value))}
                      className="w-20 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                    <span className="text-slate-500 font-medium px-1">%</span>
                    <input
                      type="text"
                      readOnly
                      placeholder="VAT Amount"
                      value={profCalculatedVat > 0 ? profCalculatedVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                      className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal">
                    Total Amount
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      readOnly
                      value={profGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-32 text-slate-700 font-normal pt-1.5">
                    Remarks
                  </label>
                  <div className="flex-1">
                    <textarea
                      rows={3}
                      value={profRemarks}
                      onChange={(e) => setProfRemarks(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-3.5">
                {/* Opportunity/Order * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Opportunity/Order <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <select
                      value={profOpp}
                      onChange={(e) => setProfOpp(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080] truncate"
                    >
                      <option value={profOpp}>{profOpp}</option>
                      {salesOpportunities?.map((opp) => (
                        <option key={opp.id} value={`${opp.opportunityCode} | ${opp.title} [Sale Rate: ${(opp.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]`}>
                          {opp.opportunityCode} | {opp.title} [Sale Rate: {(opp.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Proforma Number * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Proforma Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={profInvoiceNum}
                      onChange={(e) => setProfInvoiceNum(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 pr-9 focus:outline-none focus:border-[#008080]"
                    />
                    <button
                      type="button"
                      className="absolute right-1 text-[#00c0ef] hover:text-[#009abf] p-1 cursor-pointer"
                      title="Proforma Number Settings"
                    >
                      <Settings className="w-4 h-4 text-[#00c0ef]" />
                    </button>
                  </div>
                </div>

                {/* LPO Date */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    LPO Date
                  </label>
                  <div className="flex-1">
                    <CezconDateInput
                      placeholder="DD-MM-YYYY"
                      value={profLpoDate}
                      onChange={(val) => setProfLpoDate(val)}
                    />
                  </div>
                </div>

                {/* Type (File Upload + With VAT) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Type
                  </label>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <select
                      value={profType}
                      onChange={(e) => setProfType(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value="File Upload">File Upload</option>
                      <option value="Manual Entry">Manual Entry</option>
                    </select>
                    <select
                      value={profVatType}
                      onChange={(e) => setProfVatType(e.target.value as any)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Without VAT">Without VAT</option>
                      <option value="Zero VAT">Zero VAT</option>
                    </select>
                  </div>
                </div>

                {/* Discount */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Discount
                  </label>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="any"
                      value={profDiscount}
                      onChange={(e) => setProfDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Adjustment */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Adjustment
                  </label>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="any"
                      value={profAdjustment}
                      onChange={(e) => setProfAdjustment(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* File (Choose file / No file chosen) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    File
                  </label>
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProfFileName(e.target.files[0].name);
                        }
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-[2px] file:border file:border-slate-300 file:text-xs file:font-normal file:bg-slate-50 hover:file:bg-slate-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Action Buttons (Right Aligned: Submit & Back) */}
            <div className="pt-6 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#1b2a4a] hover:bg-[#152238] text-white rounded-[3px] text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setProformaTargetQuote(null)}
                className="px-4 py-1.5 bg-white border border-[#d2d6de] text-slate-700 hover:bg-slate-50 rounded-[3px] text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      ) : reviseTargetQuote ? (
        /* ========================================================================= */
        /* VIEW: FULL PAGE REVISE QUOTATION (EXACT CEZCON CRM REFERENCE)             */
        /* ========================================================================= */
        <div className="bg-white rounded-[3px] shadow-xs border border-[#d2d6de] overflow-hidden mb-6">
          {/* Header Bar */}
          <div className="bg-[#f4f4f4] border-b border-[#e5e7eb] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#333333] text-xs font-semibold">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Revise Quotation</span>
            </div>
            <button
              type="button"
              onClick={() => setReviseTargetQuote(null)}
              className="w-5 h-5 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-[2px] flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitRevise} className="p-6 sm:p-8 space-y-6">
            {/* Top 2 Columns Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-xs">
              {/* LEFT COLUMN */}
              <div className="space-y-3.5">
                {/* Quotation Revise No. * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Revise No. <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 flex items-center">
                    <span className="px-3 py-1.5 bg-[#eeeeee] border border-r-0 border-[#d2d6de] rounded-l-[3px] text-xs text-slate-700 font-medium">
                      {revQuotePrefix}
                    </span>
                    <input
                      type="text"
                      value={revQuoteSuffix}
                      onChange={(e) => setRevQuoteSuffix(e.target.value)}
                      className="flex-1 bg-white border border-[#d2d6de] rounded-r-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Opportunity */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Opportunity
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revOpp}
                      onChange={(e) => setRevOpp(e.target.value)}
                      className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal pt-1.5">
                    Description
                  </label>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={revDescription}
                      onChange={(e) => setRevDescription(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080] resize-none"
                    />
                  </div>
                </div>

                {/* Quotation Expiry */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Expiry
                  </label>
                  <div className="flex-1">
                    <CezconDateInput
                      placeholder="DD-MM-YYYY"
                      value={revExpiryDate}
                      onChange={(val) => setRevExpiryDate(val)}
                    />
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Customer Phone
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revCustomerPhone}
                      onChange={(e) => setRevCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal pt-1.5">
                    Address
                  </label>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={revAddress}
                      onChange={(e) => setRevAddress(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080] resize-none"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Mobile
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revMobile}
                      onChange={(e) => setRevMobile(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedBy}
                      onChange={(e) => setRevPreparedBy(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By Email
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedByEmail}
                      onChange={(e) => setRevPreparedByEmail(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Subject
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revSubject}
                      onChange={(e) => setRevSubject(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* ⓘ Quotation Print Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                      i
                    </span>
                    <span>Quotation Print Heading</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPrintHeading}
                      onChange={(e) => setRevPrintHeading(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-3.5">
                {/* Quotation Date * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Date <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <CezconDateInput
                      placeholder="DD-MM-YYYY"
                      value={revQuoteDate}
                      onChange={(val) => setRevQuoteDate(val)}
                    />
                  </div>
                </div>

                {/* Quotation Type * */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revQuoteType}
                      onChange={(e) => setRevQuoteType(e.target.value)}
                      className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* VAT Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    VAT Type
                  </label>
                  <div className="flex-1">
                    <select
                      value={revVatType}
                      onChange={(e) => setRevVatType(e.target.value as any)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    >
                      <option value="With VAT">With VAT</option>
                      <option value="Without VAT">Without VAT</option>
                      <option value="Zero VAT">Zero VAT</option>
                    </select>
                  </div>
                </div>

                {/* Customer Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Customer Name
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revCustomerName}
                      onChange={(e) => setRevCustomerName(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Customer Email */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Customer Email
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revCustomerEmail}
                      onChange={(e) => setRevCustomerEmail(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Attention */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Attention
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revAttention}
                      onChange={(e) => setRevAttention(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Reference */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Reference
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revReference}
                      onChange={(e) => setRevReference(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By Mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By Mobile
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedByMobile}
                      onChange={(e) => setRevPreparedByMobile(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Prepared By Designation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Prepared By Designation
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revPreparedByDesignation}
                      onChange={(e) => setRevPreparedByDesignation(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* Quotation Valid For */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-36 text-slate-700 font-normal">
                    Quotation Valid For
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={revValidFor}
                      onChange={(e) => setRevValidFor(e.target.value)}
                      className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                  </div>
                </div>

                {/* ⓘ Hide Total Amount From Print */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                    i
                  </span>
                  <label className="text-slate-700 font-normal cursor-pointer flex items-center gap-2">
                    <span>Hide Total Amount From Print</span>
                    <input
                      type="checkbox"
                      checked={revHideTotalFromPrint}
                      onChange={(e) => setRevHideTotalFromPrint(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#d2d6de] text-[#008080] focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="space-y-3">
                {revItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-[3px] space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="px-2 py-0.5 bg-[#5bc0de] hover:bg-[#31b0d5] text-white rounded-[2px] text-[11px] font-medium transition cursor-pointer"
                      >
                        + Additional Description
                      </button>
                      {revItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRevItem(item.id)}
                          className="w-5 h-5 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-[2px] flex items-center justify-center text-xs font-bold transition cursor-pointer"
                          title="Delete Item"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2 text-xs items-end">
                      {/* Description */}
                      <div className="col-span-12 md:col-span-3">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateRevItem(item.id, 'description', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Image */}
                      <div className="col-span-6 md:col-span-2">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Image</label>
                        <input
                          type="file"
                          className="w-full text-[11px] text-slate-500 file:mr-1 file:py-0.5 file:px-2 file:rounded-[2px] file:border file:border-slate-300 file:text-[10px] file:bg-white"
                        />
                      </div>

                      {/* Code */}
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Code</label>
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => handleUpdateRevItem(item.id, 'code', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Unit */}
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Unit</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateRevItem(item.id, 'unit', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Brand */}
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5">Brand</label>
                        <input
                          type="text"
                          value={item.brand}
                          onChange={(e) => handleUpdateRevItem(item.id, 'brand', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* QTY */}
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5 text-center">QTY</label>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateRevItem(item.id, 'qty', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-center text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Price */}
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-[11px] text-slate-600 block mb-0.5 text-right">Price</label>
                        <input
                          type="number"
                          step="any"
                          value={item.price}
                          onChange={(e) => handleUpdateRevItem(item.id, 'price', e.target.value)}
                          className="w-full bg-white border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                        />
                      </div>

                      {/* Price Total */}
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-[11px] text-slate-600 block mb-0.5 text-right">Price Total</label>
                        <input
                          type="text"
                          readOnly
                          value={item.total.toFixed(2)}
                          className="w-full bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-2 py-1 text-xs text-right font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddRevItem}
                  className="px-3 py-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-[2px] text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>+ Add More</span>
                </button>
              </div>
            </div>

            {/* Bottom Section: Terms (Left) + Totals (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-200 text-xs">
              {/* Left Column: Terms & Conditions with Rich Text Box */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                      i
                    </span>
                    <span>Terms &amp; Conditions</span>
                  </div>
                  <select className="bg-white border border-[#d2d6de] rounded-[3px] px-2.5 py-1 text-xs text-slate-700 focus:outline-none">
                    <option>Select Terms &amp; Conditions</option>
                  </select>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-[2px] text-xs font-medium cursor-pointer"
                  >
                    ⟳ Load
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevTerms('')}
                    className="px-2.5 py-1 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded-[2px] text-xs font-medium cursor-pointer"
                  >
                    🗑 Clear
                  </button>
                </div>

                {/* Editor Box */}
                <div className="border border-[#d2d6de] rounded-[3px] overflow-hidden bg-white shadow-xs">
                  {/* Mock Editor Toolbar */}
                  <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] p-1.5 flex flex-wrap items-center gap-1 text-slate-600 text-xs">
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 font-bold">B</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 italic">I</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 line-through">S</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50">Tx</button>
                    <span className="h-4 w-px bg-slate-300 mx-0.5" />
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50">≡</button>
                    <button type="button" className="px-1.5 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50">”</button>
                    <span className="h-4 w-px bg-slate-300 mx-0.5" />
                    <select className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[11px]">
                      <option>Styles</option>
                    </select>
                    <select className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[11px]">
                      <option>Format</option>
                    </select>
                  </div>
                  <textarea
                    rows={8}
                    value={revTerms}
                    onChange={(e) => setRevTerms(e.target.value)}
                    className="w-full p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none resize-none"
                  />
                  <div className="bg-[#f5f5f5] border-t border-[#e5e5e5] px-2 py-0.5 text-[10px] text-slate-500">
                    body &gt; p &gt; strong
                  </div>
                </div>
              </div>

              {/* Right Column: Totals Summary */}
              <div className="lg:col-span-5 space-y-2">
                {/* Amount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={revSumAmount.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* Discount % */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Discount %</label>
                  <div className="flex-1 flex items-center">
                    <input
                      type="number"
                      step="any"
                      value={revDiscountPercent}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setRevDiscountPercent(val);
                        if (val !== '') {
                          setRevDiscountAmount(Math.round((revSumAmount * (Number(val) / 100)) * 100) / 100);
                        }
                      }}
                      className="w-full bg-white border border-[#d2d6de] rounded-l-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                    />
                    <span className="px-2.5 py-1.5 bg-[#eeeeee] border border-l-0 border-[#d2d6de] rounded-r-[3px] text-slate-600 font-semibold">%</span>
                  </div>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Discount</label>
                  <input
                    type="number"
                    step="any"
                    value={revDiscountAmount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setRevDiscountAmount(val);
                      if (val !== '' && revSumAmount > 0) {
                        setRevDiscountPercent(Math.round((Number(val) / revSumAmount * 100) * 100) / 100);
                      }
                    }}
                    className="flex-1 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* Amount After Discount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Amount After Discount</label>
                  <input
                    type="text"
                    readOnly
                    value={revAmountAfterDiscount.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* VAT(%) */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">VAT(%)</label>
                  <input
                    type="number"
                    value={revVatRate}
                    onChange={(e) => setRevVatRate(Number(e.target.value))}
                    className="flex-1 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* VAT Amount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">VAT Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={revCalculatedVat.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* Sub Total */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Sub Total</label>
                  <input
                    type="text"
                    readOnly
                    value={revSubTotal.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-medium text-slate-700"
                  />
                </div>

                {/* Adjustment */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-normal w-36 text-right">Adjustment</label>
                  <input
                    type="number"
                    step="any"
                    value={revAdjustment}
                    onChange={(e) => setRevAdjustment(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 bg-white border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right text-slate-800 focus:outline-none focus:border-[#008080]"
                  />
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-slate-700 font-bold w-36 text-right">Total Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={revTotalAmount.toFixed(2)}
                    className="flex-1 bg-[#eeeeee] border border-[#d2d6de] rounded-[3px] px-3 py-1.5 text-xs text-right font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revUpdateOppAmount}
                  onChange={(e) => setRevUpdateOppAmount(e.target.checked)}
                  className="w-3.5 h-3.5 text-red-600 border-red-500 rounded focus:ring-0 accent-red-600 cursor-pointer"
                />
                <span className="text-red-600 font-medium">Update quotation amount in opportunity?</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#1b2a4a] hover:bg-[#152238] text-white rounded-[3px] text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setReviseTargetQuote(null)}
                  className="px-4 py-1.5 bg-white border border-[#d2d6de] text-slate-700 hover:bg-slate-50 rounded-[3px] text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : selectedQuote ? (
        /* ========================================================================= */
        /* VIEW 2: FULL PAGE QUOTATION DETAILS OVERVIEW (EXACT CEZCON CRM REFERENCE) */
        /* ========================================================================= */
        (() => {
          const matchedCust = customers?.find(
            (c) =>
              (selectedQuote.customerId && c.id === selectedQuote.customerId) ||
              (c.customerName && c.customerName.toLowerCase() === (selectedQuote.customer || '').toLowerCase()) ||
              (c.companyName && c.companyName.toLowerCase() === (selectedQuote.customer || '').toLowerCase())
          );

          const matchedOpp = salesOpportunities?.find(
            (o) =>
              (selectedQuote.opportunityId && o.id === selectedQuote.opportunityId) ||
              (selectedQuote.opportunityCode && o.opportunityCode === selectedQuote.opportunityCode) ||
              (o.title && selectedQuote.subject && o.title.toLowerCase() === selectedQuote.subject.toLowerCase())
          );

          const ownerName = (selectedQuote.owner || currentUser?.name || 'JISMON JOSE').toUpperCase();
          const ownerUser = users?.find((u) => u.name.toLowerCase() === ownerName.toLowerCase());
          const ownerAvatar =
            ownerUser?.avatar ||
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

          const customerName = (selectedQuote.customer || matchedCust?.customerName || matchedCust?.companyName || 'ADC ENERGY SYSTEMS LLC').toUpperCase();
          const contactPerson = selectedQuote.contactPerson || matchedCust?.contactPerson || ((matchedCust as any)?.contacts && (matchedCust as any).contacts[0]?.name) || 'Mr. KALIM ANSARI';
          const contactMobile = selectedQuote.phone || matchedCust?.phone || ((matchedCust as any)?.contacts && (matchedCust as any).contacts[0]?.phone) || '+97144457100';

          const subtotal = selectedQuote.subtotal || (selectedQuote.totalAmount ? selectedQuote.totalAmount / 1.05 : 25440);
          const vatAmount = selectedQuote.vatAmount || (selectedQuote.totalAmount ? (selectedQuote.totalAmount / 1.05) * 0.05 : 1272);
          const totalAmount = selectedQuote.totalAmount || (subtotal + vatAmount);
          const discountAmount = selectedQuote.discountAmount || 0;
          const adjustmentAmount = 0;

          const quoteNumber = selectedQuote.quotationNumber || 'CTSQ#4363';
          const quoteDate = selectedQuote.quoteDate || '05-10-2026';
          const oppTitle = (matchedOpp?.title || selectedQuote.subject || 'WINDOW AC UNITS').toUpperCase();

          const items = selectedQuote.items && selectedQuote.items.length > 0 ? selectedQuote.items : [
            {
              id: 'item-1',
              productName: 'OPTION-1 WINDOW AC 1.5 TR ROTARY R410 BLUE STAR WM18CLYFB3-01',
              description: 'Code: WM18CLYFB3-01 | Unit: Each | Brand: BLUE STAR',
              quantity: 8,
              unitPrice: 1130,
              totalAmount: 9040,
            },
            {
              id: 'item-2',
              productName: 'OPTION-2 WINDOW AC 1.5 TR ROTARY R410 NIKAI NWAC18031N23',
              description: 'Code: NWAC18031N23 | Unit: Each | Brand: NIKAI',
              quantity: 8,
              unitPrice: 1080,
              totalAmount: 8640,
            },
            {
              id: 'item-3',
              productName: 'OPTION-3 1.5 TR Window AC Rotary R410 Chigo CWA18CO',
              description: 'Code: CWA18CO | Unit: Each | Brand: CHIGO',
              quantity: 8,
              unitPrice: 970,
              totalAmount: 7760,
            },
          ];

          return (
            <div className="bg-white rounded border border-slate-300 w-full overflow-hidden flex flex-col font-sans text-xs shadow-sm">
              {/* Top History Banner */}
              <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-800 uppercase">
                    QUOTATION CREATED BY {ownerName} ON MON {quoteDate} 5:45:09 PM
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-medium text-slate-600 uppercase">
                    QUOTATION LAST MODIFIED BY {ownerName} ON MON {quoteDate} 5:45:17 PM
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCloseOverview}
                  className="bg-[#d9534f] hover:bg-[#c9302c] text-white w-5 h-5 rounded-xs flex items-center justify-center cursor-pointer transition"
                  title="Close and return to list"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-4 sm:p-5 space-y-4 bg-white">
                {/* TOP SECTION: 2-COLUMN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* LEFT BOX: Quotation Details Table (6 Cols) */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xs overflow-hidden shadow-2xs">
                    <div className="bg-[#f8f9fa] border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-slate-800 text-xs">Quotation Details</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-[11px]">
                      {/* Quotation Owner */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Quotation Owner</span>
                        <div className="col-span-7 flex items-center gap-2 font-bold text-slate-900">
                          <img
                            src={ownerAvatar}
                            alt={ownerName}
                            className="w-5 h-5 rounded-full object-cover border border-slate-300"
                          />
                          <span>{ownerName}</span>
                        </div>
                      </div>

                      {/* Quotation Number */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Quotation Number</span>
                        <span className="col-span-7 font-bold text-slate-900">{quoteNumber}</span>
                      </div>

                      {/* Quotation Type */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Quotation Type</span>
                        <span className="col-span-7 font-bold text-slate-900">Manual Creation</span>
                      </div>

                      {/* Quotation Date */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Quotation Date</span>
                        <span className="col-span-7 font-bold text-slate-900">{quoteDate}</span>
                      </div>

                      {/* Opportunity */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50 items-center">
                        <span className="col-span-5 text-slate-600 font-medium">Opportunity</span>
                        <div className="col-span-7 flex items-center justify-between gap-1">
                          <span className="text-[#337ab7] hover:underline font-bold cursor-pointer uppercase truncate">
                            {oppTitle}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic shrink-0">
                            i
                          </span>
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50 items-center">
                        <span className="col-span-5 text-slate-600 font-medium">Customer Name</span>
                        <div className="col-span-7 flex items-center justify-between gap-1">
                          <span className="text-[#337ab7] hover:underline font-bold cursor-pointer uppercase truncate">
                            {customerName}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic shrink-0">
                            i
                          </span>
                        </div>
                      </div>

                      {/* Prepared By */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Prepared By</span>
                        <span className="col-span-7 font-bold text-slate-900 uppercase">{ownerName}</span>
                      </div>

                      {/* Prepared By Mobile */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Prepared By Mobile</span>
                        <span className="col-span-7 font-semibold text-slate-900">+971585262058</span>
                      </div>

                      {/* Prepared By Email */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Prepared By Email</span>
                        <span className="col-span-7 text-slate-800">
                          {ownerName.toLowerCase().replace(/\s+/g, '.')}@cooltechuae.com
                        </span>
                      </div>

                      {/* Prepared By Designation */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Prepared By Designation</span>
                        <span className="col-span-7 font-medium text-slate-800">Sales Executive</span>
                      </div>

                      {/* Attention */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Attention</span>
                        <span className="col-span-7 font-bold text-slate-900">{contactPerson}</span>
                      </div>

                      {/* Mobile */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Mobile</span>
                        <span className="col-span-7 font-semibold text-slate-900">{contactMobile}</span>
                      </div>

                      {/* Status */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50 items-center">
                        <span className="col-span-5 text-slate-600 font-medium">Status</span>
                        <div className="col-span-7">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#5bc0de] text-white shadow-2xs">
                            <Edit2 className="w-2.5 h-2.5 text-white" />
                            <span>{selectedQuote.status || 'Approved'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Submitted For Approval */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Submitted For Approval</span>
                        <span className="col-span-7 font-semibold text-slate-900 uppercase">
                          {ownerName} ON MON {quoteDate} 5:45:13 PM
                        </span>
                      </div>

                      {/* Approved */}
                      <div className="grid grid-cols-12 px-3 py-1.5 hover:bg-slate-50">
                        <span className="col-span-5 text-slate-600 font-medium">Approved</span>
                        <span className="col-span-7 font-semibold text-slate-900 uppercase">
                          {ownerName} ON MON {quoteDate} 5:45:17 PM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT BOX: Overview 6 Metric Cards (6 Cols) */}
                  <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xs overflow-hidden shadow-2xs">
                    <div className="bg-[#f8f9fa] border-b border-slate-200 px-3 py-2">
                      <span className="font-bold text-slate-800 text-xs">Overview</span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#fafbfc]">
                      {/* 1. Amount */}
                      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Amount</span>
                          <span className="text-sm font-bold text-slate-900">
                            {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>

                      {/* 2. Discount */}
                      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Discount</span>
                          <span className="text-sm font-bold text-slate-900">
                            {discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                          <Handshake className="w-4 h-4" />
                        </div>
                      </div>

                      {/* 3. VAT (5%) */}
                      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase block">VAT (5%)</span>
                          <span className="text-sm font-bold text-slate-900">
                            {vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                      </div>

                      {/* 4. Sub Total */}
                      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Sub Total</span>
                          <span className="text-sm font-bold text-slate-900">
                            {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                          <Calculator className="w-4 h-4" />
                        </div>
                      </div>

                      {/* 5. Adjustment */}
                      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Adjustment</span>
                          <span className="text-sm font-bold text-slate-900">
                            {adjustmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                      </div>

                      {/* 6. Total Amount */}
                      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total Amount</span>
                          <span className="text-sm font-bold text-slate-900">
                            {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="border border-slate-200 rounded-xs overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-slate-200 text-slate-700 font-bold">
                        <th className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span>Description</span>
                            <span className="w-3.5 h-3.5 rounded-full bg-[#337ab7] text-white flex items-center justify-center text-[9px] font-serif font-bold italic">
                              i
                            </span>
                          </div>
                        </th>
                        <th className="py-2.5 px-3 w-20 text-center">QTY</th>
                        <th className="py-2.5 px-3 w-28 text-right">Price</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3">
                            <div className="flex items-start gap-3">
                              {/* Square No Image Placeholder */}
                              <div className="w-12 h-12 rounded border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-[8px] text-slate-400 font-bold text-center leading-tight shrink-0 p-1">
                                <ImageIcon className="w-4 h-4 text-slate-300 mb-0.5" />
                                <span>NO IMAGE</span>
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs uppercase leading-snug">
                                  {item.productName}
                                </p>
                                <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                                  {item.description || 'Code: WM18CLYFB3-01 | Unit: Each | Brand: BLUE STAR'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            {item.quantity || 1}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-800">
                            {(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {(item.totalAmount || (item.quantity * item.unitPrice) || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TERMS & CONDITIONS (LEFT) AND TOTAL SUMMARY (RIGHT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-2">
                  {/* Left Terms */}
                  <div className="lg:col-span-8 space-y-2 text-[11px] text-slate-800 font-medium">
                    <p className="font-bold text-slate-900">Terms &amp; Conditions:</p>
                    <div className="space-y-1 text-slate-700">
                      <p><span className="font-bold text-slate-900">DELIVERY</span> : 2-3 DAYS ARO, SUBJECT TO PRIOR SALE</p>
                      <p><span className="font-bold text-slate-900">PAYMENT TERMS:</span> CDC</p>
                      <p><span className="font-bold text-slate-900">PRICE</span> : In AED, Ex-Works, Mussafah</p>
                      <div className="pt-1">
                        <p className="font-bold text-slate-900 uppercase">WARRANTY FOR AIR CONDITIONER</p>
                        <p className="text-slate-600">1 Year for unit &amp; 5 Years for compressor on manufacturing defects as per manufacturer&apos;s terms</p>
                      </div>
                      <p className="pt-1">We hope we are in line with your requirement &amp; expecting a purchase order from your side to proceed further.</p>
                      <p>Please feel free to call me or mail me for any clarification that you may deem required in the proposal.</p>
                      <p className="pt-2 font-bold text-slate-900">For COOL TECHNOLOGIES</p>
                    </div>
                  </div>

                  {/* Right Summary Table */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xs overflow-hidden shadow-2xs divide-y divide-slate-100 text-[11px]">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="font-medium text-slate-600">Amount</span>
                      <span className="font-bold text-slate-800">
                        {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="font-medium text-slate-600">VAT (5%)</span>
                      <span className="font-bold text-slate-800">
                        {vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="font-medium text-slate-600">Sub Total</span>
                      <span className="font-bold text-slate-800">
                        {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                      <span className="font-bold text-slate-900 text-xs">Total Amount</span>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTION BAR */}
              <div className="bg-[#f8f9fa] border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseOverview}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Print Format Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPrintFormatDropdownOpen((prev) => !prev);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Format</span>
                      <ChevronDown className="w-3 h-3" />
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
                                setQuoteForVoucher(selectedQuote);
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

                  {/* Print in USD */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPrintFormat('Print in USD');
                      setQuoteForVoucher(selectedQuote);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print in USD</span>
                  </button>

                  {/* Print */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPrintFormat('Print with Quantity');
                      setQuoteForVoucher(selectedQuote);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  {/* Revise */}
                  <button
                    type="button"
                    onClick={() => handleOpenRevise(selectedQuote)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#008080] hover:bg-[#006666] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Revise</span>
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedQuote)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedQuote)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* ========================================================================= */
        /* VIEW 3: FULL PAGE QUOTATION LIST & 3-ROW FILTER (EXACT CEZCON CRM REFERENCE) */
        /* ========================================================================= */
        <>
          {/* Top Filter Criteria Card */}
          <div className="bg-white border border-[#E2E8F0] rounded p-4 shadow-2xs space-y-3 font-sans">
            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Select Owner */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Select Owner</label>
                <select
                  value={filterOwner}
                  onChange={(e) => {
                    setFilterOwner(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="All">All Owners</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quotation Date */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Quotation Date</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 font-medium"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setFilterDateRange('')}
                    className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer absolute right-2.5 top-2"
                    title="Clear Date"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Select Quotation Type */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Select Quotation Type</label>
                <select
                  value={filterQuoteTypeVal}
                  onChange={(e) => setFilterQuoteTypeVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select Quotation Type</option>
                  <option value="standard">Standard Proposal</option>
                  <option value="project">Project Tender</option>
                  <option value="maintenance">Maintenance Contract</option>
                  <option value="commercial">Commercial Equipment</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Filter Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Business Opportunity */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Business Opportunity</label>
                <select
                  value={filterBizOpp}
                  onChange={(e) => {
                    setFilterBizOpp(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select</option>
                  <option value="SPLIT AC">Supply of Split AC</option>
                  <option value="ICE MAKER">Supply of Ice Makers</option>
                  <option value="WASHING">Washing Machine & Dispenser</option>
                  <option value="Water Coolers">Water Coolers</option>
                  <option value="Industrial Coolers">Industrial Coolers</option>
                  <option value="HVAC">HVAC Maintenance</option>
                </select>
              </div>

              {/* Customer */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Customer</label>
                <select
                  value={filterCustomerVal}
                  onChange={(e) => {
                    setFilterCustomerVal(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select Customer</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.customerName || c.companyName}>
                      {c.customerName || c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Opportunity */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Select Opportunity</label>
                <select
                  value={filterOpportunityVal}
                  onChange={(e) => {
                    setFilterOpportunityVal(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select Opportunity</option>
                  {salesOpportunities?.map((opp) => (
                    <option key={opp.id} value={opp.title}>
                      {opp.opportunityCode ? `${opp.opportunityCode} - ` : ''}{opp.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product/Service */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Product/Service</label>
                <select
                  value={filterProductService}
                  onChange={(e) => setFilterProductService(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="">Select Product/Service</option>
                  <option value="Split AC 2 Ton">Split AC 2 Ton</option>
                  <option value="Commercial Ice Maker 500KG">Commercial Ice Maker 500KG</option>
                  <option value="Washing Machine 15KG">Washing Machine 15KG</option>
                  <option value="Water Dispenser 4-Stage">Water Dispenser 4-Stage</option>
                </select>
              </div>
            </div>

            {/* Filter Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Opportunity Stage */}
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block text-[11px]">Opportunity Stage</label>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="All Stages">All Stages</option>
                  <option value="Enquiry">Enquiry</option>
                  <option value="Offer Confirmed">Offer Confirmed</option>
                  <option value="On Review">On Review</option>
                  <option value="Offer Sent">Offer Sent</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Order">Order</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Card Section */}
          <div className="bg-white border border-[#E2E8F0] rounded shadow-2xs overflow-visible font-sans">
            {/* Header Bar with Title and Green + QUOTATION Button */}
            <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-normal text-slate-800 text-[13px]">Quotation</span>
              </div>

              <button
                type="button"
                onClick={handleStartCreate}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#28a745] hover:bg-[#218838] text-white rounded text-xs font-bold cursor-pointer shadow-2xs transition select-none tracking-wide"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>QUOTATION</span>
              </button>
            </div>

            {/* Secondary Toolbar: Shows [ 10 ⌄ ] Rows and Search Input */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
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
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* 11-Column Desktop Table */}
            <div className="overflow-x-auto w-full min-h-[360px] pb-24">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-slate-200 text-slate-700 font-bold select-none text-xs">
                    <th className="py-2.5 px-2 w-14 text-center border-r border-slate-200 text-slate-700 font-bold">SL.No</th>
                    <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-200 text-slate-700 font-bold">Quotation#</th>
                    <th className="py-2.5 px-2 w-16 text-center border-r border-slate-200 text-slate-700 font-bold">Owner</th>
                    <th className="py-2.5 px-3 w-28 border-r border-slate-200 text-slate-700 font-bold">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600">
                        <span>Date</span>
                        <span className="text-[#337ab7] text-[10px]">▼</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 min-w-[200px] border-r border-slate-200 text-slate-700 font-bold">Opportunity</th>
                    <th className="py-2.5 px-3 min-w-[260px] border-r border-slate-200 text-slate-700 font-bold">Customer</th>
                    <th className="py-2.5 px-3 w-28 text-right border-r border-slate-200 text-slate-700 font-bold">Amount</th>
                    <th className="py-2.5 px-3 w-24 text-right border-r border-slate-200 text-slate-700 font-bold">VAT</th>
                    <th className="py-2.5 px-3 w-28 text-right border-r border-slate-200 text-slate-700 font-bold">Total</th>
                    <th className="py-2.5 px-2 w-28 text-center border-r border-slate-200 text-slate-700 font-bold">Status</th>
                    <th className="py-2.5 px-2 w-20 text-center text-slate-700 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-12 text-center text-slate-500">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No quotation records found.</p>
                        <p className="text-slate-400 mt-1">Click &quot;+ QUOTATION&quot; above to create a new commercial proposal.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedQuotations.map((q, idx) => {
                      const slNo = (currentPage - 1) * rowsPerPage + idx + 1;
                      const isDropdownOpen = openActionDropdownId === q.id;

                      const matchedCust = customers?.find(
                        (c) =>
                          (q.customerId && c.id === q.customerId) ||
                          (c.customerName && c.customerName.toLowerCase() === (q.customer || '').toLowerCase()) ||
                          (c.companyName && c.companyName.toLowerCase() === (q.customer || '').toLowerCase())
                      );
                      const custName = (q.customer || matchedCust?.customerName || matchedCust?.companyName || 'Direct Customer').toUpperCase();
                      const contactPerson = q.contactPerson || matchedCust?.contactPerson || ((matchedCust as any)?.contacts && (matchedCust as any).contacts[0]?.name) || '';
                      const phoneNum = q.phone || matchedCust?.phone || ((matchedCust as any)?.contacts && (matchedCust as any).contacts[0]?.phone) || '';

                      return (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. SL.No */}
                          <td className="py-3 px-2 text-center text-slate-700 font-normal border-r border-slate-200">
                            {slNo}
                          </td>

                          {/* 2. Quotation# */}
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 text-[11px] shrink-0 shadow-2xs">
                                📄
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedQuote(q)}
                                className="text-[#337ab7] hover:text-[#23527c] hover:underline font-semibold text-xs cursor-pointer text-left uppercase"
                              >
                                {q.quotationNumber}
                              </button>
                            </div>
                          </td>

                          {/* 3. Owner */}
                          <td className="py-3 px-2 text-center border-r border-slate-200">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 mx-auto border border-slate-300 shadow-2xs">
                              <img
                                src={
                                  users?.find((u) => u.name === q.owner)?.avatar ||
                                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                                }
                                alt={q.owner || 'Owner'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* 4. Date */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-normal border-r border-slate-200">
                            {q.quoteDate}
                          </td>

                          {/* 5. Opportunity */}
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuote(q)}
                                  className="text-[#337ab7] hover:text-[#23527c] font-semibold text-xs uppercase hover:underline cursor-pointer text-left leading-tight"
                                >
                                  {q.subject || 'COMMERCIAL PROPOSAL'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuote(q)}
                                  className="w-3.5 h-3.5 rounded-full bg-[#337ab7] hover:bg-[#23527c] text-white flex items-center justify-center text-[9px] font-serif font-bold italic shrink-0 cursor-pointer shadow-2xs ml-auto"
                                  title="Opportunity Details"
                                >
                                  i
                                </button>
                              </div>
                              <div>{getStageBadge(q)}</div>
                            </div>
                          </td>

                          {/* 6. Customer */}
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="space-y-1">
                              {/* Customer Name */}
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-red-500 text-xs shrink-0">🛡</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedQuote(q)}
                                    className="text-[#337ab7] hover:text-[#23527c] font-bold text-xs hover:underline cursor-pointer text-left uppercase truncate"
                                  >
                                    {custName}
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQuote(q)}
                                  className="w-3.5 h-3.5 rounded-full bg-[#337ab7] hover:bg-[#23527c] text-white flex items-center justify-center text-[9px] font-serif font-bold italic shrink-0 cursor-pointer shadow-2xs ml-auto"
                                  title="Customer Details"
                                >
                                  i
                                </button>
                              </div>

                              {/* Primary Contact Person */}
                              {contactPerson && (
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[#b97a3a] text-xs shrink-0">👤</span>
                                    <span className="text-[#337ab7] font-semibold text-xs truncate">
                                      {contactPerson}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedQuote(q)}
                                    className="w-3.5 h-3.5 rounded-full bg-[#337ab7] hover:bg-[#23527c] text-white flex items-center justify-center text-[9px] font-serif font-bold italic shrink-0 cursor-pointer shadow-2xs ml-auto"
                                    title="Contact Details"
                                  >
                                    i
                                  </button>
                                </div>
                              )}

                              {/* Contact Phone / WhatsApp */}
                              {phoneNum && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.543zm6.26-4.089l.363.216c1.548.92 3.33 1.407 5.153 1.408 5.485 0 9.948-4.462 9.95-9.948.002-2.66-1.032-5.161-2.91-7.04-1.879-1.879-4.38-2.914-7.04-2.914-5.486 0-9.949 4.462-9.951 9.948-.001 1.877.514 3.707 1.492 5.297l.237.385-1.01 3.687 3.719-.993z" />
                                    </svg>
                                  </span>
                                  <a
                                    href={`https://wa.me/${phoneNum.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#337ab7] hover:text-[#23527c] hover:underline font-medium"
                                  >
                                    {phoneNum}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 7. Amount */}
                          <td className="py-3 px-3 text-right font-normal text-slate-700 whitespace-nowrap border-r border-slate-200">
                            {(q.subtotal || (q.totalAmount ? q.totalAmount / 1.05 : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 8. VAT */}
                          <td className="py-3 px-3 text-right font-normal text-slate-700 whitespace-nowrap border-r border-slate-200">
                            {(q.vatAmount || (q.totalAmount ? (q.totalAmount / 1.05) * 0.05 : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 9. Total */}
                          <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap border-r border-slate-200">
                            {(q.totalAmount || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 10. Status */}
                          <td className="py-3 px-2 text-center border-r border-slate-200">
                            {getStatusBadge(q.status)}
                          </td>

                          {/* 11. Actions (Gear Menu Dropdown matching exact Cezcon CRM reference) */}
                          <td className="py-3 px-2 text-center relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(isDropdownOpen ? null : q.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#008080] hover:bg-[#006666] text-white rounded text-[11px] font-medium shadow-2xs cursor-pointer transition select-none"
                              title="Quotation Actions"
                            >
                              <Settings className="w-3.5 h-3.5 text-white" />
                              <span className="text-white text-[10px] leading-none">▾</span>
                            </button>

                            {/* Action Dropdown Menu */}
                            {isDropdownOpen && (
                              <div
                                ref={actionDropdownRef}
                                className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#d2d6de] rounded-[3px] shadow-[0_6px_12px_rgba(0,0,0,0.175)] z-50 py-1.5 text-left text-xs font-normal"
                              >
                                {/* 1. Open in new tab */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    window.open(`/sales?tab=quotations&quoteId=${q.id}`, '_blank');
                                  }}
                                  className="w-full px-3.5 py-1.5 flex items-center gap-2.5 text-[#333333] hover:bg-[#f5f5f5] transition cursor-pointer text-xs font-normal"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Open in new tab</span>
                                </button>

                                {/* 2. View */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setSelectedQuote(q);
                                  }}
                                  className="w-full px-3.5 py-1.5 flex items-center gap-2.5 text-[#333333] hover:bg-[#f5f5f5] transition cursor-pointer text-xs font-normal"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                                  <span>View</span>
                                </button>

                                {/* 3. Create Proforma Invoice */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleOpenProforma(q);
                                  }}
                                  className="w-full px-3.5 py-1.5 flex items-center gap-2.5 text-[#333333] hover:bg-[#f5f5f5] transition cursor-pointer text-xs font-normal"
                                >
                                  <Contact className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Create Proforma Invoice</span>
                                </button>

                                {/* 4. Revise */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleOpenRevise(q);
                                  }}
                                  className="w-full px-3.5 py-1.5 flex items-center gap-2.5 text-[#333333] hover:bg-[#f5f5f5] transition cursor-pointer text-xs font-normal"
                                >
                                  <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Revise</span>
                                </button>

                                {/* 5. Edit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleStartEdit(q);
                                  }}
                                  className="w-full px-3.5 py-1.5 flex items-center gap-2.5 text-[#333333] hover:bg-[#f5f5f5] transition cursor-pointer text-xs font-normal"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Edit</span>
                                </button>

                                {/* 6. Delete */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleDelete(q);
                                  }}
                                  className="w-full px-3.5 py-1.5 flex items-center gap-2.5 text-[#333333] hover:bg-[#f5f5f5] transition cursor-pointer text-xs font-normal"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
              <div>
                Showing {paginatedQuotations.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
                {Math.min(currentPage * rowsPerPage, filteredQuotations.length)} of {filteredQuotations.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors',
                      currentPage === pageNum
                        ? 'bg-[#008080] text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* EXACT CEZCON CRM DELETE CONFIRMATION POPUP */}
      {quoteToDelete && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-start justify-center pt-10 sm:pt-14 p-4 animate-in fade-in duration-100">
          <div className="bg-[#2d2d2d] text-white rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-6 w-[400px] max-w-full border border-neutral-700/60 animate-in zoom-in-95 duration-150">
            {/* Title */}
            <h3 className="text-xs font-semibold text-neutral-200 mb-2 tracking-tight">
              www.cezconcrm.cloud says
            </h3>

            {/* Body Message */}
            <p className="text-xs text-neutral-300 mb-6 font-normal">
              Are you sure, you want to delete this record?.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (quoteToDelete) {
                    deleteQuotation(quoteToDelete.id);
                    if (selectedQuote?.id === quoteToDelete.id) {
                      handleCloseOverview();
                    }
                    setQuoteToDelete(null);
                  }
                }}
                className="px-6 py-1.5 bg-[#e5d873] hover:bg-[#d8cb65] text-neutral-900 rounded-full text-xs font-bold transition-colors shadow-xs cursor-pointer select-none"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-5 py-1.5 bg-[#3e3b2b] hover:bg-[#4a4734] text-[#e5d873] rounded-full text-xs font-semibold transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE VOUCHER MODAL */}
      <QuotationVoucherModal
        isOpen={!!quoteForVoucher}
        onClose={() => setQuoteForVoucher(null)}
        quotation={quoteForVoucher}
        format={selectedPrintFormat}
      />
    </div>
  );
}
