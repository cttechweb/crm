'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Search,
  Package,
  RotateCcw,
  Download,
  Upload,
  Settings,
  ChevronDown,
  Layers,
  Tag,
  Boxes,
  SlidersHorizontal,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  QrCode,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  X,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link as LinkIcon,
  HelpCircle,
  RotateCcw as UndoIcon,
  RotateCw as RedoIcon,
  Palette,
  Check,
} from 'lucide-react';
import {
  PRODUCTS_SETTINGS,
  CEZCON_PRODUCT_UNITS_DATA,
  CEZCON_PRODUCT_BRANDS_DATA,
  CEZCON_PRODUCT_CATEGORIES_DATA,
} from '@/data/settingsMockData';
import {
  ProductSettingItem,
  ProductUnitItem,
  ProductBrandItem,
  ProductCategoryItem,
} from '@/types/settings';

// Helper Barcode Graphic Component
function BarcodeGraphic({ value }: { value: string }) {
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bars = Array.from({ length: 36 }).map((_, i) => {
    const isWide = ((hash * (i + 1) * 7) % 5 === 0) || i === 0 || i === 35 || i === 17;
    const isGap = (hash + i * 13) % 4 === 0 && i !== 0 && i !== 35;
    return { isWide, isGap };
  });

  return (
    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-slate-200 rounded-xs shadow-2xs">
      <div className="flex items-center h-8 gap-[1.5px] px-1 bg-white">
        {bars.map((bar, idx) => (
          <div
            key={idx}
            className={`h-full ${
              bar.isGap ? 'bg-transparent' : 'bg-slate-900'
            } ${bar.isWide ? 'w-[3px]' : 'w-[1.5px]'}`}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider mt-1 text-center truncate max-w-[140px]">
        {value}
      </span>
    </div>
  );
}

export function ProductsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'unit' | 'brand' | 'category'>('products');

  // Products State
  const [products, setProducts] = useState<ProductSettingItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_products_master_v3');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load products master', e);
      }
    }
    return PRODUCTS_SETTINGS;
  });

  // Mode: List View or Full Add/Edit Form View
  const [isFormViewOpen, setIsFormViewOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | string | null>(null);

  // Filters for Product Table
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterUnit, setFilterUnit] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterStore, setFilterStore] = useState('All Store');

  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Action / Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductSettingItem | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State matching Cezcon exact fields
  const [formData, setFormData] = useState<{
    serialNo: string;
    code: string;
    name: string;
    type: 'Product' | 'Service' | 'Raw Material' | 'Asset';
    thumbnailName: string;
    imagesCount: number;
    unit: string;
    brand: string;
    category: string;
    purchaseRate: string;
    sellingPrice: string;
    store: string;
    currentStock: string;
    minStock: string;
    additionalDescription: string;
    status: boolean;
  }>({
    serialNo: '',
    code: '',
    name: '',
    type: 'Product',
    thumbnailName: '',
    imagesCount: 0,
    unit: 'Select Unit',
    brand: 'Select Brand',
    category: 'Select Category',
    purchaseRate: '',
    sellingPrice: '',
    store: 'Select Store',
    currentStock: '',
    minStock: '',
    additionalDescription: '',
    status: true,
  });

  // Units, Brands, Categories States
  const [units, setUnits] = useState<ProductUnitItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_product_units');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return CEZCON_PRODUCT_UNITS_DATA;
  });
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({ name: '', abbreviation: '', active: true });

  const [brands, setBrands] = useState<ProductBrandItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_product_brands');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return CEZCON_PRODUCT_BRANDS_DATA;
  });
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({ name: '', code: '', active: true });

  const [categories, setCategories] = useState<ProductCategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_product_categories');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return CEZCON_PRODUCT_CATEGORIES_DATA;
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', code: '', active: true });

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-action-container')) {
        setOpenDropdownId(null);
      }
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  // LocalStorage Persist
  const saveProducts = (updated: ProductSettingItem[]) => {
    setProducts(updated);
    try {
      localStorage.setItem('cezcon_products_master_v3', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveUnits = (updated: ProductUnitItem[]) => {
    setUnits(updated);
    try {
      localStorage.setItem('cezcon_product_units', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveBrands = (updated: ProductBrandItem[]) => {
    setBrands(updated);
    try {
      localStorage.setItem('cezcon_product_brands', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveCategories = (updated: ProductCategoryItem[]) => {
    setCategories(updated);
    try {
      localStorage.setItem('cezcon_product_categories', JSON.stringify(updated));
    } catch (e) {}
  };

  // ----------------------------------------------------
  // FORM OPEN / EDIT HANDLERS
  // ----------------------------------------------------
  const handleOpenCreateForm = () => {
    setEditingProductId(null);
    const lastCode = products[0]?.code || products[0]?.sku || 'MCDT-18HRFN1A';
    setFormData({
      serialNo: '',
      code: '',
      name: '',
      type: 'Product',
      thumbnailName: '',
      imagesCount: 0,
      unit: units[0]?.abbreviation || 'Pcs',
      brand: brands[0]?.name || 'MIDEA',
      category: categories[0]?.name || 'CASSETTE AC',
      purchaseRate: '',
      sellingPrice: '',
      store: 'Main Store',
      currentStock: '',
      minStock: '',
      additionalDescription: '',
      status: true,
    });
    setErrorMessage(null);
    setIsFormViewOpen(true);
  };

  const handleOpenEditForm = (item: ProductSettingItem) => {
    setEditingProductId(item.id);
    setFormData({
      serialNo: item.serialNo || '',
      code: item.code || item.sku,
      name: item.name,
      type: (item.type as any) || 'Product',
      thumbnailName: item.thumbnailImage ? 'thumbnail.png' : '',
      imagesCount: item.images?.length || 0,
      unit: item.unit || 'Pcs',
      brand: item.brand || 'MIDEA',
      category: item.category || 'CASSETTE AC',
      purchaseRate: String(item.purchaseRate || item.basePrice || ''),
      sellingPrice: String(item.sellingPrice || ''),
      store: item.store || 'Main Store',
      currentStock: String(item.currentStock || ''),
      minStock: String(item.minStock || ''),
      additionalDescription: item.additionalDescription || '',
      status: item.status !== false,
    });
    setErrorMessage(null);
    setOpenDropdownId(null);
    setIsFormViewOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Name is required.');
      return;
    }

    const generatedCode = formData.code.trim() || `PRD-${Math.floor(1000 + Math.random() * 9000)}`;

    if (editingProductId !== null) {
      const updated = products.map((p) =>
        p.id === editingProductId
          ? {
              ...p,
              serialNo: formData.serialNo.trim(),
              code: generatedCode,
              sku: generatedCode,
              name: formData.name.trim(),
              type: formData.type,
              unit: formData.unit !== 'Select Unit' ? formData.unit : 'Pcs',
              brand: formData.brand !== 'Select Brand' ? formData.brand : 'MIDEA',
              category: formData.category !== 'Select Category' ? formData.category : 'CASSETTE AC',
              purchaseRate: Number(formData.purchaseRate) || 0,
              sellingPrice: Number(formData.sellingPrice) || 0,
              basePrice: Number(formData.purchaseRate) || 0,
              store: formData.store !== 'Select Store' ? formData.store : 'Main Store',
              currentStock: Number(formData.currentStock) || 0,
              minStock: Number(formData.minStock) || 0,
              additionalDescription: formData.additionalDescription,
              status: formData.status,
            }
          : p
      );
      saveProducts(updated);
      showToast(`Product "${formData.name.trim()}" updated successfully.`);
    } else {
      const newItem: ProductSettingItem = {
        id: Date.now(),
        serialNo: formData.serialNo.trim(),
        code: generatedCode,
        sku: generatedCode,
        name: formData.name.trim(),
        type: formData.type,
        unit: formData.unit !== 'Select Unit' ? formData.unit : 'Pcs',
        brand: formData.brand !== 'Select Brand' ? formData.brand : 'MIDEA',
        category: formData.category !== 'Select Category' ? formData.category : 'CASSETTE AC',
        purchaseRate: Number(formData.purchaseRate) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        basePrice: Number(formData.purchaseRate) || 0,
        store: formData.store !== 'Select Store' ? formData.store : 'Main Store',
        currentStock: Number(formData.currentStock) || 0,
        minStock: Number(formData.minStock) || 0,
        additionalDescription: formData.additionalDescription,
        status: formData.status,
      };
      saveProducts([newItem, ...products]);
      showToast(`Product "${newItem.name}" added successfully.`);
    }

    setIsFormViewOpen(false);
  };

  const handleToggleProductStatus = (id: number | string) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, status: p.status === false ? true : false } : p
    );
    saveProducts(updated);
    setOpenDropdownId(null);
    const target = updated.find((p) => p.id === id);
    showToast(`Product "${target?.name}" set to ${target?.status ? 'Active' : 'Inactive'}.`);
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const updated = products.filter((p) => p.id !== productToDelete.id);
    saveProducts(updated);
    showToast(`Product "${productToDelete.name}" deleted.`);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const lastProductCode = products[0]?.code || products[0]?.sku || 'MCDT-18HRFN1A';

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'All' && filterCategory !== 'Select' && p.category !== filterCategory) return false;
    if (filterBrand !== 'All' && filterBrand !== 'Select' && p.brand !== filterBrand) return false;
    if (filterUnit !== 'All' && filterUnit !== 'Select' && p.unit !== filterUnit) return false;
    if (filterType !== 'All' && p.type !== filterType) return false;
    if (filterStatus === 'Active' && p.status === false) return false;
    if (filterStatus === 'Inactive' && p.status !== false) return false;
    if (filterStore !== 'All Store' && p.store && p.store !== filterStore) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-md overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('products');
            setIsFormViewOpen(false);
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'products'
              ? 'border-red-600 text-slate-900 bg-slate-50/80'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Product or Services</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 text-slate-700">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('unit');
            setIsFormViewOpen(false);
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'unit'
              ? 'border-red-600 text-slate-900 bg-slate-50/80'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Unit</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('brand');
            setIsFormViewOpen(false);
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'brand'
              ? 'border-red-600 text-slate-900 bg-slate-50/80'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Brand</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('category');
            setIsFormViewOpen(false);
          }}
          className={`inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'category'
              ? 'border-red-600 text-slate-900 bg-slate-50/80'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Category</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW A: CEZCON ADD / EDIT PRODUCT/SERVICE FULL FORM (From Screenshot)
          ========================================================================= */}
      {activeSubTab === 'products' && isFormViewOpen && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          {/* Header Bar with Red Close Button */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>
                {editingProductId !== null
                  ? 'Edit Product/Service/Raw Material/Asset'
                  : 'Add Product/Service/Raw Material/Asset'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFormViewOpen(false)}
              className="w-5 h-5 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Close form and return to table"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Row 1: Serial Number & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">Serial Number</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Serial Number"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">Code</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder={`Last Product/Service/Raw Material Code ${lastProductCode}`}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Name * & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">
                  Name <span className="text-rose-500">*</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">Type</label>
                <div className="sm:col-span-2">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Asset">Asset</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Thumbnail Image & Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">Thumbnail Image</label>
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData({ ...formData, thumbnailName: file.name });
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <div className="flex items-center gap-1">
                  <label className="text-slate-700 font-medium">Images</label>
                  <span title="Upload multiple product gallery photos">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const count = e.target.files?.length || 0;
                      setFormData({ ...formData, imagesCount: count });
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Unit & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">Unit</label>
                <div className="sm:col-span-2">
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Select Unit">Select Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.abbreviation}>
                        {u.name} ({u.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="text-slate-700 font-medium">Brand</label>
                <div className="sm:col-span-2">
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="Select Brand">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 5 to Bottom: Left Column (Rates, Stocks, Category, Store) & Right Column (Additional Description Rich Editor) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-1">
              {/* LEFT COLUMN */}
              <div className="space-y-3">
                {/* Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <label className="text-slate-700 font-medium">Category</label>
                  <div className="sm:col-span-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="Select Category">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Purchase Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <label className="text-slate-700 font-medium">Purchase Rate</label>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter Purchase Rate"
                      value={formData.purchaseRate}
                      onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <label className="text-slate-700 font-medium">Selling Price</label>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter Selling Price"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Store */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <label className="text-slate-700 font-medium">Store</label>
                  <div className="sm:col-span-2">
                    <select
                      value={formData.store}
                      onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="Select Store">Select Store</option>
                      <option value="Main Store">Main Store</option>
                      <option value="Dubai Central Warehouse">Dubai Central Warehouse</option>
                      <option value="Abu Dhabi Branch Store">Abu Dhabi Branch Store</option>
                    </select>
                  </div>
                </div>

                {/* Current Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <label className="text-slate-700 font-medium">Current Stock</label>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Enter Current Stock"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Minimum Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                  <label className="text-slate-700 font-medium">Minimum Stock</label>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Enter minimum stock"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ADDITIONAL DESCRIPTION (Rich WYSIWYG Editor Mock) */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-slate-700 font-medium">Additional Description</label>

                {/* Rich Text Editor Box */}
                <div className="border border-slate-300 rounded overflow-hidden flex flex-col flex-1 bg-white">
                  {/* WYSIWYG Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 text-slate-700">
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600" title="Undo">
                      <UndoIcon className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 text-slate-600" title="Redo">
                      <RedoIcon className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

                    <select className="px-1.5 py-0.5 text-[11px] bg-white border border-slate-300 rounded focus:outline-none">
                      <option>Paragraph</option>
                      <option>Heading 1</option>
                      <option>Heading 2</option>
                    </select>

                    <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

                    <button type="button" className="p-1 rounded hover:bg-slate-200 font-bold" title="Bold">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 italic" title="Italic">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 underline" title="Underline">
                      <Underline className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Align Left">
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Align Center">
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Align Right">
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Justify">
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Bullet List">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Numbered List">
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Link">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200" title="Insert Image">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Textarea Area */}
                  <textarea
                    rows={8}
                    placeholder="Enter comprehensive technical specifications, warranty terms, or notes..."
                    value={formData.additionalDescription}
                    onChange={(e) => setFormData({ ...formData, additionalDescription: e.target.value })}
                    className="w-full p-3 text-xs text-slate-800 focus:outline-none resize-none flex-1 font-normal bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsFormViewOpen(false)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{editingProductId !== null ? 'Update Product/Service' : 'Save Product/Service'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          VIEW B: PRODUCT/SERVICES TABLE VIEW (When form is closed)
          ========================================================================= */}
      {activeSubTab === 'products' && !isFormViewOpen && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Package className="w-4 h-4 text-slate-600" />
              <span>Product/Services</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Barcode</span>
              </button>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Update / Import Product/Service</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateForm}
                id="btn-add-product"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ PRODUCT/SERVICE</span>
              </button>
            </div>
          </div>

          {/* Filter Area (6 Controls) */}
          <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Category</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="All">Select</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Brand</label>
              <select
                value={filterBrand}
                onChange={(e) => {
                  setFilterBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="All">Select</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Unit</label>
              <select
                value={filterUnit}
                onChange={(e) => {
                  setFilterUnit(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="All">Select</option>
                {units.map((u) => (
                  <option key={u.id} value={u.abbreviation}>
                    {u.name} ({u.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="All">All</option>
                <option value="Product">Product</option>
                <option value="Service">Service</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Asset">Asset</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="All">All</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Store</label>
              <select
                value={filterStore}
                onChange={(e) => {
                  setFilterStore(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="All Store">All Store</option>
                <option value="Main Store">Main Store</option>
                <option value="Dubai Central Warehouse">Dubai Central Warehouse</option>
                <option value="Abu Dhabi Branch Store">Abu Dhabi Branch Store</option>
              </select>
            </div>
          </div>

          {/* Table Controls (Shows Rows + Search) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 text-xs bg-white">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Shows</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-slate-600">Rows</span>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3 pr-8 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                <tr>
                  <th className="py-2.5 px-3 w-14 text-center border-r border-slate-200">SL.No</th>
                  <th className="py-2.5 px-3 w-20 text-center border-r border-slate-200">Serial No.</th>
                  <th className="py-2.5 px-4 w-44 text-center border-r border-slate-200">Code</th>
                  <th className="py-2.5 px-4 min-w-[200px] border-r border-slate-200">Name</th>
                  <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Image</th>
                  <th className="py-2.5 px-3 w-14 text-center border-r border-slate-200">Unit</th>
                  <th className="py-2.5 px-4 w-24 border-r border-slate-200">Brand</th>
                  <th className="py-2.5 px-4 w-32 border-r border-slate-200">Category</th>
                  <th className="py-2.5 px-3 w-20 border-r border-slate-200">Type ⓘ</th>
                  <th className="py-2.5 px-4 w-28 text-right border-r border-slate-200">Purchase Rate</th>
                  <th className="py-2.5 px-4 w-24 text-right border-r border-slate-200">Selling Price</th>
                  <th className="py-2.5 px-3 w-20 text-center border-r border-slate-200">Status</th>
                  <th className="py-2.5 px-3 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-slate-400">
                      <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No products or services found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your filters or search criteria</p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((item, index) => {
                    const slNo = (currentPage - 1) * rowsPerPage + index + 1;
                    const isDropdownOpen = openDropdownId === item.id;
                    const isActive = item.status !== false;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-3 px-3 text-center font-medium text-slate-700 border-r border-slate-200">
                          {slNo}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200">
                          {item.serialNo || '—'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <BarcodeGraphic value={item.code || item.sku} />
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                          <div className="leading-snug">{item.name}</div>
                          {item.store && (
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              Store: {item.store}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200">
                          <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                            <ImageIcon className="w-4 h-4 opacity-60" />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-700 border-r border-slate-200">
                          {item.unit || 'Pcs'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 border-r border-slate-200">
                          {item.brand || '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 text-[11px] border-r border-slate-200">
                          {item.category}
                        </td>
                        <td className="py-3 px-3 text-slate-700 text-[11px] font-medium border-r border-slate-200">
                          {item.type || 'Product'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 border-r border-slate-200">
                          {Number(item.purchaseRate || item.basePrice || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 border-r border-slate-200">
                          {Number(item.sellingPrice || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleToggleProductStatus(item.id)}
                            className="inline-flex items-center cursor-pointer"
                            title="Toggle status"
                          >
                            <div
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                                isActive ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center relative">
                          <div className="inline-block relative dropdown-action-container text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(isDropdownOpen ? null : item.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(item)}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    showToast(`Printed barcode label for ${item.code || item.sku}`);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Print Barcode</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setProductToDelete(item);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-600 bg-white">
            <div>
              Showing {filteredProducts.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded border text-xs ${
                  currentPage === 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                «
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded border text-xs ${
                  currentPage === totalPages
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: UNIT MASTER
          ========================================================================= */}
      {activeSubTab === 'unit' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>Unit of Measurement Master</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUnitForm({ name: '', abbreviation: '', active: true });
                setIsUnitModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              + Add Unit
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                <tr>
                  <th className="py-2.5 px-4 w-16 text-center border-r border-slate-200">SL.No</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Unit Name</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Abbreviation</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-600 border-r border-slate-200">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">{u.name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 border-r border-slate-200">{u.abbreviation}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600 font-bold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: BRAND MASTER
          ========================================================================= */}
      {activeSubTab === 'brand' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Tag className="w-4 h-4 text-slate-600" />
              <span>Manufacturer & Brand Master</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setBrandForm({ name: '', code: '', active: true });
                setIsBrandModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              + Add Brand
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                <tr>
                  <th className="py-2.5 px-4 w-16 text-center border-r border-slate-200">SL.No</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Brand Name</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Brand Code</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-600 border-r border-slate-200">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">{b.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 border-r border-slate-200">{b.code || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600 font-bold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: CATEGORY MASTER
          ========================================================================= */}
      {activeSubTab === 'category' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Product Category Master</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCategoryForm({ name: '', code: '', active: true });
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              + Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                <tr>
                  <th className="py-2.5 px-4 w-16 text-center border-r border-slate-200">SL.No</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Category Name</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Code</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-bold text-slate-600 border-r border-slate-200">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 border-r border-slate-200">{c.code || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600 font-bold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE PRODUCT
          ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product / Service"
        description="Are you sure you want to remove this item from the catalog?"
        icon={<Trash2 className="w-5 h-5 text-rose-600" />}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600">
            Deleting <span className="font-bold text-slate-900">{productToDelete?.name}</span> ({productToDelete?.code || productToDelete?.sku}) will remove it from future quotation pickers.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleConfirmDeleteProduct}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: DOWNLOAD BARCODES
          ========================================================================= */}
      <Modal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        title="Download Barcode Master Sheet"
        description="Print or export scannable labels for warehouse inventory."
        icon={<QrCode className="w-5 h-5 text-[#0F3652]" />}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <p className="text-slate-600">
            Ready to export <span className="font-bold text-slate-900">{filteredProducts.length} barcodes</span> for active catalog items formatted for standard thermal label printers (A4 / 24-up label sheets).
          </p>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-around">
            {filteredProducts.slice(0, 2).map((item) => (
              <BarcodeGraphic key={item.id} value={item.code || item.sku} />
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsBarcodeModalOpen(false)}>
              Close
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsBarcodeModalOpen(false);
                showToast('Barcode PDF sheet generated and ready for print.');
              }}
              className="px-4 py-1.5 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Export PDF Labels
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: IMPORT PRODUCTS
          ========================================================================= */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Update / Import Product/Service Catalog"
        description="Upload CSV or Excel sheet to bulk import inventory catalog."
        icon={<FileSpreadsheet className="w-5 h-5 text-[#0F3652]" />}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-700">Click to upload or drag and drop CSV / Excel</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports columns: Code, Name, Brand, Category, Unit, PurchaseRate, SellingPrice</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                showToast('Bulk products synchronized with inventory master.');
              }}
              className="px-4 py-1.5 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Process Import
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: ADD UNIT */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title="Add Unit of Measurement"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!unitForm.name.trim() || !unitForm.abbreviation.trim()) return;
            saveUnits([...units, { id: Date.now(), name: unitForm.name.trim(), abbreviation: unitForm.abbreviation.trim(), active: true }]);
            setIsUnitModalOpen(false);
            showToast(`Unit "${unitForm.name}" created.`);
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Unit Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Kilograms"
              value={unitForm.name}
              onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Abbreviation *</label>
            <input
              type="text"
              placeholder="e.g. Kg"
              value={unitForm.abbreviation}
              onChange={(e) => setUnitForm({ ...unitForm, abbreviation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsUnitModalOpen(false)}>Cancel</Button>
            <button type="submit" className="px-4 py-1.5 rounded bg-[#16A34A] text-white font-bold text-xs">Create Unit</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD BRAND */}
      <Modal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        title="Add Product Brand"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!brandForm.name.trim()) return;
            saveBrands([...brands, { id: Date.now(), name: brandForm.name.trim(), code: brandForm.code.trim(), active: true }]);
            setIsBrandModalOpen(false);
            showToast(`Brand "${brandForm.name}" created.`);
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
            <input
              type="text"
              placeholder="e.g. DAIKIN"
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Brand Code</label>
            <input
              type="text"
              placeholder="e.g. DAIK"
              value={brandForm.code}
              onChange={(e) => setBrandForm({ ...brandForm, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsBrandModalOpen(false)}>Cancel</Button>
            <button type="submit" className="px-4 py-1.5 rounded bg-[#16A34A] text-white font-bold text-xs">Create Brand</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CATEGORY */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Product Category"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!categoryForm.name.trim()) return;
            saveCategories([...categories, { id: Date.now(), name: categoryForm.name.trim(), code: categoryForm.code.trim(), active: true }]);
            setIsCategoryModalOpen(false);
            showToast(`Category "${categoryForm.name}" created.`);
          }}
          className="space-y-3 pt-2 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. CHILLER SYSTEMS"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Code</label>
            <input
              type="text"
              placeholder="e.g. CAT-CHL"
              value={categoryForm.code}
              onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <button type="submit" className="px-4 py-1.5 rounded bg-[#16A34A] text-white font-bold text-xs">Create Category</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
