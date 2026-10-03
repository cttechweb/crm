'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, Building2, Phone, Mail, Globe, MapPin, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CrmQuotation } from '@/types/enterprise-crm';

interface QuotationVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: CrmQuotation | null;
}

export function QuotationVoucherModal({
  isOpen,
  onClose,
  quotation,
}: QuotationVoucherModalProps) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="flex flex-col h-full max-h-[90vh] bg-white text-slate-900 rounded-2xl overflow-hidden">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Printable Quotation Voucher</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              {quotation.quotationNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 print:p-0 bg-white" ref={printContentRef}>
          <div className="max-w-4xl mx-auto space-y-8 print:space-y-6">
            {/* Header / Brand */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-indigo-900 pb-6 gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-md">
                    CT
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                      COOL TECHNOLOGIES LLC
                    </h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">
                      HVAC & Engineering Solutions • Smart Enterprise Systems
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Office 402, Business Bay, Dubai, United Arab Emirates
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +971 4 398 2211 • +971 50 123 4567
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    sales@cooltechuae.com • www.cooltechuae.com
                  </p>
                  <p className="font-semibold text-slate-800 pt-1 font-mono">
                    UAE TRN / Tax No: <span className="text-indigo-900">10049281900003</span>
                  </p>
                </div>
              </div>

              {/* Quotation Document Badge */}
              <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[240px]">
                <span className="text-xs font-black tracking-widest text-indigo-700 uppercase block mb-1">
                  COMMERCIAL QUOTATION
                </span>
                <p className="text-xl font-mono font-black text-slate-900">{quotation.quotationNumber}</p>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-semibold text-slate-800">{quotation.quoteDate || quotation.createdDate}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-400">Valid Until:</span>
                    <span className="font-semibold text-slate-800">{quotation.validUntil}</span>
                  </div>
                  {quotation.opportunityCode && (
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span className="text-slate-400">Ref Code:</span>
                      <span className="font-mono text-slate-800">{quotation.opportunityCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To & Project Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  QUOTED TO (CLIENT):
                </span>
                <h3 className="font-bold text-base text-slate-900">{quotation.customer}</h3>
                {quotation.contactPerson && (
                  <p className="text-xs text-slate-600 mt-1 font-medium">Attn: {quotation.contactPerson}</p>
                )}
                {quotation.billingAddress && (
                  <p className="text-xs text-slate-600 mt-1">{quotation.billingAddress}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {quotation.phone && <span>Tel: {quotation.phone}</span>}
                  {quotation.email && <span>Email: {quotation.email}</span>}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  QUOTATION SPECIFICATIONS:
                </span>
                <div className="space-y-1 text-xs text-slate-700">
                  <p>
                    <span className="text-slate-500">Subject / Project:</span>{' '}
                    <span className="font-semibold text-slate-900">{quotation.subject || 'Commercial Proposal'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Prepared By:</span>{' '}
                    <span className="font-medium text-slate-800">{quotation.assignedTo || 'Sales Department'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Department:</span>{' '}
                    <span className="text-slate-800">{quotation.department || 'Commercial Projects'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Currency:</span>{' '}
                    <span className="font-bold text-slate-900">AED (United Arab Emirates Dirham)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-4">Item Description & Specifications</th>
                    <th className="py-3 px-3 text-right w-20">Qty</th>
                    <th className="py-3 px-3 text-right w-20">Unit</th>
                    <th className="py-3 px-4 text-right w-28">Unit Price (AED)</th>
                    <th className="py-3 px-3 text-right w-20">Disc %</th>
                    <th className="py-3 px-4 text-right w-32">Total (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {quotation.items && quotation.items.length > 0 ? (
                    quotation.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.productName || item.description}</p>
                          {item.productName && item.description && (
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{item.description}</p>
                          )}
                          {item.sku && <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">{item.quantity}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{item.unit || 'pcs'}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {Number(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {item.discountPercentage ? `${item.discountPercentage}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                          {Number(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                        No items specified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Total Amount:</span>
                  <span className="font-mono font-medium">
                    AED {(quotation.grossAmount || quotation.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {Boolean(quotation.discountAmount) && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Deduction:</span>
                    <span className="font-mono font-medium">
                      - AED {Number(quotation.discountAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono">
                    AED {(quotation.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>UAE VAT (5%):</span>
                  <span className="font-mono">
                    AED {(quotation.vatAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2 border-t-2 border-slate-300 flex justify-between text-sm font-black text-indigo-900">
                  <span>Net Grand Total:</span>
                  <span className="font-mono text-base">
                    AED {(quotation.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Terms & Conditions of Supply
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-800">1. Payment Terms:</span>{' '}
                  {quotation.paymentTerms || '30% Advance with LPO, 70% against delivery / 30 days.'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">2. Delivery:</span>{' '}
                  {quotation.deliveryTerms || 'Within 5-7 working days from confirmed order.'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">3. Warranty:</span>{' '}
                  {quotation.warrantyTerms || quotation.warranty || '1 Year Standard Comprehensive Warranty.'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">4. Quotation Validity:</span>{' '}
                  {quotation.validityTerms || `Valid until ${quotation.validUntil}`}
                </div>
              </div>

              {quotation.customerNotes && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-0.5">Special Remarks / Scope Notes:</span>
                  <p className="whitespace-pre-wrap">{quotation.customerNotes}</p>
                </div>
              )}
            </div>

            {/* Signatures & Acceptance Box */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
              <div className="space-y-12">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    For Cool Technologies LLC
                  </span>
                  <p className="text-slate-500 text-[11px]">Authorized Signature & Stamp</p>
                </div>
                <div className="border-b border-slate-400 w-48"></div>
              </div>

              <div className="space-y-12 text-right sm:text-left">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Client Acceptance & Confirmation
                  </span>
                  <p className="text-slate-500 text-[11px]">Authorized Signatory, Date & Company Stamp</p>
                </div>
                <div className="border-b border-slate-400 w-48 ml-auto sm:ml-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
