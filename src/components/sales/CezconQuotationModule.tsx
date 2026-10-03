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
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { filterQuotationsByScope, canConvertQuotation } from '@/services/crmDataScopeService';
import { CrmQuotation } from '@/types/enterprise-crm';
import { QuotationDetailModal } from '@/components/sales/QuotationDetailModal';
import { QuotationVoucherModal } from '@/components/sales/QuotationVoucherModal';
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

  // View state: Table list vs Full-Page Add/Edit View
  const [isCreating, setIsCreating] = useState(initialCreate);
  const [quoteToEdit, setQuoteToEdit] = useState<CrmQuotation | null>(null);

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

  // List Filters State matching exact Cezcon CRM
  const [filterOwner, setFilterOwner] = useState<string>('All');
  const [filterDateRange, setFilterDateRange] = useState<string>('04-09-2026 - 03-10-2026');
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

  // Detail & Voucher Modal States
  const [selectedQuote, setSelectedQuote] = useState<CrmQuotation | null>(null);
  const [quoteForVoucher, setQuoteForVoucher] = useState<CrmQuotation | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

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
    setQuoteToEdit(null);
    initForm(null);
    setIsCreating(true);
  };

  const handleStartEdit = (q: CrmQuotation) => {
    setQuoteToEdit(q);
    initForm(q);
    setIsCreating(true);
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
      owner: quoteToEdit?.owner || currentUser?.name || 'Alex Rivera',
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
    const subj = (quote.subject || '').toUpperCase();
    if (subj.includes('SPLIT AC')) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#CA8A04]">
          Enquiry
        </span>
      );
    }
    if (subj.includes('ICE MAKER') || quote.status === 'Approved') {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#16A34A]">
          Offer Confirmed
        </span>
      );
    }
    if (subj.includes('WASHING') || subj.includes('DISPENSER')) {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#0284C7]">
          On Review
        </span>
      );
    }
    return (
      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#2563EB]">
        Offer Sent
      </span>
    );
  };

  const getStatusBadge = (status: CrmQuotation['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#0284C7] text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Pending Approval
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Sent
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Accepted
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Converted
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-500 text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Draft
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-2xs">
            <Edit2 className="w-2.5 h-2.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-600 text-white">
            {status}
          </span>
        );
    }
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
    if (confirm(`Are you sure you want to delete quotation ${quote.quotationNumber}?`)) {
      deleteQuotation(quote.id);
    }
  };

  return (
    <div className="w-full font-sans text-xs">
      {/* ========================================================================= */}
      {/* VIEW 1: FULL PAGE ADD / EDIT QUOTATION (EXACT CEZCON CRM IMAGE 2) */}
      {/* ========================================================================= */}
      {isCreating ? (
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
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={formQuoteDate}
                      onChange={(e) => setFormQuoteDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
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
      ) : (
        /* ========================================================================= */
        /* VIEW 2: FULL PAGE QUOTATION LIST & 3-ROW FILTER (EXACT CEZCON CRM IMAGE 1) */
        /* ========================================================================= */
        <div className="space-y-3">
          {/* Top Filter Criteria Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm p-3.5 shadow-2xs space-y-3">
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

          {/* Table Section */}
          <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-2xs overflow-hidden">
            {/* Header Bar with Title and Green + QUOTATION Button */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> Quotation
              </h2>

              <button
                type="button"
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition select-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ QUOTATION</span>
              </button>
            </div>

            {/* Secondary Toolbar: Shows [ 10 ⌄ ] Rows and Search Input */}
            <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
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
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                    <th className="p-2.5 w-12 text-center text-slate-600 font-bold">SL.No</th>
                    <th className="p-2.5 min-w-[120px] text-slate-600 font-bold">Quotation#</th>
                    <th className="p-2.5 w-16 text-center text-slate-600 font-bold">Owner</th>
                    <th className="p-2.5 w-28 text-slate-600 font-bold">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                        <span>Date</span>
                        <ChevronDown className="w-3 h-3 text-blue-600" />
                      </div>
                    </th>
                    <th className="p-2.5 min-w-[200px] text-slate-600 font-bold">Opportunity</th>
                    <th className="p-2.5 min-w-[240px] text-slate-600 font-bold">Customer</th>
                    <th className="p-2.5 w-24 text-right text-slate-600 font-bold">Amount</th>
                    <th className="p-2.5 w-20 text-right text-slate-600 font-bold">VAT</th>
                    <th className="p-2.5 w-24 text-right text-slate-600 font-bold">Total</th>
                    <th className="p-2.5 w-28 text-center text-slate-600 font-bold">Status</th>
                    <th className="p-2.5 w-20 text-center text-slate-600 font-bold">Actions</th>
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

                      return (
                        <tr key={q.id} className="hover:bg-[#F0FDF4]/40 transition-colors">
                          {/* 1. SL.No */}
                          <td className="p-2.5 text-center text-slate-600 font-medium">
                            {slNo}
                          </td>

                          {/* 2. Quotation# */}
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-[10px] font-bold shrink-0">
                                📄
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedQuote(q)}
                                className="text-[#2563EB] hover:underline font-bold text-xs cursor-pointer text-left"
                              >
                                {q.quotationNumber}
                              </button>
                            </div>
                          </td>

                          {/* 3. Owner */}
                          <td className="p-2.5 text-center">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0 mx-auto border border-slate-300">
                              <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                                alt={q.owner || 'Owner'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* 4. Date */}
                          <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                            {q.quoteDate}
                          </td>

                          {/* 5. Opportunity */}
                          <td className="p-2.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  onClick={() => setSelectedQuote(q)}
                                  className="text-[#2563EB] font-bold text-xs uppercase hover:underline cursor-pointer"
                                >
                                  {q.subject || 'COMMERCIAL PROPOSAL'}
                                </span>
                                <Info
                                  onClick={() => setSelectedQuote(q)}
                                  className="w-3.5 h-3.5 text-blue-500 cursor-pointer shrink-0 hover:text-blue-700"
                                />
                              </div>
                              {getStageBadge(q)}
                            </div>
                          </td>

                          {/* 6. Customer */}
                          <td className="p-2.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                                <span
                                  onClick={() => setSelectedQuote(q)}
                                  className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
                                >
                                  {q.customer}
                                </span>
                                <Info
                                  onClick={() => setSelectedQuote(q)}
                                  className="w-3 h-3 text-blue-500 cursor-pointer shrink-0 hover:text-blue-700"
                                />
                              </div>

                              {q.contactPerson && (
                                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>{q.contactPerson}</span>
                                </div>
                              )}

                              {q.phone && (
                                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5 text-emerald-500" />
                                  <span>{q.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 7. Amount */}
                          <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                            {(q.subtotal || (q.totalAmount ? q.totalAmount / 1.05 : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 8. VAT */}
                          <td className="p-2.5 text-right font-medium text-slate-600 whitespace-nowrap">
                            {(q.vatAmount || (q.totalAmount ? (q.totalAmount / 1.05) * 0.05 : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 9. Total */}
                          <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                            {(q.totalAmount || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 10. Status */}
                          <td className="p-2.5 text-center">
                            {getStatusBadge(q.status)}
                          </td>

                          {/* 11. Actions (Gear Menu Dropdown) */}
                          <td className="p-2.5 text-center relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionDropdownId(isDropdownOpen ? null : q.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-2xs cursor-pointer transition select-none"
                              title="Quotation Actions"
                            >
                              <Settings className="w-3 h-3" />
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>

                            {/* Action Dropdown Menu */}
                            {isDropdownOpen && (
                              <div
                                ref={actionDropdownRef}
                                className="absolute right-2 top-10 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-left text-xs font-normal"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setSelectedQuote(q);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>View Overview</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    setQuoteForVoucher(q);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Print Voucher</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleStartEdit(q);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Edit Quotation</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleConvertToOrder(q);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Convert to Order</span>
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionDropdownId(null);
                                    handleDelete(q);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete Quotation</span>
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
        </div>
      )}

      {/* DETAIL & LIFECYCLE MODAL */}
      <QuotationDetailModal
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        quotation={selectedQuote}
        onEdit={(quote: CrmQuotation) => {
          setSelectedQuote(null);
          handleStartEdit(quote);
        }}
        onPrintVoucher={(quote: CrmQuotation) => {
          setQuoteForVoucher(quote);
        }}
      />

      {/* PRINTABLE VOUCHER MODAL */}
      <QuotationVoucherModal
        isOpen={!!quoteForVoucher}
        onClose={() => setQuoteForVoucher(null)}
        quotation={quoteForVoucher}
      />
    </div>
  );
}
