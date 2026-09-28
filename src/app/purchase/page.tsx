'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Info,
  Layers,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Boxes,
  Plus,
  Edit2,
  SquarePen,
  Settings,
  X,
  Truck,
  Tag,
  Store,
  Factory,
  DollarSign,
  FileCheck,
  ArrowDownToLine,
  FilePlus,
  CreditCard,
  Building2,
  Calendar,
  ArrowLeftRight,
  Upload,
  Phone,
} from 'lucide-react';
import { mockCezconStockItems, mockStockTransfers } from '@/data/mockEnterpriseData';
import { CrmCezconStock, CrmStockTransfer } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';

// Helper Barcode Component
function BarcodeView({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-1">
      <div className="flex items-center gap-[2px] h-8 px-1.5 bg-white select-none">
        <div className="w-[2px] h-full bg-slate-900"></div>
        <div className="w-[1px] h-full bg-slate-900"></div>
        <div className="w-[3px] h-full bg-slate-900"></div>
        <div className="w-[1px] h-full bg-slate-900"></div>
        <div className="w-[2px] h-full bg-slate-900"></div>
        <div className="w-[4px] h-full bg-slate-900"></div>
        <div className="w-[1px] h-full bg-slate-900"></div>
        <div className="w-[2px] h-full bg-slate-900"></div>
        <div className="w-[3px] h-full bg-slate-900"></div>
        <div className="w-[1px] h-full bg-slate-900"></div>
        <div className="w-[2px] h-full bg-slate-900"></div>
        <div className="w-[3px] h-full bg-slate-900"></div>
        <div className="w-[1px] h-full bg-slate-900"></div>
        <div className="w-[2px] h-full bg-slate-900"></div>
        <div className="w-[1px] h-full bg-slate-900"></div>
        <div className="w-[3px] h-full bg-slate-900"></div>
        <div className="w-[2px] h-full bg-slate-900"></div>
      </div>
      <span className="text-[10px] font-mono text-slate-800 tracking-wider mt-0.5 font-semibold">
        {code}
      </span>
    </div>
  );
}

// Image Placeholder Box
function NoImageAvailable() {
  return (
    <div className="w-10 h-10 border border-slate-200 rounded bg-slate-50 flex flex-col items-center justify-center text-[7px] text-slate-400 p-0.5 text-center leading-tight mx-auto select-none">
      <svg className="w-4 h-4 text-slate-300 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>NO IMAGE AVAILABLE</span>
    </div>
  );
}

// Cezcon Real Purchase Order Mock Dataset
const mockPurchaseOrders = [
  {
    id: 'po-1',
    slNo: 1,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    poNumber: 'CTPO#2502',
    date: '23-09-2026',
    supplier: 'Better Life',
    order: '',
    reference: '',
    amount: 690.00,
    vat: 34.50,
    totalAmount: 724.50,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 'po-2',
    slNo: 2,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    poNumber: 'CTPO#2501',
    date: '23-09-2026',
    supplier: 'Better Life',
    order: '',
    reference: '',
    amount: 7920.00,
    vat: 396.00,
    totalAmount: 8316.00,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 'po-3',
    slNo: 3,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    poNumber: 'CTPO#2500',
    date: '23-09-2026',
    supplier: 'CENTRAL TRADING COMPANY L.L.C.',
    order: '',
    reference: '',
    amount: 34800.00,
    vat: 1740.00,
    totalAmount: 36540.00,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 'po-4',
    slNo: 4,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    poNumber: 'CTPO#2499',
    date: '23-09-2026',
    supplier: 'CENTRAL TRADING COMPANY L.L.C.',
    order: '',
    reference: '',
    amount: 13300.00,
    vat: 665.00,
    totalAmount: 13965.00,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 'po-5',
    slNo: 5,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    poNumber: 'CTPO#2498',
    date: '23-09-2026',
    supplier: 'SUPER GENERAL COMPANY LLC',
    order: '',
    reference: '',
    amount: 5750.00,
    vat: 287.50,
    totalAmount: 6037.50,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 'po-6',
    slNo: 6,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    poNumber: 'CTPO#2497',
    date: '23-09-2026',
    supplier: 'SUPER GENERAL COMPANY LLC',
    order: '',
    reference: '',
    amount: 46000.00,
    vat: 2300.00,
    totalAmount: 48300.00,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
];

const mockPurchaseInvoices = [
  {
    id: 'inv-1',
    slNo: 1,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
    invoiceNumber: 'INVR292648',
    pisn: 'PIR81',
    date: '13-02-2026',
    supplier: 'GULF ELECTRONICS COMPANY LLC',
    order: '',
    amount: 1699.95,
    paid: 0.00,
    balance: 1699.95,
    status: 'Due',
    deliveryStatus: 'Pending',
  },
  {
    id: 'inv-2',
    slNo: 2,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    invoiceNumber: '2026/0162',
    pisn: 'PIR80',
    date: '28-01-2026',
    supplier: 'RAPID COOL TRADING CO. L.L.C',
    order: '',
    amount: 30272.81,
    paid: 0.00,
    balance: 30272.81,
    status: 'Due',
    deliveryStatus: 'Pending',
  },
  {
    id: 'inv-3',
    slNo: 3,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces',
    invoiceNumber: '101457325',
    pisn: 'PIR79',
    date: '16-12-2025',
    supplier: 'GENERAL ENTERPRISES CO L.L.C',
    order: '',
    amount: 60060.00,
    paid: 0.00,
    balance: 60060.00,
    status: 'Due',
    deliveryStatus: 'Pending',
  },
  {
    id: 'inv-4',
    slNo: 4,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=faces',
    invoiceNumber: '30-20-10-158615',
    pisn: 'PIR78',
    date: '16-12-2025',
    supplier: 'TAQEEF REFRIGERATION & AIR CONDITIONING TRADING LLC',
    order: '',
    amount: 10762.50,
    paid: 0.00,
    balance: 10762.50,
    status: 'Due',
    deliveryStatus: 'Pending',
  },
  {
    id: 'inv-5',
    slNo: 5,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces',
    invoiceNumber: '30-20-10-158935',
    pisn: 'PIR77',
    date: '16-12-2025',
    supplier: 'TAQEEF REFRIGERATION & AIR CONDITIONING TRADING LLC',
    order: '',
    amount: 5145.00,
    paid: 0.00,
    balance: 5145.00,
    status: 'Due',
    deliveryStatus: 'Pending',
  },
  {
    id: 'inv-6',
    slNo: 6,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=faces',
    invoiceNumber: '17457',
    pisn: 'PIR76',
    date: '06-12-2025',
    supplier: 'EMIRATES JO TRADE CO',
    order: '',
    amount: 4035.00,
    paid: 0.00,
    balance: 4035.00,
    status: 'Due',
    deliveryStatus: 'Pending',
  },
];

const mockPurchasePayments = [
  { id: 'pay-1', slNo: 1, voucherNo: 'PAY-401', date: '12-07-2025', supplier: 'MITSUBISHI ELECTRIC CORP', paymentMode: 'Bank Transfer', amount: 45800.0, reference: 'TXN-992101', status: 'Cleared' },
  { id: 'pay-2', slNo: 2, voucherNo: 'PAY-402', date: '17-07-2025', supplier: 'O GENERAL AIR CONDITIONING', paymentMode: 'Cheque', amount: 10000.0, reference: 'CHQ-772819', status: 'Cleared' },
];

const mockStockInList = [
  { id: 'si-1', slNo: 1, stockInNo: 'STK-IN-001', date: '14-07-2025', source: 'MITSUBISHI ELECTRIC CORP', warehouse: 'Main Warehouse - Bay A', totalItems: '24 Units', status: 'Completed' },
  { id: 'si-2', slNo: 2, stockInNo: 'STK-IN-002', date: '19-07-2025', source: 'CARRIER MIDDLE EAST LLC', warehouse: 'Hardware Depot - Austin', totalItems: '12 Units', status: 'Received' },
];

const mockSuppliersList = [
  {
    id: 'sup-1',
    slNo: 1,
    name: 'Creative Display Co.LLC',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
    contact: '+97152 567 9146',
    email: '',
    trn: '100568119000003',
    address: 'Showroom No 3, PO Box 31952, Salahuddin Street , Dubai, UAE',
    outstanding: 0.00,
  },
  {
    id: 'sup-2',
    slNo: 2,
    name: 'Better Life',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
    contact: '+971559140030',
    email: 'mussadik_a@betterlife.ae',
    trn: '100008678300003',
    address: 'PO Box 25441',
    outstanding: 0.00,
  },
  {
    id: 'sup-3',
    slNo: 3,
    name: 'Dolphin Oilfield Equipment Services Co.LLC',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces',
    contact: '+97150 276 0216',
    email: 'midhun.m@dolphin.ae',
    trn: '100009744200003',
    address: 'PO Box 8402, Abu Dhabi - UAE',
    outstanding: 0.00,
  },
  {
    id: 'sup-4',
    slNo: 4,
    name: 'Western International LLC',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=faces',
    contact: '',
    email: '',
    trn: '100007922600003',
    address: '',
    outstanding: 0.00,
  },
  {
    id: 'sup-5',
    slNo: 5,
    name: 'LEMINAR AIR CONDITIONING COMPANY LLC-BRANCH OF ABU DHABI',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces',
    contact: '+97154 506 5638',
    email: '',
    trn: '100060237300003',
    address: '',
    outstanding: 0.00,
  },
  {
    id: 'sup-6',
    slNo: 6,
    name: 'Essa Mohd Al Zubaidi General Trading Est.',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=faces',
    contact: '',
    email: '',
    trn: '100355284900003',
    address: 'PO Box 4044\nDubai\nUAE',
    outstanding: 462.00,
  },
  {
    id: 'sup-7',
    slNo: 7,
    name: 'ESSA AHMED AL HAMADI A / C. UNITS FIX. CONT.',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=faces',
    contact: '+971501202559',
    email: 'Mazayaldc@gmail.com',
    trn: '100460983600001',
    address: 'Butina, Al Sharq Street, Al Sharq Street, Butina, near Rolla, Sharah, 20017',
    outstanding: 0.00,
  },
  {
    id: 'sup-8',
    slNo: 8,
    name: 'TARGETLINK OILFIELD EQUIPMENTS TRADING LLC',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=64&h=64&fit=crop&crop=faces',
    contact: '',
    email: '',
    trn: '100443447600003',
    address: 'PO BOX 92107 MUSAFFAH IND 3 10 ABUDHABI UAE',
    outstanding: 0.00,
  },
  {
    id: 'sup-9',
    slNo: 9,
    name: 'TEKNODOME TRADING LLC',
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64&h=64&fit=crop&crop=faces',
    contact: '+971525098193',
    email: 'hakimuddin@teknodome.com',
    trn: '100035463700003',
    address: 'Warehouse No 1\nAl Qusais\n233-153\ndubai',
    outstanding: 16380.00,
  },
];

const mockStoresList = [
  { id: 'str-1', slNo: 1, name: 'Main Warehouse - Bay A', code: 'WH-01', manager: 'Rashid Al-Nuaimi', phone: '+971 50 123 4567', location: 'Al Quoz Industrial 3, Dubai', capacity: '15,000 Sq.Ft', status: 'Active' },
  { id: 'str-2', slNo: 2, name: 'Hardware Depot - Austin', code: 'WH-02', manager: 'David Miller', phone: '+1 512 882 1920', location: 'Industrial Park, Austin, TX', capacity: '8,500 Sq.Ft', status: 'Active' },
  { id: 'str-3', slNo: 3, name: 'Central Spares Hub', code: 'WH-03', manager: 'Ahmed Qasim', phone: '+971 55 987 6543', location: 'Mussafah M-42, Abu Dhabi', capacity: '12,000 Sq.Ft', status: 'Active' },
];

const mockManufacturingOrders = [
  { id: 'mfr-1', slNo: 1, workOrderNo: 'WO-2025-010', product: 'CASSETTE AC 1.5 TR INVERTER R410', targetQty: 50, producedQty: 45, startDate: '01-07-2025', endDate: '15-07-2025', status: 'In Progress' },
  { id: 'mfr-2', slNo: 2, workOrderNo: 'WO-2025-011', product: 'WATER COOLERS 100L INDUSTRIAL', targetQty: 20, producedQty: 20, startDate: '10-06-2025', endDate: '28-06-2025', status: 'Completed' },
];

function PurchasePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mainTab = searchParams.get('tab') || 'stock';

  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'minimal' | 'adjustment' | 'transfer'>('stock');

  useEffect(() => {
    const sub = searchParams.get('subtab');
    if (sub && ['stock', 'minimal', 'adjustment', 'transfer'].includes(sub)) {
      setActiveSubTab(sub as any);
    }
  }, [searchParams]);

  // Mobile Filter Accordion States
  const [showPoFiltersMobile, setShowPoFiltersMobile] = useState(false);
  const [showInvoiceFiltersMobile, setShowInvoiceFiltersMobile] = useState(false);
  const [showStockFiltersMobile, setShowStockFiltersMobile] = useState(false);
  const [showTransferFiltersMobile, setShowTransferFiltersMobile] = useState(false);

  // Filter States - Purchase Order
  const [poFilterOwner, setPoFilterOwner] = useState<string>('All Owners');
  const [poDateRange, setPoDateRange] = useState<string>('25-08-2026 - 23-09-2026');
  const [poFilterSupplier, setPoFilterSupplier] = useState<string>('Select Supplier');
  const [poSearch, setPoSearch] = useState<string>('');
  const [poRowsPerPage, setPoRowsPerPage] = useState<number>(10);

  // Filter States - Stock
  const [filterCategory, setFilterCategory] = useState<string>('Select');
  const [filterBrand, setFilterBrand] = useState<string>('Select');
  const [filterUnit, setFilterUnit] = useState<string>('Select');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterStore, setFilterStore] = useState<string>('All Store');

  const [stockSearch, setStockSearch] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter States - Stock Transfer
  const [transferOwner, setTransferOwner] = useState<string>('Select');
  const [transferDateRange, setTransferDateRange] = useState<string>('');
  const [transferSearch, setTransferSearch] = useState<string>('');
  const [transferRowsPerPage, setTransferRowsPerPage] = useState<number>(10);

  // Filter States - Purchase Invoice (Exact Cezcon CRM layout)
  const [invoiceFilterOwner, setInvoiceFilterOwner] = useState<string>('All Owners');
  const [invoiceDateRange, setInvoiceDateRange] = useState<string>('All Month & Year');
  const [invoiceFilterSupplier, setInvoiceFilterSupplier] = useState<string>('Select Supplier');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<string>('Due');
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [invoiceRowsPerPage, setInvoiceRowsPerPage] = useState<number>(10);

  // Filter States - Supplier (Exact Cezcon CRM layout)
  const [supplierSearch, setSupplierSearch] = useState<string>('');
  const [supplierRowsPerPage, setSupplierRowsPerPage] = useState<number>(10);

  // Filter States & Sub-tabs - Products / Services (Exact Cezcon CRM layout)
  const [productSubTab, setProductSubTab] = useState<'products' | 'unit' | 'brand' | 'category'>('products');
  const [productCategory, setProductCategory] = useState<string>('Select');
  const [productBrand, setProductBrand] = useState<string>('Select');
  const [productUnit, setProductUnit] = useState<string>('Select');
  const [productType, setProductType] = useState<string>('All');
  const [productStatus, setProductStatus] = useState<string>('Active');
  const [productStore, setProductStore] = useState<string>('All Store');
  const [productSearch, setProductSearch] = useState<string>('');
  const [productRowsPerPage, setProductRowsPerPage] = useState<number>(10);

  const [stockItems, setStockItems] = useState<CrmCezconStock[]>(mockCezconStockItems);
  const [transfers, setTransfers] = useState<CrmStockTransfer[]>(mockStockTransfers);

  // Filtered Products / Services
  const filteredProducts = useMemo(() => {
    return mockCezconStockItems.filter((item) => {
      if (productSearch) {
        const q = productSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBrand && !matchCategory) return false;
      }
      if (productCategory !== 'Select' && item.category !== productCategory) return false;
      if (productBrand !== 'Select' && item.brand !== productBrand) return false;
      if (productUnit !== 'Select' && item.unit !== productUnit) return false;
      if (productType !== 'All' && item.type !== productType) return false;
      if (productStatus !== 'All' && item.status !== productStatus) return false;
      if (productStore !== 'All Store' && item.store !== productStore) return false;
      return true;
    });
  }, [productSearch, productCategory, productBrand, productUnit, productType, productStatus, productStore]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return mockSuppliersList.filter((item) => {
      if (supplierSearch) {
        const q = supplierSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchContact = item.contact.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchTrn = item.trn.toLowerCase().includes(q);
        const matchAddress = item.address.toLowerCase().includes(q);
        if (!matchName && !matchContact && !matchEmail && !matchTrn && !matchAddress) return false;
      }
      return true;
    });
  }, [supplierSearch]);

  // Filtered Purchase Invoices
  const filteredPurchaseInvoices = useMemo(() => {
    return mockPurchaseInvoices.filter((item) => {
      if (invoiceSearch) {
        const q = invoiceSearch.toLowerCase();
        const matchNo = item.invoiceNumber.toLowerCase().includes(q);
        const matchPisn = item.pisn.toLowerCase().includes(q);
        const matchSup = item.supplier.toLowerCase().includes(q);
        if (!matchNo && !matchPisn && !matchSup) return false;
      }
      if (invoiceFilterOwner !== 'All Owners' && item.owner !== invoiceFilterOwner) {
        return false;
      }
      if (invoiceFilterSupplier !== 'Select Supplier' && item.supplier !== invoiceFilterSupplier) {
        return false;
      }
      if (invoiceFilterStatus !== 'All Status' && item.status !== invoiceFilterStatus) {
        return false;
      }
      return true;
    });
  }, [invoiceSearch, invoiceFilterOwner, invoiceFilterSupplier, invoiceFilterStatus]);

  // Filtered Purchase Orders
  const filteredPOItems = useMemo(() => {
    return mockPurchaseOrders.filter((item) => {
      if (poSearch) {
        const q = poSearch.toLowerCase();
        const matchNo = item.poNumber.toLowerCase().includes(q);
        const matchSup = item.supplier.toLowerCase().includes(q);
        if (!matchNo && !matchSup) return false;
      }
      if (poFilterOwner !== 'All Owners' && item.owner !== poFilterOwner) {
        return false;
      }
      if (poFilterSupplier !== 'Select Supplier' && item.supplier !== poFilterSupplier) {
        return false;
      }
      return true;
    });
  }, [poSearch, poFilterOwner, poFilterSupplier]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      if (transferSearch) {
        const q = transferSearch.toLowerCase();
        const matchNo = item.transferNo.toLowerCase().includes(q);
        const matchFrom = item.transferFrom.toLowerCase().includes(q);
        const matchTo = item.transferTo.toLowerCase().includes(q);
        const matchOwner = item.owner.toLowerCase().includes(q);
        if (!matchNo && !matchFrom && !matchTo && !matchOwner) return false;
      }
      if (transferOwner !== 'Select' && item.owner !== transferOwner) {
        return false;
      }
      return true;
    });
  }, [transfers, transferSearch, transferOwner]);

  // Filtered Stock Items
  const filteredStockItems = useMemo(() => {
    if (activeSubTab === 'minimal' || activeSubTab === 'adjustment' || activeSubTab === 'transfer') {
      return [];
    }

    return stockItems.filter((item) => {
      if (stockSearch) {
        const q = stockSearch.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBrand && !matchCategory) return false;
      }

      if (filterCategory !== 'Select' && item.category !== filterCategory) return false;
      if (filterBrand !== 'Select' && item.brand !== filterBrand) return false;
      if (filterUnit !== 'Select' && item.unit !== filterUnit) return false;
      if (filterType !== 'All' && item.type !== filterType) return false;
      if (filterStatus !== 'All' && item.status !== filterStatus) return false;
      if (filterStore !== 'All Store' && item.store !== filterStore) return false;

      return true;
    });
  }, [
    stockItems,
    activeSubTab,
    stockSearch,
    filterCategory,
    filterBrand,
    filterUnit,
    filterType,
    filterStatus,
    filterStore,
  ]);

  const totalPages = Math.ceil(filteredStockItems.length / rowsPerPage) || 1;
  const paginatedItems = filteredStockItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans w-full">
      {/* 1. TOP SUB-TABS BOX BAR FOR STOCK MODULE ONLY */}
      {mainTab === 'stock' && (
        <div className="bg-white border-b border-[#E2E8F0] px-4 py-0 flex items-center justify-between shadow-xs sticky top-0 z-30 overflow-x-auto">
          <div className="flex items-stretch min-w-max border-l border-slate-200">
            {[
              { id: 'stock', label: 'Stock' },
              { id: 'minimal', label: 'Minimal Stock' },
              { id: 'adjustment', label: 'Stock Adjustment' },
              { id: 'transfer', label: 'Stock Transfer' },
            ].map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'px-4 py-2.5 text-xs transition-colors cursor-pointer border-r border-slate-200 border-t-2 select-none flex items-center gap-1.5',
                    isActive
                      ? 'border-t-[#E11D48] bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'border-t-transparent bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal'
                  )}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TOP SUB-TABS BOX BAR FOR PRODUCTS MODULE */}
      {mainTab === 'products' && (
        <div className="bg-white border-b border-[#E2E8F0] px-4 py-0 flex items-center justify-between shadow-xs sticky top-0 z-30 overflow-x-auto">
          <div className="flex items-stretch min-w-max border-l border-slate-200">
            {[
              { id: 'products', label: 'Product or Services', icon: '📄' },
              { id: 'unit', label: 'Unit', icon: '📋' },
              { id: 'brand', label: 'Brand', icon: '🏷️' },
              { id: 'category', label: 'Category', icon: '🔖' },
            ].map((tab) => {
              const isActive = productSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setProductSubTab(tab.id as any);
                  }}
                  className={cn(
                    'px-4 py-2.5 text-xs transition-colors cursor-pointer border-r border-slate-200 border-t-2 select-none flex items-center gap-1.5',
                    isActive
                      ? 'border-t-[#E11D48] bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'border-t-transparent bg-[#F8FAFC] text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal'
                  )}
                >
                  <span className="text-[11px] text-slate-400">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 space-y-3">
        {/* ========================================================= */}
        {/* PURCHASE ORDER (Exact Cezcon CRM Layout)                  */}
        {/* ========================================================= */}
        {mainTab === 'po' && (
          <>
            {/* Top 2-Row Filter Criteria Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs p-3 sm:p-4 space-y-3 text-xs">
              {/* Mobile Filter Toggle Button */}
              <div className="flex md:hidden items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPoFiltersMobile(!showPoFiltersMobile)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer w-full justify-between"
                >
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter Purchase Orders</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                      {showPoFiltersMobile ? 'Hide Filters' : 'Tap to filter'}
                    </span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', showPoFiltersMobile ? 'rotate-180' : '')} />
                </button>
              </div>

              <div className={cn('space-y-4', showPoFiltersMobile ? 'block' : 'hidden md:block')}>
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Owner</label>
                    <select
                      value={poFilterOwner}
                      onChange={(e) => setPoFilterOwner(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="All Owners">All Owners</option>
                      <option value="Muhammad Ali">Muhammad Ali</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Alex Rivera">Alex Rivera</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Purchase Order Date</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 text-xs">📅</span>
                      <input
                        type="text"
                        value={poDateRange}
                        onChange={(e) => setPoDateRange(e.target.value)}
                        placeholder="25-08-2026 - 23-09-2026"
                        className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setPoDateRange('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                      >
                        ✖
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Supplier</label>
                    <select
                      value={poFilterSupplier}
                      onChange={(e) => setPoFilterSupplier(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Select Supplier">Select Supplier</option>
                      <option value="Better Life">Better Life</option>
                      <option value="CENTRAL TRADING COMPANY L.L.C.">CENTRAL TRADING COMPANY L.L.C.</option>
                      <option value="SUPER GENERAL COMPANY LLC">SUPER GENERAL COMPANY LLC</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Opportunity/Order</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Select Opportunity/Order">Select Opportunity/Order</option>
                    </select>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Purchase Order Type</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Select Purchase Order Type">Select Purchase Order Type</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Header */}
              <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="text-sm">🗂️</span>
                  <span>Purchase Order</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold uppercase rounded-xs transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>PO</span>
                </button>
              </div>

              {/* Table Controls */}
              <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Shows</span>
                  <select
                    value={poRowsPerPage}
                    onChange={(e) => setPoRowsPerPage(Number(e.target.value))}
                    className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-medium"
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
                    placeholder="Search Purchase Order"
                    value={poSearch}
                    onChange={(e) => setPoSearch(e.target.value)}
                    className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                </div>
              </div>

              {/* Native Mobile PO Cards (Phone Viewports) */}
              <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                {filteredPOItems.map((po) => (
                  <div key={po.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[#2563EB] font-bold text-xs">
                          <span>📄</span>
                          {po.poNumber}
                        </span>
                        <div className="text-[10px] text-slate-500">Date: {po.date}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#16A34A] text-white">
                        {po.approval}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Supplier</span>
                      <span className="text-[#2563EB] font-bold text-xs">{po.supplier}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Amount</div>
                        <div className="font-semibold text-slate-700">
                          {po.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">VAT</div>
                        <div className="font-semibold text-slate-600">
                          {po.vat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Total</div>
                        <div className="font-bold text-slate-900">
                          {po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <img src={po.ownerAvatar} alt={po.owner} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                        <span className="text-[11px] text-slate-600 font-medium">{po.owner}</span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F97316] text-white inline-flex items-center gap-1">
                        <Edit2 className="w-2.5 h-2.5" />
                        {po.deliveryStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Content (Desktop Viewports) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                      <th className="p-2.5 w-12 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 w-14 text-center border-r border-slate-200">Owner</th>
                      <th className="p-2.5 w-32 border-r border-slate-200">PO#</th>
                      <th className="p-2.5 w-28 border-r border-slate-200">Date</th>
                      <th className="p-2.5 border-r border-slate-200">Supplier</th>
                      <th className="p-2.5 w-24 border-r border-slate-200">Order</th>
                      <th className="p-2.5 w-24 border-r border-slate-200">Reference</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Amount</th>
                      <th className="p-2.5 text-right w-20 border-r border-slate-200">VAT</th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Total Amount</th>
                      <th className="p-2.5 text-center w-28 border-r border-slate-200">Invoice Received</th>
                      <th className="p-2.5 text-center w-44 border-r border-slate-200">Approval</th>
                      <th className="p-2.5 text-center w-28 border-r border-slate-200">Delivery Status</th>
                      <th className="p-2.5 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPOItems.map((po) => (
                      <tr key={po.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{po.slNo}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <img src={po.ownerAvatar} alt={po.owner} className="w-6 h-6 rounded-full object-cover inline-block mx-auto border border-slate-200" />
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <span className="inline-flex items-center gap-1 text-[#2563EB] hover:underline cursor-pointer font-medium">
                            <span className="w-3 h-3 text-red-500 font-bold text-[9px] flex items-center justify-center">📄</span>
                            {po.poNumber}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700 border-r border-slate-100">{po.date}</td>
                        <td className="p-2.5 border-r border-slate-100">
                          <span className="text-[#2563EB] hover:underline cursor-pointer font-medium">{po.supplier}</span>
                        </td>
                        <td className="p-2.5 text-slate-400 border-r border-slate-100">{po.order || ''}</td>
                        <td className="p-2.5 text-slate-400 border-r border-slate-100">{po.reference || ''}</td>
                        <td className="p-2.5 text-right font-medium text-slate-900 border-r border-slate-100">
                          {po.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-700 border-r border-slate-100">
                          {po.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900 border-r border-slate-100">
                          {po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">{po.invoiceReceived || ''}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#16A34A] text-white whitespace-nowrap shadow-2xs">
                            {po.approval}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#F97316] text-white inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                            <Edit2 className="w-2.5 h-2.5" />
                            {po.deliveryStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                <div>
                  Showing 1 to {filteredPOItems.length} of {filteredPOItems.length} entries
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PURCHASE INVOICE (Exact Cezcon CRM Layout)                 */}
        {/* ========================================================= */}
        {mainTab === 'invoice' && (
          <>
            {/* Top 1-Row Filter Criteria Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs p-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Owner</label>
                  <select
                    value={invoiceFilterOwner}
                    onChange={(e) => setInvoiceFilterOwner(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="All Owners">All Owners</option>
                    <option value="Muhammad Ali">Muhammad Ali</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Purchase Invoice Date</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs">📅</span>
                    <input
                      type="text"
                      value={invoiceDateRange}
                      onChange={(e) => setInvoiceDateRange(e.target.value)}
                      placeholder="All Month & Year"
                      className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    />
                    {invoiceDateRange && (
                      <button
                        type="button"
                        onClick={() => setInvoiceDateRange('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                      >
                        ✖
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Supplier</label>
                  <select
                    value={invoiceFilterSupplier}
                    onChange={(e) => setInvoiceFilterSupplier(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="Select Supplier">Select Supplier</option>
                    <option value="GULF ELECTRONICS COMPANY LLC">GULF ELECTRONICS COMPANY LLC</option>
                    <option value="RAPID COOL TRADING CO. L.L.C">RAPID COOL TRADING CO. L.L.C</option>
                    <option value="GENERAL ENTERPRISES CO L.L.C">GENERAL ENTERPRISES CO L.L.C</option>
                    <option value="TAQEEF REFRIGERATION & AIR CONDITIONING TRADING LLC">TAQEEF REFRIGERATION & AIR CONDITIONING TRADING LLC</option>
                    <option value="EMIRATES JO TRADE CO">EMIRATES JO TRADE CO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-medium block">Payment Status</label>
                  <select
                    value={invoiceFilterStatus}
                    onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                  >
                    <option value="Due">Due</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="All Status">All Status</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Card Header */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                  <span className="text-sm">🗂️</span>
                  <span>Purchase Invoice</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium rounded-xs shadow-xs cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Purchase Invoice</span>
                </button>
              </div>

              {/* Table Controls (Rows dropdown and Search) */}
              <div className="p-3 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Shows</span>
                  <select
                    value={invoiceRowsPerPage}
                    onChange={(e) => setInvoiceRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>Rows</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search Purchase Invoice"
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                </div>
              </div>

              {/* Native Mobile Invoice Cards */}
              <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                {filteredPurchaseInvoices.map((inv) => (
                  <div key={inv.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[#2563EB] font-bold text-xs">{inv.invoiceNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                            {inv.pisn}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">Date: {inv.date}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E28A36] text-white whitespace-nowrap shadow-2xs">
                        {inv.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Supplier</span>
                      <span className="text-[#2563EB] font-bold text-xs uppercase">{inv.supplier}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1.5 border-t border-b border-slate-100 text-center bg-slate-50/50 rounded">
                      <div>
                        <div className="text-[10px] text-slate-500">Amount</div>
                        <div className="font-semibold text-slate-800">
                          {inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Paid</div>
                        <div className="font-semibold text-slate-600">
                          {inv.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Balance</div>
                        <div className="font-bold text-[#DC2626]">
                          {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <img src={inv.ownerAvatar} alt={inv.owner} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                        <span className="text-[11px] text-slate-600 font-medium">{inv.owner}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F97316] text-white inline-flex items-center gap-1 shadow-2xs">
                          <Edit2 className="w-2.5 h-2.5" />
                          {inv.deliveryStatus}
                        </span>
                        <button
                          type="button"
                          className="p-1 bg-[#0B1E2E] text-white rounded cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Content (Desktop Viewports) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                      <th className="p-2.5 w-14 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 w-14 text-center border-r border-slate-200">Owner</th>
                      <th className="p-2.5 w-36 border-r border-slate-200">Purchase Invoice#</th>
                      <th className="p-2.5 w-24 border-r border-slate-200">PISN</th>
                      <th className="p-2.5 w-28 border-r border-slate-200">Date</th>
                      <th className="p-2.5 border-r border-slate-200">Supplier</th>
                      <th className="p-2.5 w-24 border-r border-slate-200">Order</th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Amount</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Paid</th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Balance</th>
                      <th className="p-2.5 text-center w-24 border-r border-slate-200">Status</th>
                      <th className="p-2.5 text-center w-32 border-r border-slate-200">Delivery Status</th>
                      <th className="p-2.5 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPurchaseInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{inv.slNo}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <img src={inv.ownerAvatar} alt={inv.owner} className="w-6 h-6 rounded-full object-cover inline-block mx-auto border border-slate-200" />
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <span className="text-[#2563EB] hover:underline cursor-pointer font-medium">
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          <span className="text-[#2563EB] hover:underline cursor-pointer font-medium">
                            {inv.pisn}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700 border-r border-slate-100">{inv.date}</td>
                        <td className="p-2.5 border-r border-slate-100">
                          <span className="text-[#2563EB] hover:underline cursor-pointer font-medium uppercase">
                            {inv.supplier}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 border-r border-slate-100">{inv.order || ''}</td>
                        <td className="p-2.5 text-right font-medium text-slate-800 border-r border-slate-100">
                          {inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-700 border-r border-slate-100">
                          {inv.paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-bold text-[#DC2626] border-r border-slate-100">
                          {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#E28A36] text-white whitespace-nowrap shadow-2xs">
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#F97316] text-white inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
                            <Edit2 className="w-2.5 h-2.5" />
                            {inv.deliveryStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                <div>
                  Showing 1 to {filteredPurchaseInvoices.length} of {filteredPurchaseInvoices.length} entries
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PURCHASE PAYMENT TAB VIEW                                 */}
        {/* ========================================================= */}
        {mainTab === 'payment' && (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Purchase Payments</span>
                </div>
                <button type="button" className="flex items-center justify-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold uppercase rounded-xs transition shadow-xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ RECORD PAYMENT</span>
                </button>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Supplier</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
                      <option value="All">All Suppliers</option>
                      <option value="Mitsubishi">MITSUBISHI ELECTRIC CORP</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Payment Mode</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
                      <option value="All">All Modes</option>
                      <option value="Bank">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Search Voucher</label>
                    <input type="text" placeholder="Search Voucher / Ref..." className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Native Mobile Payment Cards */}
              <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                {mockPurchasePayments.map((pmt) => (
                  <div key={pmt.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-bold text-[#2563EB] text-xs">{pmt.voucherNo}</span>
                        <div className="text-[10px] text-slate-500">Date: {pmt.date}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {pmt.paymentMode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Supplier</span>
                        <span className="font-semibold text-slate-800 text-xs">{pmt.supplier}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Ref / Txn No.</span>
                        <span className="font-mono text-slate-600 text-[11px]">{pmt.reference}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Amount Paid</span>
                        <span className="font-bold text-slate-900 text-xs">{pmt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} AED</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Content (Desktop Viewports) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold">
                      <th className="p-2.5 w-16 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 border-r border-slate-200">Voucher No.</th>
                      <th className="p-2.5 border-r border-slate-200">Date</th>
                      <th className="p-2.5 border-r border-slate-200">Supplier</th>
                      <th className="p-2.5 border-r border-slate-200">Payment Mode</th>
                      <th className="p-2.5 border-r border-slate-200">Ref / Txn No.</th>
                      <th className="p-2.5 text-right border-r border-slate-200">Amount Paid (AED)</th>
                      <th className="p-2.5 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mockPurchasePayments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-blue-50/40">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{pmt.slNo}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-[#2563EB]">{pmt.voucherNo}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700">{pmt.date}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">{pmt.supplier}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{pmt.paymentMode}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600 font-mono">{pmt.reference}</td>
                        <td className="p-2.5 text-right font-medium text-slate-900 border-r border-slate-100">{pmt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center">
                          <button type="button" className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B1E2E] text-white rounded text-xs cursor-pointer"><Settings className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-200 text-xs text-slate-600 bg-white">
                Showing 1 to {mockPurchasePayments.length} of {mockPurchasePayments.length} entries
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* STOCK IN TAB VIEW                                         */}
        {/* ========================================================= */}
        {mainTab === 'stock-in' && (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Stock In Register</span>
                </div>
                <button type="button" className="flex items-center justify-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold uppercase rounded-xs transition shadow-xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ STOCK IN</span>
                </button>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Destination Warehouse</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
                      <option value="All">All Warehouses</option>
                      <option value="WH-01">Main Warehouse - Bay A</option>
                      <option value="WH-02">Hardware Depot - Austin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Supplier / Source</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500">
                      <option value="All">All Sources</option>
                      <option value="Mitsubishi">MITSUBISHI ELECTRIC CORP</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Search Stock In</label>
                    <input type="text" placeholder="Search Inward record..." className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Native Mobile Stock In Cards */}
              <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                {mockStockInList.map((si) => (
                  <div key={si.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-bold text-[#2563EB] text-xs">{si.stockInNo}</span>
                        <div className="text-[10px] text-slate-500">Date: {si.date}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">
                        {si.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Supplier / Source</span>
                        <span className="font-semibold text-slate-800 text-xs">{si.source}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Destination</span>
                        <span className="text-slate-700 text-xs">{si.warehouse}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total Items</span>
                        <span className="font-bold text-slate-900 text-xs">{si.totalItems}</span>
                      </div>
                      <button type="button" className="p-1 bg-[#0B1E2E] text-white rounded cursor-pointer">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Content (Desktop Viewports) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold">
                      <th className="p-2.5 w-16 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 border-r border-slate-200">Stock In No.</th>
                      <th className="p-2.5 border-r border-slate-200">Date</th>
                      <th className="p-2.5 border-r border-slate-200">Supplier / Source</th>
                      <th className="p-2.5 border-r border-slate-200">Destination Warehouse</th>
                      <th className="p-2.5 border-r border-slate-200">Total Items</th>
                      <th className="p-2.5 text-center border-r border-slate-200">Status</th>
                      <th className="p-2.5 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mockStockInList.map((si) => (
                      <tr key={si.id} className="hover:bg-blue-50/40">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{si.slNo}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-[#2563EB]">{si.stockInNo}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700">{si.date}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">{si.source}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{si.warehouse}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">{si.totalItems}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-800">{si.status}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button type="button" className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B1E2E] text-white rounded text-xs cursor-pointer"><Settings className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-200 text-xs text-slate-600 bg-white">
                Showing 1 to {mockStockInList.length} of {mockStockInList.length} entries
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* SUPPLIER (Exact Cezcon CRM Layout)                        */}
        {/* ========================================================= */}
        {mainTab === 'supplier' && (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Card Header */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                  <span className="text-sm">🗂️</span>
                  <span>Supplier</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-medium rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Supplier</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold uppercase rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ SUPPLIER</span>
                  </button>
                </div>
              </div>

              {/* Table Controls (Rows and Search) */}
              <div className="p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Shows</span>
                  <select
                    value={supplierRowsPerPage}
                    onChange={(e) => setSupplierRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>Rows</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search Supplier"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                </div>
              </div>

              {/* Native Mobile Supplier Cards */}
              <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                {filteredSuppliers.map((sup) => (
                  <div key={sup.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#2563EB] text-xs">{sup.name}</span>
                        {sup.trn && <div className="text-[10px] text-slate-500 font-mono">TRN: {sup.trn}</div>}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Outstanding</span>
                        <span className={cn('font-bold text-xs', sup.outstanding > 0 ? 'text-[#DC2626]' : 'text-slate-800')}>
                          {sup.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })} AED
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-slate-600">
                      {sup.contact && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-xs bg-[#E11D48] text-white flex items-center justify-center text-[9px]">☎</span>
                          <a href={`tel:${sup.contact}`} className="font-mono text-[#2563EB] font-medium">{sup.contact}</a>
                        </div>
                      )}
                      {sup.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <span>✉</span>
                          <span className="text-slate-700">{sup.email}</span>
                        </div>
                      )}
                      {sup.address && (
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          {sup.address}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <img src={sup.ownerAvatar} alt={sup.owner} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                        <span className="text-[11px] text-slate-600 font-medium">{sup.owner}</span>
                      </div>
                      <button type="button" className="p-1 bg-[#0B1E2E] text-white rounded cursor-pointer">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Content (Desktop Viewports) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                      <th className="p-2.5 w-14 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 border-r border-slate-200">Name</th>
                      <th className="p-2.5 w-14 text-center border-r border-slate-200">Owner</th>
                      <th className="p-2.5 w-44 border-r border-slate-200">Contact</th>
                      <th className="p-2.5 w-48 border-r border-slate-200">Email</th>
                      <th className="p-2.5 w-36 border-r border-slate-200">TRN</th>
                      <th className="p-2.5 border-r border-slate-200">Address</th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Outstanding</th>
                      <th className="p-2.5 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSuppliers.map((sup) => (
                      <tr key={sup.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{sup.slNo}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-[#2563EB] hover:underline cursor-pointer">
                          {sup.name}
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <img src={sup.ownerAvatar} alt={sup.owner} className="w-6 h-6 rounded-full object-cover inline-block mx-auto border border-slate-200" />
                        </td>
                        <td className="p-2.5 border-r border-slate-100">
                          {sup.contact ? (
                            <div className="inline-flex items-center gap-1.5 text-slate-700 font-mono text-xs">
                              <span className="w-3.5 h-3.5 rounded-xs bg-[#E11D48] text-white flex items-center justify-center text-[8px] font-bold">
                                ☎
                              </span>
                              <span>{sup.contact}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400"></span>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700">
                          {sup.email ? (
                            <span className="text-[#2563EB] hover:underline cursor-pointer font-medium">{sup.email}</span>
                          ) : (
                            ''
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700 font-mono text-[11px]">{sup.trn}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700 whitespace-pre-line leading-relaxed">{sup.address}</td>
                        <td className="p-2.5 text-right font-bold border-r border-slate-100">
                          <span className={sup.outstanding > 0 ? 'text-[#DC2626]' : 'text-slate-800'}>
                            {sup.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                <div>
                  Showing 1 to {filteredSuppliers.length} of {filteredSuppliers.length} entries
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* PRODUCTS / SERVICES (Exact Cezcon CRM Layout)              */}
        {/* ========================================================= */}
        {mainTab === 'products' && (
          <>
            {/* Top 2-Row Filter Criteria Card with Header and Action Buttons */}
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Card Header with 3 Action Buttons */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                  <span className="text-sm">🗂️</span>
                  <span>Product/Services</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-medium rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Download Barcode</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-medium rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Update / Import Product/Service</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold uppercase rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ PRODUCT/SERVICE</span>
                  </button>
                </div>
              </div>

              {/* 2-Row Filter Grid */}
              <div className="p-4 space-y-3 bg-white">
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Select Category</label>
                    <select
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Select">Select</option>
                      <option value="CASSETTE AC">CASSETTE AC</option>
                      <option value="SPLIT AC">SPLIT AC</option>
                      <option value="REFRIGERATOR">REFRIGERATOR</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Select Brand</label>
                    <select
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Select">Select</option>
                      <option value="MIDEA">MIDEA</option>
                      <option value="LG">LG</option>
                      <option value="AKAI">AKAI</option>
                      <option value="MITSUBISHI">MITSUBISHI</option>
                      <option value="O GENERAL">O GENERAL</option>
                      <option value="CARRIER">CARRIER</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Select Unit</label>
                    <select
                      value={productUnit}
                      onChange={(e) => setProductUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Select">Select</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Each">Each</option>
                      <option value="Set">Set</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Select Type</label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="All">All</option>
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
                    </select>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Select Status</label>
                    <select
                      value={productStatus}
                      onChange={(e) => setProductStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="All">All</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Select Store</label>
                    <select
                      value={productStore}
                      onChange={(e) => setProductStore(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="All Store">All Store</option>
                      <option value="Main Warehouse - Bay A">Main Warehouse - Bay A</option>
                      <option value="Hardware Depot - Austin">Hardware Depot - Austin</option>
                      <option value="Central Spares Hub">Central Spares Hub</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Controls */}
              <div className="p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Shows</span>
                  <select
                    value={productRowsPerPage}
                    onChange={(e) => setProductRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>Rows</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                </div>
              </div>

              {/* Native Mobile Product Cards */}
              <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                {filteredProducts.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                            {item.category}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">
                            {item.brand}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10B981] text-white">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-center py-1 bg-slate-50/80 rounded border border-slate-100">
                      <BarcodeView code={item.code} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-1.5 border-t border-b border-slate-100 text-center bg-slate-50/50 rounded">
                      <div>
                        <div className="text-[10px] text-slate-500">Purchase Rate</div>
                        <div className="font-semibold text-slate-800">
                          {item.purchaseRate.toLocaleString('en-US', { minimumFractionDigits: 2 })} AED
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Selling Price</div>
                        <div className="font-bold text-slate-900">
                          {item.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} AED
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">Unit: <strong className="text-slate-700">{item.unit}</strong></span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B1E2E] text-white rounded text-xs cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Action</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table (Desktop Viewports) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                      <th className="p-2.5 w-12 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 w-24 text-center border-r border-slate-200">Serial No.</th>
                      <th className="p-2.5 w-48 text-center border-r border-slate-200">Code</th>
                      <th className="p-2.5 border-r border-slate-200">Name</th>
                      <th className="p-2.5 w-24 text-center border-r border-slate-200">Image</th>
                      <th className="p-2.5 w-16 text-center border-r border-slate-200">Unit</th>
                      <th className="p-2.5 w-24 border-r border-slate-200">Brand</th>
                      <th className="p-2.5 w-32 border-r border-slate-200">Category</th>
                      <th className="p-2.5 w-20 text-center border-r border-slate-200">
                        <span className="inline-flex items-center gap-0.5">
                          Type
                          <span className="text-[10px] text-slate-400">❓</span>
                        </span>
                      </th>
                      <th className="p-2.5 text-right w-28 border-r border-slate-200">Purchase Rate</th>
                      <th className="p-2.5 text-right w-24 border-r border-slate-200">Selling Price</th>
                      <th className="p-2.5 text-center w-20 border-r border-slate-200">Status</th>
                      <th className="p-2.5 text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{item.slNo}</td>
                        <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">{item.serialNo || ''}</td>
                        <td className="p-2.5 border-r border-slate-100 text-center">
                          <BarcodeView code={item.code} />
                        </td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">{item.name}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <NoImageAvailable />
                        </td>
                        <td className="p-2.5 text-center text-slate-700 border-r border-slate-100">{item.unit}</td>
                        <td className="p-2.5 text-slate-700 border-r border-slate-100">{item.brand}</td>
                        <td className="p-2.5 text-slate-700 border-r border-slate-100">{item.category}</td>
                        <td className="p-2.5 text-center text-slate-700 border-r border-slate-100">{item.type}</td>
                        <td className="p-2.5 text-right font-medium text-slate-800 border-r border-slate-100">
                          {item.purchaseRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-700 border-r border-slate-100">
                          {item.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <button
                            type="button"
                            className="w-8 h-4.5 bg-[#10B981] rounded-full relative p-0.5 inline-block transition cursor-pointer shadow-xs"
                            title="Active status toggle"
                          >
                            <span className="w-3.5 h-3.5 bg-white rounded-full block ml-auto shadow-xs"></span>
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                            title="Actions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                <div>
                  Showing 1 to {filteredProducts.length} of {filteredProducts.length} entries
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* STORE & WAREHOUSES TAB VIEW                               */}
        {/* ========================================================= */}
        {mainTab === 'store' && (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Stores & Warehouses</span>
                </div>
                <button type="button" className="flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold uppercase rounded-xs transition shadow-xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD STORE</span>
                </button>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Search Store / Warehouse</label>
                    <input type="text" placeholder="Search store name, code or in-charge..." className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Status</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700">
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold">
                      <th className="p-2.5 w-16 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 border-r border-slate-200">Store Name</th>
                      <th className="p-2.5 border-r border-slate-200">Store Code</th>
                      <th className="p-2.5 border-r border-slate-200">In-Charge Manager</th>
                      <th className="p-2.5 border-r border-slate-200">Phone</th>
                      <th className="p-2.5 border-r border-slate-200">Address / Location</th>
                      <th className="p-2.5 border-r border-slate-200">Capacity</th>
                      <th className="p-2.5 text-center border-r border-slate-200">Status</th>
                      <th className="p-2.5 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mockStoresList.map((str) => (
                      <tr key={str.id} className="hover:bg-blue-50/40">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{str.slNo}</td>
                        <td className="p-2.5 border-r border-slate-100 font-bold text-slate-800">{str.name}</td>
                        <td className="p-2.5 border-r border-slate-100 font-mono text-slate-600">{str.code}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-slate-700">{str.manager}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600 font-mono">{str.phone}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{str.location}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{str.capacity}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-800">{str.status}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button type="button" className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B1E2E] text-white rounded text-xs cursor-pointer"><Settings className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-200 text-xs text-slate-600 bg-white">
                Showing 1 to {mockStoresList.length} of {mockStoresList.length} entries
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* MANUFACTURING TAB VIEW                                    */}
        {/* ========================================================= */}
        {mainTab === 'manufacturing' && (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Manufacturing & Work Orders</span>
                </div>
                <button type="button" className="flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold uppercase rounded-xs transition shadow-xs cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ NEW WORK ORDER</span>
                </button>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Search Work Order</label>
                    <input type="text" placeholder="Search work order no or product..." className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Production Status</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700">
                      <option value="All">All Status</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 font-medium block">Product Filter</label>
                    <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700">
                      <option value="All">All Products</option>
                      <option value="AC">CASSETTE AC</option>
                      <option value="Cooler">WATER COOLERS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold">
                      <th className="p-2.5 w-16 text-center border-r border-slate-200">SL.No</th>
                      <th className="p-2.5 border-r border-slate-200">Work Order No.</th>
                      <th className="p-2.5 border-r border-slate-200">Product Name</th>
                      <th className="p-2.5 text-center border-r border-slate-200">Target Qty</th>
                      <th className="p-2.5 text-center border-r border-slate-200">Produced Qty</th>
                      <th className="p-2.5 border-r border-slate-200">Start Date</th>
                      <th className="p-2.5 border-r border-slate-200">End Date</th>
                      <th className="p-2.5 text-center border-r border-slate-200">Status</th>
                      <th className="p-2.5 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {mockManufacturingOrders.map((mfr) => (
                      <tr key={mfr.id} className="hover:bg-blue-50/40">
                        <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{mfr.slNo}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-[#2563EB]">{mfr.workOrderNo}</td>
                        <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">{mfr.product}</td>
                        <td className="p-2.5 text-center border-r border-slate-100 font-bold text-slate-800">{mfr.targetQty}</td>
                        <td className="p-2.5 text-center border-r border-slate-100 font-bold text-green-700">{mfr.producedQty}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{mfr.startDate}</td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-600">{mfr.endDate}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className={cn('px-2 py-0.5 rounded text-[11px] font-semibold', mfr.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')}>{mfr.status}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button type="button" className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B1E2E] text-white rounded text-xs cursor-pointer"><Settings className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-200 text-xs text-slate-600 bg-white">
                Showing 1 to {mockManufacturingOrders.length} of {mockManufacturingOrders.length} entries
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* STOCK MODULE (STANDARD, MINIMAL, ADJUSTMENT, TRANSFER)     */}
        {/* ========================================================= */}
        {mainTab === 'stock' && (
          <>
            {activeSubTab === 'adjustment' ? (
              /* --------------------------------------------------------- */
              /* STOCK ADJUSTMENT SUB-VIEW (Exact Cezcon CRM Layout)      */
              /* --------------------------------------------------------- */
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                {/* Header Title */}
                <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center gap-1.5 font-bold text-slate-700">
                  <SquarePen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Stock Adjustment</span>
                </div>

                <div className="p-6 space-y-5 bg-white">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-medium block">Select Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="Select">Select</option>
                        <option value="CASSETTE AC">CASSETTE AC</option>
                        <option value="SPLIT AC">SPLIT AC</option>
                        <option value="WATER COOLERS">WATER COOLERS</option>
                        <option value="DEHUMIDIFIERS">DEHUMIDIFIERS</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 font-medium block">Select Brand</label>
                      <select
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="Select">Select</option>
                        <option value="MITSUBISHI">MITSUBISHI</option>
                        <option value="O GENERAL">O GENERAL</option>
                        <option value="CARRIER">CARRIER</option>
                        <option value="MIDEA">MIDEA</option>
                        <option value="CLIVET">CLIVET</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 font-medium block">Select Unit</label>
                      <select
                        value={filterUnit}
                        onChange={(e) => setFilterUnit(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="Select">Select</option>
                        <option value="Each">Each</option>
                        <option value="Nos">Nos</option>
                        <option value="Set">Set</option>
                        <option value="Box">Box</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-medium block">Select Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="All">All</option>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 font-medium block">Select Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-600 font-medium block">Search Item</label>
                      <input
                        type="text"
                        placeholder="Search product serial no, code or name..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Load Button on bottom right */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition"
                    >
                      <Search className="w-3.5 h-3.5 text-white" />
                      <span>Load</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeSubTab === 'transfer' ? (
              /* --------------------------------------------------------- */
              /* STOCK TRANSFER SUB-VIEW (Exact Cezcon CRM Layout)         */
              /* --------------------------------------------------------- */
              <>
                {/* Filter Criteria Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                  {/* Header */}
                  <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      <span>Stock Transfer</span>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold uppercase rounded-xs transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>STOCK TRANSFER</span>
                    </button>
                  </div>

                  {/* Filter Body */}
                  <div className="p-4 sm:p-5 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Owner</label>
                        <select
                          value={transferOwner}
                          onChange={(e) => setTransferOwner(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="Select">Select</option>
                          <option value="Muhammad Ali">Muhammad Ali</option>
                          <option value="Alex Rivera">Alex Rivera</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Date</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Select Start and End Date"
                            value={transferDateRange}
                            onChange={(e) => setTransferDateRange(e.target.value)}
                            className="w-full px-2.5 py-1.5 pr-7 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 placeholder:text-slate-400"
                          />
                          {transferDateRange ? (
                            <button
                              type="button"
                              onClick={() => setTransferDateRange('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          ) : (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs select-none">
                              ✕
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Transfer Table Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                  {/* Table Controls */}
                  <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>Shows</span>
                      <select
                        value={transferRowsPerPage}
                        onChange={(e) => setTransferRowsPerPage(Number(e.target.value))}
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
                        placeholder="Search Stock Transfer"
                        value={transferSearch}
                        onChange={(e) => setTransferSearch(e.target.value)}
                        className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                    </div>
                  </div>

                  {/* Native Mobile Transfer Cards */}
                  <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                    {filteredTransfers.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 bg-white rounded border border-slate-200">
                        No records.
                      </div>
                    ) : (
                      filteredTransfers.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-[#2563EB] text-xs">{item.transferNo}</span>
                              <div className="text-[10px] text-slate-500">Date: {item.date}</div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.ownerAvatar ? (
                                <img src={item.ownerAvatar} alt={item.owner} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center">
                                  {item.owner.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="text-[11px] text-slate-600 font-medium">{item.owner}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-1 bg-slate-50/50 rounded p-2 border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-500 block">From</span>
                              <span className="font-medium text-slate-800 text-xs">{item.transferFrom}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">To</span>
                              <span className="font-medium text-slate-800 text-xs">{item.transferTo}</span>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B1E2E] text-white rounded text-xs cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Action</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Table Content (Desktop Viewports) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                          <th className="p-2.5 w-16 text-center border-r border-slate-200">SL.No</th>
                          <th className="p-2.5 w-36 border-r border-slate-200">Transfer No.</th>
                          <th className="p-2.5 w-32 border-r border-slate-200">Date</th>
                          <th className="p-2.5 w-24 text-center border-r border-slate-200">Owner</th>
                          <th className="p-2.5 border-r border-slate-200">Transfer From</th>
                          <th className="p-2.5 border-r border-slate-200">Transfer To</th>
                          <th className="p-2.5 w-24 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredTransfers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-3 text-left text-slate-800 text-xs bg-white">
                              No records.
                            </td>
                          </tr>
                        ) : (
                          filteredTransfers.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">
                                {item.slNo}
                              </td>
                              <td className="p-2.5 border-r border-slate-100">
                                <span className="text-[#2563EB] hover:underline cursor-pointer font-medium">
                                  {item.transferNo}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-700 border-r border-slate-100">
                                {item.date}
                              </td>
                              <td className="p-2.5 text-center border-r border-slate-100">
                                {item.ownerAvatar ? (
                                  <img
                                    src={item.ownerAvatar}
                                    alt={item.owner}
                                    className="w-6 h-6 rounded-full object-cover inline-block mx-auto border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center mx-auto">
                                    {item.owner.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5 border-r border-slate-100">
                                <span className="text-[#2563EB] font-medium">{item.transferFrom}</span>
                              </td>
                              <td className="p-2.5 border-r border-slate-100">
                                <span className="text-[#2563EB] font-medium">{item.transferTo}</span>
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                  title="Actions"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                    <div>
                      Showing {filteredTransfers.length > 0 ? 1 : 0} to {filteredTransfers.length} of {filteredTransfers.length} entries
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* --------------------------------------------------------- */
              /* STANDARD STOCK & MINIMAL STOCK VIEW                       */
              /* --------------------------------------------------------- */
              <>
                {/* 2. TOP FILTER CRITERIA CARD */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                  {/* Header Title */}
                  <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center gap-1.5 font-bold text-slate-700">
                    {activeSubTab === 'minimal' ? (
                      <>
                        <span className="w-4 h-4 rounded bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          ▲
                        </span>
                        <span>Minimal Stock</span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        <span>Stock</span>
                      </>
                    )}
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Category</label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="Select">Select</option>
                          <option value="CASSETTE AC">CASSETTE AC</option>
                          <option value="SPLIT AC">SPLIT AC</option>
                          <option value="WATER COOLERS">WATER COOLERS</option>
                          <option value="DEHUMIDIFIERS">DEHUMIDIFIERS</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Brand</label>
                        <select
                          value={filterBrand}
                          onChange={(e) => setFilterBrand(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="Select">Select</option>
                          <option value="MITSUBISHI">MITSUBISHI</option>
                          <option value="O GENERAL">O GENERAL</option>
                          <option value="CARRIER">CARRIER</option>
                          <option value="MIDEA">MIDEA</option>
                          <option value="CLIVET">CLIVET</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Unit</label>
                        <select
                          value={filterUnit}
                          onChange={(e) => setFilterUnit(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="Select">Select</option>
                          <option value="Each">Each</option>
                          <option value="Nos">Nos</option>
                          <option value="Set">Set</option>
                          <option value="Box">Box</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Type</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="All">All</option>
                          <option value="Product">Product</option>
                          <option value="Service">Service</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="All">All</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium block">Select Store</label>
                        <select
                          value={filterStore}
                          onChange={(e) => setFilterStore(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="All Store">All Store</option>
                          <option value="Main Warehouse">Main Warehouse</option>
                          <option value="Store 1">Store 1</option>
                          <option value="Store 2">Store 2</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. MAIN STOCK DATA TABLE SECTION */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
                  {/* Table Controls (Rows and Search) */}
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
                        placeholder="Search"
                        value={stockSearch}
                        onChange={(e) => {
                          setStockSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                    </div>
                  </div>

                  {/* Native Mobile Stock Cards */}
                  <div className="block md:hidden p-3 space-y-3 bg-slate-50/50">
                    {activeSubTab === 'minimal' || paginatedItems.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 bg-white rounded border border-slate-200 text-xs">
                        No records.
                      </div>
                    ) : (
                      paginatedItems.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-slate-900 text-xs leading-tight block">{item.name}</span>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                                  {item.category}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">
                                  {item.brand}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10px] text-slate-500 block">Stock Qty</span>
                              <span className="font-bold text-sm text-slate-900 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {item.stock}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center py-1 bg-slate-50/80 rounded border border-slate-100">
                            <BarcodeView code={item.code} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 py-1.5 border-t border-b border-slate-100 text-center bg-slate-50/50 rounded">
                            <div>
                              <div className="text-[10px] text-slate-500">Purchase Rate</div>
                              <div className="font-semibold text-slate-800">
                                {item.purchaseRate.toLocaleString('en-US', { minimumFractionDigits: 2 })} AED
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500">Selling Price</div>
                              <div className="font-bold text-slate-900">
                                {item.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} AED
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-slate-500">Unit: <strong className="text-slate-700">{item.unit}</strong> | Min: <strong className="text-slate-700">{item.minStock || '—'}</strong></span>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-xs cursor-pointer shadow-xs transition"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Details</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cezcon Standard Stock Table (Desktop Viewports) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                          <th className="p-2.5 w-12 text-center border-r border-slate-200">SL.No</th>
                          <th className="p-2.5 w-20 text-center border-r border-slate-200">Serial No.</th>
                          <th className="p-2.5 w-44 text-center border-r border-slate-200">Code</th>
                          <th className="p-2.5 border-r border-slate-200">Name</th>
                          <th className="p-2.5 w-16 text-center border-r border-slate-200">Image</th>
                          <th className="p-2.5 w-16 text-center border-r border-slate-200">Unit</th>
                          <th className="p-2.5 w-28 border-r border-slate-200">Brand</th>
                          <th className="p-2.5 w-28 border-r border-slate-200">Category</th>
                          <th className="p-2.5 w-20 border-r border-slate-200">
                            <span className="flex items-center gap-1">
                              Type <Info className="w-3 h-3 text-slate-400" />
                            </span>
                          </th>
                          <th className="p-2.5 text-right w-24 border-r border-slate-200">Purchase Rate</th>
                          <th className="p-2.5 text-right w-24 border-r border-slate-200">Selling Price</th>
                          <th className="p-2.5 text-center w-20 border-r border-slate-200">Minimum Stock</th>
                          <th className="p-2.5 text-center w-16 border-r border-slate-200 font-bold">Stock</th>
                          <th className="p-2.5 text-center w-16 pr-3">View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activeSubTab === 'minimal' ? (
                          <tr>
                            <td colSpan={14} className="p-3 text-left text-slate-800 text-xs bg-white">
                              No records.
                            </td>
                          </tr>
                        ) : paginatedItems.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="p-3 text-left text-slate-800 text-xs bg-white">
                              No records.
                            </td>
                          </tr>
                        ) : (
                          paginatedItems.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">
                                {item.slNo}
                              </td>
                              <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">
                                {item.serialNo || '—'}
                              </td>
                              <td className="p-2 border-r border-slate-100">
                                <BarcodeView code={item.code} />
                              </td>
                              <td className="p-2.5 font-medium text-slate-800 border-r border-slate-100 leading-snug">
                                {item.name}
                              </td>
                              <td className="p-2 text-center border-r border-slate-100">
                                <NoImageAvailable />
                              </td>
                              <td className="p-2.5 text-center text-slate-600 border-r border-slate-100">
                                {item.unit}
                              </td>
                              <td className="p-2.5 text-slate-700 font-medium border-r border-slate-100">
                                {item.brand}
                              </td>
                              <td className="p-2.5 text-slate-700 border-r border-slate-100">
                                {item.category}
                              </td>
                              <td className="p-2.5 text-slate-600 border-r border-slate-100">
                                {item.type}
                              </td>
                              <td className="p-2.5 text-right font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                                {item.purchaseRate.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="p-2.5 text-right font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap">
                                {item.sellingPrice.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">
                                {item.minStock || '—'}
                              </td>
                              <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-100">
                                {item.stock}
                              </td>
                              <td className="p-2.5 text-center pr-3">
                                <button
                                  type="button"
                                  className="px-2 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-xs flex items-center justify-center gap-1 mx-auto cursor-pointer shadow-xs transition"
                                  title="View Stock Details"
                                >
                                  <FileText className="w-3 h-3" />
                                  <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer / Pagination */}
                  <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600 bg-white">
                    {activeSubTab === 'minimal' ? (
                      <div>Showing 0 to 0 of 0 entries</div>
                    ) : (
                      <>
                        <div>
                          Showing 1 to {paginatedItems.length} of {filteredStockItems.length > 10 ? '2,160' : filteredStockItems.length} entries
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
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
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-xs text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Purchase Module...</span>
        </div>
      }
    >
      <PurchasePageInner />
    </Suspense>
  );
}
