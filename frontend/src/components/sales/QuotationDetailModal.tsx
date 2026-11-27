'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  Shield,
  User,
  Phone,
  Mail,
  Printer,
  Edit2,
  Edit3,
  RotateCw,
  Trash2,
  ChevronDown,
  ArrowLeft,
  DollarSign,
  Handshake,
  Receipt,
  Calculator,
  ThumbsUp,
  Image as ImageIcon,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmQuotation } from '@/types/enterprise-crm';
import { authMockService } from '@/services/authMockService';

interface QuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: CrmQuotation | null;
  onEdit?: (quote: CrmQuotation) => void;
  onPrintVoucher?: (quote: CrmQuotation, format?: string) => void;
  onPrint?: (quote: CrmQuotation) => void;
}

export function QuotationDetailModal({
  isOpen,
  onClose,
  quotation,
  onEdit,
  onPrintVoucher,
  onPrint,
}: QuotationDetailModalProps) {
  const { updateQuotation, deleteQuotation, addQuotation, users, customers, salesOpportunities } = useEnterpriseCrm();
  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;
  const [isPrintFormatDropdownOpen, setIsPrintFormatDropdownOpen] = useState(false);

  if (!isOpen || !quotation) return null;

  const matchedCust = customers?.find(
    (c) =>
      (quotation.customerId && c.id === quotation.customerId) ||
      (c.customerName && c.customerName.toLowerCase() === (quotation.customer || '').toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase() === (quotation.customer || '').toLowerCase())
  );

  const matchedOpp = salesOpportunities?.find(
    (o) =>
      (quotation.opportunityId && o.id === quotation.opportunityId) ||
      (quotation.opportunityCode && o.opportunityCode === quotation.opportunityCode) ||
      (o.title && quotation.subject && o.title.toLowerCase() === quotation.subject.toLowerCase())
  );

  const ownerName = (quotation.owner || currentUser?.name || 'JISMON JOSE').toUpperCase();
  const ownerUser = users?.find((u) => u.name.toLowerCase() === ownerName.toLowerCase());
  const ownerAvatar =
    ownerUser?.avatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

  const customerName = (quotation.customer || matchedCust?.customerName || matchedCust?.companyName || 'ADC ENERGY SYSTEMS LLC').toUpperCase();
  const contactPerson = quotation.contactPerson || matchedCust?.contactPerson || ((matchedCust as any)?.contacts && (matchedCust as any).contacts[0]?.name) || 'Mr. KALIM ANSARI';
  const contactMobile = quotation.phone || matchedCust?.phone || ((matchedCust as any)?.contacts && (matchedCust as any).contacts[0]?.phone) || '+97144457100';

  const subtotal = quotation.subtotal || (quotation.totalAmount ? quotation.totalAmount / 1.05 : 25440);
  const vatAmount = quotation.vatAmount || (quotation.totalAmount ? (quotation.totalAmount / 1.05) * 0.05 : 1272);
  const totalAmount = quotation.totalAmount || (subtotal + vatAmount);
  const discountAmount = quotation.discountAmount || 0;
  const adjustmentAmount = 0;

  const quoteNumber = quotation.quotationNumber || 'CTSQ#4363';
  const quoteDate = quotation.quoteDate || '05-10-2026';
  const oppTitle = (matchedOpp?.title || quotation.subject || 'WINDOW AC UNITS').toUpperCase();

  // Dynamic Item List or Realistic Sample Items for the quotation
  const items = quotation.items && quotation.items.length > 0 ? quotation.items : [
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

  const handleRevise = () => {
    const revNum = `${quoteNumber}-R1`;
    const revised: CrmQuotation = {
      ...quotation,
      id: `qtn-rev-${Date.now()}`,
      quotationNumber: revNum,
      status: 'Draft',
    };
    addQuotation(revised);
    alert(`Successfully created revision: ${revNum}`);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete quotation ${quoteNumber}?`)) {
      deleteQuotation(quotation.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-2 sm:p-4 font-sans text-xs">
      <div className="bg-white rounded-xs shadow-2xl border border-slate-300 w-full max-w-6xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
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
            onClick={onClose}
            className="bg-[#d9534f] hover:bg-[#c9302c] text-white w-5 h-5 rounded-xs flex items-center justify-center cursor-pointer transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[82vh] space-y-4 bg-white">
          {/* TOP SECTION: 2-COLUMN GRID (Quotation Details Left, Overview Cards Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT BOX: Quotation Details Table (5 Cols) */}
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
                      <span>{quotation.status || 'Approved'}</span>
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

            {/* RIGHT BOX: Overview 6 Metric Cards (7 Cols) */}
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
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Print Format Dropdown */}
            <div className="relative inline-block">
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
                          if (onPrintVoucher) onPrintVoucher(quotation, fmt);
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
              onClick={() => onPrintVoucher && onPrintVoucher(quotation, 'Print in USD')}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print in USD</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => onPrintVoucher && onPrintVoucher(quotation, 'Print with Quantity')}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Revise */}
            <button
              type="button"
              onClick={handleRevise}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#008080] hover:bg-[#006666] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Revise</span>
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit && onEdit(quotation);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#337ab7] hover:bg-[#286090] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
