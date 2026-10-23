'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ThumbsUp,
  ShoppingCart,
  Plus,
  X,
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
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { CrmSalesOrder } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';
import { CezconDateInput } from '@/components/ui/CezconDateInput';
import { CezconTimeInput } from '@/components/ui/CezconTimeInput';
import { getLiveProducts } from '@/services/productApiService';
import type { ProductSettingItem } from '@/types/settings';

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
    salesOpportunities,
    addOpportunity,
    users,
  } = useEnterpriseCrm();

  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;

  // View state: 'table' (Image 2) or 'create' / 'edit' (Image 1)
  const [viewMode, setViewMode] = useState<'table' | 'create' | 'edit'>('table');
  const [orderToEdit, setOrderToEdit] = useState<CrmSalesOrder | null>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<CrmSalesOrder | null>(null);
  const [actionDropdownOrderId, setActionDropdownOrderId] = useState<string | null>(null);

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
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');

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
  const [opportunityNumber, setOpportunityNumber] = useState(`CTEQ#${Math.floor(7200 + Math.random() * 100)}`);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [manualDiscountAmount, setManualDiscountAmount] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(5);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [campaign, setCampaign] = useState('Select Campaign');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [lpoDate, setLpoDate] = useState('');
  const [comments, setComments] = useState('');
  const [orderStatus, setOrderStatus] = useState('Completed');
  const [reference, setReference] = useState('');

  // Middle Line Items Section (Order Form)
  const [isOrderFormActive, setIsOrderFormActive] = useState(false);
  const [manualAmount, setManualAmount] = useState<number>(0);
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

  const effectiveAmount = isOrderFormActive ? itemsTotalAmount : (manualAmount || 0);

  const calculatedDiscount = useMemo(() => {
    if (discountPercent > 0) {
      return (effectiveAmount * discountPercent) / 100;
    }
    return manualDiscountAmount || 0;
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
    return subTotal + (Number(adjustment) || 0);
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
    setOpportunityNumber(`CTEQ#${Math.floor(7200 + Math.random() * 100)}`);
    setDiscountPercent(0);
    setManualDiscountAmount(0);
    setVatRate(5);
    setAdjustment(0);
    setCampaign('Select Campaign');
    setDeliveryDate('');
    setLpoDate('');
    setComments('');
    setOrderStatus('Completed');
    setReference('');
    setManualAmount(0);
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
    setOpportunityNumber(order.opportunityRef || `CTEQ#${Math.floor(7200 + Math.random() * 100)}`);
    setOrderDate(order.orderDate || '14-10-2026');
    setOrderOwner(order.owner || currentUser?.name || '');
    setContactPerson(order.contactPerson || '');
    setOrderStatus(order.status || 'Completed');
    setOrderType(order.category || 'Supply And Installation');
    setLpoNumber(order.poReference || '');
    setAdjustment(0);
    setVatRate(5);
    setVatType('With VAT');
    setManualAmount(order.amount || 0);
    setIsOrderFormActive(Boolean(order.items && order.items.length > 0));

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

    const orderData: Partial<CrmSalesOrder> = {
      orderNumber,
      opportunityRef: opportunityNumber,
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
      profit: effectiveAmount * 0.25,
      receivable: grandTotalAmount,
      poReference: lpoNumber,
      paymentTerms: termsContent,
      notes: comments,
    };

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
  const handleSaveQuickCustomer = () => {
    if (!quickCustomerName.trim()) {
      alert('Please enter a Customer Name');
      return;
    }
    setCustomerName(quickCustomerName.trim());
    setPointOfContact(quickCustomerName.trim());
    setIsQuickCustomerModalOpen(false);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
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
              onClick={() => setIsQuickCustomerModalOpen(true)}
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
                <div className="flex-1">
                  <select
                    value={customerName}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Customer</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.customerName || c.companyName}>
                        {c.customerName || c.companyName}
                      </option>
                    ))}
                  </select>
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
                  value={isOrderFormActive ? itemsTotalAmount.toFixed(2) : (manualAmount === 0 ? '0.00' : manualAmount)}
                  onChange={(e) => setManualAmount(Number(e.target.value) || 0)}
                  className={cn(
                    'flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500',
                    isOrderFormActive ? 'bg-slate-50 font-medium text-slate-700' : 'bg-white font-medium'
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
                  value={adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value) || 0)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
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
                          setOpportunityNumber(val.split(' - ')[0] || val);
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
                      className="absolute right-1 text-cyan-600 hover:text-cyan-700 p-0.5"
                      title="Regenerate Order Number"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Opportunity Number */}
                <div className="flex items-center gap-2">
                  <label className="w-28 font-semibold text-slate-700 shrink-0">
                    Opportunity Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      required
                      value={opportunityNumber}
                      onChange={(e) => setOpportunityNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 pr-7 text-xs text-slate-800 focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setOpportunityNumber(`CTEQ#${Math.floor(7200 + Math.random() * 100)}`)}
                      className="absolute right-1 text-cyan-600 hover:text-cyan-700 p-0.5"
                      title="Regenerate Opportunity Number"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Discount */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0">Discount</label>
                <input
                  type="number"
                  step="any"
                  value={manualDiscountAmount}
                  onChange={(e) => {
                    setManualDiscountAmount(Number(e.target.value) || 0);
                    setDiscountPercent(0);
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
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

              {/* Comments */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <label className="sm:w-36 font-semibold text-slate-700 shrink-0 pt-1">
                  Comments
                </label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
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
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Completed">Completed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
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

        {/* Quick Customer Modal */}
        {isQuickCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Add Quick Customer</h3>
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Futtaim Engineering"
                    value={quickCustomerName}
                    onChange={(e) => setQuickCustomerName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+971 50 123 4567"
                    value={quickCustomerPhone}
                    onChange={(e) => setQuickCustomerPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickCustomer}
                  className="px-4 py-1.5 bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded text-xs font-bold cursor-pointer transition shadow-2xs"
                >
                  Add
                </button>
              </div>
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
                  <th className="p-2.5 w-28 text-right text-slate-600">Profit</th>
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
                              onClick={() => handleOpenEdit(o)}
                              className="hover:underline cursor-pointer"
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
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${o.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.status === 'Confirmed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          {o.status || 'Confirmed'}
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

                      {/* Profit */}
                      <td className="p-2.5 text-right font-bold text-[#16A34A] whitespace-nowrap">
                        {Number(o.profit || (o.amount ? o.amount * 0.25 : 0)).toLocaleString(
                          'en-US',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
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
                            onClick={() =>
                              setActionDropdownOrderId(
                                actionDropdownOrderId === o.id ? null : o.id
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded text-[11px] font-medium shadow-xs cursor-pointer transition"
                            title="Actions"
                          >
                            <Eye className="w-3 h-3" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>

                          {actionDropdownOrderId === o.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-white border border-slate-200 rounded shadow-lg py-1 text-left text-xs animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setActionDropdownOrderId(null);
                                  const isManager = typeof window !== 'undefined' && window.location.pathname.startsWith('/manager');
                                  window.location.href = isManager
                                    ? `/manager/sales?tab=invoice&orderId=${encodeURIComponent(o.id)}`
                                    : `/sales?tab=invoice&orderId=${encodeURIComponent(o.id)}`;
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-blue-600 font-medium cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <span>Create Invoice</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionDropdownOrderId(null);
                                  handleOpenEdit(o);
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Order</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionDropdownOrderId(null);
                                  if (confirm(`Are you sure you want to delete order ${o.orderNumber}?`)) {
                                    deleteSalesOrder(o.id);
                                  }
                                }}
                                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
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
    </div>
  );
}
