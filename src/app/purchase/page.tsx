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
  Download,
  FilePlus,
  CreditCard,
  Building2,
  Calendar,
  ArrowLeftRight,
  Upload,
  Phone,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  ArrowLeft,
  List,
  Printer,
} from 'lucide-react';
import { mockCezconStockItems, mockStockTransfers } from '@/data/mockEnterpriseData';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmCezconStock, CrmStockTransfer } from '@/types/enterprise-crm';
import { ProductSettingItem } from '@/types/settings';
import { authMockService, MockAuthUser } from '@/services/authMockService';
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

// Live date helper utilities
const getLiveTodayFormatted = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const getLiveTodayDateString = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getLiveFirstDayOfMonth = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `01-${month}-${year}`;
};

const getLiveMonthRangeString = () => {
  return `${getLiveFirstDayOfMonth()} - ${getLiveTodayDateString()}`;
};

// Cezcon Standard Purchase Orders (Live)
const mockPurchaseOrders: any[] = [];
const defaultPurchaseInvoicesList: any[] = [];
const mockPurchasePayments: any[] = [];
const mockStockInList: any[] = [];
const mockSuppliersList: any[] = [];
const mockStoresList: any[] = [];
const mockManufacturingOrders: any[] = [];

function PurchasePageInner() {
  const { users } = useEnterpriseCrm();
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
  const [poDateRange, setPoDateRange] = useState<string>(getLiveMonthRangeString());
  const [poFilterSupplier, setPoFilterSupplier] = useState<string>('Select Supplier');
  const [poSearch, setPoSearch] = useState<string>('');
  const [poRowsPerPage, setPoRowsPerPage] = useState<number>(10);
  const initialDefaultPurchaseOrders = useMemo(
    () => [
      {
        id: 'po_default_1',
        slNo: 1,
        owner: 'MUSTHAFA CHIRAMMAL',
        ownerAvatar: '',
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
        termsCondition: 'Select',
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
      },
    ],
    []
  );

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_purchase_orders');
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'po_default_1',
        slNo: 1,
        owner: 'MUSTHAFA CHIRAMMAL',
        ownerAvatar: '',
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
        termsCondition: 'Select',
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
      },
    ];
  });

  // Purchase Order View Mode & Form State (Exact Cezcon CRM layout)
  const [poViewMode, setPoViewMode] = useState<'list' | 'add' | 'details'>('list');
  const [viewingPo, setViewingPo] = useState<any | null>(null);
  const [poDetailActiveTab, setPoDetailActiveTab] = useState<'details' | 'invoice' | 'do' | 'history'>('details');

  const handleDeletePurchaseOrder = (poId: string, poNumber: string) => {
    if (window.confirm(`Are you sure you want to delete Purchase Order ${poNumber}?`)) {
      const updated = purchaseOrders.filter((po) => po.id !== poId);
      setPurchaseOrders(updated);
      try {
        localStorage.setItem('crm_purchase_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('crm_purchase_orders_updated'));
      } catch (e) {
        console.error(e);
      }
      setActivePoActionDropdownId(null);
      if (viewingPo?.id === poId) {
        setViewingPo(null);
        setPoViewMode('list');
      }
    }
  };

  // Change PO Status Modal State
  const [isChangePoStatusModalOpen, setIsChangePoStatusModalOpen] = useState(false);
  const [poStatusModalSelectedStatus, setPoStatusModalSelectedStatus] = useState<'Approve' | 'Reject' | 'Change to Pending'>('Approve');
  const [poStatusModalComments, setPoStatusModalComments] = useState('');
  const [poStatusTargetPo, setPoStatusTargetPo] = useState<any | null>(null);

  // Change Delivery Status Modal State
  const [isChangeDeliveryStatusModalOpen, setIsChangeDeliveryStatusModalOpen] = useState(false);
  const [deliveryStatusModalSelected, setDeliveryStatusModalSelected] = useState<'Delivered' | 'Partially Delivered' | 'Pending'>('Pending');
  const [deliveryStatusTargetPo, setDeliveryStatusTargetPo] = useState<any | null>(null);

  // Change Payment Status Modal State
  const [isChangePaymentStatusModalOpen, setIsChangePaymentStatusModalOpen] = useState(false);
  const [paymentStatusModalSelected, setPaymentStatusModalSelected] = useState<'Paid' | 'Partially Paid' | 'Due'>('Due');
  const [paymentStatusTargetRecord, setPaymentStatusTargetRecord] = useState<any | null>(null);

  const handleOpenChangeDeliveryStatus = (target: any) => {
    setDeliveryStatusTargetPo(target);
    const cur = target?.deliveryStatus || 'Pending';
    setDeliveryStatusModalSelected(
      (['Delivered', 'Partially Delivered', 'Pending'].includes(cur) ? cur : 'Pending') as any
    );
    setIsChangeDeliveryStatusModalOpen(true);
  };

  const handleOpenChangePaymentStatus = (target: any) => {
    setPaymentStatusTargetRecord(target);
    const cur = target?.status || 'Due';
    setPaymentStatusModalSelected(
      (['Paid', 'Partially Paid', 'Due'].includes(cur) ? cur : 'Due') as any
    );
    setIsChangePaymentStatusModalOpen(true);
  };

  const handleSaveDeliveryStatus = () => {
    const target = deliveryStatusTargetPo || viewingInvoiceRecord || viewingPo;
    if (target) {
      const isInvoice = Boolean(
        target.invoiceNumber ||
        target.pisn ||
        (viewingInvoiceRecord && (viewingInvoiceRecord.id === target.id || viewingInvoiceRecord.invoiceNumber === target.invoiceNumber))
      );

      if (isInvoice) {
        const updatedInvoices = purchaseInvoicesList.map((inv) =>
          inv.id === target.id || (target.invoiceNumber && inv.invoiceNumber === target.invoiceNumber)
            ? { ...inv, deliveryStatus: deliveryStatusModalSelected }
            : inv
        );
        setPurchaseInvoicesList(updatedInvoices);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_purchase_invoices_list', JSON.stringify(updatedInvoices));
            window.dispatchEvent(new Event('crm_purchase_invoices_updated'));
          } catch (e) {
            console.error(e);
          }
        }
        if (
          viewingInvoiceRecord &&
          (viewingInvoiceRecord.id === target.id || viewingInvoiceRecord.invoiceNumber === target.invoiceNumber)
        ) {
          setViewingInvoiceRecord((prev: any) =>
            prev ? { ...prev, deliveryStatus: deliveryStatusModalSelected } : null
          );
        }
      }

      const targetPoNum = target.poNumber || target.id;
      if (targetPoNum || !isInvoice) {
        const updatedPOs = purchaseOrders.map((p) =>
          p.id === target.id || p.poNumber === target.poNumber || (targetPoNum && p.poNumber === targetPoNum)
            ? { ...p, deliveryStatus: deliveryStatusModalSelected }
            : p
        );
        setPurchaseOrders(updatedPOs);
        if (viewingPo && (viewingPo.id === target.id || viewingPo.poNumber === target.poNumber)) {
          setViewingPo((prev: any) =>
            prev ? { ...prev, deliveryStatus: deliveryStatusModalSelected } : null
          );
        }
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_purchase_orders', JSON.stringify(updatedPOs));
            window.dispatchEvent(new Event('crm_purchase_orders_updated'));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    setIsChangeDeliveryStatusModalOpen(false);
    setDeliveryStatusTargetPo(null);
  };

  const handleSavePaymentStatus = () => {
    const target = paymentStatusTargetRecord || viewingInvoiceRecord;
    if (target) {
      const updatedInvoices = purchaseInvoicesList.map((inv) =>
        inv.id === target.id || (target.invoiceNumber && inv.invoiceNumber === target.invoiceNumber)
          ? { ...inv, status: paymentStatusModalSelected }
          : inv
      );
      setPurchaseInvoicesList(updatedInvoices);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('crm_purchase_invoices_list', JSON.stringify(updatedInvoices));
          window.dispatchEvent(new Event('crm_purchase_invoices_updated'));
        } catch (e) {
          console.error(e);
        }
      }
      if (
        viewingInvoiceRecord &&
        (viewingInvoiceRecord.id === target.id || viewingInvoiceRecord.invoiceNumber === target.invoiceNumber)
      ) {
        setViewingInvoiceRecord((prev: any) =>
          prev ? { ...prev, status: paymentStatusModalSelected } : null
        );
      }
    }
    setIsChangePaymentStatusModalOpen(false);
    setPaymentStatusTargetRecord(null);
  };

  const getDeliveryStatusBadgeClass = (status?: string) => {
    const s = (status || 'Pending').toLowerCase().trim();
    if (s.includes('delivered') && !s.includes('partial')) {
      return 'bg-[#16A34A] hover:bg-[#15803D] text-white'; // Green for Delivered / Completed
    }
    if (s.includes('partial')) {
      return 'bg-[#F97316] hover:bg-[#EA580C] text-white'; // Orange for Partial
    }
    return 'bg-[#EAB308] hover:bg-[#CA8A04] text-white'; // Yellow for Pending
  };

  const getPaymentStatusBadgeClass = (status?: string) => {
    const s = (status || 'Due').toLowerCase().trim();
    if (s.includes('paid') && !s.includes('partial')) {
      return 'bg-[#16A34A] hover:bg-[#15803D] text-white'; // Green for Paid / Completed
    }
    if (s.includes('partial')) {
      return 'bg-[#F97316] hover:bg-[#EA580C] text-white'; // Orange for Partial
    }
    return 'bg-[#EAB308] hover:bg-[#CA8A04] text-white'; // Yellow for Due / Pending
  };

  // Supplier contact helper
  const getSupplierContactInfo = (supplierName: string) => {
    if (!supplierName || supplierName === 'Select Supplier') return { phone: '', email: '' };
    if (supplierName.toLowerCase().includes('lutfi')) {
      return { phone: '+97142225335', email: 'info@lutfigroup.com' };
    }
    if (supplierName.toLowerCase().includes('super general')) {
      return { phone: '+971 4 883 1255', email: 'sales@supergeneral.com' };
    }
    if (supplierName.toLowerCase().includes('al ghandi')) {
      return { phone: '+971 4 231 0000', email: 'info@alghandi.com' };
    }
    if (supplierName.toLowerCase().includes('eros')) {
      return { phone: '+971 4 222 2221', email: 'support@erosgroup.ae' };
    }
    const clean = supplierName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return { phone: '+971 4 288 9900', email: `info@${clean || 'supplier'}.ae` };
  };

  // Sync URL view parameter
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (mainTab === 'po' && viewId) {
      const found = purchaseOrders.find(
        (p) => String(p.id) === String(viewId) || String(p.poNumber).toLowerCase() === String(viewId).toLowerCase()
      );
      if (found) {
        setViewingPo(found);
        setPoViewMode('details');
      } else if (purchaseOrders.length > 0) {
        setViewingPo(purchaseOrders[0]);
        setPoViewMode('details');
      }
    }
  }, [searchParams, mainTab, purchaseOrders]);
  const [poFormData, setPoFormData] = useState({
    owner: 'Rashid Ali',
    poNumber: 'CTPO#2544',
    reference: '',
    poDate: getLiveTodayDateString(),
    expectedDeliveryDate: '',
    supplier: 'Select Supplier',
    shipTo: false,
    poType: 'Manual Creation',
    description: '',
    opportunityOrder: 'Select Opportunity/Order',
    projectNumber: '',
    projectName: '',
    vatType: 'with_vat' as 'with_vat' | 'without_vat',
    attention: '',
    preparedBy: 'Rashid Ali',
    preparedByMobile: '+971 50 123 4567',
    preparedByEmail: 'rashid@cooltechnologies.ae',
    preparedByDesignation: 'Purchase Manager',
    termsCondition: 'Select',
    termsConditionText: '',
    discount: 0,
    adjustment: 0,
    vatRate: 5,
  });

  const [poOwnersList, setPoOwnersList] = useState<string[]>([
    'Rashid Ali',
    'Muhammad Ali',
    'Super Admin',
    'Shaheer',
  ]);
  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState<boolean>(false);
  const [newOwnerInputName, setNewOwnerInputName] = useState<string>('');

  const DEFAULT_PO_TERMS_TEMPLATES: Record<string, string> = {
    'Standard Payment Terms (30 Days)': `1. Payment Terms: 30 days from invoice date.\n2. Delivery: 3 to 5 working days from receipt of confirmed LPO.\n3. Warranty: 12 months standard warranty against manufacturing defects.\n4. Defective or non-conforming items will be replaced within 48 hours.\n5. VAT: 5% applicable as per UAE FTA regulations.`,
    'Cash on Delivery (COD)': `1. Payment: 100% Cash / Cheque upon delivery and inspection.\n2. Delivery: Immediate delivery against confirmed LPO.\n3. Full warranty and documentation must be provided with shipment.`,
    '100% Advance Payment': `1. Payment: 100% Advance against proforma invoice.\n2. Expected delivery within 3-5 working days upon payment clearance.\n3. Material inspection report to be provided prior to dispatch.`,
    '50% Advance, 50% on Delivery': `1. Payment: 50% Advance with LPO confirmation, 50% upon delivery to site/warehouse.\n2. Delivery timeline: 5 to 7 working days.\n3. Final payment released after technical inspection.`,
  };

  const [poTermsTemplates, setPoTermsTemplates] = useState<Record<string, string>>(DEFAULT_PO_TERMS_TEMPLATES);
  const [isAddPoTermsModalOpen, setIsAddPoTermsModalOpen] = useState<boolean>(false);
  const [newPoTermsTitle, setNewPoTermsTitle] = useState<string>('');
  const [newPoTermsContent, setNewPoTermsContent] = useState<string>('');
  const [poTermsToast, setPoTermsToast] = useState<string | null>(null);

  const showPoTermsToast = (msg: string) => {
    setPoTermsToast(msg);
    setTimeout(() => setPoTermsToast(null), 3000);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cezcon_saved_terms_templates') || localStorage.getItem('crm_po_terms_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setPoTermsTemplates((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [isPoNumberSettingsModalOpen, setIsPoNumberSettingsModalOpen] = useState<boolean>(false);
  const [poPrefix, setPoPrefix] = useState<string>('CTPO#');
  const [poNextNumber, setPoNextNumber] = useState<string>('2544');

  const handleSavePoNumberSettings = () => {
    const combined = `${poPrefix}${poNextNumber}`;
    setPoFormData((prev) => ({ ...prev, poNumber: combined }));
    setIsPoNumberSettingsModalOpen(false);
  };

  const handleAddNewOwner = () => {
    if (!newOwnerInputName.trim()) return;
    const trimmed = newOwnerInputName.trim();
    if (!poOwnersList.includes(trimmed)) {
      setPoOwnersList((prev) => [...prev, trimmed]);
    }
    setPoFormData((prev) => ({ ...prev, owner: trimmed }));
    setNewOwnerInputName('');
    setIsAddOwnerModalOpen(false);
  };

  const [poLineItems, setPoLineItems] = useState<
    Array<{
      id: string;
      description: string;
      code: string;
      unit: string;
      brand: string;
      qty: number;
      amount: number;
    }>
  >([
    {
      id: 'line_1',
      description: '',
      code: '',
      unit: '',
      brand: '',
      qty: 1,
      amount: 0,
    },
  ]);

  const poCalculatedAmount = useMemo(() => {
    return poLineItems.reduce((acc, item) => acc + Number(item.qty || 0) * Number(item.amount || 0), 0);
  }, [poLineItems]);

  const poCalculatedVat = useMemo(() => {
    if (poFormData.vatType !== 'with_vat') return 0;
    const base = Math.max(0, poCalculatedAmount - (Number(poFormData.discount) || 0));
    return base * 0.05;
  }, [poCalculatedAmount, poFormData.vatType, poFormData.discount]);

  const poCalculatedTotal = useMemo(() => {
    const afterDiscount = Math.max(0, poCalculatedAmount - (Number(poFormData.discount) || 0));
    const vat = poFormData.vatType === 'with_vat' ? afterDiscount * 0.05 : 0;
    const adjustment = Number(poFormData.adjustment) || 0;
    return afterDiscount + vat + adjustment;
  }, [poCalculatedAmount, poFormData.vatType, poFormData.discount, poFormData.adjustment]);

  // Stock In State & Form (Exact Cezcon CRM Add Stock In)
  const [stockInViewMode, setStockInViewMode] = useState<'add' | 'register' | 'view'>('register');
  const [editingStockInId, setEditingStockInId] = useState<string | null>(null);
  const [viewingStockInRecord, setViewingStockInRecord] = useState<any | null>(null);
  const [stockInSupplierFilter, setStockInSupplierFilter] = useState<string>('All');
  const [stockInSearch, setStockInSearch] = useState<string>('');
  const [stockInRowsPerPage, setStockInRowsPerPage] = useState<number>(10);
  const [stockInCurrentPage, setStockInCurrentPage] = useState<number>(1);
  const [activeStockInDropdownId, setActiveStockInDropdownId] = useState<string | null>(null);

  const [stockInDate, setStockInDate] = useState<string>(getLiveTodayDateString());
  const [stockInNumber, setStockInNumber] = useState<string>('STK-924');
  const [stockInStore, setStockInStore] = useState<string>('Select');
  const [stockInDeliveryNote, setStockInDeliveryNote] = useState<string>('');
  const [stockInDoFileName, setStockInDoFileName] = useState<string>('');
  const [stockInSupplier, setStockInSupplier] = useState<string>('Select');
  const [stockInOrder, setStockInOrder] = useState<string>('Select Order');
  const [stockInLpoNumber, setStockInLpoNumber] = useState<string>('');
  const [stockInPurchaseInvoiceNumber, setStockInPurchaseInvoiceNumber] = useState<string>('');
  const [isStockInNewSupplierOpen, setIsStockInNewSupplierOpen] = useState(false);
  const [stockInNewSupplierInput, setStockInNewSupplierInput] = useState('');
  const [stockInSupplierList, setStockInSupplierList] = useState<string[]>([
    'Shajarath Al Thalj Trading LLC',
    'CENTRAL TRADING COMPANY LLC',
    'LUTFI TRADING LLC',
    'SUPER GENERAL COMPANY LLC',
    'AL GHANDI ELECTRONICS',
    'EROS GROUP LLC',
    'MITSUBISHI ELECTRIC CORP',
  ]);

  const [stockInItems, setStockInItems] = useState<
    Array<{
      id: string;
      item: string;
      unit: string;
      purchaseRate: string;
      sellingPrice: string;
      qty: string;
    }>
  >([
    {
      id: 'si_item_1',
      item: '',
      unit: '',
      purchaseRate: '',
      sellingPrice: '',
      qty: '',
    },
  ]);

  const defaultStockInList = [
    {
      id: 'si_923',
      slNo: 1,
      stockInNo: 'STK 923',
      date: '03-10-2026',
      supplier: 'Shajarath Al Thalj For Freezer Manufacturing LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2528',
      store: 'M-42 OFFICE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'SAT 03-10-2026 3:33:03 PM',
      items: [
        {
          slNo: 1,
          code: 'CT25F2-01',
          item: '25 usg water cooler cooltech',
          unit: 'Pcs',
          brand: 'COOLTECH',
          purchaseRate: '625.00',
          sellingPrice: '0.00',
          qty: '5',
          currentStock: '5',
        },
      ],
      files: [],
    },
    {
      id: 'si_922',
      slNo: 2,
      stockInNo: 'STK 922',
      date: '02-10-2026',
      supplier: 'CENTRAL TRADING COMPANY LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2527',
      store: 'MAIN WAREHOUSE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'FRI 02-10-2026 10:15:20 AM',
      items: [
        {
          slNo: 1,
          code: 'RF-140-SN',
          item: 'REFRIGERATOR 140 LTR SINGLE DOOR NOBEL NR140',
          unit: 'Pcs',
          brand: 'NOBEL',
          purchaseRate: '335.00',
          sellingPrice: '420.00',
          qty: '10',
          currentStock: '10',
        },
      ],
      files: [],
    },
    {
      id: 'si_921',
      slNo: 3,
      stockInNo: 'STK 921',
      date: '01-10-2026',
      supplier: 'LUTFI TRADING LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2526',
      store: 'M-42 OFFICE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'THU 01-10-2026 02:45:10 PM',
      items: [
        {
          slNo: 1,
          code: 'MS-20T',
          item: 'MITSUBISHI SPLIT AC 2.0 TON',
          unit: 'Set',
          brand: 'MITSUBISHI',
          purchaseRate: '1850.00',
          sellingPrice: '2300.00',
          qty: '4',
          currentStock: '4',
        },
      ],
      files: [],
    },
    {
      id: 'si_920',
      slNo: 4,
      stockInNo: 'STK 920',
      date: '30-09-2026',
      supplier: 'SUPER GENERAL COMPANY LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2525',
      store: 'MAIN WAREHOUSE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'WED 30-09-2026 11:20:00 AM',
      items: [
        {
          slNo: 1,
          code: 'SG-15R',
          item: 'SUPER GENERAL 1.5 TON ROTARY AC',
          unit: 'Set',
          brand: 'SUPER GENERAL',
          purchaseRate: '1200.00',
          sellingPrice: '1550.00',
          qty: '8',
          currentStock: '8',
        },
      ],
      files: [],
    },
    {
      id: 'si_919',
      slNo: 5,
      stockInNo: 'STK 919',
      date: '29-09-2026',
      supplier: 'AL GHANDI ELECTRONICS',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2524',
      store: 'M-42 OFFICE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'TUE 29-09-2026 04:10:00 PM',
      items: [
        {
          slNo: 1,
          code: 'NIC101',
          item: 'Single Ring Infrared Cooker-Touch Control Nobel I',
          unit: 'Pcs',
          brand: 'NOBEL',
          purchaseRate: '85.00',
          sellingPrice: '110.00',
          qty: '15',
          currentStock: '15',
        },
      ],
      files: [],
    },
    {
      id: 'si_918',
      slNo: 6,
      stockInNo: 'STK 918',
      date: '28-09-2026',
      supplier: 'EROS GROUP LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2523',
      store: 'MAIN WAREHOUSE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'MON 28-09-2026 01:15:00 PM',
      items: [
        {
          slNo: 1,
          code: 'PF-56',
          item: 'PANASONIC CEILING FAN 56 INCH',
          unit: 'Pcs',
          brand: 'PANASONIC',
          purchaseRate: '145.00',
          sellingPrice: '195.00',
          qty: '20',
          currentStock: '20',
        },
      ],
      files: [],
    },
    {
      id: 'si_917',
      slNo: 7,
      stockInNo: 'STK 917',
      date: '27-09-2026',
      supplier: 'MITSUBISHI ELECTRIC CORP',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2522',
      store: 'M-42 OFFICE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'SUN 27-09-2026 12:00:00 PM',
      items: [
        {
          slNo: 1,
          code: 'DK-25C',
          item: 'DAIKIN 2.5 TON CASSETTE AC',
          unit: 'Set',
          brand: 'DAIKIN',
          purchaseRate: '3200.00',
          sellingPrice: '4100.00',
          qty: '2',
          currentStock: '2',
        },
      ],
      files: [],
    },
    {
      id: 'si_916',
      slNo: 8,
      stockInNo: 'STK 916',
      date: '26-09-2026',
      supplier: 'Shajarath Al Thalj For Freezer Manufacturing LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2521',
      store: 'MAIN WAREHOUSE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'SAT 26-09-2026 09:30:00 AM',
      items: [
        {
          slNo: 1,
          code: 'CT25F2-01',
          item: '25 usg water cooler cooltech',
          unit: 'Pcs',
          brand: 'COOLTECH',
          purchaseRate: '625.00',
          sellingPrice: '0.00',
          qty: '3',
          currentStock: '3',
        },
      ],
      files: [],
    },
    {
      id: 'si_915',
      slNo: 9,
      stockInNo: 'STK 915',
      date: '25-09-2026',
      supplier: 'CENTRAL TRADING COMPANY LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2520',
      store: 'M-42 OFFICE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'FRI 25-09-2026 03:20:00 PM',
      items: [
        {
          slNo: 1,
          code: 'GR-20I',
          item: 'GREE 2.0 TON INVERTER SPLIT AC',
          unit: 'Set',
          brand: 'GREE',
          purchaseRate: '1650.00',
          sellingPrice: '2100.00',
          qty: '6',
          currentStock: '6',
        },
      ],
      files: [],
    },
    {
      id: 'si_914',
      slNo: 10,
      stockInNo: 'STK 914',
      date: '24-09-2026',
      supplier: 'LUTFI TRADING LLC',
      purchaseInvoiceNumber: '',
      deliveryNote: '',
      lpoNumber: 'CTPO#2519',
      store: 'MAIN WAREHOUSE',
      createdBy: 'MOHAMMED ISHAQ',
      createdFormatted: 'THU 24-09-2026 10:45:00 AM',
      items: [
        {
          slNo: 1,
          code: 'RF-140-SN',
          item: 'REFRIGERATOR 140 LTR SINGLE DOOR NOBEL NR140',
          unit: 'Pcs',
          brand: 'NOBEL',
          purchaseRate: '335.00',
          sellingPrice: '420.00',
          qty: '8',
          currentStock: '8',
        },
      ],
      files: [],
    },
  ];

  const [stockInList, setStockInList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_stock_in_list');
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return defaultStockInList;
  });

  const resetStockInForm = () => {
    setEditingStockInId(null);
    setStockInDate(getLiveTodayDateString());
    setStockInNumber(`STK-${Math.floor(900 + Math.random() * 100)}`);
    setStockInStore('Select');
    setStockInDeliveryNote('');
    setStockInDoFileName('');
    setStockInSupplier('Select');
    setStockInOrder('Select Order');
    setStockInLpoNumber('');
    setStockInPurchaseInvoiceNumber('');
    setStockInItems([
      {
        id: 'si_item_1',
        item: '',
        unit: '',
        purchaseRate: '',
        sellingPrice: '',
        qty: '',
      },
    ]);
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const viewParam = searchParams.get('view');
    if (tabParam === 'stock-in' && viewParam) {
      const match = stockInList.find(
        (s) =>
          s.stockInNo === viewParam ||
          s.id === viewParam ||
          s.stockInNo?.replace(/\s+/g, '') === viewParam.replace(/\s+/g, '')
      );
      if (match) {
        setViewingStockInRecord(match);
        setStockInViewMode('view');
      } else {
        const fallback = defaultStockInList[0];
        setViewingStockInRecord({
          ...fallback,
          stockInNo: viewParam,
        });
        setStockInViewMode('view');
      }
    }
  }, [searchParams, stockInList]);

  const availableStockInProducts = [
    { name: 'COOLER', unit: 'Each', purchaseRate: '2000.00', sellingPrice: '2500.00' },
    { name: 'REFRIGERATOR 140 LTR SINGLE DOOR NOBEL NR140', unit: 'Pcs', purchaseRate: '335.00', sellingPrice: '420.00' },
    { name: 'Single Ring Infrared Cooker-Touch Control Nobel I', unit: 'Pcs', purchaseRate: '85.00', sellingPrice: '110.00' },
    { name: 'MITSUBISHI SPLIT AC 2.0 TON', unit: 'Set', purchaseRate: '1850.00', sellingPrice: '2300.00' },
    { name: 'PANASONIC CEILING FAN 56 INCH', unit: 'Pcs', purchaseRate: '145.00', sellingPrice: '195.00' },
    { name: 'SUPER GENERAL 1.5 TON ROTARY AC', unit: 'Set', purchaseRate: '1200.00', sellingPrice: '1550.00' },
    { name: 'GREE 2.0 TON INVERTER SPLIT AC', unit: 'Set', purchaseRate: '1650.00', sellingPrice: '2100.00' },
    { name: 'DAIKIN 2.5 TON CASSETTE AC', unit: 'Set', purchaseRate: '3200.00', sellingPrice: '4100.00' },
  ];

  const handlePoProductChange = (idx: number, val: string) => {
    const updated = [...poLineItems];
    const found = stockItems.find((s) => s.name === val);
    if (found) {
      updated[idx] = {
        ...updated[idx],
        description: found.name,
        code: found.code || `CQ4N-XMI${idx + 10}S`,
        unit: found.unit || 'Pcs',
        brand: found.brand || 'MIDEA',
        amount: found.purchaseRate || 0,
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        description: val,
      };
    }
    setPoLineItems(updated);
  };

  const handlePoQtyChange = (idx: number, qty: number) => {
    const updated = [...poLineItems];
    updated[idx] = { ...updated[idx], qty: isNaN(qty) ? 0 : qty };
    setPoLineItems(updated);
  };

  const handlePoAmountChange = (idx: number, amt: number) => {
    const updated = [...poLineItems];
    updated[idx] = { ...updated[idx], amount: isNaN(amt) ? 0 : amt };
    setPoLineItems(updated);
  };

  const handlePoAddProductRow = () => {
    setPoLineItems((prev) => [
      ...prev,
      {
        id: `line_${Date.now()}_${prev.length + 1}`,
        description: '',
        code: '',
        unit: '',
        brand: '',
        qty: 1,
        amount: 0,
      },
    ]);
  };

  const handlePoAddDescriptionRow = () => {
    setPoLineItems((prev) => [
      ...prev,
      {
        id: `line_desc_${Date.now()}_${prev.length + 1}`,
        description: '',
        code: '',
        unit: '',
        brand: '',
        qty: 1,
        amount: 0,
      },
    ]);
  };

  const handlePoRemoveLine = (idx: number) => {
    if (poLineItems.length <= 1) {
      setPoLineItems([
        {
          id: `line_${Date.now()}`,
          description: '',
          code: '',
          unit: '',
          brand: '',
          qty: 1,
          amount: 0,
        },
      ]);
      return;
    }
    setPoLineItems(poLineItems.filter((_, i) => i !== idx));
  };

  const handlePoLoadTerms = () => {
    if (!poFormData.termsCondition || poFormData.termsCondition === 'Select') {
      showPoTermsToast('Please select a terms template to load.');
      return;
    }
    const templateContent =
      poTermsTemplates[poFormData.termsCondition] ||
      `1. Payment Condition: ${poFormData.termsCondition}.\n2. Delivery subject to standard company procurement policy.\n3. Goods inspected upon delivery.`;

    setPoFormData((prev) => ({
      ...prev,
      termsConditionText: prev.termsConditionText?.trim()
        ? `${prev.termsConditionText.trim()}\n\n${templateContent}`
        : templateContent,
    }));
    showPoTermsToast(`Loaded "${poFormData.termsCondition}" into editor.`);
  };

  const handlePoClearTerms = () => {
    setPoFormData((prev) => ({
      ...prev,
      termsConditionText: '',
      termsCondition: 'Select',
    }));
    showPoTermsToast('Terms & Conditions cleared.');
  };

  const handlePoDeleteTerms = (titleToDelete?: string) => {
    const target = titleToDelete || (poFormData.termsCondition !== 'Select' ? poFormData.termsCondition : '');
    if (!target) {
      showPoTermsToast('Please select a Terms & Conditions template to delete.');
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to delete the terms template "${target}"?`)) {
      return;
    }

    const updated = { ...poTermsTemplates };
    delete updated[target];
    setPoTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
      localStorage.setItem('crm_po_terms_templates', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    if (poFormData.termsCondition === target) {
      setPoFormData((prev) => ({ ...prev, termsCondition: 'Select' }));
    }
    showPoTermsToast(`Deleted Terms template "${target}".`);
  };

  const handleSaveNewPoTerms = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPoTermsTitle.trim() || !newPoTermsContent.trim()) return;

    const title = newPoTermsTitle.trim();
    const content = newPoTermsContent.trim();
    const updated = { ...poTermsTemplates, [title]: content };
    setPoTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
      localStorage.setItem('crm_po_terms_templates', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setPoFormData((prev) => ({
      ...prev,
      termsCondition: title,
      termsConditionText: prev.termsConditionText?.trim()
        ? `${prev.termsConditionText.trim()}\n\n${content}`
        : content,
    }));

    setIsAddPoTermsModalOpen(false);
    setNewPoTermsTitle('');
    setNewPoTermsContent('');
    showPoTermsToast(`New Terms "${title}" saved and inserted!`);
  };

  const handleAddAnotherPoTerm = () => {
    if (!newPoTermsTitle.trim() || !newPoTermsContent.trim()) return;

    const title = newPoTermsTitle.trim();
    const content = newPoTermsContent.trim();
    const updated = { ...poTermsTemplates, [title]: content };
    setPoTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
      localStorage.setItem('crm_po_terms_templates', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setPoFormData((prev) => ({
      ...prev,
      termsCondition: title,
      termsConditionText: prev.termsConditionText?.trim()
        ? `${prev.termsConditionText.trim()}\n\n${content}`
        : content,
    }));

    setNewPoTermsTitle('');
    setNewPoTermsContent('');
    showPoTermsToast(`Term "${title}" added! Ready for next term.`);
  };

  const handlePoSubmit = () => {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = days[now.getDay()];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedCreated = `${dayName} ${poFormData.poDate || getLiveTodayDateString()} ${timeStr}`;

    const newPo = {
      id: `po_${Date.now()}`,
      slNo: purchaseOrders.length + 1,
      owner: poFormData.owner || 'Rashid Ali',
      ownerAvatar: '',
      poNumber: poFormData.poNumber || `CTPO#${Math.floor(2500 + purchaseOrders.length + 1)}`,
      date: poFormData.poDate || getLiveTodayDateString(),
      createdAtFormatted: formattedCreated,
      expectedDeliveryDate: poFormData.expectedDeliveryDate || '',
      supplier: poFormData.supplier !== 'Select Supplier' ? poFormData.supplier : 'SUPER GENERAL COMPANY LLC',
      order: poFormData.opportunityOrder !== 'Select Opportunity/Order' ? poFormData.opportunityOrder : '',
      reference: poFormData.reference || '',
      description: poFormData.description || '',
      opportunityOrder: poFormData.opportunityOrder !== 'Select Opportunity/Order' ? poFormData.opportunityOrder : '',
      projectNumber: poFormData.projectNumber || '',
      projectName: poFormData.projectName || '',
      vatType: poFormData.vatType,
      attention: poFormData.attention || '',
      preparedBy: poFormData.preparedBy || poFormData.owner || 'Rashid Ali',
      preparedByMobile: poFormData.preparedByMobile || '+971 50 123 4567',
      preparedByEmail: poFormData.preparedByEmail || 'purchasemanager@cooltechuae.com',
      preparedByDesignation: poFormData.preparedByDesignation || 'Purchase Manager',
      termsCondition: poFormData.termsCondition,
      termsConditionText:
        poFormData.termsConditionText ||
        'All product supply should be from the latest stock. Material supplied should comply 100% with the requested specifications. Products with any manufacturing defects or issues should be exchanged with new one with all cost including fright to End User. Cool Technologies is requesting you to acknowledge the receipt of this LPO and confirmation of delivery time, via return email.',
      discount: Number(poFormData.discount) || 0,
      adjustment: Number(poFormData.adjustment) || 0,
      amount: poCalculatedAmount,
      vat: poCalculatedVat,
      totalAmount: poCalculatedTotal,
      invoiceReceived: '',
      approval: 'Waiting for Final Approval',
      deliveryStatus: 'Pending',
      items: poLineItems.map((item) => ({
        ...item,
        deliveryPending: item.qty,
        total: Number(item.qty || 0) * Number(item.amount || 0),
      })),
    };

    const updated = [newPo, ...purchaseOrders];
    setPurchaseOrders(updated);
    try {
      localStorage.setItem('crm_purchase_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_purchase_orders_updated'));
    } catch (e) {
      console.error(e);
    }
    setPoViewMode('list');
  };

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
  const [invoiceViewMode, setInvoiceViewMode] = useState<'list' | 'add' | 'view'>('list');
  const [viewingInvoiceRecord, setViewingInvoiceRecord] = useState<any | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [activeInvoiceActionDropdownId, setActiveInvoiceActionDropdownId] = useState<string | null>(null);
  const [invoiceViewActiveSubTab, setInvoiceViewActiveSubTab] = useState<'invoice' | 'po' | 'payment' | 'do'>('invoice');

  const [purchaseInvoicesList, setPurchaseInvoicesList] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_purchase_invoices_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Keep only live created invoices (filter out dummy sample records)
            return parsed.filter((item: any) => item.id !== 'inv-1' && item.id !== 'inv-2');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_purchase_invoices_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const liveOnly = parsed.filter((item: any) => item.id !== 'inv-1' && item.id !== 'inv-2');
            if (liveOnly.length !== parsed.length) {
              localStorage.setItem('crm_purchase_invoices_list', JSON.stringify(liveOnly));
              setPurchaseInvoicesList(liveOnly);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Click outside to close invoice actions dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeInvoiceActionDropdownId) {
        setActiveInvoiceActionDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeInvoiceActionDropdownId]);

  // URL Query Param Support for Purchase Invoice View (e.g. ?tab=invoice&view=INVR292648)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const viewParam = searchParams.get('view');
    if (tabParam === 'invoice' && viewParam) {
      const match = purchaseInvoicesList.find(
        (inv) =>
          inv.invoiceNumber === viewParam ||
          inv.id === viewParam ||
          inv.pisn === viewParam ||
          inv.invoiceNumber?.replace(/\s+/g, '') === viewParam.replace(/\s+/g, '')
      );
      if (match) {
        setViewingInvoiceRecord(match);
        setInvoiceViewMode('view');
      } else {
        setViewingInvoiceRecord({
          id: `inv-${viewParam}`,
          slNo: 1,
          owner: 'VAISHAK',
          ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          invoiceNumber: viewParam,
          pisn: 'PIR81',
          date: '13-02-2026',
          supplier: 'GULF ELECTRONICS COMPANY LLC',
          poNumber: 'CTPO#1727',
          order: '',
          amount: 1619.00,
          paid: 0.00,
          balance: 1699.95,
          vatAmount: 80.95,
          totalAmount: 1699.95,
          status: 'Due',
          deliveryStatus: 'Pending',
          items: [
            {
              id: 'item_1',
              item: '3000 SERIES 2-IN-1 AIR PURIFIER & HUMIDIFIER PHILIPS AC3737/10',
              unit: 'Pcs',
              qty: '1',
              rate: '1619.00',
              sellingPrice: '0.00',
              total: '1619.00',
            },
          ],
        });
        setInvoiceViewMode('view');
      }
    }
  }, [searchParams, purchaseInvoicesList]);

  // Add Purchase Invoice Form States
  const [invoiceOwnersList, setInvoiceOwnersList] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_owners_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ['Natal', 'Muhammad Ali', 'Super Admin'];
  });
  const [isAddInvoiceOwnerModalOpen, setIsAddInvoiceOwnerModalOpen] = useState<boolean>(false);
  const [newInvoiceOwnerName, setNewInvoiceOwnerName] = useState<string>('');
  const [invoiceOwner, setInvoiceOwner] = useState<string>('Natal');

  const handleAddNewInvoiceOwner = () => {
    if (!newInvoiceOwnerName.trim()) return;
    const trimmed = newInvoiceOwnerName.trim();
    if (!invoiceOwnersList.includes(trimmed)) {
      const updated = [...invoiceOwnersList, trimmed];
      setInvoiceOwnersList(updated);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('crm_owners_list', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    }
    setInvoiceOwner(trimmed);
    setNewInvoiceOwnerName('');
    setIsAddInvoiceOwnerModalOpen(false);
  };
  const [invoicePoNumber, setInvoicePoNumber] = useState<string>('');
  const [invoicePisn, setInvoicePisn] = useState<string>('PIR82');
  const [invoiceNumberInput, setInvoiceNumberInput] = useState<string>('');
  const [invoiceSupplier, setInvoiceSupplier] = useState<string>('Select');
  const [invoiceDate, setInvoiceDate] = useState<string>('08-10-2026');
  const [invoiceOrder, setInvoiceOrder] = useState<string>('Select Order');
  const [invoiceWithItems, setInvoiceWithItems] = useState<'yes' | 'no'>('no');
  const [invoiceAmount, setInvoiceAmount] = useState<string>('');
  const [invoiceDiscount, setInvoiceDiscount] = useState<string>('');
  const [invoiceVatAmount, setInvoiceVatAmount] = useState<string>('0.00');
  const [invoiceAdjustment, setInvoiceAdjustment] = useState<string>('');
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState<string>('0.00');
  const [invoicePaymentDue, setInvoicePaymentDue] = useState<string>('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceFileName, setInvoiceFileName] = useState<string>('No file chosen');
  const [invoiceDescription, setInvoiceDescription] = useState<string>('');

  const [invoiceItems, setInvoiceItems] = useState<
    Array<{
      id: string;
      item: string;
      unit: string;
      rate: string;
      qty: string;
      total: string;
    }>
  >([]);

  const handleSelectPurchaseOrder = (selectedPoNumber: string) => {
    setInvoicePoNumber(selectedPoNumber);
    const matched = purchaseOrders.find(
      (p) =>
        (p.poNumber || '').toLowerCase().trim() === selectedPoNumber.toLowerCase().trim() ||
        (p.id || '').toLowerCase().trim() === selectedPoNumber.toLowerCase().trim()
    );
    if (matched) {
      if (matched.owner) setInvoiceOwner(matched.owner);
      if (matched.supplier) setInvoiceSupplier(matched.supplier);
      if (matched.amount !== undefined) setInvoiceAmount(String(matched.amount));
      if (matched.discount !== undefined) setInvoiceDiscount(String(matched.discount));
      if (matched.vat !== undefined) setInvoiceVatAmount(String(matched.vat));
      if (matched.adjustment !== undefined) setInvoiceAdjustment(String(matched.adjustment));
      if (matched.totalAmount !== undefined) setInvoiceTotalAmount(String(matched.totalAmount));
      if (matched.order || matched.opportunityOrder) {
        setInvoiceOrder(matched.order || matched.opportunityOrder);
      }
      if (Array.isArray(matched.items) && matched.items.length > 0) {
        setInvoiceItems(
          matched.items.map((it: any, idx: number) => ({
            id: it.id || `inv_item_${idx}_${Date.now()}`,
            item: it.description || it.name || it.item || '',
            unit: it.unit || 'Pcs',
            rate: String(it.amount || it.purchaseRate || it.rate || '0.00'),
            qty: String(it.qty || '1'),
            total: String(it.total || (Number(it.amount || 0) * Number(it.qty || 1)).toFixed(2)),
          }))
        );
      }
    }
  };

  const recalcFromItems = (itemsList: Array<{ qty: string; rate: string; total: string }>) => {
    const subtotal = itemsList.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    const subtotalStr = subtotal > 0 ? subtotal.toFixed(2) : '0.00';
    setInvoiceAmount(subtotalStr);
    const disc = parseFloat(invoiceDiscount) || 0;
    const vat = parseFloat(invoiceVatAmount) || 0;
    const adj = parseFloat(invoiceAdjustment) || 0;
    const grand = subtotal - disc + vat + adj;
    setInvoiceTotalAmount(grand > 0 ? grand.toFixed(2) : '0.00');
  };

  const calculateInvoiceTotal = (amt: string, disc: string, vat: string, adj: string) => {
    const a = parseFloat(amt) || 0;
    const d = parseFloat(disc) || 0;
    const v = parseFloat(vat) || 0;
    const j = parseFloat(adj) || 0;
    const tot = a - d + v + j;
    return tot > 0 ? tot.toFixed(2) : '0.00';
  };

  const handleCreatePurchaseInvoice = () => {
    const invAmt = parseFloat(invoiceAmount) || 0;
    const invTotal = parseFloat(invoiceTotalAmount) || invAmt;

    if (editingInvoiceId) {
      setPurchaseInvoicesList((prev) => {
        const updated = prev.map((item) => {
          if (item.id === editingInvoiceId) {
            return {
              ...item,
              owner: invoiceOwner,
              ownerAvatar:
                invoiceOwner === 'Natal'
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
              poNumber: invoicePoNumber || '',
              invoiceNumber: invoiceNumberInput || item.invoiceNumber,
              pisn: invoicePisn || item.pisn,
              date: invoiceDate || item.date,
              supplier: invoiceSupplier !== 'Select' ? invoiceSupplier : item.supplier,
              order: invoiceOrder !== 'Select Order' ? invoiceOrder : '',
              withPurchaseItems: invoiceWithItems,
              amount: invAmt,
              balance: invTotal - (item.paid || 0),
              discount: parseFloat(invoiceDiscount) || 0,
              vatAmount: parseFloat(invoiceVatAmount) || 0,
              adjustment: parseFloat(invoiceAdjustment) || 0,
              totalAmount: invTotal,
              paymentDue: invoicePaymentDue || '',
              description: invoiceDescription || '',
              items: invoiceItems,
            };
          }
          return item;
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_purchase_invoices_list', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      });
      setEditingInvoiceId(null);
    } else {
      const newInv = {
        id: `inv-${Date.now()}`,
        slNo: purchaseInvoicesList.length + 1,
        owner: invoiceOwner,
        ownerAvatar:
          invoiceOwner === 'Natal'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
        poNumber: invoicePoNumber || '',
        invoiceNumber: invoiceNumberInput || `INV-2026-${String(purchaseInvoicesList.length + 1).padStart(3, '0')}`,
        pisn: invoicePisn || 'PIR82',
        date: invoiceDate || getLiveTodayDateString(),
        supplier: invoiceSupplier !== 'Select' ? invoiceSupplier : 'GULF ELECTRONICS COMPANY LLC',
        order: invoiceOrder !== 'Select Order' ? invoiceOrder : '',
        withPurchaseItems: invoiceWithItems,
        amount: invAmt,
        paid: 0,
        balance: invTotal,
        discount: parseFloat(invoiceDiscount) || 0,
        vatAmount: parseFloat(invoiceVatAmount) || 0,
        adjustment: parseFloat(invoiceAdjustment) || 0,
        totalAmount: invTotal,
        paymentDue: invoicePaymentDue || '',
        status: 'Due',
        deliveryStatus: 'Pending',
        description: invoiceDescription || '',
        items: invoiceItems,
      };

      setPurchaseInvoicesList((prev) => {
        const updated = [newInv, ...prev];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_purchase_invoices_list', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      });
    }

    // Reset Form
    setInvoicePoNumber('');
    setInvoiceNumberInput('');
    setInvoiceSupplier('Select');
    setInvoiceAmount('');
    setInvoiceDiscount('');
    setInvoiceVatAmount('0.00');
    setInvoiceAdjustment('');
    setInvoiceTotalAmount('0.00');
    setInvoicePaymentDue('');
    setInvoiceFile(null);
    setInvoiceFileName('No file chosen');
    setInvoiceDescription('');
    setInvoiceItems([]);
    setEditingInvoiceId(null);

    // Go back to list view
    setInvoiceViewMode('list');
  };

  const handleEditInvoice = (inv: any) => {
    setActiveInvoiceActionDropdownId(null);
    setEditingInvoiceId(inv.id);
    setInvoiceOwner(inv.owner || 'Natal');
    setInvoicePoNumber(inv.poNumber || '');
    setInvoicePisn(inv.pisn || 'PIR82');
    setInvoiceNumberInput(inv.invoiceNumber || '');
    setInvoiceSupplier(inv.supplier || 'Select');
    setInvoiceDate(inv.date || getLiveTodayDateString());
    setInvoiceOrder(inv.order || 'Select Order');
    setInvoiceWithItems(inv.withPurchaseItems || (inv.items && inv.items.length > 0 ? 'yes' : 'no'));
    setInvoiceAmount(inv.amount !== undefined ? String(inv.amount) : '');
    setInvoiceDiscount(inv.discount !== undefined ? String(inv.discount) : '');
    setInvoiceVatAmount(inv.vatAmount !== undefined ? String(inv.vatAmount) : '0.00');
    setInvoiceAdjustment(inv.adjustment !== undefined ? String(inv.adjustment) : '');
    setInvoiceTotalAmount(inv.totalAmount !== undefined ? String(inv.totalAmount) : (inv.amount !== undefined ? String(inv.amount) : '0.00'));
    setInvoicePaymentDue(inv.paymentDue || '');
    setInvoiceDescription(inv.description || '');
    setInvoiceItems(inv.items || []);
    setInvoiceViewMode('add');
  };

  const handleDeleteInvoice = (invId: string) => {
    setActiveInvoiceActionDropdownId(null);
    if (window.confirm('Are you sure you want to delete this purchase invoice?')) {
      setPurchaseInvoicesList((prev) => {
        const updated = prev.filter((i) => i.id !== invId);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('crm_purchase_invoices_list', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      });
      if (viewingInvoiceRecord && viewingInvoiceRecord.id === invId) {
        setViewingInvoiceRecord(null);
        setInvoiceViewMode('list');
      }
    }
  };

  const handleViewInvoice = (inv: any) => {
    setActiveInvoiceActionDropdownId(null);
    setViewingInvoiceRecord(inv);
    setInvoiceViewMode('view');
  };

  const handleOpenInvoiceInNewTab = (inv: any) => {
    setActiveInvoiceActionDropdownId(null);
    window.open(`/purchase?tab=invoice&view=${encodeURIComponent(inv.invoiceNumber || inv.id)}`, '_blank');
  };

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

  // Unit Sub-Tab States
  const [unitsList, setUnitsList] = useState<string[]>([
    'Each',
    'Roll',
    'Mtr',
    'Pcs',
    'No',
    'Set',
    'Kg',
  ]);
  const [unitSearch, setUnitSearch] = useState<string>('');
  const [unitRowsPerPage, setUnitRowsPerPage] = useState<number>(10);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState<boolean>(false);
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const [unitInputName, setUnitInputName] = useState<string>('');
  const [activeUnitActionDropdown, setActiveUnitActionDropdown] = useState<number | null>(null);

  // Brand Sub-Tab States
  const [brandsList, setBrandsList] = useState<string[]>([
    'MIDEA',
    'LG',
    'AKAI',
    'MITSUBISHI',
    'O GENERAL',
    'CARRIER',
    'NOBEL',
    'CLIVET',
    'SUPER',
  ]);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [brandRowsPerPage, setBrandRowsPerPage] = useState<number>(10);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState<boolean>(false);
  const [editingBrandIndex, setEditingBrandIndex] = useState<number | null>(null);
  const [brandInputName, setBrandInputName] = useState<string>('');
  const [activeBrandActionDropdown, setActiveBrandActionDropdown] = useState<number | null>(null);

  // Category Sub-Tab States
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'SPLIT AC',
    'CASSETTE AC',
    'INFRARED COOKER',
    'DUCTED AC',
    'PACKAGE AC',
    'VRF / VRV',
    'ACCESSORIES',
  ]);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [categoryRowsPerPage, setCategoryRowsPerPage] = useState<number>(10);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [categoryInputName, setCategoryInputName] = useState<string>('');
  const [activeCategoryActionDropdown, setActiveCategoryActionDropdown] = useState<number | null>(null);

  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const u = authMockService.getCurrentUser();
      if (u) setCurrentUser(u);
    };
    syncUser();
    const unsub = authMockService.onAuthStateChanged((u) => {
      if (u) setCurrentUser(u);
    });
    window.addEventListener('storage', syncUser);
    window.addEventListener('crm_auth_updated', syncUser);
    return () => {
      unsub();
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('crm_auth_updated', syncUser);
    };
  }, []);

  // Sync Live Current User into PO Form Defaults & Owners List
  useEffect(() => {
    if (currentUser) {
      setPoFormData((prev) => ({
        ...prev,
        owner: currentUser.name || prev.owner,
        preparedBy: currentUser.name || prev.preparedBy,
        preparedByEmail: currentUser.email || prev.preparedByEmail,
        preparedByMobile: (currentUser as any).phone || prev.preparedByMobile,
        preparedByDesignation: currentUser.role === 'manager' ? 'Purchase Manager' : 'Purchase Officer',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (users && users.length > 0) {
      setPoOwnersList((prev) => {
        const userNames = users.map((u) => u.name);
        return Array.from(new Set([...prev, ...userNames])).filter((n) => n !== 'Nafal');
      });
    }
  }, [users]);

  const [stockItems, setStockItems] = useState<CrmCezconStock[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_products_master_live');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((p: any, idx: number) => ({
              id: String(p.id || idx + 1),
              slNo: idx + 1,
              serialNo: p.serialNo || '',
              code: p.code || p.sku || `CQ4N-XMI${idx + 10}S`,
              name: p.name || 'Unnamed Product',
              image: p.image || p.thumbnailImage || '',
              unit: p.unit || 'Pcs',
              brand: p.brand || 'MIDEA',
              category: p.category || 'SPLIT AC',
              type: p.type || 'Product',
              purchaseRate: Number(p.purchaseRate) || 0,
              sellingPrice: Number(p.sellingPrice || p.basePrice) || 0,
              status: p.status === false || p.status === 'Inactive' ? 'Inactive' : 'Active',
              store: p.store || 'Main Warehouse - Bay A',
              stock: Number(p.currentStock || p.stock) || 0,
              currentStock: Number(p.currentStock || p.stock) || 0,
              minimumStock: Number(p.minStock || p.minimumStock) || 0,
              createdBy: p.createdBy || (p.createdByRole === 'employee' ? 'Purchase Employee' : 'Rashid Ali'),
              createdByRole: p.createdByRole || (p.createdById && String(p.createdById).startsWith('emp_') ? 'employee' : 'manager'),
              createdById: p.createdById || (p.createdByRole === 'employee' ? 'emp_faisal_001' : 'usr_rashid_001'),
              createdByEmail: p.createdByEmail || (p.createdByRole === 'employee' ? 'purchaseemp@gmail.com' : 'purchasemanager@gmail.com'),
              owner: p.owner || p.createdBy || 'Rashid Ali',
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load stockItems from storage', e);
      }
    }
    return mockCezconStockItems;
  });

  // Live Sync with Settings and CRM Products
  useEffect(() => {
    const syncProducts = () => {
      try {
        const saved = localStorage.getItem('cezcon_products_master_live');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setStockItems(
              parsed.map((p: any, idx: number) => ({
                id: String(p.id || idx + 1),
                slNo: idx + 1,
                serialNo: p.serialNo || '',
                code: p.code || p.sku || `CQ4N-XMI${idx + 10}S`,
                name: p.name || 'Unnamed Product',
                image: p.image || p.thumbnailImage || '',
                unit: p.unit || 'Pcs',
                brand: p.brand || 'MIDEA',
                category: p.category || 'SPLIT AC',
                type: p.type || 'Product',
                purchaseRate: Number(p.purchaseRate) || 0,
                sellingPrice: Number(p.sellingPrice || p.basePrice) || 0,
                status: p.status === false || p.status === 'Inactive' ? 'Inactive' : 'Active',
                store: p.store || 'Main Warehouse - Bay A',
                stock: Number(p.currentStock || p.stock) || 0,
                currentStock: Number(p.currentStock || p.stock) || 0,
                minimumStock: Number(p.minStock || p.minimumStock) || 0,
                createdBy: p.createdBy || (p.createdByRole === 'employee' ? 'Purchase Employee' : 'Rashid Ali'),
                createdByRole: p.createdByRole || (p.createdById && String(p.createdById).startsWith('emp_') ? 'employee' : 'manager'),
                createdById: p.createdById || (p.createdByRole === 'employee' ? 'emp_faisal_001' : 'usr_rashid_001'),
                createdByEmail: p.createdByEmail || (p.createdByRole === 'employee' ? 'purchaseemp@gmail.com' : 'purchasemanager@gmail.com'),
                owner: p.owner || p.createdBy || 'Rashid Ali',
              }))
            );
          }
        }
      } catch (e) {
        console.error('Failed to sync products', e);
      }
    };

    window.addEventListener('crm_products_updated', syncProducts);
    window.addEventListener('storage', syncProducts);
    return () => {
      window.removeEventListener('crm_products_updated', syncProducts);
      window.removeEventListener('storage', syncProducts);
    };
  }, []);

  useEffect(() => {
    const syncPOs = () => {
      try {
        const stored = localStorage.getItem('crm_purchase_orders');
        if (stored) {
          setPurchaseOrders(JSON.parse(stored));
        } else {
          setPurchaseOrders([]);
        }
      } catch (e) {
        console.error('Failed to sync POs', e);
      }
    };

    window.addEventListener('crm_purchase_orders_updated', syncPOs);
    window.addEventListener('storage', syncPOs);
    return () => {
      window.removeEventListener('crm_purchase_orders_updated', syncPOs);
      window.removeEventListener('storage', syncPOs);
    };
  }, []);

  const [transfers, setTransfers] = useState<CrmStockTransfer[]>(mockStockTransfers);

  // Add Product View Form State (Exact Cezcon CRM layout)
  const [productViewMode, setProductViewMode] = useState<'list' | 'add' | 'view' | 'import'>('list');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importStore, setImportStore] = useState<string>('Select Store');
  const [importRowsCount, setImportRowsCount] = useState<number>(0);

  const handleDownloadProductImportFormat = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'SL.No,Code,Name,Unit,Brand,Category,Type,Purchase Rate,Selling Price,Store,Current Stock,Minimum Stock,Serial No\n' +
      '1,32432wefew,COOLER,Each,LG,SPLIT AC,Product,2000.00,3000.00,CT,10,2,12345678\n' +
      '2,MIDEA-INV-01,Midea 1.5 Ton Split AC,Pcs,MIDEA,SPLIT AC,Product,1850.00,2450.00,M-42 SHOP,15,3,98765432\n' +
      '3,DAIKIN-CAS-02,Daikin Cassette AC 3 Ton,Set,DAIKIN,CASSETTE AC,Product,4200.00,5500.00,MAIN WAREHOUSE,8,1,45678901\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Product_Import_Format_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportFileName(file.name);
      if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = (event.target?.result as string) || '';
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const dataRows = lines.length > 1 ? lines.length - 1 : 0;
          setImportRowsCount(Math.min(dataRows, 50));
        };
        reader.readAsText(file);
      } else {
        setImportRowsCount(2);
      }
    }
  };

  const handleImportSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!importFile && !importFileName) {
      alert('Please choose a file to import.');
      return;
    }

    if (importFile && (importFile.name.endsWith('.csv') || importFile.type.includes('csv'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = (event.target?.result as string) || '';
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const newProducts: CrmCezconStock[] = [];
            for (let i = 1; i < lines.length && newProducts.length < 50; i++) {
              const cols = lines[i].split(',').map((c) => c.trim());
              if (cols.length >= 3 && cols[2]) {
                newProducts.push({
                  id: String(Date.now() + i),
                  slNo: stockItems.length + i,
                  serialNo: cols[12] || cols[0] || '',
                  code: cols[1] || `PRD-${Date.now().toString().slice(-4)}-${i}`,
                  name: cols[2] || `Imported Item ${i}`,
                  image: '',
                  unit: cols[3] || 'Each',
                  brand: cols[4] || 'LG',
                  category: cols[5] || 'SPLIT AC',
                  type: cols[6] || 'Product',
                  purchaseRate: parseFloat(cols[7]) || 0,
                  sellingPrice: parseFloat(cols[8]) || 0,
                  status: 'Active',
                  store: importStore !== 'Select Store' ? importStore : (cols[9] || 'CT'),
                  stock: parseInt(cols[10], 10) || 0,
                  currentStock: parseInt(cols[10], 10) || 0,
                  minimumStock: parseInt(cols[11], 10) || 0,
                  owner: 'Rashid Ali',
                  createdBy: 'Rashid Ali',
                  createdByRole: 'manager',
                });
              }
            }
            if (newProducts.length > 0) {
              const updated = [...newProducts, ...stockItems];
              setStockItems(updated);
              try {
                localStorage.setItem('cezcon_products_master_live', JSON.stringify(updated));
                localStorage.setItem('crm_products_master', JSON.stringify(updated));
                window.dispatchEvent(new Event('crm_products_updated'));
              } catch (err) {}
            }
          }
        } catch (err) {
          console.error(err);
        }
        setProductViewMode('list');
        setImportFile(null);
        setImportFileName('');
        setImportRowsCount(0);
      };
      reader.readAsText(importFile);
    } else {
      const sampleImport: CrmCezconStock[] = [
        {
          id: String(Date.now() + 1),
          slNo: stockItems.length + 1,
          serialNo: '98451234',
          code: '32432wefew',
          name: 'COOLER',
          image: '',
          unit: 'Each',
          brand: 'LG',
          category: 'SPLIT AC',
          type: 'Product',
          purchaseRate: 2000,
          sellingPrice: 3000,
          status: 'Active',
          store: importStore !== 'Select Store' ? importStore : 'CT',
          stock: 15,
          currentStock: 15,
          minimumStock: 2,
          owner: 'Rashid Ali',
          createdBy: 'Rashid Ali',
          createdByRole: 'manager',
        },
        {
          id: String(Date.now() + 2),
          slNo: stockItems.length + 2,
          serialNo: '55667788',
          code: 'MID-SPLIT-2T',
          name: 'Midea 2.0 Ton Inverter AC',
          image: '',
          unit: 'Pcs',
          brand: 'MIDEA',
          category: 'SPLIT AC',
          type: 'Product',
          purchaseRate: 2400,
          sellingPrice: 3200,
          status: 'Active',
          store: importStore !== 'Select Store' ? importStore : 'M-42 SHOP',
          stock: 8,
          currentStock: 8,
          minimumStock: 2,
          owner: 'Rashid Ali',
          createdBy: 'Rashid Ali',
          createdByRole: 'manager',
        },
      ];
      const updated = [...sampleImport, ...stockItems];
      setStockItems(updated);
      try {
        localStorage.setItem('cezcon_products_master_live', JSON.stringify(updated));
        localStorage.setItem('crm_products_master', JSON.stringify(updated));
        window.dispatchEvent(new Event('crm_products_updated'));
      } catch (err) {}
      setProductViewMode('list');
      setImportFile(null);
      setImportFileName('');
      setImportRowsCount(0);
    }
  };

  const [productDetailTab, setProductDetailTab] = useState<'movement' | 'adjustment' | 'images'>('movement');
  const [viewStoreFilter, setViewStoreFilter] = useState<string>('Select Store');
  const [viewCustomerFilter, setViewCustomerFilter] = useState<string>('Select Customer');
  const [viewDateRange, setViewDateRange] = useState<string>(getLiveMonthRangeString());
  const [productFormData, setProductFormData] = useState({
    serialNumber: '',
    code: '',
    name: '',
    thumbnailName: '',
    unit: 'Select Unit',
    category: 'Select Category',
    purchaseRate: '',
    sellingPrice: '',
    store: 'Select Store',
    currentStock: '',
    minimumStock: '',
    type: 'Product',
    imagesCountText: '',
    brand: 'Select Brand',
    additionalDescription: '',
    wordCount: 0,
  });

  const [activePoActionDropdownId, setActivePoActionDropdownId] = useState<string | null>(null);
  const [activeProductActionDropdownId, setActiveProductActionDropdownId] = useState<string | null>(null);
  const [isPoPrintFormatOpen, setIsPoPrintFormatOpen] = useState<boolean>(false);
  const [viewingProduct, setViewingProduct] = useState<CrmCezconStock | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const liveStockMovements = useMemo(() => {
    if (!viewingProduct) return [];
    const movements: Array<{
      slNo: number;
      date: string;
      number: string;
      customer: string;
      description: string;
      stockIn: number;
      stockOut: number;
      stock: number;
    }> = [];

    const productNameLower = (viewingProduct.name || '').toLowerCase().trim();
    const productCodeLower = (viewingProduct.code || '').toLowerCase().trim();

    let runningStock = 0;

    // Trace from live stockInList
    if (Array.isArray(stockInList)) {
      stockInList.forEach((si) => {
        if (si.items && Array.isArray(si.items)) {
          si.items.forEach((it: any) => {
            const itName = (it.item || it.description || it.name || '').toLowerCase().trim();
            const itCode = (it.code || '').toLowerCase().trim();
            if (
              (itName && (itName === productNameLower || productNameLower.includes(itName) || itName.includes(productNameLower))) ||
              (itCode && itCode === productCodeLower)
            ) {
              const qty = Number(it.qty) || 1;
              runningStock += qty;
              movements.push({
                slNo: movements.length + 1,
                date: si.date || getLiveTodayDateString(),
                number: si.stockInNo || 'STK-IN',
                customer: si.supplier || si.source || 'SUPER GENERAL COMPANY LLC',
                description: `Stock In (${si.stockInNo || 'STK-IN'})`,
                stockIn: qty,
                stockOut: 0,
                stock: runningStock,
              });
            }
          });
        }
      });
    }

    return movements;
  }, [viewingProduct, stockInList]);

  const handleExportStockMovementExcel = () => {
    if (!viewingProduct) return;
    const rows = [
      ['Sl No.', 'Date', 'Number', 'Customer', 'Description', 'StockIn', 'Stockout', 'Stock'],
      ['', getLiveFirstDayOfMonth(), '', '', 'Opening Stock', '', '', '0'],
      ...liveStockMovements.map((m) => [
        String(m.slNo),
        m.date,
        m.number,
        m.customer,
        m.description,
        String(m.stockIn),
        String(m.stockOut),
        String(m.stock),
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((c) => `"${c}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Movement_${viewingProduct.code || 'Product'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const viewParam = searchParams.get('view') || searchParams.get('view_stock');
    if ((tabParam === 'stock' || !tabParam) && viewParam) {
      const match = stockItems.find(
        (s) =>
          s.code === viewParam ||
          s.id === viewParam ||
          s.code?.toLowerCase() === viewParam.toLowerCase() ||
          s.name?.toLowerCase().includes(viewParam.toLowerCase())
      );
      if (match) {
        setViewingProduct(match);
        setProductDetailTab('movement');
      }
    }
  }, [searchParams, stockItems]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActivePoActionDropdownId(null);
      setActiveProductActionDropdownId(null);
      setActiveUnitActionDropdown(null);
      setActiveBrandActionDropdown(null);
      setActiveCategoryActionDropdown(null);
      setIsPoPrintFormatOpen(false);
    };
    if (
      activePoActionDropdownId !== null ||
      activeProductActionDropdownId !== null ||
      activeUnitActionDropdown !== null ||
      activeBrandActionDropdown !== null ||
      activeCategoryActionDropdown !== null ||
      isPoPrintFormatOpen
    ) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [
    activePoActionDropdownId,
    activeProductActionDropdownId,
    activeUnitActionDropdown,
    activeBrandActionDropdown,
    activeCategoryActionDropdown,
    isPoPrintFormatOpen,
  ]);

  const filteredUnits = useMemo(() => {
    if (!unitSearch.trim()) return unitsList;
    return unitsList.filter((u) => u.toLowerCase().includes(unitSearch.toLowerCase()));
  }, [unitsList, unitSearch]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brandsList;
    return brandsList.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brandsList, brandSearch]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categoriesList;
    return categoriesList.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categoriesList, categorySearch]);

  // Filtered Products / Services with Strict Role-Based Visibility Scoping
  const filteredProducts = useMemo(() => {
    const user = currentUser || (typeof window !== 'undefined' ? authMockService.getCurrentUser() : null);
    const role = (user?.role || '').toLowerCase();
    const profile = (user?.profileType || '').toLowerCase();
    const isSuperAdmin = role === 'super_admin' || role === 'super admin' || profile.includes('super admin');
    const isAdmin = role === 'admin' || Boolean((user as any)?.isAdmin) || profile.includes('admin');
    const isManager = role === 'manager' || profile.includes('manager') || Boolean((user as any)?.managerType);
    const isEmployee = role === 'employee' || profile.includes('employee') || (!isSuperAdmin && !isAdmin && !isManager);

    const currentUserId = String(user?.id || '').toLowerCase();
    const currentUserName = (user?.name || '').toLowerCase();
    const currentUserEmail = (user?.email || '').toLowerCase();

    return stockItems.filter((item) => {
      // 1. Role-Based Data Scoping:
      if (isEmployee) {
        // Purchase Employee: ONLY see products created by themselves!
        const itemCreatedById = String(item.createdById || '').toLowerCase();
        const itemCreatedByEmail = (item.createdByEmail || '').toLowerCase();
        const itemCreatedByName = (item.createdBy || '').toLowerCase();
        const itemRole = (item.createdByRole || '').toLowerCase();

        const isCreatedByMe =
          (itemCreatedById && itemCreatedById === currentUserId) ||
          (itemCreatedByEmail && itemCreatedByEmail === currentUserEmail) ||
          (itemCreatedByName && itemCreatedByName === currentUserName);

        // Hide manager-created, admin-created, or other employees' products from this employee
        if (!isCreatedByMe || itemRole === 'manager' || itemRole === 'admin' || itemRole === 'super_admin') {
          return false;
        }
      } else if (isManager) {
        // Purchase Manager sees products created by themselves + all purchase employee items
      }
      // Super Admin and Admin see all products across the company

      // 2. Search & Filter Criteria:
      if (productSearch) {
        const q = productSearch.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCode = (item.code || '').toLowerCase().includes(q);
        const matchBrand = (item.brand || '').toLowerCase().includes(q);
        const matchCategory = (item.category || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBrand && !matchCategory) return false;
      }
      if (productCategory !== 'Select' && item.category !== productCategory) return false;
      if (productBrand !== 'Select' && item.brand !== productBrand) return false;
      if (productUnit !== 'Select' && item.unit !== productUnit) return false;
      if (productType !== 'All' && item.type !== productType) return false;
      if (productStatus !== 'All') {
        const itemStatus = item.status === 'Inactive' ? 'Inactive' : 'Active';
        if (itemStatus !== productStatus) return false;
      }
      if (productStore !== 'All Store' && item.store !== productStore) return false;
      return true;
    });
  }, [stockItems, currentUser, productSearch, productCategory, productBrand, productUnit, productType, productStatus, productStore]);

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
    return purchaseInvoicesList.filter((item) => {
      if (invoiceSearch) {
        const q = invoiceSearch.toLowerCase();
        const matchNo = (item.invoiceNumber || '').toLowerCase().includes(q);
        const matchPisn = (item.pisn || '').toLowerCase().includes(q);
        const matchSup = (item.supplier || '').toLowerCase().includes(q);
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
  }, [purchaseInvoicesList, invoiceSearch, invoiceFilterOwner, invoiceFilterSupplier, invoiceFilterStatus]);

  // Filtered Purchase Orders
  const filteredPOItems = useMemo(() => {
    return purchaseOrders.filter((item) => {
      if (poSearch) {
        const q = poSearch.toLowerCase();
        const matchNo = (item.poNumber || '').toLowerCase().includes(q);
        const matchSup = (item.supplier || '').toLowerCase().includes(q);
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
  }, [purchaseOrders, poSearch, poFilterOwner, poFilterSupplier]);

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
    if (activeSubTab === 'adjustment' || activeSubTab === 'transfer') {
      return [];
    }

    if (activeSubTab === 'minimal') {
      return stockItems.filter((item) => {
        const isMinimal = (Number(item.stock) || 0) <= (Number(item.minimumStock) || 0) && (Number(item.minimumStock) || 0) > 0;
        if (!isMinimal) return false;

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
                    setViewingProduct(null);
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
            {poViewMode === 'add' ? (
            /* ========================================================= */
            /* ADD PURCHASE ORDER VIEW (Exact Cezcon CRM Layout)         */
            /* ========================================================= */
            <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
              {/* Header */}
              <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="text-sm">🗂️</span>
                  <span>Add Purchase Order</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPoViewMode('list')}
                  className="w-5 h-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center rounded-xs text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Two-Column Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-xs text-slate-700">
                  {/* Left Column */}
                  <div className="space-y-3">
                    {/* Owner */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Owner <span className="text-red-500">*</span>
                      </label>
                      <div className="col-span-8 flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <select
                            value={poFormData.owner}
                            onChange={(e) => setPoFormData({ ...poFormData, owner: e.target.value })}
                            className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            {poOwnersList.map((owner) => (
                              <option key={owner} value={owner}>
                                {owner}
                              </option>
                            ))}
                          </select>
                          <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold absolute left-2 top-2 select-none">
                            👤
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddOwnerModalOpen(true)}
                          className="px-2 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-xs transition"
                          title="Add New Owner"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>New</span>
                        </button>
                      </div>
                    </div>

                    {/* PO Number */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        PO Number <span className="text-red-500">*</span>
                      </label>
                      <div className="col-span-8 flex items-center">
                        <input
                          type="text"
                          value={poFormData.poNumber}
                          onChange={(e) => setPoFormData({ ...poFormData, poNumber: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-r-0 border-slate-300 rounded-l text-xs bg-[#F1F5F9] text-slate-800 font-medium focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPoNumberSettingsModalOpen(true)}
                          className="px-2.5 py-1.5 border border-slate-300 bg-[#E0F2FE] text-[#0284C7] rounded-r flex items-center justify-center cursor-pointer hover:bg-[#BAE6FD] transition"
                          title="PO Number Settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Reference# */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Reference#
                      </label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={poFormData.reference}
                          onChange={(e) => setPoFormData({ ...poFormData, reference: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* PO Date */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        PO Date
                      </label>
                      <div className="col-span-8 relative flex items-center">
                        <input
                          type="text"
                          value={poFormData.poDate}
                          onChange={(e) => setPoFormData({ ...poFormData, poDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-r-0 border-slate-300 rounded-l text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                        <div className="px-2.5 py-1.5 border border-slate-300 bg-[#F8FAFC] text-slate-600 rounded-r flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Expected Delivery Date */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Expected Delivery Date
                      </label>
                      <div className="col-span-8 relative flex items-center">
                        <input
                          type="text"
                          value={poFormData.expectedDeliveryDate}
                          onChange={(e) => setPoFormData({ ...poFormData, expectedDeliveryDate: e.target.value })}
                          placeholder=""
                          className="w-full px-2.5 py-1.5 border border-r-0 border-slate-300 rounded-l text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                        <div className="px-2.5 py-1.5 border border-slate-300 bg-[#F8FAFC] text-slate-600 rounded-r flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Supplier */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      <div className="col-span-8">
                        <select
                          value={poFormData.supplier}
                          onChange={(e) => setPoFormData({ ...poFormData, supplier: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Select Supplier">Select Supplier</option>
                          <option value="SUPER GENERAL COMPANY LLC">SUPER GENERAL COMPANY LLC</option>
                          <option value="LUTFI TRADING LLC">LUTFI TRADING LLC</option>
                          <option value="DUBAI POLYMER INDUSTRIES LLC">DUBAI POLYMER INDUSTRIES LLC</option>
                          <option value="CENTRAL TRADING COMPANY L.L.C.">CENTRAL TRADING COMPANY L.L.C.</option>
                          <option value="Better Life">Better Life</option>
                        </select>
                      </div>
                    </div>

                    {/* Ship to */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Ship to
                      </label>
                      <div className="col-span-8">
                        <input
                          type="checkbox"
                          checked={poFormData.shipTo}
                          onChange={(e) => setPoFormData({ ...poFormData, shipTo: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Purchase Order Type */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Purchase Order Type <span className="text-red-500">*</span>
                      </label>
                      <div className="col-span-8">
                        <select
                          value={poFormData.poType}
                          onChange={(e) => setPoFormData({ ...poFormData, poType: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Manual Creation">Manual Creation</option>
                          <option value="From Sales Order">From Sales Order</option>
                          <option value="From Purchase Requisition">From Purchase Requisition</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-12 items-start gap-2">
                      <label className="col-span-4 font-semibold text-slate-700 pt-1.5">
                        Description
                      </label>
                      <div className="col-span-8">
                        <textarea
                          rows={2}
                          value={poFormData.description}
                          onChange={(e) => setPoFormData({ ...poFormData, description: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    {/* Opportunity/Order */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Opportunity/Order
                      </label>
                      <div className="col-span-8">
                        <select
                          value={poFormData.opportunityOrder}
                          onChange={(e) => setPoFormData({ ...poFormData, opportunityOrder: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Select Opportunity/Order">Select Opportunity/Order</option>
                          <option value="ORD-2026-001 - Villa Project">ORD-2026-001 - Villa Project</option>
                          <option value="ORD-2026-002 - Mall Fitout">ORD-2026-002 - Mall Fitout</option>
                          <option value="OPP-8842 - Office Tower AC">OPP-8842 - Office Tower AC</option>
                        </select>
                      </div>
                    </div>

                    {/* Project Number */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Project Number
                      </label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={poFormData.projectNumber}
                          onChange={(e) => setPoFormData({ ...poFormData, projectNumber: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Project Name */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Project Name
                      </label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={poFormData.projectName}
                          onChange={(e) => setPoFormData({ ...poFormData, projectName: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* VAT Type */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        VAT Type <span className="text-red-500">*</span>
                      </label>
                      <div className="col-span-8 flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                          <input
                            type="radio"
                            name="poVatType"
                            checked={poFormData.vatType === 'with_vat'}
                            onChange={() => setPoFormData({ ...poFormData, vatType: 'with_vat' })}
                            className="text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span>With VAT</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                          <input
                            type="radio"
                            name="poVatType"
                            checked={poFormData.vatType === 'without_vat'}
                            onChange={() => setPoFormData({ ...poFormData, vatType: 'without_vat' })}
                            className="text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span>Without VAT</span>
                        </label>
                      </div>
                    </div>

                    {/* Attention */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Attention
                      </label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={poFormData.attention}
                          onChange={(e) => setPoFormData({ ...poFormData, attention: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Prepared By */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Prepared By
                      </label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={poFormData.preparedBy}
                          onChange={(e) => setPoFormData({ ...poFormData, preparedBy: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Prepared By Mobile */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Prepared By Mobile
                      </label>
                      <div className="col-span-8">
                        <input
                          type="text"
                          value={poFormData.preparedByMobile}
                          onChange={(e) => setPoFormData({ ...poFormData, preparedByMobile: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Prepared By Email */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Prepared By Email
                      </label>
                      <div className="col-span-8">
                        <input
                          type="email"
                          value={poFormData.preparedByEmail}
                          onChange={(e) => setPoFormData({ ...poFormData, preparedByEmail: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Prepared By Designation */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-4 font-semibold text-slate-700">
                        Prepared By Designation
                      </label>
                      <div className="col-span-8">
                        <select
                          value={poFormData.preparedByDesignation}
                          onChange={(e) => setPoFormData({ ...poFormData, preparedByDesignation: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Select Designation">Select Designation</option>
                          <option value="Managing Director">Managing Director</option>
                          <option value="Purchase Officer">Purchase Officer</option>
                          <option value="Sales Executive">Sales Executive</option>
                          <option value="General Manager">General Manager</option>
                          <option value="Accountant">Accountant</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products / Items Table Card */}
                <div className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                        <tr>
                          <th className="p-2.5 min-w-[280px]">
                            <div className="flex items-center justify-between gap-2">
                              <span>Description</span>
                              <button
                                type="button"
                                className="px-2 py-0.5 bg-[#64748B] hover:bg-[#475569] text-white rounded-xs text-[10px] font-bold cursor-pointer"
                              >
                                + Additional Description
                              </button>
                            </div>
                          </th>
                          <th className="p-2.5 w-28">Code</th>
                          <th className="p-2.5 w-24">Unit</th>
                          <th className="p-2.5 w-28">Brand</th>
                          <th className="p-2.5 w-24 text-center">QTY</th>
                          <th className="p-2.5 w-32 text-center">Amount</th>
                          <th className="p-2.5 w-32 text-center">Total</th>
                          <th className="p-2.5 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {poLineItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <select
                                value={item.description}
                                onChange={(e) => handlePoProductChange(idx, e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Select Item</option>
                                {stockItems.map((p) => (
                                  <option key={p.id} value={p.name}>
                                    {p.name} {p.code ? `(${p.code})` : ''}
                                  </option>
                                ))}
                                {stockItems.length === 0 && (
                                  <>
                                    <option value="MIDEA 1.5 TON SPLIT AC">MIDEA 1.5 TON SPLIT AC</option>
                                    <option value="CARRIER 2.0 TON CASSETTE AC">CARRIER 2.0 TON CASSETTE AC</option>
                                    <option value="LG DUAL INVERTER 1.5 TON">LG DUAL INVERTER 1.5 TON</option>
                                  </>
                                )}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                readOnly
                                value={item.code}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-[#F1F5F9] text-slate-600 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                readOnly
                                value={item.unit}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-[#F1F5F9] text-slate-600 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                readOnly
                                value={item.brand}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-[#F1F5F9] text-slate-600 focus:outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => handlePoQtyChange(idx, Number(e.target.value))}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-center text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount || ''}
                                onChange={(e) => handlePoAmountChange(idx, Number(e.target.value))}
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-right text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                readOnly
                                value={(Number(item.qty || 0) * Number(item.amount || 0)).toFixed(2)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-[#F1F5F9] text-right font-mono text-slate-700 focus:outline-none font-semibold"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handlePoRemoveLine(idx)}
                                className="w-5 h-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white inline-flex items-center justify-center rounded-xs text-xs font-bold cursor-pointer"
                                title="Delete Row"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Buttons directly below table */}
                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handlePoAddDescriptionRow}
                      className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Description</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePoAddProductRow}
                      className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product / Service</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Section: Left = WYSIWYG Terms & Condition, Right = Calculations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left: Terms & Conditions with full CKEditor Toolbar */}
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <span className="text-blue-600 font-bold">ℹ</span> Terms & Condition
                      </span>
                      <select
                        value={poFormData.termsCondition}
                        onChange={(e) => setPoFormData({ ...poFormData, termsCondition: e.target.value })}
                        className="flex-1 max-w-xs px-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Select">Select</option>
                        {Object.keys(poTermsTemplates).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handlePoLoadTerms}
                        className="px-2.5 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xs text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                        title="Load Selected Terms"
                      >
                        <span>↻</span>
                        <span>Load</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePoClearTerms}
                        className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                        title="Clear Terms"
                      >
                        <span>🗑</span>
                        <span>Clear</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!poFormData.termsCondition || poFormData.termsCondition === 'Select') {
                            showPoTermsToast('Please select a Terms & Conditions template to delete.');
                            return;
                          }
                          handlePoDeleteTerms(poFormData.termsCondition);
                        }}
                        className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                        title="Delete Selected Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewPoTermsTitle('');
                          setNewPoTermsContent('');
                          setIsAddPoTermsModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xs text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                        title="Add New Terms & Condition Template"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ New</span>
                      </button>
                    </div>

                    {/* WYSIWYG Editor Mock Container */}
                    <div className="border border-slate-300 rounded-sm overflow-hidden bg-white shadow-2xs">
                      {/* Toolbar Row 1 */}
                      <div className="bg-[#F1F5F9] border-b border-slate-300 p-1 flex flex-wrap items-center gap-1 text-slate-600 text-xs select-none">
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Cut">✂️</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Copy">📋</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Paste">📄</button>
                        <span className="w-[1px] h-4 bg-slate-300 mx-0.5"></span>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Undo">↺</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Redo">↻</button>
                        <span className="w-[1px] h-4 bg-slate-300 mx-0.5"></span>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600 font-mono text-[10px]" title="Spellcheck">ABC✓</button>
                        <span className="w-[1px] h-4 bg-slate-300 mx-0.5"></span>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Link">🔗</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Unlink">⛓️‍💥</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Image">🖼️</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Table">▦</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Special Character">Ω</button>
                        <button type="button" className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Fullscreen">⛶</button>
                      </div>
                      {/* Toolbar Row 2 */}
                      <div className="bg-[#F8FAFC] border-b border-slate-300 p-1 flex flex-wrap items-center gap-1.5 text-slate-700 text-xs select-none">
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-bold" title="Bold">B</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded italic font-serif" title="Italic">I</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded line-through" title="Strikethrough">S</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded text-[11px] font-mono" title="Remove Format">I<sub>x</sub></button>
                        <span className="w-[1px] h-4 bg-slate-300 mx-0.5"></span>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded" title="Numbered List">1.☰</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded" title="Bulleted List">•☰</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded" title="Outdent">⇠</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded" title="Indent">⇢</button>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-serif" title="Blockquote">”</button>
                        <span className="w-[1px] h-4 bg-slate-300 mx-0.5"></span>
                        <select className="px-1.5 py-0.5 border border-slate-300 rounded text-[11px] bg-white text-slate-700">
                          <option>Styles</option>
                        </select>
                        <select className="px-1.5 py-0.5 border border-slate-300 rounded text-[11px] bg-white text-slate-700">
                          <option>Format</option>
                        </select>
                        <button type="button" className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-bold text-slate-500" title="Help">?</button>
                      </div>
                      {/* Text Area */}
                      <textarea
                        rows={7}
                        value={poFormData.termsConditionText}
                        onChange={(e) => setPoFormData({ ...poFormData, termsConditionText: e.target.value })}
                        placeholder=""
                        className="w-full p-3 text-xs bg-white text-slate-800 focus:outline-none resize-none font-sans"
                      />
                      {/* Editor Status Bar */}
                      <div className="px-2 py-0.5 bg-[#F1F5F9] border-t border-slate-200 text-[10px] text-slate-400 font-mono flex items-center justify-between select-none">
                        <span>body p</span>
                        <span className="cursor-se-resize">◢</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Calculations Summary */}
                  <div className="lg:col-span-5 space-y-2 text-xs">
                    {/* Amount */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-right font-medium text-slate-700 pr-2">Amount</label>
                      <div className="col-span-7">
                        <input
                          type="text"
                          readOnly
                          value={poCalculatedAmount.toFixed(2)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-[#F1F5F9] text-right font-mono text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-right font-medium text-slate-700 pr-2">Discount</label>
                      <div className="col-span-7">
                        <input
                          type="number"
                          step="0.01"
                          value={poFormData.discount || ''}
                          onChange={(e) => setPoFormData({ ...poFormData, discount: Number(e.target.value) })}
                          placeholder=""
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-right font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* VAT % */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-right font-medium text-slate-700 pr-2">VAT %</label>
                      <div className="col-span-7">
                        <input
                          type="text"
                          readOnly
                          value={poFormData.vatType === 'with_vat' ? '5' : '0'}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-[#F1F5F9] text-right font-mono text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* VAT */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-right font-medium text-slate-700 pr-2">VAT</label>
                      <div className="col-span-7">
                        <input
                          type="text"
                          readOnly
                          value={poCalculatedVat.toFixed(2)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-[#F1F5F9] text-right font-mono text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Adjustment */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-right font-medium text-slate-700 pr-2">Adjustment</label>
                      <div className="col-span-7">
                        <input
                          type="number"
                          step="0.01"
                          value={poFormData.adjustment || ''}
                          onChange={(e) => setPoFormData({ ...poFormData, adjustment: Number(e.target.value) })}
                          placeholder=""
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-right font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-right font-semibold text-slate-800 pr-2">Total Amount</label>
                      <div className="col-span-7">
                        <input
                          type="text"
                          readOnly
                          value={poCalculatedTotal.toFixed(2)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-[#F1F5F9] text-right font-mono text-slate-900 font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Footer Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handlePoSubmit}
                    className="px-5 py-2 bg-[#1B365D] hover:bg-[#11243E] text-white text-xs font-bold rounded-xs shadow-xs transition cursor-pointer"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoViewMode('list')}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* Add New Owner Modal */}
              {isAddOwnerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                  <div className="bg-white rounded shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                        <span className="text-sm">👤</span>
                        <span>Add New Owner</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddOwnerModalOpen(false);
                          setNewOwnerInputName('');
                        }}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Owner Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newOwnerInputName}
                          onChange={(e) => setNewOwnerInputName(e.target.value)}
                          placeholder="e.g. John Doe"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewOwner();
                            }
                          }}
                          autoFocus
                          className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddOwnerModalOpen(false);
                            setNewOwnerInputName('');
                          }}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewOwner}
                          disabled={!newOwnerInputName.trim()}
                          className="px-4 py-1.5 bg-[#1B365D] hover:bg-[#11243E] disabled:bg-slate-300 text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
                        >
                          Add Owner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Order Number Settings Modal */}
              {isPoNumberSettingsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                  <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 text-sm">
                        Purchase Order Number
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsPoNumberSettingsModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4 text-xs text-slate-700">
                      {/* Prefix */}
                      <div className="grid grid-cols-12 items-center gap-4">
                        <label className="col-span-4 font-semibold text-slate-700">
                          Prefix
                        </label>
                        <div className="col-span-8">
                          <input
                            type="text"
                            value={poPrefix}
                            onChange={(e) => setPoPrefix(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Next Number */}
                      <div className="grid grid-cols-12 items-center gap-4">
                        <label className="col-span-4 font-semibold text-slate-700">
                          Next Number <span className="text-red-500">*</span>
                        </label>
                        <div className="col-span-8">
                          <input
                            type="text"
                            value={poNextNumber}
                            onChange={(e) => setPoNextNumber(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSavePoNumberSettings();
                              }
                            }}
                            autoFocus
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPoNumberSettingsModalOpen(false)}
                        className="px-4 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-white bg-white cursor-pointer font-medium shadow-2xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePoNumberSettings}
                        className="px-5 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add New Terms & Conditions Modal */}
              {isAddPoTermsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                  <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                        <span className="text-blue-600 font-bold text-sm">ℹ</span>
                        <span>Add Terms & Conditions</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddPoTermsModalOpen(false);
                          setNewPoTermsTitle('');
                          setNewPoTermsContent('');
                        }}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveNewPoTerms} className="p-5 space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Template Title / Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newPoTermsTitle}
                          onChange={(e) => setNewPoTermsTitle(e.target.value)}
                          placeholder="e.g. 60 Days Credit & Warranty Terms"
                          autoFocus
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Terms & Conditions Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={6}
                          value={newPoTermsContent}
                          onChange={(e) => setNewPoTermsContent(e.target.value)}
                          placeholder="1. Payment terms: 60 days credit...&#10;2. Delivery schedule...&#10;3. Warranty specifications..."
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddPoTermsModalOpen(false);
                            setNewPoTermsTitle('');
                            setNewPoTermsContent('');
                          }}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                        >
                          Cancel
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleAddAnotherPoTerm}
                            disabled={!newPoTermsTitle.trim() || !newPoTermsContent.trim()}
                            className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] disabled:bg-slate-300 text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
                          >
                            + Add Another
                          </button>
                          <button
                            type="submit"
                            disabled={!newPoTermsTitle.trim() || !newPoTermsContent.trim()}
                            className="px-4 py-1.5 bg-[#1B365D] hover:bg-[#11243E] disabled:bg-slate-300 text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
                          >
                            Save & Insert
                          </button>
                        </div>
                      </div>

                      {/* Saved PO Templates List with Delete Option */}
                      {Object.keys(poTermsTemplates).length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                            <span>Saved Templates ({Object.keys(poTermsTemplates).length})</span>
                            <span className="text-[10px] text-slate-400 font-normal">Click trash icon to delete</span>
                          </div>
                          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded p-1.5 bg-slate-50/50">
                            {Object.entries(poTermsTemplates).map(([tName, tContent]) => (
                              <div
                                key={tName}
                                className="flex items-center justify-between p-2 bg-white hover:bg-slate-100/80 rounded border border-slate-200 text-xs transition gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-slate-800 truncate">{tName}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{tContent.replace(/\n/g, ' • ')}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePoDeleteTerms(tName)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition shrink-0"
                                  title={`Delete "${tName}"`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}

              {/* Terms Toast Notification */}
              {poTermsToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{poTermsToast}</span>
                </div>
              )}
            </div>
          ) : poViewMode === 'details' && viewingPo ? (
            /* ========================================================= */
            /* PURCHASE ORDER DETAILS VIEW (Exact Cezcon CRM Layout)      */
            /* ========================================================= */
            <div className="space-y-0 text-xs">
              {/* Top Gray Banner */}
              <div className="bg-[#E2E8F0] border border-slate-300 rounded-t-sm px-3.5 py-2 flex items-center justify-between text-xs font-bold text-slate-800 tracking-wide uppercase select-none">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">⤢</span>
                  <span>
                    PURCHASE ORDER CREATED BY {viewingPo.owner ? viewingPo.owner.toUpperCase() : 'USER'} ON {viewingPo.createdAtFormatted || `WED ${viewingPo.date || getLiveTodayDateString()} 11:07:05 AM`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPoViewMode('list');
                    if (searchParams.get('view')) {
                      router.push('/purchase?tab=po');
                    }
                  }}
                  className="w-5 h-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center rounded-xs text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-tabs Row */}
              <div className="bg-[#F8FAFC] border-x border-b border-slate-300 px-3 py-1 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPoDetailActiveTab('details')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none',
                    poDetailActiveTab === 'details'
                      ? 'bg-white border-t-2 border-t-[#DC2626] border-x border-slate-300 text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Purchase Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPoDetailActiveTab('invoice')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5 transition cursor-pointer select-none',
                    poDetailActiveTab === 'invoice'
                      ? 'bg-white border-t-2 border-t-[#DC2626] border-x border-slate-300 text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Purchase Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPoDetailActiveTab('do')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5 transition cursor-pointer select-none',
                    poDetailActiveTab === 'do'
                      ? 'bg-white border-t-2 border-t-[#DC2626] border-x border-slate-300 text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>DO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPoDetailActiveTab('history')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-t text-xs font-medium flex items-center gap-1.5 transition cursor-pointer select-none',
                    poDetailActiveTab === 'history'
                      ? 'bg-white border-t-2 border-t-[#DC2626] border-x border-slate-300 text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <List className="w-3.5 h-3.5 text-slate-400" />
                  <span>PO Status Change History</span>
                </button>
              </div>

              {/* Purchase Order Details Card */}
              <div className="bg-white border-x border-b border-slate-300 shadow-xs">
                {/* Card Section Header */}
                <div className="px-4 py-2 bg-[#F1F5F9] border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Purchase Order Details</span>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Two-Column Info Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3 text-xs text-slate-700">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Owner</span>
                        <div className="col-span-8 flex items-center gap-2">
                          {viewingPo.ownerAvatar ? (
                            <img src={viewingPo.ownerAvatar} alt={viewingPo.owner} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {viewingPo.owner ? viewingPo.owner.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 uppercase">{viewingPo.owner}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Purchase Order Number</span>
                        <span className="col-span-8 font-bold text-slate-900">{viewingPo.poNumber}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Date</span>
                        <span className="col-span-8 font-medium text-slate-800">{viewingPo.date}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Expected Delivery</span>
                        <span className="col-span-8 text-slate-700">{viewingPo.expectedDeliveryDate || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-start gap-2">
                        <span className="col-span-4 text-slate-500 font-medium pt-0.5">Supplier</span>
                        <div className="col-span-8 space-y-0.5">
                          <div className="font-bold text-[#1E40AF] hover:underline cursor-pointer">
                            {viewingPo.supplier}
                          </div>
                          {(() => {
                            const info = getSupplierContactInfo(viewingPo.supplier);
                            return (
                              <div className="text-[11px] text-slate-600 space-y-0.5 mt-0.5">
                                {info.phone && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-pink-600 font-bold">📞</span>
                                    <span className="text-slate-800 font-medium">{info.phone}</span>
                                  </div>
                                )}
                                {info.email && (
                                  <div className="flex items-center gap-1 text-slate-800 font-medium">
                                    <span className="text-slate-400">✉</span>
                                    <span>{info.email}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Reference</span>
                        <span className="col-span-8 text-slate-700">{viewingPo.reference || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Description</span>
                        <span className="col-span-8 text-slate-700">{viewingPo.description || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Status</span>
                        <div className="col-span-8 flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#15803D]">
                            {viewingPo.approval || 'Waiting for Final Approval'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPoStatusTargetPo(viewingPo);
                              if (viewingPo.approval === 'Approved') {
                                setPoStatusModalSelectedStatus('Approve');
                              } else if (viewingPo.approval === 'Rejected') {
                                setPoStatusModalSelectedStatus('Reject');
                              } else {
                                setPoStatusModalSelectedStatus('Change to Pending');
                              }
                              setPoStatusModalComments('');
                              setIsChangePoStatusModalOpen(true);
                            }}
                            className="px-2 py-0.5 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Change Status</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Delivery Status</span>
                        <div className="col-span-8">
                          <button
                            type="button"
                            onClick={() => {
                              setDeliveryStatusTargetPo(viewingPo);
                              setDeliveryStatusModalSelected(
                                (viewingPo.deliveryStatus as any) || 'Pending'
                              );
                              setIsChangeDeliveryStatusModalOpen(true);
                            }}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getDeliveryStatusBadgeClass(
                              viewingPo.deliveryStatus
                            )} inline-flex items-center gap-1 cursor-pointer transition shadow-2xs`}
                            title="Change Delivery Status"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>{viewingPo.deliveryStatus || 'Pending'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Opportunity/Order</span>
                        <span className="col-span-8 text-slate-700">{viewingPo.order || viewingPo.opportunityOrder || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Project Number</span>
                        <span className="col-span-8 text-slate-700">{viewingPo.projectNumber || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Project Name</span>
                        <span className="col-span-8 text-slate-700">{viewingPo.projectName || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-start gap-2">
                        <span className="col-span-4 text-slate-500 font-medium pt-0.5">Prepared By</span>
                        <div className="col-span-8 space-y-0.5">
                          <div className="font-bold text-slate-900 uppercase">
                            {viewingPo.preparedBy || viewingPo.owner}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700">
                            {viewingPo.preparedByDesignation || 'Inventory Management (IM)'}
                          </div>
                          <div className="text-[11px] text-[#DB2777] font-semibold flex items-center gap-1">
                            <span>📞</span>
                            <span>{viewingPo.preparedByMobile || '+9715688783056'}</span>
                          </div>
                          <div className="text-[11px] text-slate-800 font-semibold flex items-center gap-1">
                            <span>✉</span>
                            <span>{viewingPo.preparedByEmail || 'im@cooltechuae.com'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Attention</span>
                        <span className="col-span-8 font-semibold text-slate-800">{viewingPo.attention || '-'}</span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Amount</span>
                        <span className="col-span-8 font-bold text-slate-900 font-mono">
                          {Number(viewingPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Sub Total</span>
                        <span className="col-span-8 font-bold text-slate-900 font-mono">
                          {Number(viewingPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">VAT (5%)</span>
                        <span className="col-span-8 font-bold text-slate-900 font-mono">
                          {Number(viewingPo.vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-4 text-slate-500 font-medium">Total Amount</span>
                        <span className="col-span-8 font-bold text-slate-900 font-mono text-sm">
                          {Number(viewingPo.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 w-20 text-center">QTY</th>
                          <th className="p-3 w-32 text-center">Delivery Pending</th>
                          <th className="p-3 w-32 text-right">Amount</th>
                          <th className="p-3 w-32 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(viewingPo.items && viewingPo.items.length > 0
                          ? viewingPo.items
                          : [
                            {
                              id: 'item_1',
                              description: viewingPo.description || 'REFRIGERATOR 140 LTR SINGLE DOOR NOBEL NR140',
                              code: 'NR140',
                              unit: 'Pcs',
                              brand: 'NOBEL',
                              qty: 1,
                              deliveryPending: 1,
                              amount: viewingPo.amount || 4000.0,
                              total: viewingPo.amount || 4000.0,
                            },
                          ]
                        ).map((item: any, idx: number) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-10 bg-slate-100 border border-slate-200 rounded flex flex-col items-center justify-center text-[7px] text-slate-400 font-bold uppercase text-center p-0.5 shrink-0 select-none">
                                    <span className="text-[10px]">🖼️</span>
                                    <span>NO IMAGE</span>
                                  </div>
                                  <span className="font-bold text-slate-900 uppercase text-xs">{item.description || 'Item'}</span>
                                </div>
                                <div className="text-[11px] text-slate-600 space-y-0.5 text-left shrink-0 pr-8">
                                  <div>
                                    <span className="italic text-slate-500">Code:</span> <span className="font-medium text-slate-800 not-italic">{item.code || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="italic text-slate-500">Unit:</span> <span className="font-medium text-slate-800 not-italic">{item.unit || 'Pcs'}</span>
                                  </div>
                                  <div>
                                    <span className="italic text-slate-500">Brand:</span> <span className="font-medium text-slate-800 not-italic">{item.brand || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center font-medium text-slate-800">{item.qty}</td>
                            <td className="p-3 text-center font-medium text-slate-800">{item.deliveryPending || item.qty}</td>
                            <td className="p-3 text-right font-medium text-slate-800 font-mono">
                              {Number(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900 font-mono">
                              {Number(item.total || Number(item.qty || 0) * Number(item.amount || 0)).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Terms & Condition + Totals Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    {/* Terms & Condition */}
                    <div className="lg:col-span-8 space-y-1.5">
                      <div className="font-bold text-slate-900 text-xs">Terms & Condition:</div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl whitespace-pre-line">
                        {viewingPo.termsConditionText ||
                          'All product supply should be from the latest stock. Material supplied should comply 100% with the requested specifications. Products with any manufacturing defects or issues should be exchanged with new one with all cost including fright to End User. Cool Technologies is requesting you to acknowledge the receipt of this LPO and confirmation of delivery time, via return email.'}
                      </p>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 pt-2 lg:pt-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Amount</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {Number(viewingPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Sub Total</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {Number(viewingPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">VAT (5%)</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {Number(viewingPo.vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Adjustment</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {Number(viewingPo.adjustment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-900">Total Amount</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {Number(viewingPo.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Print Buttons directly below Totals on the Right */}
                      <div className="pt-4 flex items-center justify-end gap-1.5">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPoPrintFormatOpen(!isPoPrintFormatOpen);
                            }}
                            className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition select-none"
                          >
                            <Printer className="w-3.5 h-3.5 text-white" />
                            <span>Print Format</span>
                            <ChevronDown className={cn('w-3 h-3 text-white ml-0.5 transition-transform', isPoPrintFormatOpen ? 'rotate-180' : '')} />
                          </button>

                          {isPoPrintFormatOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 top-full mt-1 z-50 w-64 bg-white border border-slate-200 rounded shadow-xl py-1 text-left text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-75"
                            >
                              {[
                                'Print with Quantity',
                                'Print without Quantity',
                                'Print without Item Price',
                                'Print without Quantity & Item Price',
                                'Print without Total Price',
                                'Print without Unit Price & Total Price',
                                'Print without Unit Price & with Total Price',
                              ].map((formatOption) => (
                                <button
                                  key={formatOption}
                                  type="button"
                                  onClick={() => {
                                    setIsPoPrintFormatOpen(false);
                                    window.open(
                                      `/purchase/print?id=${viewingPo.id}&format=${encodeURIComponent(formatOption)}`,
                                      '_blank'
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 text-slate-800 text-xs font-normal transition-colors cursor-pointer text-left"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 inline-block"></span>
                                  <span>{formatOption}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (viewingPo) {
                              try {
                                localStorage.setItem('crm_active_print_po', JSON.stringify(viewingPo));
                              } catch (e) {
                                console.error(e);
                              }
                            }
                            window.open(
                              `/purchase/print?id=${viewingPo.id}&currency=USD&format=Print with Quantity`,
                              '_blank'
                            );
                          }}
                          className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-white" />
                          <span>Print in USD</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (viewingPo) {
                              try {
                                localStorage.setItem('crm_active_print_po', JSON.stringify(viewingPo));
                              } catch (e) {
                                console.error(e);
                              }
                            }
                            window.open(
                              `/purchase/print?id=${viewingPo.id}&format=Print with Quantity`,
                              '_blank'
                            );
                          }}
                          className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-white" />
                          <span>Print</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePurchaseOrder(viewingPo.id, viewingPo.poNumber)}
                          className="px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer Back Button row on the far right */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPoViewMode('list');
                        if (searchParams.get('view')) {
                          router.push('/purchase?tab=po');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* PURCHASE ORDER LIST VIEW                                  */
            /* ========================================================= */
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
                        {users && users.length > 0 ? (
                          users.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Muhammad Ali">Muhammad Ali</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Shaheer">Shaheer</option>
                          </>
                        )}
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
                        <option value="SUPER GENERAL COMPANY LLC">SUPER GENERAL COMPANY LLC</option>
                        <option value="LUTFI TRADING LLC">LUTFI TRADING LLC</option>
                        <option value="DUBAI POLYMER INDUSTRIES LLC">DUBAI POLYMER INDUSTRIES LLC</option>
                        <option value="CENTRAL TRADING COMPANY L.L.C.">CENTRAL TRADING COMPANY L.L.C.</option>
                        <option value="Better Life">Better Life</option>
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
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs text-xs">
                {/* Header */}
                <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="text-sm">🗂️</span>
                    <span>Purchase Order</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPoViewMode('add')}
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
                          <button
                            type="button"
                            onClick={() => {
                              setViewingPo(po);
                              setPoViewMode('details');
                            }}
                            className="inline-flex items-center gap-1 text-[#2563EB] hover:underline cursor-pointer font-bold text-xs"
                          >
                            <span>📄</span>
                            <span>{po.poNumber}</span>
                          </button>
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

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 relative">
                        <span className="text-[10px] text-slate-500 font-medium">{po.owner}</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePoActionDropdownId(activePoActionDropdownId === po.id ? null : po.id);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5 bg-[#0e7490] hover:bg-[#0c667f] text-white rounded text-[10px] font-semibold cursor-pointer shadow-xs transition"
                            title="Actions"
                          >
                            <Settings className="w-3 h-3 text-white" />
                            <ChevronDown className="w-2 h-2 text-white" />
                          </button>
                          {activePoActionDropdownId === po.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded shadow-xl py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-75"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePoActionDropdownId(null);
                                  window.open(`/purchase?tab=po&view=${po.id}`, '_blank');
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                              >
                                <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                <span>Open in new tab</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePoActionDropdownId(null);
                                  setViewingPo(po);
                                  setPoViewMode('details');
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                              >
                                <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePurchaseOrder(po.id, po.poNumber)}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-red-50 text-red-600 font-medium transition-colors cursor-pointer border-t border-slate-100"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop PO Table */}
                <div className="hidden md:block overflow-x-auto min-h-[260px] pb-28">
                  <table className="w-full text-xs text-left">
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
                      {filteredPOItems.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="p-8 text-center text-slate-500 text-xs">
                            No records found
                          </td>
                        </tr>
                      ) : (
                        filteredPOItems.map((po) => (
                          <tr key={po.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">{po.slNo}</td>
                            <td className="p-2.5 text-center border-r border-slate-100">
                              {po.ownerAvatar ? (
                                <img src={po.ownerAvatar} alt={po.owner} className="w-6 h-6 rounded-full object-cover inline-block mx-auto border border-slate-200" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold mx-auto">
                                  {po.owner ? po.owner.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 border-r border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingPo(po);
                                  setPoViewMode('details');
                                }}
                                className="inline-flex items-center gap-1 text-[#1976D2] hover:underline cursor-pointer font-bold"
                              >
                                <span className="text-[10px]">📄</span>
                                <span>{po.poNumber}</span>
                              </button>
                            </td>
                            <td className="p-2.5 text-slate-700 border-r border-slate-100 whitespace-nowrap">{po.date}</td>
                            <td className="p-2.5 border-r border-slate-100 font-bold">
                              <span className="text-[#1976D2] hover:underline cursor-pointer">
                                {po.supplier}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-400 border-r border-slate-100">{po.order || ''}</td>
                            <td className="p-2.5 text-slate-400 border-r border-slate-100">{po.reference || ''}</td>
                            <td className="p-2.5 text-right font-medium text-slate-900 border-r border-slate-100 font-mono">
                              {Number(po.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-2.5 text-right font-medium text-slate-700 border-r border-slate-100 font-mono">
                              {Number(po.vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-900 border-r border-slate-100 font-mono">
                              {Number(po.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">{po.invoiceReceived || ''}</td>
                            <td className="p-2.5 text-center border-r border-slate-100">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-2xs ${po.approval === 'Waiting for Final Approval'
                                  ? 'bg-[#1E5128]'
                                  : 'bg-[#2E7D32]'
                                  }`}
                              >
                                {po.approval || 'Approved'}
                              </span>
                            </td>
                            <td className="p-2.5 text-center border-r border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleOpenChangeDeliveryStatus(po)}
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getDeliveryStatusBadgeClass(
                                  po.deliveryStatus
                                )} inline-flex items-center gap-1 whitespace-nowrap shadow-2xs cursor-pointer transition`}
                                title="Change Delivery Status"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>{po.deliveryStatus || 'Pending'}</span>
                              </button>
                            </td>
                            <td className="p-2.5 text-center relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePoActionDropdownId(activePoActionDropdownId === po.id ? null : po.id);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#0e7490] hover:bg-[#0c667f] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                title="Actions"
                              >
                                <Settings className="w-3.5 h-3.5 text-white" />
                                <ChevronDown className="w-2.5 h-2.5 text-white" />
                              </button>

                              {activePoActionDropdownId === po.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded shadow-xl py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-75"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivePoActionDropdownId(null);
                                      window.open(`/purchase?tab=po&view=${po.id}`, '_blank');
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>Open in new tab</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivePoActionDropdownId(null);
                                      setViewingPo(po);
                                      setPoViewMode('details');
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivePoActionDropdownId(null);
                                      setPoStatusTargetPo(po);
                                      if (po.approval === 'Approved') {
                                        setPoStatusModalSelectedStatus('Approve');
                                      } else if (po.approval === 'Rejected') {
                                        setPoStatusModalSelectedStatus('Reject');
                                      } else {
                                        setPoStatusModalSelectedStatus('Change to Pending');
                                      }
                                      setPoStatusModalComments('');
                                      setIsChangePoStatusModalOpen(true);
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>Change Status</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePurchaseOrder(po.id, po.poNumber)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-red-50 text-red-600 font-medium transition-colors cursor-pointer border-t border-slate-100"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                    <div>
                      Showing {filteredPOItems.length > 0 ? 1 : 0} to {filteredPOItems.length} of {filteredPOItems.length} entries
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Change Purchase Order Status Modal */}
            {isChangePoStatusModalOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in"
                onClick={() => setIsChangePoStatusModalOpen(false)}
              >
                <div
                  className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs animate-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
                    <h3 className="font-semibold text-sm text-slate-900">Change Purchase Order Status</h3>
                    <button
                      type="button"
                      onClick={() => setIsChangePoStatusModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-5 bg-white">
                    {/* Status Radio Group */}
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <label className="col-span-3 text-slate-800 font-semibold text-xs pt-0.5">
                        Status
                      </label>
                      <div className="col-span-9 space-y-2.5 text-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="poStatusRadio"
                            value="Approve"
                            checked={poStatusModalSelectedStatus === 'Approve'}
                            onChange={() => setPoStatusModalSelectedStatus('Approve')}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                          />
                          <span>Approve</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="poStatusRadio"
                            value="Reject"
                            checked={poStatusModalSelectedStatus === 'Reject'}
                            onChange={() => setPoStatusModalSelectedStatus('Reject')}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                          />
                          <span>Reject</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                          <input
                            type="radio"
                            name="poStatusRadio"
                            value="Change to Pending"
                            checked={poStatusModalSelectedStatus === 'Change to Pending'}
                            onChange={() => setPoStatusModalSelectedStatus('Change to Pending')}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                          />
                          <span>Change to Pending</span>
                        </label>
                      </div>
                    </div>

                    {/* Comments textarea */}
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <label className="col-span-3 text-slate-800 font-semibold text-xs pt-1.5">
                        Comments
                      </label>
                      <div className="col-span-9">
                        <textarea
                          rows={3}
                          value={poStatusModalComments}
                          onChange={(e) => setPoStatusModalComments(e.target.value)}
                          placeholder=""
                          className="w-full p-2.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white resize-y min-h-[70px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-5 py-3 bg-[#F1F5F9] border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsChangePoStatusModalOpen(false)}
                      className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = poStatusTargetPo || viewingPo;
                        if (!target) return;
                        const statusLabel =
                          poStatusModalSelectedStatus === 'Approve'
                            ? 'Approved'
                            : poStatusModalSelectedStatus === 'Reject'
                            ? 'Rejected'
                            : 'Waiting for Final Approval';

                        const updatedList = purchaseOrders.map((p) =>
                          p.id === target.id ? { ...p, approval: statusLabel } : p
                        );
                        setPurchaseOrders(updatedList);
                        if (viewingPo && viewingPo.id === target.id) {
                          setViewingPo({ ...viewingPo, approval: statusLabel });
                        }
                        try {
                          localStorage.setItem('crm_purchase_orders', JSON.stringify(updatedList));
                          window.dispatchEvent(new Event('crm_purchase_orders_updated'));
                        } catch (e) {
                          console.error(e);
                        }
                        setIsChangePoStatusModalOpen(false);
                        setPoStatusModalComments('');
                      }}
                      className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        )}

        {/* ========================================================= */}
        {/* PURCHASE INVOICE (Exact Cezcon CRM Layout)                 */}
        {/* ========================================================= */}
        {mainTab === 'invoice' && (
          <>
            {invoiceViewMode === 'add' ? (
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                {/* Header bar matching Cezcon CRM */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{editingInvoiceId ? 'Edit Purchase Invoice' : 'Add Purchase Invoice'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInvoiceId(null);
                      setInvoiceViewMode('list');
                    }}
                    className="w-5 h-5 bg-[#DC2626] hover:bg-[#b91c1c] text-white rounded-xs flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer transition"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* 2-Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5">
                    {/* Left Column */}
                    <div className="space-y-3.5">
                      {/* Owner */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0">
                          Owner <span className="text-[#EA580C]">*</span>
                        </label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                              <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] flex items-center justify-center text-slate-600 font-bold">👤</span>
                            </div>
                            <select
                              value={invoiceOwner}
                              onChange={(e) => {
                                if (e.target.value === '__add_new__') {
                                  setIsAddInvoiceOwnerModalOpen(true);
                                } else {
                                  setInvoiceOwner(e.target.value);
                                }
                              }}
                              className="w-full pl-8 pr-8 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 appearance-none font-medium"
                            >
                              {invoiceOwnersList.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                              <option value="__add_new__" className="font-semibold text-emerald-600">
                                + Add New Owner...
                              </option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddInvoiceOwnerModalOpen(true)}
                            className="px-2.5 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs"
                            title="Add New Owner"
                          >
                            <span>+ New</span>
                          </button>
                        </div>
                      </div>

                      {/* Purchase Order Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0">
                          Purchase Order Number
                        </label>
                        <div className="relative flex-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              list="po-numbers-datalist"
                              placeholder="Select or enter PO Number (e.g. CTPO#2543)"
                              value={invoicePoNumber}
                              onChange={(e) => handleSelectPurchaseOrder(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                            />
                            <datalist id="po-numbers-datalist">
                              {purchaseOrders.map((po) => (
                                <option key={po.id || po.poNumber} value={po.poNumber}>
                                  {po.poNumber} - {po.supplier} (Amount: {po.totalAmount || po.amount})
                                </option>
                              ))}
                            </datalist>
                          </div>
                          {purchaseOrders.length > 0 && (
                            <select
                              value={invoicePoNumber}
                              onChange={(e) => handleSelectPurchaseOrder(e.target.value)}
                              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-700 focus:outline-none max-w-[130px] truncate"
                              title="Pick from created Purchase Orders"
                            >
                              <option value="">Select PO</option>
                              {purchaseOrders.map((po) => (
                                <option key={po.id || po.poNumber} value={po.poNumber}>
                                  {po.poNumber}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      {/* PISN */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0 flex items-center gap-1">
                          <span>PISN</span>
                          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-black text-white text-[9px] font-bold cursor-help" title="Purchase Invoice Sequence Number">?</span>
                          <span className="text-[#EA580C]">*</span>
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoicePisn}
                            onChange={(e) => setInvoicePisn(e.target.value)}
                            className="w-full pl-3 pr-9 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setInvoicePisn(`PIR${Math.floor(80 + Math.random() * 20)}`)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-700 cursor-pointer"
                            title="Configure / Regenerate PISN"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Purchase Invoice Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0">
                          Purchase Invoice Number <span className="text-[#EA580C]">*</span>
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceNumberInput}
                            onChange={(e) => setInvoiceNumberInput(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Supplier */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0">
                          Supplier <span className="text-[#EA580C]">*</span>
                        </label>
                        <div className="relative flex-1">
                          <select
                            value={invoiceSupplier}
                            onChange={(e) => setInvoiceSupplier(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 appearance-none"
                          >
                            <option value="Select">Select</option>
                            <option value="GULF ELECTRONICS COMPANY LLC">GULF ELECTRONICS COMPANY LLC</option>
                            <option value="RAPID COOL TRADING CO. L.L.C">RAPID COOL TRADING CO. L.L.C</option>
                            <option value="GENERAL ENTERPRISES CO L.L.C">GENERAL ENTERPRISES CO L.L.C</option>
                            <option value="TAQEEF REFRIGERATION & AIR CONDITIONING TRADING LLC">TAQEEF REFRIGERATION & AIR CONDITIONING TRADING LLC</option>
                            <option value="EMIRATES JO TRADE CO">EMIRATES JO TRADE CO</option>
                            <option value="SUPER GENERAL COMPANY LLC">SUPER GENERAL COMPANY LLC</option>
                            <option value="LUTFI TRADING LLC">LUTFI TRADING LLC</option>
                            <option value="DUBAI POLYMER INDUSTRIES LLC">DUBAI POLYMER INDUSTRIES LLC</option>
                            <option value="CENTRAL TRADING COMPANY L.L.C.">CENTRAL TRADING COMPANY L.L.C.</option>
                            <option value="Better Life">Better Life</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Purchase Invoice Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0">
                          Purchase Invoice Date
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
                            📅
                          </span>
                        </div>
                      </div>

                      {/* Order */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0 flex items-center gap-1">
                          <span>Order</span>
                          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#0B1E2E] text-white text-[9px] font-bold cursor-help" title="Select linked Order">i</span>
                        </label>
                        <div className="relative flex-1">
                          <select
                            value={invoiceOrder}
                            onChange={(e) => setInvoiceOrder(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 appearance-none"
                          >
                            <option value="Select Order">Select Order</option>
                            <option value="SO-8821">SO-8821</option>
                            <option value="SO-8834">SO-8834</option>
                            <option value="SO-8840">SO-8840</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* With Purchase Items? */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-44 text-slate-700 font-medium text-xs shrink-0">
                          With Purchase Items?
                        </label>
                        <div className="flex items-center gap-4 text-xs text-slate-700 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="radio"
                              name="withPurchaseItems"
                              value="yes"
                              checked={invoiceWithItems === 'yes'}
                              onChange={() => setInvoiceWithItems('yes')}
                              className="accent-[#0B1E2E] cursor-pointer"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="radio"
                              name="withPurchaseItems"
                              value="no"
                              checked={invoiceWithItems === 'no'}
                              onChange={() => setInvoiceWithItems('no')}
                              className="accent-[#0B1E2E] cursor-pointer"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3.5">
                      {/* Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Amount <span className="text-[#EA580C]">*</span>
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInvoiceAmount(val);
                              setInvoiceTotalAmount(calculateInvoiceTotal(val, invoiceDiscount, invoiceVatAmount, invoiceAdjustment));
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Discount
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceDiscount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInvoiceDiscount(val);
                              setInvoiceTotalAmount(calculateInvoiceTotal(invoiceAmount, val, invoiceVatAmount, invoiceAdjustment));
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* VAT Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          VAT Amount
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceVatAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInvoiceVatAmount(val);
                              setInvoiceTotalAmount(calculateInvoiceTotal(invoiceAmount, invoiceDiscount, val, invoiceAdjustment));
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Adjustment */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Adjustment
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceAdjustment}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInvoiceAdjustment(val);
                              setInvoiceTotalAmount(calculateInvoiceTotal(invoiceAmount, invoiceDiscount, invoiceVatAmount, val));
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Total Amount
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoiceTotalAmount}
                            onChange={(e) => setInvoiceTotalAmount(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Payment Due */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Payment Due
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={invoicePaymentDue}
                            onChange={(e) => setInvoicePaymentDue(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
                            📅
                          </span>
                        </div>
                      </div>

                      {/* File */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          File
                        </label>
                        <div className="relative flex-1 flex items-center gap-2">
                          <label className="px-2.5 py-1 bg-[#E2E8F0] hover:bg-slate-300 text-slate-700 text-xs rounded border border-slate-300 cursor-pointer transition font-medium">
                            Choose file
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setInvoiceFile(e.target.files[0]);
                                  setInvoiceFileName(e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                          <span className="text-slate-500 text-xs truncate max-w-xs">{invoiceFileName}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0 pt-1.5">
                          Description
                        </label>
                        <div className="relative flex-1">
                          <textarea
                            value={invoiceDescription}
                            onChange={(e) => setInvoiceDescription(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Items Table (Visible when With Purchase Items is Yes) */}
                  {invoiceWithItems === 'yes' && (
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Purchase Items ({invoiceItems.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [
                              ...invoiceItems,
                              {
                                id: `inv_item_${Date.now()}`,
                                item: '',
                                unit: 'Pcs',
                                rate: '0.00',
                                qty: '1',
                                total: '0.00',
                              },
                            ];
                            setInvoiceItems(newItems);
                            recalcFromItems(newItems);
                          }}
                          className="px-2.5 py-1 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <span>+ Add Item</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold">
                            <tr>
                              <th className="p-2.5 w-12 text-center border-r border-slate-200">#</th>
                              <th className="p-2.5 border-r border-slate-200">Item / Product Description</th>
                              <th className="p-2.5 w-24 border-r border-slate-200">Unit</th>
                              <th className="p-2.5 w-24 text-right border-r border-slate-200">Quantity</th>
                              <th className="p-2.5 w-28 text-right border-r border-slate-200">Rate (AED)</th>
                              <th className="p-2.5 w-28 text-right border-r border-slate-200">Total (AED)</th>
                              <th className="p-2.5 w-14 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {invoiceItems.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                                  No items linked yet. Select a Purchase Order above or click "+ Add Item" to add products.
                                </td>
                              </tr>
                            ) : (
                              invoiceItems.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="p-2 text-center text-slate-500 border-r border-slate-100 font-medium">
                                    {idx + 1}
                                  </td>
                                  <td className="p-2 border-r border-slate-100">
                                    <input
                                      type="text"
                                      list="invoice-products-datalist"
                                      value={item.item}
                                      placeholder="Select or enter product name"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const updated = [...invoiceItems];
                                        updated[idx].item = val;
                                        const foundProd = availableStockInProducts.find((p) => p.name.toLowerCase() === val.toLowerCase());
                                        if (foundProd) {
                                          updated[idx].unit = foundProd.unit;
                                          updated[idx].rate = foundProd.purchaseRate;
                                          const q = parseFloat(updated[idx].qty) || 1;
                                          const r = parseFloat(foundProd.purchaseRate) || 0;
                                          updated[idx].total = (q * r).toFixed(2);
                                        }
                                        setInvoiceItems(updated);
                                        recalcFromItems(updated);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                                    />
                                    <datalist id="invoice-products-datalist">
                                      {availableStockInProducts.map((p) => (
                                        <option key={p.name} value={p.name}>
                                          {p.name} ({p.unit} - {p.purchaseRate} AED)
                                        </option>
                                      ))}
                                    </datalist>
                                  </td>
                                  <td className="p-2 border-r border-slate-100">
                                    <input
                                      type="text"
                                      value={item.unit}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        updated[idx].unit = e.target.value;
                                        setInvoiceItems(updated);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                                    />
                                  </td>
                                  <td className="p-2 border-r border-slate-100">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.qty}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        const q = parseFloat(e.target.value) || 0;
                                        const r = parseFloat(updated[idx].rate) || 0;
                                        updated[idx].qty = e.target.value;
                                        updated[idx].total = (q * r).toFixed(2);
                                        setInvoiceItems(updated);
                                        recalcFromItems(updated);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2 border-r border-slate-100">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={item.rate}
                                      onChange={(e) => {
                                        const updated = [...invoiceItems];
                                        const q = parseFloat(updated[idx].qty) || 0;
                                        const r = parseFloat(e.target.value) || 0;
                                        updated[idx].rate = e.target.value;
                                        updated[idx].total = (q * r).toFixed(2);
                                        setInvoiceItems(updated);
                                        recalcFromItems(updated);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2 text-right border-r border-slate-100 font-bold text-slate-800">
                                    {item.total}
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = invoiceItems.filter((_, i) => i !== idx);
                                        setInvoiceItems(updated);
                                        recalcFromItems(updated);
                                      }}
                                      className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer p-1"
                                      title="Delete item"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Form Actions (Submit & Back) */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCreatePurchaseInvoice}
                      className="px-5 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded-xs text-xs font-semibold shadow-xs cursor-pointer transition"
                    >
                      {editingInvoiceId ? 'Update' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInvoiceId(null);
                        setInvoiceViewMode('list');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xs text-xs font-semibold shadow-xs cursor-pointer transition"
                    >
                      <span>➔</span>
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : invoiceViewMode === 'view' && viewingInvoiceRecord ? (
              /* ========================================================= */
              /* PURCHASE INVOICE VIEW MODE (Exact Cezcon CRM Layout)      */
              /* ========================================================= */
              <div className="bg-white border border-[#D1D5DB] rounded-sm shadow-xs overflow-hidden text-xs">
                {/* Top Gray Header Banner */}
                <div className="px-3.5 py-2 bg-[#E5E7EB] border-b border-slate-300 flex items-center justify-between text-[11px] font-bold text-slate-700 tracking-wide">
                  <div className="flex items-center gap-2 uppercase">
                    <SquarePen className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {invoiceViewActiveSubTab === 'po'
                        ? `PURCHASE ORDER ${(
                            purchaseOrders.find(
                              (p) =>
                                p.poNumber === viewingInvoiceRecord.poNumber ||
                                p.id === viewingInvoiceRecord.poNumber
                            )?.poNumber ||
                            viewingInvoiceRecord.poNumber ||
                            'CTPO#2544'
                          ).toUpperCase()} CREATED BY ${(
                            purchaseOrders.find(
                              (p) =>
                                p.poNumber === viewingInvoiceRecord.poNumber ||
                                p.id === viewingInvoiceRecord.poNumber
                            )?.owner ||
                            viewingInvoiceRecord.owner ||
                            'RASHID'
                          ).toUpperCase()} ON ${
                            purchaseOrders.find(
                              (p) =>
                                p.poNumber === viewingInvoiceRecord.poNumber ||
                                p.id === viewingInvoiceRecord.poNumber
                            )?.createdAtFormatted ||
                            `FRI ${viewingInvoiceRecord.date || '08-10-2026'} 4:52:34 PM`
                          }`
                        : invoiceViewActiveSubTab === 'payment'
                        ? `PAYMENTS FOR PURCHASE INVOICE ${(
                            viewingInvoiceRecord.invoiceNumber || 'INV-2026-001'
                          ).toUpperCase()}`
                        : invoiceViewActiveSubTab === 'do'
                        ? `DELIVERY ORDERS FOR ${(
                            viewingInvoiceRecord.invoiceNumber || 'INV-2026-001'
                          ).toUpperCase()}`
                        : `PURCHASE INVOICE CREATED BY ${
                            viewingInvoiceRecord.owner?.toUpperCase() || 'VAISHAK'
                          } ON ${
                            viewingInvoiceRecord.createdFormatted ||
                            `FRI ${viewingInvoiceRecord.date || '13-02-2026'} 4:52:34 PM`
                          }`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewingInvoiceRecord(null);
                      setInvoiceViewActiveSubTab('invoice');
                      setInvoiceViewMode('list');
                    }}
                    className="w-4 h-4 bg-[#D9534F] hover:bg-[#c9302c] text-white rounded-xs flex items-center justify-center text-[9px] font-bold shadow-2xs transition cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Sub-Tabs Bar */}
                <div className="flex items-center border-b border-slate-300 bg-[#F3F4F6] px-4 pt-1.5 text-xs font-semibold text-slate-600">
                  {/* Tab 1: Purchase Invoice */}
                  <button
                    type="button"
                    onClick={() => setInvoiceViewActiveSubTab('invoice')}
                    className={`px-4 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      invoiceViewActiveSubTab === 'invoice'
                        ? 'border-t-2 border-t-[#D9534F] border-l border-r border-b-0 border-slate-300 bg-white text-slate-800 font-semibold -mb-px rounded-t-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    <span>Purchase Invoice</span>
                  </button>

                  {/* Tab 2: Purchase Order */}
                  <button
                    type="button"
                    onClick={() => setInvoiceViewActiveSubTab('po')}
                    className={`px-4 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      invoiceViewActiveSubTab === 'po'
                        ? 'border-t-2 border-t-[#D9534F] border-l border-r border-b-0 border-slate-300 bg-white text-slate-800 font-semibold -mb-px rounded-t-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Purchase Order</span>
                  </button>

                  {/* Tab 3: Payment */}
                  <button
                    type="button"
                    onClick={() => setInvoiceViewActiveSubTab('payment')}
                    className={`px-4 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      invoiceViewActiveSubTab === 'payment'
                        ? 'border-t-2 border-t-[#D9534F] border-l border-r border-b-0 border-slate-300 bg-white text-slate-800 font-semibold -mb-px rounded-t-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment</span>
                  </button>

                  {/* Tab 4: DO */}
                  <button
                    type="button"
                    onClick={() => setInvoiceViewActiveSubTab('do')}
                    className={`px-4 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      invoiceViewActiveSubTab === 'do'
                        ? 'border-t-2 border-t-[#D9534F] border-l border-r border-b-0 border-slate-300 bg-white text-slate-800 font-semibold -mb-px rounded-t-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>DO</span>
                  </button>
                </div>

                {/* Sub-Tab 1: PURCHASE INVOICE */}
                {invoiceViewActiveSubTab === 'invoice' && (
                  <div className="p-6 bg-white space-y-6 animate-in fade-in duration-100">
                    {/* 2-Column Info Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left Column (Labels and Values) */}
                      <div className="lg:col-span-7 space-y-3">
                        {/* Owner */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Owner</span>
                          <div className="col-span-8 flex items-center gap-2">
                            <img
                              src={
                                viewingInvoiceRecord.ownerAvatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
                              }
                              alt={viewingInvoiceRecord.owner}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-900 text-xs uppercase">
                              {viewingInvoiceRecord.owner || 'VAISHAK'}
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Date</span>
                          <span className="col-span-8 font-bold text-slate-900 text-xs">
                            {viewingInvoiceRecord.date || '13-02-2026'}
                          </span>
                        </div>

                        {/* PISN */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">PISN</span>
                          <span className="col-span-8 font-bold text-slate-900 text-xs">
                            {viewingInvoiceRecord.pisn || 'PIR81'}
                          </span>
                        </div>

                        {/* Purchase Invoice Number */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Purchase Invoice Number</span>
                          <span className="col-span-8 font-bold text-slate-900 text-xs">
                            {viewingInvoiceRecord.invoiceNumber || 'INVR292648'}
                          </span>
                        </div>

                        {/* Supplier */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Supplier</span>
                          <span className="col-span-8 text-[#007BFF] hover:underline cursor-pointer font-bold text-xs uppercase">
                            {viewingInvoiceRecord.supplier || 'GULF ELECTRONICS COMPANY LLC'}
                          </span>
                        </div>

                        {/* PO Number (Clicking this opens PO Sub-tab) */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">PO Number</span>
                          <span
                            onClick={() => setInvoiceViewActiveSubTab('po')}
                            className="col-span-8 text-[#007BFF] hover:underline cursor-pointer font-bold text-xs"
                            title="Click to view linked Purchase Order"
                          >
                            {viewingInvoiceRecord.poNumber || 'CTPO#1727'}
                          </span>
                        </div>

                        {/* Order */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Order</span>
                          <span className="col-span-8 text-slate-800 text-xs font-medium">
                            {viewingInvoiceRecord.order || ''}
                          </span>
                        </div>

                        {/* Delivery Status */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Delivery Status</span>
                          <div className="col-span-8">
                            <button
                              type="button"
                              onClick={() => handleOpenChangeDeliveryStatus(viewingInvoiceRecord)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getDeliveryStatusBadgeClass(
                                viewingInvoiceRecord.deliveryStatus
                              )} inline-flex items-center gap-1 shadow-2xs cursor-pointer transition`}
                              title="Click to change delivery status"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{viewingInvoiceRecord.deliveryStatus || 'Pending'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Payment Status</span>
                          <div className="col-span-8">
                            <button
                              type="button"
                              onClick={() => handleOpenChangePaymentStatus(viewingInvoiceRecord)}
                              className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${getPaymentStatusBadgeClass(
                                viewingInvoiceRecord.status
                              )} shadow-2xs cursor-pointer transition`}
                              title="Click to change payment status"
                            >
                              {viewingInvoiceRecord.status || 'Due'}
                            </button>
                          </div>
                        </div>

                        {/* File */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">File</span>
                          <span className="col-span-8 text-slate-500 text-xs">
                            {viewingInvoiceRecord.fileName || ''}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-4 text-slate-700 font-normal text-xs">Description</span>
                          <span className="col-span-8 text-slate-800 text-xs">
                            {viewingInvoiceRecord.description || ''}
                          </span>
                        </div>
                      </div>

                      {/* Right Column (Amounts Box) */}
                      <div className="lg:col-span-5">
                        <div className="bg-[#F9FAFB] border border-slate-200/80 rounded p-4 space-y-2.5 text-xs">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-normal">Amount</span>
                            <span className="font-bold text-slate-900">
                              {(viewingInvoiceRecord.amount || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-normal">VAT</span>
                            <span className="font-bold text-slate-900">
                              {(viewingInvoiceRecord.vatAmount || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-normal">Sub Total</span>
                            <span className="font-bold text-slate-900">
                              {(
                                (viewingInvoiceRecord.amount || 0) + (viewingInvoiceRecord.vatAmount || 0)
                              ).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-normal">Total Amount</span>
                            <span className="font-bold text-slate-900">
                              {(
                                viewingInvoiceRecord.totalAmount ||
                                viewingInvoiceRecord.amount ||
                                0
                              ).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="font-normal">Payment Due</span>
                            <span className="font-medium text-slate-800">
                              {viewingInvoiceRecord.paymentDue || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="pt-2">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 font-semibold select-none">
                            <th className="py-2.5 px-3">Item</th>
                            <th className="py-2.5 px-3 w-24 text-center">QTY</th>
                            <th className="py-2.5 px-3 w-36 text-right">Purchase Rate</th>
                            <th className="py-2.5 px-3 w-36 text-right">Selling Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {(viewingInvoiceRecord.items && viewingInvoiceRecord.items.length > 0
                            ? viewingInvoiceRecord.items
                            : [
                                {
                                  id: 'item_default',
                                  item:
                                    viewingInvoiceRecord.description ||
                                    '3000 SERIES 2-IN-1 AIR PURIFIER & HUMIDIFIER PHILIPS AC3737/10',
                                  qty: '1',
                                  rate: String(viewingInvoiceRecord.amount || '1619.00'),
                                  sellingPrice: '0.00',
                                },
                              ]
                          ).map((item: any, idx: number) => (
                            <tr key={item.id || idx}>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                  <NoImageAvailable />
                                  <span className="font-semibold text-slate-800 uppercase">
                                    {item.item || item.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-slate-800">
                                {item.qty || 1}
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-slate-800">
                                {Number(item.rate || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-slate-700">
                                {Number(item.sellingPrice || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bottom Action Buttons (Edit & Delete) */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditInvoice(viewingInvoiceRecord)}
                        className="px-4 py-1.5 bg-[#337AB7] hover:bg-[#286090] text-white rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInvoice(viewingInvoiceRecord.id)}
                        className="px-4 py-1.5 bg-[#D9534F] hover:bg-[#c9302c] text-white rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: PURCHASE ORDER */}
                {invoiceViewActiveSubTab === 'po' && (() => {
                  const linkedPo = purchaseOrders.find(
                    (p) =>
                      (p.poNumber &&
                        viewingInvoiceRecord.poNumber &&
                        p.poNumber.trim().toLowerCase() === viewingInvoiceRecord.poNumber.trim().toLowerCase()) ||
                      (p.id &&
                        viewingInvoiceRecord.poNumber &&
                        p.id.trim().toLowerCase() === viewingInvoiceRecord.poNumber.trim().toLowerCase())
                  ) || {
                    id: viewingInvoiceRecord.poNumber || 'CTPO#2544',
                    poNumber: viewingInvoiceRecord.poNumber || 'CTPO#2544',
                    slNo: 1,
                    owner: viewingInvoiceRecord.owner || 'RASHID',
                    ownerAvatar: viewingInvoiceRecord.ownerAvatar || '',
                    date: viewingInvoiceRecord.date || '08-10-2026',
                    createdAtFormatted: `FRI ${viewingInvoiceRecord.date || '08-10-2026'} 4:52:34 PM`,
                    supplier: viewingInvoiceRecord.supplier || 'SUPER GENERAL COMPANY LLC',
                    order: viewingInvoiceRecord.order || '',
                    reference: viewingInvoiceRecord.reference || '',
                    description: viewingInvoiceRecord.description || '',
                    expectedDeliveryDate: viewingInvoiceRecord.expectedDeliveryDate || '',
                    preparedBy: viewingInvoiceRecord.preparedBy || viewingInvoiceRecord.owner || 'MUSTHAFA CHIRAMMAL',
                    preparedByDesignation: 'Inventory Management (IM)',
                    preparedByMobile: '+9715688783056',
                    preparedByEmail: 'im@cooltechuae.com',
                    attention: viewingInvoiceRecord.attention || 'Mr. Jayesh',
                    termsConditionText:
                      'All product supply should be from the latest stock. Material supplied should comply 100% with the requested specifications. Products with any manufacturing defects or issues should be exchanged with new one with all cost including fright to End User. Cool Technologies is requesting you to acknowledge the receipt of this LPO and confirmation of delivery time, via return email.',
                    vatType: 'with_vat',
                    amount: viewingInvoiceRecord.amount || 4000.0,
                    vat: viewingInvoiceRecord.vatAmount || 200.0,
                    discount: viewingInvoiceRecord.discount || 0,
                    adjustment: viewingInvoiceRecord.adjustment || 0,
                    totalAmount: viewingInvoiceRecord.totalAmount || 4200.0,
                    deliveryStatus: viewingInvoiceRecord.deliveryStatus || 'Pending',
                    approval: 'Approved',
                    items:
                      viewingInvoiceRecord.items && viewingInvoiceRecord.items.length > 0
                        ? viewingInvoiceRecord.items
                        : [
                            {
                              id: 'po_item_1',
                              description: 'COOLER',
                              code: 'CLR-01',
                              unit: 'Pcs',
                              brand: 'COOLTECH',
                              qty: 2,
                              amount: 2000.0,
                              total: 4000.0,
                            },
                          ],
                  };

                  return (
                    <div className="bg-white border-x border-b border-slate-300 shadow-xs animate-in fade-in duration-100">
                      {/* Card Section Header */}
                      <div className="px-4 py-2 bg-[#F1F5F9] border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>Purchase Order Details</span>
                      </div>

                      <div className="p-4 sm:p-6 space-y-6 text-xs text-slate-700">
                        {/* Two-Column Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3">
                          {/* Left Column */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Owner</span>
                              <div className="col-span-8 flex items-center gap-2">
                                {linkedPo.ownerAvatar ? (
                                  <img
                                    src={linkedPo.ownerAvatar}
                                    alt={linkedPo.owner}
                                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    {linkedPo.owner ? linkedPo.owner.charAt(0).toUpperCase() : 'R'}
                                  </div>
                                )}
                                <span className="font-bold text-slate-900 uppercase">
                                  {linkedPo.owner || 'MUSTHAFA CHIRAMMAL'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Purchase Order Number</span>
                              <span className="col-span-8 font-bold text-slate-900">{linkedPo.poNumber}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Date</span>
                              <span className="col-span-8 font-medium text-slate-800">{linkedPo.date}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Expected Delivery</span>
                              <span className="col-span-8 text-slate-700">{linkedPo.expectedDeliveryDate || '-'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-start gap-2">
                              <span className="col-span-4 text-slate-500 font-medium pt-0.5">Supplier</span>
                              <div className="col-span-8 space-y-0.5">
                                <div className="font-bold text-[#1E40AF] hover:underline cursor-pointer">
                                  {linkedPo.supplier}
                                </div>
                                {(() => {
                                  const info = getSupplierContactInfo(linkedPo.supplier);
                                  return (
                                    <div className="text-[11px] text-slate-600 space-y-0.5 mt-0.5">
                                      {info.phone && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-pink-600 font-bold">📞</span>
                                          <span className="text-slate-800 font-medium">{info.phone}</span>
                                        </div>
                                      )}
                                      {info.email && (
                                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                                          <span className="text-slate-400">✉</span>
                                          <span className="text-blue-600 hover:underline cursor-pointer">{info.email}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Reference</span>
                              <span className="col-span-8 text-slate-700">{linkedPo.reference || '-'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Description</span>
                              <span className="col-span-8 text-slate-700">{linkedPo.description || '-'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Status</span>
                              <div className="col-span-8 flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#15803D]">
                                  {linkedPo.approval || 'Approved'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPoStatusTargetPo(linkedPo);
                                    if (linkedPo.approval === 'Approved') {
                                      setPoStatusModalSelectedStatus('Approve');
                                    } else if (linkedPo.approval === 'Rejected') {
                                      setPoStatusModalSelectedStatus('Reject');
                                    } else {
                                      setPoStatusModalSelectedStatus('Change to Pending');
                                    }
                                    setPoStatusModalComments('');
                                    setIsChangePoStatusModalOpen(true);
                                  }}
                                  className="px-2 py-0.5 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded text-[10px] font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                  <span>Change Status</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Delivery Status</span>
                              <div className="col-span-8">
                                <button
                                  type="button"
                                  onClick={() => handleOpenChangeDeliveryStatus(linkedPo)}
                                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getDeliveryStatusBadgeClass(
                                    linkedPo.deliveryStatus
                                  )} inline-flex items-center gap-1 cursor-pointer transition shadow-2xs`}
                                  title="Change Delivery Status"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                  <span>{linkedPo.deliveryStatus || 'Pending'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Opportunity/Order</span>
                              <span className="col-span-8 text-slate-700">{linkedPo.order || linkedPo.opportunityOrder || '-'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Project Number</span>
                              <span className="col-span-8 text-slate-700">{linkedPo.projectNumber || '-'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Project Name</span>
                              <span className="col-span-8 text-slate-700">{linkedPo.projectName || '-'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-start gap-2">
                              <span className="col-span-4 text-slate-500 font-medium pt-0.5">Prepared By</span>
                              <div className="col-span-8 space-y-0.5">
                                <div className="font-bold text-slate-900 uppercase">
                                  {linkedPo.preparedBy || linkedPo.owner || 'MUSTHAFA CHIRAMMAL'}
                                </div>
                                <div className="text-[11px] font-semibold text-slate-700">
                                  {linkedPo.preparedByDesignation || 'Inventory Management (IM)'}
                                </div>
                                <div className="text-[11px] text-[#DB2777] font-semibold flex items-center gap-1">
                                  <span>📞</span>
                                  <span>{linkedPo.preparedByMobile || '+9715688783056'}</span>
                                </div>
                                <div className="text-[11px] text-slate-800 font-semibold flex items-center gap-1">
                                  <span>✉</span>
                                  <span>{linkedPo.preparedByEmail || 'im@cooltechuae.com'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Attention</span>
                              <span className="col-span-8 font-semibold text-slate-800">{linkedPo.attention || 'Mr. Jayesh'}</span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Amount</span>
                              <span className="col-span-8 font-bold text-slate-900 font-mono">
                                {Number(linkedPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Sub Total</span>
                              <span className="col-span-8 font-bold text-slate-900 font-mono">
                                {Number(linkedPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">VAT (5%)</span>
                              <span className="col-span-8 font-bold text-slate-900 font-mono">
                                {Number(linkedPo.vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <span className="col-span-4 text-slate-500 font-medium">Total Amount</span>
                              <span className="col-span-8 font-bold text-slate-900 font-mono text-sm">
                                {Number(linkedPo.totalAmount || linkedPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="border border-slate-200 rounded-sm overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 w-20 text-center">QTY</th>
                                <th className="p-3 w-32 text-right">Amount</th>
                                <th className="p-3 w-32 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {linkedPo.items.map((item: any, idx: number) => (
                                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                                  <td className="p-3">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3">
                                        <NoImageAvailable />
                                        <span className="font-bold text-slate-900 uppercase text-xs">
                                          {item.description || item.name || item.item}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-600 space-y-0.5 text-left shrink-0 pr-8">
                                        <div>
                                          <span className="italic text-slate-500">Code:</span>{' '}
                                          <span className="font-medium text-slate-800 not-italic">{item.code || 'AC3737/10'}</span>
                                        </div>
                                        <div>
                                          <span className="italic text-slate-500">Unit:</span>{' '}
                                          <span className="font-medium text-slate-800 not-italic">{item.unit || 'Pcs'}</span>
                                        </div>
                                        <div>
                                          <span className="italic text-slate-500">Brand:</span>{' '}
                                          <span className="font-medium text-slate-800 not-italic">{item.brand || 'PHILIPS'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-medium text-slate-800">{item.qty || 1}</td>
                                  <td className="p-3 text-right font-medium text-slate-800 font-mono">
                                    {Number(item.amount || item.rate || 0).toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-900 font-mono">
                                    {Number(item.total || Number(item.amount || item.rate || 0) * Number(item.qty || 1)).toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Terms & Condition + Totals Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                          {/* Terms & Condition */}
                          <div className="lg:col-span-8 space-y-1.5">
                            <div className="font-bold text-slate-900 text-xs">Terms & Condition:</div>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl whitespace-pre-line">
                              {linkedPo.termsConditionText ||
                                'All product supply should be from the latest stock. Material supplied should comply 100% with the requested specifications. Products with any manufacturing defects or issues should be exchanged with new one with all cost including fright to End User. Cool Technologies is requesting you to acknowledge the receipt of this LPO and confirmation of delivery time, via return email.'}
                            </p>
                          </div>

                          {/* Totals Breakdown */}
                          <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 pt-2 lg:pt-0">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">Amount</span>
                              <span className="font-bold text-slate-900 font-mono">
                                {Number(linkedPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">Sub Total</span>
                              <span className="font-bold text-slate-900 font-mono">
                                {Number(linkedPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">VAT (5%)</span>
                              <span className="font-bold text-slate-900 font-mono">
                                {Number(linkedPo.vat || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700">Adjustment</span>
                              <span className="font-bold text-slate-900 font-mono">
                                {Number(linkedPo.adjustment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                              <span className="font-bold text-slate-900">Total Amount</span>
                              <span className="font-bold text-slate-900 font-mono text-sm">
                                {Number(linkedPo.totalAmount || linkedPo.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Print Buttons directly below Totals on the Right */}
                            <div className="pt-4 flex items-center justify-end gap-1.5">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPoPrintFormatOpen(!isPoPrintFormatOpen);
                                  }}
                                  className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition select-none"
                                >
                                  <Printer className="w-3.5 h-3.5 text-white" />
                                  <span>Print Format</span>
                                  <ChevronDown className={cn('w-3 h-3 text-white ml-0.5 transition-transform', isPoPrintFormatOpen ? 'rotate-180' : '')} />
                                </button>

                                {isPoPrintFormatOpen && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute left-0 top-full mt-1 z-50 w-64 bg-white border border-slate-200 rounded shadow-xl py-1 text-left text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-75"
                                  >
                                    {[
                                      'Print with Quantity',
                                      'Print without Quantity',
                                      'Print without Item Price',
                                      'Print without Quantity & Item Price',
                                      'Print without Total Price',
                                      'Print without Unit Price & Total Price',
                                      'Print without Unit Price & with Total Price',
                                    ].map((formatOption) => (
                                      <button
                                        key={formatOption}
                                        type="button"
                                        onClick={() => {
                                          setIsPoPrintFormatOpen(false);
                                          window.open(
                                            `/purchase/print?id=${linkedPo.id}&format=${encodeURIComponent(formatOption)}`,
                                            '_blank'
                                          );
                                        }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 text-slate-800 text-xs font-normal transition-colors cursor-pointer text-left"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0 inline-block"></span>
                                        <span>{formatOption}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    localStorage.setItem('crm_active_print_po', JSON.stringify(linkedPo));
                                  } catch (e) {
                                    console.error(e);
                                  }
                                  window.open(
                                    `/purchase/print?id=${linkedPo.id}&currency=USD&format=Print with Quantity`,
                                    '_blank'
                                  );
                                }}
                                className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                              >
                                <Printer className="w-3.5 h-3.5 text-white" />
                                <span>Print in USD</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    localStorage.setItem('crm_active_print_po', JSON.stringify(linkedPo));
                                  } catch (e) {
                                    console.error(e);
                                  }
                                  window.open(
                                    `/purchase/print?id=${linkedPo.id}&format=Print with Quantity`,
                                    '_blank'
                                  );
                                }}
                                className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                              >
                                <Printer className="w-3.5 h-3.5 text-white" />
                                <span>Print</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Footer Back Button row on the far right */}
                        <div className="pt-4 border-t border-slate-200 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setInvoiceViewActiveSubTab('invoice')}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xs text-xs font-semibold shadow-xs cursor-pointer transition"
                          >
                            <span>⬅ Back</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Sub-Tab 3: PAYMENT */}
                {invoiceViewActiveSubTab === 'payment' && (
                  <div className="p-6 bg-white space-y-6 animate-in fade-in duration-100">
                    <div className="border border-slate-200 rounded p-4 bg-[#F8FAFC] space-y-3">
                      <div className="font-bold text-slate-800 text-xs">Payment Information</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Total Invoice Amount:</span>
                          <span className="font-bold text-slate-900">
                            {(viewingInvoiceRecord.totalAmount || viewingInvoiceRecord.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total Paid:</span>
                          <span className="font-bold text-emerald-600">
                            {(viewingInvoiceRecord.paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Balance Due:</span>
                          <span className="font-bold text-[#DC2626]">
                            {(viewingInvoiceRecord.balance || viewingInvoiceRecord.totalAmount || viewingInvoiceRecord.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                      No payments recorded yet for this invoice.
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setInvoiceViewActiveSubTab('invoice')}
                        className="px-4 py-1.5 bg-[#337AB7] hover:bg-[#286090] text-white rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Back to Invoice</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 4: DO */}
                {invoiceViewActiveSubTab === 'do' && (
                  <div className="p-6 bg-white space-y-6 animate-in fade-in duration-100">
                    <div className="border border-slate-200 rounded p-4 bg-[#F8FAFC] space-y-3">
                      <div className="font-bold text-slate-800 text-xs">Delivery Order / Stock In Information</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Delivery Status:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E28A36] text-white inline-flex items-center gap-1 shadow-2xs">
                            <Edit2 className="w-2.5 h-2.5" />
                            {viewingInvoiceRecord.deliveryStatus || 'Pending'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Linked PO:</span>
                          <span className="font-bold text-blue-600">{viewingInvoiceRecord.poNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setInvoiceViewActiveSubTab('invoice')}
                        className="px-4 py-1.5 bg-[#337AB7] hover:bg-[#286090] text-white rounded-xs text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Back to Invoice</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
                      onClick={() => {
                        setEditingInvoiceId(null);
                        setInvoicePoNumber('');
                        setInvoiceNumberInput('');
                        setInvoiceSupplier('Select');
                        setInvoiceAmount('');
                        setInvoiceDiscount('');
                        setInvoiceVatAmount('0.00');
                        setInvoiceAdjustment('');
                        setInvoiceTotalAmount('0.00');
                        setInvoicePaymentDue('');
                        setInvoiceDescription('');
                        setInvoiceItems([]);
                        setInvoiceViewMode('add');
                      }}
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
                              <span
                                onClick={() => handleViewInvoice(inv)}
                                className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer"
                              >
                                {inv.invoiceNumber}
                              </span>
                              <span
                                onClick={() => handleViewInvoice(inv)}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 hover:underline cursor-pointer"
                              >
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

                        <div className="flex items-center justify-between pt-1 relative">
                          <div className="flex items-center gap-1.5">
                            <img src={inv.ownerAvatar} alt={inv.owner} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                            <span className="text-[11px] text-slate-600 font-medium">{inv.owner}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenChangeDeliveryStatus(inv)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getDeliveryStatusBadgeClass(
                                inv.deliveryStatus
                              )} inline-flex items-center gap-1 shadow-2xs cursor-pointer transition`}
                              title="Click to change delivery status"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{inv.deliveryStatus || 'Pending'}</span>
                            </button>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveInvoiceActionDropdownId(activeInvoiceActionDropdownId === inv.id ? null : inv.id);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-[#0e7490] hover:bg-[#0c667f] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition"
                                title="Actions"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-2.5 h-2.5 text-white" />
                              </button>
                              {activeInvoiceActionDropdownId === inv.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded shadow-xl py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-75"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInvoiceInNewTab(inv)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>Open in new tab</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleViewInvoice(inv)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditInvoice(inv)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInvoice(inv.id)}
                                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-red-50 text-red-600 font-normal transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table Content (Desktop Viewports) */}
                  <div className="hidden md:block overflow-x-auto min-h-[300px] pb-28">
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
                              <span
                                onClick={() => handleViewInvoice(inv)}
                                className="text-[#2563EB] hover:underline cursor-pointer font-medium"
                              >
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="p-2.5 border-r border-slate-100">
                              <span
                                onClick={() => handleViewInvoice(inv)}
                                className="text-[#2563EB] hover:underline cursor-pointer font-medium"
                              >
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
                              <button
                                type="button"
                                onClick={() => handleOpenChangePaymentStatus(inv)}
                                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${getPaymentStatusBadgeClass(
                                  inv.status
                                )} whitespace-nowrap shadow-2xs cursor-pointer transition`}
                                title="Click to change payment status"
                              >
                                {inv.status || 'Due'}
                              </button>
                            </td>
                            <td className="p-2.5 text-center border-r border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleOpenChangeDeliveryStatus(inv)}
                                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${getDeliveryStatusBadgeClass(
                                  inv.deliveryStatus
                                )} inline-flex items-center gap-1 whitespace-nowrap shadow-2xs cursor-pointer transition`}
                                title="Click to change delivery status"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>{inv.deliveryStatus || 'Pending'}</span>
                              </button>
                            </td>
                            <td className="p-2.5 text-center relative">
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveInvoiceActionDropdownId(activeInvoiceActionDropdownId === inv.id ? null : inv.id);
                                  }}
                                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#0e7490] hover:bg-[#0c667f] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                  title="Actions"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  <ChevronDown className="w-2.5 h-2.5 text-white" />
                                </button>
                                {activeInvoiceActionDropdownId === inv.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded shadow-xl py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-75"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInvoiceInNewTab(inv)}
                                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                    >
                                      <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                      <span>Open in new tab</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleViewInvoice(inv)}
                                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                    >
                                      <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                      <span>View</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEditInvoice(inv)}
                                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4 text-slate-700 shrink-0" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteInvoice(inv.id)}
                                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-red-50 text-red-600 font-normal transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
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

            {/* Modal for + New Owner */}
            {isAddInvoiceOwnerModalOpen && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-sm shadow-xl w-full max-w-sm overflow-hidden text-xs animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-2.5 bg-[#0B1E2E] text-white flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>Add New Owner</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddInvoiceOwnerModalOpen(false);
                        setNewInvoiceOwnerName('');
                      }}
                      className="text-slate-300 hover:text-white cursor-pointer font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium block">
                        Owner Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Enter owner name"
                        value={newInvoiceOwnerName}
                        onChange={(e) => setNewInvoiceOwnerName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewInvoiceOwner();
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddInvoiceOwnerModalOpen(false);
                        setNewInvoiceOwnerName('');
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewInvoiceOwner}
                      className="px-4 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Add Owner
                    </button>
                  </div>
                </div>
              </div>
            )}
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
        {/* ========================================================= */}
        {/* STOCK IN TAB VIEW (Exact Cezcon CRM Add Stock In Layout)  */}
        {/* ========================================================= */}
        {mainTab === 'stock-in' && (
          <>
            {stockInViewMode === 'add' ? (
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                {/* Header bar */}
                <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <span className="text-slate-400 text-xs">➔</span>
                    <span>{editingStockInId ? 'Edit Stock In' : 'Add Stock In'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetStockInForm();
                      setStockInViewMode('register');
                    }}
                    className="w-5 h-5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xs flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer transition"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* 2-Column Grid of Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5">
                    {/* Left Column */}
                    <div className="space-y-3.5">
                      {/* Stock In Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Stock In Date
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={stockInDate}
                            onChange={(e) => setStockInDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">
                            📅
                          </span>
                        </div>
                      </div>

                      {/* Stock In Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Stock In Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={stockInNumber}
                            onChange={(e) => setStockInNumber(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setStockInNumber(`STK-${Math.floor(900 + Math.random() * 100)}`)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-700 cursor-pointer"
                            title="Regenerate Stock In Number"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Store */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Store <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <select
                            value={stockInStore}
                            onChange={(e) => setStockInStore(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Select">Select</option>
                            <option value="Main Warehouse - Bay A">Main Warehouse - Bay A</option>
                            <option value="Mussafah Store">Mussafah Store</option>
                            <option value="Abu Dhabi Central Depot">Abu Dhabi Central Depot</option>
                            <option value="Dubai Jebel Ali Hub">Dubai Jebel Ali Hub</option>
                            <option value="Hardware Depot - Austin">Hardware Depot - Austin</option>
                          </select>
                        </div>
                      </div>

                      {/* Delivery Note */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Delivery Note
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Delivery note number"
                            value={stockInDeliveryNote}
                            onChange={(e) => setStockInDeliveryNote(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* DO File */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          DO File
                        </label>
                        <div className="flex-1 flex items-center gap-2">
                          <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] text-slate-700 cursor-pointer transition select-none">
                            Choose file
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setStockInDoFileName(e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                          <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {stockInDoFileName || 'No file chosen'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3.5">
                      {/* Supplier */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Supplier <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 flex items-center gap-1.5">
                          <select
                            value={stockInSupplier}
                            onChange={(e) => setStockInSupplier(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Select">Select</option>
                            {stockInSupplierList.map((sup) => (
                              <option key={sup} value={sup}>
                                {sup}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setIsStockInNewSupplierOpen(true)}
                            className="px-2.5 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs"
                          >
                            <span>+ New</span>
                          </button>
                        </div>
                      </div>

                      {/* Order */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Order
                        </label>
                        <div className="flex-1">
                          <select
                            value={stockInOrder}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStockInOrder(val);
                              if (val !== 'Select Order') {
                                setStockInLpoNumber(val.split(' - ')[0] || val);
                              }
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Select Order">Select Order</option>
                            <option value="CTPO#2543 - LUTFI TRADING LLC">CTPO#2543 - LUTFI TRADING LLC</option>
                            <option value="CTPO#2544 - SUPER GENERAL COMPANY LLC">CTPO#2544 - SUPER GENERAL COMPANY LLC</option>
                            <option value="CT-ORD-2026-001 - Project Alpha">CT-ORD-2026-001 - Project Alpha</option>
                            <option value="CT-ORD-2026-002 - Marina Towers">CT-ORD-2026-002 - Marina Towers</option>
                          </select>
                        </div>
                      </div>

                      {/* LPO/PO Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          LPO/PO Number
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="LPO number"
                            value={stockInLpoNumber}
                            onChange={(e) => setStockInLpoNumber(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Purchase Invoice Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-slate-700 font-medium text-xs shrink-0">
                          Purchase Invoice Number
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Purchase invoice number"
                            value={stockInPurchaseInvoiceNumber}
                            onChange={(e) => setStockInPurchaseInvoiceNumber(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="space-y-2 pt-2">
                    {/* Headers */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-slate-700 px-1">
                      <div className="col-span-4">Item</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-2 text-left">Purchase Rate</div>
                      <div className="col-span-2 text-left">Selling Price</div>
                      <div className="col-span-2 text-left">Stock In Quantity</div>
                    </div>

                    {/* Rows */}
                    {stockInItems.map((itemRow, idx) => (
                      <div key={itemRow.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        {/* Item */}
                        <div className="sm:col-span-4">
                          <select
                            value={itemRow.item}
                            onChange={(e) => {
                              const val = e.target.value;
                              const foundProd = availableStockInProducts.find((p) => p.name === val);
                              const updated = [...stockInItems];
                              updated[idx].item = val;
                              if (foundProd) {
                                updated[idx].unit = foundProd.unit;
                                updated[idx].purchaseRate = foundProd.purchaseRate;
                                updated[idx].sellingPrice = foundProd.sellingPrice;
                                if (!updated[idx].qty) updated[idx].qty = '1';
                              }
                              setStockInItems(updated);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select Item</option>
                            {availableStockInProducts.map((p) => (
                              <option key={p.name} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Unit */}
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={itemRow.unit}
                            onChange={(e) => {
                              const updated = [...stockInItems];
                              updated[idx].unit = e.target.value;
                              setStockInItems(updated);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-700 focus:outline-none"
                          />
                        </div>

                        {/* Purchase Rate */}
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={itemRow.purchaseRate}
                            onChange={(e) => {
                              const updated = [...stockInItems];
                              updated[idx].purchaseRate = e.target.value;
                              setStockInItems(updated);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Selling Price */}
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={itemRow.sellingPrice}
                            onChange={(e) => {
                              const updated = [...stockInItems];
                              updated[idx].sellingPrice = e.target.value;
                              setStockInItems(updated);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Stock In Quantity + Lock */}
                        <div className="sm:col-span-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={itemRow.qty}
                            onChange={(e) => {
                              const updated = [...stockInItems];
                              updated[idx].qty = e.target.value;
                              setStockInItems(updated);
                            }}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-slate-400 select-none text-xs">🔒</span>
                          {stockInItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setStockInItems(stockInItems.filter((_, i) => i !== idx));
                              }}
                              className="text-red-500 hover:text-red-700 text-xs px-1 cursor-pointer"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* + Add More button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStockInItems([
                            ...stockInItems,
                            {
                              id: `si_item_${Date.now()}`,
                              item: '',
                              unit: '',
                              purchaseRate: '',
                              sellingPrice: '',
                              qty: '',
                            },
                          ]);
                        }}
                        className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <span>+ Add More</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Submit & Back Row */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        const isEditing = Boolean(editingStockInId);
                        if (isEditing) {
                          const updated = stockInList.map((item) => {
                            const itemId = item.id || item.stockInNo;
                            if (itemId === editingStockInId) {
                              return {
                                ...item,
                                stockInNo: stockInNumber,
                                date: stockInDate,
                                supplier: stockInSupplier !== 'Select' ? stockInSupplier : item.supplier || 'SUPER GENERAL COMPANY LLC',
                                source: stockInSupplier !== 'Select' ? stockInSupplier : item.source || 'SUPER GENERAL COMPANY LLC',
                                warehouse: stockInStore !== 'Select' ? stockInStore : item.warehouse || 'Main Warehouse - Bay A',
                                store: stockInStore !== 'Select' ? stockInStore : item.store || 'Main Warehouse - Bay A',
                                deliveryNote: stockInDeliveryNote,
                                order: stockInOrder,
                                lpoNumber: stockInLpoNumber,
                                purchaseInvoiceNumber: stockInPurchaseInvoiceNumber,
                                totalItems: stockInItems.reduce((acc, curr) => acc + (Number(curr.qty) || 1), 0),
                                items: stockInItems,
                              };
                            }
                            return item;
                          });
                          setStockInList(updated);
                          try {
                            localStorage.setItem('crm_stock_in_list', JSON.stringify(updated));
                          } catch (e) {
                            console.error(e);
                          }
                          alert(`Stock In ${stockInNumber} updated successfully!`);
                          resetStockInForm();
                          setStockInViewMode('register');
                        } else {
                          const newRecord = {
                            id: `si_${Date.now()}`,
                            slNo: stockInList.length + 1,
                            stockInNo: stockInNumber,
                            date: stockInDate,
                            supplier: stockInSupplier !== 'Select' ? stockInSupplier : 'SUPER GENERAL COMPANY LLC',
                            source: stockInSupplier !== 'Select' ? stockInSupplier : 'SUPER GENERAL COMPANY LLC',
                            warehouse: stockInStore !== 'Select' ? stockInStore : 'Main Warehouse - Bay A',
                            store: stockInStore !== 'Select' ? stockInStore : 'Main Warehouse - Bay A',
                            totalItems: stockInItems.reduce((acc, curr) => acc + (Number(curr.qty) || 1), 0),
                            status: 'Approved',
                            deliveryNote: stockInDeliveryNote,
                            order: stockInOrder,
                            lpoNumber: stockInLpoNumber,
                            purchaseInvoiceNumber: stockInPurchaseInvoiceNumber,
                            items: stockInItems,
                          };
                          const updated = [newRecord, ...stockInList];
                          setStockInList(updated);
                          try {
                            localStorage.setItem('crm_stock_in_list', JSON.stringify(updated));
                          } catch (e) {
                            console.error(e);
                          }
                          alert(`Stock In ${stockInNumber} created successfully!`);
                          resetStockInForm();
                          setStockInViewMode('register');
                        }
                      }}
                      className="px-5 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      {editingStockInId ? 'Update' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetStockInForm();
                        setStockInViewMode('register');
                      }}
                      className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                    >
                      <span>➔ Back</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : stockInViewMode === 'view' && viewingStockInRecord ? (
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                {/* Header bar */}
                <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    <SquarePen className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      STOCK IN CREATED BY {viewingStockInRecord.createdBy || 'MOHAMMED ISHAQ'} ON{' '}
                      {viewingStockInRecord.createdFormatted || 'SAT 03-10-2026 3:33:03 PM'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStockInViewMode('register')}
                    className="w-5 h-5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xs flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer transition"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Body */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Two Columns: Left Details, Right Files */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Details Table / Grid */}
                    <div className="space-y-2 text-xs text-slate-800">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">Stock In Date</span>
                        <span className="col-span-2 font-normal text-slate-800">
                          {viewingStockInRecord.date || '03-10-2026'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">Supplier</span>
                        <span className="col-span-2 font-medium text-[#2563EB] hover:underline cursor-pointer">
                          {viewingStockInRecord.supplier || 'Shajarath Al Thalj For Freezer Manufacturing LLC'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">Stock In Number</span>
                        <span className="col-span-2 font-normal text-slate-800">
                          {viewingStockInRecord.stockInNo || 'STK 923'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">Purchase Invoice Number</span>
                        <span className="col-span-2 font-normal text-slate-800">
                          {viewingStockInRecord.purchaseInvoiceNumber || ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">Delivery Note</span>
                        <span className="col-span-2 font-normal text-slate-800">
                          {viewingStockInRecord.deliveryNote || ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">LPO/PO Number</span>
                        <span className="col-span-2 font-medium text-[#2563EB] hover:underline cursor-pointer">
                          {viewingStockInRecord.lpoNumber || 'CTPO#2528'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-600 font-medium">Store</span>
                        <span className="col-span-2 font-normal text-slate-800">
                          {viewingStockInRecord.store || 'M-42 OFFICE'}
                        </span>
                      </div>
                    </div>

                    {/* Right Files Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-semibold text-slate-700 text-xs">Files</span>
                        <button
                          type="button"
                          onClick={() => alert('Add File modal / upload')}
                          className="px-2.5 py-0.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer transition uppercase"
                        >
                          + Add
                        </button>
                      </div>
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                            <th className="p-2 border-r border-slate-200 w-12 text-center">Sl.No</th>
                            <th className="p-2 border-r border-slate-200">Date</th>
                            <th className="p-2 border-r border-slate-200">Title</th>
                            <th className="p-2">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                              No Files
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border border-slate-200 rounded-xs overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                          <th className="p-2.5 w-14 text-center border-r border-slate-200">Sl. No.</th>
                          <th className="p-2.5 border-r border-slate-200">Code</th>
                          <th className="p-2.5 border-r border-slate-200">Item</th>
                          <th className="p-2.5 border-r border-slate-200">Unit</th>
                          <th className="p-2.5 border-r border-slate-200">Brand</th>
                          <th className="p-2.5 text-right border-r border-slate-200">Stockin Purchase Rate</th>
                          <th className="p-2.5 text-right border-r border-slate-200">Stockin Selling Price</th>
                          <th className="p-2.5 text-center border-r border-slate-200">Stock In Qty</th>
                          <th className="p-2.5 text-center">Current Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(viewingStockInRecord.items && viewingStockInRecord.items.length > 0
                          ? viewingStockInRecord.items
                          : [
                              {
                                slNo: 1,
                                code: 'CT25F2-01',
                                item: '25 usg water cooler cooltech',
                                unit: 'Pcs',
                                brand: 'COOLTECH',
                                purchaseRate: '625.00',
                                sellingPrice: '0.00',
                                qty: '5',
                                currentStock: '5',
                              },
                            ]
                        ).map((it: any, i: number) => (
                          <tr key={it.id || i} className="hover:bg-slate-50">
                            <td className="p-2.5 text-center text-slate-600 border-r border-slate-100 font-medium">
                              {it.slNo || i + 1}
                            </td>
                            <td className="p-2.5 border-r border-slate-100 text-slate-800 font-medium">
                              {it.code || '-'}
                            </td>
                            <td className="p-2.5 border-r border-slate-100 text-slate-800">
                              {it.item || '-'}
                            </td>
                            <td className="p-2.5 border-r border-slate-100 text-slate-700">
                              {it.unit || 'Pcs'}
                            </td>
                            <td className="p-2.5 border-r border-slate-100 text-slate-700">
                              {it.brand || 'COOLTECH'}
                            </td>
                            <td className="p-2.5 text-right border-r border-slate-100 text-slate-800 font-mono">
                              {Number(it.purchaseRate || 0).toFixed(2)}
                            </td>
                            <td className="p-2.5 text-right border-r border-slate-100 text-slate-800 font-mono">
                              {Number(it.sellingPrice || 0).toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center border-r border-slate-100 font-semibold text-slate-900">
                              {it.qty || 1}
                            </td>
                            <td className="p-2.5 text-center font-semibold text-slate-900">
                              {it.currentStock || it.qty || 1}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStockInNumber(viewingStockInRecord.stockInNo || 'STK-924');
                        setStockInSupplier(viewingStockInRecord.supplier || 'Select');
                        setStockInDate(viewingStockInRecord.date || getLiveTodayDateString());
                        setStockInLpoNumber(viewingStockInRecord.lpoNumber || '');
                        setStockInPurchaseInvoiceNumber(viewingStockInRecord.purchaseInvoiceNumber || '');
                        setStockInDeliveryNote(viewingStockInRecord.deliveryNote || '');
                        if (viewingStockInRecord.items && viewingStockInRecord.items.length > 0) {
                          setStockInItems(
                            viewingStockInRecord.items.map((it: any, idx: number) => ({
                              id: `si_item_${idx + 1}`,
                              item: it.item || '',
                              unit: it.unit || 'Pcs',
                              purchaseRate: it.purchaseRate || '',
                              sellingPrice: it.sellingPrice || '',
                              qty: it.qty || '1',
                            }))
                          );
                        }
                        setStockInViewMode('add');
                      }}
                      className="px-3.5 py-1.5 bg-[#337AB7] hover:bg-[#286090] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <SquarePen className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${viewingStockInRecord.stockInNo}?`)) {
                          setStockInList((prev) =>
                            prev.filter((item) => item.stockInNo !== viewingStockInRecord.stockInNo)
                          );
                          setStockInViewMode('register');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#D9534F] hover:bg-[#C9302C] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockInViewMode('register')}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top Supplier Filter Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs p-4 text-xs">
                  <div className="space-y-1 max-w-xs">
                    <label className="text-slate-700 font-semibold text-xs block">Supplier</label>
                    <select
                      value={stockInSupplierFilter}
                      onChange={(e) => {
                        setStockInSupplierFilter(e.target.value);
                        setStockInCurrentPage(1);
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All</option>
                      {stockInSupplierList.map((sup) => (
                        <option key={sup} value={sup}>
                          {sup}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Stock In Table Card */}
                <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                  {/* Card Header */}
                  <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className="text-slate-400 text-xs">➔</span>
                      <span>Stock In</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetStockInForm();
                        setStockInViewMode('add');
                      }}
                      className="px-3 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer uppercase tracking-wider"
                    >
                      <span>+ STOCK IN</span>
                    </button>
                  </div>

                  {/* Toolbar */}
                  <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span>Shows</span>
                      <select
                        value={stockInRowsPerPage}
                        onChange={(e) => {
                          setStockInRowsPerPage(Number(e.target.value));
                          setStockInCurrentPage(1);
                        }}
                        className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
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
                        value={stockInSearch}
                        onChange={(e) => {
                          setStockInSearch(e.target.value);
                          setStockInCurrentPage(1);
                        }}
                        className="w-full px-3 py-1.5 pr-8 border border-slate-300 rounded text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Table Content */}
                  <div
                    className="overflow-x-auto min-h-[360px] pb-28"
                    onClick={() => {
                      if (activeStockInDropdownId) setActiveStockInDropdownId(null);
                    }}
                  >
                    <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold text-[11px]">
                          <th className="p-2.5 w-14 text-center border-r border-slate-200">SL.No</th>
                          <th className="p-2.5 border-r border-slate-200">Stock In Number</th>
                          <th className="p-2.5 border-r border-slate-200">Stock In Date</th>
                          <th className="p-2.5 border-r border-slate-200">Supplier</th>
                          <th className="p-2.5 border-r border-slate-200">Purchase Invoice Number</th>
                          <th className="p-2.5 border-r border-slate-200">Delivery Note</th>
                          <th className="p-2.5 border-r border-slate-200">LPO Number</th>
                          <th className="p-2.5 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {stockInList
                          .filter((si) => {
                            if (stockInSupplierFilter !== 'All' && si.supplier !== stockInSupplierFilter) {
                              return false;
                            }
                            if (stockInSearch.trim()) {
                              const q = stockInSearch.toLowerCase();
                              return (
                                si.stockInNo?.toLowerCase().includes(q) ||
                                si.supplier?.toLowerCase().includes(q) ||
                                si.lpoNumber?.toLowerCase().includes(q) ||
                                si.date?.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .slice(
                            (stockInCurrentPage - 1) * stockInRowsPerPage,
                            stockInCurrentPage * stockInRowsPerPage
                          )
                          .map((si, idx) => (
                            <tr key={si.id || idx} className="hover:bg-blue-50/40 transition-colors">
                              <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100">
                                {si.slNo || idx + 1}
                              </td>
                              <td
                                onClick={() => {
                                  setViewingStockInRecord(si);
                                  setStockInViewMode('view');
                                }}
                                className="p-2.5 border-r border-slate-100 font-medium text-[#2563EB] hover:underline cursor-pointer"
                              >
                                {si.stockInNo}
                              </td>
                              <td className="p-2.5 border-r border-slate-100 text-slate-700">
                                {si.date}
                              </td>
                              <td
                                onClick={() => {
                                  setViewingStockInRecord(si);
                                  setStockInViewMode('view');
                                }}
                                className="p-2.5 border-r border-slate-100 font-medium text-[#2563EB] hover:underline cursor-pointer"
                              >
                                {si.supplier}
                              </td>
                              <td className="p-2.5 border-r border-slate-100 text-slate-700">
                                {si.purchaseInvoiceNumber || '-'}
                              </td>
                              <td className="p-2.5 border-r border-slate-100 text-slate-700">
                                {si.deliveryNote || '-'}
                              </td>
                              <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">
                                {si.lpoNumber || '-'}
                              </td>
                              <td className="p-2.5 text-center relative">
                                <div className="relative inline-block text-left">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveStockInDropdownId((prev) =>
                                        prev === (si.stockInNo || String(idx))
                                          ? null
                                          : (si.stockInNo || String(idx))
                                      );
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#00838F] hover:bg-[#00707c] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition"
                                    title="Actions"
                                  >
                                    <Settings className="w-3.5 h-3.5 text-white" />
                                    <ChevronDown className="w-2.5 h-2.5 text-white" />
                                  </button>

                                  {activeStockInDropdownId === (si.stockInNo || String(idx)) && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded-sm shadow-xl py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-75"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveStockInDropdownId(null);
                                          window.open(`/purchase?tab=stock-in&view=${encodeURIComponent(si.stockInNo)}`, '_blank');
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                      >
                                        <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                        <span>Open in new tab</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveStockInDropdownId(null);
                                          setViewingStockInRecord(si);
                                          setStockInViewMode('view');
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                      >
                                        <BookOpen className="w-4 h-4 text-slate-700 shrink-0" />
                                        <span>View</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveStockInDropdownId(null);
                                          setEditingStockInId(si.id || si.stockInNo);
                                          setStockInNumber(si.stockInNo || 'STK-924');
                                          setStockInSupplier(si.supplier || si.source || 'Select');
                                          setStockInStore(si.store || si.warehouse || 'Select');
                                          setStockInDate(si.date || getLiveTodayDateString());
                                          setStockInLpoNumber(si.lpoNumber || '');
                                          setStockInPurchaseInvoiceNumber(si.purchaseInvoiceNumber || '');
                                          setStockInDeliveryNote(si.deliveryNote || '');
                                          setStockInOrder(si.order || 'Select Order');
                                          if (si.items && si.items.length > 0) {
                                            setStockInItems(
                                              si.items.map((it: any, i: number) => ({
                                                id: it.id || `si_item_${i + 1}`,
                                                item: it.item || '',
                                                unit: it.unit || 'Pcs',
                                                purchaseRate: it.purchaseRate || '',
                                                sellingPrice: it.sellingPrice || '',
                                                qty: it.qty ? String(it.qty) : '1',
                                              }))
                                            );
                                          } else {
                                            setStockInItems([
                                              {
                                                id: 'si_item_1',
                                                item: '',
                                                unit: '',
                                                purchaseRate: '',
                                                sellingPrice: '',
                                                qty: '1',
                                              },
                                            ]);
                                          }
                                          setStockInViewMode('add');
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-slate-800 font-normal transition-colors cursor-pointer"
                                      >
                                        <SquarePen className="w-4 h-4 text-slate-700 shrink-0" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveStockInDropdownId(null);
                                          if (confirm(`Are you sure you want to delete ${si.stockInNo}?`)) {
                                            const targetId = si.id || si.stockInNo;
                                            const updated = stockInList.filter((item, i) => {
                                              const itemId = item.id || item.stockInNo;
                                              return itemId ? itemId !== targetId : i !== idx;
                                            });
                                            setStockInList(updated);
                                            try {
                                              localStorage.setItem('crm_stock_in_list', JSON.stringify(updated));
                                            } catch (e) {
                                              console.error(e);
                                            }
                                          }
                                        }}
                                        className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 text-red-600 hover:text-red-700 font-normal transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-3 border-t border-slate-200 text-xs text-slate-600 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      Showing 1 to {Math.min(stockInRowsPerPage, stockInList.length)} of {stockInList.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setStockInCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={stockInCurrentPage === 1}
                        className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="px-3 py-1 bg-[#0B1E2E] text-white rounded text-xs font-bold font-mono">
                        {stockInCurrentPage}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStockInCurrentPage((p) => p + 1)}
                        disabled={stockInCurrentPage * stockInRowsPerPage >= stockInList.length}
                        className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal for + New Supplier */}
            {isStockInNewSupplierOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in"
                onClick={() => setIsStockInNewSupplierOpen(false)}
              >
                <div
                  className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Add New Supplier</h3>
                    <button
                      type="button"
                      onClick={() => setIsStockInNewSupplierOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Supplier Name *</label>
                      <input
                        type="text"
                        value={stockInNewSupplierInput}
                        onChange={(e) => setStockInNewSupplierInput(e.target.value)}
                        placeholder="e.g. DAIKIN AIR CONDITIONING LLC"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsStockInNewSupplierOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (stockInNewSupplierInput.trim()) {
                          const trimmed = stockInNewSupplierInput.trim();
                          setStockInSupplierList((prev) => [...prev, trimmed]);
                          setStockInSupplier(trimmed);
                          setStockInNewSupplierInput('');
                          setIsStockInNewSupplierOpen(false);
                        }
                      }}
                      className="px-4 py-1.5 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Add Supplier
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            {productSubTab === 'products' && (
              <>
                {productViewMode === 'view' && viewingProduct ? (
                  /* ========================================================= */
                  /* PRODUCT DETAILS VIEW (Exact Cezcon CRM Layout - Image 1)  */
                  /* ========================================================= */
                  <div className="bg-white border border-[#CBD5E1] rounded-sm shadow-xs overflow-hidden text-xs animate-in fade-in duration-150">
                    {/* Header bar with check icon and red close button */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                        <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Product or Services</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductViewMode('list');
                          setViewingProduct(null);
                        }}
                        className="w-5 h-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Two-Column Layout */}
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left Column: Product Attributes & Stock Details */}
                      <div className="lg:col-span-3 border border-slate-200 rounded-sm bg-white overflow-hidden text-xs flex flex-col justify-between">
                        <div>
                          <div className="p-4 space-y-3">
                            {/* Top image box and code */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 font-bold tracking-wider block uppercase">CODE</span>
                                <BarcodeView code={viewingProduct.code} />
                              </div>
                              <NoImageAvailable />
                            </div>

                            {/* Attributes */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">NAME</span>
                                <span className="font-semibold text-slate-800 text-xs">{viewingProduct.name}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">UNIT</span>
                                <span className="font-semibold text-slate-800 text-xs">{viewingProduct.unit}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BRAND</span>
                                <span className="font-semibold text-slate-800 text-xs">{viewingProduct.brand}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CATEGORY</span>
                                <span className="font-semibold text-slate-800 text-xs">{viewingProduct.category}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TYPE</span>
                                <span className="font-semibold text-slate-800 text-xs">{viewingProduct.type}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PURCHASE RATE</span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {viewingProduct.purchaseRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SELLING PRICE</span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {viewingProduct.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stock Details Header and List */}
                          <div className="bg-slate-100/80 px-3 py-1.5 font-bold text-slate-700 text-center text-[11px] border-t border-b border-slate-200">
                            STOCK DETAILS
                          </div>
                          <div className="p-3 space-y-2 text-xs text-slate-700 font-medium">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">CT</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">:</span>
                                <span className="font-bold text-slate-800">{viewingProduct.currentStock || viewingProduct.stock || 0}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">M-42 OFFICE</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">:</span>
                                <span className="font-bold text-slate-800">0</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">M-42 SHOP</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">:</span>
                                <span className="font-bold text-slate-800">0</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                              <span className="text-slate-700 uppercase">TOTAL STOCK</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">:</span>
                                <span className="font-bold text-slate-900">{viewingProduct.currentStock || viewingProduct.stock || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(viewingProduct.id);
                              setProductFormData({
                                serialNumber: viewingProduct.serialNo || '',
                                code: viewingProduct.code || '',
                                name: viewingProduct.name || '',
                                thumbnailName: '',
                                unit: viewingProduct.unit || 'Select Unit',
                                category: viewingProduct.category || 'Select Category',
                                purchaseRate: String(viewingProduct.purchaseRate || ''),
                                sellingPrice: String(viewingProduct.sellingPrice || ''),
                                store: viewingProduct.store || 'Select Store',
                                currentStock: String(viewingProduct.currentStock || viewingProduct.stock || ''),
                                minimumStock: String(viewingProduct.minimumStock || ''),
                                type: viewingProduct.type || 'Product',
                                imagesCountText: '',
                                brand: viewingProduct.brand || 'Select Brand',
                                additionalDescription: '',
                                wordCount: 0,
                              });
                              setProductViewMode('add');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xs font-semibold text-xs transition cursor-pointer"
                          >
                            <SquarePen className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${viewingProduct.name}?`)) {
                                const updated = stockItems.filter((i) => i.id !== viewingProduct.id);
                                setStockItems(updated);
                                try {
                                  const existingRaw = localStorage.getItem('cezcon_products_master_live');
                                  const existingList = existingRaw ? JSON.parse(existingRaw) : [];
                                  if (Array.isArray(existingList)) {
                                    const filtered = existingList.filter((x: any) => String(x.id) !== String(viewingProduct.id));
                                    localStorage.setItem('cezcon_products_master_live', JSON.stringify(filtered));
                                    window.dispatchEvent(new Event('crm_products_updated'));
                                  }
                                } catch (err) {
                                  console.error('Failed to delete product', err);
                                }
                                setProductViewMode('list');
                                setViewingProduct(null);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xs font-semibold text-xs transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Sub-Tabs & Movement Report */}
                      <div className="lg:col-span-9 space-y-4">
                        {/* Top Sub Tabs */}
                        <div className="flex items-center border-b border-slate-200">
                          <button
                            type="button"
                            onClick={() => setProductDetailTab('movement')}
                            className={cn(
                              'px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer',
                              productDetailTab === 'movement'
                                ? 'border-[#DC2626] text-slate-800 bg-white font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                          >
                            Stock Movement
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductDetailTab('adjustment')}
                            className={cn(
                              'px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer',
                              productDetailTab === 'adjustment'
                                ? 'border-[#DC2626] text-slate-800 bg-white font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                          >
                            Stock Adjustment
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductDetailTab('images')}
                            className={cn(
                              'px-4 py-2 font-semibold text-xs border-b-2 transition-colors cursor-pointer',
                              productDetailTab === 'images'
                                ? 'border-[#DC2626] text-slate-800 bg-white font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                          >
                            Images
                          </button>
                        </div>

                        {/* Filters Bar */}
                        {productDetailTab !== 'images' && (
                          <div className="p-3 bg-white border border-slate-200 rounded-sm flex flex-wrap items-center gap-2.5">
                            {productDetailTab === 'movement' && (
                              <>
                                <div className="w-44">
                                  <select
                                    value={viewStoreFilter}
                                    onChange={(e) => setViewStoreFilter(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer"
                                  >
                                    <option value="Select Store">Select Store</option>
                                    <option value="CT">CT</option>
                                    <option value="M-42 OFFICE">M-42 OFFICE</option>
                                    <option value="M-42 SHOP">M-42 SHOP</option>
                                  </select>
                                </div>
                                <div className="w-44">
                                  <select
                                    value={viewCustomerFilter}
                                    onChange={(e) => setViewCustomerFilter(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer"
                                  >
                                    <option value="Select Customer">Select Customer</option>
                                    <option value="All Customers">All Customers</option>
                                  </select>
                                </div>
                              </>
                            )}
                            <div className="relative w-56">
                              <input
                                type="text"
                                value={viewDateRange}
                                onChange={(e) => setViewDateRange(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-700 pr-7"
                              />
                              <button
                                type="button"
                                onClick={() => setViewDateRange('')}
                                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded-xs font-semibold text-xs transition cursor-pointer shadow-xs"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Submit</span>
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xs font-semibold text-xs transition cursor-pointer shadow-xs"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                              <span>Excel</span>
                            </button>
                          </div>
                        )}

                        {/* Black Banner / Card Header */}
                        <div className="bg-[#000000] text-white p-4 rounded-sm space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800 pb-2">
                            <h2 className="font-extrabold text-sm tracking-wide uppercase">{viewingProduct.name}</h2>
                            <span className="text-xs text-slate-300 font-mono">
                              Date: <strong className="text-white font-semibold">{getLiveTodayFormatted()}</strong>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400">CODE : </span>
                              <span className="font-bold text-white">{viewingProduct.code}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">UNIT : </span>
                              <span className="font-bold text-white">{viewingProduct.unit}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">BRAND : </span>
                              <span className="font-bold text-white">{viewingProduct.brand}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">CATEGORY : </span>
                              <span className="font-bold text-white">{viewingProduct.category}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">COST : </span>
                              <span className="font-bold text-white">
                                {viewingProduct.purchaseRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">PRICE : </span>
                              <span className="font-bold text-white">
                                {viewingProduct.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stock Adjustment Section */}
                        {productDetailTab === 'adjustment' && (
                          <div className="space-y-3">
                            <div className="text-center font-bold text-slate-800 text-xs underline">
                              Stock Adjustment Of The Period : From {viewDateRange?.split(' - ')[0] || getLiveFirstDayOfMonth()} To {viewDateRange?.split(' - ')[1] || getLiveTodayDateString()}
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-sm">
                              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                                <thead>
                                  <tr className="bg-[#2196F3] text-white font-semibold select-none">
                                    <th className="p-2 border-r border-blue-400/40 w-16 text-center">Sl No.</th>
                                    <th className="p-2 border-r border-blue-400/40 w-28 text-center">Date</th>
                                    <th className="p-2 border-r border-blue-400/40 w-28 text-center">Owner</th>
                                    <th className="p-2 border-r border-blue-400/40 w-28 text-center">Store</th>
                                    <th className="p-2 border-r border-blue-400/40">Description</th>
                                    <th className="p-2 border-r border-blue-400/40">Reason</th>
                                    <th className="p-2 border-r border-blue-400/40 w-24 text-center">Qty. From</th>
                                    <th className="p-2 w-24 text-center">Qty. To</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr>
                                    <td colSpan={8} className="p-3 text-left text-slate-700 text-xs font-normal">
                                      No record found!
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Stock Movement Section */}
                        {productDetailTab === 'movement' && (
                          <div className="space-y-3">
                            <div className="text-center font-bold text-slate-800 text-xs underline">
                              Stock Movement Of The Period : From {viewDateRange?.split(' - ')[0] || getLiveFirstDayOfMonth()} To {viewDateRange?.split(' - ')[1] || getLiveTodayDateString()}
                            </div>

                            <div className="overflow-x-auto border border-slate-200 rounded-sm">
                              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                                <thead>
                                  <tr className="bg-[#00828A] text-white font-semibold select-none">
                                    <th className="p-2 border-r border-teal-600/40 w-16 text-center">Sl No.</th>
                                    <th className="p-2 border-r border-teal-600/40 w-28 text-center">Date</th>
                                    <th className="p-2 border-r border-teal-600/40 w-24">Number</th>
                                    <th className="p-2 border-r border-teal-600/40 w-32">Customer</th>
                                    <th className="p-2 border-r border-teal-600/40">Description</th>
                                    <th className="p-2 border-r border-teal-600/40 w-20 text-center">StockIn</th>
                                    <th className="p-2 border-r border-teal-600/40 w-20 text-center">StockOut</th>
                                    <th className="p-2 w-20 text-right">Stock</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  <tr className="hover:bg-slate-50 transition">
                                    <td className="p-2 text-center text-slate-500 border-r border-slate-100">1</td>
                                    <td className="p-2 text-center text-slate-700 border-r border-slate-100">{getLiveFirstDayOfMonth()}</td>
                                    <td className="p-2 text-slate-400 border-r border-slate-100">-</td>
                                    <td className="p-2 text-slate-400 border-r border-slate-100">-</td>
                                    <td className="p-2 font-medium text-slate-800 border-r border-slate-100">Opening Stock</td>
                                    <td className="p-2 text-center text-slate-400 border-r border-slate-100">-</td>
                                    <td className="p-2 text-center text-slate-400 border-r border-slate-100">-</td>
                                    <td className="p-2 text-right font-bold text-[#DC2626]">
                                      {viewingProduct.currentStock || viewingProduct.stock || 0}
                                    </td>
                                  </tr>
                                  <tr className="bg-slate-50 font-bold">
                                    <td colSpan={5} className="p-2 text-right border-r border-slate-200">
                                      Total
                                    </td>
                                    <td className="p-2 text-center border-r border-slate-200">-</td>
                                    <td className="p-2 text-center border-r border-slate-200">-</td>
                                    <td className="p-2 text-right text-[#DC2626] font-bold">
                                      Closing Stock : {viewingProduct.currentStock || viewingProduct.stock || 0}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Images Tab */}
                        {productDetailTab === 'images' && (
                          <div className="p-8 bg-white border border-slate-200 rounded-sm text-center text-slate-400 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <span>No images uploaded for this item</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : productViewMode === 'add' ? (
                  /* ========================================================= */
                  /* ADD PRODUCT/SERVICE/RAW MATERIAL/ASSET VIEW (Image 1)     */
                  /* ========================================================= */
                  <div className="bg-white border border-[#CBD5E1] rounded-sm shadow-xs overflow-hidden text-xs animate-in fade-in duration-150">
                    {/* Header with red close icon */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>{editingProductId ? 'Edit Product/Service/Raw Material/Asset' : 'Add Product/Service/Raw Material/Asset'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductViewMode('list');
                          setEditingProductId(null);
                        }}
                        className="w-5 h-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Form Fields */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const activeUser = currentUser || (typeof window !== 'undefined' ? authMockService.getCurrentUser() : null);
                        const userRole = (activeUser?.role || '').toLowerCase();
                        const isEmp = userRole === 'employee' || (activeUser?.profileType || '').toLowerCase().includes('employee');
                        const creatorRole = isEmp ? 'employee' : (userRole === 'admin' ? 'admin' : userRole.includes('super') ? 'super_admin' : 'manager');

                        const targetId = editingProductId || String(Date.now());
                        const existingProduct = editingProductId ? stockItems.find((i) => i.id === editingProductId) : null;

                        const savedProduct: CrmCezconStock = {
                          id: String(targetId),
                          slNo: existingProduct?.slNo || stockItems.length + 1,
                          serialNo: productFormData.serialNumber || '',
                          code: productFormData.code || (existingProduct?.code || `CQ4N-XMI${Math.floor(10 + Math.random() * 90)}S`),
                          name: productFormData.name || 'New Product',
                          image: existingProduct?.image || '',
                          unit: productFormData.unit !== 'Select Unit' ? productFormData.unit : (existingProduct?.unit || 'Pcs'),
                          brand: productFormData.brand !== 'Select Brand' ? productFormData.brand : (existingProduct?.brand || 'MIDEA'),
                          category: productFormData.category !== 'Select Category' ? productFormData.category : (existingProduct?.category || 'SPLIT AC'),
                          type: productFormData.type,
                          purchaseRate: Number(productFormData.purchaseRate) || 0,
                          sellingPrice: Number(productFormData.sellingPrice) || 0,
                          status: existingProduct?.status || 'Active',
                          store: productFormData.store !== 'Select Store' ? productFormData.store : (existingProduct?.store || 'Main Warehouse - Bay A'),
                          stock: Number(productFormData.currentStock) || 0,
                          currentStock: Number(productFormData.currentStock) || 0,
                          minimumStock: Number(productFormData.minimumStock) || 0,
                          createdBy: existingProduct?.createdBy || activeUser?.name || (isEmp ? 'Purchase Employee' : 'Rashid Ali'),
                          createdByRole: existingProduct?.createdByRole || creatorRole,
                          createdById: existingProduct?.createdById || (activeUser?.id ? String(activeUser.id) : (isEmp ? 'emp_faisal_001' : 'usr_rashid_001')),
                          createdByEmail: existingProduct?.createdByEmail || activeUser?.email || (isEmp ? 'purchaseemp@gmail.com' : 'purchasemanager@gmail.com'),
                          owner: existingProduct?.owner || activeUser?.name || (isEmp ? 'Purchase Employee' : 'Rashid Ali'),
                        };

                        const updatedItems = editingProductId
                          ? stockItems.map((item) => (item.id === editingProductId ? savedProduct : item))
                          : [savedProduct, ...stockItems];

                        setStockItems(updatedItems);

                        // Persist to unified localStorage master
                        try {
                          const productSettingItem: ProductSettingItem = {
                            id: Number(targetId) || Date.now(),
                            sku: savedProduct.code,
                            code: savedProduct.code,
                            serialNo: savedProduct.serialNo,
                            name: savedProduct.name,
                            category: savedProduct.category,
                            brand: savedProduct.brand,
                            unit: savedProduct.unit,
                            type: savedProduct.type as any,
                            purchaseRate: savedProduct.purchaseRate,
                            sellingPrice: savedProduct.sellingPrice,
                            basePrice: savedProduct.sellingPrice,
                            status: true,
                            store: savedProduct.store,
                            currentStock: savedProduct.currentStock,
                            minStock: savedProduct.minimumStock,
                            additionalDescription: productFormData.additionalDescription,
                            createdBy: savedProduct.createdBy,
                            createdByRole: savedProduct.createdByRole,
                            createdById: savedProduct.createdById,
                            createdByEmail: savedProduct.createdByEmail,
                            owner: savedProduct.owner,
                          };

                          const existingRaw = localStorage.getItem('cezcon_products_master_live');
                          const existingList = existingRaw ? JSON.parse(existingRaw) : [];
                          const filteredList = Array.isArray(existingList) ? existingList.filter((x: any) => String(x.id) !== String(targetId)) : [];
                          const mergedList = [productSettingItem, ...filteredList];
                          localStorage.setItem('cezcon_products_master_live', JSON.stringify(mergedList));
                          window.dispatchEvent(new Event('crm_products_updated'));
                        } catch (err) {
                          console.error('Failed to persist product to localStorage', err);
                        }

                        setEditingProductId(null);
                        setProductViewMode('list');
                        setProductFormData({
                          serialNumber: '',
                          code: '',
                          name: '',
                          thumbnailName: '',
                          unit: 'Select Unit',
                          category: 'Select Category',
                          purchaseRate: '',
                          sellingPrice: '',
                          store: 'Select Store',
                          currentStock: '',
                          minimumStock: '',
                          type: 'Product',
                          imagesCountText: '',
                          brand: 'Select Brand',
                          additionalDescription: '',
                          wordCount: 0,
                        });
                      }}
                      className="p-4 sm:p-6"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3">
                        {/* Left Column */}
                        <div className="space-y-3">
                          {/* Serial Number */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Serial Number</label>
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                placeholder="Serial Number"
                                value={productFormData.serialNumber}
                                onChange={(e) => setProductFormData({ ...productFormData, serialNumber: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Name * */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs flex items-center gap-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                required
                                placeholder="Name"
                                value={productFormData.name}
                                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Thumbnail Image */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Thumbnail Image</label>
                            <div className="sm:col-span-2 flex items-center gap-2">
                              <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs text-slate-700 cursor-pointer font-medium transition">
                                Choose file
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setProductFormData({ ...productFormData, thumbnailName: file ? file.name : 'No file chosen' });
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-xs text-slate-500 truncate">{productFormData.thumbnailName || 'No file chosen'}</span>
                            </div>
                          </div>

                          {/* Unit */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Unit</label>
                            <div className="sm:col-span-2">
                              <select
                                value={productFormData.unit}
                                onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 cursor-pointer"
                              >
                                <option value="Select Unit">Select Unit</option>
                                <option value="Pcs">Pcs</option>
                                <option value="Set">Set</option>
                                <option value="Each">Each</option>
                                <option value="Box">Box</option>
                                <option value="Meter">Meter</option>
                                <option value="Kg">Kg</option>
                              </select>
                            </div>
                          </div>

                          {/* Category */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Category</label>
                            <div className="sm:col-span-2">
                              <select
                                value={productFormData.category}
                                onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 cursor-pointer"
                              >
                                <option value="Select Category">Select Category</option>
                                <option value="CASSETTE AC">CASSETTE AC</option>
                                <option value="SPLIT AC">SPLIT AC</option>
                                <option value="REFRIGERATOR">REFRIGERATOR</option>
                                <option value="ACCESSORIES">ACCESSORIES</option>
                                <option value="SPARE PARTS">SPARE PARTS</option>
                              </select>
                            </div>
                          </div>

                          {/* Purchase Rate */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Purchase Rate</label>
                            <div className="sm:col-span-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Enter Purchase Rate"
                                value={productFormData.purchaseRate}
                                onChange={(e) => setProductFormData({ ...productFormData, purchaseRate: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Selling Price */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Selling Price</label>
                            <div className="sm:col-span-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Enter Selling Price"
                                value={productFormData.sellingPrice}
                                onChange={(e) => setProductFormData({ ...productFormData, sellingPrice: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Store */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Store</label>
                            <div className="sm:col-span-2">
                              <select
                                value={productFormData.store}
                                onChange={(e) => setProductFormData({ ...productFormData, store: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 cursor-pointer"
                              >
                                <option value="Select Store">Select Store</option>
                                <option value="Main Warehouse - Bay A">Main Warehouse - Bay A</option>
                                <option value="Central Spares Hub">Central Spares Hub</option>
                                <option value="Hardware Depot - Austin">Hardware Depot - Austin</option>
                              </select>
                            </div>
                          </div>

                          {/* Current Stock */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Current Stock</label>
                            <div className="sm:col-span-2">
                              <input
                                type="number"
                                placeholder="Enter Current Stock"
                                value={productFormData.currentStock}
                                onChange={(e) => setProductFormData({ ...productFormData, currentStock: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          {/* Minimum Stock */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                            <label className="text-slate-700 font-medium text-xs">Minimum Stock</label>
                            <div className="sm:col-span-2">
                              <input
                                type="number"
                                placeholder="Enter minimum stock"
                                value={productFormData.minimumStock}
                                onChange={(e) => setProductFormData({ ...productFormData, minimumStock: e.target.value })}
                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Code */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                              <label className="text-slate-700 font-medium text-xs">Code</label>
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  placeholder="Last Product/Service/Raw Material Code CQ4N-XMI48S"
                                  value={productFormData.code}
                                  onChange={(e) => setProductFormData({ ...productFormData, code: e.target.value })}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white placeholder:text-slate-400"
                                />
                              </div>
                            </div>

                            {/* Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                              <label className="text-slate-700 font-medium text-xs">Type</label>
                              <div className="sm:col-span-2">
                                <select
                                  value={productFormData.type}
                                  onChange={(e) => setProductFormData({ ...productFormData, type: e.target.value })}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 cursor-pointer"
                                >
                                  <option value="Product">Product</option>
                                  <option value="Service">Service</option>
                                  <option value="Raw Material">Raw Material</option>
                                  <option value="Asset">Asset</option>
                                </select>
                              </div>
                            </div>

                            {/* Images */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                              <label className="text-slate-700 font-medium text-xs flex items-center gap-1">
                                Images
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center cursor-pointer" title="Upload multiple product images">
                                  ?
                                </span>
                              </label>
                              <div className="sm:col-span-2 flex items-center gap-2">
                                <label className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs text-slate-700 cursor-pointer font-medium transition">
                                  Choose files
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                      const files = e.target.files;
                                      setProductFormData({
                                        ...productFormData,
                                        imagesCountText: files && files.length > 0 ? `${files.length} file(s) chosen` : 'No file chosen',
                                      });
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-xs text-slate-500 truncate">{productFormData.imagesCountText || 'No file chosen'}</span>
                              </div>
                            </div>

                            {/* Brand */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                              <label className="text-slate-700 font-medium text-xs">Brand</label>
                              <div className="sm:col-span-2">
                                <select
                                  value={productFormData.brand}
                                  onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700 cursor-pointer"
                                >
                                  <option value="Select Brand">Select Brand</option>
                                  <option value="MIDEA">MIDEA</option>
                                  <option value="LG">LG</option>
                                  <option value="AKAI">AKAI</option>
                                  <option value="MITSUBISHI">MITSUBISHI</option>
                                  <option value="O GENERAL">O GENERAL</option>
                                  <option value="CARRIER">CARRIER</option>
                                </select>
                              </div>
                            </div>

                            {/* Additional Description with Rich Text Editor */}
                            <div className="space-y-1.5 pt-1">
                              <label className="text-slate-700 font-medium text-xs block">Additional Description</label>
                              <div className="border border-slate-300 rounded overflow-hidden bg-white shadow-2xs">
                                {/* Rich Text Toolbar */}
                                <div className="p-1.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-700 select-none">
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('undo')}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer text-xs"
                                    title="Undo"
                                  >
                                    ↺
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('redo')}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer text-xs"
                                    title="Redo"
                                  >
                                    ↻
                                  </button>
                                  <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
                                  <select
                                    onChange={(e) => document.execCommand('formatBlock', false, e.target.value)}
                                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700 cursor-pointer"
                                  >
                                    <option value="p">Paragraph</option>
                                    <option value="h1">Heading 1</option>
                                    <option value="h2">Heading 2</option>
                                    <option value="h3">Heading 3</option>
                                  </select>
                                  <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('bold')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer"
                                    title="Bold"
                                  >
                                    B
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('italic')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 italic text-xs flex items-center justify-center cursor-pointer"
                                    title="Italic"
                                  >
                                    I
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('underline')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 underline text-xs flex items-center justify-center cursor-pointer"
                                    title="Underline"
                                  >
                                    U
                                  </button>
                                  <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('justifyLeft')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Align Left"
                                  >
                                    ≡
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('justifyCenter')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Align Center"
                                  >
                                    ≣
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('justifyRight')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Align Right"
                                  >
                                    ≡
                                  </button>
                                  <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('insertUnorderedList')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Bullet List"
                                  >
                                    •≡
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('insertOrderedList')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Numbered List"
                                  >
                                    1.≡
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('outdent')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Decrease Indent"
                                  >
                                    ←|
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand('indent')}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Increase Indent"
                                  >
                                    |→
                                  </button>
                                  <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const url = prompt('Enter link URL:');
                                      if (url) document.execCommand('createLink', false, url);
                                    }}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Insert Link"
                                  >
                                    🔗
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const url = prompt('Enter image URL:');
                                      if (url) document.execCommand('insertImage', false, url);
                                    }}
                                    className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                                    title="Insert Image"
                                  >
                                    🖼️
                                  </button>
                                </div>

                                {/* Editable Area */}
                                <div
                                  contentEditable
                                  onInput={(e) => {
                                    const text = e.currentTarget.innerText || '';
                                    setProductFormData({
                                      ...productFormData,
                                      additionalDescription: e.currentTarget.innerHTML,
                                      wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
                                    });
                                  }}
                                  className="p-3 min-h-[160px] max-h-[220px] overflow-y-auto text-xs text-slate-800 focus:outline-none bg-white"
                                  style={{ minHeight: '160px' }}
                                />

                                {/* Word Count Footer */}
                                <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 text-right text-[10px] text-slate-400 font-medium">
                                  {productFormData.wordCount || 0} words
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form Bottom Actions */}
                      <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          type="submit"
                          className="px-5 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-semibold rounded-xs shadow-xs cursor-pointer transition"
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductViewMode('list')}
                          className="inline-flex items-center gap-1 px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium rounded-xs shadow-xs cursor-pointer transition"
                        >
                          <span>←</span>
                          <span>Back</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : productViewMode === 'import' ? (
                  /* ========================================================= */
                  /* IMPORT / BULK UPDATE PRODUCTS VIEW (Exact Cezcon CRM - Image 1) */
                  /* ========================================================= */
                  <div className="bg-white border border-[#CBD5E1] rounded-sm shadow-xs overflow-hidden text-xs animate-in fade-in duration-150">
                    {/* Header Bar */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>Add Product/Services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadProductImportFormat}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-semibold rounded-xs shadow-xs cursor-pointer transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Format</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductViewMode('list')}
                          className="w-5 h-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Body */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Form Controls */}
                        <div className="lg:col-span-6 space-y-6">
                          {/* Upload File */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <label className="text-slate-700 font-normal text-xs sm:w-28 sm:pt-1.5 shrink-0">
                              Upload File <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <label className="inline-flex items-center justify-center px-4 py-1.5 bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-medium rounded-xs shadow-2xs cursor-pointer transition">
                                  <span>Choose file</span>
                                  <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleImportFileChange}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-slate-500 text-xs truncate max-w-xs">
                                  {importFileName || 'No file chosen'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Maximum Records : 50 | File Format: XLSX , XLS and CSV
                              </div>
                            </div>
                          </div>

                          {/* Store */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="text-slate-700 font-normal text-xs sm:w-28 shrink-0">
                              Store <span className="text-red-500 font-bold">*</span>
                            </label>
                            <div className="flex-1">
                              <select
                                value={importStore}
                                onChange={(e) => setImportStore(e.target.value)}
                                className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded-xs text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                              >
                                <option value="Select Store">Select Store</option>
                                <option value="CT">CT</option>
                                <option value="M-42 OFFICE">M-42 OFFICE</option>
                                <option value="M-42 SHOP">M-42 SHOP</option>
                                <option value="MAIN WAREHOUSE">MAIN WAREHOUSE</option>
                                <option value="MAIN STORE">MAIN STORE</option>
                                <option value="WAREHOUSE A">WAREHOUSE A</option>
                                <option value="BRANCH 1">BRANCH 1</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Upload Tips */}
                        <div className="lg:col-span-6 lg:pl-6 lg:border-l border-slate-200">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-3">
                            <span className="text-amber-500 text-sm">💡</span>
                            <span>Upload Tips</span>
                          </div>
                          <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed list-disc list-inside">
                            <li>
                              Download{' '}
                              <button
                                type="button"
                                onClick={handleDownloadProductImportFormat}
                                className="text-sky-600 hover:underline font-medium cursor-pointer"
                              >
                                format
                              </button>{' '}
                              of excel file
                            </li>
                            <li>Upload Excel file Using &apos;Choose file&apos; Button.</li>
                            <li>Select a store to proceed with the stock update.</li>
                            <li>
                              If you do not need to update the stock, you may select any store, as this selection is only used for stock updates.
                            </li>
                            <li>
                              Please ensure that the data you&apos;ve uploaded is accurate; if it&apos;s not, please take a moment to edit it from the list.
                            </li>
                            <li>Finally, click the submit button to import/update the data.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Center Status Notes */}
                      <div className="text-center py-6 space-y-1 mt-4">
                        <div className="text-red-500 font-semibold text-xs">
                          Note: Maximum 50 rows allowed
                        </div>
                        <div className="text-emerald-600 font-semibold text-xs">
                          Total {importRowsCount} rows added.
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleImportSubmit}
                        className="px-5 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-semibold rounded-xs shadow-xs cursor-pointer transition"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductViewMode('list')}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xs shadow-xs cursor-pointer transition"
                      >
                        <span>⬅</span>
                        <span>Back</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* PRODUCT / SERVICE LIST TABLE VIEW (Image 2)               */
                  /* ========================================================= */
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
                            onClick={() => {
                              setImportFile(null);
                              setImportFileName('');
                              setImportRowsCount(0);
                              setImportStore('Select Store');
                              setProductViewMode('import');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B1E2E] hover:bg-[#020617] text-white text-xs font-medium rounded-xs shadow-xs cursor-pointer transition"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Update / Import Product/Service</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(null);
                              setProductFormData({
                                serialNumber: '',
                                code: '',
                                name: '',
                                thumbnailName: '',
                                unit: 'Select Unit',
                                category: 'Select Category',
                                purchaseRate: '',
                                sellingPrice: '',
                                store: 'Select Store',
                                currentStock: '',
                                minimumStock: '',
                                type: 'Product',
                                imagesCountText: '',
                                brand: 'Select Brand',
                                additionalDescription: '',
                                wordCount: 0,
                              });
                              setProductViewMode('add');
                            }}
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
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveProductActionDropdownId(
                                      activeProductActionDropdownId === item.id ? null : item.id
                                    );
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00828A] hover:bg-[#006D75] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  <ChevronDown className="w-2.5 h-2.5 text-teal-100" />
                                </button>

                                {activeProductActionDropdownId === item.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs text-left"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setViewingProduct(item);
                                        setProductViewMode('view');
                                        setActiveProductActionDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                    >
                                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                                      <span>View</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProductId(item.id);
                                        setProductFormData({
                                          serialNumber: item.serialNo || '',
                                          code: item.code || '',
                                          name: item.name || '',
                                          thumbnailName: '',
                                          unit: item.unit || 'Select Unit',
                                          category: item.category || 'Select Category',
                                          purchaseRate: String(item.purchaseRate || ''),
                                          sellingPrice: String(item.sellingPrice || ''),
                                          store: item.store || 'Select Store',
                                          currentStock: String(item.currentStock || item.stock || ''),
                                          minimumStock: String(item.minimumStock || ''),
                                          type: item.type || 'Product',
                                          imagesCountText: '',
                                          brand: item.brand || 'Select Brand',
                                          additionalDescription: '',
                                          wordCount: 0,
                                        });
                                        setProductViewMode('add');
                                        setActiveProductActionDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                    >
                                      <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                          const updated = stockItems.filter((i) => i.id !== item.id);
                                          setStockItems(updated);
                                          try {
                                            const existingRaw = localStorage.getItem('cezcon_products_master_live');
                                            const existingList = existingRaw ? JSON.parse(existingRaw) : [];
                                            if (Array.isArray(existingList)) {
                                              const filtered = existingList.filter((x: any) => String(x.id) !== String(item.id));
                                              localStorage.setItem('cezcon_products_master_live', JSON.stringify(filtered));
                                              window.dispatchEvent(new Event('crm_products_updated'));
                                            }
                                          } catch (err) {
                                            console.error('Failed to delete product', err);
                                          }
                                        }
                                        setActiveProductActionDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer text-left font-normal"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Table (Desktop Viewports) */}
                      <div className="hidden md:block overflow-x-auto min-h-[220px] pb-16">
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
                              <th className="p-2.5 text-center w-20">Actions</th>
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
                                    onClick={() => {
                                      const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
                                      const updated = stockItems.map((p) => (p.id === item.id ? { ...p, status: newStatus } : p));
                                      setStockItems(updated);
                                      try {
                                        const existingRaw = localStorage.getItem('cezcon_products_master_live');
                                        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
                                        if (Array.isArray(existingList)) {
                                          const updatedList = existingList.map((x: any) =>
                                            String(x.id) === String(item.id) ? { ...x, status: newStatus === 'Active' } : x
                                          );
                                          localStorage.setItem('cezcon_products_master_live', JSON.stringify(updatedList));
                                          window.dispatchEvent(new Event('crm_products_updated'));
                                        }
                                      } catch (err) {
                                        console.error('Failed to toggle status', err);
                                      }
                                    }}
                                    className={cn(
                                      'w-8 h-4.5 rounded-full relative p-0.5 inline-block transition cursor-pointer shadow-xs',
                                      item.status === 'Active' ? 'bg-[#10B981]' : 'bg-slate-300'
                                    )}
                                    title={item.status === 'Active' ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                                  >
                                    <span
                                      className={cn(
                                        'w-3.5 h-3.5 bg-white rounded-full block shadow-xs transition-transform',
                                        item.status === 'Active' ? 'ml-auto' : 'mr-auto'
                                      )}
                                    ></span>
                                  </button>
                                </td>
                                <td className="p-2.5 text-center relative">
                                  <div className="relative inline-block text-left">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveProductActionDropdownId(
                                          activeProductActionDropdownId === item.id ? null : item.id
                                        );
                                      }}
                                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#00828A] hover:bg-[#006D75] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                      title="Actions"
                                    >
                                      <Settings className="w-3.5 h-3.5" />
                                      <ChevronDown className="w-2.5 h-2.5 text-teal-100" />
                                    </button>

                                    {activeProductActionDropdownId === item.id && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-1 w-28 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-700"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setViewingProduct(item);
                                            setProductViewMode('view');
                                            setActiveProductActionDropdownId(null);
                                          }}
                                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                        >
                                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                                          <span>View</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingProductId(item.id);
                                            setProductFormData({
                                              serialNumber: item.serialNo || '',
                                              code: item.code || '',
                                              name: item.name || '',
                                              thumbnailName: '',
                                              unit: item.unit || 'Select Unit',
                                              category: item.category || 'Select Category',
                                              purchaseRate: String(item.purchaseRate || ''),
                                              sellingPrice: String(item.sellingPrice || ''),
                                              store: item.store || 'Select Store',
                                              currentStock: String(item.currentStock || item.stock || ''),
                                              minimumStock: String(item.minimumStock || ''),
                                              type: item.type || 'Product',
                                              imagesCountText: '',
                                              brand: item.brand || 'Select Brand',
                                              additionalDescription: '',
                                              wordCount: 0,
                                            });
                                            setProductViewMode('add');
                                            setActiveProductActionDropdownId(null);
                                          }}
                                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                        >
                                          <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                                          <span>Edit</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                              const updated = stockItems.filter((i) => i.id !== item.id);
                                              setStockItems(updated);
                                              try {
                                                const existingRaw = localStorage.getItem('cezcon_products_master_live');
                                                const existingList = existingRaw ? JSON.parse(existingRaw) : [];
                                                if (Array.isArray(existingList)) {
                                                  const filtered = existingList.filter((x: any) => String(x.id) !== String(item.id));
                                                  localStorage.setItem('cezcon_products_master_live', JSON.stringify(filtered));
                                                  window.dispatchEvent(new Event('crm_products_updated'));
                                                }
                                              } catch (err) {
                                                console.error('Failed to delete product', err);
                                              }
                                            }
                                            setActiveProductActionDropdownId(null);
                                          }}
                                          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer text-left font-normal"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
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
              </>
            )}

            {/* ========================================================= */}
            {/* UNIT SUB-TAB TABLE VIEW (Exact Cezcon CRM Layout - Image 1)*/}
            {/* ========================================================= */}
            {productSubTab === 'unit' && (
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs animate-in fade-in duration-100">
                {/* Header with Title and + UNIT Button */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                    <span className="text-sm">🗂️</span>
                    <span>Units</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUnitIndex(null);
                      setUnitInputName('');
                      setIsAddUnitModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold uppercase rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ UNIT</span>
                  </button>
                </div>

                {/* Controls: Rows per page & Search */}
                <div className="p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Show</span>
                    <select
                      value={unitRowsPerPage}
                      onChange={(e) => setUnitRowsPerPage(Number(e.target.value))}
                      className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer focus:outline-none"
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
                      value={unitSearch}
                      onChange={(e) => setUnitSearch(e.target.value)}
                      className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[220px] pb-12">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                        <th className="p-2.5 w-20 text-center border-r border-slate-200">SL.No</th>
                        <th className="p-2.5 border-r border-slate-200">Unit</th>
                        <th className="p-2.5 text-center w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredUnits.slice(0, unitRowsPerPage).map((unitName, index) => (
                        <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100 w-20">
                            {index + 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">
                            {unitName}
                          </td>
                          <td className="p-2.5 text-center relative w-28">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveUnitActionDropdown(activeUnitActionDropdown === index ? null : index);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#00828A] hover:bg-[#006D75] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                title="Actions"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-2.5 h-2.5 text-teal-100" />
                              </button>

                              {activeUnitActionDropdown === index && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-28 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUnitIndex(index);
                                      setUnitInputName(unitName);
                                      setIsAddUnitModalOpen(true);
                                      setActiveUnitActionDropdown(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                  >
                                    <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete unit "${unitName}"?`)) {
                                        const updated = unitsList.filter((_, i) => i !== index);
                                        setUnitsList(updated);
                                      }
                                      setActiveUnitActionDropdown(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer text-left font-normal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                  <div>
                    Showing 1 to {filteredUnits.length} of {filteredUnits.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100">
                      «
                    </button>
                    <button className="px-2.5 py-1 border border-blue-500 rounded bg-[#0284C7] text-white font-semibold">
                      1
                    </button>
                    <button className="px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100">
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add / Edit Unit Modal */}
            {isAddUnitModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
                <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-700">
                    <span>{editingUnitIndex !== null ? 'Edit Unit' : 'Add Unit'}</span>
                    <button
                      type="button"
                      onClick={() => setIsAddUnitModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!unitInputName.trim()) return;
                      if (editingUnitIndex !== null) {
                        const updated = [...unitsList];
                        updated[editingUnitIndex] = unitInputName.trim();
                        setUnitsList(updated);
                      } else {
                        setUnitsList([...unitsList, unitInputName.trim()]);
                      }
                      setIsAddUnitModalOpen(false);
                      setUnitInputName('');
                      setEditingUnitIndex(null);
                    }}
                    className="p-4 space-y-3"
                  >
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Unit Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pcs, Kg, Box, Each"
                        value={unitInputName}
                        onChange={(e) => setUnitInputName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddUnitModalOpen(false)}
                        className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded font-semibold cursor-pointer transition"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* BRAND SUB-TAB TABLE VIEW (Exact Cezcon CRM Layout)         */}
            {/* ========================================================= */}
            {productSubTab === 'brand' && (
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs animate-in fade-in duration-100">
                {/* Header with Title and + BRAND Button */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                    <span className="text-sm">🏷️</span>
                    <span>Brands</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBrandIndex(null);
                      setBrandInputName('');
                      setIsAddBrandModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold uppercase rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ BRAND</span>
                  </button>
                </div>

                {/* Controls: Rows per page & Search */}
                <div className="p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Show</span>
                    <select
                      value={brandRowsPerPage}
                      onChange={(e) => setBrandRowsPerPage(Number(e.target.value))}
                      className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer focus:outline-none"
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
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[220px] pb-12">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                        <th className="p-2.5 w-20 text-center border-r border-slate-200">SL.No</th>
                        <th className="p-2.5 border-r border-slate-200">Brand</th>
                        <th className="p-2.5 text-center w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredBrands.slice(0, brandRowsPerPage).map((brandName, index) => (
                        <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100 w-20">
                            {index + 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">
                            {brandName}
                          </td>
                          <td className="p-2.5 text-center relative w-28">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveBrandActionDropdown(activeBrandActionDropdown === index ? null : index);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#00828A] hover:bg-[#006D75] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                title="Actions"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-2.5 h-2.5 text-teal-100" />
                              </button>

                              {activeBrandActionDropdown === index && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-28 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBrandIndex(index);
                                      setBrandInputName(brandName);
                                      setIsAddBrandModalOpen(true);
                                      setActiveBrandActionDropdown(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                  >
                                    <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete brand "${brandName}"?`)) {
                                        const updated = brandsList.filter((_, i) => i !== index);
                                        setBrandsList(updated);
                                      }
                                      setActiveBrandActionDropdown(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer text-left font-normal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                  <div>
                    Showing 1 to {filteredBrands.length} of {filteredBrands.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100">
                      «
                    </button>
                    <button className="px-2.5 py-1 border border-blue-500 rounded bg-[#0284C7] text-white font-semibold">
                      1
                    </button>
                    <button className="px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100">
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add / Edit Brand Modal */}
            {isAddBrandModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
                <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-700">
                    <span>{editingBrandIndex !== null ? 'Edit Brand' : 'Add Brand'}</span>
                    <button
                      type="button"
                      onClick={() => setIsAddBrandModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!brandInputName.trim()) return;
                      if (editingBrandIndex !== null) {
                        const updated = [...brandsList];
                        updated[editingBrandIndex] = brandInputName.trim();
                        setBrandsList(updated);
                      } else {
                        setBrandsList([...brandsList, brandInputName.trim()]);
                      }
                      setIsAddBrandModalOpen(false);
                      setBrandInputName('');
                      setEditingBrandIndex(null);
                    }}
                    className="p-4 space-y-3"
                  >
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MIDEA, LG, CARRIER"
                        value={brandInputName}
                        onChange={(e) => setBrandInputName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddBrandModalOpen(false)}
                        className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded font-semibold cursor-pointer transition"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* CATEGORY SUB-TAB TABLE VIEW (Exact Cezcon CRM Layout)      */}
            {/* ========================================================= */}
            {productSubTab === 'category' && (
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs animate-in fade-in duration-100">
                {/* Header with Title and + CATEGORY Button */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                    <span className="text-sm">🔖</span>
                    <span>Categories</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryIndex(null);
                      setCategoryInputName('');
                      setIsAddCategoryModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold uppercase rounded-xs shadow-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ CATEGORY</span>
                  </button>
                </div>

                {/* Controls: Rows per page & Search */}
                <div className="p-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>Show</span>
                    <select
                      value={categoryRowsPerPage}
                      onChange={(e) => setCategoryRowsPerPage(Number(e.target.value))}
                      className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700 cursor-pointer focus:outline-none"
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
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[220px] pb-12">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-semibold select-none">
                        <th className="p-2.5 w-20 text-center border-r border-slate-200">SL.No</th>
                        <th className="p-2.5 border-r border-slate-200">Category</th>
                        <th className="p-2.5 text-center w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredCategories.slice(0, categoryRowsPerPage).map((catName, index) => (
                        <tr key={index} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-2.5 text-center font-medium text-slate-600 border-r border-slate-100 w-20">
                            {index + 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-100 font-medium text-slate-800">
                            {catName}
                          </td>
                          <td className="p-2.5 text-center relative w-28">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCategoryActionDropdown(activeCategoryActionDropdown === index ? null : index);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#00828A] hover:bg-[#006D75] text-white rounded-xs text-xs font-semibold cursor-pointer shadow-xs transition mx-auto"
                                title="Actions"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-2.5 h-2.5 text-teal-100" />
                              </button>

                              {activeCategoryActionDropdown === index && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-28 bg-white border border-slate-200 rounded shadow-xl py-1 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCategoryIndex(index);
                                      setCategoryInputName(catName);
                                      setIsAddCategoryModalOpen(true);
                                      setActiveCategoryActionDropdown(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer text-left font-normal"
                                  >
                                    <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
                                        const updated = categoriesList.filter((_, i) => i !== index);
                                        setCategoriesList(updated);
                                      }
                                      setActiveCategoryActionDropdown(null);
                                    }}
                                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer text-left font-normal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-white">
                  <div>
                    Showing 1 to {filteredCategories.length} of {filteredCategories.length} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100">
                      «
                    </button>
                    <button className="px-2.5 py-1 border border-blue-500 rounded bg-[#0284C7] text-white font-semibold">
                      1
                    </button>
                    <button className="px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100">
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add / Edit Category Modal */}
            {isAddCategoryModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs">
                <div className="bg-white rounded shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs animate-in zoom-in-95">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-700">
                    <span>{editingCategoryIndex !== null ? 'Edit Category' : 'Add Category'}</span>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!categoryInputName.trim()) return;
                      if (editingCategoryIndex !== null) {
                        const updated = [...categoriesList];
                        updated[editingCategoryIndex] = categoryInputName.trim();
                        setCategoriesList(updated);
                      } else {
                        setCategoriesList([...categoriesList, categoryInputName.trim()]);
                      }
                      setIsAddCategoryModalOpen(false);
                      setCategoryInputName('');
                      setEditingCategoryIndex(null);
                    }}
                    className="p-4 space-y-3"
                  >
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SPLIT AC, CASSETTE AC"
                        value={categoryInputName}
                        onChange={(e) => setCategoryInputName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddCategoryModalOpen(false)}
                        className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#020617] text-white rounded font-semibold cursor-pointer transition"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
            {activeSubTab === 'stock' && viewingProduct ? (
              /* ===================================================== */
              /* CEZCON CRM STOCK ITEM DETAIL VIEW (EXACT IMAGE 1)    */
              /* ===================================================== */
              <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden text-xs">
                {/* Header bar with checkmark + title and red close button */}
                <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span>Stock</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingProduct(null)}
                    className="w-5 h-5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xs flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer transition"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* 2-Column Body Layout */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-white">
                  {/* Left Column - Product Information Card */}
                  <div className="lg:col-span-4 border border-slate-200 rounded bg-white p-4 space-y-3.5 shadow-2xs">
                    {/* Top Image */}
                    <div className="flex justify-center pb-2">
                      {viewingProduct.image ? (
                        <img
                          src={viewingProduct.image}
                          alt={viewingProduct.name}
                          className="w-28 h-28 object-contain rounded border border-slate-200 p-1 bg-white"
                        />
                      ) : (
                        <div className="w-24 h-24 border border-slate-200 rounded bg-slate-50 flex flex-col items-center justify-center text-[8px] text-slate-400 p-1 text-center leading-tight select-none">
                          <svg className="w-6 h-6 text-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>NO IMAGE AVAILABLE</span>
                        </div>
                      )}
                    </div>

                    {/* Code */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CODE</span>
                      <BarcodeView code={viewingProduct.code || 'PLY18'} />
                    </div>

                    {/* Name */}
                    <div className="space-y-0.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NAME</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug block uppercase">
                        {viewingProduct.name}
                      </span>
                    </div>

                    {/* Unit */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">UNIT</span>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {viewingProduct.unit || 'Each'}
                      </span>
                    </div>

                    {/* Brand */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">BRAND</span>
                      <span className="text-xs font-bold text-slate-800 block uppercase">
                        {viewingProduct.brand || 'MITSUBISHI'}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CATEGORY</span>
                      <span className="text-xs font-bold text-slate-800 block uppercase">
                        {viewingProduct.category || 'CASSETTE AC'}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">TYPE</span>
                      <span className="text-xs font-semibold text-slate-800 block">
                        {viewingProduct.type || 'Product'}
                      </span>
                    </div>

                    {/* Purchase Rate */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PURCHASE RATE</span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {viewingProduct.purchaseRate.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Selling Price */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SELLING PRICE</span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {viewingProduct.sellingPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Stock Details Header and Rows */}
                    <div className="pt-2 space-y-2">
                      <div className="bg-[#F1F5F9] border-y border-slate-200 py-1 px-2 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                        STOCK DETAILS
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-700 px-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">CT</span>
                          <span className="font-semibold text-slate-800">: &nbsp; {Math.max(0, viewingProduct.stock - 5)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">M-42 OFFICE</span>
                          <span className="font-semibold text-slate-800">: &nbsp; {viewingProduct.store === 'M-42 OFFICE' ? viewingProduct.stock : 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">M-42 SHOP</span>
                          <span className="font-semibold text-slate-800">: &nbsp; {viewingProduct.store === 'M-42 SHOP' ? viewingProduct.stock : 0}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-bold">
                          <span className="text-slate-700">TOTAL STOCK</span>
                          <span className="text-[#2563EB]">: &nbsp; {viewingProduct.stock}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Adjustment Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('adjustment');
                          setViewingProduct(null);
                        }}
                        className="w-full py-2 px-3 bg-[#5BC0DE] hover:bg-[#31B0D5] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer uppercase tracking-wider"
                      >
                        <SquarePen className="w-3.5 h-3.5" />
                        <span>STOCK ADJUSTMENT</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Tabs and Live Stock Movement */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Tabs Header */}
                    <div className="flex items-center gap-1 border-b border-slate-200">
                      <button
                        type="button"
                        onClick={() => setProductDetailTab('movement')}
                        className={cn(
                          'px-4 py-2 text-xs font-semibold rounded-t border-t-2 transition cursor-pointer',
                          productDetailTab === 'movement'
                            ? 'bg-white border-t-[#EF4444] border-x border-slate-200 text-slate-900 shadow-2xs -mb-[1px]'
                            : 'bg-slate-50 border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        )}
                      >
                        Stock Movement
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductDetailTab('adjustment')}
                        className={cn(
                          'px-4 py-2 text-xs font-semibold rounded-t border-t-2 transition cursor-pointer',
                          productDetailTab === 'adjustment'
                            ? 'bg-white border-t-[#EF4444] border-x border-slate-200 text-slate-900 shadow-2xs -mb-[1px]'
                            : 'bg-slate-50 border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        )}
                      >
                        Stock Adjustment
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductDetailTab('images')}
                        className={cn(
                          'px-4 py-2 text-xs font-semibold rounded-t border-t-2 transition cursor-pointer',
                          productDetailTab === 'images'
                            ? 'bg-white border-t-[#EF4444] border-x border-slate-200 text-slate-900 shadow-2xs -mb-[1px]'
                            : 'bg-slate-50 border-t-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        )}
                      >
                        Images
                      </button>
                    </div>

                    {/* Tab 1: Stock Movement */}
                    {productDetailTab === 'movement' && (
                      <div className="space-y-4 pt-1">
                        {/* Filters Row */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <select
                            value={viewStoreFilter}
                            onChange={(e) => setViewStoreFilter(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Select Store">Select Store</option>
                            <option value="CT">CT</option>
                            <option value="M-42 OFFICE">M-42 OFFICE</option>
                            <option value="M-42 SHOP">M-42 SHOP</option>
                            <option value="Main Warehouse - Bay A">Main Warehouse - Bay A</option>
                          </select>

                          <select
                            value={viewCustomerFilter}
                            onChange={(e) => setViewCustomerFilter(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Select Customer">Select Customer</option>
                            <option value="SUPER GENERAL COMPANY LLC">SUPER GENERAL COMPANY LLC</option>
                            <option value="AL GHANDI ELECTRONICS">AL GHANDI ELECTRONICS</option>
                            <option value="CENTRAL TRADING COMPANY LLC">CENTRAL TRADING COMPANY LLC</option>
                          </select>

                          <div className="relative">
                            <input
                              type="text"
                              value={viewDateRange}
                              onChange={(e) => setViewDateRange(e.target.value)}
                              className="px-3 py-1.5 pr-7 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                            {viewDateRange && (
                              <button
                                type="button"
                                onClick={() => setViewDateRange('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            className="px-3.5 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Submit</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleExportStockMovementExcel}
                            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Excel</span>
                          </button>
                        </div>

                        {/* Black Product Information Banner (Exact Cezcon Style) */}
                        <div className="bg-black text-white p-4 rounded-xs shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-white/20 pb-2">
                            <h2 className="text-sm font-bold tracking-wide uppercase">
                              {viewingProduct.name}
                            </h2>
                            <span className="text-xs font-bold text-white/90 shrink-0">
                              Date: {getLiveTodayFormatted()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-xs font-mono">
                            <div><strong className="text-white/70 font-sans">CODE :</strong> {viewingProduct.code}</div>
                            <div><strong className="text-white/70 font-sans">UNIT :</strong> {viewingProduct.unit || 'Each'}</div>
                            <div><strong className="text-white/70 font-sans">BRAND :</strong> {viewingProduct.brand || 'MITSUBISHI'}</div>
                            <div><strong className="text-white/70 font-sans">CATEGORY :</strong> {viewingProduct.category || 'CASSETTE AC'}</div>
                            <div><strong className="text-white/70 font-sans">COST :</strong> {viewingProduct.purchaseRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div><strong className="text-white/70 font-sans">PRICE :</strong> {viewingProduct.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                          </div>
                        </div>

                        {/* Subtitle */}
                        <div className="text-center pt-1">
                          <span className="text-xs font-bold text-slate-800 underline">
                            Stock Movement Of The Period : From {getLiveFirstDayOfMonth()} To {getLiveTodayDateString()}
                          </span>
                        </div>

                        {/* Movement Table with Royal Blue Header */}
                        <div className="overflow-x-auto border border-slate-200 rounded-sm">
                          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                            <thead>
                              <tr className="bg-[#2563EB] text-white font-semibold">
                                <th className="p-2.5 w-14 text-center border-r border-blue-400">Sl No.</th>
                                <th className="p-2.5 w-24 text-center border-r border-blue-400">Date</th>
                                <th className="p-2.5 w-28 text-center border-r border-blue-400">Number</th>
                                <th className="p-2.5 border-r border-blue-400">Customer</th>
                                <th className="p-2.5 border-r border-blue-400">Description</th>
                                <th className="p-2.5 w-20 text-center border-r border-blue-400">StockIn</th>
                                <th className="p-2.5 w-20 text-center border-r border-blue-400">Stockout</th>
                                <th className="p-2.5 w-20 text-center">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {/* Opening Stock Row */}
                              <tr className="bg-slate-50/60 font-medium">
                                <td className="p-2.5 text-center text-slate-400 border-r border-slate-100"></td>
                                <td className="p-2.5 text-center text-slate-700 border-r border-slate-100 font-mono">
                                  {getLiveFirstDayOfMonth()}
                                </td>
                                <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">-</td>
                                <td className="p-2.5 text-slate-400 border-r border-slate-100">-</td>
                                <td className="p-2.5 font-bold text-slate-800 border-r border-slate-100">
                                  Opening Stock
                                </td>
                                <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">-</td>
                                <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">-</td>
                                <td className="p-2.5 text-center font-bold text-red-600">
                                  0
                                </td>
                              </tr>

                              {/* Transaction rows (Live Data from Stock In List) */}
                              {liveStockMovements.map((m, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30">
                                  <td className="p-2.5 text-center text-slate-600 border-r border-slate-100">
                                    {m.slNo}
                                  </td>
                                  <td className="p-2.5 text-center text-slate-700 border-r border-slate-100 font-mono">
                                    {m.date}
                                  </td>
                                  <td className="p-2.5 text-center text-[#2563EB] font-medium border-r border-slate-100">
                                    {m.number}
                                  </td>
                                  <td className="p-2.5 text-slate-800 border-r border-slate-100">
                                    {m.customer}
                                  </td>
                                  <td className="p-2.5 text-slate-700 border-r border-slate-100">
                                    {m.description}
                                  </td>
                                  <td className="p-2.5 text-center font-semibold text-emerald-700 border-r border-slate-100">
                                    {m.stockIn}
                                  </td>
                                  <td className="p-2.5 text-center font-semibold text-red-600 border-r border-slate-100">
                                    {m.stockOut || '-'}
                                  </td>
                                  <td className="p-2.5 text-center font-bold text-slate-900">
                                    {m.stock}
                                  </td>
                                </tr>
                              ))}

                              {/* Summary / Total & Closing Stock Rows */}
                              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                <td colSpan={5} className="p-2.5 text-right text-slate-800 pr-4 border-r border-slate-100">
                                  Total
                                </td>
                                <td className="p-2.5 text-center text-emerald-700 border-r border-slate-100">
                                  {liveStockMovements.reduce((acc, curr) => acc + curr.stockIn, 0)}
                                </td>
                                <td className="p-2.5 text-center text-red-600 border-r border-slate-100">
                                  {liveStockMovements.reduce((acc, curr) => acc + curr.stockOut, 0)}
                                </td>
                                <td className="p-2.5 text-center text-red-600 font-bold whitespace-nowrap">
                                  Closing Stock : {liveStockMovements.length > 0 ? liveStockMovements[liveStockMovements.length - 1].stock : 0}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Stock Adjustment */}
                    {productDetailTab === 'adjustment' && (
                      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                            Stock Adjustment for {viewingProduct.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-slate-600 font-medium text-xs block">Adjustment Type</label>
                            <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500">
                              <option value="Increase">Increase Stock (+)</option>
                              <option value="Decrease">Decrease Stock (-)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-600 font-medium text-xs block">Store</label>
                            <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500">
                              <option value="CT">CT</option>
                              <option value="M-42 OFFICE">M-42 OFFICE</option>
                              <option value="M-42 SHOP">M-42 SHOP</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-600 font-medium text-xs block">Quantity</label>
                            <input
                              type="number"
                              placeholder="Enter quantity"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-600 font-medium text-xs block">Reason / Reference</label>
                            <input
                              type="text"
                              placeholder="Reason for adjustment"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => alert('Stock adjustment recorded successfully!')}
                            className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-bold cursor-pointer"
                          >
                            Save Adjustment
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Images */}
                    {productDetailTab === 'images' && (
                      <div className="bg-white border border-slate-200 rounded p-5 space-y-4 text-center">
                        <div className="w-40 h-40 mx-auto border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 text-slate-400 bg-slate-50">
                          <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                          <span className="text-xs font-medium">No additional images uploaded</span>
                        </div>
                        <p className="text-xs text-slate-500">Upload high resolution product catalog images for {viewingProduct.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeSubTab === 'adjustment' ? (
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
                          {users && users.length > 0 ? (
                            users.map((u) => (
                              <option key={u.id} value={u.name}>
                                {u.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Muhammad Ali">Muhammad Ali</option>
                              <option value="Shaheer">Shaheer</option>
                              <option value="Super Admin">Super Admin</option>
                            </>
                          )}
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
                              onClick={() => {
                                setViewingProduct(item);
                                setProductDetailTab('movement');
                              }}
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
                              <td
                                onClick={() => {
                                  setViewingProduct(item);
                                  setProductDetailTab('movement');
                                }}
                                className="p-2.5 font-medium text-slate-800 border-r border-slate-100 leading-snug hover:text-[#2563EB] hover:underline cursor-pointer"
                              >
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
                                  onClick={() => {
                                    setViewingProduct(item);
                                    setProductDetailTab('movement');
                                  }}
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
                    {filteredStockItems.length === 0 ? (
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
        {/* Universal Change Delivery Status Modal (Exact Cezcon CRM Modal) */}
        {isChangeDeliveryStatusModalOpen && (
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setIsChangeDeliveryStatusModalOpen(false)}
          >
            <div
              className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs animate-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
                <h3 className="font-semibold text-sm text-slate-900">Change Delivery Status</h3>
                <button
                  type="button"
                  onClick={() => setIsChangeDeliveryStatusModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-base font-normal cursor-pointer transition p-0.5"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 bg-white">
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-4 text-slate-800 font-medium text-xs pt-0.5">
                    Delivery Status
                  </label>
                  <div className="col-span-8 space-y-3 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="universalDeliveryStatusRadio"
                        value="Delivered"
                        checked={deliveryStatusModalSelected === 'Delivered'}
                        onChange={() => setDeliveryStatusModalSelected('Delivered')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Delivered</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="universalDeliveryStatusRadio"
                        value="Partially Delivered"
                        checked={deliveryStatusModalSelected === 'Partially Delivered'}
                        onChange={() => setDeliveryStatusModalSelected('Partially Delivered')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Partially Delivered</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="universalDeliveryStatusRadio"
                        value="Pending"
                        checked={deliveryStatusModalSelected === 'Pending'}
                        onChange={() => setDeliveryStatusModalSelected('Pending')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Pending</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-[#F1F5F9] border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChangeDeliveryStatusModalOpen(false)}
                  className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveDeliveryStatus}
                  className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Universal Change Payment Status Modal */}
        {isChangePaymentStatusModalOpen && (
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setIsChangePaymentStatusModalOpen(false)}
          >
            <div
              className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs animate-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
                <h3 className="font-semibold text-sm text-slate-900">Change Payment Status</h3>
                <button
                  type="button"
                  onClick={() => setIsChangePaymentStatusModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-base font-normal cursor-pointer transition p-0.5"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 bg-white">
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-4 text-slate-800 font-medium text-xs pt-0.5">
                    Payment Status
                  </label>
                  <div className="col-span-8 space-y-3 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="universalPaymentStatusRadio"
                        value="Paid"
                        checked={paymentStatusModalSelected === 'Paid'}
                        onChange={() => setPaymentStatusModalSelected('Paid')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Paid</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="universalPaymentStatusRadio"
                        value="Partially Paid"
                        checked={paymentStatusModalSelected === 'Partially Paid'}
                        onChange={() => setPaymentStatusModalSelected('Partially Paid')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Partially Paid</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="universalPaymentStatusRadio"
                        value="Due"
                        checked={paymentStatusModalSelected === 'Due'}
                        onChange={() => setPaymentStatusModalSelected('Due')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span>Due</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-[#F1F5F9] border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChangePaymentStatusModalOpen(false)}
                  className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSavePaymentStatus}
                  className="px-4 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
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
