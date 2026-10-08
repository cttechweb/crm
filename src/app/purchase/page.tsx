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
  Trash2,
  BookOpen,
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

// Cezcon Standard Purchase Orders
const mockPurchaseOrders: any[] = [
  {
    id: 1,
    slNo: 1,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    poNumber: 'CTPO#2508',
    date: '25-09-2026',
    supplier: 'SUPER GENERAL COMPANY LLC',
    order: '',
    reference: '',
    amount: 2050.00,
    vat: 102.50,
    totalAmount: 2152.50,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 2,
    slNo: 2,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    poNumber: 'CTPO#2507',
    date: '25-09-2026',
    supplier: 'SUPER GENERAL COMPANY LLC',
    order: '',
    reference: '',
    amount: 7800.00,
    vat: 390.00,
    totalAmount: 8190.00,
    invoiceReceived: '',
    approval: 'Waiting for Final Approval',
    deliveryStatus: 'Pending',
  },
  {
    id: 3,
    slNo: 3,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    poNumber: 'CTPO#2506',
    date: '25-09-2026',
    supplier: 'LUTFI TRADING LLC',
    order: '',
    reference: '',
    amount: 850.00,
    vat: 42.50,
    totalAmount: 892.50,
    invoiceReceived: '',
    approval: 'Approved',
    deliveryStatus: 'Pending',
  },
  {
    id: 4,
    slNo: 4,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    poNumber: 'CTPO#2505',
    date: '25-09-2026',
    supplier: 'DUBAI POLYMER INDUSTRIES LLC',
    order: '',
    reference: '',
    amount: 1900.00,
    vat: 95.00,
    totalAmount: 1995.00,
    invoiceReceived: '',
    approval: 'Approved',
    deliveryStatus: 'Pending',
  },
  {
    id: 5,
    slNo: 5,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    poNumber: 'CTPO#2504',
    date: '25-09-2026',
    supplier: 'CENTRAL TRADING COMPANY L.L.C.',
    order: '',
    reference: '',
    amount: 20300.00,
    vat: 1015.00,
    totalAmount: 21315.00,
    invoiceReceived: '',
    approval: 'Approved',
    deliveryStatus: 'Pending',
  },
  {
    id: 6,
    slNo: 6,
    owner: 'Muhammad Ali',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    poNumber: 'CTPO#2503',
    date: '25-09-2026',
    supplier: 'LUTFI TRADING LLC',
    order: '',
    reference: '',
    amount: 2575.00,
    vat: 128.75,
    totalAmount: 2703.75,
    invoiceReceived: '',
    approval: 'Approved',
    deliveryStatus: 'Pending',
  },
];
const mockPurchaseInvoices: any[] = [];
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
  const [poDateRange, setPoDateRange] = useState<string>('31-08-2026 - 29-09-2026');
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

  const [transfers, setTransfers] = useState<CrmStockTransfer[]>(mockStockTransfers);

  // Add Product View Form State (Exact Cezcon CRM layout)
  const [productViewMode, setProductViewMode] = useState<'list' | 'add' | 'view'>('list');
  const [productDetailTab, setProductDetailTab] = useState<'movement' | 'adjustment' | 'images'>('movement');
  const [viewStoreFilter, setViewStoreFilter] = useState<string>('Select Store');
  const [viewCustomerFilter, setViewCustomerFilter] = useState<string>('Select Customer');
  const [viewDateRange, setViewDateRange] = useState<string>('01-10-2026 - 07-10-2026');
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

  const [activeProductActionDropdownId, setActiveProductActionDropdownId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<CrmCezconStock | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveProductActionDropdownId(null);
      setActiveUnitActionDropdown(null);
      setActiveBrandActionDropdown(null);
      setActiveCategoryActionDropdown(null);
    };
    if (activeProductActionDropdownId !== null || activeUnitActionDropdown !== null || activeBrandActionDropdown !== null || activeCategoryActionDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeProductActionDropdownId, activeUnitActionDropdown, activeBrandActionDropdown, activeCategoryActionDropdown]);

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
                          <span className="inline-flex items-center gap-1 text-[#1976D2] hover:underline cursor-pointer font-bold">
                            <span className="text-[10px]">📄</span>
                            {po.poNumber}
                          </span>
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
                          {po.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-medium text-slate-700 border-r border-slate-100 font-mono">
                          {po.vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900 border-r border-slate-100 font-mono">
                          {po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center text-slate-400 border-r border-slate-100">{po.invoiceReceived || ''}</td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-2xs ${po.approval === 'Waiting for Final Approval'
                                ? 'bg-[#1E5128]'
                                : 'bg-[#2E7D32]'
                              }`}
                          >
                            {po.approval}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-r border-slate-100">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B] text-white inline-flex items-center gap-1 whitespace-nowrap shadow-2xs">
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
                    <div className="p-3 bg-white border border-slate-200 rounded-sm flex flex-wrap items-center gap-2.5">
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

                    {/* Black Banner / Card Header */}
                    <div className="bg-[#000000] text-white p-4 rounded-sm space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800 pb-2">
                        <h2 className="font-extrabold text-sm tracking-wide uppercase">{viewingProduct.name}</h2>
                        <span className="text-xs text-slate-300 font-mono">
                          Date: <strong className="text-white font-semibold">07 Oct 2026</strong>
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

                    {/* Stock Movement Section */}
                    <div className="space-y-3">
                      <div className="text-center font-bold text-slate-800 text-xs underline">
                        Stock Movement Of The Period : From 01-10-2026 To 07-10-2026
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
                              <td className="p-2 text-center text-slate-700 border-r border-slate-100">01-10-2026</td>
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
