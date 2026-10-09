'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Printer,
  Download,
  Menu,
  RotateCw,
  Maximize2,
  Minus,
  Plus,
  MoreVertical,
  Link2,
} from 'lucide-react';

function numberToWords(num: number, isUSD: boolean): string {
  if (!num || isNaN(num) || num <= 0) {
    return `Zero ${isUSD ? 'US Dollars' : 'Dirhams'} Only`;
  }

  const belowTwenty = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  function helper(n: number): string {
    if (n === 0) return '';
    if (n < 20) return belowTwenty[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + belowTwenty[n % 10] : ' ');
    return belowTwenty[Math.floor(n / 100)] + ' Hundred ' + helper(n % 100);
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let words = '';
  let i = 0;
  let temp = integerPart;

  while (temp > 0) {
    if (temp % 1000 !== 0) {
      words = helper(temp % 1000) + thousands[i] + ' ' + words;
    }
    temp = Math.floor(temp / 1000);
    i++;
  }

  words = words.replace(/\s+/g, ' ').trim();
  if (!words) words = 'Zero';

  let result = words + (isUSD ? ' US Dollars' : ' Dirhams');
  if (decimalPart > 0) {
    let decWords = '';
    if (decimalPart < 20) {
      decWords = belowTwenty[decimalPart];
    } else {
      decWords = tens[Math.floor(decimalPart / 10)] + (decimalPart % 10 !== 0 ? ' ' + belowTwenty[decimalPart % 10] : '');
    }
    result += ' and ' + decWords.trim() + (isUSD ? ' Cents' : ' Fils');
  }

  return result + ' Only';
}

function getSupplierDetails(po: any) {
  const supplierName = po?.supplier || '';
  const s = supplierName.toLowerCase();

  // If PO has explicitly entered supplier contact details, use them
  let phone = po?.supplierPhone || po?.phone || '';
  let email = po?.supplierEmail || po?.email || '';
  let trn = po?.supplierTrn || po?.trn || '';
  let poBox = po?.supplierAddress || po?.supplierPoBox || '';

  if (!phone || !email || !trn || !poBox) {
    if (s.includes('super general')) {
      if (!poBox) poBox = 'PO BOX : 1430 DEIRA UNITED ARAB EMIRATES';
      if (!phone) phone = '+971 4 883 1255';
      if (!email) email = 'sales@supergeneral.com';
      if (!trn) trn = '100241723400003';
    } else if (s.includes('lutfi')) {
      if (!poBox) poBox = 'PO BOX : 1430 DEIRA UNITED ARAB EMIRATES';
      if (!phone) phone = '+97142225335';
      if (!email) email = 'info@lutfigroup.com';
      if (!trn) trn = '100241723400003';
    } else if (s.includes('al ghandi')) {
      if (!poBox) poBox = 'PO BOX : 1234 DUBAI UNITED ARAB EMIRATES';
      if (!phone) phone = '+971 4 231 0000';
      if (!email) email = 'info@alghandi.com';
      if (!trn) trn = '100341823400003';
    } else if (s.includes('eros')) {
      if (!poBox) poBox = 'PO BOX : 5678 DUBAI UNITED ARAB EMIRATES';
      if (!phone) phone = '+971 4 222 2221';
      if (!email) email = 'support@erosgroup.ae';
      if (!trn) trn = '100441923400003';
    } else {
      const clean = supplierName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!poBox) poBox = 'PO BOX : 1430 DEIRA UNITED ARAB EMIRATES';
      if (!phone) phone = '+971 4 883 1255';
      if (!email) email = `sales@${clean || 'supplier'}.com`;
      if (!trn) trn = '100241723400003';
    }
  }

  return {
    name: supplierName || 'LUTFI TRADING LLC',
    poBox,
    phone,
    email,
    trn,
  };
}

function PurchasePrintContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const poId = searchParams.get('id') || '';
  const format = searchParams.get('format') || 'Print with Quantity';
  const currencyParam = searchParams.get('currency') || 'AED';
  const isUSD = currencyParam.toUpperCase() === 'USD';
  const rateConversion = isUSD ? 3.6725 : 1.0;
  const currencyLabel = isUSD ? 'USD' : 'AED';

  const [po, setPo] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const loadPoData = () => {
    if (typeof window !== 'undefined') {
      try {
        const activeStored = localStorage.getItem('crm_active_print_po');
        if (activeStored) {
          const activePo = JSON.parse(activeStored);
          if (
            activePo &&
            (!poId ||
              String(activePo.id) === String(poId) ||
              String(activePo.poNumber).toLowerCase() === String(poId).toLowerCase())
          ) {
            setPo(activePo);
            return;
          }
        }

        const stored = localStorage.getItem('crm_purchase_orders');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            const found = list.find(
              (p: any) =>
                String(p.id) === String(poId) ||
                String(p.poNumber).toLowerCase() === String(poId).toLowerCase()
            );
            if (found) {
              setPo(found);
              return;
            }
            if (activeStored) {
              setPo(JSON.parse(activeStored));
              return;
            }
            if (poId) {
              setPo(list[0]);
              return;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      // Default Cezcon CRM LPO matching reference image exactly
      setPo({
        id: 'po_default_1',
        slNo: 1,
        owner: 'MUSTHAFA CHIRAMMAL',
        poNumber: 'CTPO#2543',
        date: '07-10-2026',
        createdAtFormatted: 'WED 07-10-2026 11:07:05 AM',
        expectedDeliveryDate: '',
        supplier: 'LUTFI TRADING LLC',
        order: '',
        reference: '',
        description: '',
        opportunityOrder: '',
        projectNumber: '',
        projectName: '',
        vatType: 'with_vat',
        attention: 'Mr. Rama Krishnan',
        preparedBy: 'MUSTHAFA CHIRAMMAL',
        preparedByMobile: '+9715688783056',
        preparedByEmail: 'im@cooltechuae.com',
        preparedByDesignation: 'Inventory Management (IM)',
        termsConditionText:
          'All product supply should be from the latest stock. Material supplied should comply 100% with the requested specifications. Products with any manufacturing defects or issues should be exchanged with new one with all cost including fright to End User. Cool Technologies is requesting you to acknowledge the receipt of this LPO and confirmation of delivery time, via return email.',
        amount: 420.0,
        vat: 21.0,
        discount: 0,
        adjustment: 0,
        totalAmount: 441.0,
        invoiceReceived: '',
        approval: 'Waiting for Final Approval',
        deliveryStatus: 'Pending',
        items: [
          {
            id: 'item_1',
            description: 'REFRIGERATOR 140 LTR SINGLE DOOR NOBEL NR140',
            code: 'NR140',
            unit: 'Pcs',
            brand: 'NOBEL',
            qty: 1,
            deliveryPending: 1,
            amount: 335.0,
            total: 335.0,
          },
          {
            id: 'item_2',
            description: 'Single Ring Infrared Cooker-Touch Control Nobel I',
            code: 'NIC101',
            unit: 'Pcs',
            brand: 'NOBEL',
            qty: 1,
            deliveryPending: 1,
            amount: 85.0,
            total: 85.0,
          },
        ],
      });
    }
  };

  useEffect(() => {
    loadPoData();

    const handleSync = () => loadPoData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('crm_purchase_orders_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('crm_purchase_orders_updated', handleSync);
    };
  }, [poId]);

  useEffect(() => {
    if (po && typeof document !== 'undefined') {
      document.title = `${po.poNumber || 'CTPO#2543'}_1791440436.pdf`;
    }
  }, [po]);

  const showQty =
    format !== 'Print without Quantity' &&
    format !== 'Print without Quantity & Item Price';
  const showRate =
    format !== 'Print without Item Price' &&
    format !== 'Print without Quantity & Item Price' &&
    format !== 'Print without Unit Price & Total Price' &&
    format !== 'Print without Unit Price & with Total Price';
  const showTotal =
    format !== 'Print without Total Price' &&
    format !== 'Print without Unit Price & Total Price';

  // Converted monetary values
  const convertedSubtotal = po ? Number(po.amount || 0) / rateConversion : 0;
  const convertedVat = po ? Number(po.vat || 0) / rateConversion : 0;
  const convertedGrandTotal = po ? Number(po.totalAmount || 0) / rateConversion : 0;

  const amountInWords = useMemo(() => {
    return numberToWords(convertedGrandTotal, isUSD);
  }, [convertedGrandTotal, isUSD]);

  if (!po) {
    return (
      <div className="min-h-screen bg-[#323639] flex items-center justify-center text-white text-sm">
        Loading document...
      </div>
    );
  }

  const supplier = getSupplierDetails(po);
  const items =
    po.items && po.items.length > 0
      ? po.items
      : po.description
      ? [
          {
            id: 'item_1',
            description: po.description,
            code: po.code || po.itemCode || '-',
            unit: po.unit || 'Each',
            brand: po.brand || '-',
            qty: po.qty || 1,
            deliveryPending: po.qty || 1,
            amount: po.amount || 0,
            total: po.amount || 0,
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-[#525659] print:bg-white text-slate-900 font-sans flex flex-col select-text">
      {/* Top Chrome PDF Viewer Header (Hidden when printing) */}
      <header className="sticky top-0 z-50 bg-[#323639] text-[#e8eaed] px-3 py-2 flex items-center justify-between shadow-md print:hidden text-xs select-none border-b border-[#202124]">
        {/* Left: Hamburger + Filename */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 hover:bg-[#4a4d51] rounded text-[#e8eaed] transition cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-normal text-xs text-[#f1f3f4] tracking-wide">
            {po.poNumber || 'CTPO#2543'}_1791440436.pdf
          </span>
        </div>

        {/* Center: Pagination & Zoom */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-[#202124] rounded text-white font-mono">1</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">1</span>
          </div>

          <span className="text-slate-500 hidden sm:inline">|</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer"
              title="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono w-10 text-center">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer"
              title="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-slate-500 hidden sm:inline">|</span>

          <button
            type="button"
            className="p-1.5 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer hidden md:block"
            title="Fit to page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer hidden md:block"
            title="Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Print, Download, More */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="p-1.5 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer hidden sm:block"
            title="Copy Link"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-[#4a4d51] rounded text-slate-300 hover:text-white cursor-pointer"
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Body: Left Thumbnail Sidebar + Center Printable Document */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnail Sidebar (Exact Chrome PDF style) */}
        {showSidebar && (
          <aside className="w-36 sm:w-44 bg-[#2a2d30] border-r border-[#202124] p-3 flex flex-col items-center gap-2 overflow-y-auto print:hidden select-none shrink-0">
            <div className="w-24 sm:w-28 bg-white rounded shadow border-2 border-[#8ab4f8] p-1.5 cursor-pointer hover:opacity-95 transition flex flex-col gap-1 text-[4px] leading-tight text-slate-600 overflow-hidden h-36">
              <div className="flex justify-between items-center border-b border-slate-200 pb-0.5">
                <img
                  src="/cool-tech-official-logo.png"
                  alt="Cool Technologies"
                  className="h-3 w-auto object-contain"
                />
                <span className="font-black text-[5px]">PURCHASE ORDER</span>
              </div>
              <div className="text-[3.5px] space-y-0.5">
                <div className="font-bold">{supplier.name}</div>
                <div>PO: {po.poNumber}</div>
              </div>
              <div className="bg-slate-300 h-1 w-full my-0.5"></div>
              <div className="space-y-0.5 text-[3px]">
                {items.slice(0, 2).map((it: any, idx: number) => (
                  <div key={idx}>• {it.description?.slice(0, 20)}...</div>
                ))}
              </div>
              <div className="mt-auto text-right font-bold text-[4px]">
                Total: {convertedGrandTotal.toFixed(2)} {currencyLabel}
              </div>
            </div>
            <span className="text-xs font-medium text-slate-300">1</span>
          </aside>
        )}

        {/* Center Canvas with A4 Document */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center print:p-0 print:m-0 print:overflow-visible bg-[#525659] print:bg-white">
          <article
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[820px] bg-white shadow-2xl print:shadow-none p-8 sm:p-12 space-y-5 text-xs text-slate-800 leading-normal relative min-h-[1050px] transition-transform duration-100 print:transform-none print:w-full print:max-w-none print:min-h-0"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <span className="text-slate-300 font-extrabold text-5xl sm:text-6xl tracking-widest uppercase opacity-25 rotate-[-10deg] whitespace-nowrap">
                WAITING FOR APPROVAL
              </span>
            </div>

            <div className="relative z-10 space-y-5">
              {/* Header: Logo, Company Name, Center Title, Contact Info */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                {/* Left: Exact Official Logo + Address */}
                <div className="space-y-1.5">
                  <img
                    src="/cool-tech-official-logo.png"
                    alt="Cool Technologies - the science of cooling"
                    className="h-12 w-auto object-contain select-none"
                  />
                  <div className="font-bold text-slate-900 text-xs pt-0.5">COOL TECHNOLOGIES</div>
                  <div className="text-[10px] text-slate-600 max-w-[220px] leading-tight">
                    Breej 5 Street, Plot 99, Sector M-42 Mussafah Industrial Area, Abu Dhabi, UAE
                  </div>
                </div>

                {/* Center Title */}
                <div className="text-center pt-2 flex-1">
                  <h1 className="text-xl font-black text-slate-900 tracking-wider uppercase leading-tight">
                    PURCHASE ORDER
                  </h1>
                </div>

                {/* Right: Company Contacts */}
                <div className="text-[10px] text-slate-700 space-y-0.5 text-left font-medium min-w-[200px]">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 text-slate-500">Tel</span>
                    <span className="col-span-8">: +971 2 565 0123</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 text-slate-500">Mobile</span>
                    <span className="col-span-8">: +971 55 946 0123</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 text-slate-500">Email</span>
                    <span className="col-span-8">: info@cooltechuae.com</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 text-slate-500">Website</span>
                    <span className="col-span-8">: www.cooltechuae.com</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 text-slate-500">TRN</span>
                    <span className="col-span-8">: 100 004 337 000 003</span>
                  </div>
                </div>
              </div>

              {/* Supplier & PO Details (2 Columns) */}
              <div className="grid grid-cols-12 gap-6 pt-1 text-xs">
                {/* Left Column: Supplier */}
                <div className="col-span-7 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-l-2 border-[#00AEEF] pl-1.5 mb-1">
                    Supplier
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{supplier.name}</div>
                  {supplier.poBox && (
                    <div className="text-[10px] text-slate-600 uppercase">
                      {supplier.poBox}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-700 pt-0.5 space-y-0.5">
                    {supplier.phone && (
                      <div>
                        <span className="text-slate-500">Phone :</span> {supplier.phone}
                      </div>
                    )}
                    {supplier.email && (
                      <div>
                        <span className="text-slate-500">Email :</span> {supplier.email}
                      </div>
                    )}
                    {supplier.trn && (
                      <div>
                        <span className="text-slate-500">TRN :</span> {supplier.trn}
                      </div>
                    )}
                    {po.attention && (
                      <div>
                        <span className="text-slate-500">Attn :</span> {po.attention}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: PO Details */}
                <div className="col-span-5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-l-2 border-[#00AEEF] pl-1.5 mb-1">
                    PO Details
                  </div>
                  <div className="text-xs space-y-1 pt-0.5 font-medium">
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-5 text-slate-600">PO Number</span>
                      <span className="col-span-7 font-bold text-slate-900">: {po.poNumber}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      <span className="col-span-5 text-slate-600">PO Date</span>
                      <span className="col-span-7 text-slate-800">: {po.date || po.poDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-1">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#8E9CAE] text-white font-bold select-none text-[11px]">
                      <th className="p-2 border-r border-slate-400 w-8 text-center font-semibold">SL</th>
                      <th className="p-2 border-r border-slate-400 w-16 font-semibold">Code</th>
                      <th className="p-2 border-r border-slate-400 font-semibold">Item Description</th>
                      <th className="p-2 border-r border-slate-400 w-12 text-center font-semibold">Unit</th>
                      <th className="p-2 border-r border-slate-400 w-16 text-center font-semibold">Brand</th>
                      {showQty && (
                        <th className="p-2 border-r border-slate-400 w-12 text-center font-semibold">Qty</th>
                      )}
                      {showRate && (
                        <th className="p-2 border-r border-slate-400 w-24 text-right font-semibold">Rate</th>
                      )}
                      {showTotal && <th className="p-2 w-24 text-right font-semibold">Total</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item: any, idx: number) => {
                      const itemRate = Number(item.amount || item.rate || item.price || 0) / rateConversion;
                      const itemQty = Number(item.qty || 1);
                      const itemTotal = Number(item.total || itemQty * Number(item.amount || item.rate || 0)) / rateConversion;

                      return (
                        <tr key={item.id || idx} className="text-slate-800 text-[11px]">
                          <td className="p-2 border-r border-slate-200 text-center font-medium">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-medium">{item.code || '-'}</td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900 uppercase">
                            {item.description}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">{item.unit || 'Each'}</td>
                          <td className="p-2 border-r border-slate-200 text-center">{item.brand || '-'}</td>
                          {showQty && (
                            <td className="p-2 border-r border-slate-200 text-center font-medium">
                              {itemQty}
                            </td>
                          )}
                          {showRate && (
                            <td className="p-2 border-r border-slate-200 text-right font-mono font-medium">
                              {itemRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          )}
                          {showTotal && (
                            <td className="p-2 text-right font-mono font-bold text-slate-900">
                              {itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals Breakdown matching exact reference */}
                {showTotal && (
                  <div className="flex justify-end pt-2 text-xs">
                    <div className="w-56 space-y-1">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="font-bold text-slate-900 text-xs">Amount</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {convertedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="font-bold text-slate-900 text-xs">VAT (5%)</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {convertedVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="font-bold text-slate-900 text-xs">
                          {isUSD ? 'Total Amount (USD)' : 'Total Amount'}
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {convertedGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount in words */}
              {showTotal && (
                <div className="pt-2 space-y-0.5 text-xs">
                  <div className="font-bold text-slate-900">Amount in words</div>
                  <div className="font-bold text-slate-900 text-[11px]">{amountInWords}</div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="pt-3 space-y-1 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-l-2 border-[#00AEEF] pl-1.5">
                  Terms & Condition
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                  {po.termsConditionText ||
                    'All product supply should be from the latest stock. Material supplied should comply 100% with the requested specifications. Products with any manufacturing defects or issues should be exchanged with new one with all cost including fright to End User. Cool Technologies is requesting you to acknowledge the receipt of this LPO and confirmation of delivery time, via return email.'}
                </p>
              </div>

              {/* Signature / Prepared By */}
              <div className="pt-6 space-y-0.5 text-xs">
                <div className="font-bold text-slate-900 uppercase">
                  {po.preparedBy || po.owner || 'MUSTHAFA CHIRAMMAL'}
                </div>
                {po.preparedByDesignation && (
                  <div className="text-[11px] text-slate-600 font-medium">
                    {po.preparedByDesignation}
                  </div>
                )}
                {po.preparedByMobile && (
                  <div className="text-[11px] text-slate-600">
                    Phone: {po.preparedByMobile}
                  </div>
                )}
                {po.preparedByEmail && (
                  <div className="text-[11px] text-slate-600">
                    Email: {po.preparedByEmail}
                  </div>
                )}
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}

export default function PurchasePrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#323639] flex items-center justify-center text-white text-sm">
          Loading print page...
        </div>
      }
    >
      <PurchasePrintContent />
    </Suspense>
  );
}
