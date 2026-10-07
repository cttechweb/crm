'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Calendar,
  Settings,
  ArrowLeft,
  Check,
  Upload,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmQuotation } from '@/types/enterprise-crm';
import { authMockService } from '@/services/authMockService';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationToEdit?: CrmQuotation | null;
  onSaved?: (quote: CrmQuotation) => void;
}

export function QuotationModal({
  isOpen,
  onClose,
  quotationToEdit,
  onSaved,
}: QuotationModalProps) {
  const {
    salesOpportunities,
    quotations,
    addQuotation,
    updateQuotation,
    updateOpportunity,
    customers,
  } = useEnterpriseCrm();

  const currentUser = authMockService.getCurrentUser();

  // Form State
  const [quotationNumber, setQuotationNumber] = useState('');
  const [opportunityId, setOpportunityId] = useState('');
  const [opportunityCode, setOpportunityCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [fileName, setFileName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [vatRate, setVatRate] = useState<number>(5);
  const [quoteDate, setQuoteDate] = useState('');
  const [quotationType, setQuotationType] = useState('File Upload');
  const [vatType, setVatType] = useState<'With VAT' | 'Without VAT' | 'Zero VAT'>('With VAT');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [adjustment, setAdjustment] = useState<number | ''>('');
  const [updateOpportunityAmount, setUpdateOpportunityAmount] = useState<boolean>(true);

  // Synchronize on open
  useEffect(() => {
    if (!isOpen) return;

    if (quotationToEdit) {
      setQuotationNumber(quotationToEdit.quotationNumber);
      setOpportunityId(quotationToEdit.opportunityId || '');
      setOpportunityCode(quotationToEdit.opportunityCode || '');
      setCustomerName(quotationToEdit.customer || '');
      setContactPerson(quotationToEdit.contactPerson || '');
      setPhone(quotationToEdit.phone || '');
      setQuoteDate(quotationToEdit.quoteDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
      setDescription(quotationToEdit.subject || '');
      setAmount(quotationToEdit.subtotal || quotationToEdit.totalAmount || '');
      setDiscount(quotationToEdit.discountAmount || 0);
      setVatRate(quotationToEdit.vatRate || 5);
      setVatType(quotationToEdit.vatAmount && quotationToEdit.vatAmount > 0 ? 'With VAT' : 'With VAT');
      setAdjustment(0);
      setFileName('');
      setQuotationType('File Upload');
    } else {
      // Auto-generate fresh quote code like CTSQ#4351
      const randNum = Math.floor(4300 + Math.random() * 200);
      setQuotationNumber(`CTSQ#${randNum}`);

      const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      setQuoteDate(todayStr);

      setOpportunityId('');
      setOpportunityCode('');
      setCustomerName('');
      setContactPerson('');
      setPhone('');
      setFileName('');
      setAmount('');
      setDiscount('');
      setAdjustment('');
      setVatRate(5);
      setVatType('With VAT');
      setDescription('');
      setQuotationType('File Upload');
      setUpdateOpportunityAmount(true);
    }
  }, [isOpen, quotationToEdit]);

  // Opportunity Selection Handler
  const handleOpportunitySelect = (oppVal: string) => {
    setOpportunityCode(oppVal);
    const found = salesOpportunities?.find(
      (o) => o.opportunityCode === oppVal || o.id === oppVal || o.title === oppVal
    );
    if (found) {
      setOpportunityId(found.id);
      if (found.title) setDescription(found.title);
      if (found.customer) setCustomerName(found.customer);
      if (found.contactPerson) setContactPerson(found.contactPerson);
      if (found.phone) setPhone(found.phone);
      if (found.amount && !amount) setAmount(found.amount);
    }
  };

  // Calculations
  const numAmount = Number(amount) || 0;
  const numDiscount = Number(discount) || 0;
  const numAdjustment = Number(adjustment) || 0;
  const subtotalAfterDiscount = Math.max(0, numAmount - numDiscount);

  const calculatedVat =
    vatType === 'With VAT' ? Math.round(subtotalAfterDiscount * (vatRate / 100) * 100) / 100 : 0;

  const grandTotal = subtotalAfterDiscount + calculatedVat + numAdjustment;

  // File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationNumber) return;

    const finalQuote: CrmQuotation = {
      id: quotationToEdit?.id || `qtn-${Date.now()}`,
      slNo: quotationToEdit?.slNo || (quotations?.length || 0) + 1,
      quotationNumber,
      opportunityId: opportunityId || undefined,
      opportunityCode: opportunityCode || undefined,
      customer: customerName || 'Direct Customer',
      contactPerson: contactPerson || undefined,
      phone: phone || undefined,
      subject: description || 'Commercial Proposal',
      quoteDate,
      validUntil: quoteDate,
      subtotal: numAmount,
      discountAmount: numDiscount,
      vatRate,
      vatAmount: calculatedVat,
      totalAmount: grandTotal,
      status: quotationToEdit?.status || 'Approved',
      owner: quotationToEdit?.owner || currentUser?.name || 'shaheer',
      itemsCount: 1,
      items: [
        {
          id: `item-${Date.now()}`,
          productName: description || 'Commercial Supply & Installation',
          description: description || 'Commercial Proposal',
          quantity: 1,
          unitPrice: numAmount,
          discount: numDiscount,
          taxRate: vatRate,
          taxAmount: calculatedVat,
          totalAmount: grandTotal,
        },
      ],
    };

    if (quotationToEdit) {
      updateQuotation(finalQuote.id, finalQuote);
    } else {
      addQuotation(finalQuote);
    }

    // If updateOpportunityAmount is checked, update the linked opportunity
    if (updateOpportunityAmount && opportunityId) {
      updateOpportunity(opportunityId, {
        amount: grandTotal,
      });
    }

    if (onSaved) {
      onSaved(finalQuote);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Cezcon Add Quotation Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-sm shadow-xl z-10 overflow-hidden flex flex-col font-sans text-xs border border-slate-200 animate-in zoom-in-95 duration-150 my-auto">
        {/* Top Header Bar */}
        <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-800 text-[13px]">
              {quotationToEdit ? 'Edit Quotation' : 'Add Quotation'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body: 2-Column Exact Cezcon Grid */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-3.5 text-[11px]">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-3.5">
              {/* Quotation Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Quotation Number <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
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
                  value={opportunityCode}
                  onChange={(e) => handleOpportunitySelect(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Opportunity</option>
                  <option value="CTEQ#7016">CTEQ#7016 - SUPPLY OF SPLIT AC</option>
                  <option value="CTEQ#7022">CTEQ#7022 - SUPPLY OF ICE MAKERS</option>
                  <option value="CTEQ#7031">CTEQ#7031 - SUPPLY OF WASHING MACHINE AND DISPENSER</option>
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
                    {fileName || 'No file chosen'}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
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
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
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
            <div className="space-y-3.5">
              {/* Quotation Date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Quotation Date</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
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
                    value={quotationType}
                    onChange={(e) => setQuotationType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="File Upload">File Upload</option>
                    <option value="Standard Proposal">Standard Proposal</option>
                    <option value="Project Tender">Project Tender</option>
                    <option value="Maintenance Contract">Maintenance Contract</option>
                  </select>

                  <select
                    value={vatType}
                    onChange={(e) => setVatType(e.target.value as any)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
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
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value === '' ? '' : Number(e.target.value))}
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
                checked={updateOpportunityAmount}
                onChange={(e) => setUpdateOpportunityAmount(e.target.checked)}
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
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
