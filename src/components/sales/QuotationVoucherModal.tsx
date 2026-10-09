'use client';

import React, { useState, useRef } from 'react';
import { X, Printer, Download, ArrowLeft, FileText } from 'lucide-react';
import { CrmQuotation } from '@/types/enterprise-crm';

interface QuotationVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: CrmQuotation | null;
  format?: string;
}

export function QuotationVoucherModal({
  isOpen,
  onClose,
  quotation,
  format = 'Print with Quantity',
}: QuotationVoucherModalProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUSD = format === 'Print in USD';
  const showQty = !format.includes('without Quantity');
  const showPrice = !format.includes('without Item Price') && !format.includes('without Unit Price');
  const showTotal = !format.includes('without Total Price') || format.includes('with Total Price');

  // Calculations
  const qAmt = typeof quotation.grossAmount === 'number' && quotation.grossAmount > 0
    ? quotation.grossAmount
    : (quotation.subtotal || quotation.totalAmount || 38500);
  const qVatRate = typeof quotation.vatRate === 'number' ? quotation.vatRate : 5;
  const qVat = typeof quotation.vatAmount === 'number' && quotation.vatAmount > 0
    ? quotation.vatAmount
    : (qAmt * qVatRate) / 100;
  const qGrandTotal = typeof quotation.totalAmount === 'number' && quotation.totalAmount > 0
    ? quotation.totalAmount
    : (qAmt + qVat);

  const displayAmt = isUSD ? qAmt / 3.6725 : qAmt;
  const displayVat = isUSD ? qVat / 3.6725 : qVat;
  const displayGrandTotal = isUSD ? qGrandTotal / 3.6725 : qGrandTotal;
  const currencyLabel = isUSD ? 'USD' : 'AED';

  // Dynamic Number to Words
  const numberToWords = (num: number): string => {
    if (!num || isNaN(num) || num <= 0) return `Zero ${isUSD ? 'Dollars' : 'Dirhams'} Only`;
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
    let result = inWords(integerPart).trim() + (isUSD ? ' Dollars' : ' Dirhams');
    if (decimalPart > 0) {
      result += ' and ' + inWords(decimalPart).trim() + (isUSD ? ' Cents' : ' Fils');
    }
    return result + ' Only';
  };

  // Table items mapping
  const rawItems = quotation.items || (quotation as any).lineItems || (quotation as any).products || (quotation as any).enquiryItems;
  const tableItems = Array.isArray(rawItems) && rawItems.length > 0
    ? rawItems.map((item, idx) => {
      const q = Number((item as any).quantity || (item as any).qty) || 1;
      const p = Number((item as any).unitPrice || (item as any).price) || (qAmt / (rawItems.length * q));
      const t = Number((item as any).totalAmount || (item as any).total || (item as any).lineTotal) || (q * p);
      const displayPrice = isUSD ? p / 3.6725 : p;
      const displayTotal = isUSD ? t / 3.6725 : t;
      return {
        sl: idx + 1,
        code: (item as any).itemCode || (item as any).sku || (item as any).code || '',
        description: (item as any).productName || (item as any).description || (item as any).name || (quotation as any).opportunityTitle || quotation.subject || '',
        unit: (item as any).unit || 'Each',
        brand: (item as any).brand || '',
        qty: q,
        price: displayPrice,
        total: displayTotal,
      };
    })
    : [
      {
        sl: 1,
        code: (quotation as any).itemCode || (quotation as any).code || '',
        description: (quotation as any).opportunityTitle || quotation.subject || (quotation as any).title || '',
        unit: (quotation as any).unit || 'Each',
        brand: (quotation as any).brand || '',
        qty: 1,
        price: displayAmt,
        total: displayAmt,
      },
    ];

  const totalCols = 5 + (showQty ? 1 : 0) + (showPrice ? 1 : 0) + (showTotal ? 1 : 0);
  const summaryColSpan = Math.max(1, totalCols - (showTotal ? 1 : 0));

  const quoteNumber = quotation.quotationNumber || '';
  const customerName = quotation.customer || '';
  const contactPerson = quotation.contactPerson || (quotation as any).attn || '';
  const contactPhone = quotation.phone || (quotation as any).mobile || '';
  const quoteDate = quotation.quoteDate || quotation.createdDate || (quotation as any).date || '';
  const preparedBy = quotation.assignedTo || quotation.createdBy || quotation.owner || (quotation as any).preparedBy || '';
  const preparedByPhone = (quotation as any).preparedByMobile || (quotation as any).ownerPhone || '';
  const liveTerms = (quotation as any).termsConditions || quotation.customerNotes || quotation.notes || (quotation as any).termsAndConditions || (quotation as any).terms || '';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[9999] flex flex-col justify-start items-stretch">
      {/* Top PDF Reader Control Bar (Hidden on Print) */}
      <div className="print:hidden bg-[#323639] text-white px-4 py-2 flex items-center justify-between shadow-md z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700 cursor-pointer"
            title="Close"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold tracking-wide text-slate-100">
              {quoteNumber}_1791281149.pdf
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
            onClick={handlePrint}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="text-slate-300 hover:text-white p-1.5 rounded hover:bg-slate-700 cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-red-400 p-1.5 rounded hover:bg-slate-700 cursor-pointer ml-1"
            title="Close PDF Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Canvas Body */}
      <div className="flex-1 bg-[#525659] p-4 sm:p-8 overflow-y-auto print:p-0 print:bg-white" ref={printContentRef}>
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="bg-white text-slate-900 shadow-2xl mx-auto max-w-[840px] p-8 sm:p-12 text-xs font-sans border border-slate-300 min-h-[1100px] flex flex-col justify-between transition-transform duration-100 print:shadow-none print:border-none print:transform-none print:p-6"
        >
          <div className="space-y-6">
            {/* Top Header Section */}
            <div className="grid grid-cols-12 items-start gap-4 pb-4">
              {/* Left: Company Logo & Details */}
              <div className="col-span-5 space-y-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src="/cool-tech-official-logo.png"
                    alt="Cool Technologies - the science of cooling"
                    className="h-12 w-auto object-contain select-none"
                  />
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
                <p><span className="font-bold text-slate-800">Tel :</span> +971 2 585 0123</p>
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
                  {customerName}
                </p>
                {contactPerson ? (
                  <p className="text-[11px] text-slate-700">
                    <span className="font-medium text-slate-600">Attn :</span> {contactPerson}
                  </p>
                ) : null}
                {contactPhone ? (
                  <p className="text-[11px] text-slate-700">
                    <span className="font-medium text-slate-600">Mobile :</span> {contactPhone}
                  </p>
                ) : null}
              </div>

              {/* Right: Quotation Details */}
              <div className="col-span-5 space-y-1 text-[11px] text-slate-800">
                <div className="border-l-2 border-[#0088CC] pl-1.5 font-bold text-[#0088CC] text-xs">
                  Quotation Details
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p><span className="font-medium text-slate-600">Quotation Number :</span> <span className="font-bold">{quoteNumber}</span></p>
                  <p><span className="font-medium text-slate-600">Quotation Date :</span> <span className="font-bold">{quoteDate}</span></p>
                  {preparedBy ? (
                    <p><span className="font-medium text-slate-600">Prepared By :</span> <span className="font-bold">{preparedBy}</span></p>
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
                  {tableItems.map((item) => (
                    <tr key={item.sl}>
                      <td className="py-3 px-2.5 text-center font-medium">{item.sl}</td>
                      <td className="py-3 px-2.5 font-bold text-slate-900">{item.code}</td>
                      <td className="py-3 px-2.5 font-bold text-slate-900 uppercase">
                        {item.description}
                      </td>
                      <td className="py-3 px-2.5">{item.unit}</td>
                      <td className="py-3 px-2.5">{item.brand}</td>
                      {showQty && <td className="py-3 px-2.5 text-center font-medium">{item.qty}</td>}
                      {showPrice && (
                        <td className="py-3 px-2.5 text-right font-medium">
                          {(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}
                      {showTotal && (
                        <td className="py-3 px-2.5 text-right font-medium">
                          {(Number(item.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Summary Rows */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={summaryColSpan} className="py-1.5 px-2.5 text-right font-bold text-slate-700">
                      Total
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                      {displayAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td colSpan={summaryColSpan} className="py-1.5 px-2.5 text-right font-bold text-slate-700">
                      VAT ({qVatRate}%)
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                      {displayVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-100/80">
                    <td colSpan={summaryColSpan} className="py-2 px-2.5 text-right font-black text-[#0088CC] text-xs">
                      Grand Total in {currencyLabel}
                    </td>
                    <td className="py-2 px-2.5 text-right font-black text-[#0088CC] text-xs">
                      {displayGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Amount in words */}
            <div className="pt-1">
              <p className="font-bold text-slate-800 text-[11px]">Amount in words</p>
              <p className="font-bold text-[#0088CC] text-xs mt-0.5">
                {numberToWords(displayGrandTotal)}
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

            {/* Sign-off */}
            {preparedBy ? (
              <div className="pt-4 space-y-0.5 text-[11px]">
                <p className="font-bold text-slate-900">For COOL TECHNOLOGIES</p>
                <p className="font-bold text-slate-900 pt-1">{preparedBy}</p>
                {preparedByPhone ? <p className="text-slate-600 text-[10px]">Phone: {preparedByPhone}</p> : null}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 flex justify-end text-[10px] text-slate-500">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
