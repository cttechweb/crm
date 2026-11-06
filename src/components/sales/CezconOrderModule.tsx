'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ThumbsUp,
  ShoppingCart,
  Plus,
  X,
  XCircle,
  ChevronDown,
  Calendar,
  Clock,
  Search,
  Shield,
  User,
  Phone,
  Info,
  Settings,
  Eye,
  Edit2,
  Trash2,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
  Check,
  HelpCircle,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Scissors,
  Copy,
  FileText,
  Link2,
  ImageIcon,
  Maximize2,
  List,
  ListOrdered,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Package,
  MapPin,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { validateCustomerPhone } from '@/lib/phoneValidation';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { CrmSalesOrder, CrmCustomer } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';
import { CezconDateInput } from '@/components/ui/CezconDateInput';
import { CezconTimeInput } from '@/components/ui/CezconTimeInput';
import { getLiveProducts } from '@/services/productApiService';
import type { ProductSettingItem } from '@/types/settings';

const COUNTRY_CODES_LIST = [
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', placeholder: '33 123 456' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', placeholder: '91 123 456' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', placeholder: '39 123 456' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', placeholder: '91 234 567' },
  { code: '+91', country: 'India', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', placeholder: '300 1234567' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', placeholder: '10 1234 5678' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', placeholder: '7 9012 3456' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', placeholder: '70 123 456' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', placeholder: '202 555 0123' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', placeholder: '151 1234567' },
  { code: '+33', country: 'France', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', placeholder: '612 345 678' },
  { code: '+86', country: 'China', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', placeholder: '8123 4567' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', placeholder: '12 345 6789' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', placeholder: '917 123 4567' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', placeholder: '1712 345678' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', placeholder: '71 234 5678' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', placeholder: '984 1234567' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', placeholder: '532 123 4567' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', placeholder: '82 123 4567' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', placeholder: '802 123 4567' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', placeholder: '712 345678' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', placeholder: '21 123 4567' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { code: '+7', country: 'Russia / Kazakhstan', flag: '🇷🇺', placeholder: '912 345 6789' },
];

interface OrderItemRow {
  id: string;
  description: string;
  additionalDescription?: string;
  showAdditional?: boolean;
  code: string;
  unit: string;
  brand: string;
  qty: number;
  price: number;
  total: number;
}

export function CezconOrderModule() {
  const {
    salesOrders,
    addSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    customers,
    addCustomer,
    salesOpportunities,
    addOpportunity,
    users,
    leads,
    quotations,
  } = useEnterpriseCrm();

  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;

  // Role check: Only Sales Managers, CSO, COO, and CEO have commercial sales order approval authority.
  // Operations Managers, Purchase Officers, and Sales Executives cannot approve commercial customer orders.
  const isSalesManagerOrAdmin = useMemo(() => {
    if (!currentUser) return false;
    const role = (currentUser.role || '').toLowerCase();
    const pos = (currentUser.position || '').toLowerCase();
    const des = (currentUser.designation || '').toLowerCase();
    const dept = (currentUser.department || '').toLowerCase();
    const mgrType = (currentUser.managerType || '').toLowerCase();

    // 1. Executive Management (CEO, COO, Super Admin, Admin) always retain top-level governance
    const isExecutive =
      role === 'super_admin' ||
      role === 'admin' ||
      pos.includes('ceo') ||
      pos.includes('coo') ||
      des.includes('ceo') ||
      des.includes('coo');

    if (isExecutive) return true;

    // 2. Explicitly EXCLUDE non-sales departments (Operations, Purchase, Logistics, etc.)
    const isNonSalesDept =
      pos.includes('operation') ||
      des.includes('operation') ||
      dept.includes('operation') ||
      mgrType.includes('operation') ||
      pos.includes('purchase') ||
      des.includes('purchase') ||
      dept.includes('purchase') ||
      mgrType.includes('purchase');

    if (isNonSalesDept) {
      return false; // Operations and Purchase cannot commercially approve sales orders
    }

    // 3. Must be in Sales Leadership (Sales Manager, CSO, Head of Sales)
    const isSalesLeadership =
      pos.includes('sales manager') ||
      des.includes('sales manager') ||
      mgrType.includes('sales') ||
      pos.includes('cso') ||
      des.includes('cso') ||
      (dept.includes('sales') && (role === 'manager' || pos.includes('manager') || pos.includes('head')));

    return isSalesLeadership;
  }, [currentUser]);

  // Check if current user is from Operations (e.g. Fahad - Operation Manager / Technical Staff)
  const isOperationsStaff = useMemo(() => {
    if (!currentUser) return false;
    const pos = (currentUser.position || '').toLowerCase();
    const des = (currentUser.designation || '').toLowerCase();
    const dept = (currentUser.department || '').toLowerCase();
    const mgrType = (currentUser.managerType || '').toLowerCase();
    return (
      pos.includes('operation') ||
      des.includes('operation') ||
      dept.includes('operation') ||
      mgrType.includes('operation')
    );
  }, [currentUser]);

  // Check if current user is the sales rep / creator who raised this order
  // Business Rule: Sales Managers (Arafath) only review & approve/reject orders.
  // The Material Request (MSRF) must be generated by the user who created the sales order (e.g. Tariq).
  const isOrderCreator = useMemo(() => {
    return (order?: CrmSalesOrder | null) => {
      if (!order || !currentUser) return false;
      const pos = (currentUser.position || '').toLowerCase();
      const des = (currentUser.designation || '').toLowerCase();
      const mgrType = (currentUser.managerType || '').toLowerCase();

      // Sales Managers cannot generate Material Requests
      const isSalesManager =
        pos.includes('sales manager') ||
        des.includes('sales manager') ||
        mgrType.includes('sales');

      if (isSalesManager) return false;

      const currentUserName = (currentUser.name || '').toLowerCase().trim();
      const currentUserEmail = (currentUser.email || '').toLowerCase().trim();
      const orderOwnerName = (order.owner || '').toLowerCase().trim();
      const orderAssigned = (order.assignedTo || '').toLowerCase().trim();

      if (!orderOwnerName) {
        return !isSalesManager;
      }

      return (
        currentUserName === orderOwnerName ||
        orderOwnerName.includes(currentUserName) ||
        currentUserName.includes(orderOwnerName) ||
        currentUserEmail.startsWith(orderOwnerName) ||
        currentUserName === orderAssigned
      );
    };
  }, [currentUser]);

  // View state: 'table' (Image 2) or 'create' / 'edit' (Image 1)
  const [viewMode, setViewMode] = useState<'table' | 'create' | 'edit'>('table');
  const [orderToEdit, setOrderToEdit] = useState<CrmSalesOrder | null>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<CrmSalesOrder | null>(null);
  const [actionDropdownTarget, setActionDropdownTarget] = useState<{
    order: CrmSalesOrder;
    top: number;
    right: number;
  } | null>(null);

  // Table filters & pagination (Image 2)
  const [subTab, setSubTab] = useState<string>('all');
  const [orderFilterOwner, setOrderFilterOwner] = useState<string>('All');
  const [orderFilterOpp, setOrderFilterOpp] = useState<string>('All');
  const [orderFilterCampaign, setOrderFilterCampaign] = useState<string>('All');
  const [orderFilterCustomer, setOrderFilterCustomer] = useState<string>('All');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');
  const [orderFilterType, setOrderFilterType] = useState<string>('All');
  const [orderFilterInvoiceStatus, setOrderFilterInvoiceStatus] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Quick Customer modal toggle inside form
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerContactPerson, setQuickCustomerContactPerson] = useState('');
  const [quickCustomerPhoneCode, setQuickCustomerPhoneCode] = useState('+971');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickCustomerEmail, setQuickCustomerEmail] = useState('');
  const [quickCustomerLocation, setQuickCustomerLocation] = useState('');
  const [isQuickCustomerCodeDropdownOpen, setIsQuickCustomerCodeDropdownOpen] = useState(false);
  const [quickCustomerCodeSearch, setQuickCustomerCodeSearch] = useState('');
  const [isQuickSavingCustomer, setIsQuickSavingCustomer] = useState(false);
  const [quickCustomerPhoneTouched, setQuickCustomerPhoneTouched] = useState(false);

  const phoneValidation = useMemo(() => {
    return validateCustomerPhone(quickCustomerPhone, quickCustomerPhoneCode, false);
  }, [quickCustomerPhone, quickCustomerPhoneCode]);

  const selectedCountryObj = useMemo(() => {
    return COUNTRY_CODES_LIST.find((c) => c.code === quickCustomerPhoneCode) || COUNTRY_CODES_LIST[0];
  }, [quickCustomerPhoneCode]);

  const filteredCountryCodes = useMemo(() => {
    if (!quickCustomerCodeSearch.trim()) return COUNTRY_CODES_LIST;
    const q = quickCustomerCodeSearch.toLowerCase();
    return COUNTRY_CODES_LIST.filter(
      (c) => c.country.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [quickCustomerCodeSearch]);

  // E-Commerce Catalog state for Line Items auto-fill
  const [catalogProducts, setCatalogProducts] = useState<ProductSettingItem[]>([]);
  const [dropdownTarget, setDropdownTarget] = useState<{
    rowIndex: number;
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState('');

  // Fetch e-commerce products
  useEffect(() => {
    let active = true;
    getLiveProducts({ limit: 1000 })
      .then((res) => {
        if (active && res?.products) {
          setCatalogProducts(res.products);
        }
      })
      .catch((err) => {
        console.error('Error fetching live products in CezconOrderModule:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ecommerce-product-dropdown') && !target.closest('.ecommerce-description-input')) {
        setDropdownTarget(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownTarget(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // -------------------------------------------------------------
  // FORM FIELDS STATE (Exact Cezcon "Add Order" - Image 1)
  // -------------------------------------------------------------
  // Left Column
  const [customerName, setCustomerName] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [source, setSource] = useState('Select Source');
  const [orderDate, setOrderDate] = useState('14-10-2026');
  const [orderTime, setOrderTime] = useState('01:01 PM');
  const [vatType, setVatType] = useState<'With VAT' | 'Without VAT' | 'Zero VAT'>('With VAT');
  const [orderTags, setOrderTags] = useState('');
  const [businessOpportunity, setBusinessOpportunity] = useState('Select Business Opportunity');
  const [lpoNumber, setLpoNumber] = useState('');
  const [location, setLocation] = useState('');
  const [orderType, setOrderType] = useState('Select Type');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  // Right Column
  const [orderOwner, setOrderOwner] = useState(currentUser?.name || '');
  const [isQuickAddOwnerOpen, setIsQuickAddOwnerOpen] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [customOwners, setCustomOwners] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem('cezcon_opportunity_owners') ||
          localStorage.getItem('crm_opportunity_owners');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const LEGACY_MOCKS = new Set(['nafal', 'shaheer', 'mohammed ishaq', 'super admin']);
            return parsed.filter((name: string) => !LEGACY_MOCKS.has(String(name).toLowerCase().trim()));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const handleQuickAddOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName.trim()) return;
    const name = newOwnerName.trim();
    if (!customOwners.includes(name)) {
      const updated = [...customOwners, name];
      setCustomOwners(updated);
      try {
        localStorage.setItem('cezcon_opportunity_owners', JSON.stringify(updated));
        localStorage.setItem('crm_opportunity_owners', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setOrderOwner(name);
    setNewOwnerName('');
    setIsQuickAddOwnerOpen(false);
    showToast(`Owner "${name}" added and selected!`);
  };

  // Quick Add Source State
  const [isQuickAddSourceOpen, setIsQuickAddSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [customSources, setCustomSources] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_order_sources');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ['Direct', 'Website', 'Google', 'LinkedIn', 'Referral', 'Cold Call', 'WhatsApp'];
  });

  const handleQuickAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSourceName.trim();
    if (!val) return;
    if (!customSources.includes(val)) {
      const updated = [...customSources, val];
      setCustomSources(updated);
      try {
        localStorage.setItem('crm_order_sources', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setSource(val);
    setNewSourceName('');
    setIsQuickAddSourceOpen(false);
    showToast(`Source "${val}" added and selected!`);
  };

  // Quick Add Business Opportunity State
  const [isQuickAddBizOppOpen, setIsQuickAddBizOppOpen] = useState(false);
  const [newBizOppTitle, setNewBizOppTitle] = useState('');
  const [newBizOppCustomer, setNewBizOppCustomer] = useState('');
  const [newBizOppAmount, setNewBizOppAmount] = useState<number | ''>('');

  const handleQuickAddBizOpp = (e: React.FormEvent) => {
    e.preventDefault();
    const titleVal = newBizOppTitle.trim();
    if (!titleVal) return;

    const randNum = Math.floor(7200 + Math.random() * 100);
    const oppCode = `CTEQ#${randNum}`;
    const custVal = newBizOppCustomer.trim() || customerName || 'Direct Customer';
    const amtVal = Number(newBizOppAmount) || 0;

    const newOpp = {
      opportunityCode: oppCode,
      title: titleVal,
      customer: custVal,
      amount: amtVal,
      stage: 'Opportunity' as const,
      probability: 50,
      owner: orderOwner || currentUser?.name || 'Super Admin',
      expectedClose: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    if (addOpportunity) {
      addOpportunity(newOpp);
    }

    const label = `${oppCode} - ${titleVal}`;
    setBusinessOpportunity(label);
    setOpportunityNumber(oppCode);
    setNewBizOppTitle('');
    setNewBizOppCustomer('');
    setNewBizOppAmount('');
    setIsQuickAddBizOppOpen(false);
    showToast(`Business Opportunity "${titleVal}" created and selected!`);
  };

  // Quick Add Point of Contact State
  const [isQuickAddContactOpen, setIsQuickAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [customContacts, setCustomContacts] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_order_contacts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return ['Main Office', 'Project Site Manager', 'Procurement Head'];
  });

  const handleQuickAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newContactName.trim();
    if (!val) return;
    if (!customContacts.includes(val)) {
      const updated = [...customContacts, val];
      setCustomContacts(updated);
      try {
        localStorage.setItem('crm_order_contacts', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    setPointOfContact(val);
    setContactPerson(val);
    setNewContactName('');
    setNewContactPhone('');
    setIsQuickAddContactOpen(false);
    showToast(`Point of Contact "${val}" added and selected!`);
  };
  const [pointOfContact, setPointOfContact] = useState('Select Customer First');
  const [sourceName, setSourceName] = useState('');
  const [orderNumber, setOrderNumber] = useState(`CTSO#${Math.floor(3900 + Math.random() * 100)}`);
  const [commercialOfferNumber, setCommercialOfferNumber] = useState('');
  const [opportunityNumber, setOpportunityNumber] = useState('');
  const [leadNumber, setLeadNumber] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [manualDiscountAmount, setManualDiscountAmount] = useState<number | string>('');
  const [vatRate, setVatRate] = useState<number>(5);
  const [adjustment, setAdjustment] = useState<number | string>('');
  const [campaign, setCampaign] = useState('Select Campaign');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [lpoDate, setLpoDate] = useState('');
  const [comments, setComments] = useState('');
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [reference, setReference] = useState('');

  // Middle Line Items Section (Order Form)
  const [isOrderFormActive, setIsOrderFormActive] = useState(false);
  const [manualAmount, setManualAmount] = useState<number | string>('');
  const [lineItems, setLineItems] = useState<OrderItemRow[]>([
    {
      id: 'item_1',
      description: '',
      additionalDescription: '',
      showAdditional: false,
      code: '',
      unit: 'Pcs',
      brand: '',
      qty: 1,
      price: 0,
      total: 0,
    },
  ]);

  // Terms & Conditions and Editor
  const DEFAULT_TERMS_TEMPLATES: Record<string, string> = {
    'Standard 30-Day Payment Terms': `1. Payment Terms: 30 days from invoice date.\n2. Delivery: 3 to 5 working days from receipt of confirmed LPO.\n3. Warranty: 12 months standard warranty against manufacturing defects.\n4. Quotation Validity: 30 calendar days from issue date.\n5. VAT: 5% applicable as per UAE Federal Tax Authority regulations.`,
    'HVAC Supply & Commissioning Terms': `1. Payment: 50% advance with LPO, 40% on delivery to site, 10% upon successful testing and commissioning.\n2. Site power, water and access facilities to be provided by client.\n3. 5-year warranty on compressors, 1-year warranty on electronic components.\n4. Balancing and air volume test reports will be handed over on completion.`,
    'Cash on Delivery (COD)': `1. Payment Terms: 100% Cash or Cheque upon delivery.\n2. Delivery: Immediate upon confirmation.\n3. Warranty: 12 months standard manufacturer warranty.\n4. VAT: 5% included.`,
    '50% Advance 50% on Completion': `1. Payment Terms: 50% advance along with LPO, 50% upon installation and testing.\n2. Delivery Period: 7 to 10 working days.\n3. Warranty: 1 year comprehensive warranty.\n4. For COOL TECHNOLOGIES.`,
    'Supply & Delivery Terms': `1. Scope: Supply of equipment to customer site within Dubai/Sharjah.\n2. Offloading by client at site.\n3. Inspection within 48 hours of delivery.\n4. Standard warranty terms apply.`,
    'Annual Maintenance Contract (AMC)': `1. 4 comprehensive quarterly preventive maintenance visits.\n2. Emergency breakdown callout response within 4 hours SLA.\n3. Consumable filters and belt replacements included.\n4. Invoiced quarterly in advance.`,
  };

  const [termsTemplates, setTermsTemplates] = useState<Record<string, string>>(DEFAULT_TERMS_TEMPLATES);
  const [selectedTermsPreset, setSelectedTermsPreset] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [isAddTermsModalOpen, setIsAddTermsModalOpen] = useState(false);
  const [newTermsTitle, setNewTermsTitle] = useState('');
  const [newTermsContent, setNewTermsContent] = useState('');
  const [orderToast, setOrderToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setOrderToast(msg);
    setTimeout(() => setOrderToast(null), 3000);
  };

  // Live synchronization of selected order for the view modal
  const activeViewOrder = useMemo(() => {
    if (!selectedOrderForView) return null;
    return salesOrders?.find((o) => o.id === selectedOrderForView.id) || selectedOrderForView;
  }, [salesOrders, selectedOrderForView]);

  const handleApproveFromModal = (order: CrmSalesOrder) => {
    updateSalesOrder(order.id, { status: 'Approved' });
    setSelectedOrderForView((prev) => (prev ? { ...prev, status: 'Approved' } : null));
    showToast(`Order ${order.orderNumber} Approved by Sales Management! Handed off to Operations.`);
  };

  const handleRejectFromModal = (order: CrmSalesOrder) => {
    if (confirm(`Are you sure you want to reject Order ${order.orderNumber}?`)) {
      updateSalesOrder(order.id, { status: 'Cancelled' });
      setSelectedOrderForView((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      showToast(`Order ${order.orderNumber} Rejected`);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cezcon_saved_terms_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setTermsTemplates((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLoadTerms = () => {
    if (selectedTermsPreset && termsTemplates[selectedTermsPreset]) {
      const content = termsTemplates[selectedTermsPreset];
      setTermsContent((prev) => {
        if (!prev || !prev.trim()) {
          return content;
        }
        return `${prev.trim()}\n\n${content}`;
      });
      showToast(`Added "${selectedTermsPreset}" to editor`);
    } else if (!selectedTermsPreset) {
      showToast('Please select a Terms & Conditions template');
    }
  };

  const handleClearTerms = () => {
    setSelectedTermsPreset('');
    setTermsContent('');
    showToast('Terms & Conditions cleared');
  };

  const handleDeleteTerms = (titleToDelete?: string) => {
    const target = titleToDelete || selectedTermsPreset;
    if (!target) {
      showToast('Please select a Terms & Conditions template to delete');
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm(`Are you sure you want to delete "${target}"?`)) {
      return;
    }

    const updated = { ...termsTemplates };
    delete updated[target];
    setTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (selectedTermsPreset === target) {
      setSelectedTermsPreset('');
    }
    showToast(`Deleted Terms & Conditions template "${target}"`);
  };

  const handleSaveNewTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermsTitle.trim() || !newTermsContent.trim()) return;

    const title = newTermsTitle.trim();
    const updated = { ...termsTemplates, [title]: newTermsContent };
    setTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSelectedTermsPreset(title);
    setTermsContent((prev) => {
      if (!prev || !prev.trim()) {
        return newTermsContent;
      }
      return `${prev.trim()}\n\n${newTermsContent}`;
    });
    setIsAddTermsModalOpen(false);
    setNewTermsTitle('');
    setNewTermsContent('');
    showToast(`New terms template "${title}" added to editor!`);
  };

  const handleAddAnotherTerm = () => {
    if (!newTermsTitle.trim() || !newTermsContent.trim()) return;

    const title = newTermsTitle.trim();
    const updated = { ...termsTemplates, [title]: newTermsContent };
    setTermsTemplates(updated);

    try {
      localStorage.setItem('cezcon_saved_terms_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSelectedTermsPreset(title);
    setTermsContent((prev) => {
      if (!prev || !prev.trim()) {
        return newTermsContent;
      }
      return `${prev.trim()}\n\n${newTermsContent}`;
    });
    setNewTermsTitle('');
    setNewTermsContent('');
    showToast(`Added "${title}" to editor! Ready for next term.`);
  };

  // Calculated Order Totals (Dynamically supports both enabled Order Form items or top Amount)
  const itemsTotalAmount = useMemo(() => {
    return lineItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [lineItems]);

  const effectiveAmount = isOrderFormActive ? itemsTotalAmount : (parseFloat(String(manualAmount)) || 0);

  const calculatedDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return (effectiveAmount * discountPercent) / 100;
    }
    return parseFloat(String(manualDiscountAmount)) || 0;
  }, [effectiveAmount, discountPercent, manualDiscountAmount]);

  const amountAfterDiscount = useMemo(() => {
    return Math.max(0, effectiveAmount - calculatedDiscount);
  }, [effectiveAmount, calculatedDiscount]);

  const calculatedVatAmount = useMemo(() => {
    if (vatType === 'With VAT') {
      return (amountAfterDiscount * (vatRate || 5)) / 100;
    }
    return 0;
  }, [amountAfterDiscount, vatType, vatRate]);

  const subTotal = useMemo(() => {
    return amountAfterDiscount + calculatedVatAmount;
  }, [amountAfterDiscount, calculatedVatAmount]);

  const grandTotalAmount = useMemo(() => {
    return subTotal + (parseFloat(String(adjustment)) || 0);
  }, [subTotal, adjustment]);

  // Helper to open create form
  const handleOpenCreate = () => {
    setOrderToEdit(null);
    setCustomerName('');
    setOrderTitle('');
    setSource('Select Source');
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    setOrderDate(`${day}-${month}-${year}`);
    setOrderTime('01:01 PM');
    setVatType('With VAT');
    setOrderTags('');
    setBusinessOpportunity('Select Business Opportunity');
    setLpoNumber('');
    setLocation('');
    setOrderType('Select Type');
    setDeliveryMethod('');
    setContactPerson('');
    setOrderOwner(currentUser?.name || '');
    setPointOfContact('Select Customer First');
    setSourceName('');
    setOrderNumber(`CTSO#${Math.floor(3900 + Math.random() * 100)}`);
    setCommercialOfferNumber('');
    setOpportunityNumber('');
    setLeadNumber('');
    setDiscountPercent(0);
    setManualDiscountAmount('');
    setVatRate(5);
    setAdjustment('');
    setCampaign('Select Campaign');
    setDeliveryDate('');
    setLpoDate('');
    setComments('');
    setOrderStatus('Pending');
    setReference('');
    setManualAmount('');
    setIsOrderFormActive(false);
    setLineItems([
      {
        id: 'item_1',
        description: '',
        additionalDescription: '',
        showAdditional: false,
        code: '',
        unit: 'Pcs',
        brand: '',
        qty: 1,
        price: 0,
        total: 0,
      },
    ]);
    setSelectedTermsPreset('');
    setTermsContent('');
    setViewMode('create');
  };

  // Helper to open edit form
  const handleOpenEdit = (order: CrmSalesOrder) => {
    setOrderToEdit(order);
    setCustomerName(order.customer || '');
    setOrderTitle(order.subject || '');
    setOrderNumber(order.orderNumber || '');
    setOpportunityNumber(order.opportunityRef || '');
    setLeadNumber(order.leadNumber || '');
    setOrderDate(order.orderDate || '14-10-2026');
    setOrderTime((order as any).orderTime || '01:01 PM');
    setOrderOwner(order.owner || currentUser?.name || '');
    setContactPerson(order.contactPerson || '');
    setPointOfContact(order.contactPerson || order.customer || 'Select Customer First');
    setOrderStatus(order.status || 'Pending');
    setOrderType(order.category || 'Supply And Installation');
    setLpoNumber(order.poReference || (order as any).lpoNumber || '');
    setDeliveryDate((order as any).deliveryDate || order.deliveryDueDate || '');
    setLpoDate((order as any).lpoDate || '');
    setLocation((order as any).location || order.shippingAddress || order.billingAddress || '');
    setDeliveryMethod((order as any).deliveryMethod || '');
    setCommercialOfferNumber((order as any).quotationRef || (order as any).commercialOfferNumber || '');
    setOpportunityNumber(order.opportunityRef || '');
    setBusinessOpportunity((order as any).businessOpportunity || order.opportunityRef || 'Select Business Opportunity');
    setOrderTags((order as any).orderTags || '');
    setComments(order.notes || (order as any).comments || '');
    setReference((order as any).reference || '');
    setSource((order as any).source || 'Select Source');
    setSourceName((order as any).sourceName || '');
    setAdjustment((order as any).adjustment !== undefined && (order as any).adjustment !== 0 ? String((order as any).adjustment) : '');
    setVatRate(5);
    setVatType('With VAT');
    setManualAmount(order.amount !== undefined && order.amount !== 0 ? String(order.amount) : '');
    setIsOrderFormActive(Boolean(order.items && order.items.length > 0));

    if (order.items && order.items.length > 0) {
      setLineItems(
        order.items.map((it, idx) => ({
          id: it.id || `item_${idx + 1}`,
          description: it.productName || it.name || it.description || '',
          additionalDescription: it.description || '',
          showAdditional: false,
          code: it.sku || it.itemCode || '',
          unit: it.unit || 'Pcs',
          brand: (it as any).brand || '',
          qty: it.quantity || 1,
          price: it.unitPrice || 0,
          total: it.totalAmount || (it.quantity * it.unitPrice) || 0,
        }))
      );
    } else {
      const basePrice = order.amount || 0;
      setLineItems([
        {
          id: 'item_1',
          description: order.subject || 'Supply of AC Units & Materials',
          additionalDescription: '',
          showAdditional: false,
          code: 'AC-1001',
          unit: 'Pcs',
          brand: 'COOLTECH',
          qty: 1,
          price: basePrice,
          total: basePrice,
        },
      ]);
    }
    setSelectedTermsPreset('');
    setTermsContent(order.paymentTerms || '');
    setViewMode('edit');
  };

  // Customer selection auto-fill
  const handleCustomerSelect = (custName: string) => {
    setCustomerName(custName);
    if (!custName || custName === 'Select Customer') {
      setPointOfContact('Select Customer First');
      return;
    }
    const found = customers?.find(
      (c) => c.customerName?.toLowerCase() === custName.toLowerCase() || c.companyName?.toLowerCase() === custName.toLowerCase()
    );
    if (found) {
      if (found.contactPerson) setContactPerson(found.contactPerson);
      if (found.address) setLocation(found.address);
      setPointOfContact(found.contactPerson || custName);
    } else {
      setPointOfContact(custName);
    }
  };

  // Line Items Handlers
  const handleItemChange = (index: number, field: keyof OrderItemRow, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'price') {
      const q = field === 'qty' ? Number(value) || 0 : Number(item.qty) || 0;
      const p = field === 'price' ? Number(value) || 0 : Number(item.price) || 0;
      item.total = q * p;
    }
    updated[index] = item;
    setLineItems(updated);
  };

  const handleSelectProductForLineItem = (rowIndex: number, p: ProductSettingItem) => {
    const price = typeof p.sellingPrice === 'number' ? p.sellingPrice : (p as any).price || 0;
    const code = p.code || (p as any).sku || String(p.id || '');
    const brand = p.brand || '';
    const unit = p.unit || 'Pcs';

    setLineItems((prev) => {
      const copy = [...prev];
      const cur = copy[rowIndex] || {
        id: `item_${Date.now()}`,
        description: '',
        code: '',
        unit: 'Pcs',
        brand: '',
        qty: 1,
        price: 0,
        total: 0,
      };
      const qty = Number(cur.qty) || 1;
      copy[rowIndex] = {
        ...cur,
        description: p.name || cur.description,
        code: code,
        brand: brand,
        unit: unit,
        price: price,
        total: qty * price,
      };
      return copy;
    });

    setDropdownTarget(null);
    setDropdownSearchTerm('');
  };

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item_${Date.now()}_${lineItems.length + 1}`,
        description: '',
        additionalDescription: '',
        showAdditional: false,
        code: '',
        unit: 'Pcs',
        brand: '',
        qty: 1,
        price: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) {
      setLineItems([
        {
          id: 'item_1',
          description: '',
          additionalDescription: '',
          showAdditional: false,
          code: '',
          unit: 'Pcs',
          brand: '',
          qty: 1,
          price: 0,
          total: 0,
        },
      ]);
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Live dynamic Commercial Offers / Quotations from Context + LocalStorage
  const liveQuotations = useMemo(() => {
    let localQuotes: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_quotations_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localQuotes = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const map = new Map<string, any>();
    (quotations || []).forEach((q) => {
      const key = q.quotationNumber || q.id;
      if (key) map.set(key, q);
    });
    localQuotes.forEach((q) => {
      const key = q.quotationNumber || q.id;
      if (key && !map.has(key)) {
        map.set(key, q);
      }
    });
    return Array.from(map.values());
  }, [quotations]);

  // Commercial Offer Selection and Full Auto-Fill Engine
  const handleCommercialOfferSelect = (val: string) => {
    setCommercialOfferNumber(val);
    if (!val || val === 'None (Direct Order)') {
      setOpportunityNumber('');
      return;
    }

    // 1. Look for matching Commercial Offer (Quotation)
    const quote = liveQuotations.find(
      (q: any) => q.quotationNumber === val || q.id === val || (q.code && q.code === val)
    );

    if (quote) {
      // 1. Auto-fill Customer Name
      if (quote.customer) {
        setCustomerName(quote.customer);
      }

      // 2. Auto-fill Point of Contact / Contact Person
      const contactVal = quote.contactPerson || quote.contactName || quote.customer;
      if (contactVal) {
        setPointOfContact(contactVal);
        setContactPerson(quote.contactPerson || contactVal);
        if (!customContacts.includes(contactVal)) {
          setCustomContacts((prev) => [...prev, contactVal]);
        }
      }

      // 3. Auto-fill Order Title
      const title = quote.subject || quote.title || (quote as any).projectTitle || `Sales Order - ${quote.customer}`;
      setOrderTitle(title);

      // 4. Opportunity & Lead References
      if (quote.opportunityCode || quote.opportunityId) {
        setOpportunityNumber(quote.opportunityCode || quote.opportunityId || '');
        setBusinessOpportunity(quote.opportunityCode || '');
      } else {
        setOpportunityNumber(val);
        setBusinessOpportunity(val);
      }
      if (quote.leadNumber || (quote as any).leadId) {
        setLeadNumber(quote.leadNumber || (quote as any).leadId || '');
      }

      // 5. Commercial Financials
      const sub = Number(quote.subtotal || quote.grossAmount || (Number(quote.totalAmount || 0) / 1.05)) || 0;
      const disc = Number(quote.discountAmount || quote.discountTotal || 0);
      const vat = Number(quote.vatAmount || (sub * 0.05)) || 0;
      const tot = Number(quote.totalAmount || (sub - disc + vat)) || 0;

      setManualAmount(sub > 0 ? sub.toFixed(2) : '');
      setDiscountPercent(quote.discountPercent ? Number(quote.discountPercent) : 0);
      setManualDiscountAmount(disc > 0 ? disc.toFixed(2) : '');
      setVatRate(quote.vatRate ? Number(quote.vatRate) : 5);
      setVatType('With VAT');
      if ((quote as any).adjustment) {
        setAdjustment(String((quote as any).adjustment));
      }

      // 6. Owner
      if (quote.owner) {
        setOrderOwner(quote.owner);
      }

      // 7. Terms & Conditions
      if (quote.termsAndConditions || quote.notes) {
        setTermsContent(quote.termsAndConditions || quote.notes || '');
      }

      // 8. Auto-fill Quoted Line Items & Product Details
      const rawItems: any[] = quote.items || (quote as any).lineItems || [];
      if (rawItems && rawItems.length > 0) {
        const formattedItems: OrderItemRow[] = rawItems.map((it: any, idx: number) => {
          const qty = Number(it.quantity || it.qty || 1);
          const price = Number(it.unitPrice || it.rate || it.price || 0);
          const code = it.itemCode || it.sku || it.code || `PROD-${idx + 1}`;
          const brand = it.brand || '';
          const desc = it.name || it.productName || it.description || it.item || 'HVAC Equipment';
          return {
            id: `item_${Date.now()}_${idx}`,
            description: desc,
            additionalDescription: it.additionalDescription || it.specifications || '',
            showAdditional: false,
            code: code,
            unit: it.unit || 'Pcs',
            brand: brand,
            qty: qty,
            price: price,
            total: Number(it.totalAmount || it.lineTotal || it.total || (qty * price)),
          };
        });

        setLineItems(formattedItems);
        setIsOrderFormActive(true);

        const productDetailsSummary = formattedItems
          .map(
            (it) =>
              `Item: ${it.description}\nCode: ${it.code}\nQuantity: ${it.qty}\nBrand: ${it.brand || 'Standard'}\nUnit Price: ${it.price.toFixed(2)}`
          )
          .join('\n\n');
        setComments(productDetailsSummary);
      } else if (quote.notes) {
        setComments(quote.notes);
      }

      showToast(`Commercial Offer ${quote.quotationNumber} selected! Details populated.`);
      return;
    }

    // 2. Fallback to Opportunity selection if user chose an Opportunity directly
    handleOpportunitySelect(val);
  };

  // Opportunity selection and auto-fill engine
  const handleOpportunitySelect = (oppVal: string) => {
    setOpportunityNumber(oppVal);
    if (!oppVal || oppVal === 'Select Opportunity') return;

    const foundOpp = salesOpportunities?.find(
      (o) => o.opportunityCode === oppVal || o.id === oppVal || o.title === oppVal
    );

    if (foundOpp) {
      // 1. Auto-fill Lead Number
      let matchedLead = foundOpp.leadNumber || '';
      if (!matchedLead && foundOpp.createdFromLeadId) {
        const l = leads?.find((item) => item.id === foundOpp.createdFromLeadId);
        if (l?.leadNumber) matchedLead = l.leadNumber;
      }
      if (!matchedLead && foundOpp.customer) {
        const l = leads?.find(
          (item) => (item.contactDetails?.company && item.contactDetails.company.toLowerCase() === foundOpp.customer.toLowerCase()) ||
                    (item.contactDetails?.name && item.contactDetails.name.toLowerCase() === foundOpp.customer.toLowerCase()) ||
                    ((item as any).companyName && (item as any).companyName.toLowerCase() === foundOpp.customer.toLowerCase())
        );
        if (l?.leadNumber) matchedLead = l.leadNumber;
      }
      if (matchedLead) {
        setLeadNumber(matchedLead);
      }

      // 2. Auto-fill Customer and Contact Person
      if (foundOpp.customer) {
        setCustomerName(foundOpp.customer);
        const contactVal = foundOpp.contactPerson || foundOpp.customer;
        setPointOfContact(contactVal);
        setContactPerson(foundOpp.contactPerson || '');
        if (contactVal && !customContacts.includes(contactVal)) {
          setCustomContacts((prev) => [...prev, contactVal]);
        }
      }

      // 3. Auto-fill Order Title
      if (foundOpp.title) {
        setOrderTitle(foundOpp.title);
      }

      // 4. Financials (Amount, VAT, Discount)
      if (foundOpp.amount && foundOpp.amount > 0) {
        setManualAmount(String(foundOpp.amount));
      }
      if (foundOpp.discount) {
        setManualDiscountAmount(String(foundOpp.discount));
      }
      if (foundOpp.vatRate) {
        setVatRate(Number(foundOpp.vatRate) || 5);
      }
      if (foundOpp.vatType) {
        setVatType(foundOpp.vatType as any);
      }
      if (foundOpp.adjustment) {
        setAdjustment(String(foundOpp.adjustment));
      }

      // 5. Source & Campaign
      if (foundOpp.source && foundOpp.source !== 'Select Source') {
        if (!customSources.includes(foundOpp.source)) {
          setCustomSources((prev) => [...prev, foundOpp.source!]);
        }
        setSource(foundOpp.source);
      }
      if (foundOpp.sourceName) {
        setSourceName(foundOpp.sourceName);
      }
      if (foundOpp.campaign && foundOpp.campaign !== 'Select Campaign') {
        setCampaign(foundOpp.campaign);
      }

      // 6. Location, Owner & Type
      if (foundOpp.location) {
        setLocation(foundOpp.location);
      }
      if (foundOpp.owner) {
        setOrderOwner(foundOpp.owner);
      }
      if (foundOpp.type && foundOpp.type !== 'Select Type') {
        setOrderType(foundOpp.type);
      }
      if (foundOpp.deliveryMethod) {
        setDeliveryMethod(foundOpp.deliveryMethod);
      }
      if (foundOpp.lpoNumber) {
        setLpoNumber(foundOpp.lpoNumber);
      }

      // 7. Business Opportunity sync
      setBusinessOpportunity(`${foundOpp.opportunityCode} - ${foundOpp.title}`);
    }
  };

  const handleLeadSelect = (leadVal: string) => {
    setLeadNumber(leadVal);
    if (!leadVal || leadVal === 'Select Lead Number') return;

    const foundLead = leads?.find((l) => l.leadNumber === leadVal || l.id === leadVal);
    if (foundLead) {
      const compName = foundLead.contactDetails?.company || (foundLead as any).companyName || foundLead.contactDetails?.name || '';
      if (compName) {
        setCustomerName(compName);
      }
      const cp = foundLead.contactDetails?.name || (foundLead as any).contactPerson || '';
      if (cp) {
        setPointOfContact(cp);
        setContactPerson(cp);
        if (!customContacts.includes(cp)) {
          setCustomContacts((prev) => [...prev, cp]);
        }
      }
      if (foundLead.value && foundLead.value > 0 && !manualAmount) {
        setManualAmount(String(foundLead.value));
      }
      if (foundLead.source && foundLead.source !== 'Select Source') {
        if (!customSources.includes(foundLead.source)) {
          setCustomSources((prev) => [...prev, foundLead.source]);
        }
        setSource(foundLead.source);
      }
      if (foundLead.sourceName) {
        setSourceName(foundLead.sourceName);
      }
      if (foundLead.campaign && foundLead.campaign !== 'Select Campaign') {
        setCampaign(foundLead.campaign);
      }
      if (foundLead.location) {
        setLocation(foundLead.location);
      }
    }
  };

  // URL Query param auto-fill when navigating from opportunity or lead
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const quoteParam = params.get('quotationNumber') || params.get('quoteId') || params.get('quoteNumber') || params.get('offer');
      const oppParam = params.get('oppId') || params.get('opportunityId') || params.get('oppCode');
      const leadParam = params.get('leadNumber') || params.get('leadId');

      if (quoteParam && liveQuotations.length > 0) {
        handleCommercialOfferSelect(quoteParam);
        setViewMode('create');
      } else if (oppParam && salesOpportunities && salesOpportunities.length > 0) {
        handleOpportunitySelect(oppParam);
        setViewMode('create');
      } else if (leadParam && leads && leads.length > 0) {
        handleLeadSelect(leadParam);
        setViewMode('create');
      }
    }
  }, [salesOpportunities, leads]);

  // Submit Order Form (Image 1)
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || customerName === 'Select Customer') {
      alert('Please select a Customer Name');
      return;
    }
    if (!orderTitle.trim()) {
      alert('Please enter an Order Title');
      return;
    }

    let parsedItemsFromComments: any[] | undefined = undefined;
    if (!isOrderFormActive && comments.trim()) {
      const itemMatch = comments.match(/(?:Item|Product)\s*:\s*([^\r\n]+)/i);
      const codeMatch = comments.match(/(?:Code|SKU|SKU\s*\/\s*Code)\s*:\s*([^\r\n]+)/i);
      const qtyMatch = comments.match(/(?:Quantity|Qty)\s*:\s*(\d+)/i);
      const brandMatch = comments.match(/Brand\s*:\s*([^\r\n]+)/i);
      const unitMatch = comments.match(/Unit\s*:\s*([^\r\n]+)/i);
      const priceMatch = comments.match(/(?:Unit\s*Price|Price|Rate|Cost)\s*:\s*(?:AED)?\s*([0-9,.]+)/i);

      if (itemMatch || codeMatch) {
        const desc = itemMatch ? itemMatch[1].trim() : (orderTitle.trim() || comments.split('\n')[0].replace(/^item:\s*/i, '').trim());
        const code = codeMatch ? codeMatch[1].trim() : (desc.toLowerCase().includes('cassette') ? 'OGEN-30-CAS' : 'AC-GEN-01');
        const brand = brandMatch ? brandMatch[1].trim() : (desc.toLowerCase().includes('o general') ? 'O GENERAL / COOLTECH' : '');
        const unit = unitMatch ? unitMatch[1].trim() : 'Pcs';
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        let unitRate = Number(effectiveAmount) || 0;
        if (priceMatch) {
          const parsedRate = parseFloat(priceMatch[1].replace(/,/g, ''));
          if (!isNaN(parsedRate) && parsedRate > 0) {
            unitRate = parsedRate;
          }
        }
        parsedItemsFromComments = [
          {
            id: `item_${Date.now()}`,
            productId: code,
            itemCode: code,
            sku: code,
            name: desc,
            productName: desc,
            description: desc,
            brand: brand,
            quantity: qty > 0 ? qty : 1,
            unit: unit,
            unitPrice: unitRate,
            taxRate: 5,
            taxAmount: (unitRate * qty * 5) / 100,
            totalAmount: unitRate * qty,
          },
        ];
      }
    }

    const orderData: Partial<CrmSalesOrder> = {
      orderNumber,
      opportunityRef: opportunityNumber,
      quotationRef: commercialOfferNumber || (orderToEdit as any)?.quotationRef || '',
      leadNumber,
      subject: orderTitle.trim(),
      customer: customerName,
      contactPerson,
      orderDate,
      category: orderType !== 'Select Type' ? orderType : 'Supply And Installation',
      owner: orderOwner,
      status: orderStatus,
      amount: effectiveAmount,
      vatAmount: calculatedVatAmount,
      totalAmount: grandTotalAmount,
      receivable: grandTotalAmount,
      poReference: lpoNumber,
      paymentTerms: termsContent,
      notes: comments,
      items: isOrderFormActive
        ? lineItems.filter((i) => i.description.trim()).map((i) => ({
            id: i.id,
            productId: i.code,
            itemCode: i.code,
            sku: i.code,
            name: i.description,
            productName: i.description,
            description: i.additionalDescription || i.description,
            quantity: i.qty,
            unit: i.unit,
            unitPrice: i.price,
            taxRate: 5,
            taxAmount: (i.total * 5) / 100,
            totalAmount: i.total,
          }))
        : parsedItemsFromComments,
    };

    (orderData as any).deliveryDate = deliveryDate;
    (orderData as any).lpoDate = lpoDate;
    (orderData as any).location = location;
    (orderData as any).deliveryMethod = deliveryMethod;
    (orderData as any).businessOpportunity = businessOpportunity;

    if (orderToEdit) {
      updateSalesOrder(orderToEdit.id, orderData);
      alert(`Order ${orderNumber} updated successfully!`);
    } else {
      addSalesOrder(orderData as any);
      alert(`Order ${orderNumber} created successfully!`);
    }

    setViewMode('table');
  };

  // Quick Customer Add
  const handleSaveQuickCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = quickCustomerName.trim();
    if (!trimmedName) {
      alert('Validation Error: Please enter Customer or Company Name.');
      return;
    }

    setQuickCustomerPhoneTouched(true);
    if (quickCustomerPhone.trim()) {
      const v = validateCustomerPhone(quickCustomerPhone, quickCustomerPhoneCode, false);
      if (!v.isValid) {
        alert(`Phone Validation Error: ${v.message}`);
        return;
      }
    }

    setIsQuickSavingCustomer(true);

    const formattedPhone = quickCustomerPhone.trim()
      ? `${quickCustomerPhoneCode} ${quickCustomerPhone.trim()}`
      : `${quickCustomerPhoneCode} 50 000 0000`;

    const generatedEmail = quickCustomerEmail.trim() || `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
    const resolvedContact = quickCustomerContactPerson.trim() || trimmedName;

    const newCustomerPayload: any = {
      customerName: trimmedName,
      companyName: trimmedName,
      contactPerson: resolvedContact,
      phone: formattedPhone,
      mobile: formattedPhone,
      email: generatedEmail,
      owner: orderOwner || currentUser?.name || 'Cool Admin',
      status: 'Active',
      type: 'Customer',
      date: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      assignedDate: new Date().toISOString().split('T')[0],
    };

    try {
      if (addCustomer) {
        await addCustomer(newCustomerPayload);
      }
    } catch (err) {
      console.error('Failed to add customer to database:', err);
    }

    // Immediately select this new customer in the current form
    setCustomerName(trimmedName);
    setPointOfContact(resolvedContact);
    setContactPerson(resolvedContact);
    if (!customContacts.includes(resolvedContact)) {
      setCustomContacts((prev) => [...prev, resolvedContact]);
    }
    if (quickCustomerLocation.trim()) {
      setLocation(quickCustomerLocation.trim());
    }

    setIsQuickCustomerModalOpen(false);
    setQuickCustomerName('');
    setQuickCustomerContactPerson('');
    setQuickCustomerPhone('');
    setQuickCustomerPhoneTouched(false);
    setQuickCustomerEmail('');
    setQuickCustomerLocation('');
    setIsQuickCustomerCodeDropdownOpen(false);
    setIsQuickSavingCustomer(false);
    showToast(`Customer "${trimmedName}" added and selected!`);
  };

  // Filtered orders list for table view (Image 2)
  const filteredOrders = useMemo(() => {
    return (salesOrders || []).filter((o) => {
      // Subtab filter
      if (subTab !== 'all') {
        const cat = (o.category || '').toLowerCase();
        if (subTab === 'fitout' && !cat.includes('fit')) return false;
        if (subTab === 'supply' && !cat.includes('supply')) return false;
        if (subTab === 'installation' && !cat.includes('install')) return false;
        if (subTab === 'projects' && !cat.includes('project')) return false;
      }
      // Top row filters
      if (orderFilterOwner !== 'All' && o.owner !== orderFilterOwner) return false;
      if (orderFilterStatus !== 'All' && o.status !== orderFilterStatus) return false;
      if (orderFilterCustomer !== 'All' && o.customer !== orderFilterCustomer) return false;
      if (orderFilterType !== 'All' && o.category !== orderFilterType) return false;

      // Text search
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.toLowerCase().includes(q) ||
          o.subject?.toLowerCase().includes(q) ||
          o.opportunityRef?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    salesOrders,
    subTab,
    orderFilterOwner,
    orderFilterStatus,
    orderFilterCustomer,
    orderFilterType,
    orderSearch,
  ]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1;

  // Floating Fixed Dropdown Portal for Live E-Commerce Product Selection
  const renderProductDropdown = () => {
    if (!dropdownTarget) return null;
    const query = (dropdownSearchTerm || '').toLowerCase().trim();
    const matches = catalogProducts.filter((p: ProductSettingItem) => {
      if (!query) return true;
      const nameMatch = (p.name || '').toLowerCase().includes(query);
      const codeMatch = (p.code || (p as any).sku || String(p.id)).toLowerCase().includes(query);
      const brandMatch = (p.brand || '').toLowerCase().includes(query);
      return nameMatch || codeMatch || brandMatch;
    });

    return (
      <div
        style={{
          position: 'fixed',
          top: `${dropdownTarget.top}px`,
          left: `${dropdownTarget.left}px`,
          width: `${dropdownTarget.width}px`,
          maxHeight: '340px',
          zIndex: 99999,
        }}
        className="ecommerce-product-dropdown bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden flex flex-col text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header */}
        <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
            <Package className="w-4 h-4 text-blue-600" />
            <span>SELECT E-COMMERCE PRODUCT</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
              {catalogProducts.length} in catalog
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDropdownTarget(null)}
            className="w-5 h-5 rounded hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Box inside dropdown */}
        <div className="p-2 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={dropdownSearchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setDropdownSearchTerm(val);
                handleItemChange(dropdownTarget.rowIndex, 'description', val);
              }}
              placeholder="Search by title, SKU code, brand..."
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 pl-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              autoFocus
            />
            {dropdownSearchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDropdownSearchTerm('');
                  handleItemChange(dropdownTarget.rowIndex, 'description', '');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Product Items List */}
        <div className="overflow-y-auto max-h-[220px] divide-y divide-slate-100 bg-white">
          {matches.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-600 text-xs">No matching products found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try a different search keyword</p>
            </div>
          ) : (
            matches.slice(0, 100).map((p: ProductSettingItem) => {
              const price = typeof p.sellingPrice === 'number' ? p.sellingPrice : (p as any).price || 0;
              const code = p.code || (p as any).sku || String(p.id);
              return (
                <div
                  key={p.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectProductForLineItem(dropdownTarget.rowIndex, p);
                  }}
                  className="p-2.5 hover:bg-blue-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 text-xs truncate group-hover:text-blue-700">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-medium border border-slate-200">
                          {code}
                        </span>
                        {p.brand && <span className="text-slate-600">• {p.brand}</span>}
                        {p.unit && <span className="text-slate-500">• {p.unit}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-600 text-xs">
                      AED {Number(price).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-medium">Select &rarr;</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // RENDER: VIEW 1 - FULL-PAGE ADD / EDIT ORDER FORM (IMAGE 1)
  // -------------------------------------------------------------
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden flex flex-col font-sans text-xs w-full pb-10">
        {/* Top Header Bar with 👍 Add Order, + Customer, and Red X button */}
        <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-slate-500 fill-slate-100" />
            <span className="font-bold text-slate-800 text-[13px]">
              {orderToEdit ? 'Edit Order' : 'Add Order'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuickCustomerName('');
                setQuickCustomerContactPerson('');
                setQuickCustomerPhoneCode('+971');
                setQuickCustomerPhone('');
                setQuickCustomerPhoneTouched(false);
                setQuickCustomerEmail('');
                setQuickCustomerLocation('');
                setIsQuickCustomerCodeDropdownOpen(false);
                setIsQuickCustomerModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="w-6 h-6 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded flex items-center justify-center font-bold text-xs transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body: Exact Cezcon CRM Two-Column Grid */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 flex flex-col space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3.5 text-[11px]">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-3">
              {/* Customer Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1">
                    <select
                      value={customerName}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="">Select Customer</option>
                      {customerName && !customers?.some((c) => (c.customerName || c.companyName) === customerName) && (
                        <option value={customerName}>{customerName}</option>
                      )}
                      {customers?.map((c) => (
                        <option key={c.id} value={c.customerName || c.companyName}>
                          {c.customerName || c.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickCustomerName('');
                      setQuickCustomerContactPerson('');
                      setQuickCustomerPhoneCode('+971');
                      setQuickCustomerPhone('');
                      setQuickCustomerPhoneTouched(false);
                      setQuickCustomerEmail('');
                      setQuickCustomerLocation('');
                      setIsQuickCustomerCodeDropdownOpen(false);
                      setIsQuickCustomerModalOpen(true);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-0.5 transition-colors px-1"
                    title="Add New Customer"
                  >
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* Order Title */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Order Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={orderTitle}
                  onChange={(e) => setOrderTitle(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Source */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                  <span>Source</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1">
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Select Source">Select Source</option>
                      {customSources.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSourceName('');
                      setIsQuickAddSourceOpen(true);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-0.5 transition-colors px-1"
                    title="Add New Source"
                  >
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* Order Date & Time */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Order Date <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <CezconDateInput
                    value={orderDate}
                    onChange={(val) => setOrderDate(val)}
                  />
                  <CezconTimeInput
                    value={orderTime}
                    onChange={(val) => setOrderTime(val)}
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Amount</label>
                <input
                  type={isOrderFormActive ? 'text' : 'number'}
                  step="any"
                  readOnly={isOrderFormActive}
                  placeholder="0.00"
                  value={isOrderFormActive ? itemsTotalAmount.toFixed(2) : manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className={cn(
                    'flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium',
                    isOrderFormActive ? 'bg-slate-50 font-medium text-slate-700' : 'bg-white'
                  )}
                />
              </div>

              {/* VAT Type */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">VAT Type</label>
                <select
                  value={vatType}
                  onChange={(e) => setVatType(e.target.value as any)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="With VAT">With VAT</option>
                  <option value="Without VAT">Without VAT</option>
                  <option value="Zero VAT">Zero VAT</option>
                </select>
              </div>

              {/* Adjustment */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Adjustment</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Order Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Order Tags</label>
                <input
                  type="text"
                  placeholder="Keywords attached to the order"
                  value={orderTags}
                  onChange={(e) => setOrderTags(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Business Opportunity */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Business Opportunity
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1">
                    <select
                      value={businessOpportunity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBusinessOpportunity(val);
                        if (val !== 'Select Business Opportunity') {
                          handleOpportunitySelect(val.split(' - ')[0] || val);
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Select Business Opportunity">Select Business Opportunity</option>
                      {salesOpportunities?.map((opp) => (
                        <option key={opp.id} value={`${opp.opportunityCode} - ${opp.title}`}>
                          {opp.opportunityCode} - {opp.title} ({opp.customer})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewBizOppTitle('');
                      setNewBizOppCustomer(customerName || '');
                      setNewBizOppAmount('');
                      setIsQuickAddBizOppOpen(true);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-0.5 transition-colors px-1"
                    title="Add New Business Opportunity"
                  >
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* LPO Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">LPO Number</label>
                <input
                  type="text"
                  value={lpoNumber}
                  onChange={(e) => setLpoNumber(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Location</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={() => setLocation('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Select Type">Select Type</option>
                  <option value="Fit Out">Fit Out</option>
                  <option value="Supply">Supply</option>
                  <option value="Installation">Installation</option>
                  <option value="Supply And Installation">Supply And Installation</option>
                  <option value="Spare Part Sales">Spare Part Sales</option>
                  <option value="Projects">Projects</option>
                  <option value="Service - Under Warranty">Service - Under Warranty</option>
                  <option value="Service - On Call">Service - On Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Delivery Method */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Delivery Method
                </label>
                <input
                  type="text"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Contact Person */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-3">
              {/* Order Owner */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Order Owner <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1 relative">
                    <select
                      value={orderOwner}
                      onChange={(e) => setOrderOwner(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {users
                        ?.filter((u) => u.status === 'Active' || u.status === undefined)
                        .map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name}
                          </option>
                        ))}
                      {customOwners
                        ?.filter((o) => !users?.some((u) => u.name === o))
                        .map((owner) => (
                          <option key={owner} value={owner}>
                            {owner}
                          </option>
                        ))}
                      {orderOwner &&
                        !users?.some((u) => u.name === orderOwner) &&
                        !customOwners?.includes(orderOwner) && (
                          <option value={orderOwner}>{orderOwner}</option>
                        )}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOwnerName('');
                      setIsQuickAddOwnerOpen(true);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-0.5 transition-colors px-1"
                    title="Add New Owner"
                  >
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* Point of Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Point of Contact
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1">
                    <select
                      value={pointOfContact}
                      onChange={(e) => {
                        setPointOfContact(e.target.value);
                        setContactPerson(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {pointOfContact && !customContacts.includes(pointOfContact) && (
                        <option value={pointOfContact}>{pointOfContact}</option>
                      )}
                      {customContacts.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewContactName('');
                      setNewContactPhone('');
                      setIsQuickAddContactOpen(true);
                    }}
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-0.5 transition-colors px-1"
                    title="Add New Point of Contact"
                  >
                    <span>+ New</span>
                  </button>
                </div>
              </div>

              {/* Source Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Source Name
                </label>
                <input
                  type="text"
                  placeholder="Name of the source. Eg Google, LinkedIn"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Order Number & Opportunity Number (Compound Dual Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Order Number */}
                <div className="flex items-center gap-2">
                  <label className="w-24 font-semibold text-slate-700 shrink-0">
                    Order Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      required
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 pr-7 text-xs text-slate-800 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setOrderNumber(`CTSO#${Math.floor(3900 + Math.random() * 100)}`)}
                      className="absolute right-1 text-cyan-600 hover:text-cyan-700 p-0.5 cursor-pointer"
                      title="Regenerate Order Number"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Commercial Offer Number */}
                <div className="flex items-center gap-2">
                  <label className="w-28 font-semibold text-slate-700 shrink-0 text-xs">
                    Commercial Offer Number
                  </label>
                  <div className="flex-1 flex items-center gap-1.5">
                    <select
                      value={commercialOfferNumber}
                      onChange={(e) => handleCommercialOfferSelect(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="">None (Direct Order)</option>
                      {commercialOfferNumber &&
                        !liveQuotations.some((q: any) => q.quotationNumber === commercialOfferNumber || q.id === commercialOfferNumber) && (
                          <option value={commercialOfferNumber}>{commercialOfferNumber}</option>
                        )}
                      {liveQuotations.map((q: any) => (
                        <option key={q.id || q.quotationNumber} value={q.quotationNumber || q.id}>
                          {q.quotationNumber} — {q.customer} {q.totalAmount ? `(AED ${Number(q.totalAmount).toLocaleString()})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        window.open('/sales?tab=quotations&action=create', '_blank');
                      }}
                      className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-0.5 transition-colors px-1 whitespace-nowrap"
                      title="Create New Commercial Offer"
                    >
                      <span>+ New</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lead Number */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Lead Number
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={leadNumber}
                    onChange={(e) => handleLeadSelect(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="">Select Lead</option>
                    {leadNumber && !leads?.some((l) => l.leadNumber === leadNumber) && (
                      <option value={leadNumber}>{leadNumber}</option>
                    )}
                    {leads?.map((l) => {
                      const displayTitle = l.contactDetails?.company || l.contactDetails?.name || (l as any).companyName || 'Lead';
                      return (
                        <option key={l.id} value={l.leadNumber || l.id}>
                          {l.leadNumber} - {displayTitle}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Discount */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Discount</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={manualDiscountAmount}
                  onChange={(e) => {
                    setManualDiscountAmount(e.target.value);
                    setDiscountPercent(0);
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* VAT Row: 5 % + Calculated VAT */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">VAT</label>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                    <input
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                    <span className="px-2 text-xs text-slate-500 font-semibold bg-slate-100 border-l border-slate-300 py-1.5">
                      %
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={calculatedVatAmount.toFixed(2)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Total Amount</label>
                <input
                  type="text"
                  readOnly
                  value={grandTotalAmount.toFixed(2)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-bold"
                />
              </div>

              {/* Campaign */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0 flex items-center gap-1">
                  <span>Campaign</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Select Campaign">Select Campaign</option>
                  <option value="Summer Promo 2026">Summer Promo 2026</option>
                  <option value="HVAC Expo 2026">HVAC Expo 2026</option>
                  <option value="Maintenance Drive">Maintenance Drive</option>
                  <option value="Google Ads Campaign">Google Ads Campaign</option>
                </select>
              </div>

              {/* Delivery Date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Delivery Date
                </label>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* LPO Date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">LPO Date</label>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={lpoDate}
                    onChange={(e) => setLpoDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Product Details / Comments */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0 pt-1">
                  Product Details
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter product details (e.g. Item: Carrier 4.0 Ton Ducted Split AC, Code: CARR-40-DUCT, Quantity: 5, Brand: Carrier, Unit Price: 4500)"
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              {/* Order Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">
                  Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Reference */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* MIDDLE: ORDER FORM TOGGLE & ITEMS TABLE                       */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOrderFormActive(!isOrderFormActive)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${isOrderFormActive ? 'bg-[#5CB85C]' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${isOrderFormActive ? 'left-5' : 'left-1'
                    }`}
                />
              </button>
              <span className="font-semibold text-[#337ab7] text-xs">Order Form</span>
            </div>

            {/* When Order Form is ON: Show Items Table + Terms & Conditions + Totals */}
            {isOrderFormActive && (
              <>
                <div className="overflow-x-auto w-full border border-slate-200 rounded">
                  <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-[#f8f9fa] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                        <th className="p-2 border-r border-slate-200 min-w-[280px]">
                          <div className="flex items-center justify-between">
                            <span>Description</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = lineItems.map((item) => ({
                                  ...item,
                                  showAdditional: !item.showAdditional,
                                }));
                                setLineItems(updated);
                              }}
                              className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded font-normal transition"
                            >
                              + Additional Description
                            </button>
                          </div>
                        </th>
                        <th className="p-2 border-r border-slate-200 w-24">Code</th>
                        <th className="p-2 border-r border-slate-200 w-20">Unit</th>
                        <th className="p-2 border-r border-slate-200 w-24">Brand</th>
                        <th className="p-2 border-r border-slate-200 w-16 text-center">QTY</th>
                        <th className="p-2 border-r border-slate-200 w-24 text-right">Price</th>
                        <th className="p-2 border-r border-slate-200 w-28 text-right">Price Total</th>
                        <th className="p-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {lineItems.map((item, idx) => (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-slate-50/50">
                            {/* Description */}
                            <td className="p-2 border-r border-slate-200">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={item.description}
                                  onFocus={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDropdownTarget({
                                      rowIndex: idx,
                                      top: rect.bottom + 4,
                                      left: rect.left,
                                      width: Math.max(rect.width, 380),
                                    });
                                    setDropdownSearchTerm(item.description || '');
                                  }}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleItemChange(idx, 'description', val);
                                    setDropdownSearchTerm(val);
                                    if (!dropdownTarget || dropdownTarget.rowIndex !== idx) {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setDropdownTarget({
                                        rowIndex: idx,
                                        top: rect.bottom + 4,
                                        left: rect.left,
                                        width: Math.max(rect.width, 380),
                                      });
                                    }
                                  }}
                                  placeholder="Type or click to pick E-Commerce product..."
                                  className="ecommerce-description-input w-full bg-white border border-blue-400 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              {item.showAdditional && (
                                <textarea
                                  rows={2}
                                  value={item.additionalDescription || ''}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'additionalDescription', e.target.value)
                                  }
                                  placeholder="Additional details, serials, or specifications..."
                                  className="w-full mt-1.5 bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-700 focus:outline-none resize-y"
                                />
                              )}
                            </td>

                            {/* Code */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                value={item.code}
                                onChange={(e) => handleItemChange(idx, 'code', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                              />
                            </td>

                            {/* Unit */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                              />
                            </td>

                            {/* Brand */}
                            <td className="p-2 border-r border-slate-200">
                              <input
                                type="text"
                                value={item.brand}
                                onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                              />
                            </td>

                            {/* QTY */}
                            <td className="p-2 border-r border-slate-200 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-center text-slate-800 focus:outline-none"
                              />
                            </td>

                            {/* Price */}
                            <td className="p-2 border-r border-slate-200 text-right">
                              <input
                                type="number"
                                step="any"
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-right text-slate-800 focus:outline-none"
                              />
                            </td>

                            {/* Price Total */}
                            <td className="p-2 border-r border-slate-200 text-right">
                              <input
                                type="text"
                                readOnly
                                value={item.total.toFixed(2)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-right text-slate-700 font-medium"
                              />
                            </td>

                            {/* Delete */}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="w-5 h-5 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded flex items-center justify-center text-[10px] font-bold transition cursor-pointer mx-auto"
                                title="Delete Item"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Add More Button */}
                  <div className="p-2 bg-white flex justify-end border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 px-3 py-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add More</span>
                    </button>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* BOTTOM: TERMS & CONDITIONS + RICH TEXT + TOTALS BREAKDOWN     */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3 text-[11px]">
                  {/* Left Column (Col 7): Terms & Conditions with CKEditor Layout (Exact Screenshot 2) */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm shrink-0">
                        <Info className="w-4 h-4 text-[#2563EB]" />
                        <span>Terms &amp; Conditions</span>
                      </span>

                      <div className="flex-1 min-w-[200px] max-w-[340px]">
                        <select
                          value={selectedTermsPreset}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedTermsPreset(val);
                            if (val && termsTemplates[val]) {
                              const content = termsTemplates[val];
                              setTermsContent((prev) => {
                                if (!prev || !prev.trim()) {
                                  return content;
                                }
                                return `${prev.trim()}\n\n${content}`;
                              });
                              showToast(`Added "${val}" to Terms & Conditions`);
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
                        >
                          <option value="">Select &amp; Add Terms &amp; Conditions...</option>
                          {Object.keys(termsTemplates).map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleLoadTerms}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" /> Load
                      </button>

                      <button
                        type="button"
                        onClick={handleClearTerms}
                        title="Clear editor text"
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedTermsPreset) {
                            showToast('Please select a Terms & Conditions template to delete');
                            return;
                          }
                          handleDeleteTerms(selectedTermsPreset);
                        }}
                        title="Delete selected template"
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewTermsTitle('');
                          setNewTermsContent('');
                          setIsAddTermsModalOpen(true);
                        }}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> + New
                      </button>
                    </div>

                    {/* CKEditor-styled Rich Text Box */}
                    <div className="border border-slate-300 rounded overflow-hidden bg-white shadow-xs">
                      {/* Editor Toolbar */}
                      <div className="bg-[#F1F5F9] border-b border-slate-300 p-1 flex flex-wrap items-center gap-1 text-slate-700 select-none">
                        <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                          <button type="button" title="Cut" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <Scissors className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Copy" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Paste" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                          <button type="button" title="Bold" className="p-1 hover:bg-slate-200 rounded font-bold text-xs px-1.5 cursor-pointer">
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Italic" className="p-1 hover:bg-slate-200 rounded italic text-xs px-1.5 cursor-pointer">
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Strikethrough" className="p-1 hover:bg-slate-200 rounded text-xs px-1.5 cursor-pointer">
                            <Strikethrough className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Underline" className="p-1 hover:bg-slate-200 rounded text-xs px-1.5 cursor-pointer">
                            <Underline className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                          <button type="button" title="Bullet List" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Numbered List" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-0.5 border-r border-slate-300 pr-1">
                          <button type="button" title="Insert Link" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Insert Image" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Insert Table" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <TableIcon className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" title="Special Character" className="p-1 hover:bg-slate-200 rounded text-slate-600 text-xs font-bold px-1 cursor-pointer">
                            Ω
                          </button>
                          <button type="button" title="Maximize" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <select className="bg-white border border-slate-300 rounded text-[10px] px-1 py-0.5 text-slate-700 cursor-pointer">
                            <option>Styles</option>
                            <option>Normal</option>
                            <option>Heading 1</option>
                            <option>Heading 2</option>
                          </select>
                          <select className="bg-white border border-slate-300 rounded text-[10px] px-1 py-0.5 text-slate-700 cursor-pointer">
                            <option>Format</option>
                            <option>Paragraph</option>
                            <option>Blockquote</option>
                          </select>
                          <button type="button" title="Help" className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Editable Content Area */}
                      <textarea
                        rows={7}
                        placeholder="Enter terms & conditions text here..."
                        value={termsContent}
                        onChange={(e) => setTermsContent(e.target.value)}
                        className="w-full p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-mono bg-white resize-y leading-relaxed"
                      />

                      {/* Status Footer */}
                      <div className="bg-[#E2E8F0] border-t border-slate-300 px-2.5 py-0.5 flex items-center justify-between text-[10px] text-slate-600 select-none">
                        <span>body p</span>
                        <span className="cursor-se-resize text-slate-400">◢</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Col 5): Financial Totals Breakdown Matching Image 1 */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="bg-slate-50/60 border border-slate-200 rounded p-4 space-y-2 text-xs">
                      {/* Amount */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">Amount</span>
                        <input
                          type="text"
                          readOnly
                          value={itemsTotalAmount.toFixed(2)}
                          className="w-36 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-right text-slate-800 font-medium"
                        />
                      </div>

                      {/* Discount % */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">Discount %</span>
                        <div className="w-36 flex items-center border border-slate-300 rounded bg-white overflow-hidden">
                          <input
                            type="number"
                            step="any"
                            value={discountPercent}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setDiscountPercent(val);
                              setManualDiscountAmount(0);
                            }}
                            className="w-full px-2 py-1 text-right text-xs focus:outline-none"
                          />
                          <span className="px-2 text-slate-400 bg-slate-50 border-l border-slate-200 text-xs">
                            %
                          </span>
                        </div>
                      </div>

                      {/* Discount Amount */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">Discount</span>
                        <input
                          type="number"
                          step="any"
                          value={manualDiscountAmount || calculatedDiscount}
                          onChange={(e) => {
                            setManualDiscountAmount(Number(e.target.value) || 0);
                            setDiscountPercent(0);
                          }}
                          className="w-36 bg-white border border-slate-300 rounded px-2.5 py-1 text-right text-slate-800 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Amount After Discount */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">Amount After Discount</span>
                        <input
                          type="text"
                          readOnly
                          value={amountAfterDiscount.toFixed(2)}
                          className="w-36 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-right text-slate-800 font-medium"
                        />
                      </div>

                      {/* VAT(%) */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">VAT(%)</span>
                        <input
                          type="number"
                          value={vatRate}
                          onChange={(e) => setVatRate(Number(e.target.value) || 0)}
                          className="w-36 bg-white border border-slate-300 rounded px-2.5 py-1 text-right text-slate-800 text-xs focus:outline-none"
                        />
                      </div>

                      {/* VAT Amount */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">VAT Amount</span>
                        <input
                          type="text"
                          readOnly
                          value={calculatedVatAmount.toFixed(2)}
                          className="w-36 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-right text-slate-800 font-medium"
                        />
                      </div>

                      {/* Sub Total */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">Sub Total</span>
                        <input
                          type="text"
                          readOnly
                          value={subTotal.toFixed(2)}
                          className="w-36 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-right text-slate-800 font-medium"
                        />
                      </div>

                      {/* Adjustment */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-slate-600">Adjustment</span>
                        <input
                          type="number"
                          step="any"
                          value={adjustment}
                          onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
                          className="w-36 bg-white border border-slate-300 rounded px-2.5 py-1 text-right text-slate-800 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-800">Total Amount</span>
                        <input
                          type="text"
                          readOnly
                          value={grandTotalAmount.toFixed(2)}
                          className="w-36 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right text-slate-900 font-bold"
                        />
                      </div>
                    </div>

                    {/* Action Buttons: [ Submit ] & [ ⬅ Back ] directly under Total Amount card */}
                    <div className="flex items-center justify-end gap-2 pt-3">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-bold shadow-xs cursor-pointer transition uppercase tracking-wider"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-2xs transition flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* When Order Form is OFF: show Submit & Back buttons below toggle */}
            {!isOrderFormActive && (
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-bold shadow-xs cursor-pointer transition uppercase tracking-wider"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-2xs transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            )}
          </div>
        </form>

        {/* ADD NEW TERMS & CONDITIONS MODAL */}
        {isAddTermsModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add New Terms &amp; Conditions</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTermsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewTerms} className="p-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Template Title / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Government Project Payment &amp; Supply Terms"
                    value={newTermsTitle}
                    onChange={(e) => setNewTermsTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Terms &amp; Conditions Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="1. Payment Terms: ...&#10;2. Delivery: ...&#10;3. Warranty: ..."
                    value={newTermsContent}
                    onChange={(e) => setNewTermsContent(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddTermsModalOpen(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded cursor-pointer transition-colors shadow-2xs"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddAnotherTerm}
                      className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Term
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Save &amp; Apply
                    </button>
                  </div>
                </div>

                {/* Saved Templates List with Delete Option */}
                {Object.keys(termsTemplates).length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                      <span>Saved Templates ({Object.keys(termsTemplates).length})</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {Object.keys(termsTemplates).map((tplName) => (
                        <div
                          key={tplName}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-100"
                        >
                          <span className="font-medium truncate max-w-[320px]">{tplName}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTerms(tplName)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            title="Delete template"
                          >
                            <Trash2 className="w-3 h-3" />
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

        {/* Floating Toast Notification */}
        {orderToast && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{orderToast}</span>
          </div>
        )}

        {/* Quick Customer Modal with Comprehensive Global Phone Country Codes */}
        {isQuickCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">Add Quick Customer</h3>
                    <p className="text-[10px] text-slate-500">Save new customer directly to CRM database</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickCustomerModalOpen(false);
                    setQuickCustomerPhoneTouched(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickCustomer} className="space-y-3.5 text-xs">
                {/* Customer Name */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer / Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Al Futtaim Engineering / Emirates Group"
                    value={quickCustomerName}
                    onChange={(e) => setQuickCustomerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-xs text-slate-800"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rashid Mansoor"
                    value={quickCustomerContactPerson}
                    onChange={(e) => setQuickCustomerContactPerson(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-xs text-slate-800"
                  />
                </div>

                {/* International Phone Number with Dropdown */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / Mobile Number (All Countries Supported)
                  </label>
                  <div
                    className={cn(
                      'flex rounded border overflow-visible bg-white relative transition-colors items-center',
                      quickCustomerPhoneTouched && quickCustomerPhone.trim() && !phoneValidation.isValid
                        ? 'border-red-400 ring-1 ring-red-400/20 bg-red-50/10 focus-within:border-red-500'
                        : quickCustomerPhoneTouched && quickCustomerPhone.trim() && phoneValidation.isValid
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10 focus-within:border-emerald-600'
                        : 'border-slate-300 focus-within:border-blue-500'
                    )}
                  >
                    {/* Country Code Picker Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickCustomerCodeDropdownOpen(!isQuickCustomerCodeDropdownOpen);
                        setQuickCustomerCodeSearch('');
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border-r border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer shrink-0 transition-colors"
                      title="Select Country Calling Code"
                    >
                      <span className="text-sm">{selectedCountryObj.flag}</span>
                      <span>{selectedCountryObj.code}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      placeholder={selectedCountryObj.placeholder || '50 123 4567'}
                      value={quickCustomerPhone}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^0-9\s\-()+]/g, '');
                        setQuickCustomerPhone(cleanVal);
                        setQuickCustomerPhoneTouched(true);
                      }}
                      onBlur={() => setQuickCustomerPhoneTouched(true)}
                      className="flex-1 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none bg-transparent"
                    />

                    {/* Live Validation Status Indicator Icon */}
                    {quickCustomerPhoneTouched && quickCustomerPhone.trim() && (
                      <div className="flex items-center pr-2.5 pointer-events-none">
                        {phoneValidation.isValid ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}

                    {/* Country Code Searchable Dropdown Menu */}
                    {isQuickCustomerCodeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-50"
                          onClick={() => setIsQuickCustomerCodeDropdownOpen(false)}
                        />
                        <div className="absolute left-0 top-full mt-1 w-72 max-h-56 bg-white border border-slate-300 rounded-md shadow-xl z-50 p-2 overflow-hidden flex flex-col animate-in fade-in duration-100">
                          <div className="relative mb-1.5 shrink-0">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search country or code (e.g. UAE, Saudi, +91)..."
                              value={quickCustomerCodeSearch}
                              onChange={(e) => setQuickCustomerCodeSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 space-y-0.5">
                            {filteredCountryCodes.map((c) => (
                              <button
                                key={`${c.code}-${c.country}`}
                                type="button"
                                onClick={() => {
                                  setQuickCustomerPhoneCode(c.code);
                                  setIsQuickCustomerCodeDropdownOpen(false);
                                  setQuickCustomerCodeSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-xs cursor-pointer hover:bg-blue-50 transition-colors ${
                                  quickCustomerPhoneCode === c.code ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-sm">{c.flag}</span>
                                  <span className="truncate">{c.country}</span>
                                </div>
                                <span className="font-mono text-[11px] text-slate-500 ml-2 shrink-0">{c.code}</span>
                              </button>
                            ))}
                            {filteredCountryCodes.length === 0 && (
                              <div className="p-3 text-center text-slate-400 text-xs">
                                No matching country found
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Inline Feedback Helper / Error Message */}
                  {quickCustomerPhoneTouched && quickCustomerPhone.trim() && !phoneValidation.isValid && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium mt-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneValidation.message}</span>
                    </p>
                  )}
                  {quickCustomerPhoneTouched && quickCustomerPhone.trim() && phoneValidation.isValid && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Valid {selectedCountryObj.country} {phoneValidation.type ? `(${phoneValidation.type})` : ''} number
                      </span>
                    </p>
                  )}
                  {(!quickCustomerPhoneTouched || !quickCustomerPhone.trim()) && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Format example: {selectedCountryObj.placeholder} ({selectedCountryObj.country})
                    </p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="contact@customer.com"
                    value={quickCustomerEmail}
                    onChange={(e) => setQuickCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-xs text-slate-800"
                  />
                </div>

                {/* Location / Address (Optional) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location / City (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai, Abu Dhabi, Riyadh"
                    value={quickCustomerLocation}
                    onChange={(e) => setQuickCustomerLocation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-xs text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickCustomerModalOpen(false);
                      setQuickCustomerPhoneTouched(false);
                    }}
                    className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isQuickSavingCustomer}
                    className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isQuickSavingCustomer ? 'Saving...' : 'Add Customer'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Owner Modal */}
        {isQuickAddOwnerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Add Order Owner</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOwnerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddOwner} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Owner / Executive Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mansoor"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOwnerOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Source Modal */}
        {isQuickAddSourceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Add New Source</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddSourceOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddSource} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Source Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trade Exhibition, Direct Client"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddSourceOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Business Opportunity Modal */}
        {isQuickAddBizOppOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Add Business Opportunity</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddBizOppOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddBizOpp} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Opportunity Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supply of VRV Units & Ducting"
                    value={newBizOppTitle}
                    onChange={(e) => setNewBizOppTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Six Sigma Constructions"
                    value={newBizOppCustomer}
                    onChange={(e) => setNewBizOppCustomer(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Amount (AED)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 25000"
                    value={newBizOppAmount}
                    onChange={(e) => setNewBizOppAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddBizOppOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create &amp; Select</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Point of Contact Modal */}
        {isQuickAddContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Add Point of Contact</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddContactOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddContact} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Tariq Mansoor"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +971 50 123 4567"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddContactOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating fixed portal dropdown for E-Commerce Product Selection */}
        {renderProductDropdown()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: VIEW 2 - ORDERS TABLE LIST VIEW (IMAGE 2)
  // -------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col font-sans w-full">
      {/* 1. TOP SUB-TABS BOX BAR FOR ORDERS */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-0 flex items-center justify-between shadow-xs sticky top-0 z-30 overflow-x-auto">
        <div className="flex items-stretch min-w-max border-l border-slate-200">
          {[
            { id: 'all', label: 'All' },
            { id: 'fitout', label: 'Fit Out' },
            { id: 'supply', label: 'Supply' },
            { id: 'installation', label: 'Installation' },
            { id: 'supply-install', label: 'Supply And Installation' },
            { id: 'spare-parts', label: 'Spare Part Sales' },
            { id: 'projects', label: 'Projects' },
            { id: 'warranty', label: 'Service – Under Warranty' },
            { id: 'oncall', label: 'Service – On Call' },
            { id: 'other', label: 'Other' },
          ].map((tab) => {
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSubTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 text-xs font-semibold border-r border-slate-200 transition-colors whitespace-nowrap cursor-pointer ${isActive
                  ? 'border-t-2 border-t-[#DC2626] bg-white text-slate-800'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className={`px-3 py-2 text-xs font-semibold border-r border-slate-200 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${subTab === 'overview'
              ? 'border-t-2 border-t-[#DC2626] bg-white text-slate-800'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <span>📊 Overview</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-3 py-1.5 bg-[#0B1E2E] hover:bg-[#1E293B] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0 ml-4"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Order</span>
        </button>
      </div>

      {/* 2. FILTER CONTROLS BOX SECTION */}
      <div className="p-3 sm:p-4 bg-slate-50/50 space-y-4">
        <div className="bg-white border border-[#E2E8F0] rounded-sm p-4 shadow-xs space-y-3">
          {/* Row 1: 4 Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Order Date</label>
              <div className="flex items-center border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <span className="text-xs truncate flex-1">All Month & Year</span>
                <RotateCw className="w-3.5 h-3.5 text-blue-500 cursor-pointer ml-1" />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Order Owner</label>
              <select
                value={orderFilterOwner}
                onChange={(e) => {
                  setOrderFilterOwner(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">All Owners</option>
                {users
                  ?.filter((u) => u.status === 'Active' || u.status === undefined)
                  .map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Business Opportunity</label>
              <select
                value={orderFilterOpp}
                onChange={(e) => {
                  setOrderFilterOpp(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">Select</option>
                {salesOpportunities?.map((opp) => (
                  <option key={opp.id} value={opp.title}>
                    {opp.opportunityCode} - {opp.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Campaign</label>
              <select
                value={orderFilterCampaign}
                onChange={(e) => {
                  setOrderFilterCampaign(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">Select Campaign</option>
                <option value="Summer Promo 2026">Summer Promo 2026</option>
                <option value="HVAC Expo 2026">HVAC Expo 2026</option>
              </select>
            </div>
          </div>

          {/* Row 2: 4 Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Customer</label>
              <select
                value={orderFilterCustomer}
                onChange={(e) => {
                  setOrderFilterCustomer(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">Select Customer</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.customerName || c.companyName}>
                    {c.customerName || c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Tags</label>
              <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700">
                <option value="All">Select tags</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Order Status</label>
              <select
                value={orderFilterStatus}
                onChange={(e) => {
                  setOrderFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">All</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Order Type</label>
              <select
                value={orderFilterType}
                onChange={(e) => {
                  setOrderFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">All</option>
                <option value="Supply">Supply</option>
                <option value="Installation">Installation</option>
                <option value="Supply And Installation">Supply And Installation</option>
                <option value="Fit Out">Fit Out</option>
              </select>
            </div>
          </div>

          {/* Row 3: 1 Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Invoice Status</label>
              <select
                value={orderFilterInvoiceStatus}
                onChange={(e) => setOrderFilterInvoiceStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="All">All</option>
                <option value="Invoiced">Invoiced</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. MAIN ORDERS DATA TABLE SECTION */}
        <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden">
          {/* Header with Title and + ORDER Button (Opens Image 1 Form!) */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-slate-500" />
              <span>Order</span>
            </h2>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold cursor-pointer shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ORDER</span>
            </button>
          </div>

          {/* Table Controls (Rows and Search) */}
          <div className="p-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
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

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search Order"
                value={orderSearch}
                onChange={(e) => {
                  setOrderSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3 pr-8 py-1 border border-slate-300 rounded bg-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Table View (Desktop) */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold select-none">
                  <th className="p-2.5 w-12 text-center text-slate-600">SL.No</th>
                  <th className="p-2.5 w-16 text-slate-600">Owner</th>
                  <th className="p-2.5 w-32 text-slate-600">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                      <span>Order Date</span>
                      <ChevronDown className="w-3 h-3 text-blue-600" />
                    </div>
                  </th>
                  <th className="p-2.5 min-w-[220px] text-slate-600">Order Details</th>
                  <th className="p-2.5 min-w-[240px] text-slate-600">Customer</th>
                  <th className="p-2.5 w-24 text-slate-600">Order Status</th>
                  <th className="p-2.5 w-24 text-right text-slate-600">Amount</th>
                  <th className="p-2.5 w-20 text-right text-slate-600">VAT</th>
                  <th className="p-2.5 w-24 text-right text-slate-600">Total</th>
                  <th className="p-2.5 w-24 text-right text-slate-600">Receivable</th>
                  <th className="p-2.5 w-20 text-center text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400">
                      No orders found. Click "+ ORDER" above to create an order.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o, idx) => (
                    <tr key={o.id || idx} className="hover:bg-[#F0FDF4]/40 transition-colors">
                      {/* SL.No */}
                      <td className="p-2.5 text-center text-slate-600 font-medium">
                        {o.slNo || (currentPage - 1) * rowsPerPage + idx + 1}
                      </td>

                      {/* Owner */}
                      <td className="p-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-2xs">
                          {(o.owner || 'N')[0]}
                        </div>
                      </td>

                      {/* Order Date */}
                      <td className="p-2.5 whitespace-nowrap text-slate-800 font-medium">
                        {o.orderDate}
                      </td>

                      {/* Order Details */}
                      <td className="p-2.5">
                        <div className="space-y-0.5">
                          <div className="text-[#2563EB] font-bold text-xs flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForView(o)}
                              className="hover:underline cursor-pointer"
                              title="Click to view order details"
                            >
                              {o.orderNumber}
                            </button>
                            {o.opportunityRef && (
                              <>
                                <span className="text-slate-400">/</span>
                                <span className="text-slate-600 font-medium text-[11px]">
                                  {o.opportunityRef}
                                </span>
                              </>
                            )}
                            {o.leadNumber && (
                              <span className="text-slate-500 font-medium text-[11px]">
                                ({o.leadNumber})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-800 uppercase text-[11px]">
                              {o.subject}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-red-500 fill-red-100 shrink-0" />
                            <span className="text-[#2563EB] font-bold text-xs hover:underline cursor-pointer">
                              {o.customer}
                            </span>
                          </div>
                          {o.contactPerson && (
                            <div className="text-[11px] text-slate-600 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{o.contactPerson}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Order Status */}
                      <td className="p-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            o.status === 'Completed' || o.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'Confirmed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : o.status === 'Cancelled' || o.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {o.status || 'In Progress'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                        {Number(o.amount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* VAT */}
                      <td className="p-2.5 text-right font-medium text-slate-600 whitespace-nowrap">
                        {Number(o.vatAmount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Total */}
                      <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        {Number(o.totalAmount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Receivable */}
                      <td className="p-2.5 text-right font-bold text-[#E11D48] whitespace-nowrap">
                        {Number(o.receivable || o.totalAmount || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-2.5 text-center relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setActionDropdownTarget(
                                actionDropdownTarget?.order.id === o.id
                                  ? null
                                  : {
                                      order: o,
                                      top: rect.bottom + 4,
                                      right: Math.max(16, window.innerWidth - rect.right),
                                    }
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="Actions"
                          >
                            <Eye className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Entries count and Pagination */}
          <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {filteredOrders.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * rowsPerPage, filteredOrders.length)} of{' '}
              {filteredOrders.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs"
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${currentPage === pageNum
                      ? 'bg-[#00838F] text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating fixed portal dropdown for E-Commerce Product Selection */}
      {renderProductDropdown()}

      {/* Floating Fixed Portal for Order Actions (Prevents table scrollbar clipping) */}
      {actionDropdownTarget && (
        <>
          <div
            className="fixed inset-0 z-[99998] bg-transparent cursor-default"
            onClick={() => setActionDropdownTarget(null)}
          />
          <div
            style={{
              position: 'fixed',
              top: `${actionDropdownTarget.top}px`,
              right: `${actionDropdownTarget.right}px`,
              zIndex: 99999,
            }}
            className="w-48 bg-white border border-slate-200 rounded-lg shadow-2xl py-1 text-left text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
          >
            {/* View Order Option */}
            <button
              type="button"
              onClick={() => {
                const targetOrder = actionDropdownTarget.order;
                setActionDropdownTarget(null);
                setSelectedOrderForView(targetOrder);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-600 shrink-0" />
              <span>View Order</span>
            </button>

            {/* Sales Manager Approve Order Action (Restricted strictly to Sales Managers & Executive Management) */}
            {isSalesManagerOrAdmin && actionDropdownTarget.order.status !== 'Approved' && actionDropdownTarget.order.status !== 'Completed' && (
              <button
                type="button"
                onClick={() => {
                  const targetOrder = actionDropdownTarget.order;
                  setActionDropdownTarget(null);
                  updateSalesOrder(targetOrder.id, { status: 'Approved' });
                  showToast(`Order ${targetOrder.orderNumber} Approved by Sales Management! Handed off to Operations.`);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-emerald-50 text-emerald-700 font-semibold cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Approve Order</span>
              </button>
            )}

            {/* Sales Manager Reject Order Action (Restricted strictly to Sales Managers & Executive Management) */}
            {isSalesManagerOrAdmin && actionDropdownTarget.order.status !== 'Cancelled' && actionDropdownTarget.order.status !== 'Rejected' && (
              <button
                type="button"
                onClick={() => {
                  const targetOrder = actionDropdownTarget.order;
                  setActionDropdownTarget(null);
                  if (confirm(`Are you sure you want to reject Order ${targetOrder.orderNumber}?`)) {
                    updateSalesOrder(targetOrder.id, { status: 'Cancelled' });
                    showToast(`Order ${targetOrder.orderNumber} Rejected`);
                  }
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-700 font-medium cursor-pointer transition-colors"
              >
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Reject Order</span>
              </button>
            )}

            {/* When order is approved, only the Order Creator (Sales Rep who raised it) can generate Material Request (MSRF) */}
            {actionDropdownTarget.order.status === 'Approved' && isOrderCreator(actionDropdownTarget.order) && (
              <button
                type="button"
                onClick={() => {
                  const targetOrder = actionDropdownTarget.order;
                  setActionDropdownTarget(null);
                  window.location.href = `/purchase?tab=msrf&orderId=${encodeURIComponent(targetOrder.id)}`;
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-sky-50 text-sky-700 font-semibold cursor-pointer transition-colors"
              >
                <Package className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Generate MSRF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const targetOrder = actionDropdownTarget.order;
                setActionDropdownTarget(null);
                const isManager = typeof window !== 'undefined' && window.location.pathname.startsWith('/manager');
                window.location.href = isManager
                  ? `/manager/sales?tab=invoice&orderId=${encodeURIComponent(targetOrder.id)}`
                  : `/sales?tab=invoice&orderId=${encodeURIComponent(targetOrder.id)}`;
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-blue-600 font-medium cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Create Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetOrder = actionDropdownTarget.order;
                setActionDropdownTarget(null);
                handleOpenEdit(targetOrder);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors"
            >
              <Edit2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Edit Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetOrder = actionDropdownTarget.order;
                setActionDropdownTarget(null);
                if (confirm(`Are you sure you want to delete order ${targetOrder.orderNumber}?`)) {
                  deleteSalesOrder(targetOrder.id);
                }
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* VIEW ORDER DETAILS MODAL (with Inside Approve & Reject)        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeViewOrder && (
        <div
          className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto font-sans"
          onClick={() => setSelectedOrderForView(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0B1E2E] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm tracking-tight text-white">
                      Order Details: {activeViewOrder.orderNumber}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        activeViewOrder.status === 'Completed' || activeViewOrder.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : activeViewOrder.status === 'Confirmed'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                            : activeViewOrder.status === 'Cancelled' || activeViewOrder.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {activeViewOrder.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {activeViewOrder.subject || 'Sales Order Supply & Commissioning'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForView(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Approval State Action Banner */}
            <div className="border-b border-slate-200 shrink-0">
              {activeViewOrder.status === 'Pending' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold">Pending Sales Management Approval</span>
                      <p className="text-[11px] text-amber-800">
                        This order is waiting for Sales Leadership review. Once approved, the Order Creator ({activeViewOrder.owner || 'Tariq'}) can raise the Material Request (MSRF).
                      </p>
                    </div>
                  </div>

                  {isSalesManagerOrAdmin ? (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleApproveFromModal(activeViewOrder)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectFromModal(activeViewOrder)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Order</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium italic">
                      (Only Sales Managers / Admins can approve)
                    </span>
                  )}
                </div>
              )}

              {activeViewOrder.status === 'Approved' && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Order Approved by Sales Management</span>
                      <p className="text-[11px] text-emerald-800">
                        Commercial approval granted. Ready for Order Creator ({activeViewOrder.owner || 'Tariq'}) to raise Material Request (MSRF) for warehouse stock fulfillment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Only the user who created the sales order (Tariq) can generate the MSRF */}
                    {isOrderCreator(activeViewOrder) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForView(null);
                          window.location.href = `/purchase?tab=msrf&orderId=${encodeURIComponent(activeViewOrder.id)}`;
                        }}
                        className="px-3.5 py-1.5 bg-[#00838F] hover:bg-[#006978] text-white rounded text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Generate MSRF</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-800 font-medium bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded">
                        Awaiting Order Creator ({activeViewOrder.owner || 'Sales Rep'}) to raise MSRF
                      </span>
                    )}

                    {isSalesManagerOrAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRejectFromModal(activeViewOrder)}
                        className="px-2.5 py-1 text-rose-700 hover:bg-rose-100 rounded text-xs font-medium cursor-pointer transition"
                      >
                        Revoke / Reject
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(activeViewOrder.status === 'Cancelled' || activeViewOrder.status === 'Rejected') && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 flex items-center gap-2 text-xs text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold">Order Rejected / Cancelled</span>
                    <p className="text-[11px] text-rose-800">This order was cancelled and will not proceed to procurement.</p>
                  </div>
                </div>
              )}

              {activeViewOrder.status === 'Completed' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 flex items-center gap-2 text-xs text-blue-900">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">Order Completed</span>
                    <p className="text-[11px] text-blue-800">Fully delivered and completed.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
              {/* Top Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information Card */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-md p-3.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 font-bold text-slate-800 text-xs">
                    <Shield className="w-3.5 h-3.5 text-red-500" />
                    <span>Customer Information</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-medium">Customer:</span>
                    <span className="col-span-2 font-bold text-blue-600">{activeViewOrder.customer}</span>

                    <span className="text-slate-500 font-medium">Contact Person:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{activeViewOrder.contactPerson || 'N/A'}</span>

                    <span className="text-slate-500 font-medium">Phone / Mobile:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{activeViewOrder.phone || '+971 50 123 4567'}</span>

                    <span className="text-slate-500 font-medium">Location / Site:</span>
                    <span className="col-span-2 text-slate-700">{activeViewOrder.billingAddress || activeViewOrder.shippingAddress || (activeViewOrder as any).location || 'MUSSAFAH INDUSTRIAL AREA, ABU DHABI'}</span>
                  </div>
                </div>

                {/* Order Information Card */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-md p-3.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 font-bold text-slate-800 text-xs">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Order & Commercial Details</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-medium">Order Number:</span>
                    <span className="col-span-2 font-bold text-slate-900 font-mono">{activeViewOrder.orderNumber}</span>

                    <span className="text-slate-500 font-medium">Order Date:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{activeViewOrder.orderDate}</span>

                    <span className="text-slate-500 font-medium">LPO Number:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{activeViewOrder.poReference || (activeViewOrder as any).lpoNumber || '123456784'}</span>

                    <span className="text-slate-500 font-medium">Delivery Date:</span>
                    <span className="col-span-2 text-slate-700">{activeViewOrder.deliveryDueDate || (activeViewOrder as any).deliveryDate || '05-10-2026'}</span>

                    <span className="text-slate-500 font-medium">Order Owner:</span>
                    <span className="col-span-2 text-slate-800 font-semibold">{activeViewOrder.owner || 'Tariq'}</span>

                    <span className="text-slate-500 font-medium">Category / Type:</span>
                    <span className="col-span-2 text-slate-700">{activeViewOrder.category || 'Supply And Installation'}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>Scope of Work & Ordered Products</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Currency: UAE Dirhams (AED)
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5">Product / Item Description</th>
                      <th className="p-2.5 w-24">Code / SKU</th>
                      <th className="p-2.5 w-20 text-center">Qty</th>
                      <th className="p-2.5 w-24 text-right">Unit Price</th>
                      <th className="p-2.5 w-28 text-right">Total (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeViewOrder.items && activeViewOrder.items.length > 0 ? (
                      activeViewOrder.items.map((it, idx) => (
                        <tr key={it.id || idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-800">{it.productName || it.name || it.description}</div>
                            {it.description && it.description !== it.productName && (
                              <div className="text-[11px] text-slate-500">{it.description}</div>
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">{it.sku || it.itemCode || '-'}</td>
                          <td className="p-2.5 text-center font-semibold text-slate-800">{it.quantity} {it.unit || 'Pcs'}</td>
                          <td className="p-2.5 text-right text-slate-700">{Number(it.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{Number(it.totalAmount || (it.quantity * it.unitPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-center text-slate-500">1</td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-800">{activeViewOrder.subject || 'Supply of AC Units and Accessories'}</div>
                          <div className="text-[11px] text-slate-500">Direct Sales Order supply and fulfillment</div>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">AC-3920</td>
                        <td className="p-2.5 text-center font-semibold text-slate-800">1 Unit</td>
                        <td className="p-2.5 text-right text-slate-700">{Number(activeViewOrder.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{Number(activeViewOrder.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Row: Comments (Left) & Financial Summary (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Notes & Terms */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2">
                  <div className="font-semibold text-slate-800 text-xs">Payment Terms & Notes:</div>
                  <p className="text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {activeViewOrder.paymentTerms || activeViewOrder.notes || '1. Delivery: Within scheduled timeline.\n2. Payment: As per confirmed LPO terms.\n3. Standard 12-month manufacturer warranty.'}
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal / Amount:</span>
                    <span className="font-semibold text-slate-800">
                      AED {Number(activeViewOrder.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (5%):</span>
                    <span className="font-semibold text-slate-800">
                      AED {Number(activeViewOrder.vatAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-[#0B1E2E]">
                      AED {Number(activeViewOrder.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-xs font-bold text-[#E11D48]">
                    <span>Total Receivable:</span>
                    <span>
                      AED {Number(activeViewOrder.receivable || activeViewOrder.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500">
                Created by: <span className="font-semibold text-slate-700">{activeViewOrder.owner || 'Tariq'}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Approve Button inside Modal for Sales Manager */}
                {isSalesManagerOrAdmin && activeViewOrder.status !== 'Approved' && activeViewOrder.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => handleApproveFromModal(activeViewOrder)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Order</span>
                  </button>
                )}

                {/* Reject Button inside Modal for Sales Manager */}
                {isSalesManagerOrAdmin && activeViewOrder.status !== 'Cancelled' && activeViewOrder.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleRejectFromModal(activeViewOrder)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Order</span>
                  </button>
                )}

                {/* Generate MSRF Button: strictly for the Order Creator (Tariq) when Approved */}
                {activeViewOrder.status === 'Approved' && isOrderCreator(activeViewOrder) && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = activeViewOrder.id;
                      setSelectedOrderForView(null);
                      window.location.href = `/purchase?tab=msrf&orderId=${encodeURIComponent(id)}`;
                    }}
                    className="px-3.5 py-2 bg-[#00838F] hover:bg-[#006978] text-white rounded text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>Generate MSRF</span>
                  </button>
                )}

                {/* Create Invoice */}
                <button
                  type="button"
                  onClick={() => {
                    const id = activeViewOrder.id;
                    setSelectedOrderForView(null);
                    const isManager = typeof window !== 'undefined' && window.location.pathname.startsWith('/manager');
                    window.location.href = isManager
                      ? `/manager/sales?tab=invoice&orderId=${encodeURIComponent(id)}`
                      : `/sales?tab=invoice&orderId=${encodeURIComponent(id)}`;
                  }}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-blue-600 rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create Invoice</span>
                </button>

                {/* Edit Order */}
                <button
                  type="button"
                  onClick={() => {
                    const orderToEditTarget = activeViewOrder;
                    setSelectedOrderForView(null);
                    handleOpenEdit(orderToEditTarget);
                  }}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Order</span>
                </button>

                {/* Close Modal */}
                <button
                  type="button"
                  onClick={() => setSelectedOrderForView(null)}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {orderToast && (
        <div className="fixed bottom-5 right-5 z-[999999] bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-md shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{orderToast}</span>
        </div>
      )}
    </div>
  );
}
